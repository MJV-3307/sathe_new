from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.roles import require_admin_or_faculty
from app.models.timetable import Timetable, TimetableEntry
from app.schemas_domain import (
    GenerateRequest,
    MoveEntryRequest,
    PublishRequest,
    TimetableOut,
)
from app.services import timetable_service
from app.timetable_engine import ConflictError, GenerationError
from app.users import current_active_user

router = APIRouter()


def _to_out(doc: Timetable) -> TimetableOut:
    return TimetableOut(
        id=str(doc.id),
        department=doc.department,
        semester=doc.semester,
        entries=[e.model_dump() for e in doc.entries],
        is_published=doc.is_published,
    )


@router.get("", response_model=TimetableOut)
async def get_timetable(department: str, semester: str, _=Depends(current_active_user)):
    doc = await Timetable.find_one(
        Timetable.department == department, Timetable.semester == semester
    )
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No timetable has been generated yet for this department/semester",
        )
    return _to_out(doc)


@router.post("/generate", response_model=TimetableOut)
async def generate(payload: GenerateRequest, _=Depends(require_admin_or_faculty)):
    try:
        doc = await timetable_service.generate_for_department(
            department=payload.department,
            semester=payload.semester,
            days=payload.days,
            periods_per_day=payload.periods_per_day,
            break_periods=set(payload.break_periods),
        )
    except GenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Could not generate a complete timetable", "reasons": exc.reasons},
        )
    return _to_out(doc)


@router.post("/move", response_model=TimetableOut)
async def move(payload: MoveEntryRequest, _=Depends(require_admin_or_faculty)):
    try:
        doc = await timetable_service.move_timetable_entry(
            department=payload.department,
            semester=payload.semester,
            target=TimetableEntry(**payload.target.model_dump()),
            new_day=payload.new_day,
            new_period=payload.new_period,
            new_room_id=payload.new_room_id,
            new_faculty_id=payload.new_faculty_id,
        )
    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": "Move would create a conflict", "reasons": exc.reasons},
        )
    return _to_out(doc)


@router.post("/publish", response_model=TimetableOut)
async def publish_timetable(payload: PublishRequest, _=Depends(require_admin_or_faculty)):
    try:
        doc = await timetable_service.publish_timetable(payload.department, payload.semester)
    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": "Timetable is not publishable", "reasons": exc.reasons},
        )
    return _to_out(doc)
