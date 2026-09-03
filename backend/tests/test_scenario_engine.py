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


def test_scenario_simulate_api_endpoint(client):
    """Test 4: Verifies POST /api/v1/scenarios/simulate endpoint."""
    payload = {
        "project_id": "P104",
        "scenario_type": "SCHEDULE_DELAY_6M",
        "simulated_by": "TestUser"
    }
    response = client.post("/api/v1/scenarios/simulate", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert json_data["data"]["project_id"] == "P104"
    assert json_data["data"]["scenario_type"] == "SCHEDULE_DELAY_6M"
    assert "delta" in json_data["data"]
    assert "audit_trail" in json_data["data"]
