import React, { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";

// --- Semester math helpers -------------------------------------------------
// College week is 6 days (Mon-Sat), matching the day tabs below.

function getWorkingWeeks(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }
  let workingDays = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (cursor.getDay() !== 0) workingDays += 1; // exclude Sunday
    cursor.setDate(cursor.getDate() + 1);
  }
  return workingDays / 6;
}

function getPeriodsPerDay(hoursStart, hoursEnd) {
  if (!hoursStart || !hoursEnd) return 0;
  const [sh, sm] = hoursStart.split(":").map(Number);
  const [eh, em] = hoursEnd.split(":").map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  // Assumes 1-hour periods with no break carved out yet — refine once
  // break/lunch slots are configurable.
  return minutes > 0 ? Math.round(minutes / 60) : 0;
}

function formatWeeks(weeks) {
  if (!weeks) return "—";
  return weeks % 1 === 0 ? `${weeks}` : weeks.toFixed(1);
}

export default function TimetableGenerator({
  subjects,
  timetable,
  facultyList,
  roomsList,
  semesterConfig,
  selectedDepartment,
  onDepartmentChange,
  onUpdateSemesterConfig,
  onAddSubject,
  onGenerateTimetable,
  onNavigateTab
}) {
  const [selectedDept, setSelectedDept] = useState(selectedDepartment || "Computer Science & IT");
  const [selectedSem, setSelectedSem] = useState("Sem 5");
  const [selectedDiv, setSelectedDiv] = useState("Div A");
  const [activeDay, setActiveDay] = useState("Mon");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  const { courseName, startDate, endDate, collegeHoursStart, collegeHoursEnd } = semesterConfig;
  const totalWeeks = getWorkingWeeks(startDate, endDate);
  const periodsPerDay = getPeriodsPerDay(collegeHoursStart, collegeHoursEnd);

  const updateConfig = (field) => (e) =>
    onUpdateSemesterConfig({ [field]: e.target.value });

  // Add Subject Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubFaculty, setNewSubFaculty] = useState(facultyList[0]?.id || "");
  const [newSubTotalHours, setNewSubTotalHours] = useState(36);
  const [newSubRoom, setNewSubRoom] = useState(roomsList[0]?.id || "");

  const weeklyHoursPreview =
    totalWeeks > 0 ? (Number(newSubTotalHours) / totalWeeks) : 0;

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStep("Analyzing faculty availability & constraints...");

    setTimeout(() => {
      setGenerationStep("Running genetic clash solver on 30 lecture slots...");
    }, 800);

    setTimeout(() => {
      setGenerationStep("Optimizing lab hardware and smartboard allocations...");
    }, 1600);

    setTimeout(async () => {
      try {
        if (onGenerateTimetable) {
          await onGenerateTimetable({
            department: selectedDepartment || selectedDept,
            semester: selectedSem,
            days: 6,
            periodsPerDay: periodsPerDay || 9,
            // Period 5 is the lunch break in the default 08:00–17:00 setup.
            breakPeriods: periodsPerDay >= 9 ? [5] : [],
          });
        }
        setHasGenerated(true);
      } catch (err) {
        setGenerationError(
          err?.reasons?.length ? err.reasons : [err?.message || "Timetable generation failed."]
        );
      } finally {
        setIsGenerating(false);
        setGenerationStep(null);
      }
    }, 2400);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const selectedFaculty = facultyList.find((f) => f.id === newSubFaculty);
    const selectedRoom = roomsList.find((r) => r.id === newSubRoom);
    const hoursPerWeek = totalWeeks > 0
      ? Math.max(1, Math.round(Number(newSubTotalHours) / totalWeeks))
      : Math.max(1, Number(newSubTotalHours));

    onAddSubject({
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      code: newSubCode || "CS-400",
      department: selectedDepartment || selectedDept,
      semester: selectedSem,
      facultyId: newSubFaculty,
      facultyName: selectedFaculty?.name || newSubFaculty,
      hoursPerWeek,
      totalHours: Number(newSubTotalHours),
      room: selectedRoom?.name || "Assigned by engine",
      requiresLab: selectedRoom?.type === "lab",
      studentCount: 0,
      type: selectedRoom?.type === "lab" ? "Theory + Lab" : "Theory",
      division: `${selectedSem} ${selectedDiv}`,
    });

    setIsAddModalOpen(false);
    setNewSubName("");
    setNewSubCode("");
    setNewSubTotalHours(36);
  };

  // Derives an average hrs/week figure for display, given the semester's
  // current total working weeks. Falls back to "—" if dates aren't set.
  const weeklyHoursFor = (totalHours) =>
    totalWeeks > 0 ? (totalHours / totalWeeks) : null;

  const currentDaySlots = timetable[activeDay] || [];

  return (
    <div className="flex flex-col w-full gap-6 max-w-5xl mx-auto pb-12">
      {/* Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-container/60">
        <div>
          <div className="flex items-center gap-2 text-outline font-label-sm uppercase tracking-wider">
            <span>Academic Scheduler</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Timetable Scheduling & Generator</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
            Constraint-Based Timetable Generator
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-sm font-semibold">
            Role: Timetable-In-Charge
          </span>
          <button
            onClick={() => onNavigateTab("timetable-export")}
            className="flex items-center gap-1.5 bg-surface-container-lowest text-primary hover:bg-surface-container-low font-label-md px-3.5 py-1.5 rounded-xl border border-outline-variant/30 shadow-stitch-sm transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Top Configuration Matrix Card */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-stitch-sm border border-outline-variant/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">tune</span>
            <h2 className="font-title-md text-title-md text-on-surface font-bold">
              Configuration Matrix
            </h2>
          </div>
          <span className="font-label-sm text-secondary bg-secondary-fixed/50 px-2.5 py-0.5 rounded-full font-bold">
            AY 2024-25 • Term 1
          </span>
        </div>

        {/* Controls Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Department Selector */}
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold block">
              DEPARTMENT
            </label>
            <div className="relative">
              <select
                value={selectedDepartment || selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  onDepartmentChange?.(e.target.value);
                }}
                className="w-full h-11 bg-surface-container-low text-on-surface font-label-md rounded-xl pl-3.5 pr-9 appearance-none focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/30 font-semibold cursor-pointer"
              >
                <option value="Computer Science & IT">Computer Science & IT</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science">Data Science</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Semester & Division Quick Select */}
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold block">
              SEMESTER & DIVISION
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="flex-1 h-11 bg-surface-container-low text-on-surface font-label-md rounded-xl px-3 appearance-none focus:outline-none border border-outline-variant/30 font-semibold cursor-pointer"
              >
                <option value="Sem 1">Sem 1</option>
                <option value="Sem 3">Sem 3</option>
                <option value="Sem 5">Sem 5</option>
                <option value="Sem 7">Sem 7</option>
              </select>
              <select
                value={selectedDiv}
                onChange={(e) => setSelectedDiv(e.target.value)}
                className="w-24 h-11 bg-surface-container-low text-on-surface font-label-md rounded-xl px-3 appearance-none focus:outline-none border border-outline-variant/30 font-semibold cursor-pointer"
              >
                <option value="Div A">Div A</option>
                <option value="Div B">Div B</option>
                <option value="Div C">Div C</option>
              </select>
            </div>
          </div>

          {/* Course Name */}
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold block">
              COURSE NAME
            </label>
            <input
              type="text"
              value={courseName}
              onChange={updateConfig("courseName")}
              placeholder="e.g. B.Sc. Computer Science"
              className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface font-label-md rounded-xl border border-outline-variant/30 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
        </div>

        {/* Semester Duration + College Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold block">
              SEMESTER START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={updateConfig("startDate")}
              className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface font-label-md rounded-xl border border-outline-variant/30 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold block">
              SEMESTER END DATE
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={updateConfig("endDate")}
              className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface font-label-md rounded-xl border border-outline-variant/30 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold block">
              USUAL COLLEGE HOURS
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={collegeHoursStart}
                onChange={updateConfig("collegeHoursStart")}
                className="flex-1 h-11 px-3 bg-surface-container-low text-on-surface font-label-md rounded-xl border border-outline-variant/30 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
              />
              <span className="text-outline font-bold">–</span>
              <input
                type="time"
                value={collegeHoursEnd}
                min={collegeHoursStart || undefined}
                onChange={updateConfig("collegeHoursEnd")}
                className="flex-1 h-11 px-3 bg-surface-container-low text-on-surface font-label-md rounded-xl border border-outline-variant/30 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Derived Academic Cycle Summary */}
        <div className="h-11 bg-surface-container-low rounded-xl px-3.5 flex items-center justify-between border border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">calendar_view_week</span>
            <span className="font-label-md text-on-surface font-semibold">
              6 Days (Mon–Sat) • {formatWeeks(totalWeeks)} weeks total
            </span>
          </div>
          <span className="font-label-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded font-bold shadow-xs">
            {periodsPerDay > 0 ? `${periodsPerDay} Periods/day` : "Set college hours"}
          </span>
        </div>
      </section>

      {/* AI Generator Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary rounded-2xl p-6 sm:p-8 shadow-stitch-lg">
        {/* Decorative background glow and mesh */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-surface-container-lowest/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="material-symbols-outlined text-[18px] text-primary-fixed">auto_awesome</span>
              <span className="font-label-sm text-primary-fixed tracking-wider uppercase font-bold">
                AI Scheduling Engine v3.4
              </span>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed-dim opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-fixed" />
            </span>
          </div>

          <div>
            <h3 className="font-headline-md sm:font-headline-lg text-on-primary font-extrabold tracking-tight">
              Conflict-Free Timetable Generator
            </h3>
            <p className="font-body-md text-surface-container-highest/90 mt-1 max-w-2xl leading-relaxed">
              Solves teacher-room-subject constraints with zero collisions. Respects UGC 16–18 lecture hours workload norms, laboratory batch splits, and smartboard availability.
            </p>
          </div>

          {generationStep && (
            <div className="p-3 rounded-xl bg-surface-container-lowest/20 backdrop-blur-md border border-white/20 flex items-center gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-primary-fixed animate-spin">refresh</span>
              <span className="font-label-md text-on-primary font-semibold">{generationStep}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto h-12 px-8 bg-surface-container-lowest hover:bg-surface-container-lowest/90 active:scale-[0.98] transition-all text-primary font-label-lg rounded-xl shadow-stitch-md flex items-center justify-center gap-2 font-bold disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary">
                {isGenerating ? "sync" : "bolt"}
              </span>
              <span>{isGenerating ? "Synthesizing Schedule..." : "Generate Conflict-Free Timetable"}</span>
            </button>
          </div>

          {generationError && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container">
              <p className="font-label-md font-bold mb-1.5">
                The engine couldn't produce a conflict-free timetable:
              </p>
              <ul className="list-disc list-inside space-y-0.5 font-body-sm">
                {generationError.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Heuristic Audit Summary */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-stitch-sm border border-outline-variant/20">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">verified_user</span>
            <span className="font-title-md text-title-md text-on-surface font-bold">
              Heuristic Engine Audit
            </span>
          </div>
          <span className="font-label-sm text-secondary bg-secondary-fixed px-2.5 py-0.5 rounded-full font-bold">
            100% Solved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2.5 text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
            <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xs text-primary font-bold">check</span>
            </div>
            <span className="font-body-sm">
              <strong>0 Room Clashes</strong> across CS & IT wings
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
            <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xs text-primary font-bold">check</span>
            </div>
            <span className="font-body-sm">
              <strong>Faculty Balanced</strong> (Max 18 hrs/wk)
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
            <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xs text-secondary font-bold">alt_route</span>
            </div>
            <span className="font-body-sm text-on-surface-variant">
              Smart Room <strong>204 locked</strong> for Data Structures
            </span>
          </div>
        </div>
      </section>

      {/* Subjects & Faculty Allocation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Subjects & Faculty Workload Allocation
            </h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-primary-container text-on-primary hover:bg-primary px-3.5 py-1.5 rounded-xl font-label-md font-semibold shadow-stitch-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Add Subject</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-surface-container-lowest rounded-2xl p-4 shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-stitch-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-primary font-bold bg-surface-container-low px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                  </div>
                  <h3 className="font-title-md text-title-md text-on-surface font-bold mt-1.5">
                    {sub.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-body-sm text-on-surface-variant">{sub.faculty}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="font-label-sm text-secondary font-bold">
                      {sub.totalHours} hrs total
                      {weeklyHoursFor(sub.totalHours) !== null &&
                        ` (~${weeklyHoursFor(sub.totalHours).toFixed(1)}/wk)`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 bg-surface-container-low/50 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl border-t border-surface-container">
                <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md">
                  <span className="material-symbols-outlined text-[16px] text-primary">apartment</span>
                  <span>{sub.room}</span>
                </div>
                <span className="font-label-sm text-outline">{sub.division}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Weekly Preview */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-stitch-sm border border-outline-variant/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Weekly Master Timetable Preview
            </h2>
          </div>
          <span className="font-label-sm text-secondary bg-surface-container-low px-2.5 py-1 rounded-lg font-bold border border-outline-variant/30">
            Current Term Schedule
          </span>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-2 text-center rounded-lg font-label-md transition-all ${
                activeDay === day
                  ? "bg-primary text-on-primary shadow-stitch-sm font-bold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Timeline Slots */}
        <div className="space-y-3 pt-2">
          {currentDaySlots.length === 0 ? (
            <div className="text-center py-8 text-outline">
              <p className="font-label-md">No lecture sessions scheduled for {activeDay}.</p>
            </div>
          ) : (
            currentDaySlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/20 hover:bg-surface-container transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 shrink-0">
                    <span className="font-label-sm text-on-surface font-bold block">{slot.time.split(" - ")[0]}</span>
                    <span className="font-label-sm text-outline block">{slot.time.split(" - ")[1]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-on-surface font-bold">{slot.subject}</span>
                      <StatusBadge status={slot.type} size="sm" />
                    </div>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">
                      {slot.faculty} • {slot.division}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1 rounded-lg border border-outline-variant/30 font-label-md text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">meeting_room</span>
                    <span>{slot.room}</span>
                  </div>
                  <div className="font-label-sm text-on-surface-variant">
                    <strong>{slot.present}</strong>/{slot.total} Enrolled
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Subject & Workload Assignment"
        subtitle="Specify subject details, weekly lecture hours, and assigned professor"
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <div>
            <label className="font-label-sm text-on-surface font-semibold block mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cloud Computing & Microservices"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              className="w-full h-11 px-3 bg-surface-container-low rounded-xl border border-outline-variant/40 font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-sm text-on-surface font-semibold block mb-1">
                Subject Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS-505"
                value={newSubCode}
                onChange={(e) => setNewSubCode(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low rounded-xl border border-outline-variant/40 font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div>
              <label className="font-label-sm text-on-surface font-semibold block mb-1">
                Total Hours (This Semester)
              </label>
              <input
                type="number"
                min="1"
                value={newSubTotalHours}
                onChange={(e) => setNewSubTotalHours(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low rounded-xl border border-outline-variant/40 font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
              <p className="font-label-sm text-outline mt-1">
                {totalWeeks > 0
                  ? `≈ ${weeklyHoursPreview.toFixed(1)} hrs/week over ${formatWeeks(totalWeeks)} weeks`
                  : "Set the semester start/end dates above to see hrs/week"}
              </p>
            </div>
          </div>

          <div>
            <label className="font-label-sm text-on-surface font-semibold block mb-1">
              Assigned Faculty Member *
            </label>
            <select
              value={newSubFaculty}
              onChange={(e) => setNewSubFaculty(e.target.value)}
              className="w-full h-11 px-3 bg-surface-container-low rounded-xl border border-outline-variant/40 font-body-sm text-on-surface focus:outline-none cursor-pointer"
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.role} • {f.workload}/{f.maxWorkload}h)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-label-sm text-on-surface font-semibold block mb-1">
              Room / Lab No.
            </label>
            <select
              value={newSubRoom}
              onChange={(e) => setNewSubRoom(e.target.value)}
              className="w-full h-11 px-3 bg-surface-container-low rounded-xl border border-outline-variant/40 font-body-sm text-on-surface focus:outline-none cursor-pointer"
            >
              {roomsList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md font-bold shadow-stitch-sm transition-all"
            >
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
