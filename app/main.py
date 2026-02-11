from fastapi import FastAPI
from app.api import badge
from app.api import verify
from fastapi.middleware.cors import CORSMiddleware
# -----------------------------
# Database
# -----------------------------
from app.core.database import Base, engine

# -----------------------------
# Models (force table creation)
# -----------------------------
from app.models.user import User
from app.models.submission import TaxSubmission

# -----------------------------
# Routers
# -----------------------------
from app.api import auth, submission, admin, verify

# -----------------------------
# Create DB tables
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# Create FastAPI app FIRST
# -----------------------------
app = FastAPI(
    title="Nation Builder Badge",
    description="Voluntary civic badge for Indian taxpayers",
    version="0.1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js frontend
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Register routers AFTER app exists
# -----------------------------
app.include_router(auth.router)
app.include_router(submission.router)
app.include_router(admin.router)
app.include_router(verify.router)
app.include_router(badge.router)
# -----------------------------
# Health check
# -----------------------------
@app.get("/")
def home():
    return {"message": "Nation Builder Badge API is running "}
