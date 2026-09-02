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
            sample_projects = [
                # Transport & Logistics
                Project(id=1, name="Mumbai Metro Line 7A", description="Underground cavern & TBM package", sector="Transport & Logistics", ministry="Ministry of Housing & Urban Affairs", state="Maharashtra", budget=6607.0, status="active", overall_risk_score=0.92, cost_overrun_pct=18.8),
                Project(id=2, name="Delhi-Meerut RRTS Corridor", description="Regional rapid transit system", sector="Transport & Logistics", ministry="Ministry of Railways", state="Delhi", budget=30274.0, status="at_risk", overall_risk_score=0.89, cost_overrun_pct=12.9),
                Project(id=3, name="Chardham Highway Project", description="All-weather road connectivity", sector="Transport & Logistics", ministry="Ministry of Road Transport & Highways", state="Uttarakhand", budget=12000.0, status="at_risk", overall_risk_score=0.83, cost_overrun_pct=23.3),
                Project(id=4, name="Dedicated Freight Corridor East", description="Quad line electrified freight corridor", sector="Transport & Logistics", ministry="Ministry of Railways", state="Uttar Pradesh", budget=51848.0, status="active", overall_risk_score=0.78, cost_overrun_pct=15.4),
                
                # Energy
                Project(id=5, name="Kudankulam Nuclear Project", description="Units 3 & 4 VVER-1000 reactors", sector="Energy", ministry="Department of Atomic Energy", state="Tamil Nadu", budget=49680.0, status="active", overall_risk_score=0.85, cost_overrun_pct=26.5),
                Project(id=6, name="Ultra Mega Solar Park Bhadla", description="4000MW solar park phase IV", sector="Energy", ministry="Ministry of New & Renewable Energy", state="Rajasthan", budget=18500.0, status="completed", overall_risk_score=0.34, cost_overrun_pct=3.8),
                Project(id=7, name="Subansiri Lower Hydroelectric", description="2000MW run-of-the-river hydro plant", sector="Energy", ministry="Ministry of Power", state="Arunachal Pradesh", budget=20475.0, status="at_risk", overall_risk_score=0.79, cost_overrun_pct=21.0),
                Project(id=8, name="Greenshoe Wind-Solar Hybrid Grid", description="High capacity evacuation corridor", sector="Energy", ministry="Ministry of Power", state="Gujarat", budget=14200.0, status="active", overall_risk_score=0.42, cost_overrun_pct=5.5),

                # Water & Sanitation
                Project(id=9, name="Polavaram Irrigation Project", description="National multi-purpose irrigation project", sector="Water & Sanitation", ministry="Ministry of Jal Shakti", state="Andhra Pradesh", budget=55000.0, status="at_risk", overall_risk_score=0.87, cost_overrun_pct=31.0),
                Project(id=10, name="Namami Gange STP Phase II", description="Sewerage network & 120 MLD plant", sector="Water & Sanitation", ministry="Ministry of Jal Shakti", state="Uttar Pradesh", budget=8450.0, status="active", overall_risk_score=0.62, cost_overrun_pct=9.4),
                Project(id=11, name="Jal Jeevan Mission Pipeline Malwa", description="Bulk water supply & surface grid", sector="Water & Sanitation", ministry="Ministry of Jal Shakti", state="Madhya Pradesh", budget=11200.0, status="active", overall_risk_score=0.55, cost_overrun_pct=7.2),
                Project(id=12, name="Cauvery Stage V Water Supply", description="Bangalore bulk drinking water phase V", sector="Water & Sanitation", ministry="Ministry of Jal Shakti", state="Karnataka", budget=5550.0, status="active", overall_risk_score=0.48, cost_overrun_pct=6.1),

                # Social Infrastructure
                Project(id=13, name="AIIMS Awantipora Jammu", description="750-bed super specialty hospital", sector="Social Infrastructure", ministry="Ministry of Health & Family Welfare", state="Jammu & Kashmir", budget=1828.0, status="active", overall_risk_score=0.74, cost_overrun_pct=14.2),
                Project(id=14, name="IIT Hyderabad Permanent Campus", description="Phase II academic block & hostels", sector="Social Infrastructure", ministry="Ministry of Education", state="Telangana", budget=2450.0, status="completed", overall_risk_score=0.28, cost_overrun_pct=4.1),
                Project(id=15, name="Central Vista Redevelopment", description="New Parliament & Executive Enclave", sector="Social Infrastructure", ministry="Ministry of Housing & Urban Affairs", state="Delhi", budget=13450.0, status="active", overall_risk_score=0.68, cost_overrun_pct=11.0),
                
                # Communication
                Project(id=16, name="BharatNet Phase III FTTH", description="Optical fiber GPON expansion", sector="Communication", ministry="Ministry of Communications", state="Bihar", budget=65000.0, status="active", overall_risk_score=0.71, cost_overrun_pct=16.5),
                Project(id=17, name="5G Backhaul Fiberization National", description="Tower fiberization link upgrade", sector="Communication", ministry="Ministry of Communications", state="Maharashtra", budget=22000.0, status="completed", overall_risk_score=0.31, cost_overrun_pct=2.9),
                Project(id=18, name="Submarine Cable Lakshadweep", description="Kochi-Lakshadweep OFC link", sector="Communication", ministry="Ministry of Communications", state="Kerala", budget=1072.0, status="completed", overall_risk_score=0.22, cost_overrun_pct=1.8),
            ]

            db.add_all(sample_projects)
            db.commit()

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
