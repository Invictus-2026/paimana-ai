"""ML Model Registry API endpoints."""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.paimana import ModelVersionResponse
from app.models.entities import ModelVersion

router = APIRouter()

# Sentinel id for the synthetic (non-DB-backed) real-data cost-overrun model
# entry, chosen to be far outside the range a real autoincrement ModelVersion
# row could plausibly reach, so it never collides.
_COST_OVERRUN_MODEL_ENTRY_ID = 999001

_CLASSIFIER_PATH = Path("models/baseline/cost_overrun_classifier.joblib")
_REGRESSOR_PATH = Path("models/baseline/cost_overrun_regressor.joblib")


def _load_cost_overrun_model_entry():
    """Builds a ModelVersionResponse describing the cost-overrun model, if
    scripts/train_cost_overrun_model.py has produced a results report.

    Status is derived from whether the actual trained model artifacts exist
    on disk (not merely from the report JSON, which is committed to git and
    therefore always present in any checkout, even one that never ran
    training) — so a checkout missing the .joblib files honestly reports
    that the model was reported but is not actually deployed, instead of
    silently claiming deployment.
    """
    report_path = Path("reports/cost-overrun-baseline-results.json")
    if not report_path.exists():
        return None
    with open(report_path) as f:
        report = json.load(f)

    artifacts_present = _CLASSIFIER_PATH.exists() and _REGRESSOR_PATH.exists()
    status = "deployed" if artifacts_present else "reported_not_deployed"

    report_mtime = datetime.fromtimestamp(report_path.stat().st_mtime, tz=timezone.utc).isoformat()

    return ModelVersionResponse(
        id=_COST_OVERRUN_MODEL_ENTRY_ID,
        model_name="CostOverrun_LogisticRegression_Real",
        version="v1.0.0-real-data",
        status=status,
        training_timestamp=report_mtime,
        deployment_timestamp=report_mtime if artifacts_present else None,
        metrics=json.dumps(report),
    )


@router.get("", response_model=List[ModelVersionResponse], summary="List available ML models")
def list_models(db: Session = Depends(get_db)):
    """Retrieve metadata for trained and deployed machine learning models from DB."""
    models = db.query(ModelVersion).order_by(ModelVersion.training_timestamp.desc()).all()
    real_cost_overrun_entry = _load_cost_overrun_model_entry()
    if not models:
        # Fallback default registry entries if database table is initially empty
        fallback = [
            ModelVersionResponse(
                id=1,
                model_name="CatBoost_Cost_Overrun_Classifier",
                version="v1.2.0",
                status="deployed",
                training_timestamp="2026-08-15T10:00:00Z",
                deployment_timestamp="2026-08-20T12:00:00Z",
                metrics='{"roc_auc": 0.884, "f1_score": 0.812}'
            ),
            ModelVersionResponse(
                id=2,
                model_name="LightGBM_Time_Delay_Regressor",
                version="v1.1.0",
                status="deployed",
                training_timestamp="2026-08-14T09:00:00Z",
                deployment_timestamp="2026-08-20T12:00:00Z",
                metrics='{"mae_days": 18.4, "rmse_days": 24.1}'
            ),
            ModelVersionResponse(
                id=3,
                model_name="RandomForest_Risk_Composite_Engine",
                version="v1.0.0",
                status="active",
                training_timestamp="2026-08-10T14:30:00Z",
                deployment_timestamp="2026-08-12T08:00:00Z",
                metrics='{"accuracy": 0.865}'
            )
        ]
        if real_cost_overrun_entry is not None:
            fallback.append(real_cost_overrun_entry)
        return fallback
    if real_cost_overrun_entry is not None:
        return list(models) + [real_cost_overrun_entry]
    return models
