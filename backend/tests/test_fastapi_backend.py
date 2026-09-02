import pytest
from datetime import date, datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.database import get_db, SessionLocal, engine, Base
from app.models.entities import Project, RiskPrediction, Alert, Intervention, ModelVersion

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_db():
    """Seeds test data into the database before running tests."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Seed Projects
    p1 = Project(
        id=1,
        name="Mumbai-Ahmedabad High Speed Rail",
        description="Bullet train corridor development",
        sector="Railways",
        ministry="Ministry of Railways",
        state="Gujarat",
        budget=110000.0,
        status="active",
        overall_risk_score=0.82,
        cost_overrun_pct=18.5
    )
    p2 = Project(
        id=2,
        name="Delhi-Mumbai Expressway Package 4",
        description="Greenfield 8-lane expressway",
        sector="Road Transport & Highways",
        ministry="MoRTH",
        state="Rajasthan",
        budget=45000.0,
        status="at_risk",
        overall_risk_score=0.64,
        cost_overrun_pct=12.0
    )
    p3 = Project(
        id=3,
        name="Bangalore Metro Phase 2B",
        description="Airport line expansion project",
        sector="Urban Development",
        ministry="MoHUA",
        state="Karnataka",
        budget=15000.0,
        status="completed",
        overall_risk_score=0.25,
        cost_overrun_pct=4.2
    )
    db.add_all([p1, p2, p3])
    db.commit()

    # Seed RiskPredictions
    pred1 = RiskPrediction(
        id=1,
        project_id=1,
        cost_risk_score=0.75,
        delay_risk_score=0.88,
        overall_risk_score=0.82,
        predicted_delay_days=180.0,
        predicted_cost_overrun_pct=18.5,
        model_version="v1.2.0"
    )
    db.add(pred1)

    # Seed Alerts
    a1 = Alert(
        id=1,
        project_id=1,
        severity="critical",
        alert_type="Rapid Acceleration",
        message="Risk accelerated rapidly by 15.2% over last 14 days",
        is_resolved=False
    )
    a2 = Alert(
        id=2,
        project_id=2,
        severity="high",
        alert_type="Threshold Breach",
        message="Cost overrun risk breached 60.0% threshold",
        is_resolved=False
    )
    db.add_all([a1, a2])

    # Seed Interventions
    i1 = Intervention(
        id=1,
        project_id=1,
        intervention_type="Milestone Performance Review",
        priority="critical",
        status="proposed",
        description="Audit concrete batching and structural curing timelines"
    )
    db.add(i1)

    # Seed ModelVersion
    mv1 = ModelVersion(
        id=1,
        model_name="CatBoost_Cost_Overrun_Classifier",
        version="v1.2.0",
        status="deployed"
    )
    db.add(mv1)
    db.commit()
    db.close()

    yield

    # Clean up after test
    db = SessionLocal()
    db.query(Alert).delete()
    db.query(Intervention).delete()
    db.query(RiskPrediction).delete()
    db.query(Project).delete()
    db.query(ModelVersion).delete()
    db.commit()
    db.close()


def test_get_projects_list_and_pagination():
    """Test GET /api/v1/projects with pagination."""
    response = client.get("/api/v1/projects?limit=2&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_projects_filtering():
    """Test GET /api/v1/projects with sector & status filters."""
    response = client.get("/api/v1/projects?sector=Railways&status=active")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Mumbai-Ahmedabad High Speed Rail"


def test_get_single_project():
    """Test GET /api/v1/projects/{id} success & 404."""
    response = client.get("/api/v1/projects/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1

    err_response = client.get("/api/v1/projects/9999")
    assert err_response.status_code == 404


def test_get_project_predictions():
    """Test GET /api/v1/projects/{id}/predictions success & 404."""
    response = client.get("/api/v1/projects/1/predictions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["model_version"] == "v1.2.0"

    err_response = client.get("/api/v1/projects/9999/predictions")
    assert err_response.status_code == 404


def test_get_project_risk():
    """Test GET /api/v1/projects/{id}/risk."""
    response = client.get("/api/v1/projects/1/risk")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert json_data["data"]["project_id"] == 1
    assert json_data["data"]["risk_level"] == "Critical"


def test_get_project_risk_trajectory():
    """Test GET /api/v1/projects/{id}/risk-trajectory."""
    response = client.get("/api/v1/projects/1/risk-trajectory")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "metrics" in json_data["data"]


def test_get_alerts_list_and_filtering():
    """Test GET /api/v1/alerts with filtering."""
    response = client.get("/api/v1/alerts?severity=critical")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["severity"] == "critical"


def test_get_single_alert():
    """Test GET /api/v1/alerts/{id} success & 404."""
    response = client.get("/api/v1/alerts/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1

    err_response = client.get("/api/v1/alerts/9999")
    assert err_response.status_code == 404


def test_get_analytics_overview():
    """Test GET /api/v1/analytics/overview database query aggregation."""
    response = client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    overview = json_data["data"]
    assert overview["total_projects"] == 3
    assert overview["total_budget_cr"] == 170000.0
    assert overview["active_alerts_count"] == 2
    assert overview["at_risk_projects_count"] == 2


def test_get_analytics_breakdowns():
    """Test sector, ministry, and geography analytics endpoints."""
    res_sector = client.get("/api/v1/analytics/sectors")
    assert res_sector.status_code == 200
    assert res_sector.json()["data"]["total_sectors"] >= 1

    res_min = client.get("/api/v1/analytics/ministries")
    assert res_min.status_code == 200
    assert res_min.json()["data"]["total_ministries"] >= 1

    res_geo = client.get("/api/v1/analytics/geography")
    assert res_geo.status_code == 200
    assert res_geo.json()["data"]["total_states"] >= 1


def test_get_project_interventions():
    """Test GET /api/v1/projects/{id}/interventions."""
    response = client.get("/api/v1/projects/1/interventions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["priority"] == "critical"


def test_scenario_simulate_endpoint():
    """Test POST /api/v1/scenarios/simulate endpoint."""
    payload = {
        "project_id": "1",
        "scenario_type": "SCHEDULE_DELAY_3M"
    }
    response = client.post("/api/v1/scenarios/simulate", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "delta" in json_data["data"]


def test_get_models_list():
    """Test GET /api/v1/models endpoint."""
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["model_name"] == "CatBoost_Cost_Overrun_Classifier"
