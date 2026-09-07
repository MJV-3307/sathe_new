import React, { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import RoleSwitcher from "../layout/RoleSwitcher";

export default function AdminDashboard({
  currentRole,
  onRoleChange,
  facultyList,
  roomsList,
  timetable,
  leaveRequests,
  auditLogs,
  feedbackMetrics,
  onNavigateTab,
  onAssignProxy,
  onPublishTimetable
}) {
  const [slotFilter, setSlotFilter] = useState("all");
  const [proxyAssignedSuccess, setProxyAssignedSuccess] = useState(false);
  const [timetablePublished, setTimetablePublished] = useState(false);

  // Derived stats
  const totalFaculty = facultyList.length;
  const onLeaveFaculty = facultyList.filter(f => f.status.toLowerCase().includes("leave")).length;
  const activeFaculty = totalFaculty - onLeaveFaculty;

  const totalRooms = roomsList.length;
  const freeRooms = roomsList.filter(r => r.status === "FREE").length;
  const occupiedRooms = roomsList.filter(r => r.status === "OCCUPIED").length;

  const pendingLeave = leaveRequests.find(lr => lr.status === "PENDING_PROXY");

  const handleAssignClick = () => {
    if (pendingLeave) {
      onAssignProxy(pendingLeave.id, pendingLeave.recommendedProxy);
      setProxyAssignedSuccess(true);
      setTimeout(() => setProxyAssignedSuccess(false), 4000);
    }
  };

  const handlePublishClick = () => {
    onPublishTimetable();
    setTimetablePublished(true);
    setTimeout(() => setTimetablePublished(false), 4000);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Command Bar & Breadcrumb */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-surface-container/60">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 text-outline font-label-sm uppercase tracking-wider">
            <span>CampusConnect</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Portals</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Central Department Admin</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
              Academic Administration & Command Portal
            </h1>
            <span className="bg-secondary text-on-secondary font-label-sm px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest animate-pulse" />
              AY 2024-25 • Term 1
            </span>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-sm text-secondary">sync</span>
              <span>Mumbai Univ ERP: synced 2 mins ago</span>
            </div>
          </div>
        </div>

        {/* Action Strip & Role Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab("timetable-export")}
              className="flex items-center gap-2 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low font-label-lg px-3.5 py-2 rounded-xl shadow-stitch-sm transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-base text-secondary">file_download</span>
              <span>Export Audit</span>
            </button>
            <button
              onClick={() => onNavigateTab("scheduling-engine")}
              className="flex items-center gap-2 bg-primary-container text-on-primary font-label-lg px-4 py-2 rounded-xl shadow-stitch-md hover:bg-primary transition-all"
            >
              <span className="material-symbols-outlined text-base">auto_schedule</span>
              <span>Schedule Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview 4-Card Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Faculty */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20 hover:shadow-stitch-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Teaching Roster
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-sm text-display-sm text-on-surface font-extrabold">{totalFaculty}</span>
                <span className="font-label-md text-secondary font-semibold">Total Faculty</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-xl">badge</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-surface-container-low/50 -mx-5 -mb-5 p-4 rounded-b-2xl flex flex-col gap-1.5 border-t border-surface-container">
            <div className="flex items-center justify-between font-label-sm">
              <span className="text-on-surface-variant font-medium">Duty Active ({activeFaculty})</span>
              <span className="text-error font-semibold">{onLeaveFaculty} On Leave</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
              <div className="bg-primary-container h-full transition-all duration-500" style={{ width: `${(activeFaculty/totalFaculty) * 100}%` }} />
              <div className="bg-error h-full transition-all duration-500" style={{ width: `${(onLeaveFaculty/totalFaculty) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Card 2: Student Biometric Attendance */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20 hover:shadow-stitch-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Enrolled Attendance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-sm text-display-sm text-on-surface font-extrabold">1,420</span>
                <span className="font-label-md text-secondary font-semibold">Across 6 Divs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary shadow-xs">
              <span className="material-symbols-outlined text-xl">fingerprint</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-surface-container-low/50 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-center justify-between border-t border-surface-container">
            <div className="flex items-center gap-1.5 text-on-surface font-label-md">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-bold">94.2%</span>
              <span className="text-on-surface-variant text-body-sm font-normal">Present today</span>
            </div>
            <span className="font-label-sm text-primary font-bold">CS • IT • AI/DS</span>
          </div>
        </div>

        {/* Card 3: Session Utilization */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20 hover:shadow-stitch-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Session Utilization
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-sm text-display-sm text-on-surface font-extrabold">
                  {occupiedRooms}<span className="text-headline-md text-outline">/{totalRooms}</span>
                </span>
                <span className="font-label-md text-secondary font-semibold">Active Venues</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container shadow-xs">
              <span className="material-symbols-outlined text-xl">timelapse</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-surface-container-low/50 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-center justify-between font-label-sm border-t border-surface-container">
            <span className="text-on-surface-variant">
              {Math.round((occupiedRooms / totalRooms) * 100)}% capacity usage
            </span>
            <span className="text-secondary font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-sm">north_east</span> {freeRooms} Venues Open
            </span>
          </div>
        </div>

        {/* Card 4: Instant Spatial Ready */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20 hover:shadow-stitch-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Instant Spatial Ready
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-sm text-display-sm text-secondary font-extrabold">{freeRooms}</span>
                <span className="font-label-md text-on-surface-variant font-semibold">Available Now</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary shadow-xs">
              <span className="material-symbols-outlined text-xl">meeting_room</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-surface-container-low/50 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-center justify-between font-label-sm border-t border-surface-container">
            <span className="text-on-surface">Smart Classrooms</span>
            <span className="text-outline">•</span>
            <span className="text-on-surface">Computer Labs</span>
            <span className="text-outline">•</span>
            <span className="text-on-surface">Grounds</span>
          </div>
        </div>
      </div>

      {/* Main Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT WORKFLOW CANVAS (8 COLUMNS) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* SECTION A: URGENT TRIAGE */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                  Urgent Academic Triage & Clashes
                </h2>
              </div>
              <span className="bg-error-container text-on-error-container font-label-sm px-2.5 py-0.5 rounded-full font-bold">
                {pendingLeave ? "1 Direct Intervention" : "All Clear"}
              </span>
            </div>

            {/* Alert Card 1: Substitution Alert */}
            {pendingLeave ? (
              <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3 transition-all hover:bg-surface-container border border-error/20">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-xl">person_off</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-lg text-label-lg text-on-surface font-bold">
                          Faculty Substitution Needed
                        </span>
                        <span className="bg-surface-container-highest text-on-surface-variant font-label-sm px-2 py-0.5 rounded font-semibold">
                          Period 2 • Today
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        <strong className="text-on-surface">{pendingLeave.facultyName}</strong> applied for {pendingLeave.reason} for{" "}
                        <span className="text-primary font-semibold">{pendingLeave.subject}</span> ({pendingLeave.slot}, {pendingLeave.room}, {pendingLeave.division}).
                      </p>
                    </div>
                  </div>
                  <span className="font-label-sm text-error font-bold px-2 py-1 bg-surface-container-lowest rounded-md self-start shrink-0">
                    {pendingLeave.priority}
                  </span>
                </div>

                {/* AI Recommended Proxy Match Pill */}
                <div className="bg-surface-container-lowest p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-stitch-sm border border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-label-sm flex items-center justify-center font-bold">
                      AI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          Recommended Proxy: {pendingLeave.recommendedProxy}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm px-2 py-0.5 rounded-full font-semibold">
                          0 Clashes • Slot Free
                        </span>
                      </div>
                      <p className="font-label-sm text-outline">
                        Teaches Advanced DBMS • Workload: {pendingLeave.proxyWorkload} this week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onNavigateTab("leave-and-substitutions")}
                      className="bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-sm px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View Roster
                    </button>
                    <button
                      onClick={handleAssignClick}
                      className="bg-primary text-on-primary hover:bg-primary-container font-label-sm px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 active:scale-95 font-semibold"
                    >
                      <span className="material-symbols-outlined text-sm">how_to_reg</span>
                      <span>Assign Proxy</span>
                    </button>
                  </div>
                </div>

                {proxyAssignedSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-label-sm font-semibold flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>Proxy assigned to {pendingLeave.recommendedProxy}. Notification dispatched to faculty portal!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
                <span className="material-symbols-outlined text-xl text-emerald-600">verified</span>
                <div>
                  <p className="font-label-md font-bold">All Faculty Substitutions Resolved</p>
                  <p className="text-body-sm text-emerald-700">No active teacher absence or unallocated lecture slots for today.</p>
                </div>
              </div>
            )}

            {/* Alert Card 2: AI Timetable Draft Ready */}
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3 transition-all hover:bg-surface-container border border-outline-variant/30">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        Sem 3 & Sem 5 Timetable AI Draft Ready
                      </span>
                      <span className="bg-surface-container-highest text-secondary font-label-sm px-2 py-0.5 rounded font-semibold">
                        v3.4 Automated Solution
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      The genetic conflict solver resolved room allocations for 4 specialized batches across Sathaye Central Wing with <strong>0 lab scheduling conflicts</strong>.
                    </p>
                  </div>
                </div>
                <span className="font-label-sm text-secondary font-bold px-2 py-1 bg-surface-container-lowest rounded-md self-start shrink-0">
                  Review Ready
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span>Classrooms: <strong>100% matched</strong></span>
                  <span>•</span>
                  <span>Faculty Workload: <strong>Balanced (&lt; 16h/wk)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onNavigateTab("scheduling-engine")}
                    className="bg-surface-container-lowest text-on-surface font-label-sm px-3 py-1.5 rounded-lg shadow-stitch-sm hover:bg-surface-container transition-colors flex items-center gap-1 border border-outline-variant/30 font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>Audit Schedule</span>
                  </button>
                  <button 
                    onClick={handlePublishClick}
                    className="bg-primary-container text-on-primary font-label-sm px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-primary transition-colors flex items-center gap-1 font-semibold active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">publish</span>
                    <span>Publish to University Portal</span>
                  </button>
                </div>
              </div>
              {timetablePublished && (
                <div className="p-2.5 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-sm font-semibold flex items-center gap-2 border border-primary/20 animate-in fade-in">
                  <span className="material-symbols-outlined text-sm">cloud_done</span>
                  <span>Timetable v3.4 published! University database and student app feeds updated successfully.</span>
                </div>
              )}
            </div>
          </section>

          {/* SECTION B: LIVE TIMETABLE ROSTER */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                  Live Department Lecture Roster & Hall Matrix
                </h2>
                <p className="font-body-sm text-body-sm text-outline">
                  Real-time room occupancy and streaming session metrics across Wing C
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 self-start">
                <button
                  onClick={() => setSlotFilter("all")}
                  className={`px-3 py-1 rounded-lg font-label-sm transition-all ${
                    slotFilter === "all" ? "bg-primary text-on-primary shadow-xs font-semibold" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  All Slots
                </button>
                <button
                  onClick={() => setSlotFilter("morning")}
                  className={`px-3 py-1 rounded-lg font-label-sm transition-all ${
                    slotFilter === "morning" ? "bg-primary text-on-primary shadow-xs font-semibold" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Morning
                </button>
                <button
                  onClick={() => setSlotFilter("afternoon")}
                  className={`px-3 py-1 rounded-lg font-label-sm transition-all ${
                    slotFilter === "afternoon" ? "bg-primary text-on-primary shadow-xs font-semibold" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Afternoon
                </button>
              </div>
            </div>

            {/* Timetable Session Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timetable.Mon
                .filter(item => {
                  if (slotFilter === "morning") return item.time.includes("09:") || item.time.includes("10:") || item.time.includes("11:");
                  if (slotFilter === "afternoon") return item.time.includes("01:") || item.time.includes("02:") || item.time.includes("03:");
                  return true;
                })
                .map(session => (
                  <div
                    key={session.id}
                    className="bg-surface-container-low p-4 rounded-xl hover:bg-surface-container transition-all flex flex-col justify-between border border-outline-variant/20 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-surface-container-highest text-primary font-label-sm px-2 py-0.5 rounded font-bold">
                            {session.room}
                          </span>
                          <StatusBadge status={session.type} size="sm" />
                        </div>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold mt-2">
                          {session.subject}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {session.faculty} • {session.division}
                        </p>
                      </div>
                      <span className="font-label-sm text-outline bg-surface-container-lowest px-2 py-1 rounded-md border border-outline-variant/30 shrink-0">
                        {session.time}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 bg-surface-container-lowest -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl flex items-center justify-between border-t border-surface-container">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-secondary">groups</span>
                        <span className="font-label-sm text-on-surface font-bold">
                          {session.present} / {session.total} Attending
                        </span>
                      </div>
                      <span className="font-label-sm text-secondary font-semibold">
                        Biometric Verified
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* RIGHT INTELLIGENCE WIDGET SIDEBAR (4 COLUMNS) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* WIDGET 1: ADMINISTRATIVE SUITE */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col gap-3">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                Administrative Suite
              </h2>
              <p className="font-body-sm text-body-sm text-outline">
                Automated scheduling and intelligence engines
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              <button 
                onClick={() => onNavigateTab("scheduling-engine")}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left group border border-outline-variant/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">auto_schedule</span>
                  </div>
                  <div>
                    <span className="font-label-lg text-on-surface block font-bold group-hover:text-primary transition-colors">
                      AI Timetable Generator
                    </span>
                    <span className="font-label-sm text-outline">Zero-conflict matrix solver</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </button>

              <button 
                onClick={() => onNavigateTab("campus-availability")}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left group border border-outline-variant/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">sensors</span>
                  </div>
                  <div>
                    <span className="font-label-lg text-on-surface block font-bold group-hover:text-primary transition-colors">
                      Campus IoT Venue Monitor
                    </span>
                    <span className="font-label-sm text-outline">{freeRooms} spaces currently vacant</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </button>

              <button 
                onClick={() => onNavigateTab("leave-and-substitutions")}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left group border border-outline-variant/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">event_busy</span>
                  </div>
                  <div>
                    <span className="font-label-lg text-on-surface block font-bold group-hover:text-primary transition-colors">
                      Leave & Substitution Hub
                    </span>
                    <span className="font-label-sm text-outline">Automated clash-free proxying</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </button>

              <button 
                onClick={() => onNavigateTab("feedback-analytics")}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left group border border-outline-variant/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container text-on-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">analytics</span>
                  </div>
                  <div>
                    <span className="font-label-lg text-on-surface block font-bold group-hover:text-primary transition-colors">
                      Feedback & NAAC Metric
                    </span>
                    <span className="font-label-sm text-outline">Criterion II teaching score: 4.8</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* WIDGET 2: REAL-TIME OPERATIONS STREAM */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                Operations Stream
              </h2>
              <span className="material-symbols-outlined text-outline text-lg">history</span>
            </div>

            <div className="relative pl-3 space-y-4">
              {auditLogs.map((log) => {
                let dotColor = "bg-secondary";
                if (log.type === "error") dotColor = "bg-error";
                if (log.type === "primary") dotColor = "bg-primary-container";
                if (log.type === "success") dotColor = "bg-emerald-500";

                return (
                  <div key={log.id} className="relative flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                    <div className="min-w-0">
                      <p className="font-body-sm text-body-sm text-on-surface font-semibold leading-snug">
                        {log.title}
                      </p>
                      <p className="font-label-sm text-outline mt-0.5">
                        {log.desc} • {log.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WIDGET 3: STUDENT FEEDBACK PREVIEW */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                Student Feedback Pulse
              </h2>
              <span className="bg-surface-container-low text-secondary font-label-sm px-2.5 py-0.5 rounded-full font-bold">
                Mid-Term
              </span>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between border border-outline-variant/20">
              <div className="flex flex-col">
                <span className="font-display-sm text-display-sm text-primary font-black leading-none">
                  {feedbackMetrics.overall}
                </span>
                <span className="font-label-sm text-on-surface-variant mt-1 font-semibold">
                  Out of 5.0 Rating
                </span>
              </div>
              <div className="flex flex-col text-right">
                <div className="flex items-center justify-end text-secondary">
                  <span className="material-symbols-outlined text-sm fill">star</span>
                  <span className="material-symbols-outlined text-sm fill">star</span>
                  <span className="material-symbols-outlined text-sm fill">star</span>
                  <span className="material-symbols-outlined text-sm fill">star</span>
                  <span className="material-symbols-outlined text-sm fill">star_half</span>
                </div>
                <span className="font-label-sm text-on-surface font-bold mt-1">
                  {feedbackMetrics.satisfactionRate}% Satisfaction
                </span>
                <span className="font-label-sm text-outline">
                  {feedbackMetrics.totalReviews} Verified Reviews
                </span>
              </div>
            </div>

            {/* Breakdown metrics */}
            <div className="flex flex-col gap-3">
              {feedbackMetrics.breakdown.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between font-label-sm">
                    <span className="text-on-surface">{item.label}</span>
                    <span className="font-bold text-primary">{item.score} / {item.max}</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-container h-full rounded-full transition-all duration-700" 
                      style={{ width: `${item.percent}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab("feedback-analytics")}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-xl font-label-md transition-colors font-semibold"
            >
              <span>View Detailed NAAC Report</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
