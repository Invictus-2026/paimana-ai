"""Projects API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.paimana import (
    ProjectResponse,
    ProjectCreate,
    GenericResponse,
    RiskPredictionResponse,
    InterventionResponse,
)
from app.services.project_service import ProjectService
from app.services.early_warning_engine import EarlyWarningEngine
from app.models.entities import Project, RiskPrediction, Intervention

router = APIRouter()
early_warning_engine = EarlyWarningEngine(cooldown_days=7.0)


@router.get("", response_model=List[ProjectResponse], summary="List projects with filtering and pagination")
def get_projects(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None, description="Filter by status (e.g. active, at_risk, completed)"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    ministry: Optional[str] = Query(None, description="Filter by ministry"),
    search: Optional[str] = Query(None, description="Search keyword in name or description"),
    sort_by: str = Query("id", description="Field to sort by"),
    order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db)
):
    """Retrieve list of monitored infrastructure projects from DB with filtering and pagination."""
    projects, total = ProjectService.get_projects(
        db, limit=limit, offset=offset, status=status, sector=sector, ministry=ministry,
        search=search, sort_by=sort_by, order=order
    )
    return projects


@router.get("/{project_id}", response_model=ProjectResponse, summary="Get project details")
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Fetch metadata for a single project by ID."""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    return project


@router.get("/{project_id}/predictions", response_model=List[RiskPredictionResponse], summary="Get predictions for a project")
def get_project_predictions(project_id: int, db: Session = Depends(get_db)):
    """Get stored ML risk predictions for a project from DB."""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    predictions = db.query(RiskPrediction).filter(RiskPrediction.project_id == project_id).order_by(RiskPrediction.timestamp.desc()).all()
    return predictions


@router.get("/{project_id}/risk", response_model=GenericResponse, summary="Get risk assessment for a project")
def get_project_risk(project_id: int, db: Session = Depends(get_db)):
    """Retrieve complete risk assessment for a project directly from DB."""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    latest_pred = db.query(RiskPrediction).filter(RiskPrediction.project_id == project_id).order_by(RiskPrediction.timestamp.desc()).first()
    
    return GenericResponse(
        status="success",
        message="Risk assessment retrieved successfully",
        data={
            "project_id": project.id,
            "project_name": project.name,
            "overall_risk_score": latest_pred.overall_risk_score if latest_pred else project.overall_risk_score,
            "cost_risk_score": latest_pred.cost_risk_score if latest_pred else 0.0,
            "delay_risk_score": latest_pred.delay_risk_score if latest_pred else 0.0,
            "predicted_delay_days": latest_pred.predicted_delay_days if latest_pred else 0.0,
            "predicted_cost_overrun_pct": latest_pred.predicted_cost_overrun_pct if latest_pred else project.cost_overrun_pct,
            "risk_level": "Critical" if (project.overall_risk_score >= 0.75) else ("High" if project.overall_risk_score >= 0.50 else "Moderate"),
            "last_evaluated": latest_pred.timestamp.isoformat() if latest_pred else project.created_at.isoformat()
        }
    )


@router.get("/{project_id}/risk-trajectory", response_model=GenericResponse, summary="Get project risk trajectory")
def get_project_risk_trajectory(project_id: int, db: Session = Depends(get_db)):
    """Retrieve historical risk scores, trajectory metrics, and state machine state for a project."""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )

    preds = db.query(RiskPrediction).filter(RiskPrediction.project_id == project_id).order_by(RiskPrediction.timestamp.asc()).all()
    
    if not preds:
        obs = [{"timestamp": project.created_at.isoformat(), "risk_score": project.overall_risk_score}]
    else:
        obs = [{"timestamp": p.timestamp.isoformat(), "risk_score": p.overall_risk_score} for p in preds]

    metrics = early_warning_engine.calculate_trajectory_metrics(str(project_id), obs)
    active_alert = early_warning_engine.evaluate_and_generate_alerts(str(project_id), metrics)

    return GenericResponse(
        status="success",
        message="Risk trajectory retrieved successfully",
        data={
            "project_id": str(project_id),
            "historical_observations": obs,
            "metrics": metrics.model_dump(),
            "active_alert": active_alert.model_dump() if active_alert else None
        }
    )


@router.get("/{project_id}/interventions", response_model=List[InterventionResponse], summary="Get interventions for a project")
def get_project_interventions(project_id: int, db: Session = Depends(get_db)):
    """Retrieve stored interventions for a project from DB."""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    interventions = db.query(Intervention).filter(Intervention.project_id == project_id).order_by(Intervention.created_at.desc()).all()
    return interventions


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, summary="Create a project")
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project record."""
    return ProjectService.create_project(db, project_in)
