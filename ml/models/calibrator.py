import logging
import numpy as np
import pandas as pd
from typing import Dict, Tuple, Any, Optional
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss, log_loss

logger = logging.getLogger("PAIMANA_ML.ProbabilityCalibrator")

class ProbabilityCalibrator:
    """
    Evaluates and applies probability calibration (Platt Scaling vs. Isotonic Regression)
    for classification models, applying calibration strictly when validation Brier score improves.
    """

    def __init__(self, method: str = "sigmoid"):
        self.method = method # 'sigmoid' (Platt) or 'isotonic'
        self.calibrated_model: Optional[Any] = None
        self.is_calibrated: bool = False
        self.calibration_summary: Dict[str, Any] = {}

    def fit_and_evaluate(
        self,
        base_estimator: Any,
        X_val: np.ndarray,
        y_val: np.ndarray,
        improvement_threshold: float = 0.001
    ) -> Tuple[Any, Dict[str, Any]]:
        """
        Evaluates uncalibrated vs. calibrated probabilities on validation data.
        
        Args:
            base_estimator: Pre-fitted classifier.
            X_val: Validation feature matrix.
            y_val: Validation target labels.
            improvement_threshold: Minimum required Brier score reduction to adopt calibration.
            
        Returns:
            Tuple of (Chosen Estimator, Calibration Summary Dict)
        """
        # Uncalibrated probabilities
        if hasattr(base_estimator, "predict_proba"):
            raw_probs = base_estimator.predict_proba(X_val)[:, 1]
        else:
            raw_probs = base_estimator.predict(X_val)
            
        raw_brier = float(brier_score_loss(y_val, raw_probs))
        
        # Test Platt Scaling (sigmoid)
        calibrator_platt = CalibratedClassifierCV(estimator=base_estimator, method="sigmoid", cv=2)
        calibrator_platt.fit(X_val, y_val)
        platt_probs = calibrator_platt.predict_proba(X_val)[:, 1]
        platt_brier = float(brier_score_loss(y_val, platt_probs))

        # Test Isotonic Calibration
        calibrator_iso = CalibratedClassifierCV(estimator=base_estimator, method="isotonic", cv=2)
        calibrator_iso.fit(X_val, y_val)
        iso_probs = calibrator_iso.predict_proba(X_val)[:, 1]
        iso_brier = float(brier_score_loss(y_val, iso_probs))

        # Select best calibration variant
        brier_scores = {
            "uncalibrated": raw_brier,
            "platt_sigmoid": platt_brier,
            "isotonic": iso_brier
        }
        
        best_method = min(brier_scores, key=brier_scores.get)
        best_brier = brier_scores[best_method]
        
        improvement = raw_brier - best_brier
        
        if improvement >= improvement_threshold and best_method != "uncalibrated":
            self.is_calibrated = True
            if best_method == "platt_sigmoid":
                self.calibrated_model = calibrator_platt
                selected_status = "PLATT_SCALING"
            else:
                self.calibrated_model = calibrator_iso
                selected_status = "ISOTONIC_REGRESSION"
            logger.info(f"Calibration Applied ({selected_status}): Brier score improved from {raw_brier:.4f} to {best_brier:.4f}")
        else:
            self.is_calibrated = False
            self.calibrated_model = base_estimator
            selected_status = "NONE_UNCALIBRATED_PREFERRED"
            logger.info(f"Calibration Skipped ({selected_status}): Brier score improvement insufficient ({improvement:.4f})")

        self.calibration_summary = {
            "uncalibrated_brier_score": raw_brier,
            "platt_brier_score": platt_brier,
            "isotonic_brier_score": iso_brier,
            "selected_calibration_status": selected_status,
            "brier_improvement": float(improvement)
        }
        
        return self.calibrated_model, self.calibration_summary
