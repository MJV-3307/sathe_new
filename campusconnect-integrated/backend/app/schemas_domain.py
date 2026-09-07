"""Request/response schemas for the domain routers (faculty, subjects,
rooms, timetable, leave). Kept separate from app/schemas.py, which is
reserved for fastapi-users' auth schemas.
"""
from typing import Optional

from pydantic import BaseModel


class SlotIn(BaseModel):
    day: int
    period: int


class FacultyIn(BaseModel):
    name: str
    department: str
    subject_ids: list[str] = []
    unavailable: list[SlotIn] = []
    max_classes_per_day: int = 6
    user_id: Optional[str] = None


class FacultyOut(FacultyIn):
    id: str


class RoomIn(BaseModel):
    name: str
    type: str
    capacity: int
    status: str = "available"


class RoomOut(RoomIn):
    id: str


class SubjectIn(BaseModel):
    name: str
    department: str
    semester: str
    faculty_id: str
    hours_per_week: int
    requires_lab: bool = False
    student_count: int = 0


class SubjectOut(SubjectIn):
    id: str


class TimetableEntryOut(BaseModel):
    day: int
    period: int
    subject_id: str
    faculty_id: str
    room_id: str
    semester: str


class TimetableOut(BaseModel):
    id: str
    department: str
    semester: str
    entries: list[TimetableEntryOut]
    is_published: bool


class GenerateRequest(BaseModel):
    department: str
    semester: str
    days: int = 6
    periods_per_day: int = 9
    break_periods: list[int] = []


class MoveEntryRequest(BaseModel):
    department: str
    semester: str
    target: TimetableEntryOut
    new_day: int
    new_period: int
    new_room_id: Optional[str] = None
    new_faculty_id: Optional[str] = None


class PublishRequest(BaseModel):
    department: str
    semester: str


class ConflictResponse(BaseModel):
    reasons: list[str]


class LeaveRequestIn(BaseModel):
    faculty_id: str
    faculty_name: str
    reason: str
    slot_label: str
    day: int
    period: int


class LeaveRequestOut(LeaveRequestIn):
    id: str
    status: str
    recommended_proxy: Optional[str] = None
    assigned_proxy: Optional[str] = None


class AssignProxyRequest(BaseModel):
    proxy_name: str
