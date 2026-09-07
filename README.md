# Faculty Scheduler & Resource Management Platform

A web platform for college faculty and students to manage timetables, leave/substitutions, room & lab availability, student feedback, and department announcements — built as a **React** frontend backed by a **Python (FastAPI) + MongoDB** API handling auth, timetable generation, and all other data-heavy logic.

---

## 1. Project Overview

This platform centralizes several recurring administrative headaches for a college department:

- Generating a semester timetable given subjects, hours/week, and teacher assignments.
- Letting faculty download their personal/department timetable.
- Consolidating student feedback per faculty per semester for the admin.
- Automatically finding a free faculty member to substitute when someone goes on leave.
- Tracking real-time availability of classrooms, labs, and grounds.

React serves as the user-facing portal (login, dashboards, forms, notifications), while a Python service (Flask/FastAPI) handles auth, timetable generation, substitution logic, and any ML-assisted scheduling — talking to MongoDB for flexible, schedule-shaped data. The two communicate purely over a REST API, so they can be developed, deployed, and scaled independently.

---

## 2. Core Features

### 2.1 Timetable Scheduling
- Timetable-in-charge inputs: subjects, semester duration, hours/week per subject, department, and assigned teacher.
- Backend generates a conflict-free timetable (no teacher/room double-booking) for the semester.
- Output stored in MongoDB and exposed to WordPress via API.

### 2.2 Timetable Download
- Faculty can view and download their timetable (PDF/Excel) from their React dashboard.

### 2.3 Faculty Feedback Consolidation
- Students submit feedback for faculty each semester (not faculty-to-faculty).
- Consolidated reports/rankings are routed to the admin, who checks and ranks feedback — not shown publicly, and not visible to the faculty member being reviewed or to other students.

### 2.4 Leave & Substitution Management
- Faculty applies for leave for a given date/time slot.
- System cross-references the generated timetable to find faculty who are free at that slot.
- Sends a notification/request to eligible faculty to take the substitution (accept/decline flow).

### 2.5 Room / Lab / Ground Availability
- Real-time occupancy status for classrooms, labs, and grounds.
- Faculty or admins can toggle status (occupied/free); status updates dynamically across the site.

### 2.6 Announcements
- Displays college/department-relevant announcements from different committees (workshops, events, hackathons, etc.) and faculty announcements (industrial visits, holiday notices, etc.).
- Shown on the dashboard so faculty and students stay updated without checking separate channels.
- Faculty and students flagged as committee members (`is_committee_member = true`) can post announcements; non-committee students have view-only access.

### 2.7 Room/Availability Access for Committee Meetings
- Students flagged as committee members can view classroom/lab/ground availability specifically to schedule committee meetings.
- Non-committee students do not have access to this availability view.

---

## 3. Proposed Architecture

```
┌─────────────────────┐      REST API      ┌──────────────────────────┐
│       React SPA        │  <──────────────>  │   Python Service (API)    │
│  (frontend + auth UI +  │                     │   Flask / FastAPI         │
│   dashboards + forms)   │                     │  - Auth (JWT)              │
│                          │                     │  - Timetable generation   │
│  Talks directly to the   │                     │  - Substitution matching  │
│  Python API over REST    │                     │  - Availability logic     │
│                          │                     │  - (optional) ML models   │
└─────────────────────┘                     └───────────┬──────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │     MongoDB        │
                                                 │  Subjects, Faculty, │
                                                 │  Timetables,        │
                                                 │  Feedback, Rooms,   │
                                                 │  Leave/Substitution │
                                                 └──────────────────┘
```

**Why this split:**
- React: full control over UI/UX for role-based dashboards (faculty/admin/timetable-in-charge) without paid themes/plugins; component-based, so features like the availability board or leave requests can be built as reusable, live-updating widgets.
- Python + MongoDB: timetable generation is a constraint-satisfaction / scheduling problem — better suited to Python's scheduling/optimization libraries (and MongoDB's flexible document model for irregular schedule data) than a CMS's native storage.
- Communication happens purely over a REST API (with JWT-based auth), keeping frontend and backend fully decoupled — no bridging plugin needed.

