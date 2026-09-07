import React from "react";

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const roles = [
    { id: "ADMIN", label: "Admin", icon: "admin_panel_settings" },
    { id: "TIMETABLE", label: "Timetable In-Charge", icon: "auto_schedule" },
    { id: "FACULTY", label: "Faculty", icon: "school" },
    { id: "STUDENT", label: "Student", icon: "person" },
  ];

  return (
    <div className="flex items-center p-1 bg-surface-container rounded-xl shadow-inner">
      {roles.map((role) => {
        const isActive = currentRole === role.id;
        return (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-semibold transition-all duration-200 ${
              isActive
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{role.icon}</span>
            <span>{role.label}</span>
          </button>
        );
      })}
    </div>
  );
}
