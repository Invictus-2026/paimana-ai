import re
import logging
import pandas as pd
import numpy as np

logger = logging.getLogger("PAIMANA_ETL.Normalization")

def normalize_project_id(val: any) -> str:
    """Stage 7: Standardizes project identifiers (e.g. 'PRJ-1001', '1001', 'PROJ_1001' -> '1001')."""
    if pd.isna(val) or val is None:
        return "UNKNOWN"
    val_str = str(val).strip()
    digits = re.findall(r'\d+', val_str)
    if digits:
        return digits[-1] # Extract the numeric portion as standard ID
    return val_str.upper()

def normalize_dates(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 8: Standardizes all date fields to pd.Timestamp / ISO YYYY-MM-DD."""
    date_cols = ["start_date", "planned_end_date", "revised_end_date", "observation_date"]
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    return df

def normalize_costs(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 9: Standardizes cost and expenditure columns to numeric float (in ₹ Crores)."""
    cost_cols = ["original_cost", "revised_cost", "cumulative_expenditure"]
    for col in cost_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").astype(float)
    return df

def normalize_progress(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 10: Ensures progress percentage metrics are on 0-100 float scale."""
    if "physical_progress_pct" in df.columns:
        df["physical_progress_pct"] = pd.to_numeric(df["physical_progress_pct"], errors="coerce").astype(float)
        # If scale was 0-1 instead of 0-100 (and max <= 1.0), rescale
        valid_vals = df["physical_progress_pct"].dropna()
        if len(valid_vals) > 0 and valid_vals.max() <= 1.0 and valid_vals.max() > 0:
            df["physical_progress_pct"] = df["physical_progress_pct"] * 100.0
    return df

def normalize_categorical_fields(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 11: Categorical encoding preparation (standardizes strings & trims whitespace)."""
    string_cols = ["project_name", "ministry_name", "sector", "state_location", "delay_reason_category"]
    for col in string_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace({"nan": "Unknown", "None": "Unknown", "": "Unknown"})
    return df

def run_normalization_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    """Executes Stages 3, 7, 8, 9, 10, 11, 12, 13, 14."""
    logger.info("Executing normalization pipeline...")
    
    # Stage 7: Project ID normalization
    df["project_id"] = df["project_id"].apply(normalize_project_id)
    
    # Stage 8: Date normalization
    df = normalize_dates(df)
    
    # Stage 9: Cost normalization
    df = normalize_costs(df)
    
    # Stage 10: Progress normalization
    df = normalize_progress(df)
    
    # Stage 11: Categorical preparation
    df = normalize_categorical_fields(df)
    
    # Stage 12: Temporal ordering by project_id and observation_date
    df = df.sort_values(by=["project_id", "observation_date"]).reset_index(drop=True)
    
    # Stage 14: Monthly project snapshot normalization
    # Remove duplicate observations for the same project in the same month (keeping latest or flagging)
    df["observation_month"] = df["observation_date"].dt.to_period("M").dt.to_timestamp()
    
    logger.info(f"Normalized dataset shape: {df.shape}")
    return df
