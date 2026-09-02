"""Predictions API endpoints (Cost & Schedule)."""

from fastapi import APIRouter
from app.schemas.paimana import GenericResponse

router = APIRouter()


@router.get("", response_model=GenericResponse, summary="Get cost and schedule predictions")
def get_predictions(project_id: int | None = None):
    """Fetch AI model cost overrun and delay predictions."""
    return GenericResponse(
        status="placeholder",
        message="Cost and schedule prediction placeholder",
        data={
            "project_id": project_id,
            "predicted_cost_overrun_pct": 14.5,
            "predicted_delay_days": 42,
            "model_version": "cost_v1.0-stub",
            "prediction_timestamp": "2026-09-02T12:00:00Z"
        }
    )
