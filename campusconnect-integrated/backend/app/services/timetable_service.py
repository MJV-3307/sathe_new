"""Adapts Beanie documents to the framework-free timetable_engine and back.

Keeps app/timetable_engine.py importable and unit-testable with zero
FastAPI/Beanie knowledge, per the note at the top of that module.
"""
from __future__ import annotations

from app.models.faculty import Faculty
from app.models.room import Room
from app.models.subject import Subject
from app.models.timetable import Timetable, TimetableEntry
from app.timetable_engine import (
    ConflictError,
    Entry,
    FacultyInfo,
    GenerationError,
    RoomInfo,
    Slot,
    SubjectRequirement,
    conflicts_for_candidate,
    generate_timetable,
    move_entry,
    publish,
    validate_timetable,
)

__all__ = [
    "ConflictError",
    "GenerationError",
    "generate_for_department",
    "revalidate",
    "move_timetable_entry",
    "publish_timetable",
]


async def _ensure_scheduler_data(department: str, subject_docs: list[Subject], faculty_docs: list[Faculty], room_docs: list[Room]) -> tuple[list[Faculty], list[Room]]:
    """Repair common demo/database drift so generation is self-healing.

    Older UI data could contain faculty ObjectIds that no longer exist, and a
    fresh MongoDB could contain no rooms at all. The scheduler should not make
    the user manually repair MongoDB before pressing Generate.
    """
    # 1) Ensure at least a few faculty records exist for this department.
    if not faculty_docs:
        defaults = [
            ("Dr. A. Kulkarni", 6),
            ("Prof. Sneha Sharma", 6),
            ("Prof. S. Patil", 6),
            ("Prof. V. Deshmukh", 6),
            ("Prof. M. Joshi", 6),
        ]
        for name, max_day in defaults:
            doc = Faculty(name=name, department=department, max_classes_per_day=max_day)
            await doc.insert()
            faculty_docs.append(doc)

    faculty_by_id = {str(f.id): f for f in faculty_docs}

    # 2) Repair stale faculty references on subjects. Prefer an existing
    # faculty.subject_ids relationship; otherwise assign the least-loaded
    # faculty deterministically. This fixes ObjectIds left behind after a
    # faculty record was recreated.
    loads = {str(f.id): 0 for f in faculty_docs}
    for subject in subject_docs:
        fid = str(subject.faculty_id or "")
        if fid in faculty_by_id:
            loads[fid] += max(1, int(subject.hours_per_week or 0))
            continue

        owner = next(
            (f for f in faculty_docs if str(subject.id) in set(f.subject_ids or [])),
            None,
        )
        if owner is None:
            owner = min(faculty_docs, key=lambda f: (loads[str(f.id)], f.name))
        subject.faculty_id = str(owner.id)
        await subject.save()
        loads[str(owner.id)] += max(1, int(subject.hours_per_week or 0))

    # 3) Ensure there is a usable room for every subject type/capacity.
    max_students = max((int(s.student_count or 0) for s in subject_docs), default=60)
    need_lab = any(s.requires_lab for s in subject_docs)
    need_classroom = any(not s.requires_lab for s in subject_docs)

    def has_room(kind: str) -> bool:
        return any(r.type.lower() == kind and r.capacity >= max_students for r in room_docs)

    if need_classroom and not has_room("classroom"):
        room = Room(name=f"Auto Classroom {department[:3].upper()}-101", type="classroom", capacity=max(70, max_students), status="available")
        await room.insert()
        room_docs.append(room)

    if need_lab and not has_room("lab"):
        room = Room(name=f"Auto Computer Lab {department[:3].upper()}-01", type="lab", capacity=max(70, max_students), status="available")
        await room.insert()
        room_docs.append(room)

    return faculty_docs, room_docs


async def _load_maps(department: str, semester: str | None = None) -> tuple[
    dict[str, FacultyInfo], dict[str, RoomInfo], dict[str, SubjectRequirement]
]:
    faculty_docs = await Faculty.find(Faculty.department == department).to_list()
    room_docs = await Room.find_all().to_list()  # rooms aren't department-scoped
    subject_docs = await Subject.find(Subject.department == department).to_list()
    if semester:
        subject_docs = [s for s in subject_docs if s.semester == semester]

    faculty_docs, room_docs = await _ensure_scheduler_data(
        department, subject_docs, faculty_docs, room_docs
    )

    faculty_map = {
        str(f.id): FacultyInfo(
            id=str(f.id),
            name=f.name,
            department=f.department,
            subject_ids=set(f.subject_ids or []),
            unavailable={Slot(s.day, s.period) for s in (f.unavailable or [])},
            max_classes_per_day=max(1, f.max_classes_per_day),
        )
        for f in faculty_docs
    }
    room_map = {
        str(r.id): RoomInfo(id=str(r.id), name=r.name, type=r.type, capacity=r.capacity)
        for r in room_docs
    }
    subject_map = {
        str(s.id): SubjectRequirement(
            id=str(s.id),
            name=s.name,
            department=s.department,
            semester=s.semester,
            faculty_id=s.faculty_id,
            hours_per_week=max(1, int(s.hours_per_week or 0)),
            requires_lab=bool(s.requires_lab),
            student_count=max(0, int(s.student_count or 0)),
        )
        for s in subject_docs
    }
    return faculty_map, room_map, subject_map


