"""API v1 Router aggregation."""

from fastapi import APIRouter
from app.api.v1 import (
    health,
    projects,
    project_updates,
    predictions,
    risks,
    alerts,
    analytics,
    monthly,
    scenarios,
    interventions,
    models,
    copilot,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(project_updates.router, prefix="/project-updates", tags=["Project Updates"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(risks.router, prefix="/risks", tags=["Risks"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(monthly.router, prefix="/monthly", tags=["Monthly Time-Series"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenarios"])
api_router.include_router(interventions.router, prefix="/interventions", tags=["Interventions"])
api_router.include_router(models.router, prefix="/models", tags=["Models"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["Copilot"])

