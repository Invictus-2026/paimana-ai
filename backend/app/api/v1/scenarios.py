"""What-if scenario simulation API endpoints."""

from fastapi import APIRouter
from app.schemas.paimana import ScenarioRequest, ScenarioResponse

router = APIRouter()


@router.post("/simulate", response_model=ScenarioResponse, summary="Simulate scenario impact")
def simulate_scenario(payload: ScenarioRequest):
    """Simulate project outcome under hypothetical budget/schedule/supply disruptions."""
    return ScenarioResponse(
        status="placeholder",
        project_id=payload.project_id,
        simulated_cost_impact=payload.budget_delta_percent * 150000.0,
        simulated_delay_impact=payload.duration_delta_days + (payload.supply_chain_delay_weeks * 7),
        risk_level_after_intervention="moderate",
        model_version="scenario_v0.1-placeholder"
    )
