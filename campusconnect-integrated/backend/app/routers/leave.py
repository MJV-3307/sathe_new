from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.roles import require_admin_or_faculty
from app.models.leave_request import LeaveRequest
from app.schemas_domain import AssignProxyRequest, LeaveRequestIn, LeaveRequestOut
from app.users import current_active_user

router = APIRouter()


def _to_out(doc: LeaveRequest) -> LeaveRequestOut:
    return LeaveRequestOut(id=str(doc.id), **doc.model_dump(exclude={"id", "created_at"}))


@router.get("", response_model=list[LeaveRequestOut])
async def list_leave_requests(_=Depends(current_active_user)):
    docs = await LeaveRequest.find_all().sort(-LeaveRequest.created_at).to_list()
    return [_to_out(d) for d in docs]


@router.post("", response_model=LeaveRequestOut, status_code=status.HTTP_201_CREATED)
async def apply_leave(payload: LeaveRequestIn, _=Depends(current_active_user)):
    """Any authenticated (faculty) user can apply for leave for themselves;
    real per-user scoping would compare `faculty_id` to the caller's linked
    Faculty record once that link is populated at account setup.
    """
    doc = LeaveRequest(**payload.model_dump())
    await doc.insert()
    return _to_out(doc)


@router.patch("/{leave_id}/assign-proxy", response_model=LeaveRequestOut)
async def assign_proxy(
    leave_id: str, payload: AssignProxyRequest, _=Depends(require_admin_or_faculty)
):
    doc = await LeaveRequest.get(leave_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    doc.status = "APPROVED"
    doc.assigned_proxy = payload.proxy_name
    await doc.save()
    return _to_out(doc)


@router.patch("/{leave_id}/decline", response_model=LeaveRequestOut)
async def decline_leave(leave_id: str, _=Depends(require_admin_or_faculty)):
    doc = await LeaveRequest.get(leave_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    doc.status = "DECLINED"
    await doc.save()
    return _to_out(doc)
