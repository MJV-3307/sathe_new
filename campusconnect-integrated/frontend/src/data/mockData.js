// CampusConnect Mock Database & Initial State

export const INITIAL_ROLES = {
  ADMIN: {
    id: "admin",
    name: "Dr. A. Kulkarni",
    title: "Head of Department",
    badge: "Department Admin",
    dept: "Computer Science & IT",
    avatar: "https://lh3.googleusercontent.com/aida/AEtjO1XWNvv-_cHnTWbTVOr5nfh2wq5wtoNz3Zetr2Kp3tgh5wvyAsYkoZfGM1cvdGiEomudcwVc1YhfjpSZtoX0zi2028QsJ78MYrPVoK7iYrnejdp5iA2VZ01kW4QdSuqMLndZjXsSsEzA5YjYCRT01Iv0G0yThj5KEz27_1w66_ob7ludfO3KnpRHdo_MYoLVEQx2LoVSiA3T7gPebqTMRR-isYCxYrpMtZViQJH8CJSCyNtMtkXCIWb4c9Y",
  },
  TIMETABLE: {
    id: "timetable",
    name: "Prof. S. Patil",
    title: "Timetable Convener",
    badge: "Timetable-In-Charge",
    dept: "Computer Science & IT",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQ-GNZ9r5qw2cfH15kMxNyPEY6rPknGcnU-Uz0sIZ2gBYeDsYLAHTEgF1NZ-9o8B19SzAyHN7mI90HLMVGZ60UMFsBd6grK_Pz991y041uV5eiBY0wa3-921pUgV6LCK43Om2iJXky_my0TTzc7425Yodo0ppvqFBAcNnsz3StFK4wffxhxt9jUZbqe8kTS61kc0JxxspUq7x_16rjWkRHmtpgMPNn7myKJ5-WAy1SxYV_sYC8h69mZA",
  },
  FACULTY: {
    id: "faculty",
    name: "Prof. Sneha Sharma",
    title: "Associate Professor",
    badge: "Faculty Member",
    dept: "Computer Science & IT",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlQqJM4gfMKYDl0J19CH9SCpzrcEuld9_seaWhTtIK7zSsfhKnFpzFLYprJTTGW11lpAzEjZIojiSQoI7OFPepGSNxTF6-J0GK1hfkip3M1FIwVwABS5UgrunHkDy-gwzjFXfFFdcs4WwUchbpRlDZQI5iEE33kLIva1TAsf7GhG4F8UbuCz6TNVaRzGTHGJ7rWN-KfxKWswQPKIf1EFdZxeJYikDrpqiT4zltESEbkYBsWapI6tVvLw",
  },
  STUDENT: {
    id: "student",
    name: "Rohan Deshmukh",
    title: "TY B.Sc. CS (Div A)",
    badge: "Student Representative",
    dept: "Computer Science & IT",
    avatar: "https://lh3.googleusercontent.com/aida/AEtjO1XWNvv-_cHnTWbTVOr5nfh2wq5wtoNz3Zetr2Kp3tgh5wvyAsYkoZfGM1cvdGiEomudcwVc1YhfjpSZtoX0zi2028QsJ78MYrPVoK7iYrnejdp5iA2VZ01kW4QdSuqMLndZjXsSsEzA5YjYCRT01Iv0G0yThj5KEz27_1w66_ob7ludfO3KnpRHdo_MYoLVEQx2LoVSiA3T7gPebqTMRR-isYCxYrpMtZViQJH8CJSCyNtMtkXCIWb4c9Y",
  },
};

export const INITIAL_SEMESTER_CONFIG = {
  courseName: "B.Sc. Computer Science",
  startDate: "2025-01-06",
  endDate: "2025-05-16",
  collegeHoursStart: "08:00",
  collegeHoursEnd: "17:00",
};

