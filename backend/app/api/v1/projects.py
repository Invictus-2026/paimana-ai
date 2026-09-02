"""Projects API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.paimana import ProjectResponse, ProjectCreate, GenericResponse
from app.services.project_service import ProjectService

router = APIRouter()


@router.get("", response_model=List[ProjectResponse], summary="List all projects")
def get_projects(db: Session = Depends(get_db)):
    """Retrieve list of monitored infrastructure projects."""
    projects = ProjectService.get_all_projects(db)
    if not projects:
        # Return initial placeholder mock list if DB is currently empty for initial scaffold testing
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

