import json
import logging
import pandas as pd
from pathlib import Path
from typing import List, Dict, Tuple, Any
from .schema import COLUMN_ALIASES, CANONICAL_COLUMNS

logger = logging.getLogger("PAIMANA_ETL.Ingestion")

def load_file(file_path: Path) -> pd.DataFrame:
    """Reads input data from CSV, Excel, JSON, or PDF-derived formats."""
    suffix = file_path.suffix.lower()
    
    if suffix == ".csv":
        df = pd.read_csv(file_path)
    elif suffix in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path)
    elif suffix == ".json":
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Normalize nested json if needed
        df = pd.json_normalize(data)
    else:
        raise ValueError(f"Unsupported file format: {suffix}")
    
    logger.info(f"Loaded {len(df)} rows from {file_path.name}")
    return df

def flatten_and_map_columns(df: pd.DataFrame, source_filename: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Stage 2: Schema validation & canonical mapping across heterogeneous raw formats."""
    initial_cols = list(df.columns)
    mapped_cols = {}
    unmapped_cols = []
    
    # Clean column names (strip whitespace, lowercase lookup)
    col_rename_dict = {}
    for col in initial_cols:
        # Check direct mapping (collapse embedded newlines/whitespace first,
        # since multi-line CSV headers like "Original Cost\n(in Cr)" are common
        # in real government export files)
        clean_col = " ".join(col.split())
        if clean_col in COLUMN_ALIASES:
            col_rename_dict[col] = COLUMN_ALIASES[clean_col]
            mapped_cols[col] = COLUMN_ALIASES[clean_col]
        else:
            # Flatten nested dot-notation (e.g. financials.approved_budget_cr)
            tail_col = clean_col.split(".")[-1]
            if tail_col in COLUMN_ALIASES:
                col_rename_dict[col] = COLUMN_ALIASES[tail_col]
                mapped_cols[col] = COLUMN_ALIASES[tail_col]
            else:
                unmapped_cols.append(col)

    df_renamed = df.rename(columns=col_rename_dict)
    
    schema_report = {
        "file": source_filename,
        "raw_column_count": len(initial_cols),
        "mapped_columns": mapped_cols,
        "unmapped_columns": unmapped_cols,
    }
    
    return df_renamed, schema_report

def run_ingestion_and_schema_validation(raw_dir: Path) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
    """Runs Stage 1 (Ingestion) and Stage 2 (Schema Validation) over data/raw/."""
    all_dfs = []
    schema_reports = []
    
    supported_extensions = ["*.csv", "*.xlsx", "*.xls", "*.json"]
    files = []
    for ext in supported_extensions:
        files.extend(list(raw_dir.glob(ext)))
    
    if not files:
        raise FileNotFoundError(f"No supported data files found in {raw_dir}")

    for file_path in files:
        try:
            raw_df = load_file(file_path)
            mapped_df, schema_report = flatten_and_map_columns(raw_df, file_path.name)
            mapped_df["raw_source_file"] = file_path.name
            all_dfs.append(mapped_df)
            schema_reports.append(schema_report)
        except Exception as e:
            logger.error(f"Error loading {file_path.name}: {e}")

    combined_df = pd.concat(all_dfs, ignore_index=True, sort=False)
    
    # Ensure all canonical columns exist (fill missing ones with NaN if needed)
    for col in CANONICAL_COLUMNS:
        if col not in combined_df.columns:
            combined_df[col] = None
            
    logger.info(f"Ingested {len(combined_df)} total records from {len(files)} files.")
    return combined_df, schema_reports
