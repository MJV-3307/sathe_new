import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopHeader from "./components/layout/TopHeader";
import AdminDashboard from "./components/admin/AdminDashboard";
import TimetableGenerator from "./components/scheduler/TimetableGenerator";
import FacultyDashboard from "./components/faculty/FacultyDashboard";
import FacultyStaffList from "./components/faculty/FacultyStaffList";
import RoomAvailability from "./components/rooms/RoomAvailability";
import LeaveAndSubstitutions from "./components/substitutions/LeaveAndSubstitutions";
import FeedbackAnalytics from "./components/feedback/FeedbackAnalytics";
import TimetableExport from "./components/export/TimetableExport";
import StudentDashboard from "./components/student/StudentDashboard";
import Modal from "./components/common/Modal";
import Login from "./components/auth/Login";

import { useAuth } from "./context/AuthContext";
import { facultyApi, roomsApi, subjectsApi, timetableApi, leaveApi } from "./api/resources";
import { ApiError } from "./api/client";
import {
  facultyFromApi,
  roomsFromApi,
  subjectsFromApi,
  timetableFromApi,
  byId,
} from "./utils/liveDataAdapter";

import {
  INITIAL_ROLES,
  INITIAL_FACULTY,
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  INITIAL_ROOMS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FEEDBACK_METRICS,
  INITIAL_SEMESTER_CONFIG
} from "./data/mockData";

