"""Service layer for project management."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.entities import Project
from app.schemas.paimana import ProjectCreate


class ProjectService:
    """Business logic placeholder for project metadata and operations."""

    @staticmethod
    def get_all_projects(db: Session) -> List[Project]:
        """Fetch all projects from database or return initial scaffold list."""
        projects = db.query(Project).all()
        return projects

    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
        """Fetch project details by ID."""
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def create_project(db: Session, project_in: ProjectCreate) -> Project:
        """Create new project entry."""
        db_obj = Project(
            name=project_in.name,
            description=project_in.description,
            start_date=project_in.start_date,
            end_date=project_in.end_date,
            budget=project_in.budget,
            status=project_in.status,
            is_synthetic=project_in.is_synthetic,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
