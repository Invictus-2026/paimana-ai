"""Service layer for project management."""

import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.entities import Project
from app.schemas.paimana import ProjectCreate

logger = logging.getLogger("PAIMANA_Backend.ProjectService")


class ProjectService:
    """Business logic for project queries, filtering, sorting, and pagination."""

    @staticmethod
    def seed_initial_data_if_empty(db: Session):
        """Seed initial database records if project table is empty.

        Loads the real MoSPI project dataset from the pipeline's processed
        output (data/processed/project_monthly_dataset.parquet) rather than
        fictional sample data. If the processed dataset doesn't exist yet
        (pipeline never run), leaves the table empty rather than fabricating
        placeholder projects.
        """
        if db.query(Project).count() == 0:
            from pathlib import Path
            import pandas as pd
            from app.data_pipeline.db_loader import load_projects_from_dataframe

            relative_path = Path("data/processed/project_monthly_dataset.parquet")
            # Resolve relative to the repo root (this file lives at
            # backend/app/services/project_service.py) so the seed works
            # regardless of the process's current working directory —
            # e.g. pytest run from backend/ vs a script run from repo root.
            repo_root = Path(__file__).resolve().parents[3]
            processed_path = relative_path
            if not processed_path.exists():
                processed_path = repo_root / relative_path
            if not processed_path.exists():
                logger.warning(
                    f"{relative_path} not found — skipping seed. "
                    "Run scripts/load_real_dataset.py to populate real project data."
                )
                return

            df = pd.read_parquet(processed_path)
            load_projects_from_dataframe(db, df)
            return

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

        sort_attr = getattr(Project, sort_by, Project.id)
        if order.lower() == "desc":
            query = query.order_by(desc(sort_attr))
        else:
            query = query.order_by(asc(sort_attr))

        projects = query.offset(offset).limit(limit).all()
        return projects, total

    @staticmethod
    def get_project_by_id(db: Session, project_id: Any) -> Optional[Project]:
        """Fetch project details by ID or external_project_id, resolving across DB and monthly archives."""
        ProjectService.seed_initial_data_if_empty(db)
        str_id = str(project_id).strip()

        # 1. First look up by external_project_id
        project = db.query(Project).filter(Project.external_project_id == str_id).first()
        if project:
            return project

        # 2. Look up by primary key id (if numeric)
        try:
            int_id = int(str_id)
            project = db.query(Project).filter(Project.id == int_id).first()
            if project:
                return project
        except (ValueError, TypeError):
            pass

        # 3. Fallback: Search monthly historical dataset files (e.g. 701263 from previous months)
        try:
            from app.api.v1.monthly import _find_project_across_months
            from app.services.risk_scoring import compute_project_risk_and_predictions
            from app.models.entities import RiskPrediction
            from datetime import datetime

            trajectory = _find_project_across_months(str_id)
            if trajectory and len(trajectory) > 0:
                latest = trajectory[-1]
                orig = float(latest.get("original_cost_cr") or 0.0)
                rev = float(latest.get("revised_cost_cr") or orig)
                exp = float(latest.get("expenditure_cr") or 0.0)
                sector = str(latest.get("sector") or "Unknown")

                risk_info = compute_project_risk_and_predictions(
                    original_cost=orig,
                    revised_cost=rev,
                    cumulative_expenditure=exp,
                    sector=sector
                )

                new_project = Project(
                    external_project_id=str_id,
                    name=str(latest.get("name") or f"Project {str_id}"),
                    sector=sector,
                    ministry=str(latest.get("ministry") or "Unknown"),
                    budget=orig,
                    revised_cost=rev,
                    cumulative_expenditure=exp,
                    cost_overrun_pct=risk_info["predicted_cost_overrun_pct"],
                    overall_risk_score=risk_info["overall_risk_score"],
                    risk_score_method=risk_info["risk_method"],
                    status="active",
                    is_synthetic=False,
                    created_at=datetime.utcnow()
                )
                db.add(new_project)
                db.flush()

                # Seed RiskPrediction record
                pred = RiskPrediction(
                    project_id=new_project.id,
                    cost_risk_score=risk_info["cost_risk_score"],
                    delay_risk_score=risk_info["delay_risk_score"],
                    overall_risk_score=risk_info["overall_risk_score"],
                    predicted_delay_days=risk_info["predicted_delay_days"],
                    predicted_cost_overrun_pct=risk_info["predicted_cost_overrun_pct"],
                    model_version="composite_v2.0",
                    timestamp=datetime.utcnow(),
                    prediction_timestamp=datetime.utcnow()
                )
                db.add(pred)
                db.commit()
                db.refresh(new_project)
                return new_project
        except Exception as e:
            logger.warning(f"Could not synthesize project {str_id} from monthly files: {e}")

        return None

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
