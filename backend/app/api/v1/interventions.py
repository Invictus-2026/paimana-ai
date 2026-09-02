"""Recommended interventions API endpoints."""

from fastapi import APIRouter
from app.schemas.paimana import GenericResponse

router = APIRouter()


@router.get("", response_model=GenericResponse, summary="List recommended interventions")
def list_interventions(project_id: int | None = None):
    """Retrieve recommended corrective actions for projects exceeding risk threshold."""
    return GenericResponse(
        status="placeholder",
        message="Recommended interventions placeholder endpoint",
        data={
            "project_id": project_id,
            "interventions": [
                {
                    "id": 1,
                    "project_id": project_id or 1,
                    "intervention_type": "Schedule Fast-Tracking",
                    "priority": "high",
                    "status": "proposed",
                    "description": "Parallelize non-critical path structural concrete curing."
                }
            ]
        }
    )
