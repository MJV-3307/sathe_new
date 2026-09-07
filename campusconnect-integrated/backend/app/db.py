import os

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.models.faculty import Faculty
from app.models.leave_request import LeaveRequest
from app.models.room import Room
from app.models.subject import Subject
from app.models.timetable import Timetable
from app.models.user import User

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "faculty_scheduler")


async def init_db() -> None:
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(
        database=client[MONGO_DB_NAME],
        document_models=[
            User,
            Faculty,
            Room,
            Subject,
            Timetable,
            LeaveRequest,
            # Add other Beanie Document classes here as they're built:
            # FeedbackMetric, Announcement
        ],
    )
