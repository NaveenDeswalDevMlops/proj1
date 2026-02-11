from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship

from app.core.database import Base


class TaxSubmission(Base):
    __tablename__ = "tax_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    financial_year = Column(String, nullable=False)
    tax_paid = Column(Integer, nullable=False)

    badge_name = Column(String, nullable=True)
    status = Column(String, default="PENDING")  # PENDING / APPROVED / REJECTED / INVALIDATED

    badge_id = Column(String, unique=True, nullable=True)
    badge_expires_at = Column(Date, nullable=True)
    badge_generated_at = Column(Date, nullable=True)
    admin_comment = Column(String, nullable=True)

    user = relationship("User", back_populates="submissions")
