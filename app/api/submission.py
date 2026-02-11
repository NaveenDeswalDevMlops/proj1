from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.submission import TaxSubmission
from app.models.schemas import TaxSubmissionCreate, TaxSubmissionResponse
from app.services.badge_service import get_badge_for_tax

router = APIRouter(prefix="/submission", tags=["Tax Submission"])


@router.post("/", response_model=TaxSubmissionResponse)
def submit_tax(
    submission: TaxSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    badge = get_badge_for_tax(submission.tax_paid)

    new_submission = TaxSubmission(
        user_id=current_user.id,
        financial_year=submission.financial_year,
        tax_paid=submission.tax_paid,
        badge_name=badge,
        status="PENDING",
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return new_submission


@router.get("/me", response_model=TaxSubmissionResponse | None)
def get_my_latest_submission(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    submission = (
        db.query(TaxSubmission)
        .filter(TaxSubmission.user_id == current_user.id)
        .order_by(TaxSubmission.id.desc())
        .first()
    )

    return submission


@router.get("/mine", response_model=list[TaxSubmissionResponse])
def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(TaxSubmission)
        .filter(TaxSubmission.user_id == current_user.id)
        .order_by(TaxSubmission.id.desc())
        .all()
    )


@router.get("/my-badges")
def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    submissions = (
        db.query(TaxSubmission)
        .filter(
            TaxSubmission.user_id == current_user.id,
            TaxSubmission.status == "APPROVED",
            TaxSubmission.badge_id.isnot(None),
        )
        .order_by(TaxSubmission.id.desc())
        .all()
    )

    return [
        {
            "submission_id": submission.id,
            "badge_id": submission.badge_id,
            "financial_year": submission.financial_year,
            "badge_name": submission.badge_name,
        }
        for submission in submissions
    ]
