from fastapi import Depends, HTTPException, status

from app.models.user import User
from app.users import current_active_user


def require_role(*allowed_roles: str):
    """
    Usage: Depends(require_role("admin")) or Depends(require_role("admin", "faculty"))
    """

    async def role_checker(user: User = Depends(current_active_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to perform this action.",
            )
        return user

    return role_checker


async def require_committee_member(user: User = Depends(current_active_user)) -> User:
    """
    Gate for: posting announcements, viewing committee-meeting room availability.
    Only students with is_committee_member = True pass.
    """
    if user.role != "student" or not user.is_committee_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Committee member access required.",
        )
    return user


async def require_faculty_or_committee_member(
    user: User = Depends(current_active_user),
) -> User:
    """
    Gate for: posting announcements (faculty AND committee-member students
    can both do this).
    """
    if user.role == "faculty":
        return user
    if user.role == "student" and user.is_committee_member:
        return user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only faculty or committee-member students can do this.",
    )


# Common shorthands
require_admin = require_role("admin")
require_faculty = require_role("faculty")
require_student = require_role("student")
require_admin_or_faculty = require_role("admin", "faculty")