export const INITIAL_FACULTY = [
  { id: "f1", name: "Dr. A. Kulkarni", role: "Professor & HOD", workload: 12, maxWorkload: 16, status: "On Campus", subjects: ["Distributed AI", "Cloud Systems"] },
  { id: "f2", name: "Prof. Sneha Sharma", role: "Associate Professor", workload: 14, maxWorkload: 18, status: "On Campus (Room 204)", subjects: ["Data Structures", "Advanced DBMS"] },
  { id: "f3", name: "Prof. Rajesh Mehta", role: "Assistant Professor", workload: 15, maxWorkload: 18, status: "Medical Leave", subjects: ["Database Management Lab", "DBMS Theory"] },
  { id: "f4", name: "Prof. S. Patil", role: "Assistant Professor", workload: 16, maxWorkload: 18, status: "In Lecture", subjects: ["Software Engineering", "Object Oriented Design"] },
  { id: "f5", name: "Prof. V. Deshmukh", role: "Assistant Professor", workload: 12, maxWorkload: 18, status: "In Lab", subjects: ["Full Stack Architecture", "DevOps"] },
  { id: "f6", name: "Prof. M. Joshi", role: "Assistant Professor", workload: 10, maxWorkload: 18, status: "On Campus", subjects: ["Operating Systems", "Computer Networks"] },
];

export const INITIAL_SUBJECTS = [
  {
    id: "sub-1",
    name: "Data Structures & Algorithms",
    code: "CS-501",
    faculty: "Prof. Sneha Sharma",
    totalHours: 72,
    room: "Classroom 204",
    type: "Theory",
    division: "Sem 5 Div A",
  },
  {
    id: "sub-2",
    name: "Database Systems",
    code: "CS-302",
    faculty: "Prof. Rajesh Mehta",
    totalHours: 54,
    room: "Lab 2 (DBMS Suite)",
    type: "Theory + Lab",
    division: "Sem 3 Div A",
  },
  {
    id: "sub-3",
    name: "Software Engineering",
    code: "CS-503",
    faculty: "Prof. S. Patil",
    totalHours: 54,
    room: "Classroom 203",
    type: "Theory",
    division: "Sem 5 Div A",
  },
  {
    id: "sub-4",
    name: "Web Technology & Cloud Lab",
    code: "CS-504",
    faculty: "Dr. A. Kulkarni",
    totalHours: 72,
    room: "Lab 1 (Web Cluster)",
    type: "Practical",
    division: "Sem 5 Div A",
  },
  {
    id: "sub-5",
    name: "Distributed AI Systems",
    code: "IT-601",
    faculty: "Dr. A. Kulkarni",
    totalHours: 54,
    room: "Computer Lab 3",
    type: "Theory + Lab",
    division: "M.Sc. IT Part II",
  },
  {
    id: "sub-6",
    name: "Full Stack DevOps",
    code: "IT-502",
    faculty: "Prof. V. Deshmukh",
    totalHours: 54,
    room: "Seminar Hall 1",
    type: "Theory",
    division: "Sem 5 Combined",
  },
];

