"""Service layer for project management."""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.entities import Project, RiskPrediction, Alert, Intervention, ModelVersion
from app.schemas.paimana import ProjectCreate


class ProjectService:
    """Business logic for project queries, filtering, sorting, and pagination."""

    @staticmethod
    def seed_initial_data_if_empty(db: Session):
        """Seed initial database records if project table is empty."""
        if db.query(Project).count() == 0:
            p1 = Project(
                id=1,
                name="Mumbai-Ahmedabad High Speed Rail",
                description="Bullet train corridor development",
                sector="Railways",
                ministry="Ministry of Railways",
                state="Gujarat",
                budget=110000.0,
                status="active",
                overall_risk_score=0.82,
                cost_overrun_pct=18.5
            )
            p2 = Project(
                id=2,
                name="Delhi-Mumbai Expressway Package 4",
                description="Greenfield 8-lane expressway",
                sector="Road Transport & Highways",
                ministry="MoRTH",
                state="Rajasthan",
                budget=45000.0,
                status="at_risk",
                overall_risk_score=0.64,
                cost_overrun_pct=12.0
            )
            p3 = Project(
                id=3,
                name="Bangalore Metro Phase 2B",
                description="Airport line expansion project",
                sector="Urban Development",
                ministry="MoHUA",
                state="Karnataka",
                budget=15000.0,
                status="completed",
                overall_risk_score=0.25,
                cost_overrun_pct=4.2
            )
            db.add_all([p1, p2, p3])
            db.commit()

            # Seed initial alert & prediction
            a1 = Alert(
                id=1,
                project_id=1,
                severity="critical",
                alert_type="Rapid Acceleration",
                message="Risk accelerated rapidly by 15.2% over last 14 days",
                is_resolved=False
            )
            db.add(a1)
            db.commit()

    @staticmethod
    def get_projects(
        db: Session,
        limit: int = 50,
        offset: int = 0,
        status: Optional[str] = None,
        sector: Optional[str] = None,
        ministry: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "id",
        order: str = "asc"
    ) -> Tuple[List[Project], int]:
        """Fetch paginated, filtered, and sorted project records from DB with total count."""
        ProjectService.seed_initial_data_if_empty(db)
        query = db.query(Project)

        if status:
            query = query.filter(Project.status.ilike(f"%{status}%"))
        if sector:
            query = query.filter(Project.sector.ilike(f"%{sector}%"))
        if ministry:
            query = query.filter(Project.ministry.ilike(f"%{ministry}%"))
        if search:
            query = query.filter(
                or_(
                    Project.name.ilike(f"%{search}%"),
                    Project.description.ilike(f"%{search}%")
                )
            )

        total = query.count()

        # Sorting
        sort_attr = getattr(Project, sort_by, Project.id)
        if order.lower() == "desc":
            query = query.order_by(desc(sort_attr))
        else:
            query = query.order_by(asc(sort_attr))

        projects = query.offset(offset).limit(limit).all()
        return projects, total

    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
        """Fetch project details by ID."""
        ProjectService.seed_initial_data_if_empty(db)
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def create_project(db: Session, project_in: ProjectCreate) -> Project:
        """Create new project entry."""
        db_obj = Project(
            name=project_in.name,
            description=project_in.description,
            sector=project_in.sector if hasattr(project_in, "sector") else None,
            ministry=project_in.ministry if hasattr(project_in, "ministry") else None,
            state=project_in.state if hasattr(project_in, "state") else None,
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
