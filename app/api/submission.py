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
    db: Session = Depends(get_db)
):
    """
    Submit tax details for the authenticated user.
    User identity is derived from JWT token.
    """

    badge = get_badge_for_tax(submission.tax_paid)

    new_submission = TaxSubmission(
        user_id=current_user.id,
        financial_year=submission.financial_year,
        tax_paid=submission.tax_paid,
        badge_name=badge,
        status="PENDING"
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return new_submission
