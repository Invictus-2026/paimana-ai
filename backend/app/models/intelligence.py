"""Additive tables for evidence, offline receipts and delivery audit."""
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Evidence(Base):
    __tablename__ = 'intelligence_evidence'
    __table_args__ = (UniqueConstraint('kind', 'identity', name='uq_evidence_identity'),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(40), index=True)
    project_id: Mapped[int | None] = mapped_column(Integer, index=True, nullable=True)
    identity: Mapped[str] = mapped_column(String(128))
    payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ActionGrant(Base):
    __tablename__ = 'intelligence_action_grants'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    intervention_id: Mapped[int] = mapped_column(Integer)
    expires: Mapped[int] = mapped_column(Integer)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
