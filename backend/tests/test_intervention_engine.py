import pytest
from app.services.intervention_engine import (
    InterventionEngine,
    ApprovalStatus,
    InterventionPriority,
    InterventionRecommendation,
)


@pytest.fixture
def engine():
    return InterventionEngine()


def test_priority_score_calculation(engine):
    """Test 1: Verifies multi-factor priority calculation."""
    score, level = engine.calculate_priority_score(
        risk_score=0.85,
        trajectory_status="CRITICAL",
        budget_cr=1200.0,
        cost_overrun_pct=25.0,
        schedule_delay_days=180.0,
        strategic_importance_weight=1.2
    )
    assert score >= 80.0
    assert level == InterventionPriority.CRITICAL


def test_grounded_recommendation_generation(engine):
    """Test 2: Verifies recommendation generation with grounded evidence."""
    mock_prediction = {
        "implementation_risk": 0.82,
        "predicted_cost_overrun_percentage": 18.0,
        "predicted_delay_duration": 160.0,
        "feature_values": {
            "milestone_slippage_rate": 0.50,
            "progress_gap_pct": 16.5,
        }
    }
    mock_trajectory = {"current_state": "CRITICAL"}

    recs = engine.generate_interventions_for_project("P101", mock_prediction, mock_trajectory)
    assert len(recs) >= 2
    
    ms_rec = recs[0]
    assert isinstance(ms_rec, InterventionRecommendation)
    assert ms_rec.human_approval_required is True
    assert ms_rec.approver_role != ""
    assert "Milestone slippage rate reached 50.0%" in ms_rec.evidence
    assert ms_rec.status == ApprovalStatus.PROPOSED


def test_human_approval_status_transition(engine):
    """Test 3: Verifies approval gate status update."""
    mock_prediction = {"implementation_risk": 0.75}
    recs = engine.generate_interventions_for_project("P102", mock_prediction, {"current_state": "HIGH_RISK"})
    rec = recs[0]

    updated = engine.update_human_approval_status(
        recommendation_id=rec.recommendation_id,
        new_status=ApprovalStatus.APPROVED,
        reviewer_notes="Approved for site visit",
        reviewer_name="Shri A.K. Verma"
    )

    assert updated.status == ApprovalStatus.APPROVED
    assert "Shri A.K. Verma" in updated.reviewer_notes
    assert updated.reviewed_at is not None


def test_get_project_interventions_api(client):
    """Test 4: Verifies GET /api/v1/interventions/{project_id} endpoint."""
    response = client.get("/api/v1/interventions/P101")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "interventions" in json_data["data"]
    assert len(json_data["data"]["interventions"]) > 0


def test_approve_intervention_api(client):
    """Test 5: Verifies POST /api/v1/interventions/{id}/approve endpoint."""
    # First get a recommendation ID
    res_get = client.get("/api/v1/interventions/P101")
    rec_id = res_get.json()["data"]["interventions"][0]["recommendation_id"]

    payload = {
        "new_status": "APPROVED",
        "reviewer_name": "Dr. R. Mehta",
        "reviewer_notes": "Approval granted following technical board review."
    }
    res_post = client.post(f"/api/v1/interventions/{rec_id}/approve", json=payload)
    assert res_post.status_code == 200
    json_data = res_post.json()
    assert json_data["status"] == "success"
    assert json_data["data"]["status"] == "APPROVED"
