from typing import Optional

from beanie import Document
from pydantic import BaseModel


class SlotOut(BaseModel):
    day: int
    period: int


class Faculty(Document):
    """A faculty member as scheduled by the timetable engine.

    Distinct from `User` (login identity/role). A Faculty record may be
    linked to a User via `user_id` once that person has an account, but
    can exist on its own (e.g. seeded before the person ever logs in).
    """

    name: str
    department: str
    subject_ids: list[str] = []
    unavailable: list[SlotOut] = []
    max_classes_per_day: int = 6
    user_id: Optional[str] = None

    class Settings:
        name = "faculty"
