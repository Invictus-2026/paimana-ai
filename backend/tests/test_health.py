"""Test health check endpoint."""


def test_health_check(client):
    """Verify /api/v1/health returns 200 OK with expected status payload."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert data["service"] == "PAIMANA PredictIQ API"
