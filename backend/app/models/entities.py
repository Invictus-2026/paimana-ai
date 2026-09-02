"""SQLAlchemy ORM Entities for PAIMANA PredictIQ."""

from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, Date, Text, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Project(Base):
    """Project metadata table."""
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    budget: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="active")
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updates: Mapped[List["ProjectUpdate"]] = relationship("ProjectUpdate", back_populates="project", cascade="all, delete-orphan")
    milestones: Mapped[List["Milestone"]] = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    cost_records: Mapped[List["CostRecord"]] = relationship("CostRecord", back_populates="project", cascade="all, delete-orphan")
    risk_predictions: Mapped[List["RiskPrediction"]] = relationship("RiskPrediction", back_populates="project", cascade="all, delete-orphan")
    alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="project", cascade="all, delete-orphan")


class ProjectUpdate(Base):
    """Historical project progress updates and snapshots."""
    __tablename__ = "project_updates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    cost_actual: Mapped[float] = mapped_column(Float, default=0.0)
    schedule_variance: Mapped[float] = mapped_column(Float, default=0.0)
    status_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

    project: Mapped["Project"] = relationship("Project", back_populates="updates")


class Milestone(Base):
    """Key project milestone events."""
    __tablename__ = "milestones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    planned_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    actual_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

    project: Mapped["Project"] = relationship("Project", back_populates="milestones")


class CostRecord(Base):
    """Financial tracking records per project."""
    __tablename__ = "cost_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    cost_category: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

    project: Mapped["Project"] = relationship("Project", back_populates="cost_records")


class RiskPrediction(Base):
    """Stored model risk outputs for auditability and explainability."""
    __tablename__ = "risk_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    cost_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    delay_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    model_version: Mapped[str] = mapped_column(String(100), nullable=False)
    prediction_timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="risk_predictions")
    factors: Mapped[List["RiskFactor"]] = relationship("RiskFactor", back_populates="prediction", cascade="all, delete-orphan")


class RiskFactor(Base):
    """Contributing features and SHAP values for risk prediction."""
    __tablename__ = "risk_factors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    prediction_id: Mapped[int] = mapped_column(Integer, ForeignKey("risk_predictions.id", ondelete="CASCADE"), nullable=False)
    factor_name: Mapped[str] = mapped_column(String(100), nullable=False)
    factor_value: Mapped[float] = mapped_column(Float, nullable=False)
    shap_value: Mapped[float] = mapped_column(Float, nullable=False)

    prediction: Mapped["RiskPrediction"] = relationship("RiskPrediction", back_populates="factors")


class Alert(Base):
    """Early warning alerts generated by the risk evaluation service."""
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    severity: Mapped[str] = mapped_column(String(50), default="medium")  # low, medium, high, critical
    alert_type: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)

    project: Mapped["Project"] = relationship("Project", back_populates="alerts")


class ModelVersion(Base):
    """Registry and metadata for trained ML models."""
    __tablename__ = "model_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    training_timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    deployment_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    metrics: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Intervention(Base):
    """Recommended actions and mitigation strategies for identified project risks."""
    __tablename__ = "interventions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    risk_prediction_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("risk_predictions.id", ondelete="SET NULL"), nullable=True)
    intervention_type: Mapped[str] = mapped_column(String(100), nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    status: Mapped[str] = mapped_column(String(50), default="proposed")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
