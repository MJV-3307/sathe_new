import React from "react";

export default function StatusBadge({ status, label, size = "md" }) {
  let colorClasses = "bg-surface-container text-on-surface-variant";
  let dotColor = null;

  switch (status?.toUpperCase()) {
    case "FREE":
    case "AVAILABLE":
    case "APPROVED":
    case "PRESENT":
    case "SUCCESS":
      colorClasses = "bg-emerald-50 text-emerald-700 border border-emerald-200";
      dotColor = "bg-emerald-500";
      break;
    case "OCCUPIED":
    case "IN_USE":
    case "ONGOING":
      colorClasses = "bg-blue-50 text-blue-700 border border-blue-200";
      dotColor = "bg-blue-600";
      break;
    case "PENDING":
    case "PENDING_PROXY":
    case "PROXY REQUIRED":
    case "PRIORITY 1":
      colorClasses = "bg-amber-50 text-amber-800 border border-amber-200";
      dotColor = "bg-amber-500";
      break;
    case "CRITICAL":
    case "ERROR":
    case "MEDICAL LEAVE":
      colorClasses = "bg-red-50 text-red-700 border border-red-200";
      dotColor = "bg-red-600";
      break;
    case "MAINTENANCE":
      colorClasses = "bg-purple-50 text-purple-700 border border-purple-200";
      dotColor = "bg-purple-600";
      break;
    case "SCHEDULED":
      colorClasses = "bg-surface-container-high text-on-surface-variant";
      dotColor = "bg-outline";
      break;
    default:
      colorClasses = "bg-surface-container text-on-surface-variant";
  }

  const sizeClasses = size === "sm" 
    ? "text-[11px] px-2 py-0.5" 
    : "text-label-sm px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${colorClasses}`}>
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span>{label || status}</span>
    </span>
  );
}
