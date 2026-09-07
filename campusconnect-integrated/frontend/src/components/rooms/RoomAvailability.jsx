import React, { useState } from "react";
import StatusBadge from "../common/StatusBadge";

export default function RoomAvailability({ rooms, onToggleRoomStatus }) {
  const [filterType, setFilterType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter((r) => {
    const matchesType = filterType === "ALL" || r.type.toUpperCase() === filterType;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.wing.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const total = rooms.length;
  const freeCount = rooms.filter((r) => r.status === "FREE").length;
  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
  const maintenanceCount = rooms.filter((r) => r.status === "MAINTENANCE").length;

  return (
    <div className="flex flex-col w-full gap-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-container/60">
        <div>
          <div className="flex items-center gap-2 text-outline font-label-sm uppercase tracking-wider">
            <span>Campus Intelligence</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">IoT Venue & Space Monitor</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
            Real-Time Room, Lab & Ground Availability
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/30">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-sm font-bold text-on-surface">
            {rooms.length * 2 + 6} IoT Sensors Streaming Live
          </span>
        </div>
      </div>

      {/* Spatial Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-label-sm uppercase text-outline font-semibold">Total Venues</span>
          <div className="font-display-sm text-display-sm font-extrabold text-on-surface mt-1">
            {total}
          </div>
          <span className="font-label-sm text-on-surface-variant mt-1">Classrooms & Labs</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-label-sm uppercase text-emerald-700 font-semibold">Currently Vacant</span>
          <div className="font-display-sm text-display-sm font-extrabold text-emerald-600 mt-1">
            {freeCount}
          </div>
          <span className="font-label-sm text-emerald-700 mt-1">Ready for instant booking</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-label-sm uppercase text-blue-700 font-semibold">In Active Session</span>
          <div className="font-display-sm text-display-sm font-extrabold text-blue-600 mt-1">
            {occupiedCount}
          </div>
          <span className="font-label-sm text-blue-700 mt-1">Lectures or Practicals</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-label-sm uppercase text-purple-700 font-semibold">Maintenance</span>
          <div className="font-display-sm text-display-sm font-extrabold text-purple-600 mt-1">
            {maintenanceCount}
          </div>
          <span className="font-label-sm text-purple-700 mt-1">AV Tuning or Inspection</span>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-stitch-sm border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "All Venues" },
            { id: "CLASSROOM", label: "Smart Classrooms" },
            { id: "LAB", label: "Computer Labs" },
            { id: "GROUND", label: "Sports & Turf" },
            { id: "HALL", label: "Seminar Halls" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-label-md transition-all ${
                filterType === tab.id
                  ? "bg-primary text-on-primary font-bold shadow-stitch-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search venue or wing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-surface-container-low rounded-xl border border-outline-variant/30 font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          let statusBorder = "border-outline-variant/20";
          if (room.status === "FREE") statusBorder = "border-emerald-200 bg-emerald-50/10";
          if (room.status === "OCCUPIED") statusBorder = "border-blue-200 bg-blue-50/10";
          if (room.status === "MAINTENANCE") statusBorder = "border-purple-200 bg-purple-50/10";

          return (
            <div
              key={room.id}
              className={`bg-surface-container-lowest rounded-2xl p-5 shadow-stitch-sm border ${statusBorder} flex flex-col justify-between hover:shadow-stitch-md transition-all`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                        {room.id}
                      </span>
                      <span className="font-label-sm text-outline font-semibold">
                        ({room.type})
                      </span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold mt-1">
                      {room.name}
                    </h3>
                  </div>
                  <StatusBadge status={room.status} />
                </div>

                <p className="font-body-sm text-on-surface-variant mt-1.5">
                  {room.wing} • Capacity: <strong>{room.capacity} seats</strong>
                </p>

                {room.currentSession && (
                  <div className="mt-3 p-2.5 rounded-xl bg-surface-container-low text-body-sm text-on-surface border border-outline-variant/30 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">info</span>
                    <span className="truncate">{room.currentSession}</span>
                  </div>
                )}

                {/* Equipment chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {room.equipment?.map((eq, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-md font-medium"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Toggle Buttons */}
              <div className="mt-5 pt-3 border-t border-surface-container flex items-center justify-between">
                <span className="font-label-sm text-outline">Toggle Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleRoomStatus(room.id, "FREE")}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all ${
                      room.status === "FREE"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-surface-container-low text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => onToggleRoomStatus(room.id, "OCCUPIED")}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all ${
                      room.status === "OCCUPIED"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-surface-container-low text-blue-800 hover:bg-blue-100"
                    }`}
                  >
                    In Use
                  </button>
                  <button
                    onClick={() => onToggleRoomStatus(room.id, "MAINTENANCE")}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all ${
                      room.status === "MAINTENANCE"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-surface-container-low text-purple-800 hover:bg-purple-100"
                    }`}
                  >
                    Maint.
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
