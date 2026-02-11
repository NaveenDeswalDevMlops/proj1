from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import Base, engine
from app.models.user import User
from app.models.submission import TaxSubmission
from app.api import auth, submission, admin, verify, badge


def _ensure_schema_updates() -> None:
    with engine.connect() as conn:
        columns = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(tax_submissions)")).fetchall()
        }

        if "admin_comment" not in columns:
            conn.execute(text("ALTER TABLE tax_submissions ADD COLUMN admin_comment VARCHAR"))

        if "badge_generated_at" not in columns:
            conn.execute(text("ALTER TABLE tax_submissions ADD COLUMN badge_generated_at DATE"))

        conn.commit()


Base.metadata.create_all(bind=engine)
_ensure_schema_updates()

app = FastAPI(
    title="Nation Builder Badge",
    description="Voluntary civic badge for Indian taxpayers",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(submission.router)
app.include_router(admin.router)
app.include_router(verify.router)
app.include_router(badge.router)


@app.get("/")
def home():
    return {"message": "Nation Builder Badge API is running"}