export const INITIAL_TIMETABLE = {
  Mon: [
    { id: "t-1", time: "09:00 AM - 10:00 AM", subject: "Data Structures", faculty: "Prof. Sneha Sharma", room: "Room 204", division: "Sem 5 Div A", type: "Ongoing", present: 58, total: 62 },
    { id: "t-2", time: "10:00 AM - 11:00 AM", subject: "Database Management Lab", faculty: "Prof. Rajesh Mehta", proxy: "Prof. Sneha Sharma", room: "Computer Lab 2", division: "Sem 3 Batch B1", type: "Proxy Required", present: 45, total: 48 },
    { id: "t-3", time: "11:30 AM - 01:30 PM", subject: "Full Stack Architecture & DevOps", faculty: "Prof. V. Deshmukh", room: "Seminar Hall 1", division: "Sem 5 B.Sc. IT", type: "Scheduled", present: 110, total: 110 },
    { id: "t-4", time: "02:00 PM - 03:00 PM", subject: "Software Engineering", faculty: "Prof. S. Patil", room: "Room 203", division: "Sem 5 Div A", type: "Scheduled", present: 60, total: 62 },
  ],
  Tue: [
    { id: "t-5", time: "09:00 AM - 10:00 AM", subject: "Web Technology Lab", faculty: "Dr. A. Kulkarni", room: "Computer Lab 1", division: "Sem 5 Div A", type: "Scheduled", present: 62, total: 62 },
    { id: "t-6", time: "10:00 AM - 11:00 AM", subject: "Data Structures", faculty: "Prof. Sneha Sharma", room: "Room 204", division: "Sem 5 Div A", type: "Scheduled", present: 61, total: 62 },
    { id: "t-7", time: "11:30 AM - 12:30 PM", subject: "Computer Networks", faculty: "Prof. M. Joshi", room: "Room 201", division: "Sem 5 Div A", type: "Scheduled", present: 59, total: 62 },
    { id: "t-8", time: "01:30 PM - 03:30 PM", subject: "Distributed AI & Cloud", faculty: "Dr. A. Kulkarni", room: "Lab 3 (High-Spec)", division: "M.Sc. IT Part II", type: "Scheduled", present: 24, total: 24 },
  ],
  Wed: [
    { id: "t-9", time: "09:00 AM - 10:00 AM", subject: "Operating Systems", faculty: "Prof. M. Joshi", room: "Room 202", division: "Sem 5 Div A", type: "Scheduled", present: 57, total: 62 },
    { id: "t-10", time: "10:00 AM - 12:00 PM", subject: "DBMS SQL Practicals", faculty: "Prof. Rajesh Mehta", room: "Computer Lab 2", division: "Sem 3 Batch B2", type: "Scheduled", present: 48, total: 48 },
    { id: "t-11", time: "01:00 PM - 02:00 PM", subject: "Software Engineering", faculty: "Prof. S. Patil", room: "Room 203", division: "Sem 5 Div A", type: "Scheduled", present: 60, total: 62 },
  ],
  Thu: [
    { id: "t-12", time: "09:00 AM - 11:00 AM", subject: "Web Cluster Project", faculty: "Dr. A. Kulkarni", room: "Lab 1 (Web Cluster)", division: "Sem 5 Div A", type: "Scheduled", present: 62, total: 62 },
    { id: "t-13", time: "11:30 AM - 12:30 PM", subject: "Data Structures Tutorial", faculty: "Prof. Sneha Sharma", room: "Room 204", division: "Sem 5 Div A", type: "Scheduled", present: 62, total: 62 },
    { id: "t-14", time: "02:00 PM - 04:00 PM", subject: "Capstone Mentorship", faculty: "Prof. Sneha Sharma", room: "Room 206", division: "Final Year Cohort", type: "Scheduled", present: 20, total: 20 },
  ],
  Fri: [
    { id: "t-15", time: "09:00 AM - 10:00 AM", subject: "Advanced Algorithms", faculty: "Prof. Sneha Sharma", room: "Computer Lab 3", division: "M.Sc. IT Part I", type: "Scheduled", present: 30, total: 30 },
    { id: "t-16", time: "10:00 AM - 11:00 AM", subject: "DevOps CI/CD Pipeline", faculty: "Prof. V. Deshmukh", room: "Seminar Hall 1", division: "Sem 5 IT", type: "Scheduled", present: 105, total: 110 },
    { id: "t-17", time: "11:30 AM - 12:30 PM", subject: "Ethical Hacking & Security", faculty: "Prof. S. Patil", room: "Room 203", division: "Sem 5 Div A", type: "Scheduled", present: 61, total: 62 },
  ],
  Sat: [
    { id: "t-18", time: "09:00 AM - 11:00 AM", subject: "Industry Guest Lecture & Seminar", faculty: "Visiting Faculty", room: "Seminar Hall 1", division: "Combined CS & IT", type: "Scheduled", present: 140, total: 150 },
    { id: "t-19", time: "11:30 AM - 01:00 PM", subject: "Remedial & Doubts Clinic", faculty: "Prof. Sneha Sharma", room: "Room 204", division: "Sem 5 Div A", type: "Scheduled", present: 28, total: 35 },
  ],
};

