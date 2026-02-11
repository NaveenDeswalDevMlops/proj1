from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
import uuid

from app.core.database import get_db
from app.core.admin import require_admin
from app.models.submission import TaxSubmission

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/approve/{submission_id}")
def approve_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """
    Approve a tax submission and issue a badge.
    Admin-only endpoint.
    """

    submission = (
        db.query(TaxSubmission)
        .filter(TaxSubmission.id == submission_id)
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    if submission.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve submission with status {submission.status}"
        )

    # Issue badge
    submission.status = "APPROVED"
    submission.badge_id = f"NB-{uuid.uuid4().hex[:10].upper()}"

    # Financial year expiry (example: FY 2024–25 → 31 Mar 2025)
    submission.badge_expires_at = date(2025, 3, 31)

    db.commit()
    db.refresh(submission)

    return {
        "message": "Badge issued successfully",
        "submission_id": submission.id,
        "badge_id": submission.badge_id,
        "expires_at": submission.badge_expires_at
    }
