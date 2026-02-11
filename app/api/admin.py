from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
import uuid

from app.core.database import get_db
from app.core.admin import require_admin
from app.models.submission import TaxSubmission
from app.models.user import User
from app.models.schemas import AdminSubmissionCreate
from app.services.badge_service import get_badge_for_tax

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/submissions")
def list_all_submissions(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    submissions = (
        db.query(TaxSubmission, User.email)
        .join(User, User.id == TaxSubmission.user_id)
        .order_by(TaxSubmission.id.desc())
        .all()
    )

    return [
        {
            "id": submission.id,
            "user_id": submission.user_id,
            "user_email": email,
            "financial_year": submission.financial_year,
            "tax_paid": submission.tax_paid,
            "badge_name": submission.badge_name,
            "status": submission.status,
            "badge_id": submission.badge_id,
            "badge_expires_at": submission.badge_expires_at,
        }
        for submission, email in submissions
    ]


@router.post("/submit-for-user")
def submit_for_user(
    payload: AdminSubmissionCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    user = db.query(User).filter(User.email == payload.user_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    submission = TaxSubmission(
        user_id=user.id,
        financial_year=payload.financial_year,
        tax_paid=payload.tax_paid,
        badge_name=get_badge_for_tax(payload.tax_paid),
        status="PENDING"
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "message": "Submission created for user",
        "submission_id": submission.id,
        "user_id": user.id,
        "user_email": user.email,
    }


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
