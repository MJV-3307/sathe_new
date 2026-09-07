// Bridges the real backend's plain domain records (Mongo ids, engine day/
// period numbers) to the shape the existing dashboard components already
// render. Kept in one place so the mock-data shape only has to be matched
// here, not re-derived in every component.

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function facultyFromApi(apiFaculty, subjectsById = {}) {
  return apiFaculty.map((f) => ({
    id: f.id,
    name: f.name,
    role: f.department,
    workload: 0,
    maxWorkload: f.max_classes_per_day * DAY_NAMES.length,
    status: "On Campus",
    subjects: f.subject_ids.map((id) => subjectsById[id]?.name).filter(Boolean),
  }));
}

export function roomsFromApi(apiRooms) {
  return apiRooms.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type === "classroom" ? "Classroom" : r.type,
    wing: "",
    capacity: r.capacity,
    status: (r.status || "available").toUpperCase(),
    equipment: [],
  }));
}

export function subjectsFromApi(apiSubjects, facultyById = {}, roomsById = {}) {
  return apiSubjects.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.id.slice(-6).toUpperCase(),
    faculty: facultyById[s.faculty_id]?.name || s.faculty_id,
    totalHours: s.hours_per_week,
    room: s.requires_lab ? "Lab (assigned by engine)" : "Classroom (assigned by engine)",
    type: s.requires_lab ? "Theory + Lab" : "Theory",
    division: `${s.department} • ${s.semester}`,
  }));
}

// Converts the engine's flat (day, period) entries into the { Mon: [...],
// Tue: [...] } grid the Timetable/Export/Student dashboards expect.
export function timetableFromApi(apiTimetable, { facultyById = {}, subjectsById = {}, roomsById = {} } = {}) {
  const grid = Object.fromEntries(DAY_NAMES.map((d) => [d, []]));
  for (const e of apiTimetable.entries) {
    const dayName = DAY_NAMES[e.day] ?? `Day ${e.day}`;
    if (!grid[dayName]) grid[dayName] = [];
    grid[dayName].push({
      id: `${e.day}-${e.period}-${e.subject_id}`,
      time: `Period ${e.period}`,
      subject: subjectsById[e.subject_id]?.name || e.subject_id,
      faculty: facultyById[e.faculty_id]?.name || e.faculty_id,
      room: roomsById[e.room_id]?.name || e.room_id,
      division: subjectsById[e.subject_id]?.division || apiTimetable.department,
      type: apiTimetable.is_published ? "Scheduled" : "Draft",
      present: 0,
      total: 0,
    });
  }
  for (const day of Object.keys(grid)) {
    grid[day].sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));
  }
  return grid;
}

export function byId(list) {
  return Object.fromEntries(list.map((item) => [item.id, item]));
}
