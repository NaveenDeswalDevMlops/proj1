from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.admin import is_admin_email
from app.models.submission import TaxSubmission
from app.models.user import User
from app.services.badge_generator import generate_badge
from app.services.badge_pdf import generate_badge_pdf

router = APIRouter(prefix="/badge", tags=["Badge"])


def _ensure_access(submission: TaxSubmission, current_user: User):
    if submission.user_id != current_user.id and not is_admin_email(current_user.email):
        raise HTTPException(status_code=403, detail="Not authorized to access this badge")


def _ensure_files(submission: TaxSubmission, user: User):
    if not submission.badge_id:
        raise HTTPException(status_code=404, detail="Badge not found")

    png_path = Path(f"app/static/badges/{submission.badge_id}.png")
    pdf_path = Path(f"app/static/badges/{submission.badge_id}.pdf")

    generated_at = (submission.badge_generated_at or date.today()).isoformat()
    expiry_at = (submission.badge_expires_at or date.today()).isoformat()

    if not png_path.exists():
        generate_badge(
            badge_name=submission.badge_name or "Nation Builder",
            badge_id=submission.badge_id,
            fy=submission.financial_year,
            requestor_name=user.email,
            generated_date=generated_at,
            expiry_date=expiry_at,
        )

    if not pdf_path.exists():
        generate_badge_pdf(
            badge_name=submission.badge_name or "Nation Builder",
            badge_id=submission.badge_id,
            fy=submission.financial_year,
            requestor_name=user.email,
            generated_date=generated_at,
            expiry_date=expiry_at,
        )


@router.get("/{badge_id}/png")
def download_badge_png(
    badge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = (
        db.query(TaxSubmission)
        .filter(
            TaxSubmission.badge_id == badge_id,
            TaxSubmission.status == "APPROVED",
        )
        .first()
    )

    if not submission:
        raise HTTPException(status_code=404, detail="Badge not found")

    user = db.query(User).filter(User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Submission user not found")

    _ensure_access(submission, current_user)
    _ensure_files(submission, user)

    path = f"app/static/badges/{badge_id}.png"
    return FileResponse(path, media_type="image/png", filename=f"{badge_id}.png")


@router.get("/{badge_id}/pdf")
def download_badge_pdf(
    badge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = (
        db.query(TaxSubmission)
        .filter(
            TaxSubmission.badge_id == badge_id,
            TaxSubmission.status == "APPROVED",
        )
        .first()
    )

    if not submission:
        raise HTTPException(status_code=404, detail="Badge not found")

    user = db.query(User).filter(User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Submission user not found")

    _ensure_access(submission, current_user)
    _ensure_files(submission, user)

    path = f"app/static/badges/{badge_id}.pdf"
    return FileResponse(path, media_type="application/pdf", filename=f"{badge_id}.pdf")
