from datetime import date
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_verified: int

    class Config:
        from_attributes = True


class TaxSubmissionCreate(BaseModel):
    financial_year: str
    tax_paid: int


class TaxSubmissionResponse(BaseModel):
    id: int
    financial_year: str
    tax_paid: int
    badge_name: str | None
    status: str
    badge_id: str | None = None

    class Config:
        orm_mode = True


class AdminSubmissionCreate(BaseModel):
    user_email: EmailStr
    financial_year: str
    tax_paid: int
