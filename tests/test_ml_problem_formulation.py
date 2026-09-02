import pytest
import pandas as pd
import numpy as np
from pathlib import Path

from backend.app.data_pipeline.runner import run_etl_pipeline
from ml.features.feature_engineering import extract_all_features
from ml.features.target_generation import (
    generate_binary_cost_overrun,
    generate_continuous_cost_overrun_percentage,
    generate_binary_time_overrun,
    generate_continuous_delay_duration,
    generate_implementation_risk,
    generate_all_targets,
    validate_temporal_target_boundary,
)
from ml.features.leakage_detector import check_temporal_ordering, check_statistical_target_leakage, run_full_leakage_audit


@pytest.fixture(scope="module")
def ml_dataset():
    """Generates the full dataset with extracted features and target labels."""
    df, _ = run_etl_pipeline()
    df_featured = extract_all_features(df)
    df_targeted = generate_all_targets(df_featured)
    return df_targeted


def test_target_generation_columns(ml_dataset):
    """Test 1: Verifies all target columns exist and have correct types."""
    required_targets = [
        "target_binary_cost_overrun",
        "target_continuous_cost_overrun_pct",
        "target_binary_time_overrun",
        "target_continuous_delay_duration_days",
        "target_risk_composite_score",
        "target_risk_category",
    ]
    for target_col in required_targets:
        assert target_col in ml_dataset.columns, f"Missing target column {target_col}"

    assert pd.api.types.is_numeric_dtype(ml_dataset["target_binary_cost_overrun"])
    assert pd.api.types.is_numeric_dtype(ml_dataset["target_continuous_cost_overrun_pct"])
    assert pd.api.types.is_numeric_dtype(ml_dataset["target_binary_time_overrun"])
    assert pd.api.types.is_numeric_dtype(ml_dataset["target_continuous_delay_duration_days"])
    assert pd.api.types.is_numeric_dtype(ml_dataset["target_risk_composite_score"])


def test_temporal_target_boundary_assertion(ml_dataset):
    """Test 2: Verifies temporal assertions pass (observation_date >= start_date)."""
    # Should execute without throwing AssertionError
    validate_temporal_target_boundary(ml_dataset)


def test_leakage_detector_temporal_checks(ml_dataset):
    """Test 3: Executes leakage detector temporal check suite."""
    temporal_res = check_temporal_ordering(ml_dataset)
    assert temporal_res["status"] == "PASS"
    assert temporal_res["violations_count"] == 0


def test_leakage_detector_full_audit(ml_dataset):
    """Test 4: Executes full statistical and temporal leakage audit."""
    audit_res = run_full_leakage_audit(ml_dataset)
    assert "temporal_ordering_audit" in audit_res
    assert "statistical_leakage_audit" in audit_res


def test_risk_category_assignments(ml_dataset):
    """Test 5: Verifies risk category assignments match defined thresholds."""
    risk_categories = set(ml_dataset["target_risk_category"].unique())
    valid_categories = {"Low", "Moderate", "High", "Critical"}
    assert risk_categories.issubset(valid_categories), f"Invalid risk category found: {risk_categories}"
