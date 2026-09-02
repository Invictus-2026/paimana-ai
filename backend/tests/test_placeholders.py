"""Test placeholder API endpoints for contract compliance."""


def test_predictions_endpoint(client):
    response = client.get("/api/v1/predictions?project_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "placeholder"


def test_risks_endpoint(client):
    response = client.get("/api/v1/risks?project_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "placeholder"


def test_alerts_endpoint(client):
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["success", "placeholder"]


def test_analytics_endpoint(client):
    response = client.get("/api/v1/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "placeholder"


def test_scenarios_endpoint(client):
    payload = {
        "project_id": 1,
        "budget_delta_percent": 10.0,
        "duration_delta_days": 15,
        "supply_chain_delay_weeks": 2
    }
    response = client.post("/api/v1/scenarios/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "placeholder"
    assert data["project_id"] == 1


def test_interventions_endpoint(client):
    response = client.get("/api/v1/interventions?project_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["success", "placeholder"]
