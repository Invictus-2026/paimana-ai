"""Early-warning alerts API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas.paimana import GenericResponse
from app.services.early_warning_engine import EarlyWarningEngine, SeverityLevel, RiskState

router = APIRouter()
engine = EarlyWarningEngine(cooldown_days=7.0)

# Sample seed observations for active alerts demonstration
MOCK_OBSERVATIONS = {
    "P101": [
        {"timestamp": "2026-06-01T00:00:00Z", "risk_score": 0.40},
        {"timestamp": "2026-07-01T00:00:00Z", "risk_score": 0.45},
        {"timestamp": "2026-08-01T00:00:00Z", "risk_score": 0.51},
        {"timestamp": "2026-08-15T00:00:00Z", "risk_score": 0.63},
        {"timestamp": "2026-09-01T00:00:00Z", "risk_score": 0.76},
    ],
    "P102": [
        {"timestamp": "2026-07-01T00:00:00Z", "risk_score": 0.20},
        {"timestamp": "2026-08-01T00:00:00Z", "risk_score": 0.22},
        {"timestamp": "2026-09-01T00:00:00Z", "risk_score": 0.25},
    ],
}


@router.get("", response_model=GenericResponse, summary="List active early-warning alerts")
def get_alerts(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    state: Optional[str] = Query(None, description="Filter by state (STABLE, WATCH, ESCALATING, HIGH_RISK, CRITICAL)")
):
    """Retrieve active early-warning alerts with optional filtering."""
    alerts = []
    
    for pid, obs in MOCK_OBSERVATIONS.items():
        if project_id and pid != project_id:
            continue
        metrics = engine.calculate_trajectory_metrics(pid, obs)
        
        if state and metrics.current_state.value.upper() != state.upper():
            continue
            
        alert = engine.evaluate_and_generate_alerts(pid, metrics, project_impact_weight=1.5)
        if alert:
            if severity and alert.severity.value.upper() != severity.upper():
                continue
            alerts.append(alert.model_dump())

    return GenericResponse(
        status="success",
        message="Active early-warning alerts retrieved successfully",
        data={
            "total_alerts": len(alerts),
            "alerts": alerts
        }
    )
