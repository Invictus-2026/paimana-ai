"""Database Connection and Session Management."""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from app.config import settings

db_url = settings.get_database_url()

# Handle sqlite specific connect args if using fallback
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session to API route handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
