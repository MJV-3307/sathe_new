"""Seed a usable CampusConnect scheduling dataset.

Run from backend/:
    python -m app.scripts.seed_scheduler_demo

The data is inserted/upserted into MongoDB, not kept in React mock state, so
POST /timetable/generate can actually consume it.
"""
import asyncio
import os

from dotenv import load_dotenv
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.models.faculty import Faculty
from app.models.room import Room
from app.models.subject import Subject

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "faculty_scheduler")

DEPARTMENT = "Computer Science & IT"
SEMESTER = "Sem 5"

FACULTY = [
    ("Dr. A. Kulkarni", 6),
    ("Prof. Sneha Sharma", 6),
    ("Prof. S. Patil", 6),
    ("Prof. V. Deshmukh", 6),
    ("Prof. M. Joshi", 6),
]
ROOMS = [
    ("Room 201", "classroom", 70),
    ("Room 203", "classroom", 70),
    ("Room 204", "classroom", 70),
    ("Room 205", "classroom", 70),
    ("Computer Lab 1", "lab", 70),
    ("Computer Lab 2", "lab", 70),
]

SUBJECTS = [
    ("Data Structures & Algorithms", "Prof. Sneha Sharma", 4, False),
    ("Database Systems", "Prof. S. Patil", 4, False),
    ("Software Engineering", "Dr. A. Kulkarni", 3, False),
    ("Web Technology Lab", "Prof. V. Deshmukh", 4, True),
    ("Computer Networks", "Prof. M. Joshi", 3, False),
]

async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(database=client[MONGO_DB_NAME], document_models=[Faculty, Room, Subject])

    faculty_by_name = {}
    for name, max_per_day in FACULTY:
        doc = await Faculty.find_one(Faculty.name == name, Faculty.department == DEPARTMENT)
        if doc is None:
            doc = Faculty(name=name, department=DEPARTMENT, max_classes_per_day=max_per_day)
        else:
            doc.max_classes_per_day = max_per_day
        await doc.save()
        faculty_by_name[name] = doc

    for name, room_type, capacity in ROOMS:
        doc = await Room.find_one(Room.name == name)
        if doc is None:
            doc = Room(name=name, type=room_type, capacity=capacity, status="available")
        else:
            doc.type, doc.capacity, doc.status = room_type, capacity, "available"
        await doc.save()

    subject_docs = []
    for name, faculty_name, hours, requires_lab in SUBJECTS:
        faculty = faculty_by_name[faculty_name]
        doc = await Subject.find_one(
            Subject.name == name,
            Subject.department == DEPARTMENT,
            Subject.semester == SEMESTER,
        )
        if doc is None:
            doc = Subject(
                name=name,
                department=DEPARTMENT,
                semester=SEMESTER,
                faculty_id=str(faculty.id),
                hours_per_week=hours,
                requires_lab=requires_lab,
                student_count=60,
            )
        else:
            doc.faculty_id = str(faculty.id)
            doc.hours_per_week = hours
            doc.requires_lab = requires_lab
            doc.student_count = 60
        await doc.save()
        subject_docs.append(doc)

    # Keep the faculty -> subject relationship in sync for the UI/workload view.
    for faculty in faculty_by_name.values():
        faculty.subject_ids = [str(s.id) for s in subject_docs if s.faculty_id == str(faculty.id)]
        await faculty.save()

    print(f"Seeded {len(faculty_by_name)} faculty, {len(ROOMS)} rooms and {len(subject_docs)} subjects")
    print(f"Department: {DEPARTMENT} | Semester: {SEMESTER}")
    print("Subjects are stored in MongoDB collection: subjects")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
