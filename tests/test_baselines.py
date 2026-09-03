import json
import pytest
import joblib
import pandas as pd
from pathlib import Path
from scripts.train_baselines import train_and_evaluate_baselines

@pytest.fixture(scope="module")
def baseline_results():
    """Runs baseline training and returns results dictionary."""
    results = train_and_evaluate_baselines()
    return results

def test_baseline_models_exist():
    """Test 1: Verifies all expected serialized models exist in models/baseline/."""
    models_dir = Path("models/baseline")
    expected_models = [
        "linear_regression.joblib",
        "ridge_regression.joblib",
        "logistic_regression.joblib",
        "survival_cox_ph.joblib",
        "feature_scaler.joblib",
    ]
    for model_file in expected_models:
        assert (models_dir / model_file).exists(), f"Missing baseline model file {model_file}"

def test_results_json_structure(baseline_results):
    """Test 2: Verifies structural keys in reports/baseline-results.json."""
    report_file = Path("reports/baseline-results.json")
    assert report_file.exists(), "Missing reports/baseline-results.json"
    
    with open(report_file, "r") as f:
        data = json.load(f)
        
    assert "regression_baselines" in data
    assert "classification_baselines" in data
    assert "survival_baselines" in data
    assert "early_warning_benchmarks" in data
    assert "recommendations" in data

def test_baseline_regression_metrics(baseline_results):
    """Test 3: Verifies regression metric ranges."""
    ridge_metrics = baseline_results["regression_baselines"]["ridge_regression"]
    assert "test_mae" in ridge_metrics
    assert "test_r2" in ridge_metrics
    assert isinstance(ridge_metrics["test_r2"], float)

def test_baseline_classification_metrics(baseline_results):
    """Test 4: Verifies classification metrics and false negative penalty metrics."""
    log_metrics = baseline_results["classification_baselines"]["cost_sensitive_logistic_regression"]
    assert "test_precision" in log_metrics
    assert "test_recall" in log_metrics
    assert "test_false_negative_rate" in log_metrics
    assert 0.0 <= log_metrics["test_false_negative_rate"] <= 1.0
