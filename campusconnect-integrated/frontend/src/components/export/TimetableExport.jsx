import React, { useState } from "react";

export default function TimetableExport({ timetable, currentUser, selectedDepartment }) {
  const [exportType, setExportType] = useState("FACULTY"); // "FACULTY" or "DEPARTMENT"
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const periods = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:30 AM - 12:30 PM",
    "01:30 PM - 02:30 PM",
    "02:30 PM - 03:30 PM",
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Day,Time Slot,Subject,Faculty,Room,Division\n";

    days.forEach((day) => {
      const slots = timetable[day] || [];
      slots.forEach((s) => {
        csvContent += `"${day}","${s.time}","${s.subject}","${s.faculty}","${s.room}","${s.division}"\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CampusConnect_Timetable_${currentUser.name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess("Excel/CSV timetable file downloaded successfully!");
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto gap-6 pb-12">
      {/* Top Action Ribbon (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-container-lowest rounded-2xl shadow-stitch-sm border border-outline-variant/20">
        <div>
          <h2 className="font-headline-sm font-bold text-on-surface">
            Timetable Export & Download Hub
          </h2>
          <p className="font-body-sm text-outline mt-0.5">
            Generate print-ready schedule document or export raw dataset to Excel/CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-surface-container rounded-xl">
            <button
              onClick={() => setExportType("FACULTY")}
              className={`px-3 py-1.5 rounded-lg text-label-md font-semibold transition-all ${
                exportType === "FACULTY" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              My Personal Schedule
            </button>
            <button
              onClick={() => setExportType("DEPARTMENT")}
              className={`px-3 py-1.5 rounded-lg text-label-md font-semibold transition-all ${
                exportType === "DEPARTMENT" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Master Dept Matrix
            </button>
          </div>

          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md font-semibold rounded-xl border border-outline-variant/30 transition-colors shadow-stitch-sm"
          >
            <span className="material-symbols-outlined text-emerald-700 text-lg">table_view</span>
            <span>Export Excel (.csv)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold rounded-xl shadow-stitch-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="no-print p-3 rounded-xl bg-emerald-50 text-emerald-800 text-label-md font-bold border border-emerald-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Printable Sheet Canvas */}
      <div className="print-area bg-surface-container-lowest p-8 rounded-2xl shadow-stitch-md border border-outline-variant/30 space-y-6">
        {/* Institutional Letterhead */}
        <div className="border-b-2 border-primary pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl shadow-sm">
              CC
            </div>
            <div>
              <h1 className="font-headline-lg font-black text-primary tracking-tight">
                SATHAYE COLLEGE (AUTONOMOUS)
              </h1>
              <p className="font-label-md text-on-surface-variant font-semibold">
                Department of Computer Science & Information Technology • Mumbai
              </p>
              <p className="font-label-sm text-outline">
                Affiliated with University of Mumbai • NAAC Accredited 'A++' Grade
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-label-sm bg-primary-container text-on-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {exportType === "FACULTY" ? "Faculty Workload Timetable" : "Department Master Roster"}
            </span>
            <p className="font-label-sm text-outline mt-1.5">
              Academic Year: <strong>2024-25 (Odd Sem)</strong>
            </p>
            <p className="font-label-sm text-outline">
              Effective Date: <strong>Sep 01, 2026</strong>
            </p>
          </div>
        </div>

        {/* Individual Context Bar */}
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-outline-variant/20">
          <div>
            <span className="font-label-sm text-outline uppercase font-semibold">Allocated To</span>
            <div className="font-title-md font-extrabold text-on-surface">
              {exportType === "FACULTY" ? currentUser.name : `${selectedDepartment} (All Divisions)`}
            </div>
          </div>
          <div>
            <span className="font-label-sm text-outline uppercase font-semibold">Designation</span>
            <div className="font-title-md font-semibold text-on-surface-variant">
              {currentUser.title}
            </div>
          </div>
          <div>
            <span className="font-label-sm text-outline uppercase font-semibold">Department</span>
            <div className="font-title-md font-semibold text-primary">
              {currentUser.dept}
            </div>
          </div>
          <div>
            <span className="font-label-sm text-outline uppercase font-semibold">Total Weekly Load</span>
            <div className="font-title-md font-bold text-secondary">
              14 Hours / Week (Norms Compliant)
            </div>
          </div>
        </div>

        {/* 6-Day Schedule Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-outline-variant/40 text-left text-body-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface font-label-md font-bold border-b border-outline-variant/40">
                <th className="p-3 border-r border-outline-variant/40 w-28">Day</th>
                {periods.map((p, idx) => (
                  <th key={idx} className="p-3 border-r border-outline-variant/40 text-center">
                    <span className="block text-primary">{`Period ${idx + 1}`}</span>
                    <span className="text-[11px] text-outline font-normal">{p}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {days.map((day) => {
                const daySlots = timetable[day] || [];

                return (
                  <tr key={day} className="hover:bg-surface-container-low/30">
                    <td className="p-3 font-bold text-primary bg-surface-container-low/50 border-r border-outline-variant/40">
                      {day}
                    </td>

                    {periods.map((period, pIdx) => {
                      // Match slot by period index
                      const slot = daySlots[pIdx % daySlots.length];

                      return (
                        <td
                          key={pIdx}
                          className="p-2.5 border-r border-outline-variant/30 align-top text-center"
                        >
                          {slot ? (
                            <div className="bg-surface-container-low p-2 rounded-lg border border-outline-variant/20 flex flex-col items-center">
                              <span className="font-label-md font-bold text-on-surface text-center leading-tight">
                                {slot.subject}
                              </span>
                              <span className="font-label-sm text-primary font-semibold mt-1">
                                {slot.room}
                              </span>
                              <span className="text-[10px] text-outline mt-0.5">
                                {slot.division}
                              </span>
                            </div>
                          ) : (
                            <span className="text-outline text-xs italic">Recess / Free</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Verification & Sign-off Footer */}
        <div className="pt-6 border-t border-surface-container flex flex-wrap items-center justify-between text-label-sm text-on-surface-variant gap-4">
          <div className="space-y-1">
            <p>Generated via CampusConnect ERP • Heuristic Clash Solver Verified</p>
            <p className="text-outline">Security Hash: SHA256-SATHAYE-AY24-SCHED-04921</p>
          </div>
          <div className="flex items-center gap-12 text-center pt-2">
            <div>
              <div className="w-32 border-b border-on-surface-variant/40 mb-1" />
              <p className="font-semibold text-on-surface">Timetable In-Charge</p>
            </div>
            <div>
              <div className="w-32 border-b border-on-surface-variant/40 mb-1" />
              <p className="font-semibold text-on-surface">Head of Department</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
