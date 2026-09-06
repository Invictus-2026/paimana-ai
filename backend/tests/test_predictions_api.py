"""Tests for Cost Overrun and Time Overrun Predictions endpoints."""

def test_cost_overrun_predictions_endpoint(client):
    response = client.get("/api/v1/predictions/cost-overrun?month=2026-07&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    payload = data["data"]
    assert "summary" in payload
    assert payload["summary"]["total_projects"] > 0
    assert "sector_exposure_breakdown" in payload
    assert "projects" in payload
    assert len(payload["projects"]) > 0

    first_proj = payload["projects"][0]
    assert "cost_overrun_pct" in first_proj
    assert "cost_overrun_exposure_cr" in first_proj
    assert "overall_risk_score" in first_proj
    assert "risk_level" in first_proj


def test_time_overrun_predictions_endpoint(client):
    response = client.get("/api/v1/predictions/time-overrun?month=2026-07&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    payload = data["data"]
    assert "summary" in payload
    assert payload["summary"]["total_projects"] > 0
    assert "average_delay_days" in payload["summary"]
    assert "sector_delay_breakdown" in payload
    assert "projects" in payload
    assert len(payload["projects"]) > 0

    first_proj = payload["projects"][0]
    assert "predicted_delay_days" in first_proj
    assert "delay_severity" in first_proj
    assert "delay_risk_score" in first_proj


def test_predictions_multi_month_support(client):
    # Test that different months return different counts (e.g. 2026-06 has 1847, 2026-05 has 1987)
    res_jun = client.get("/api/v1/predictions/cost-overrun?month=2026-06&limit=5")
    assert res_jun.status_code == 200
    jun_data = res_jun.json()["data"]
    assert jun_data["summary"]["total_projects"] == 1847

    res_may = client.get("/api/v1/predictions/cost-overrun?month=2026-05&limit=5")
    assert res_may.status_code == 200
    may_data = res_may.json()["data"]
    assert may_data["summary"]["total_projects"] == 1987


def test_predictions_filtering_and_search(client):
    res = client.get("/api/v1/predictions/cost-overrun?month=2026-07&risk_level=Critical&limit=10")
    assert res.status_code == 200
    data = res.json()["data"]
    for p in data["projects"]:
        assert p["risk_level"] == "Critical"
