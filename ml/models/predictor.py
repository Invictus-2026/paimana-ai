import logging
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field, field_validator

from ml.models.registry import ModelRegistry

logger = logging.getLogger("PAIMANA_ML.ProductionPredictor")


class PredictionInput(BaseModel):
    """Production Pydantic schema for raw project snapshot input features."""
    project_id: str
    observation_date: Optional[str] = None
    project_original_budget_cr: Optional[float] = None
    project_planned_duration_days: Optional[float] = None
    sector_historical_overrun_avg: Optional[float] = 20.0
    sector_historical_delay_avg_months: Optional[float] = 14.0
    ministry_active_projects_count: Optional[float] = 1.0
    ministry_avg_completion_rate: Optional[float] = 0.70
    cost_expenditure_ratio: Optional[float] = None
    cost_acceleration_mom: Optional[float] = 0.0
    schedule_remaining_days: Optional[float] = None
    schedule_elapsed_pct: Optional[float] = None
    progress_physical_pct: Optional[float] = None
    progress_gap_pct: Optional[float] = None
    progress_velocity_mom: Optional[float] = 0.0
    progress_trend_3m: Optional[float] = 0.0
    progress_trend_6m: Optional[float] = 0.0
    milestone_slippage_rate: Optional[float] = 0.0
    temporal_project_age_months: Optional[float] = 0.0
    historical_contractor_delay_score: Optional[float] = 0.25


class PredictionOutput(BaseModel):
    """Production Pydantic schema for project prediction payload."""
    project_id: str
    prediction_timestamp: str
    cost_overrun_probability: float = Field(..., ge=0.0, le=1.0)
    predicted_cost_overrun_percentage: float
    delay_probability: float = Field(..., ge=0.0, le=1.0)
    predicted_delay_duration: float = Field(..., description="Delay duration in days")
    implementation_risk: float = Field(..., ge=0.0, le=1.0)
    model_version: str
    confidence_bounds: Dict[str, Any]


