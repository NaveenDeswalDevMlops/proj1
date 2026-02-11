from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.submission import TaxSubmission

router = APIRouter(prefix="/badge", tags=["Badge"])

@router.get("/{badge_id}/png")
def download_badge_png(badge_id: str, db: Session = Depends(get_db)):
    submission = db.query(TaxSubmission).filter(
        TaxSubmission.badge_id == badge_id,
        TaxSubmission.status == "APPROVED"
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Badge not found")

    path = f"app/static/badges/{badge_id}.png"
    return FileResponse(path, media_type="image/png", filename="badge.png")

@router.get("/{badge_id}/pdf")
def download_badge_pdf(badge_id: str, db: Session = Depends(get_db)):
    submission = db.query(TaxSubmission).filter(
        TaxSubmission.badge_id == badge_id,
        TaxSubmission.status == "APPROVED"
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Badge not found")

    path = f"app/static/badges/{badge_id}.pdf"
    return FileResponse(path, media_type="application/pdf", filename="badge.pdf")
