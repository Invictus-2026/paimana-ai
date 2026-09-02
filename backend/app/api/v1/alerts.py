"""Early-warning alerts API endpoints."""

from fastapi import APIRouter
from app.schemas.paimana import GenericResponse

router = APIRouter()


@router.get("", response_model=GenericResponse, summary="List active early-warning alerts")
def get_alerts(project_id: int | None = None, severity: str | None = None):
    """Retrieve active warnings and threshold breaches."""
    return GenericResponse(
        status="placeholder",
        message="Alerts feed placeholder",
        data={
            "project_id": project_id,
            "alerts": [
                {
                    "id": 101,
                    "project_id": 1,
                    "severity": "high",
                    "alert_type": "cost_overrun_risk",
                    "message": "Projected budget variance exceeds 12% threshold.",
                    "timestamp": "2026-09-02T10:00:00Z",
                    "is_resolved": False
                },
                {
                    "id": 102,
                    "project_id": 2,
                    "severity": "critical",
                    "alert_type": "schedule_delay_risk",
                    "message": "Critical path milestone 'Pier 14 Concreting' delayed beyond buffer.",
                    "timestamp": "2026-09-01T15:30:00Z",
                    "is_resolved": False
                }
            ]
        }
    )
