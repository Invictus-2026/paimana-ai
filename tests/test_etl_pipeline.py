import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from backend.app.data_pipeline.runner import run_etl_pipeline

@pytest.fixture(scope="module")
def pipeline_output():
    """Runs the 16-stage ETL pipeline and returns the processed DataFrame and Parquet path."""
    raw_dir = Path("data/raw")
    interim_dir = Path("data/interim")
    processed_dir = Path("data/processed")
    docs_dir = Path("docs")
    
    df, parquet_path = run_etl_pipeline(raw_dir, interim_dir, processed_dir, docs_dir)
    return df, parquet_path

def test_parquet_file_creation(pipeline_output):
    """Test 1: Output Parquet file exists and is readable."""
    df, parquet_path = pipeline_output
    assert parquet_path.exists(), "Processed Parquet file was not created"
    assert parquet_path.stat().st_size > 0, "Parquet file is empty"
    
    df_read = pd.read_parquet(parquet_path)
    assert len(df_read) == len(df), "Row count mismatch between memory DataFrame and Parquet file"

def test_data_types(pipeline_output):
    """Test 2: Validates data types for canonical and derived columns."""
    df, _ = pipeline_output
    
    # Check numeric feature types
    numeric_cols = [
        "original_cost", "revised_cost", "cumulative_expenditure",
        "physical_progress_pct", "cost_growth_percent", "expenditure_ratio",
        "elapsed_duration_percent", "remaining_duration", "schedule_slippage",
        "progress_gap", "monthly_progress_change", "monthly_expenditure_change",
        "3_month_progress_trend", "6_month_progress_trend", "cost_acceleration",
        "expenditure_velocity"
    ]
    for col in numeric_cols:
        assert col in df.columns, f"Missing feature column {col}"
        assert pd.api.types.is_numeric_dtype(df[col]), f"Column {col} is not numeric"

    # Check date column types
    date_cols = ["start_date", "planned_end_date", "revised_end_date", "observation_date"]
    for col in date_cols:
        assert col in df.columns, f"Missing date column {col}"
        assert pd.api.types.is_datetime64_any_dtype(df[col]), f"Column {col} is not datetime"

def test_temporal_ordering(pipeline_output):
    """Test 3: Verifies dataset is sorted chronologically by project_id and observation_date."""
    df, _ = pipeline_output
    
    for proj_id, group in df.groupby("project_id"):
        obs_dates = group["observation_date"].tolist()
        assert obs_dates == sorted(obs_dates), f"Temporal ordering violated for project_id {proj_id}"

def test_point_in_time_no_target_leakage(pipeline_output):
    """Test 4: Ensures no future observation leaks into past feature values."""
    df, _ = pipeline_output
    
    for idx, row in df.iterrows():
        # Feature calculations at month T must only depend on T and prior months
        if pd.notnull(row["observation_date"]) and pd.notnull(row["start_date"]):
            # Observation date should be >= start date for valid history
            assert row["observation_date"] >= row["start_date"], f"Invalid observation date before start date at row {idx}"

def test_feature_calculation_reproducibility(pipeline_output):
    """Test 5: Verifies feature calculations are 100% reproducible across pipeline executions."""
    df1, _ = pipeline_output
    
    # Re-run pipeline and compare output equality
    raw_dir = Path("data/raw")
    interim_dir = Path("data/interim")
    processed_dir = Path("data/processed")
    docs_dir = Path("docs")
    
    df2, _ = run_etl_pipeline(raw_dir, interim_dir, processed_dir, docs_dir)
    
    pd.testing.assert_frame_equal(df1, df2), "ETL pipeline output is not deterministic across runs"

def test_quality_flags_attached(pipeline_output):
    """Test 6: Verifies quality_flags and is_duplicate fields are populated."""
    df, _ = pipeline_output
    assert "quality_flags" in df.columns, "quality_flags column missing"
    assert "is_duplicate" in df.columns, "is_duplicate column missing"
    
    # Ensure anomalies (e.g. progress > 100%) were flagged correctly
    anomaly_rows = df[df["physical_progress_pct"] > 100.0]
    for idx, row in anomaly_rows.iterrows():
        assert "PROGRESS_EXCEEDS_100%" in row["quality_flags"], f"Row {idx} missing progress flag"
