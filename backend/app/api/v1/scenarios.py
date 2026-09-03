"""What-if scenario simulation API endpoints."""

from typing import Optional, Dict, Any, Union
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.schemas.paimana import GenericResponse
from app.services.scenario_engine import ScenarioEngine, ScenarioType

router = APIRouter()
engine = ScenarioEngine()


class ScenarioSimulationInput(BaseModel):
    project_id: Union[int, str] = "P101"
    scenario_type: ScenarioType = ScenarioType.SCHEDULE_DELAY_3M
    budget_delta_percent: Optional[float] = 0.0
    duration_delta_days: Optional[int] = 0
    supply_chain_delay_weeks: Optional[int] = 0
    custom_parameters: Optional[Dict[str, Any]] = None
    simulated_by: Optional[str] = "executive_user"


@router.post("/simulate", response_model=GenericResponse, summary="Simulate scenario impact")
def simulate_scenario(payload: ScenarioSimulationInput):
    """
    Executes what-if risk scenario simulation:
    Modifies project feature conditions under assumptions, recalculates risk metrics,
    and returns baseline metrics, scenario metrics, and delta values.
    """
    custom_params = payload.custom_parameters or {}
    if payload.budget_delta_percent:
        custom_params["budget_delta_percent"] = payload.budget_delta_percent
    if payload.duration_delta_days:
        custom_params["duration_delta_days"] = payload.duration_delta_days
    if payload.supply_chain_delay_weeks:
        custom_params["duration_delta_days"] = custom_params.get("duration_delta_days", 0) + (payload.supply_chain_delay_weeks * 7)

    result = engine.simulate(
        project_id=str(payload.project_id),
        scenario_type=payload.scenario_type,
        custom_params=custom_params,
        user_id=payload.simulated_by or "executive_user"
    )

    return GenericResponse(
        status="success",
        message="What-if scenario simulation executed successfully",
        data=result.model_dump()
    )
