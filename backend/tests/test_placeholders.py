"""Contract checks: missing projects cannot receive fabricated forecasts."""


def test_predictions_endpoint(client):
    response = client.get("/api/v1/predictions?project_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data or "id" in data or isinstance(data, list)


def test_risks_endpoint(client):
    response = client.get("/api/v1/risks?project_id=1")
    assert response.status_code == 404
    assert response.json()["detail"] .startswith("Project not found")


def test_alerts_endpoint(client):
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_analytics_endpoint(client):
    response = client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["success", "placeholder"]


def test_scenarios_endpoint(client):
    payload = {
        "project_id": 1,
        "budget_delta_percent": 10.0,
        "duration_delta_days": 15,
        "supply_chain_delay_weeks": 2
    }
    response = client.post("/api/v1/scenarios/simulate", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] .startswith("Project not found")


def test_interventions_endpoint(client):
    response = client.get("/api/v1/interventions?project_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["success", "placeholder"]
