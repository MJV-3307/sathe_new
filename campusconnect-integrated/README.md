# CampusConnect — Faculty Scheduler

One integrated system, combining what were three separate, disconnected pieces:

1. **`frontend/`** — the React/Vite dashboard (admin, faculty, student, timetable
   scheduling UI). Previously ran entirely on mock data in `src/data/mockData.js`.
2. **`backend/`** — the FastAPI + MongoDB service that already had auth, roles,
   and user management (via `fastapi-users`), but no domain data or routes.
3. **`timetable_engine.py`** — a framework-free conflict-detection/generation
   module that existed on its own, wired into nothing.

## What changed to combine them

- **Backend**: added Beanie documents (`Faculty`, `Room`, `Subject`,
  `Timetable`, `LeaveRequest`), a service layer
  (`app/services/timetable_service.py`) that adapts those documents to/from
  the engine's dataclasses, and routers (`/faculty`, `/rooms`, `/subjects`,
  `/timetable`, `/leave`) that expose it all through the existing
  role-gated auth. The timetable engine now uses deterministic constraint
  backtracking instead of the old greedy-only placement, so it can recover
  from early placement choices that would otherwise make a valid schedule
  look impossible.
- **Frontend**: added a real API client (`src/api/`), a `Login` screen wired
  to the backend's JWT auth, and an `AuthContext`. Once logged in, the app
  fetches real faculty/rooms/subjects/leave-requests from the backend
  instead of mock data, and the "Generate Conflict-Free Timetable" button
  now calls the real engine via `POST /timetable/generate` — including
  showing the engine's actual conflict reasons if generation fails.
- If the backend isn't running, the frontend falls back to a **demo mode**
  (bundled mock data, no login required) rather than breaking, so you can
  still preview the UI standalone.

## Running it

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set JWT_SECRET to a random string, point MONGO_URI at your Mongo instance
```

You need a MongoDB instance reachable at `MONGO_URI` (a local `mongod`, or
Atlas). Then create the first admin account:

```bash
python -m app.scripts.create_admin
```

Start the API:

```bash
uvicorn app.main:app --reload
```

It comes up on `http://localhost:8000`. Interactive API docs at
`http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:8000
npm run dev
```

Opens on `http://localhost:5173`. Log in with the admin account you just
created, or click **"Continue in demo mode"** to preview the UI without a
backend at all.

### 3. Seed scheduler data (recommended)

The engine reads its inputs from MongoDB; React mock subjects are not engine
data. To create a ready-to-generate CS & IT Sem 5 dataset, run from `backend/`:

```bash
python -m app.scripts.seed_scheduler_demo
```

This creates/upserts faculty, rooms and subjects in the `faculty_scheduler`
database. Subjects are stored in the MongoDB **`subjects`** collection. You can
also create subjects manually through Swagger at `POST /subjects`; the UI's
**+ Add Subject** button now persists new subjects to that same collection
instead of keeping them only in React state.

After seeding/logging in, open **Scheduling Engine → Sem 5 → Generate
Conflict-Free Timetable**. The selected department/semester are now sent to
the backend (the old frontend hard-coded Sem 5 and could send the wrong
department), and generation uses 6 days / 9 periods by default with period 5
as the lunch break.

## Notable design decisions / known gaps

- **Semester is hard-coded to `"Sem 5"`** in the frontend's generate/publish
  calls (`App.jsx`) — there's no semester selector in the current UI. Swap
  in a real selector when that's built; the backend already accepts any
  semester string.
- **Room/Faculty/Subject IDs are MongoDB ObjectIds**, not the human-readable
  codes (`"f1"`, `"C-101"`) the original mock data used. The UI adapter
  (`src/utils/liveDataAdapter.js`) maps names back in for display, but
  anything that hard-coded a mock ID (e.g. a few `LeaveAndSubstitutions`
  demo interactions) will only make sense in demo mode, not live mode.
- The generator is now a deterministic CSP/backtracking solver with an MRV
  (most-restricted-first) heuristic. It still reports concrete reasons when
  the requested constraints are genuinely infeasible.
- **Auth is required for all domain routes** (`current_active_user` at
  minimum). There's no anonymous/student self-registration flow — accounts
  are created by an admin via `POST /auth/register`, exactly as the
  original backend's comments describe.
