"""Unit tests for ML module stubs and interfaces."""

import pytest
from ml.ingestion import DataLoader
from ml.preprocessing import DataCleaner
from ml.features import FeatureBuilder
from ml.models.cost import CostPredictor
from ml.models.delay import DelayPredictor
from ml.models.risk import RiskCalculator
from ml.explainability import ModelExplainer
from ml.pipeline import PipelineOrchestrator


def test_ml_stubs_instantiation():
    """Verify all ML class stubs can be instantiated and raise NotImplementedError on stub call."""
    loader = DataLoader()
    cleaner = DataCleaner()
    builder = FeatureBuilder()
    cost_pred = CostPredictor()
    delay_pred = DelayPredictor()
    risk_calc = RiskCalculator()
    orchestrator = PipelineOrchestrator()

    assert loader.raw_data_path == "data/raw/"
    assert cost_pred.model_version == "cost_xgb_v1.0"

    with pytest.raises(NotImplementedError):
        loader.load_raw_project_updates("sample.csv")

    with pytest.raises(NotImplementedError):
        cleaner.clean_monthly_updates(None)

    with pytest.raises(NotImplementedError):
        cost_pred.predict(None)

    with pytest.raises(NotImplementedError):
        risk_calc.compute_composite_risk(0.5, 0.5, {})

    with pytest.raises(NotImplementedError):
        orchestrator.run_training_pipeline("data/raw/")