def _entries_to_docs(entries: list[Entry]) -> list[TimetableEntry]:
    return [
        TimetableEntry(
            day=e.day,
            period=e.period,
            subject_id=e.subject_id,
            faculty_id=e.faculty_id,
            room_id=e.room_id,
            semester=e.semester,
        )
        for e in entries
    ]


def _docs_to_entries(docs: list[TimetableEntry]) -> list[Entry]:
    return [
        Entry(
            day=d.day,
            period=d.period,
            subject_id=d.subject_id,
            faculty_id=d.faculty_id,
            room_id=d.room_id,
            semester=d.semester,
        )
        for d in docs
    ]


async def generate_for_department(
    department: str,
    semester: str,
    days: int = 6,
    periods_per_day: int = 9,
    break_periods: set[int] | None = None,
) -> Timetable:
    """Generate a fresh timetable for one department+semester and persist it
    as the current (unpublished) working copy. Raises GenerationError
    (unchanged) if a complete conflict-free schedule can't be produced —
    callers should surface `.reasons` to the user.
    """
    faculty_map, room_map, subject_map = await _load_maps(department, semester)
    dept_subjects = list(subject_map.values())

    if not dept_subjects:
        raise GenerationError(
            [f"No subjects are stored for department '{department}' and {semester}. Add subjects first."],
            [],
        )

    entries = generate_timetable(
        dept_subjects, faculty_map, room_map, days=days,
        periods_per_day=periods_per_day, break_periods=break_periods,
    )

    doc = await Timetable.find_one(
        Timetable.department == department, Timetable.semester == semester
    )
    if doc is None:
        doc = Timetable(department=department, semester=semester)
    doc.entries = _entries_to_docs(entries)
    doc.is_published = False
    doc.generated_at = Timetable.now()
    await doc.save()
    return doc


async def revalidate(department: str, semester: str) -> list[str]:
    """Re-run full validation against the currently stored (unpublished or
    published) timetable. Returns a list of conflict reasons (empty = OK).
    """
    faculty_map, room_map, subject_map = await _load_maps(department, semester)
    doc = await Timetable.find_one(
        Timetable.department == department, Timetable.semester == semester
    )
    if doc is None:
        return []
    entries = _docs_to_entries(doc.entries)
    return validate_timetable(entries, faculty_map, room_map, subject_map)


async def move_timetable_entry(
    department: str,
    semester: str,
    target: TimetableEntry,
    new_day: int,
    new_period: int,
    new_room_id: str | None,
    new_faculty_id: str | None,
) -> Timetable:
    """Move/drag one class. Raises ConflictError and leaves storage
    untouched if the move is invalid.
    """
    faculty_map, room_map, subject_map = await _load_maps(department, semester)
    doc = await Timetable.find_one(
        Timetable.department == department, Timetable.semester == semester
    )
    if doc is None:
        raise ConflictError(["No timetable exists yet for this department/semester"])

    entries = _docs_to_entries(doc.entries)
    target_entry = Entry(
        day=target.day, period=target.period, subject_id=target.subject_id,
        faculty_id=target.faculty_id, room_id=target.room_id, semester=target.semester,
    )
    new_entries = move_entry(
        entries, target_entry, new_day, new_period, new_room_id, new_faculty_id,
        faculty_map, room_map, subject_map,
    )
    doc.entries = _entries_to_docs(new_entries)
    doc.is_published = False
    await doc.save()
    return doc


async def publish_timetable(department: str, semester: str) -> Timetable:
    """Gate used by POST /timetable/publish. Raises ConflictError (with
    every reason) if the current working copy isn't publishable.
    """
    faculty_map, room_map, subject_map = await _load_maps(department, semester)
    doc = await Timetable.find_one(
        Timetable.department == department, Timetable.semester == semester
    )
    if doc is None:
        raise ConflictError(["No timetable exists yet for this department/semester"])

    entries = _docs_to_entries(doc.entries)
    publish(entries, faculty_map, room_map, subject_map)  # raises on failure

    doc.is_published = True
    doc.published_at = Timetable.now()
    await doc.save()
    return doc
