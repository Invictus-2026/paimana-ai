"""Risk scoring and factor explanations API endpoints."""

from fastapi import APIRouter
from app.schemas.paimana import GenericResponse

router = APIRouter()


@router.get("", response_model=GenericResponse, summary="Get risk scores and factors")
def get_risk_scores(project_id: int | None = None):
    """Retrieve risk index and explainable feature contributions (SHAP values)."""
    return GenericResponse(
        status="placeholder",
        message="Risk assessment and SHAP explainability placeholder",
        data={
            "project_id": project_id,
            "overall_risk_score": 0.72,
            "cost_risk_score": 0.68,
            "delay_risk_score": 0.76,
            "key_risk_factors": [
                {"factor_name": "Material Price Inflation", "factor_value": 0.18, "shap_value": +0.25},
                {"factor_name": "Monsoon Season Variance", "factor_value": 1.40, "shap_value": +0.19},
            ],
            "model_version": "risk_xgb_v1.0"
        }
    )
