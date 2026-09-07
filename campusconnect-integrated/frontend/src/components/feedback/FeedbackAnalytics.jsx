import React from "react";

export default function FeedbackAnalytics({ feedbackMetrics, onNavigateTab }) {
  return (
    <div className="flex flex-col w-full gap-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-container/60">
        <div>
          <div className="flex items-center gap-2 text-outline font-label-sm uppercase tracking-wider">
            <span>Admin Consolidation</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Feedback Analytics (NAAC Criterion II)</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
            Faculty Feedback & Academic Performance Consolidation
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-label-sm font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-amber-600">lock</span>
            <span>Admin-Only Confidential</span>
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-3.5 py-1.5 rounded-xl font-label-md font-semibold shadow-stitch-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Export NAAC Audit</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-label-sm text-outline uppercase font-semibold">
            Institutional Teaching Index
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display-sm text-display-sm text-primary font-black">
              {feedbackMetrics.overall}
            </span>
            <span className="font-title-md text-on-surface-variant font-semibold">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-primary mt-2">
            <span className="material-symbols-outlined text-lg fill">star</span>
            <span className="material-symbols-outlined text-lg fill">star</span>
            <span className="material-symbols-outlined text-lg fill">star</span>
            <span className="material-symbols-outlined text-lg fill">star</span>
            <span className="material-symbols-outlined text-lg fill">star_half</span>
          </div>
          <p className="font-label-sm text-outline mt-3">
            {feedbackMetrics.totalReviews} verified student submissions • Odd Semester
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-label-sm text-outline uppercase font-semibold">
            Student Satisfaction Benchmark
          </span>
          <div className="font-display-sm text-display-sm text-secondary font-black mt-2">
            {feedbackMetrics.satisfactionRate}%
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-700"
              style={{ width: `${feedbackMetrics.satisfactionRate}%` }}
            />
          </div>
          <p className="font-label-sm text-secondary font-bold mt-3">
            Exceeds NAAC A++ Threshold (85%)
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-label-sm text-outline uppercase font-semibold">
            Feedback Completion Rate
          </span>
          <div className="font-display-sm text-display-sm text-on-surface font-black mt-2">
            91.4%
          </div>
          <p className="font-body-sm text-on-surface-variant mt-2">
            1,298 out of 1,420 registered undergraduates completed mandatory semester feedback forms.
          </p>
          <span className="font-label-sm text-outline mt-3">Zero non-compliance flags</span>
        </div>
      </div>

      {/* Metric Breakdown Progress */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-stitch-sm border border-outline-variant/20 space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          Criterion II: Core Evaluation Attributes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {feedbackMetrics.breakdown.map((b, idx) => (
            <div key={idx} className="space-y-1.5 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
              <div className="flex justify-between items-center">
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  {b.label}
                </span>
                <span className="font-title-md text-primary font-extrabold">
                  {b.score} / {b.max}
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full transition-all duration-700"
                  style={{ width: `${b.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-label-sm text-outline pt-1">
                <span>{b.percent}% Approval Rating</span>
                <span>Tier 1 Score</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Faculty Consolidated Ratings Table */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-stitch-sm border border-outline-variant/20 overflow-hidden">
        <div className="p-6 border-b border-surface-container flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Faculty-Wise Consolidated Index (Admin Only)
            </h2>
            <p className="font-body-sm text-outline mt-0.5">
              Individual teaching effectiveness scores routed exclusively to Head of Department and Dean.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider border-b border-surface-container">
                <th className="py-3 px-6">Faculty Member</th>
                <th className="py-3 px-6">Designation</th>
                <th className="py-3 px-6">Student Rating</th>
                <th className="py-3 px-6">Reviews Count</th>
                <th className="py-3 px-6">Accreditation Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-sm text-on-surface font-medium">
              {feedbackMetrics.facultyScores.map((f, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-primary">{f.name}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{f.role}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-on-surface">
                      <span className="material-symbols-outlined text-sm text-primary fill">star</span>
                      <span>{f.rating} / 5.0</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">{f.reviews} verified</td>
                  <td className="py-4 px-6">
                    <span className="font-label-sm px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-bold">
                      {f.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
