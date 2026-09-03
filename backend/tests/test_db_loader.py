"""Tests for loading real dataset rows into the Project table."""

import pandas as pd
from app.data_pipeline.db_loader import load_projects_from_dataframe
from app.models.entities import Project


def _sample_df():
    return pd.DataFrame({
        "project_id": ["617885", "400010"],
        "project_name": ["Test Road Project", "Test Airport Project"],
        "ministry_name": ["Ministry of Road Transport & Highways", "Ministry of Civil Aviation"],
        "sector": ["Roads & Highways", "Aviation & Aviation Infrastructure"],
        "original_cost": [302.88, 480.0],
        "revised_cost": [302.88, 640.0],
        "cumulative_expenditure": [187.77, 512.55],
        "cost_growth_percent": [0.0, 33.33],
    })


def test_load_creates_projects(db_session):
    count = load_projects_from_dataframe(db_session, _sample_df())

    assert count == 2
    projects = db_session.query(Project).order_by(Project.external_project_id).all()
    assert len(projects) == 2
    assert projects[0].external_project_id == "400010"
    assert projects[0].name == "Test Airport Project"
    assert projects[0].ministry == "Ministry of Civil Aviation"
    assert projects[0].budget == 480.0
    assert projects[0].revised_cost == 640.0
    assert projects[0].cumulative_expenditure == 512.55
    assert round(projects[0].cost_overrun_pct, 2) == 33.33
    assert projects[0].is_synthetic is False


def test_load_is_idempotent_on_rerun(db_session):
    df = _sample_df()
    load_projects_from_dataframe(db_session, df)
    count_second_run = load_projects_from_dataframe(db_session, df)

    assert count_second_run == 2
    assert db_session.query(Project).count() == 2  # no duplicate rows created


def test_load_updates_existing_project_on_rerun_with_changed_cost(db_session):
    df = _sample_df()
    load_projects_from_dataframe(db_session, df)

    updated_df = df.copy()
    updated_df.loc[updated_df["project_id"] == "617885", "revised_cost"] = 350.0
    load_projects_from_dataframe(db_session, updated_df)

    project = db_session.query(Project).filter_by(external_project_id="617885").first()
    assert project.revised_cost == 350.0
