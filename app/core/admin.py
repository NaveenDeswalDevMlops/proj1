from fastapi import Depends, HTTPException, status

from app.core.auth import get_current_user
from app.models.user import User

# ------------------------------------------------------------------
# TEMP ADMIN CONFIG
# ------------------------------------------------------------------
# For now, admins are identified by email.
# Later, this can be replaced with role-based access control.

ADMIN_EMAILS = {
    "admin@example.com"
}

# ------------------------------------------------------------------
# ADMIN GUARD DEPENDENCY
# ------------------------------------------------------------------

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensures the current user is an admin.
    """
    print("ADMIN CHECK:", current_user.email)
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user
