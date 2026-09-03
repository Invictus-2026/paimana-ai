import pytest
import pandas as pd
import numpy as np

from ml.explainability.shap_explainer import (
    SHAPExplainer,
    ProjectExplanationOutput,
    FeatureContribution,
)


@pytest.fixture(scope="module")
def sample_feature_df():
    """Generates synthetic dataset for SHAP testing."""
    data = {
        "project_original_budget_cr": [500.0, 1200.0, 300.0],
        "project_planned_duration_days": [730.0, 1095.0, 365.0],
        "sector_historical_overrun_avg": [20.0, 25.0, 15.0],
        "sector_historical_delay_avg_months": [14.0, 18.0, 10.0],
        "ministry_active_projects_count": [5.0, 12.0, 2.0],
        "ministry_avg_completion_rate": [0.75, 0.65, 0.85],
        "cost_expenditure_ratio": [45.0, 85.0, 25.0],
        "cost_acceleration_mom": [1.2, 5.4, -0.5],
        "schedule_remaining_days": [300.0, 100.0, 250.0],
        "schedule_elapsed_pct": [58.0, 90.0, 30.0],
        "progress_physical_pct": [50.0, 70.0, 35.0],
        "progress_gap_pct": [8.0, 20.0, -5.0],
        "progress_velocity_mom": [2.5, 0.8, 3.2],
        "progress_trend_3m": [0.5, -0.2, 1.1],
        "progress_trend_6m": [0.4, -0.1, 0.9],
        "milestone_slippage_rate": [0.2, 0.65, 0.0],
        "temporal_project_age_months": [14.0, 32.0, 4.0],
        "historical_contractor_delay_score": [0.25, 0.45, 0.10],
    }
    return pd.DataFrame(data)


def test_global_importance_calculation(sample_feature_df):
    """Test 1: Verifies global feature importance generation."""
    explainer = SHAPExplainer()
    importance = explainer.compute_global_importance(sample_feature_df)
    assert isinstance(importance, dict)
    assert len(importance) == len(explainer.FEATURE_COLUMNS)
    assert "milestone_slippage_rate" in importance


def test_project_explanation_output_schema(sample_feature_df):
    """Test 2: Verifies output structure and fields of project risk explanation."""
    explainer = SHAPExplainer()
    row = sample_feature_df.iloc[1] # High risk project row
    explanation = explainer.explain_project_risk(
        project_id="PROJ_HIGH_RISK_01",
        input_feature_row=row,
        risk_score=0.84
    )

    assert isinstance(explanation, ProjectExplanationOutput)
    assert explanation.project_id == "PROJ_HIGH_RISK_01"
    assert explanation.risk_score == 0.84
    assert explanation.risk_level == "Critical"
    assert explanation.model_version == "PAIMANA-ML-v1.0.0"
    assert "DO NOT constitute direct causal proof" in explanation.disclaimer


def test_driver_and_protective_factor_segregation(sample_feature_df):
    """Test 3: Verifies drivers have positive SHAP values and protective factors have negative SHAP values."""
    explainer = SHAPExplainer()
    row = sample_feature_df.iloc[1]
    explanation = explainer.explain_project_risk(
        project_id="PROJ_TEST",
        input_feature_row=row,
        risk_score=0.84
    )

    for driver in explanation.drivers:
        assert isinstance(driver, FeatureContribution)
        assert driver.shap_value > 0.0

    for factor in explanation.protective_factors:
        assert isinstance(factor, FeatureContribution)
        assert factor.shap_value < 0.0


def test_risk_level_bounds(sample_feature_df):
    """Test 4: Verifies risk category mapping."""
    explainer = SHAPExplainer()
    row = sample_feature_df.iloc[0]
    
    exp_low = explainer.explain_project_risk("P_LOW", row, 0.15)
    assert exp_low.risk_level == "Low"

    exp_mod = explainer.explain_project_risk("P_MOD", row, 0.35)
    assert exp_mod.risk_level == "Moderate"

    exp_high = explainer.explain_project_risk("P_HIGH", row, 0.65)
    assert exp_high.risk_level == "High"

    exp_crit = explainer.explain_project_risk("P_CRIT", row, 0.85)
    assert exp_crit.risk_level == "Critical"
