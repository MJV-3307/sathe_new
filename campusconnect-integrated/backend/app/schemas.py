from typing import Optional

from beanie import PydanticObjectId
from fastapi_users import schemas


class UserRead(schemas.BaseUser[PydanticObjectId]):
    role: str
    department: Optional[str] = None
    is_committee_member: bool = False
    committee: Optional[str] = None


class UserCreate(schemas.BaseUserCreate):
    # Sensible default: anyone can self-register as a student.
    # Admin/faculty accounts should be created by an admin, not this
    # public endpoint — see note in app/users.py's on_after_register.
    role: str = "student"
    department: Optional[str] = None
    is_committee_member: bool = False
    committee: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    role: Optional[str] = None
    department: Optional[str] = None
    is_committee_member: Optional[bool] = None
    committee: Optional[str] = None
