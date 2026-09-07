from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.roles import require_admin
from app.models.room import Room
from app.schemas_domain import RoomIn, RoomOut
from app.users import current_active_user

router = APIRouter()


def _to_out(doc: Room) -> RoomOut:
    return RoomOut(id=str(doc.id), **doc.model_dump(exclude={"id"}))


@router.get("", response_model=list[RoomOut])
async def list_rooms(_=Depends(current_active_user)):
    docs = await Room.find_all().to_list()
    return [_to_out(d) for d in docs]


@router.post("", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(payload: RoomIn, _=Depends(require_admin)):
    doc = Room(**payload.model_dump())
    await doc.insert()
    return _to_out(doc)


@router.patch("/{room_id}/status", response_model=RoomOut)
async def update_room_status(room_id: str, status_value: str, _=Depends(current_active_user)):
    """Any authenticated user can flip room status — mirrors the IoT-sensor
    sync described in the Room Availability UI, which isn't admin-gated.
    """
    doc = await Room.get(room_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    doc.status = status_value
    await doc.save()
    return _to_out(doc)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(room_id: str, _=Depends(require_admin)):
    doc = await Room.get(room_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    await doc.delete()
