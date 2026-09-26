import pytest
from app.services.scenario_engine import (
    ScenarioEngine,
    ScenarioType,
    ScenarioSimulationResult,
)


@pytest.fixture
def engine():
    return ScenarioEngine()


@pytest.mark.parametrize("scenario_type", [
    ScenarioType.SCHEDULE_DELAY_1M,
    ScenarioType.SCHEDULE_DELAY_3M,
    ScenarioType.SCHEDULE_DELAY_6M,
    ScenarioType.EXPENDITURE_SLOWDOWN,
    ScenarioType.PROGRESS_SLOWDOWN,
    ScenarioType.COST_INCREASE,
    ScenarioType.PROGRESS_IMPROVEMENT,
    ScenarioType.SCHEDULE_RECOVERY,
])
def test_all_eight_scenario_types(engine, scenario_type):
    """Test 1: Verifies simulation execution across all 8 required scenario types."""
    result = engine.simulate("P101", scenario_type)
    assert isinstance(result, ScenarioSimulationResult)
    assert result.project_id == "P101"
    assert result.scenario_type == scenario_type

    # Verify Delta calculation accuracy (scenario - baseline)
    expected_risk_change = round(result.scenario.overall_risk - result.baseline.overall_risk, 4)
    assert pytest.approx(result.delta.risk_change, abs=1e-4) == expected_risk_change
    assert "DO NOT constitute guaranteed real-world outcomes" in result.audit_trail.assumptions_disclaimer


def test_delta_calculation_accuracy(engine):
    """Test 2: Verifies exact delta risk metrics calculation for schedule delay."""
    result = engine.simulate("P102", ScenarioType.SCHEDULE_DELAY_3M)
    
    assert result.delta.risk_change > 0.0 # Delay increases risk
    assert result.delta.is_risk_escalated is True
    assert result.scenario.predicted_delay_duration_days > result.baseline.predicted_delay_duration_days


def test_schedule_recovery_reduces_risk(engine):
    """Test 3: Verifies schedule recovery reduces risk metrics."""
    result = engine.simulate("P103", ScenarioType.SCHEDULE_RECOVERY)
    assert result.delta.risk_change < 0.0 # Recovery lowers risk
    assert result.delta.is_risk_escalated is False


def test_scenario_simulate_api_endpoint(client, db_session):
    """The API uses a stored budget and explicit scenario assumptions."""
    from app.models.entities import Project
    db_session.add(Project(id=104, name="Measured project", budget=1000))
    db_session.commit()
    response = client.post("/api/v1/scenarios/simulate", json={
        "project_id": 104, "duration_delta_days": 180, "budget_delta_percent": 10
    })
    assert response.status_code == 200
    result = response.json()["data"]
    assert result["projects"][0]["project_id"] == 104
    assert result["projects"][0]["schedule_buffer_days"] == 180
    assert result["total_cost_increase_cr"] == 100
