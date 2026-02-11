from datetime import date
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.admin import require_admin
from app.models.submission import TaxSubmission
from app.models.user import User
from app.models.schemas import AdminSubmissionCreate, RejectSubmissionRequest
from app.services.badge_service import get_badge_for_tax
from app.services.badge_generator import generate_badge
from app.services.badge_pdf import generate_badge_pdf

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
            "badge_generated_at": submission.badge_generated_at,
            "admin_comment": submission.admin_comment,
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
    admin=Depends(require_admin),
):
    submission = db.query(TaxSubmission).filter(TaxSubmission.id == submission_id).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    if submission.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve submission with status {submission.status}",
        )

    user = db.query(User).filter(User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Submission user not found")

    generated_at = date.today()
    expiry_at = date(generated_at.year + 1, 3, 31)

    submission.status = "APPROVED"
    submission.badge_id = f"NB-{uuid.uuid4().hex[:10].upper()}"
    submission.badge_generated_at = generated_at
    submission.badge_expires_at = expiry_at
    submission.admin_comment = "Approved"

    generate_badge(
        badge_name=submission.badge_name or "Nation Builder",
        badge_id=submission.badge_id,
        fy=submission.financial_year,
        requestor_name=user.email,
        generated_date=generated_at.isoformat(),
        expiry_date=expiry_at.isoformat(),
    )
    generate_badge_pdf(
        badge_name=submission.badge_name or "Nation Builder",
        badge_id=submission.badge_id,
        fy=submission.financial_year,
        requestor_name=user.email,
        generated_date=generated_at.isoformat(),
        expiry_date=expiry_at.isoformat(),
    )

    db.commit()
    db.refresh(submission)

    return {
        "message": "Badge issued successfully",
        "submission_id": submission.id,
        "badge_id": submission.badge_id,
        "generated_at": submission.badge_generated_at,
        "expires_at": submission.badge_expires_at,
    }


@router.post("/reject/{submission_id}")
def reject_submission(
    submission_id: int,
    payload: RejectSubmissionRequest,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    submission = db.query(TaxSubmission).filter(TaxSubmission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if submission.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject submission with status {submission.status}",
        )

    submission.status = "REJECTED"
    submission.admin_comment = payload.comment
    db.commit()
    db.refresh(submission)

    return {"message": "Submission rejected", "submission_id": submission.id}


@router.delete("/invalidate/{submission_id}")
def invalidate_badge(
    submission_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    submission = db.query(TaxSubmission).filter(TaxSubmission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if not submission.badge_id:
        raise HTTPException(status_code=400, detail="No badge to invalidate")

    badge_id = submission.badge_id
    png_path = f"app/static/badges/{badge_id}.png"
    pdf_path = f"app/static/badges/{badge_id}.pdf"

    if os.path.exists(png_path):
        os.remove(png_path)
    if os.path.exists(pdf_path):
        os.remove(pdf_path)

    submission.status = "INVALIDATED"
    submission.admin_comment = "Badge invalidated by admin"
    submission.badge_id = None
    db.commit()

    return {"message": "Badge invalidated and files removed", "submission_id": submission.id}
