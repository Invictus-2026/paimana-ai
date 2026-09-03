"""Early Warning Alerts API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.schemas.paimana import AlertResponse
from app.models.entities import Alert
from app.services.project_service import ProjectService

router = APIRouter()


@router.get("", response_model=List[AlertResponse], summary="List early warning alerts")
def list_alerts(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    severity: Optional[str] = Query(None, description="Filter by severity (low, medium, high, critical)"),
    is_resolved: Optional[bool] = Query(None, description="Filter by resolution status"),
    db: Session = Depends(get_db)
):
    """Retrieve early warning alerts from DB with filtering and pagination."""
    ProjectService.seed_initial_data_if_empty(db)
    query = db.query(Alert)

    if project_id is not None:
        query = query.filter(Alert.project_id == project_id)
    if severity:
        query = query.filter(Alert.severity.ilike(f"%{severity}%"))
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)

    alerts = query.order_by(desc(Alert.timestamp)).offset(offset).limit(limit).all()
    return alerts


@router.get("/{alert_id}", response_model=AlertResponse, summary="Get single alert details")
def get_alert_by_id(alert_id: int, db: Session = Depends(get_db)):
    """Retrieve single alert details by ID from DB."""
    ProjectService.seed_initial_data_if_empty(db)
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found"
        )
    return alert
