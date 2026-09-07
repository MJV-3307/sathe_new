from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.roles import require_admin
from app.models.faculty import Faculty, SlotOut
from app.schemas_domain import FacultyIn, FacultyOut
from app.users import current_active_user

router = APIRouter()


def _to_out(doc: Faculty) -> FacultyOut:
    return FacultyOut(id=str(doc.id), **doc.model_dump(exclude={"id"}))


@router.get("", response_model=list[FacultyOut])
async def list_faculty(department: str | None = None, _=Depends(current_active_user)):
    query = Faculty.find(Faculty.department == department) if department else Faculty.find_all()
    docs = await query.to_list()
    return [_to_out(d) for d in docs]


@router.post("", response_model=FacultyOut, status_code=status.HTTP_201_CREATED)
async def create_faculty(payload: FacultyIn, _=Depends(require_admin)):
    doc = Faculty(
        name=payload.name,
        department=payload.department,
        subject_ids=payload.subject_ids,
        unavailable=[SlotOut(**s.model_dump()) for s in payload.unavailable],
        max_classes_per_day=payload.max_classes_per_day,
        user_id=payload.user_id,
    )
    await doc.insert()
    return _to_out(doc)


@router.patch("/{faculty_id}", response_model=FacultyOut)
async def update_faculty(faculty_id: str, payload: FacultyIn, _=Depends(require_admin)):
    doc = await Faculty.get(faculty_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    doc.name = payload.name
    doc.department = payload.department
    doc.subject_ids = payload.subject_ids
    doc.unavailable = [SlotOut(**s.model_dump()) for s in payload.unavailable]
    doc.max_classes_per_day = payload.max_classes_per_day
    doc.user_id = payload.user_id
    await doc.save()
    return _to_out(doc)


@router.delete("/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faculty(faculty_id: str, _=Depends(require_admin)):
    doc = await Faculty.get(faculty_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    await doc.delete()
