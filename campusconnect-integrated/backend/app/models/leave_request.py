from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import Field


class LeaveRequest(Document):
    faculty_id: str
    faculty_name: str
    reason: str
    slot_label: str  # human-readable slot description, e.g. "Mon P2"
    day: int
    period: int
    status: str = "PENDING_PROXY"  # PENDING_PROXY | APPROVED | DECLINED
    recommended_proxy: Optional[str] = None
    assigned_proxy: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "leave_requests"
