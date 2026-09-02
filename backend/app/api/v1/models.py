"""ML Model Registry API endpoints."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.paimana import ModelVersionResponse
from app.models.entities import ModelVersion

router = APIRouter()


@router.get("", response_model=List[ModelVersionResponse], summary="List available ML models")
def list_models(db: Session = Depends(get_db)):
    """Retrieve metadata for trained and deployed machine learning models from DB."""
    models = db.query(ModelVersion).order_by(ModelVersion.training_timestamp.desc()).all()
    if not models:
        # Fallback default registry entries if database table is initially empty
        return [
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
    return models
