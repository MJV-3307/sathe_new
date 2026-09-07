from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.roles import require_admin_or_faculty
from app.models.subject import Subject
from app.schemas_domain import SubjectIn, SubjectOut
from app.users import current_active_user

router = APIRouter()


def _to_out(doc: Subject) -> SubjectOut:
    return SubjectOut(id=str(doc.id), **doc.model_dump(exclude={"id"}))


@router.get("", response_model=list[SubjectOut])
async def list_subjects(
    department: str | None = None,
    semester: str | None = None,
    _=Depends(current_active_user),
):
    query = Subject.find_all()
    if department:
        query = Subject.find(Subject.department == department)
    docs = await query.to_list()
    if semester:
        docs = [d for d in docs if d.semester == semester]
    return [_to_out(d) for d in docs]


@router.post("", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def create_subject(payload: SubjectIn, _=Depends(require_admin_or_faculty)):
    doc = Subject(**payload.model_dump())
    await doc.insert()
    return _to_out(doc)


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: str, _=Depends(require_admin_or_faculty)):
    doc = await Subject.get(subject_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    await doc.delete()