export const INITIAL_ROOMS = [
  { id: "C-101", name: "Classroom 101", type: "Classroom", wing: "Wing C Ground Floor", capacity: 70, status: "FREE", sensorId: "S-101", equipment: ["Smartboard", "Projector", "Mic Rig"] },
  { id: "C-102", name: "Classroom 102", type: "Classroom", wing: "Wing C Ground Floor", capacity: 70, status: "OCCUPIED", sensorId: "S-102", currentSession: "Applied Maths • Prof. Gore", equipment: ["Projector"] },
  { id: "C-103", name: "Classroom 103", type: "Classroom", wing: "Wing C Ground Floor", capacity: 60, status: "OCCUPIED", sensorId: "S-103", currentSession: "Digital Electronics • Prof. Rao", equipment: ["Smartboard"] },
  { id: "C-104", name: "Classroom 104", type: "Classroom", wing: "Wing C Ground Floor", capacity: 60, status: "FREE", sensorId: "S-104", equipment: ["Projector"] },
  { id: "C-201", name: "Classroom 201", type: "Classroom", wing: "Wing C 2nd Floor", capacity: 65, status: "FREE", sensorId: "S-201", equipment: ["Projector", "Air Conditioned"] },
  { id: "C-202", name: "Classroom 202", type: "Classroom", wing: "Wing C 2nd Floor", capacity: 65, status: "FREE", sensorId: "S-202", equipment: ["Smartboard"] },
  { id: "C-203", name: "Classroom 203", type: "Classroom", wing: "Wing C 2nd Floor", capacity: 70, status: "OCCUPIED", sensorId: "S-203", currentSession: "Pending DBMS Proxy • Sem 3", equipment: ["Projector", "Sound System"] },
  { id: "C-204", name: "Classroom 204", type: "Classroom", wing: "Wing C 2nd Floor", capacity: 75, status: "OCCUPIED", sensorId: "S-204", currentSession: "Data Structures • Prof. Sharma", equipment: ["Smartboard", "Biometric Terminal", "Dual Projectors"] },
  
  // Computer Labs
  { id: "L-01", name: "Computer Lab 1 (Web Cluster)", type: "Lab", wing: "IT Block 1st Floor", capacity: 40, status: "FREE", sensorId: "S-L01", equipment: ["40 High-End Workstations", "Gigabit LAN"] },
  { id: "L-02", name: "Computer Lab 2 (DBMS Suite)", type: "Lab", wing: "IT Block 1st Floor", capacity: 45, status: "OCCUPIED", sensorId: "S-L02", currentSession: "Oracle 19c Practical • Batch B1", equipment: ["Oracle Cloud VMs", "UPS Backup"] },
  { id: "L-03", name: "Computer Lab 3 (High-Spec AI)", type: "Lab", wing: "IT Block 2nd Floor", capacity: 35, status: "OCCUPIED", sensorId: "S-L03", currentSession: "Distributed AI • Dr. Kulkarni", equipment: ["NVIDIA RTX Workstations", "Dual Monitors"] },
  { id: "L-04", name: "Computer Lab 4 (IoT & Embedded)", type: "Lab", wing: "IT Block 2nd Floor", capacity: 30, status: "FREE", sensorId: "S-L04", equipment: ["Raspberry Pi Kits", "Oscilloscopes"] },

  // Halls & Grounds
  { id: "SH-01", name: "Seminar Hall 1", type: "Hall", wing: "Central Quadrangle", capacity: 180, status: "MAINTENANCE", sensorId: "S-SH1", currentSession: "AV Calibration for 11:30 DevOps Session", equipment: ["Surround Sound", "Dual Stage Projector"] },
  { id: "GT-01", name: "Gymkhana Turf 1 (Main Football)", type: "Ground", wing: "Sports Complex", capacity: 300, status: "FREE", sensorId: "S-GT1", equipment: ["Floodlights", "Track Perimeter"] },
  { id: "GT-02", name: "Gymkhana Turf 2 (Box Cricket/Volley)", type: "Ground", wing: "Sports Complex", capacity: 150, status: "OCCUPIED", sensorId: "S-GT2", currentSession: "Inter-Collegiate Practice", equipment: ["Net Enclosure"] },
];

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: "lr-1",
    facultyId: "f3",
    facultyName: "Prof. Rajesh Mehta",
    date: "Today (Period 2)",
    slot: "10:00 AM – 11:00 AM",
    subject: "DBMS Theory",
    room: "Room 203",
    division: "Sem 3 Div A",
    reason: "Emergency Medical Leave (Civil Hospital certificate attached)",
    priority: "Priority 1",
    status: "PENDING_PROXY",
    recommendedProxy: "Prof. Sneha Sharma",
    proxyWorkload: "14/18 hrs",
    proxyClashes: 0,
  },
  {
    id: "lr-2",
    facultyId: "f4",
    facultyName: "Prof. S. Patil",
    date: "Sep 12, 2026",
    slot: "Full Day",
    subject: "Software Engineering",
    room: "Room 203",
    division: "Sem 5 Div A",
    reason: "Faculty Development Program (IIT Bombay)",
    priority: "Standard",
    status: "APPROVED",
    assignedProxy: "Prof. V. Deshmukh",
  },
];

