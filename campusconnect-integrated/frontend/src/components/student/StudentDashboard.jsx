import React from "react";
import StatusBadge from "../common/StatusBadge";

export default function StudentDashboard({ currentUser, timetable, onNavigateTab }) {
  const todayClasses = timetable.Mon || [];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-6 pb-12">
      {/* Student Welcome Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary-fixed text-primary font-bold flex items-center justify-center text-xl shadow-xs ring-2 ring-primary-fixed">
            RD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md font-extrabold text-on-surface">
                Hello, {currentUser.name}
              </h1>
              <span className="text-xl">🎓</span>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              TY B.Sc. Computer Science (Div A) • Roll No: 42 • AY 2024-25
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab("timetable-export")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-stitch-sm hover:bg-primary-container transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          <span>Download Class Timetable</span>
        </button>
      </div>

      {/* Attendance & Class Pulse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20">
          <span className="font-label-sm text-outline uppercase font-semibold">Cumulative Attendance</span>
          <div className="font-display-sm font-extrabold text-emerald-600 mt-1">
            93.8%
          </div>
          <p className="font-label-sm text-emerald-700 mt-1 font-semibold">Above 75% Mandatory Hall-Ticket Norm</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20">
          <span className="font-label-sm text-outline uppercase font-semibold">Lectures Today</span>
          <div className="font-display-sm font-extrabold text-primary mt-1">
            4 Sessions
          </div>
          <p className="font-label-sm text-on-surface-variant mt-1">09:00 AM to 03:00 PM</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20">
          <span className="font-label-sm text-outline uppercase font-semibold">Term Assessment</span>
          <div className="font-display-sm font-extrabold text-secondary mt-1">
            Oct 14
          </div>
          <p className="font-label-sm text-outline mt-1">Internal Exam Timetable Released</p>
        </div>
      </div>

      {/* Today's Lectures */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm font-bold text-on-surface">
            My Lectures Today (Monday)
          </h2>
          <span className="font-label-sm bg-surface-container-high text-on-surface px-2.5 py-1 rounded-full font-semibold">
            Odd Sem Cycle
          </span>
        </div>

        <div className="space-y-3">
          {todayClasses.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-low p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/20 hover:bg-surface-container transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-24 shrink-0">
                  <span className="font-label-sm font-bold text-on-surface block">{item.time.split(" - ")[0]}</span>
                  <span className="font-label-sm text-outline block">{item.time.split(" - ")[1]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-title-md font-bold text-on-surface">{item.subject}</span>
                    <StatusBadge status={item.type} size="sm" />
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    Faculty: <strong>{item.faculty}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="bg-surface-container-lowest px-3 py-1 rounded-lg text-label-md font-semibold text-primary border border-outline-variant/30">
                  {item.room}
                </span>
                <span className="text-emerald-700 font-label-sm font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Marked Present
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Feedback CTA Card */}
      <div className="bg-gradient-to-r from-primary to-secondary text-on-primary p-6 rounded-2xl shadow-stitch-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-sm font-bold">Mandatory Mid-Term Faculty Feedback</h3>
          <p className="font-body-sm text-surface-container-highest mt-1">
            Help improve teaching quality. All student submissions are 100% anonymous.
          </p>
        </div>
        <button
          onClick={() => alert("Student Feedback Form submitted anonymously to Dean's office.")}
          className="px-5 py-2.5 bg-surface-container-lowest text-primary hover:bg-surface-container-lowest/90 rounded-xl font-label-md font-bold shadow-stitch-sm shrink-0 active:scale-95 transition-all"
        >
          Submit Anonymous Feedback
        </button>
      </div>
    </div>
  );
}
