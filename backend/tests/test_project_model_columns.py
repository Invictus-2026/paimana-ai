"""Tests that Project model exposes the new real-dataset cost/identity columns."""

from app.models.entities import Project


def test_project_has_real_dataset_columns(db_session):
    project = Project(
        name="Test Project",
        external_project_id="617885",
        budget=302.88,
        revised_cost=302.88,
        cumulative_expenditure=187.77,
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    assert project.external_project_id == "617885"
    assert project.revised_cost == 302.88
    assert project.cumulative_expenditure == 187.77
