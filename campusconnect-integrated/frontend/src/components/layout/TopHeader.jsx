import React, { useState } from "react";

export default function TopHeader({ 
  currentRoleUser, 
  onOpenMobileSidebar,
  selectedDepartment,
  onDepartmentChange,
  notificationCount = 2,
  onOpenNotifications,
  onSignOut
}) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-stitch-card z-40 flex items-center justify-between px-4 sm:px-8 gap-4">
      {/* Left: Mobile hamburger + Department Dropdown */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Department Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl shadow-stitch-sm border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-lg">domain</span>
          <select 
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer pr-1"
          >
            <option value="Computer Science & IT">Computer Science & IT</option>
            <option value="B.Sc. Information Tech">B.Sc. Information Tech</option>
            <option value="Commerce & Accountancy">Commerce & Accountancy</option>
            <option value="Arts & Media Studies">Arts & Media Studies</option>
            <option value="Administrative Wing">Administrative Wing</option>
          </select>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, faculty, rooms (Ctrl+K)..."
            className="w-full h-10 pl-9 pr-12 bg-surface rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all border border-outline-variant/30"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 font-label-sm text-[10px] bg-surface-container px-1.5 py-0.5 rounded-md text-on-surface-variant border border-outline-variant/40 shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Active Role Badge, Notifications, User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Role Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span className="font-label-sm text-label-sm text-on-surface font-semibold">
            {currentRoleUser.badge}
          </span>
        </div>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="View notifications"
        >
          <span className="material-symbols-outlined text-xl leading-none">notifications</span>
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-on-error rounded-full text-[9px] flex items-center justify-center font-bold">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Profile Info */}
        <div className="flex items-center gap-3 pl-1 sm:pl-2 border-l border-surface-container">
          <img
            src={currentRoleUser.avatar}
            alt={currentRoleUser.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-fixed shadow-sm"
          />
          <div className="hidden xl:flex flex-col text-left min-w-0">
            <span className="font-label-md text-label-md text-on-surface leading-tight font-semibold truncate max-w-[130px]">
              {currentRoleUser.name}
            </span>
            <span className="font-label-sm text-[11px] text-outline leading-tight truncate max-w-[130px]">
              {currentRoleUser.title}
            </span>
          </div>
        </div>

        {onSignOut && (
          <button
            onClick={onSignOut}
            aria-label="Sign out"
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl leading-none">logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
