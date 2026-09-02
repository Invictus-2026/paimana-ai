import logging
import pandas as pd
from pathlib import Path
from typing import Tuple

from .ingestion import run_ingestion_and_schema_validation
from .normalization import run_normalization_pipeline
from .quality_checks import (
    detect_duplicates,
    analyze_missingness,
    detect_anomalies_and_quality_flags,
    generate_markdown_quality_report,
)
from .feature_engineering import generate_derived_features, validate_target_leakage

# Setup logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("PAIMANA_ETL.Runner")

def run_etl_pipeline(
    raw_dir: Path = Path("data/raw"),
    interim_dir: Path = Path("data/interim"),
    processed_dir: Path = Path("data/processed"),
    docs_dir: Path = Path("docs")
) -> Tuple[pd.DataFrame, Path]:
    """
    Executes the 16-stage production ETL pipeline deterministically.
    
    Returns:
        Tuple of (Final Processed DataFrame, Output Parquet Path)
    """
    logger.info("=== Starting PAIMANA PredictIQ 16-Stage ETL Pipeline ===")
    
    interim_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    docs_dir.mkdir(parents=True, exist_ok=True)
    
    # Stage 1 & 2: Ingestion and Schema Validation
    logger.info("Stage 1 & 2: Ingesting raw multi-format files and validating schema...")
    raw_df, schema_reports = run_ingestion_and_schema_validation(raw_dir)
    raw_df.to_csv(interim_dir / "01_ingested_raw.csv", index=False)
    
    # Stages 3, 7-14: Normalization, Temporal Ordering, Snapshot Structure
    logger.info("Stages 3, 7-14: Normalizing data types, project IDs, dates, costs, progress, and ordering...")
    normalized_df = run_normalization_pipeline(raw_df)
    normalized_df.to_csv(interim_dir / "02_normalized_interim.csv", index=False)
    
    # Stage 4: Duplicate Detection
    logger.info("Stage 4: Identifying and flagging duplicate records...")
    dedup_df, dup_report = detect_duplicates(normalized_df)
    
    # Stage 5: Missing Value Analysis
    logger.info("Stage 5: Analyzing missing value patterns...")
    missing_report = analyze_missingness(dedup_df)
    
    # Stage 6 & 16: Outlier Detection, Anomaly Flagging & Quality Reporting
    logger.info("Stage 6 & 16: Flagging domain anomalies and generating quality report...")
    quality_df, anomalies_report = detect_anomalies_and_quality_flags(dedup_df)
    
    quality_report_path = docs_dir / "data-quality-report.md"
    generate_markdown_quality_report(
        schema_reports,
        dup_report,
        missing_report,
        anomalies_report,
        quality_report_path
    )
    
    # Stage 15: Feature Generation (Derived Point-in-Time Variables)
    logger.info("Stage 15: Generating 13 derived point-in-time features...")
    featured_df = generate_derived_features(quality_df)
    
    # Stage 16: Dataset Validation & Target Leakage Check
    logger.info("Stage 16: Validating dataset integrity and checking for target leakage...")
    validate_target_leakage(featured_df)
    
    # Export Final Processed Analytical Dataset
    output_parquet_path = processed_dir / "project_monthly_dataset.parquet"
    featured_df.to_parquet(output_parquet_path, index=False, engine="pyarrow")
    logger.info(f"Successfully exported final analytical dataset to {output_parquet_path} ({len(featured_df)} rows, {len(featured_df.columns)} columns)")
    
    # Also save CSV copy in processed for human inspection if needed
    featured_df.to_csv(processed_dir / "project_monthly_dataset.csv", index=False)
    
    logger.info("=== PAIMANA PredictIQ ETL Pipeline Completed Successfully ===")
    return featured_df, output_parquet_path

if __name__ == "__main__":
    run_etl_pipeline()