export const INITIAL_AUDIT_LOGS = [
  { id: "a-1", type: "error", title: "Medical Leave Submitted by Prof. Mehta", desc: "Civil Hospital certificate attached • Emergency triage active", time: "15 mins ago" },
  { id: "a-2", type: "secondary", title: "Heuristic Clash Solver Finished Sem 5 Batch B", desc: "Room 204 locked for Data Structures with zero overlaps", time: "1 hour ago" },
  { id: "a-3", type: "primary", title: "Notice Dispatched: Internal Assessment Schedule", desc: "Delivered to 420 TY Students app feed and notice board", time: "3 hours ago" },
  { id: "a-4", type: "info", title: "Winter 2024 Exam Hall Allotment 80% Complete", desc: "Block allocations approved by Exam Cell Dean", time: "4 hours ago" },
  { id: "a-5", type: "success", title: "Biometric Attendance Sync Completed", desc: "1,420 students accounted across CS, IT & Data Science divisions", time: "5 hours ago" },
];

export const INITIAL_FEEDBACK_METRICS = {
  overall: 4.8,
  totalReviews: 420,
  satisfactionRate: 96,
  breakdown: [
    { label: "Subject Matter Delivery & Clarity", score: 4.9, max: 5.0, percent: 98 },
    { label: "Doubts Resolution & Practical Labs", score: 4.7, max: 5.0, percent: 94 },
    { label: "Punctuality & Lecture Discipline", score: 4.9, max: 5.0, percent: 98 },
    { label: "Syllabus Completion & Depth", score: 4.8, max: 5.0, percent: 96 },
  ],
  facultyScores: [
    { name: "Dr. A. Kulkarni", role: "HOD & Professor", rating: 4.9, reviews: 142, tag: "NAAC Grade A++" },
    { name: "Prof. Sneha Sharma", role: "Associate Professor", rating: 4.8, reviews: 128, tag: "Top Rated CS" },
    { name: "Prof. S. Patil", role: "Assistant Professor", rating: 4.7, reviews: 96, tag: "High Clarity" },
    { name: "Prof. V. Deshmukh", role: "Assistant Professor", rating: 4.7, reviews: 88, tag: "Lab Excellence" },
    { name: "Prof. Rajesh Mehta", role: "Assistant Professor", rating: 4.6, reviews: 110, tag: "Consistent" },
  ],
};
