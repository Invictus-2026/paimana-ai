"""Recommended interventions API endpoints."""

from typing import Optional
from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel
from app.schemas.paimana import GenericResponse
from app.services.intervention_engine import InterventionEngine, ApprovalStatus

router = APIRouter()
engine = InterventionEngine()


class ApprovalRequest(BaseModel):
    new_status: ApprovalStatus
    reviewer_name: str
    reviewer_notes: str


@router.get("", response_model=GenericResponse, summary="List recommended interventions across projects")
def list_interventions(project_id: Optional[str] = None):
    """Retrieve grounded intervention recommendations for projects."""
    pid = str(project_id) if project_id else "1"
    
    mock_prediction = {
        "implementation_risk": 0.78,
        "predicted_cost_overrun_percentage": 14.5,
        "predicted_delay_duration": 150.0,
        "feature_values": {
            "milestone_slippage_rate": 0.45,
            "progress_gap_pct": 18.5,
            "cost_acceleration_mom": 4.2
        }
    }
    mock_trajectory = {"current_state": "CRITICAL"}

    recs = engine.generate_interventions_for_project(pid, mock_prediction, mock_trajectory)

    return GenericResponse(
        status="success",
        message="Recommended interventions retrieved successfully",
        data={
            "project_id": pid,
            "total_recommendations": len(recs),
            "interventions": [r.model_dump() for r in recs]
        }
    )


@router.get("/{project_id}", response_model=GenericResponse, summary="Get recommendations for a specific project")
def get_project_interventions(project_id: str):
    """Retrieve grounded, priority-ranked intervention recommendations for a specific project."""
    pid = str(project_id)
    
    mock_prediction = {
        "implementation_risk": 0.72,
        "predicted_cost_overrun_percentage": 12.0,
        "predicted_delay_duration": 120.0,
        "feature_values": {
            "milestone_slippage_rate": 0.35,
            "progress_gap_pct": 14.2,
            "cost_acceleration_mom": 3.1
        }
    }
    mock_trajectory = {"current_state": "HIGH_RISK"}

    recs = engine.generate_interventions_for_project(pid, mock_prediction, mock_trajectory)

    return GenericResponse(
        status="success",
        message=f"Intervention recommendations for project {pid} retrieved successfully",
        data={
            "project_id": pid,
            "total_recommendations": len(recs),
            "interventions": [r.model_dump() for r in recs]
        }
    )


@router.post("/{recommendation_id}/approve", response_model=GenericResponse, summary="Record human approval decision")
def approve_intervention(recommendation_id: str, request: ApprovalRequest):
    """Record human approval decision (APPROVED, REJECTED, UNDER_REVIEW) for a recommendation."""
    try:
        updated_rec = engine.update_human_approval_status(
            recommendation_id=recommendation_id,
            new_status=request.new_status,
            reviewer_notes=request.reviewer_notes,
            reviewer_name=request.reviewer_name
        )
        return GenericResponse(
            status="success",
            message=f"Human approval status updated to {request.new_status.value}",
            data=updated_rec.model_dump()
        )
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
