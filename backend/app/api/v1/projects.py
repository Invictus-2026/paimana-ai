"""Projects API endpoints."""

from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.paimana import ProjectResponse, ProjectCreate, GenericResponse
from app.services.project_service import ProjectService
from app.services.early_warning_engine import EarlyWarningEngine

router = APIRouter()
engine = EarlyWarningEngine(cooldown_days=7.0)

# Sample historical risk trajectories for projects
PROJECT_TRAJECTORIES = {
    "1": [
        {"timestamp": "2026-05-01T00:00:00Z", "risk_score": 0.25},
        {"timestamp": "2026-06-01T00:00:00Z", "risk_score": 0.28},
        {"timestamp": "2026-07-01T00:00:00Z", "risk_score": 0.32},
        {"timestamp": "2026-08-01T00:00:00Z", "risk_score": 0.38},
        {"timestamp": "2026-09-01T00:00:00Z", "risk_score": 0.46},
    ],
    "2": [
        {"timestamp": "2026-05-01T00:00:00Z", "risk_score": 0.40},
        {"timestamp": "2026-06-01T00:00:00Z", "risk_score": 0.45},
        {"timestamp": "2026-07-01T00:00:00Z", "risk_score": 0.52},
        {"timestamp": "2026-08-01T00:00:00Z", "risk_score": 0.65},
        {"timestamp": "2026-09-01T00:00:00Z", "risk_score": 0.78},
    ]
}


@router.get("", response_model=List[ProjectResponse], summary="List all projects")
def get_projects(db: Session = Depends(get_db)):
    """Retrieve list of monitored infrastructure projects."""
    projects = ProjectService.get_all_projects(db)
    if not projects:
        return [
            {
                "id": 1,
                "name": "National Highway Expansion Corridor 4",
                "description": "Four-lane highway expansion with smart tolling system",
                "start_date": "2025-01-15",
                "end_date": "2027-12-31",
                "budget": 450000000.0,
                "status": "in_progress",
                "is_synthetic": True,
                "created_at": "2026-01-01T00:00:00"
            },
            {
                "id": 2,
                "name": "Metro Line Phase III Bridge Section",
                "description": "Elevated metro line corridor and structural bridge piers",
                "start_date": "2024-06-01",
                "end_date": "2026-11-30",
                "budget": 280000000.0,
                "status": "at_risk",
                "is_synthetic": True,
                "created_at": "2026-01-01T00:00:00"
            }
        ]
    return projects


@router.get("/{project_id}/risk-trajectory", response_model=GenericResponse, summary="Get project risk trajectory")
def get_project_risk_trajectory(project_id: str):
    """Retrieve historical risk scores, trajectory metrics, and state machine state for a project."""
    pid_key = str(project_id)
    obs = PROJECT_TRAJECTORIES.get(pid_key)
    
    if not obs:
        # Default mock trajectory for unknown projects
        obs = [
            {"timestamp": "2026-07-01T00:00:00Z", "risk_score": 0.20},
            {"timestamp": "2026-08-01T00:00:00Z", "risk_score": 0.22},
            {"timestamp": "2026-09-01T00:00:00Z", "risk_score": 0.25},
        ]

    metrics = engine.calculate_trajectory_metrics(pid_key, obs)
    active_alert = engine.evaluate_and_generate_alerts(pid_key, metrics)

    return GenericResponse(
        status="success",
        message="Risk trajectory retrieved successfully",
        data={
            "project_id": pid_key,
            "historical_observations": obs,
            "metrics": metrics.model_dump(),
            "active_alert": active_alert.model_dump() if active_alert else None
        }
    )


@router.get("/{project_id}", response_model=ProjectResponse, summary="Get project details")
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Fetch metadata for a single project by ID."""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        if project_id in [1, 2]:
            return {
                "id": project_id,
                "name": f"Sample Infrastructure Project {project_id}",
                "description": "Monitored infrastructure development site",
                "start_date": "2025-01-01",
                "end_date": "2027-06-30",
                "budget": 350000000.0,
                "status": "active",
                "is_synthetic": True,
                "created_at": "2026-01-01T00:00:00"
            }
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    return project


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, summary="Create a project")
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project record."""
    return ProjectService.create_project(db, project_in)
