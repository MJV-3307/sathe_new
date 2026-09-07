import React, { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";

export default function FacultyDashboard({
  currentUser,
  leaveRequests,
  onApplyLeave,
  onAcceptSubstitution,
  onDeclineSubstitution,
  onNavigateTab
}) {
  // Duty status toggle state
  const dutyOptions = [
    "On Campus (Room 204)",
    "In Lecture (Smart Wing)",
    "In Research Lab 3",
    "Staff Conference Room",
    "Off Duty"
  ];
  const [dutyIndex, setDutyIndex] = useState(0);

  // Substitution state
  const pendingSub = leaveRequests.find(
    (lr) => lr.status === "PENDING_PROXY" && lr.recommendedProxy === "Prof. Sneha Sharma"
  );
  const [subActionFeedback, setSubActionFeedback] = useState(null);

  // Leave Modal state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState("2026-09-15");
  const [leaveSlot, setLeaveSlot] = useState("Morning (10:00 - 12:00)");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // Roll Call Modal state
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [presentCount, setPresentCount] = useState(58);
  const totalStudents = 62;

  const toggleDutyStatus = () => {
    setDutyIndex((prev) => (prev + 1) % dutyOptions.length);
  };

  const handleSub = (accepted) => {
    if (!pendingSub) return;
    if (accepted) {
      onAcceptSubstitution(pendingSub.id);
      setSubActionFeedback("Accepted substitution for DBMS Theory. Added to your schedule!");
    } else {
      onDeclineSubstitution(pendingSub.id);
      setSubActionFeedback("Substitution declined. Transferred back to admin queue.");
    }
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    onApplyLeave({
      id: `lr-${Date.now()}`,
      facultyId: "f2",
      facultyName: currentUser.name,
      date: leaveDate,
      slot: leaveSlot,
      subject: "Data Structures & Algorithms",
      room: "Classroom 204",
      division: "Sem 5 Div A",
      reason: leaveReason || "Casual Academic Leave",
      priority: "Standard",
      status: "PENDING_PROXY",
      recommendedProxy: "Prof. S. Patil",
      proxyWorkload: "16/18 hrs",
      proxyClashes: 0,
    });
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      setIsLeaveModalOpen(false);
      setLeaveReason("");
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-6 pb-12">
      {/* Welcome & Identity Strip */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-stitch-sm border border-outline-variant/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-primary-fixed/20 pointer-events-none blur-2xl" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover shadow-sm ring-4 ring-primary-fixed"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-secondary rounded-full ring-2 ring-surface-container-lowest" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-extrabold truncate">
                  Welcome, {currentUser.name}
                </h1>
                <span className="text-2xl select-none">👨‍🏫</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm font-bold">
                  {currentUser.title}
                </span>
                <span className="text-on-surface-variant font-label-sm font-semibold truncate">
                  • {currentUser.dept}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("timetable-export")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-primary hover:bg-surface-container border border-outline-variant/30 font-label-md font-semibold self-start sm:self-auto transition-colors"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Download My Timetable</span>
          </button>
        </div>

        {/* Duty Status Interactive Toggle Pill */}
        <div className="mt-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Live Campus Duty Status
              </span>
              <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                {dutyOptions[dutyIndex]}
              </span>
            </div>
          </div>

          <button
            onClick={toggleDutyStatus}
            className="px-4 py-2 rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container-highest font-label-md font-bold shadow-stitch-sm active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            <span>Change Status</span>
          </button>
        </div>
      </section>

      {/* Urgent Substitution Request Alert Box */}
      {pendingSub && (
        <section className="bg-error-container rounded-2xl p-6 shadow-stitch-sm border border-error/20 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-xl fill">priority_high</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-error font-extrabold tracking-wider uppercase">
                  High Priority Triage Alert
                </span>
                <span className="font-label-sm text-on-error-container bg-surface-container-lowest/80 px-2.5 py-0.5 rounded-full font-semibold">
                  Today
                </span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-error-container mt-1 font-bold">
                Urgent Proxy Substitution Request
              </h2>
              <p className="font-body-md text-on-surface-variant mt-1.5 leading-snug">
                Substitution requested for <strong className="text-on-surface">{pendingSub.subject}</strong> ({pendingSub.slot}, {pendingSub.room}, {pendingSub.division}) by <strong className="text-on-surface">{pendingSub.facultyName}</strong> ({pendingSub.reason}).
              </p>
              <p className="font-label-sm text-outline mt-1">
                AI conflict checker confirmed you have <strong>0 lecture clashes</strong> and free period capacity.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  onClick={() => handleSub(true)}
                  className="px-5 h-11 bg-primary text-on-primary hover:bg-primary-container rounded-xl font-label-lg font-bold flex items-center gap-2 shadow-stitch-sm active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Accept Request</span>
                </button>
                <button
                  onClick={() => handleSub(false)}
                  className="px-4 h-11 bg-surface-container-lowest text-on-surface-variant hover:text-error rounded-xl font-label-lg font-semibold flex items-center justify-center active:scale-95 transition-all border border-outline-variant/30"
                >
                  Decline
                </button>
              </div>

              {subActionFeedback && (
                <div className="mt-3 p-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md font-semibold border border-outline-variant/30 animate-in fade-in">
                  {subActionFeedback}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Today's Lecture Schedule */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">calendar_today</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Today's Lectures
            </h2>
          </div>
          <span className="font-label-sm text-on-surface-variant px-3 py-1 rounded-full bg-surface-container-high font-semibold">
            3 Scheduled Sessions
          </span>
        </div>

        {/* Class 1: Active / Now */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-stitch-sm border border-outline-variant/20 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-secondary-container" />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pl-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  09:00 AM – 10:00 AM
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Current Class
                </span>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold mt-1.5 truncate">
                Data Structures & Algorithms
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                B.Sc. CS Div A • Semester 5 • Core Unit
              </p>
            </div>

            <div className="flex flex-col sm:items-end shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container-high text-on-surface font-label-md font-semibold">
                <span className="material-symbols-outlined text-[18px] text-primary">meeting_room</span>
                <span>Room 204 (Smartboard)</span>
              </div>
              <span className="font-label-sm text-secondary font-semibold mt-1">
                45m elapsed • Slot Active
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 pl-2 flex flex-wrap items-center justify-between border-t border-surface-container gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center font-label-sm text-on-primary-fixed font-bold">
                {presentCount}
              </div>
              <span className="font-body-sm text-on-surface-variant font-medium">
                / {totalStudents} Students Marked Present (Biometric)
              </span>
            </div>
            <button
              onClick={() => setIsRollModalOpen(true)}
              className="text-primary hover:text-primary-container font-label-md font-bold flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>Take Attendance Roll</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Class 2: Upcoming with countdown badge */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-stitch-sm border border-outline-variant/20 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-outline-variant" />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pl-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  11:00 AM – 12:00 PM
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm font-semibold">
                  Starts in 1h 15m
                </span>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold mt-1.5 truncate">
                Advanced Algorithms Tutorial
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                M.Sc. IT Div B • Semester 1 • Lab 3
              </p>
            </div>

            <div className="flex flex-col sm:items-end shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container text-on-surface font-label-md font-semibold">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">computer</span>
                <span>Lab 3 (High-Spec)</span>
              </div>
              <span className="font-label-sm text-outline mt-1">IT Block 2F</span>
            </div>
          </div>

          <div className="mt-4 pt-3 pl-2 flex items-center justify-between border-t border-surface-container">
            <span className="font-body-sm text-on-surface-variant">
              Topic: Dynamic Programming & Matrix Chain
            </span>
            <span className="font-label-sm text-secondary font-semibold">
              30 Workstations Pre-Allocated
            </span>
          </div>
        </div>

        {/* Class 3: Afternoon */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-stitch-sm border border-outline-variant/20 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-outline-variant" />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pl-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  02:00 PM – 04:00 PM
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm font-semibold">
                  Afternoon Cohort
                </span>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold mt-1.5 truncate">
                Capstone Project Mentorship Review
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                Final Year B.Sc. • Room 206 • 4 Project Teams
              </p>
            </div>

            <div className="flex flex-col sm:items-end shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container text-on-surface font-label-md font-semibold">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">groups</span>
                <span>Room 206</span>
              </div>
              <span className="font-label-sm text-outline mt-1">CS Block 2F</span>
            </div>
          </div>
        </div>
      </section>

      {/* Leave Status & Balances Module */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-stitch-sm border border-outline-variant/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">event_busy</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Leave Balances & Substitution Manager
            </h2>
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-stitch-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Apply Leave</span>
          </button>
        </div>

        {/* 3-column stats cards */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col items-center border border-outline-variant/20">
            <span className="font-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
              Pending
            </span>
            <span className="font-headline-lg text-headline-lg text-secondary font-extrabold mt-1">
              1
            </span>
            <span className="font-label-sm text-outline mt-0.5 truncate">Under Dean review</span>
          </div>

          <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col items-center border border-outline-variant/20">
            <span className="font-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
              Approved
            </span>
            <span className="font-headline-lg text-headline-lg text-primary font-extrabold mt-1">
              4
            </span>
            <span className="font-label-sm text-outline mt-0.5 truncate">Academic Year</span>
          </div>

          <div className="bg-surface-container-high rounded-xl p-3.5 flex flex-col items-center border border-outline-variant/30">
            <span className="font-label-sm text-primary font-bold uppercase tracking-wider">
              CL / SL Left
            </span>
            <span className="font-headline-lg text-headline-lg text-primary font-extrabold mt-1">
              8
            </span>
            <span className="font-label-sm text-primary font-semibold mt-0.5 truncate">Available days</span>
          </div>
        </div>
      </section>

      {/* Student Feedback Summary for Faculty */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-stitch-sm border border-outline-variant/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">star</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              My Student Feedback & Teaching Scores
            </h2>
          </div>
          <span className="font-label-sm px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
            Sem Mid-Term
          </span>
        </div>

        <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-4 border border-outline-variant/20">
          <div className="flex items-baseline gap-2">
            <span className="font-display-sm text-display-sm text-primary font-extrabold tracking-tight">
              4.8
            </span>
            <span className="font-title-md text-on-surface-variant font-semibold">/ 5.0</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center text-primary gap-0.5">
              <span className="material-symbols-outlined text-[18px] fill">star</span>
              <span className="material-symbols-outlined text-[18px] fill">star</span>
              <span className="material-symbols-outlined text-[18px] fill">star</span>
              <span className="material-symbols-outlined text-[18px] fill">star</span>
              <span className="material-symbols-outlined text-[18px] fill">star_half</span>
            </div>
            <span className="font-label-sm text-on-surface font-bold mt-1">
              96% positive • 142 reviews
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between items-center font-body-sm">
              <span className="text-on-surface font-semibold">Subject Clarity</span>
              <span className="text-primary font-bold">4.9 / 5.0</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-2 rounded-full" style={{ width: "98%" }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center font-body-sm">
              <span className="text-on-surface font-semibold">Doubts Solving & Lab Help</span>
              <span className="text-primary font-bold">4.7 / 5.0</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
              <div className="bg-secondary-container h-2 rounded-full" style={{ width: "94%" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Academic Leave"
        subtitle="The scheduling engine will automatically find an available substitute faculty."
      >
        {leaveSubmitted ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">check</span>
            </div>
            <h4 className="font-title-md font-bold text-on-surface">Leave Request Submitted!</h4>
            <p className="font-body-sm text-on-surface-variant">
              System cross-referenced faculty timetables. <strong>Prof. S. Patil</strong> was identified as free with zero collisions and routed for substitution confirmation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitLeave} className="space-y-4">
            <div>
              <label className="font-label-sm text-on-surface font-semibold block mb-1">
                Leave Date *
              </label>
              <input
                type="date"
                required
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low rounded-xl border border-outline-variant/40 font-body-sm text-on-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-on-surface font-semibold block mb-1">
                Time Slot / Lecture Period *
              </label>
              <select
                value={leaveSlot}
                onChange={(e) => setLeaveSlot(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low rounded-xl border border-outline-variant/40 font-body-sm text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="Morning (09:00 - 10:00 AM)">Period 1: 09:00 - 10:00 AM (Data Structures)</option>
                <option value="Morning (11:00 - 12:00 PM)">Period 3: 11:00 - 12:00 PM (Advanced Algo)</option>
                <option value="Afternoon (02:00 - 04:00 PM)">Period 5: 02:00 - 04:00 PM (Project Review)</option>
                <option value="Full Day">Full Day Academic Leave</option>
              </select>
            </div>

            <div>
              <label className="font-label-sm text-on-surface font-semibold block mb-1">
                Reason for Absence *
              </label>
              <textarea
                rows="3"
                required
                placeholder="e.g. University Examination Duty / Medical / Faculty Development"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-xl">auto_schedule</span>
              <p className="font-label-sm text-outline">
                Automated substitute matching will ping eligible free faculty members directly.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md font-bold shadow-stitch-sm transition-all"
              >
                Submit Leave Application
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Attendance Modal */}
      <Modal
        isOpen={isRollModalOpen}
        onClose={() => setIsRollModalOpen(false)}
        title="Biometric Attendance Verification"
        subtitle="Data Structures & Algorithms • Sem 5 Div A (Room 204)"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="font-label-sm text-outline uppercase font-semibold">Live Headcount</span>
              <div className="font-headline-md font-extrabold text-on-surface mt-0.5">
                {presentCount} / {totalStudents} Present
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPresentCount((c) => Math.max(0, c - 1))}
                className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface font-bold text-lg hover:bg-surface-container shadow-xs border border-outline-variant/30"
              >
                -
              </button>
              <button
                onClick={() => setPresentCount((c) => Math.min(totalStudents, c + 1))}
                className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-lg hover:bg-primary-container shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          <p className="font-body-sm text-on-surface-variant">
            Biometric terminal in Room 204 automatically recorded 58 student fingerprints. You can manually adjust late-comers or lab assistants.
          </p>

          <div className="flex justify-end pt-3 border-t border-surface-container">
            <button
              onClick={() => setIsRollModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-stitch-sm"
            >
              Confirm & Save Attendance
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
