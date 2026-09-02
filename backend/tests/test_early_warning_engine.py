import pytest
from datetime import datetime, timedelta
from app.services.early_warning_engine import (
    EarlyWarningEngine,
    RiskState,
    SeverityLevel,
    AlertType,
    RiskMetrics,
)
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def engine():
    return EarlyWarningEngine(cooldown_days=7.0)


def test_trajectory_metrics_calculation(engine):
    """Test 1: Verifies trajectory metric calculation for a deteriorating project."""
    obs = [
        {"timestamp": "2026-08-01T00:00:00Z", "risk_score": 0.40},
        {"timestamp": "2026-08-10T00:00:00Z", "risk_score": 0.45},
        {"timestamp": "2026-08-20T00:00:00Z", "risk_score": 0.52},
        {"timestamp": "2026-08-30T00:00:00Z", "risk_score": 0.65},
    ]
    
    metrics = engine.calculate_trajectory_metrics("P101", obs)
    assert isinstance(metrics, RiskMetrics)
    assert metrics.current_risk == 0.65
    assert metrics.previous_risk == 0.52
    assert metrics.risk_delta == 0.13
    assert metrics.risk_velocity > 0.0
    assert metrics.consecutive_deterioration == 3
    assert metrics.current_state in [RiskState.HIGH_RISK, RiskState.ESCALATING, RiskState.CRITICAL]


def test_state_machine_transitions(engine):
    """Test 2: Verifies FSM state transition logic."""
    assert engine.transition_state(0.15, 0.14, 0.0001, 0.0, 0) == RiskState.STABLE
    assert engine.transition_state(0.35, 0.30, 0.002, 0.0, 1) == RiskState.WATCH
    assert engine.transition_state(0.45, 0.40, 0.004, 0.003, 3) == RiskState.ESCALATING
    assert engine.transition_state(0.60, 0.55, 0.005, 0.0, 1) == RiskState.HIGH_RISK
    assert engine.transition_state(0.78, 0.70, 0.008, 0.0, 2) == RiskState.CRITICAL


def test_alert_generation_and_prioritization(engine):
    """Test 3: Verifies alert generation and priority score calculation."""
    obs = [
        {"timestamp": "2026-08-01T00:00:00Z", "risk_score": 0.50},
        {"timestamp": "2026-08-15T00:00:00Z", "risk_score": 0.65},
        {"timestamp": "2026-09-01T00:00:00Z", "risk_score": 0.78},
    ]
    metrics = engine.calculate_trajectory_metrics("P102", obs)
    alert = engine.evaluate_and_generate_alerts("P102", metrics, project_impact_weight=2.0)
    
    assert alert is not None
    assert alert.project_id == "P102"
    assert alert.severity == SeverityLevel.CRITICAL
    assert alert.priority_score > 2.0


def test_alert_cooldown_deduplication(engine):
    """Test 4: Verifies suppression of duplicate alerts within cooldown window."""
    obs = [
        {"timestamp": "2026-08-01T00:00:00Z", "risk_score": 0.35},
        {"timestamp": "2026-08-15T00:00:00Z", "risk_score": 0.40},
    ]
    metrics = engine.calculate_trajectory_metrics("P103", obs)
    
    # First alert should trigger
    alert1 = engine.evaluate_and_generate_alerts("P103", metrics)
    assert alert1 is not None

    # Immediate second evaluation should be suppressed by cooldown
    alert2 = engine.evaluate_and_generate_alerts("P103", metrics)
    assert alert2 is None


def test_alerts_api_endpoint():
    """Test 5: Verifies GET /api/v1/alerts endpoint."""
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    json_data = response.json()
    assert isinstance(json_data, list)


def test_project_risk_trajectory_api_endpoint():
    """Test 6: Verifies GET /api/v1/projects/{id}/risk-trajectory endpoint."""
    response = client.get("/api/v1/projects/1/risk-trajectory")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "metrics" in json_data["data"]
    assert json_data["data"]["project_id"] == "1"
