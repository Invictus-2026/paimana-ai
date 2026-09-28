"""Tests for the AI-assisted overrun analysis endpoint (Ollama-backed)."""
import json
import httpx
import pytest
from app.models.entities import Project, RiskPrediction, RiskFactor, Alert


@pytest.fixture(autouse=True)
def seed(db_session):
    p = Project(id=1, name="Test Corridor", sector="Roads", ministry="MoRTH", state="Bihar",
                budget=1000.0, status="active", overall_risk_score=0.7, cost_overrun_pct=15.0)
    db_session.add(p)
    db_session.commit()
    pred = RiskPrediction(id=1, project_id=1, cost_risk_score=0.7, delay_risk_score=0.6,
                           overall_risk_score=0.7, predicted_delay_days=90.0,
                           predicted_cost_overrun_pct=15.0, model_version="v1")
    db_session.add(pred)
    db_session.commit()
    db_session.add(RiskFactor(prediction_id=1, factor_name="contractor_delay_score", factor_value=0.8, shap_value=0.3))
    db_session.commit()


def _fake_ollama_response(payload: dict):
    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {"message": {"content": json.dumps(payload)}}

    def _post(*args, **kwargs):
        return FakeResponse()

    return _post


def test_overrun_analysis_returns_reason_and_prevention(client, monkeypatch):
    monkeypatch.setenv("OLLAMA_MODEL", "test-model")
    monkeypatch.setattr(httpx, "post", _fake_ollama_response({
        "reason": "Cost growth driven by contractor delay risk factor.",
        "prevention_steps": ["Escalate contractor performance review", "Front-load procurement of steel"],
        "severity": "medium",
        "alert_message": "Project 1 flagged for moderate overrun risk.",
    }))

    response = client.post("/api/v1/intelligence/overrun-analysis/1")

    assert response.status_code == 200
    body = response.json()
    assert body["reason"]
    assert len(body["prevention_steps"]) >= 1
    assert body["severity"] == "medium"
    assert body["factors"][0]["name"] == "contractor_delay_score"


def test_overrun_analysis_creates_alert_on_high_severity(client, monkeypatch, db_session):
    monkeypatch.setenv("OLLAMA_MODEL", "test-model")
    monkeypatch.setattr(httpx, "post", _fake_ollama_response({
        "reason": "Severe cost acceleration.",
        "prevention_steps": ["Renegotiate contract terms"],
        "severity": "critical",
        "alert_message": "Critical overrun risk on Project 1.",
    }))

    response = client.post("/api/v1/intelligence/overrun-analysis/1")

    assert response.status_code == 200
    alerts = db_session.query(Alert).filter_by(project_id=1).all()
    assert len(alerts) == 1
    assert alerts[0].severity == "critical"
    assert alerts[0].alert_type == "ai_overrun_analysis"


def test_overrun_analysis_404_without_prediction(client, monkeypatch):
    monkeypatch.setenv("OLLAMA_MODEL", "test-model")
    response = client.post("/api/v1/intelligence/overrun-analysis/999")
    assert response.status_code == 404


def test_overrun_analysis_503_without_ollama_configured(client, monkeypatch):
    monkeypatch.delenv("OLLAMA_MODEL", raising=False)
    response = client.post("/api/v1/intelligence/overrun-analysis/1")
    assert response.status_code == 503


def test_overrun_analysis_502_on_ollama_failure(client, monkeypatch):
    monkeypatch.setenv("OLLAMA_MODEL", "test-model")

    def _raise(*args, **kwargs):
        raise httpx.ConnectError("connection refused")

    monkeypatch.setattr(httpx, "post", _raise)
    response = client.post("/api/v1/intelligence/overrun-analysis/1")
    assert response.status_code == 502


def test_overrun_analysis_502_on_invalid_json(client, monkeypatch):
    monkeypatch.setenv("OLLAMA_MODEL", "test-model")

    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {"message": {"content": "not valid json"}}

    monkeypatch.setattr(httpx, "post", lambda *a, **k: FakeResponse())
    response = client.post("/api/v1/intelligence/overrun-analysis/1")
    assert response.status_code == 502
