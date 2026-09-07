from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import BaseModel


class TimetableEntry(BaseModel):
    day: int
    period: int
    subject_id: str
    faculty_id: str
    room_id: str
    semester: str


class Timetable(Document):
    """The current working (and, once published, live) timetable for a
    department/semester. One document per (department, semester) so
    generation for one cohort never touches another's schedule.
    """

    department: str
    semester: str
    entries: list[TimetableEntry] = []
    is_published: bool = False
    generated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

    class Settings:
        name = "timetables"

    @staticmethod
    def now() -> datetime:
        return datetime.now(timezone.utc)
