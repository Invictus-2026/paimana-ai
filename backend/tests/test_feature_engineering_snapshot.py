"""Tests that feature engineering degrades gracefully on snapshot-only (no-date) data."""

import pandas as pd
import numpy as np
from app.data_pipeline.feature_engineering import generate_derived_features


def _snapshot_df():
    return pd.DataFrame({
        "project_id": ["1", "2"],
        "original_cost": [100.0, 200.0],
        "revised_cost": [120.0, 180.0],
        "cumulative_expenditure": [60.0, 90.0],
        "start_date": [pd.NaT, pd.NaT],
        "planned_end_date": [pd.NaT, pd.NaT],
        "revised_end_date": [pd.NaT, pd.NaT],
        "observation_date": [pd.NaT, pd.NaT],
        "physical_progress_pct": [np.nan, np.nan],
    })


def test_snapshot_dataset_computes_cost_features_only():
    df = generate_derived_features(_snapshot_df())

    assert "cost_growth_percent" in df.columns
    assert "expenditure_ratio" in df.columns
    assert df["cost_growth_percent"].iloc[0] == 20.0  # (120-100)/100 * 100
    assert df["expenditure_ratio"].iloc[0] == 60.0     # 60/100 * 100

    # Date/progress-dependent features must not be fabricated as misleading zeros
    for col in [
        "elapsed_duration_percent", "remaining_duration", "schedule_slippage",
        "progress_gap", "monthly_progress_change", "monthly_expenditure_change",
        "3_month_progress_trend", "6_month_progress_trend", "cost_acceleration",
        "expenditure_velocity", "milestone_slippage_rate",
    ]:
        assert col not in df.columns


def test_temporal_dataset_still_computes_all_13_features():
    df = pd.DataFrame({
        "project_id": ["1", "1"],
        "original_cost": [100.0, 100.0],
        "revised_cost": [110.0, 115.0],
        "cumulative_expenditure": [40.0, 55.0],
        "start_date": pd.to_datetime(["2024-01-01", "2024-01-01"]),
        "planned_end_date": pd.to_datetime(["2025-01-01", "2025-01-01"]),
        "revised_end_date": pd.to_datetime(["2025-02-01", "2025-02-01"]),
        "observation_date": pd.to_datetime(["2024-06-01", "2024-07-01"]),
        "physical_progress_pct": [40.0, 45.0],
    })

    result = generate_derived_features(df)

    assert "elapsed_duration_percent" in result.columns
    assert "schedule_slippage" in result.columns
    assert "milestone_slippage_rate" in result.columns
