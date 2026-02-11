from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.submission import TaxSubmission
from app.models.user import User

router = APIRouter(prefix="/verify", tags=["Verification"])


@router.get("/{badge_id}")
def verify_badge(
    badge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = (
        db.query(TaxSubmission)
        .filter(
            TaxSubmission.badge_id == badge_id,
            TaxSubmission.status == "APPROVED"
        )
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Invalid badge ID"
        )

    is_expired = (
        submission.badge_expires_at is not None
        and submission.badge_expires_at < date.today()
    )

    return {
        "valid": not is_expired,
        "badge_id": submission.badge_id,
        "badge_name": submission.badge_name,
        "financial_year": submission.financial_year,
        "expires_at": submission.badge_expires_at,
        "status": "EXPIRED" if is_expired else "VALID"
    }
