"""Tests for the cost-overrun-only training script's pure data functions."""

import sys
from pathlib import Path

import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from scripts.train_cost_overrun_model import build_feature_matrix


def test_build_feature_matrix_encodes_categoricals_and_keeps_numeric_features():
    df = pd.DataFrame({
        "project_id": ["1", "2", "3"],
        "ministry_name": ["Ministry A", "Ministry B", "Ministry A"],
        "sector": ["Roads", "Aviation", "Roads"],
        "original_cost": [100.0, 200.0, 150.0],
        "cumulative_expenditure": [50.0, 80.0, 90.0],
        "expenditure_ratio": [50.0, 40.0, 60.0],
        "cost_growth_percent": [10.0, 0.0, 20.0],
    })

    X = build_feature_matrix(df)

    assert "original_cost" in X.columns
    assert "expenditure_ratio" in X.columns
    # categorical columns must be numerically encoded, not left as raw strings
    assert X.select_dtypes(include="object").shape[1] == 0
    assert len(X) == 3


def test_build_feature_matrix_never_includes_leakage_columns():
    df = pd.DataFrame({
        "project_id": ["1"],
        "ministry_name": ["Ministry A"],
        "sector": ["Roads"],
        "original_cost": [100.0],
        "revised_cost": [120.0],
        "cumulative_expenditure": [50.0],
        "expenditure_ratio": [50.0],
        "cost_growth_percent": [20.0],
    })

    X = build_feature_matrix(df)

    # revised_cost and cost_growth_percent are used to derive the targets
    # (target_generation.py), so they must never leak into the feature matrix
    assert "revised_cost" not in X.columns
    assert "cost_growth_percent" not in X.columns
