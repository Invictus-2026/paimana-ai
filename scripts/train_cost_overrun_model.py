"""PAIMANA PredictIQ — Cost-Overrun-Only Baseline Training

Trains on the real MoSPI project dataset, which has no dates/progress/delay
data. Scope is intentionally limited to what the data supports:
  - binary_cost_overrun (classification)
  - continuous_cost_overrun_percentage (regression)

No time-series features, no chronological split (impossible without dates),
no delay/schedule targets, no Cox survival model — see
docs/superpowers/specs/2026-09-03-real-dataset-integration-design.md.
"""

import json
import logging
from pathlib import Path
from typing import Tuple

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    f1_score,
    mean_absolute_error,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

from ml.features.target_generation import (
    generate_binary_cost_overrun,
    generate_continuous_cost_overrun_percentage,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("PAIMANA_ML.CostOverrunTraining")

RANDOM_SEED = 42
FEATURE_COLUMNS = ["ministry_name", "sector", "original_cost", "cumulative_expenditure", "expenditure_ratio"]


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Builds the model feature matrix, label-encoding categoricals.

    Excludes revised_cost and cost_growth_percent since both targets are
    derived from them (target leakage).
    """
    X = df[FEATURE_COLUMNS].copy()
    for col in ["ministry_name", "sector"]:
        X[col] = LabelEncoder().fit_transform(X[col].astype(str))
    return X


def stratified_split(
    X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, random_state: int = RANDOM_SEED
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Random stratified split — no chronological split is possible on snapshot data."""
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)


def main():
    processed_path = Path("data/processed/project_monthly_dataset.parquet")
    df = pd.read_parquet(processed_path)
    logger.info(f"Loaded {len(df)} rows from {processed_path}")

    df["binary_cost_overrun"] = generate_binary_cost_overrun(df)
    df["continuous_cost_overrun_percentage"] = generate_continuous_cost_overrun_percentage(df)
    df = df.dropna(subset=["binary_cost_overrun", "continuous_cost_overrun_percentage"])

    X = build_feature_matrix(df)
    y_class = df["binary_cost_overrun"]
    y_reg = df["continuous_cost_overrun_percentage"]

    X_train, X_test, y_class_train, y_class_test = stratified_split(X, y_class)
    _, _, y_reg_train, y_reg_test = train_test_split(
        X, y_reg, test_size=0.2, random_state=RANDOM_SEED
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    classifier = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
    classifier.fit(X_train_scaled, y_class_train)
    class_preds = classifier.predict(X_test_scaled)
    class_probs = classifier.predict_proba(X_test_scaled)[:, 1]

    regressor = Ridge(random_state=RANDOM_SEED)
    regressor.fit(X_train_scaled, y_reg_train)
    reg_preds = regressor.predict(X_test_scaled)

    metrics = {
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "classification": {
            "precision": float(precision_score(y_class_test, class_preds, zero_division=0)),
            "recall": float(recall_score(y_class_test, class_preds, zero_division=0)),
            "f1_score": float(f1_score(y_class_test, class_preds, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_class_test, class_probs)) if y_class_test.nunique() > 1 else None,
        },
        "regression": {
            "mae": float(mean_absolute_error(y_reg_test, reg_preds)),
        },
        "scope_note": "Cost overrun prediction only; no delay/schedule model (dataset has no dates).",
    }
    logger.info(f"Metrics: {json.dumps(metrics, indent=2)}")

    Path("models/baseline").mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": classifier, "scaler": scaler, "feature_columns": FEATURE_COLUMNS}, "models/baseline/cost_overrun_classifier.joblib")
    joblib.dump({"model": regressor, "scaler": scaler, "feature_columns": FEATURE_COLUMNS}, "models/baseline/cost_overrun_regressor.joblib")

    Path("reports").mkdir(parents=True, exist_ok=True)
    with open("reports/cost-overrun-baseline-results.json", "w") as f:
        json.dump(metrics, f, indent=2)

    logger.info("Saved models to models/baseline/ and metrics to reports/cost-overrun-baseline-results.json")


if __name__ == "__main__":
    main()
