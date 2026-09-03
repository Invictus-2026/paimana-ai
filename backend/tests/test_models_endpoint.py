"""Tests that the models registry endpoint surfaces the real cost-overrun model."""

import json
from pathlib import Path

import pytest


@pytest.fixture
def cost_overrun_report(tmp_path, monkeypatch):
    report = {
        "dataset_size": 1775,
        "train_size": 1420,
        "test_size": 355,
        "classification": {"precision": 0.7, "recall": 0.65, "f1_score": 0.67, "roc_auc": 0.81},
        "regression": {"mae": 12.4},
        "scope_note": "Cost overrun prediction only; no delay/schedule model (dataset has no dates).",
    }
    reports_dir = tmp_path / "reports"
    reports_dir.mkdir()
    report_path = reports_dir / "cost-overrun-baseline-results.json"
    report_path.write_text(json.dumps(report))
    monkeypatch.chdir(tmp_path)
    return report_path


def test_models_endpoint_includes_cost_overrun_model_when_report_exists(client, cost_overrun_report):
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    names = [m["model_name"] for m in data]
    assert "CostOverrun_LogisticRegression_Real" in names

    entry = next(m for m in data if m["model_name"] == "CostOverrun_LogisticRegression_Real")
    assert "roc_auc" in entry["metrics"]
    assert "cost overrun" in entry["metrics"].lower() or "scope_note" in entry["metrics"]
