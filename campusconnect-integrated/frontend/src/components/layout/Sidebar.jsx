import React from "react";

export default function Sidebar({ currentTab, onTabChange, isMobileOpen, onCloseMobile }) {
  const academicNav = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "scheduling-engine", label: "Scheduling Engine", icon: "auto_schedule" },
    { id: "my-timetable", label: "My Timetable", icon: "calendar_month" },
    { id: "faculty-and-staff", label: "Faculty & Staff", icon: "badge" },
    { id: "leave-and-substitutions", label: "Leave & Substitutions", icon: "event_busy" },
  ];

  const intelligenceNav = [
    { id: "campus-availability", label: "Campus Availability (IoT)", icon: "sensors" },
    { id: "feedback-analytics", label: "Feedback Analytics", icon: "analytics" },
    { id: "timetable-export", label: "Export & Print Schedule", icon: "print" },
  ];

  const handleNavClick = (id) => {
    onTabChange(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-surface-container-lowest shadow-stitch-card z-50 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between bg-surface-container-low border-b border-surface-container/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none truncate">
                  CampusConnect
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
                  Sathaye College ERP
                </span>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Academic Year Info Banner */}
          <div className="px-4 py-3">
            <div className="bg-surface-container-high rounded-xl p-2.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">calendar_today</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  AY 2024-25 • Term 1
                </span>
              </div>
              <span className="bg-primary-container text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
                Odd Sem
              </span>
            </div>
          </div>

          {/* Nav List: Academic Operations */}
          <div className="px-4 pb-1.5 pt-1">
            <p className="px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Academic Operations
            </p>
          </div>
          <nav className="px-3 space-y-1">
            {academicNav.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-lg text-label-lg transition-all ${
                    isActive
                      ? "bg-primary-container text-on-primary font-semibold shadow-stitch-md"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Nav List: Campus Intelligence */}
            <div className="pt-4 pb-1.5 px-3">
              <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Campus Intelligence
              </p>
            </div>
            {intelligenceNav.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-lg text-label-lg transition-all ${
                    isActive
                      ? "bg-primary-container text-on-primary font-semibold shadow-stitch-md"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-surface-container-low border-t border-surface-container/60">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-sm text-label-sm text-outline font-medium">
                Sathaye ERP v4.2
              </span>
            </div>
            <span className="font-label-sm text-[10px] bg-secondary-fixed text-on-secondary-fixed-variant px-1.5 py-0.5 rounded font-bold">
              LIVE
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
