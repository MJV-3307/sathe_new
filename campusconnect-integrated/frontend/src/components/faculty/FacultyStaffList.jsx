import React from "react";
import StatusBadge from "../common/StatusBadge";

export default function FacultyStaffList({ facultyList }) {
  return (
    <div className="flex flex-col w-full gap-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-container/60">
        <div>
          <div className="flex items-center gap-2 text-outline font-label-sm uppercase tracking-wider">
            <span>Faculty Roster</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Faculty & Staff Workload Matrix</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
            Department Teaching Faculty Directory
          </h1>
        </div>

        <span className="bg-surface-container-high text-on-surface-variant font-label-sm px-3 py-1 rounded-full font-semibold">
          {facultyList.length} Registered Professors
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facultyList.map((f) => {
          const loadPercent = Math.round((f.workload / f.maxWorkload) * 100);
          return (
            <div
              key={f.id}
              className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-stitch-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-title-md font-bold text-on-surface">{f.name}</h3>
                    <p className="font-body-sm text-on-surface-variant">{f.role}</p>
                  </div>
                  <StatusBadge status={f.status} size="sm" />
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between font-label-sm text-on-surface">
                    <span>Weekly Workload</span>
                    <span className="font-bold text-primary">
                      {f.workload} / {f.maxWorkload} Hours
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        loadPercent > 90 ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-outline">UGC Norms Compliant (&lt; 18h)</span>
                </div>

                <div className="mt-3 pt-3 border-t border-surface-container">
                  <span className="font-label-sm text-outline block mb-1 font-semibold">
                    Core Subjects
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {f.subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-md font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
