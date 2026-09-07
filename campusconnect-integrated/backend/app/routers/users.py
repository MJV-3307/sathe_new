from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_users import exceptions

from app.dependencies.roles import require_admin
from app.models.user import User
from app.schemas import UserRead, UserUpdate
from app.users import UserManager, current_active_user, get_user_manager

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_me(user: User = Depends(current_active_user)):
    return user


@router.patch("/me", response_model=UserRead)
async def update_me(
    user_update: UserUpdate,
    user: User = Depends(current_active_user),
    user_manager: UserManager = Depends(get_user_manager),
):
    # A user editing their own profile can't grant themselves admin/committee
    # access — those fields are only settable by an admin, via the /{user_id}
    # route below.
    if user_update.role is not None or user_update.is_committee_member is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot change your own role or committee status.",
        )
    return await user_manager.update(user_update, user, safe=True)


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: PydanticObjectId,
    _: User = Depends(require_admin),
    user_manager: UserManager = Depends(get_user_manager),
):
    try:
        return await user_manager.get(user_id)
    except exceptions.UserNotExists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: PydanticObjectId,
    user_update: UserUpdate,
    _: User = Depends(require_admin),
    user_manager: UserManager = Depends(get_user_manager),
):
    try:
        user = await user_manager.get(user_id)
    except exceptions.UserNotExists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    # safe=False: an admin IS allowed to change role, is_committee_member, etc.
    return await user_manager.update(user_update, user, safe=False)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: PydanticObjectId,
    admin: User = Depends(require_admin),
    user_manager: UserManager = Depends(get_user_manager),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )
    try:
        user = await user_manager.get(user_id)
    except exceptions.UserNotExists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await user_manager.delete(user)
