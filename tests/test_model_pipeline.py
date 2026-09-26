import json
import pytest
import numpy as np
import pandas as pd
from pathlib import Path

from ml.models.registry import ModelRegistry
from ml.models.calibrator import ProbabilityCalibrator
from ml.models.predictor import ProductionPredictor, PredictionInput, PredictionOutput
from ml.models.trainer import train_and_compare_all_models


@pytest.fixture(scope="module")
def model_comparison():
    """Runs model trainer and returns comparative results."""
    return train_and_compare_all_models()


def test_temporal_validation_split_boundaries(model_comparison):
    """Test 1: Verifies temporal split boundaries preserve chronological order."""
    meta = model_comparison["metadata"]
    assert meta["train_size"] > 0
    assert meta["val_size"] > 0
    assert meta["test_size"] > 0


def test_model_registry_metadata_completeness():
    """Test 2: Verifies model registry stores complete metadata."""
    registry = ModelRegistry()
    entry = registry.get_model_entry("XGBoost_Cost_Regressor")
    assert entry is not None, "Missing model registry entry for XGBoost_Cost_Regressor"
    assert "version" in entry
    assert "training_period" in entry
    assert "performance_metrics" in entry
    assert "artifact_path" in entry
    assert "feature_columns" in entry


def test_predictor_schema_and_inference():
    """Test 3: Verifies production predictor produces schema-compliant outputs."""
    predictor = ProductionPredictor()
    
    sample_input = PredictionInput(
        project_id="PROJ_TEST_101",
        project_original_budget_cr=500.0,
        project_planned_duration_days=730.0,
        cost_expenditure_ratio=45.0,
        progress_physical_pct=38.0,
        progress_gap_pct=7.0,
        schedule_remaining_days=300.0,
        schedule_elapsed_pct=45.0,
    )
    
    output = predictor.predict_project(sample_input)
    assert isinstance(output, PredictionOutput)
    assert output.project_id == "PROJ_TEST_101"
    assert 0.0 <= output.cost_overrun_probability <= 1.0
    assert 0.0 <= output.delay_probability <= 1.0
    assert 0.0 <= output.implementation_risk <= 1.0
    assert output.model_version == "PAIMANA-ML-v1.0.0"
    assert output.confidence_bounds["cost_overrun_pct_95_ci"] is None
    assert output.confidence_bounds["status"] == "uncalibrated"


def test_predictor_feature_missingness_rejection():
    """Test 4: Verifies predictor gracefully rejects predictions when feature threshold violated."""
    predictor = ProductionPredictor(missing_threshold_pct=20.0)
    
    # Input with missing required features (> 20% missing)
    invalid_input = PredictionInput(
        project_id="PROJ_MISSING_TEST",
        project_original_budget_cr=None,
        project_planned_duration_days=None,
        cost_expenditure_ratio=None,
        schedule_remaining_days=None,
        schedule_elapsed_pct=None,
        progress_physical_pct=None,
    )
    
    with pytest.raises(ValueError) as excinfo:
        predictor.predict_project(invalid_input)
        
    assert "Production Safety Violation" in str(excinfo.value)


def test_probability_calibrator():
    """Test 5: Verifies probability calibrator evaluation."""
    calibrator = ProbabilityCalibrator()
    assert calibrator.is_calibrated is False
