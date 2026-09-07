from typing import Optional

from beanie import Document
from fastapi_users_db_beanie import BeanieBaseUser


class User(BeanieBaseUser, Document):
    """
    Extends fastapi-users' base user with fields specific to this app.

    role: one of "admin" | "faculty" | "student"
    is_committee_member: only meaningful when role == "student".
        Gates: posting announcements, viewing room/lab/ground availability
        for committee meetings.
    committee: optional — which committee the student belongs to, if any.
    department: department the user belongs to (used for filtering
        timetables, subjects, announcements, etc.)
    """

    role: str = "student"
    department: Optional[str] = None
    is_committee_member: bool = False
    committee: Optional[str] = None

    class Settings(BeanieBaseUser.Settings):
        name = "users"  # MongoDB collection name
