from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

from app.core.database import get_db
from app.models.user import User
from app.models.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ---------------- CONFIG ----------------
SECRET_KEY = "dev-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 12

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------- UTILS ----------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ---------------- SIGNUP ----------------
@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        is_verified=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ---------------- LOGIN ----------------
@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": create_token(db_user.id),
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email
        }
    }
