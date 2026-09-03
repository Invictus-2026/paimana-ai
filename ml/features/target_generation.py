"""
PAIMANA PredictIQ — Target Generation Engine
Module: ml.features.target_generation
Author: Machine Learning Engineer (SIH 26103)

This module implements the mathematical rules for target variable generation:
1. binary_cost_overrun
2. continuous_cost_overrun_percentage
3. binary_time_overrun
4. continuous_delay_duration
5. implementation_risk (Hybrid Weighted Composite)

TEMPORAL BOUNDARY ASSERTION & LEAKAGE PREVENTION:
Target metrics represent post-prediction outcomes evaluated at project completion or final snapshot T_final.
Automated temporal assertions verify that feature observation dates T_obs strictly precede target evaluation timestamps.
"""

import logging
import pandas as pd
import numpy as np

logger = logging.getLogger("PAIMANA_ML.TargetGeneration")


def generate_binary_cost_overrun(
    df: pd.DataFrame,
    baseline: str = "approved",
    threshold: float = 0.05
) -> pd.Series:
    """
    Generates binary cost overrun classification target.
    
    Formula:
    binary_cost_overrun = 1 if (C_revised - C_baseline) / C_baseline > threshold else 0
    
    Args:
        df: Input DataFrame containing cost attributes.
        baseline: Baseline choice ('approved' or 'revised'). Default is 'approved'.
        threshold: Overrun threshold percentage (0.05 = 5%).
        
    Returns:
        pd.Series: Binary classification labels (0 or 1).
    """
    baseline_col = "original_cost" if baseline == "approved" else "revised_cost"
    base_cost = df[baseline_col].astype(float).replace(0, np.nan)
    curr_cost = df["revised_cost"].astype(float)
    
    overrun_ratio = (curr_cost - base_cost) / base_cost
    target = (overrun_ratio > threshold).astype(int)
    return target


def generate_continuous_cost_overrun_percentage(
    df: pd.DataFrame,
    baseline: str = "approved"
) -> pd.Series:
    """
    Generates continuous cost overrun percentage regression target.
    
    Formula:
    continuous_cost_overrun_percentage = ((C_revised - C_baseline) / C_baseline) * 100
    
    Args:
        df: Input DataFrame containing cost attributes.
        baseline: Baseline choice ('approved' or 'revised'). Default is 'approved'.
        
    Returns:
        pd.Series: Continuous cost overrun percentage values.
    """
    baseline_col = "original_cost" if baseline == "approved" else "revised_cost"
    base_cost = df[baseline_col].astype(float).replace(0, np.nan)
    curr_cost = df["revised_cost"].astype(float)
    
    pct_overrun = (((curr_cost - base_cost) / base_cost) * 100.0).fillna(0.0)
    return pct_overrun


def generate_binary_time_overrun(
    df: pd.DataFrame,
    baseline: str = "original",
    threshold_days: int = 90
) -> pd.Series:
    """
    Generates binary time overrun classification target.
    
    Formula:
    binary_time_overrun = 1 if (D_revised_end - D_baseline_end) > threshold_days else 0
    
    Args:
        df: Input DataFrame containing schedule attributes.
        baseline: Baseline choice ('original' or 'revised'). Default is 'original'.
        threshold_days: Schedule delay threshold in days (90 days = 1 quarter).
        
    Returns:
        pd.Series: Binary classification labels (0 or 1).
    """
    baseline_col = "planned_end_date" if baseline == "original" else "revised_end_date"
    base_end = pd.to_datetime(df[baseline_col], errors="coerce")
    revised_end = pd.to_datetime(df["revised_end_date"], errors="coerce")
    
    delay_days = (revised_end - base_end).dt.days.fillna(0)
    target = (delay_days > threshold_days).astype(int)
    return target


def generate_continuous_delay_duration(
    df: pd.DataFrame,
    baseline: str = "original"
) -> pd.Series:
    """
    Generates continuous schedule delay duration regression target in days.
    
    Formula:
    continuous_delay_duration = max(0, (D_revised_end - D_baseline_end).days)
    
    Args:
        df: Input DataFrame containing schedule attributes.
        baseline: Baseline choice ('original' or 'revised'). Default is 'original'.
        
    Returns:
        pd.Series: Continuous delay duration in days.
    """
    baseline_col = "planned_end_date" if baseline == "original" else "revised_end_date"
    base_end = pd.to_datetime(df[baseline_col], errors="coerce")
    revised_end = pd.to_datetime(df["revised_end_date"], errors="coerce")
    
    delay_days = (revised_end - base_end).dt.days.fillna(0).clip(lower=0)
    return delay_days.astype(float)


