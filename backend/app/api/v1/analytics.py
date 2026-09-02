"""Executive Analytics and Aggregated Metrics API endpoints."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.schemas.paimana import GenericResponse, AnalyticsOverviewResponse, AnalyticsGroupItem
from app.models.entities import Project, Alert
from app.services.project_service import ProjectService

router = APIRouter()


@router.get("/overview", response_model=GenericResponse, summary="Executive dashboard overview metrics")
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Computes macro dashboard metrics directly from DB queries.
    CRITICAL CONSTRAINT: All numbers are computed from database queries without hardcoded values.
    """
    ProjectService.seed_initial_data_if_empty(db)
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    total_budget = db.query(func.sum(Project.budget)).scalar() or 0.0
    avg_risk = db.query(func.avg(Project.overall_risk_score)).scalar() or 0.0
    active_alerts = db.query(func.count(Alert.id)).filter(Alert.is_resolved == False).scalar() or 0
    at_risk_count = db.query(func.count(Project.id)).filter(Project.overall_risk_score >= 0.50).scalar() or 0
    
    # Financial exposure calculation: sum(budget * (cost_overrun_pct / 100))
    cost_exposure = db.query(
        func.sum(Project.budget * (Project.cost_overrun_pct / 100.0))
    ).scalar() or 0.0

    overview_data = AnalyticsOverviewResponse(
        total_projects=total_projects,
        total_budget_cr=round(float(total_budget), 2),
        average_risk_score=round(float(avg_risk), 4),
        active_alerts_count=active_alerts,
        at_risk_projects_count=at_risk_count,
        total_cost_overrun_exposure_cr=round(float(cost_exposure), 2)
    )

    return GenericResponse(
        status="success",
        message="Analytics overview computed successfully from database",
        data=overview_data.model_dump()
    )


@router.get("/sectors", response_model=GenericResponse, summary="Analytics aggregated by sector")
def get_sector_analytics(db: Session = Depends(get_db)):
    """Computes sector-level aggregate metrics directly from database queries."""
    ProjectService.seed_initial_data_if_empty(db)
    results = db.query(
        func.coalesce(Project.sector, "Unspecified").label("sector"),
        func.count(Project.id).label("project_count"),
        func.sum(Project.budget).label("total_budget"),
        func.avg(Project.overall_risk_score).label("avg_risk"),
        func.sum(case((Project.overall_risk_score >= 0.50, 1), else_=0)).label("at_risk_count")
    ).group_by(Project.sector).all()

    sector_items = [
        AnalyticsGroupItem(
            category_name=row.sector,
            project_count=row.project_count,
            total_budget_cr=round(float(row.total_budget or 0.0), 2),
            average_risk_score=round(float(row.avg_risk or 0.0), 4),
            at_risk_count=int(row.at_risk_count or 0)
        ).model_dump()
        for row in results
    ]

    return GenericResponse(
        status="success",
        message="Sector analytics computed successfully from database",
        data={
            "total_sectors": len(sector_items),
            "sectors": sector_items
        }
    )


@router.get("/ministries", response_model=GenericResponse, summary="Analytics aggregated by ministry")
def get_ministry_analytics(db: Session = Depends(get_db)):
    """Computes ministry-level aggregate metrics directly from database queries."""
    ProjectService.seed_initial_data_if_empty(db)
    results = db.query(
        func.coalesce(Project.ministry, "Unspecified").label("ministry"),
        func.count(Project.id).label("project_count"),
        func.sum(Project.budget).label("total_budget"),
        func.avg(Project.overall_risk_score).label("avg_risk"),
        func.sum(case((Project.overall_risk_score >= 0.50, 1), else_=0)).label("at_risk_count")
    ).group_by(Project.ministry).all()

    ministry_items = [
        AnalyticsGroupItem(
            category_name=row.ministry,
            project_count=row.project_count,
            total_budget_cr=round(float(row.total_budget or 0.0), 2),
            average_risk_score=round(float(row.avg_risk or 0.0), 4),
            at_risk_count=int(row.at_risk_count or 0)
        ).model_dump()
        for row in results
    ]

    return GenericResponse(
        status="success",
        message="Ministry analytics computed successfully from database",
        data={
            "total_ministries": len(ministry_items),
            "ministries": ministry_items
        }
    )


@router.get("/geography", response_model=GenericResponse, summary="Analytics aggregated by geography")
def get_geography_analytics(db: Session = Depends(get_db)):
    """Computes state/geography-level aggregate metrics directly from database queries."""
    ProjectService.seed_initial_data_if_empty(db)
    results = db.query(
        func.coalesce(Project.state, "Unspecified").label("state"),
        func.count(Project.id).label("project_count"),
        func.sum(Project.budget).label("total_budget"),
        func.avg(Project.overall_risk_score).label("avg_risk"),
        func.sum(case((Project.overall_risk_score >= 0.50, 1), else_=0)).label("at_risk_count")
    ).group_by(Project.state).all()

    geography_items = [
        AnalyticsGroupItem(
            category_name=row.state,
            project_count=row.project_count,
            total_budget_cr=round(float(row.total_budget or 0.0), 2),
            average_risk_score=round(float(row.avg_risk or 0.0), 4),
            at_risk_count=int(row.at_risk_count or 0)
        ).model_dump()
        for row in results
    ]

    return GenericResponse(
        status="success",
        message="Geographic analytics computed successfully from database",
        data={
            "total_states": len(geography_items),
            "geography": geography_items
        }
    )
