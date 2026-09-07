import React, { useState } from "react";
import StatusBadge from "../common/StatusBadge";

export default function LeaveAndSubstitutions({
  leaveRequests,
  facultyList,
  onAssignProxy,
  onApproveLeave
}) {
  const [filter, setFilter] = useState("ALL");
  const [assignNotice, setAssignNotice] = useState(null);

  const filteredLeaves = leaveRequests.filter((lr) => {
    if (filter === "PENDING") return lr.status === "PENDING_PROXY";
    if (filter === "APPROVED") return lr.status === "APPROVED";
    return true;
  });

  const handleAssign = (id, proxyName) => {
    onAssignProxy(id, proxyName);
    setAssignNotice(`Proxy successfully confirmed for ${proxyName}!`);
    setTimeout(() => setAssignNotice(null), 4000);
  };

  return (
    <div className="flex flex-col w-full gap-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-container/60">
        <div>
          <div className="flex items-center gap-2 text-outline font-label-sm uppercase tracking-wider">
            <span>Academic Operations</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Leave & Substitution Dispatch</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
            Automated Faculty Substitution Engine
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-surface-container-high text-on-surface-variant font-label-sm px-3 py-1 rounded-full font-semibold">
            {leaveRequests.filter(l => l.status === "PENDING_PROXY").length} Triage Pending
          </span>
        </div>
      </div>

      {assignNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-label-md font-bold border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{assignNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["ALL", "PENDING", "APPROVED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl font-label-md transition-all ${
              filter === tab
                ? "bg-primary text-on-primary font-bold shadow-stitch-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {tab === "ALL" ? "All Requests" : tab === "PENDING" ? "Requires Proxy" : "Approved & Substituted"}
          </button>
        ))}
      </div>

      {/* Leave Cards */}
      <div className="space-y-4">
        {filteredLeaves.map((lr) => (
          <div
            key={lr.id}
            className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col gap-4 hover:shadow-stitch-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  lr.status === "PENDING_PROXY" ? "bg-error text-on-error" : "bg-emerald-600 text-white"
                }`}>
                  <span className="material-symbols-outlined text-2xl">
                    {lr.status === "PENDING_PROXY" ? "person_off" : "how_to_reg"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-title-md text-title-md font-bold text-on-surface">
                      {lr.facultyName}
                    </h3>
                    <StatusBadge status={lr.status} />
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    Slot: <strong>{lr.slot}</strong> • {lr.date}
                  </p>
                  <p className="font-body-sm text-outline mt-0.5">
                    Lecture: <span className="text-primary font-semibold">{lr.subject}</span> ({lr.room}, {lr.division})
                  </p>
                  <p className="font-body-sm text-on-surface mt-1 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30">
                    Reason: <em>{lr.reason}</em>
                  </p>
                </div>
              </div>

              <span className="font-label-sm px-2.5 py-1 rounded-md bg-surface-container-low font-bold text-on-surface-variant shrink-0 self-start">
                {lr.priority}
              </span>
            </div>

            {/* Proxy Section */}
            {lr.status === "PENDING_PROXY" && (
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-label-sm font-bold flex items-center justify-center">
                    AI
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md font-bold text-on-surface">
                        Heuristic Recommended Substitute: {lr.recommendedProxy}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm px-2 py-0.5 rounded-full font-bold">
                        Free Slot
                      </span>
                    </div>
                    <p className="font-label-sm text-outline">
                      Zero clashes detected • Workload: {lr.proxyWorkload}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAssign(lr.id, lr.recommendedProxy)}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md font-bold shadow-stitch-sm active:scale-95 transition-all"
                  >
                    Confirm & Dispatch Proxy
                  </button>
                </div>
              </div>
            )}

            {lr.status === "APPROVED" && lr.assignedProxy && (
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <span className="font-label-md text-emerald-800">
                  Proxy accepted and confirmed by <strong>{lr.assignedProxy}</strong>. Timetable updated.
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