class ProductionPredictor:
    """
    Production inference engine loading champion models from models/ directory,
    enforcing feature missingness thresholds, calculating confidence intervals,
    and outputting schema-validated prediction payloads.
    """

    FEATURE_COLUMNS = [
        "project_original_budget_cr",
        "project_planned_duration_days",
        "sector_historical_overrun_avg",
        "sector_historical_delay_avg_months",
        "ministry_active_projects_count",
        "ministry_avg_completion_rate",
        "cost_expenditure_ratio",
        "cost_acceleration_mom",
        "schedule_remaining_days",
        "schedule_elapsed_pct",
        "progress_physical_pct",
        "progress_gap_pct",
        "progress_velocity_mom",
        "progress_trend_3m",
        "progress_trend_6m",
        "milestone_slippage_rate",
        "temporal_project_age_months",
        "historical_contractor_delay_score",
    ]

    def __init__(
        self,
        models_dir: Path = Path("models"),
        missing_threshold_pct: float = 20.0
    ):
        self.models_dir = models_dir
        self.missing_threshold_pct = missing_threshold_pct
        self.registry = ModelRegistry(registry_path=models_dir / "model_registry.json")
        self.models: Dict[str, Any] = {}
        self._load_production_models()

    def _load_production_models(self):
        """Loads serialized champion production models."""
        try:
            # Cost Overrun Models
            if (self.models_dir / "xgboost_cost_regressor.joblib").exists():
                self.models["cost_reg"] = joblib.load(self.models_dir / "xgboost_cost_regressor.joblib")
            elif (self.models_dir / "random_forest_cost_regressor.joblib").exists():
                self.models["cost_reg"] = joblib.load(self.models_dir / "random_forest_cost_regressor.joblib")

            if (self.models_dir / "random_forest_cost_classifier.joblib").exists():
                self.models["cost_clf"] = joblib.load(self.models_dir / "random_forest_cost_classifier.joblib")

            # Delay Models
            if (self.models_dir / "xgboost_delay_regressor.joblib").exists():
                self.models["delay_reg"] = joblib.load(self.models_dir / "xgboost_delay_regressor.joblib")

            # Risk Models
            if (self.models_dir / "catboost_risk_regressor.joblib").exists():
                self.models["risk_reg"] = joblib.load(self.models_dir / "catboost_risk_regressor.joblib")
                
            logger.info(f"Successfully loaded production ML models: {list(self.models.keys())}")
        except Exception as e:
            logger.warning(f"Error loading production models from {self.models_dir}: {e}")

    def validate_feature_missingness(self, feature_dict: Dict[str, Any]) -> float:
        """
        Calculates percentage of missing required features.
        Raises ValueError if missingness exceeds threshold.
        """
        missing_count = sum(
            1 for col in self.FEATURE_COLUMNS
            if feature_dict.get(col) is None or pd.isna(feature_dict.get(col))
        )
        missing_pct = (missing_count / len(self.FEATURE_COLUMNS)) * 100.0
        
        if missing_pct > self.missing_threshold_pct:
            raise ValueError(
                f"Production Safety Violation: Missing features ({missing_pct:.1f}%) "
                f"exceed threshold ({self.missing_threshold_pct:.1f}%). Required features: {self.FEATURE_COLUMNS}"
            )
        return missing_pct

    def predict_project(self, input_data: PredictionInput) -> PredictionOutput:
        """
        Generates schema-compliant prediction payload for a project input.
        """
        input_dict = input_data.model_dump()
        self.validate_feature_missingness(input_dict)

        missing_models = {"cost_reg", "cost_clf", "delay_reg", "risk_reg"} - self.models.keys()
        if missing_models:
            raise RuntimeError("Model artifacts unavailable: " + ", ".join(sorted(missing_models)))

        # Prepare feature vector
        feat_vector = np.array([
            input_dict.get(col, 0.0) if input_dict.get(col) is not None else 0.0
            for col in self.FEATURE_COLUMNS
        ]).reshape(1, -1)

        # 1. Cost Overrun Predictions
        if "cost_reg" in self.models:
            cost_overrun_pct = float(self.models["cost_reg"].predict(feat_vector)[0])
        else:
            cost_overrun_pct = 12.5 # Baseline estimate

        if "cost_clf" in self.models:
            model_clf = self.models["cost_clf"]
            if hasattr(model_clf, "predict_proba"):
                cost_prob = float(model_clf.predict_proba(feat_vector)[0, 1])
            else:
                cost_prob = float(model_clf.predict(feat_vector)[0])
        else:
            cost_prob = float(np.clip(cost_overrun_pct / 50.0, 0.0, 1.0))

        # 2. Time Overrun / Delay Predictions
        if "delay_reg" in self.models:
            delay_duration_days = float(np.maximum(0.0, self.models["delay_reg"].predict(feat_vector)[0]))
        else:
            delay_duration_days = 90.0

        delay_prob = float(np.clip(delay_duration_days / 365.0, 0.0, 1.0))

        # 3. Implementation Risk
        if "risk_reg" in self.models:
            risk_score = float(np.clip(self.models["risk_reg"].predict(feat_vector)[0], 0.0, 1.0))
        else:
            risk_score = float(np.clip(0.4 * cost_prob + 0.6 * delay_prob, 0.0, 1.0))

        # A fixed percentage around a point estimate is not a calibrated interval.
        # Keep legacy keys nullable; the evidence API supplies held-out conformal bounds.
        confidence_info = {
            "status": "uncalibrated",
            "cost_overrun_pct_95_ci": None,
            "delay_days_95_ci": None,
            "probability_calibration_score": None,
            "reason": "No held-out calibration artifact supplied. Use the calibration workflow.",
            "delay_probability_interpretation": "Normalized delay severity, not calibrated completion probability",
        }

        return PredictionOutput(
            project_id=input_data.project_id,
            prediction_timestamp=datetime.utcnow().isoformat() + "Z",
            cost_overrun_probability=round(cost_prob, 4),
            predicted_cost_overrun_percentage=round(cost_overrun_pct, 2),
            delay_probability=round(delay_prob, 4),
            predicted_delay_duration=round(delay_duration_days, 1),
            implementation_risk=round(risk_score, 4),
            model_version="PAIMANA-ML-v1.0.0",
            confidence_bounds=confidence_info,
        )
