"""Health check API endpoint."""

from fastapi import APIRouter
from app.schemas.paimana import HealthCheck

router = APIRouter()


@router.get("/health", response_model=HealthCheck, summary="Perform system health check")
def check_health():
    """Verify backend and database connectivity status."""
    return HealthCheck()