export default function App() {
  const { user, loading, logout } = useAuth();
  const [demoMode, setDemoMode] = useState(false);

  const [currentRole, setCurrentRole] = useState("ADMIN");
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [selectedDepartment, setSelectedDepartment] = useState("Computer Science & IT");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Application Data States — seeded with mock data so the UI always has
  // something to render; overwritten with real API data once logged in.
  const [facultyList, setFacultyList] = useState(INITIAL_FACULTY);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [timetable, setTimetable] = useState(INITIAL_TIMETABLE);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [feedbackMetrics] = useState(INITIAL_FEEDBACK_METRICS);
  const [semesterConfig, setSemesterConfig] = useState(INITIAL_SEMESTER_CONFIG);

  const liveMode = !!user;

  // Once authenticated, adopt the account's real role and department, and
  // pull real collections from the backend in place of the mock seed data.
  // If any call fails (backend up but empty/misconfigured), we silently
  // keep whatever's already in state rather than breaking the screen.
  useEffect(() => {
    if (!user) return;
    setCurrentRole((user.role || "student").toUpperCase());
    if (user.department) setSelectedDepartment(user.department);

    (async () => {
      try {
        const [apiFaculty, apiRooms, apiSubjects, apiLeave] = await Promise.all([
          facultyApi.list(),
          roomsApi.list(),
          subjectsApi.list(),
          leaveApi.list(),
        ]);
        const subjById = byId(apiSubjects);
        setFacultyList(facultyFromApi(apiFaculty, subjById));
        setRooms(roomsFromApi(apiRooms));
        setSubjects(subjectsFromApi(apiSubjects, byId(apiFaculty), byId(apiRooms)));
        setLeaveRequests(
          apiLeave.map((l) => ({
            id: l.id,
            facultyName: l.faculty_name,
            reason: l.reason,
            slot: l.slot_label,
            status: l.status,
            recommendedProxy: l.recommended_proxy,
            assignedProxy: l.assigned_proxy,
          }))
        );
      } catch {
        // Backend reachable for login but a collection call failed (e.g.
        // nothing seeded yet) — keep the mock seed data visible.
      }
    })();
  }, [user]);

  const currentUser = liveMode
    ? {
        id: user.id,
        name: user.email,
        title: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        badge: user.is_committee_member ? "Committee Member" : user.role,
        dept: user.department || selectedDepartment,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email)}`,
      }
    : INITIAL_ROLES[currentRole] || INITIAL_ROLES.ADMIN;

  // Handlers
  const handleRoleChange = (role) => {
    setCurrentRole(role);
    // Contextual view defaults when role changes
    if (role === "STUDENT") {
      setCurrentTab("dashboard");
    } else if (role === "TIMETABLE") {
      setCurrentTab("scheduling-engine");
    } else if (role === "FACULTY") {
      setCurrentTab("dashboard");
    } else {
      setCurrentTab("dashboard");
    }
  };

  const handleAssignProxy = (leaveId, proxyName) => {
    setLeaveRequests((prev) =>
      prev.map((lr) =>
        lr.id === leaveId
          ? { ...lr, status: "APPROVED", assignedProxy: proxyName }
          : lr
      )
    );

    // Update timetable proxy assignment for Mon Period 2
    setTimetable((prev) => ({
      ...prev,
      Mon: prev.Mon.map((slot) =>
        slot.subject.includes("DBMS") || slot.id === "t-2"
          ? { ...slot, proxy: proxyName, type: "Ongoing" }
          : slot
      ),
    }));

    // Add to Audit Log
    const newLog = {
      id: `a-${Date.now()}`,
      type: "success",
      title: `Proxy Substitution Assigned: ${proxyName}`,
      desc: `DBMS Theory period covered with zero clashes • Confirmed by Admin`,
      time: "Just now",
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleApplyLeave = (newLeave) => {
    setLeaveRequests((prev) => [newLeave, ...prev]);

    const newLog = {
      id: `a-${Date.now()}`,
      type: "error",
      title: `Academic Leave Requested by ${newLeave.facultyName}`,
      desc: `${newLeave.reason} for ${newLeave.slot} • Heuristic proxy solver engaged`,
      time: "Just now",
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleAcceptSubstitution = (leaveId) => {
    handleAssignProxy(leaveId, "Prof. Sneha Sharma");
  };

  const handleDeclineSubstitution = (leaveId) => {
    setLeaveRequests((prev) =>
      prev.map((lr) =>
        lr.id === leaveId
          ? { ...lr, recommendedProxy: "Prof. S. Patil" }
          : lr
      )
    );
  };

  const handleToggleRoomStatus = (roomId, newStatus) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: newStatus }
          : r
      )
    );

    const newLog = {
      id: `a-${Date.now()}`,
      type: "secondary",
      title: `Room Status Updated: ${roomId}`,
      desc: `IoT Sensor synced: status changed to ${newStatus}`,
      time: "Just now",
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleAddSubject = async (newSub) => {
    if (liveMode) {
      // Persist subjects in MongoDB; React state alone is not enough because
      // the scheduling engine reads its inputs from the backend database.
      const created = await subjectsApi.create({
        name: newSub.name,
        department: newSub.department,
        semester: newSub.semester,
        faculty_id: newSub.facultyId,
        hours_per_week: newSub.hoursPerWeek,
        requires_lab: newSub.requiresLab,
        student_count: newSub.studentCount || 0,
      });
      setSubjects((prev) => [...prev, {
        id: created.id,
        name: created.name,
        code: created.id.slice(-6).toUpperCase(),
        faculty: facultyList.find((f) => f.id === created.faculty_id)?.name || created.faculty_id,
        totalHours: created.hours_per_week,
        hoursPerWeek: created.hours_per_week,
        room: created.requires_lab ? "Lab (assigned by engine)" : "Classroom (assigned by engine)",
        type: created.requires_lab ? "Theory + Lab" : "Theory",
        division: `${created.department} • ${created.semester}`,
      }]);
      setAuditLogs((prev) => [{
        id: `a-${Date.now()}`,
        type: "primary",
        title: `Subject saved: ${created.name}`,
        desc: `${created.hours_per_week} hrs/week assigned to ${newSub.facultyName || created.faculty_id}`,
        time: "Just now",
      }, ...prev]);
      return;
    }

    setSubjects((prev) => [...prev, newSub]);
    setAuditLogs((prev) => [{
      id: `a-${Date.now()}`,
      type: "primary",
      title: `New Subject Workload Added: ${newSub.name}`,
      desc: `${newSub.hoursPerWeek || newSub.totalHours} hrs/week assigned to ${newSub.facultyName || newSub.faculty}`,
      time: "Just now",
    }, ...prev]);
  };

  const handleUpdateSemesterConfig = (updates) => {
    setSemesterConfig((prev) => ({ ...prev, ...updates }));
  };

  // Calls the real engine-backed endpoint when logged in; in demo mode
  // there's nothing to call, so it resolves immediately and the existing
  // simulated progress UI in TimetableGenerator is all the user sees.
  const handleGenerateTimetable = useCallback(async ({ department, semester, days = 6, periodsPerDay = 9, breakPeriods = [5] } = {}) => {
    if (!liveMode) return;
    const dept = department || selectedDepartment;
    const sem = semester || "Sem 5";
    try {
      const result = await timetableApi.generate({
        department: dept,
        semester: sem,
        days,
        periods_per_day: periodsPerDay,
        break_periods: breakPeriods,
      });
      setTimetable(
        timetableFromApi(result, {
          facultyById: byId(facultyList),
          subjectsById: byId(subjects),
          roomsById: byId(rooms),
        })
      );
      setAuditLogs((prev) => [{
        id: `a-${Date.now()}`,
        type: "success",
        title: "Timetable generated by scheduling engine",
        desc: `${result.entries.length} classes placed for ${dept} • ${sem} with zero constraint conflicts`,
        time: "Just now",
      }, ...prev]);
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const thrown = new Error(err.detail?.message || "Generation failed");
        thrown.reasons = err.detail?.reasons || [];
        throw thrown;
      }
      throw err;
    }
  }, [liveMode, selectedDepartment, facultyList, subjects, rooms]);

  const handlePublishTimetable = async (semester = "Sem 5") => {
    if (liveMode) {
      try {
        await timetableApi.publish(selectedDepartment, semester);
      } catch (err) {
        const reasons = err instanceof ApiError ? err.detail?.reasons : null;
        setAuditLogs((prev) => [
          {
            id: `a-${Date.now()}`,
            type: "error",
            title: "Publish blocked by the engine",
            desc: (reasons || [err.message]).join("; "),
            time: "Just now",
          },
          ...prev,
        ]);
        return;
      }
    }

    const newLog = {
      id: `a-${Date.now()}`,
      type: "success",
      title: "Timetable v3.4 Published to University ERP",
      desc: "Mumbai University master sync updated for Computer Science & IT divisions",
      time: "Just now",
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Render main content area depending on currentTab and currentRole
  const renderContent = () => {
    if (currentTab === "scheduling-engine") {
      return (
        <TimetableGenerator
          subjects={subjects}
          timetable={timetable}
          facultyList={facultyList}
          roomsList={rooms}
          semesterConfig={semesterConfig}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          onUpdateSemesterConfig={handleUpdateSemesterConfig}
          onAddSubject={handleAddSubject}
          onGenerateTimetable={handleGenerateTimetable}
          onNavigateTab={setCurrentTab}
        />
      );
    }

    if (currentTab === "my-timetable") {
      return (
        <TimetableExport
          timetable={timetable}
          currentUser={currentUser}
          selectedDepartment={selectedDepartment}
        />
      );
    }

    if (currentTab === "faculty-and-staff") {
      return <FacultyStaffList facultyList={facultyList} />;
    }

    if (currentTab === "leave-and-substitutions") {
      return (
        <LeaveAndSubstitutions
          leaveRequests={leaveRequests}
          facultyList={facultyList}
          onAssignProxy={handleAssignProxy}
          onApproveLeave={handleAssignProxy}
        />
      );
    }

    if (currentTab === "campus-availability") {
      return (
        <RoomAvailability
          rooms={rooms}
          onToggleRoomStatus={handleToggleRoomStatus}
        />
      );
    }

    if (currentTab === "feedback-analytics") {
      return (
        <FeedbackAnalytics
          feedbackMetrics={feedbackMetrics}
          onNavigateTab={setCurrentTab}
        />
      );
    }

    if (currentTab === "timetable-export") {
      return (
        <TimetableExport
          timetable={timetable}
          currentUser={currentUser}
          selectedDepartment={selectedDepartment}
        />
      );
    }

    // Default Dashboard Tab based on Active Role
    if (currentRole === "FACULTY") {
      return (
        <FacultyDashboard
          currentUser={currentUser}
          leaveRequests={leaveRequests}
          onApplyLeave={handleApplyLeave}
          onAcceptSubstitution={handleAcceptSubstitution}
          onDeclineSubstitution={handleDeclineSubstitution}
          onNavigateTab={setCurrentTab}
        />
      );
    }

    if (currentRole === "STUDENT") {
      return (
        <StudentDashboard
          currentUser={currentUser}
          timetable={timetable}
          onNavigateTab={setCurrentTab}
        />
      );
    }

    if (currentRole === "TIMETABLE") {
      return (
        <TimetableGenerator
          subjects={subjects}
          timetable={timetable}
          facultyList={facultyList}
          roomsList={rooms}
          semesterConfig={semesterConfig}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          onUpdateSemesterConfig={handleUpdateSemesterConfig}
          onAddSubject={handleAddSubject}
          onGenerateTimetable={handleGenerateTimetable}
          onNavigateTab={setCurrentTab}
        />
      );
    }

    // Default: Admin
    return (
      <AdminDashboard
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        facultyList={facultyList}
        roomsList={rooms}
        timetable={timetable}
        leaveRequests={leaveRequests}
        auditLogs={auditLogs}
        feedbackMetrics={feedbackMetrics}
        onNavigateTab={setCurrentTab}
        onAssignProxy={handleAssignProxy}
        onPublishTimetable={handlePublishTimetable}
      />
    );
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!user && !demoMode) {
    return <Login onDemoMode={() => setDemoMode(true)} />;
  }

  return (
    <div className="bg-background font-sans text-on-surface min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-72 transition-all">
        <TopHeader
          currentRoleUser={currentUser}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          notificationCount={leaveRequests.filter((l) => l.status === "PENDING_PROXY").length}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onSignOut={liveMode ? logout : undefined}
        />

        <main className="flex-1 pt-20 px-4 sm:px-8 py-6 w-full">
          {renderContent()}
        </main>
      </div>

      {/* Notifications Drawer Modal */}
      <Modal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title="Administrative Notifications & Broadcasts"
        subtitle="Live alerts from College Exam Cell, Faculty Triage, and IoT Sensors"
      >
        <div className="space-y-3">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-secondary mt-1.5 shrink-0" />
              <div>
                <h4 className="font-label-md font-bold text-on-surface">{log.title}</h4>
                <p className="font-body-sm text-on-surface-variant mt-0.5">{log.desc}</p>
                <span className="font-label-sm text-outline mt-1 block">{log.time}</span>
              </div>
            </div>
          ))}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsNotificationModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold"
            >
              Close Alerts
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