---

## 4. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | User portal — dashboards, forms, notifications, live availability board |
| Backend API | Python — Flask or FastAPI | Auth, timetable generation, substitution matching, availability logic |
| Database | MongoDB | Stores subjects, faculty, timetables, feedback, room/lab status, leave records |
| Scheduling logic | Python (constraint-based; optionally ML-assisted) | Core timetable generation algorithm |
| Auth | `fastapi-users` (JWT-based, MongoDB via Beanie) | Registration, login, password hashing, JWT issuance/verification, role-based access (Admin, Faculty, Student — with `is_committee_member` flag gating extra permissions) |
| File export | e.g. `python-docx`/`reportlab`/`openpyxl` | Timetable download as PDF/Excel |
| Real-time updates | WebSockets (e.g. `flask-socketio`/FastAPI WebSockets) or polling | Dynamic room/lab/ground status updates |

*(To be finalized as we go: exact FastAPI vs Flask choice, hosting, and whether ML is used for optimization or just rule-based scheduling to start.)*

---

## 5. User Roles

- **Admin** — checks and ranks student feedback, updates faculty subjects, generates/alters the timetable.
- **Faculty** — makes announcements, updates their own leave schedule (triggers substitution matching), views/downloads their timetable.
- **Student** — single login/role. At registration, specifies whether they are a **committee member** (via an `is_committee_member` flag, optionally with a `committee` name). All students can submit faculty feedback and view announcements. Committee-member students additionally get: posting announcements, and viewing classroom/lab/ground availability for scheduling committee meetings. Non-committee students don't see these options.

*(Note: a "Timetable In-Charge" role was referenced earlier in planning as a sub-responsibility for timetable generation — this is now folded into the Admin role above, since generating/altering the timetable is listed as an Admin responsibility. Flag if you intended this to be a separate role.)*

---

## 6. High-Level Data Model (Draft)

- `subjects` — subject name, department, hours/week, semester
- `faculty` — name, department, subjects taught, availability
- `students` — name, department, is_committee_member (bool, set at registration), committee (if applicable)
- `timetables` — semester, department, generated schedule (day/slot → subject/faculty/room)
- `feedback` — submitting student ID, faculty ID, semester, feedback/score (visible only to admin — not to faculty or other students)
- `leave_requests` — faculty ID, date/slot, status, assigned substitute
- `rooms` — room/lab/ground ID, type, current status (occupied/free), last updated — availability visible to faculty and students with `is_committee_member = true`
- `announcements` — title, description, posted_by (faculty ID or committee-member student ID), category (workshop/event/hackathon/holiday/industrial visit/etc.), department relevance, date posted — postable by faculty and committee-member students; view-only for non-committee students

*(Draft — will be refined into full schemas in a later step.)*

---

## 7. Project Status

🟡 **Planning stage** — this README is the starting point. Next steps (not yet started):
- Finalize data schemas for MongoDB collections.
- Decide Flask vs FastAPI.
- Design the timetable generation algorithm (rule-based vs. constraint solver vs. ML-assisted).
- Scaffold the React app structure (routing, role-based dashboards, API client).
- Define the REST API contract between React and the Python service.

---

## 8. Repository Structure (Proposed)

```
faculty-scheduler/
├── frontend/                 # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/             # dashboards per role
│   │   ├── api/                # API client calls to backend
│   │   └── App.jsx
│   └── package.json
├── backend/                  # Flask/FastAPI service
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/           # timetable generation, substitution logic
│   │   └── db.py               # MongoDB connection
│   └── requirements.txt
├── docs/                     # Design docs, schema diagrams
└── README.md
```

---

## 9. Getting Started

*(To be filled in once the backend and plugin scaffolding exist.)*

```bash
# Backend (placeholder)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload   # if FastAPI
# or: flask run                 # if Flask
```

```bash
# Frontend (placeholder)
cd frontend
npm install
npm start
```
