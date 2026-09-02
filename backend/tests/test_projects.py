"""Test projects CRUD endpoints."""


def test_list_projects(client):
    """Test retrieving list of projects."""
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "name" in data[0]


def test_get_project_by_id(client):
    """Test retrieving individual project detail."""
    response = client.get("/api/v1/projects/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "name" in data


def test_create_project(client):
    """Test creating a new project."""
    payload = {
        "name": "Test Express Highway Section",
        "description": "Scaffold test project",
        "start_date": "2026-03-01",
        "end_date": "2028-03-01",
        "budget": 120000000.0,
        "status": "active",
        "is_synthetic": True
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["budget"] == payload["budget"]
    assert "id" in data