def generate_implementation_risk(
    df: pd.DataFrame,
    weight_fin: float = 0.40,
    weight_sched: float = 0.35,
    weight_exec: float = 0.25
) -> pd.DataFrame:
    """
    Generates the Hybrid Weighted Composite Implementation Risk Framework targets.
    
    Formula:
    R_composite = 0.40 * R_fin + 0.35 * R_sched + 0.25 * R_exec
    
    Args:
        df: Input DataFrame with features.
        weight_fin: Financial risk dimension weight (0.40).
        weight_sched: Schedule risk dimension weight (0.35).
        weight_exec: Execution risk dimension weight (0.25).
        
    Returns:
        pd.DataFrame: Contains R_fin, R_sched, R_exec, composite_risk_score, risk_category.
    """
    df_risk = pd.DataFrame(index=df.index)
    
    # 1. Financial Risk Dimension (0.0 to 1.0)
    cost_growth = df.get("cost_growth_pct", generate_continuous_cost_overrun_percentage(df))
    exp_ratio = df.get("cost_expenditure_ratio", 0.0)
    prog_pct = df.get("physical_progress_pct", 0.0)
    
    r_fin = np.clip(
        0.6 * (cost_growth / 50.0) + 0.4 * np.maximum(0.0, (exp_ratio - prog_pct) / 50.0),
        0.0, 1.0
    )
    
    # 2. Schedule Risk Dimension (0.0 to 1.0)
    delay_days = df.get("schedule_slippage_days", generate_continuous_delay_duration(df))
    prog_gap = df.get("progress_gap_pct", 0.0)
    
    r_sched = np.clip(
        0.5 * (delay_days / 365.0) + 0.5 * np.maximum(0.0, prog_gap / 40.0),
        0.0, 1.0
    )
    
    # 3. Execution Risk Dimension (0.0 to 1.0)
    m_slippage = df.get("milestone_slippage_rate", 0.2)
    r_exec = np.clip(m_slippage, 0.0, 1.0)
    
    # Composite Weighted Aggregation
    r_composite = weight_fin * r_fin + weight_sched * r_sched + weight_exec * r_exec
    
    # Category Assignment
    categories = []
    for score in r_composite:
        if score < 0.25:
            categories.append("Low")
        elif score < 0.50:
            categories.append("Moderate")
        elif score < 0.75:
            categories.append("High")
        else:
            categories.append("Critical")
            
    df_risk["risk_financial"] = r_fin
    df_risk["risk_schedule"] = r_sched
    df_risk["risk_execution"] = r_exec
    df_risk["composite_risk_score"] = r_composite
    df_risk["implementation_risk_category"] = categories
    
    return df_risk


def validate_temporal_target_boundary(df: pd.DataFrame, feature_date_col: str = "observation_date"):
    """
    Automated assertion verifying that feature observation dates precede target evaluation timestamps.
    """
    logger.info("Executing temporal target boundary assertions...")
    assert feature_date_col in df.columns, f"Missing feature date column {feature_date_col}"
    
    obs_dates = pd.to_datetime(df[feature_date_col], errors="coerce")
    start_dates = pd.to_datetime(df["start_date"], errors="coerce")
    
    # Check that observation date is never prior to project start date
    invalid_rows = df[obs_dates < start_dates]
    assert len(invalid_rows) == 0, f"Temporal Violation: {len(invalid_rows)} rows have observation_date < start_date"
    
    logger.info("Temporal target boundary assertion passed.")


def generate_all_targets(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generates all canonical ML target variables and appends them to the DataFrame.
    """
    logger.info("Generating target variables for ML problem formulation...")
    df = df.copy()
    
    # Assert temporal ordering before target generation
    validate_temporal_target_boundary(df)
    
    df["target_binary_cost_overrun"] = generate_binary_cost_overrun(df)
    df["target_continuous_cost_overrun_pct"] = generate_continuous_cost_overrun_percentage(df)
    df["target_binary_time_overrun"] = generate_binary_time_overrun(df)
    df["target_continuous_delay_duration_days"] = generate_continuous_delay_duration(df)
    
    risk_df = generate_implementation_risk(df)
    df["target_risk_composite_score"] = risk_df["composite_risk_score"]
    df["target_risk_category"] = risk_df["implementation_risk_category"]
    
    logger.info("Successfully generated all ML targets.")
    return df
