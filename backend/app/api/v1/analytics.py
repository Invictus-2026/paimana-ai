"""Aggregated portfolio analytics API endpoints."""

from fastapi import APIRouter
from app.schemas.paimana import GenericResponse

router = APIRouter()


@router.get("", response_model=GenericResponse, summary="Get portfolio aggregated analytics")
def get_analytics():
    """Retrieve portfolio metrics, risk distributions, and aggregated budget trends."""
    return GenericResponse(
        status="placeholder",
        message="Aggregated analytics placeholder endpoint",
        data={
            "total_projects": 2,
            "at_risk_count": 1,
            "on_track_count": 1,
            "total_budget_allocated": 730000000.0,
            "average_risk_score": 0.48
        }
    )
