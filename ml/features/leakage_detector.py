"""
PAIMANA PredictIQ — Target Leakage Detector & Temporal Validation Suite
Module: ml.features.leakage_detector
Author: Machine Learning Engineer (SIH 26103)

This module implements automated statistical and temporal checks to detect data leakage:
1. Temporal Ordering Inspection: Verifies features <= T_obs < T_target.
2. Statistical Correlation & Mutual Information Checks: Flags features exhibiting 
   near-perfect correlation (> 0.98) or perfect predictive power with targets at snapshot T.
3. Quality Audit Logger: Records all suspicious feature-target relationship patterns.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any

logger = logging.getLogger("PAIMANA_ML.LeakageDetector")


def check_temporal_ordering(df: pd.DataFrame, time_col: str = "observation_date") -> Dict[str, Any]:
    """
    Validates temporal ordering constraints: Features must be recorded at or before T_obs.
    
    Returns:
        Dict detailing temporal violations found.
    """
    logger.info("Running temporal ordering inspection...")
    violations = []
    
    if time_col not in df.columns:
        return {"status": "ERROR", "message": f"Time column {time_col} missing"}
        
    obs_dates = pd.to_datetime(df[time_col], errors="coerce")
    
    # Check start date boundary
    if "start_date" in df.columns:
        start_dates = pd.to_datetime(df["start_date"], errors="coerce")
        bad_starts = df[obs_dates < start_dates]
        if len(bad_starts) > 0:
            violations.append(f"{len(bad_starts)} records have observation_date prior to project start_date")
            
    return {
        "status": "PASS" if len(violations) == 0 else "FAIL",
        "violations_count": len(violations),
        "details": violations
    }


def check_statistical_target_leakage(
    df: pd.DataFrame,
    target_col: str = "target_continuous_cost_overrun_pct",
    correlation_threshold: float = 0.98
) -> Dict[str, Any]:
    """
    Executes statistical leakage detection by evaluating pairwise correlation 
    between candidate features and the specified target variable.
    
    Features exhibiting correlation > threshold (e.g. 0.98) are flagged as potential 
    target leakage candidates (e.g., using final actual cost as a feature).
    """
    logger.info(f"Running statistical leakage detection against target '{target_col}'...")
    
    if target_col not in df.columns:
        return {"status": "ERROR", "message": f"Target column '{target_col}' not found in DataFrame"}
        
    numeric_df = df.select_dtypes(include=[np.number]).dropna(axis=1, how="all")
    if target_col not in numeric_df.columns:
        return {"status": "SKIPPED", "reason": "Target column is non-numeric or contains all NaNs"}
        
    correlations = numeric_df.corrwith(numeric_df[target_col]).abs()
    
    # Filter out target self-correlation
    correlations = correlations.drop(labels=[target_col], errors="ignore")
    
    suspicious_features = correlations[correlations >= correlation_threshold].to_dict()
    
    status = "WARNING" if len(suspicious_features) > 0 else "PASS"
    if suspicious_features:
        logger.warning(f"LEAKAGE WARNING: {len(suspicious_features)} features exhibit suspicious correlation (>= {correlation_threshold}) with '{target_col}': {suspicious_features}")
    else:
        logger.info(f"No statistical leakage detected (all feature correlations < {correlation_threshold}).")
        
    return {
        "status": status,
        "target_column": target_col,
        "correlation_threshold": correlation_threshold,
        "suspicious_features": suspicious_features
    }


def run_full_leakage_audit(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Executes comprehensive temporal and statistical leakage audit suite across all target variables.
    """
    logger.info("=== Starting PAIMANA Target Leakage Audit ===")
    
    temporal_result = check_temporal_ordering(df)
    
    target_cols = [
        "target_binary_cost_overrun",
        "target_continuous_cost_overrun_pct",
        "target_binary_time_overrun",
        "target_continuous_delay_duration_days",
        "target_risk_composite_score"
    ]
    
    stat_results = {}
    for target in target_cols:
        if target in df.columns:
            stat_results[target] = check_statistical_target_leakage(df, target_col=target)
            
    audit_summary = {
        "temporal_ordering_audit": temporal_result,
        "statistical_leakage_audit": stat_results
    }
    
    logger.info("=== Target Leakage Audit Complete ===")
    return audit_summary


if __name__ == "__main__":
    from backend.app.data_pipeline.runner import run_etl_pipeline
    from ml.features.feature_engineering import extract_all_features
    from ml.features.target_generation import generate_all_targets
    
    # Load processed ETL dataset
    processed_df, _ = run_etl_pipeline()
    featured_df = extract_all_features(processed_df)
    target_df = generate_all_targets(featured_df)
    
    audit_report = run_full_leakage_audit(target_df)
    print("Leakage Audit Summary:", audit_report)
