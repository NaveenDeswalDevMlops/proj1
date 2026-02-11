from fastapi import Depends, HTTPException, status

from app.core.auth import get_current_user
from app.models.user import User

ADMIN_EMAILS = {
    "admin@example.com",
}


def is_admin_email(email: str) -> bool:
    return email in ADMIN_EMAILS


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not is_admin_email(current_user.email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user
