from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Must run before any app.* import that reads env vars at module load
# time (app.users reads JWT_SECRET as soon as it's imported).
load_dotenv()

from fastapi import Depends, FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from app.db import init_db  # noqa: E402
from app.dependencies.roles import (  # noqa: E402
    require_admin,
    require_committee_member,
    require_faculty,
    require_student,
)
from app.models.user import User  # noqa: E402
from app.routers.faculty import router as faculty_router  # noqa: E402
from app.routers.leave import router as leave_router  # noqa: E402
from app.routers.rooms import router as rooms_router  # noqa: E402
from app.routers.subjects import router as subjects_router  # noqa: E402
from app.routers.timetable import router as timetable_router  # noqa: E402
from app.routers.users import router as users_router  # noqa: E402
from app.schemas import UserCreate, UserRead  # noqa: E402
from app.users import auth_backend, current_active_user, fastapi_users  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Faculty Scheduler API", lifespan=lifespan)

# React dev server origin(s) — add your deployed frontend origin too.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth routes (provided by fastapi-users) ---
# POST /auth/jwt/login, POST /auth/jwt/logout
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
# POST /auth/register — admin only. Faculty/student/admin accounts are all
# created by an admin, not via public self-signup. The very first admin
# account is created via app/scripts/create_admin.py instead (see that file).
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
    dependencies=[Depends(require_admin)],
)
# GET /users/me, PATCH /users/me — self-service
# GET/PATCH/DELETE /users/{id} — admin only (gated by role == "admin", not
# fastapi-users' built-in is_superuser flag — see app/routers/users.py)
app.include_router(users_router, prefix="/users", tags=["users"])

# --- Domain routes: wire the frontend's data + the timetable_engine in ---
app.include_router(faculty_router, prefix="/faculty", tags=["faculty"])
app.include_router(rooms_router, prefix="/rooms", tags=["rooms"])
app.include_router(subjects_router, prefix="/subjects", tags=["subjects"])
app.include_router(timetable_router, prefix="/timetable", tags=["timetable"])
app.include_router(leave_router, prefix="/leave", tags=["leave"])


@app.get("/whoami")
async def whoami(user: User = Depends(current_active_user)):
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "is_committee_member": user.is_committee_member,
    }


@app.get("/admin/ping")
async def admin_ping(user: User = Depends(require_admin)):
    return {"message": f"Hello Admin {user.email}"}


@app.get("/committee/ping")
async def committee_ping(user: User = Depends(require_committee_member)):
    return {"message": f"Hello committee member {user.email}"}


@app.get("/faculty/ping")
async def faculty_ping(user: User = Depends(require_faculty)):
    return {"message": f"Hello Faculty {user.email}"}


@app.get("/student/ping")
async def student_ping(user: User = Depends(require_student)):
    return {"message": f"Hello Student {user.email}"}
