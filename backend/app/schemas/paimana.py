"""Pydantic Schemas for Request and Response Objects."""

from datetime import datetime, date
from typing import Optional, List, Any, Dict, Generic, TypeVar
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class GenericResponse(BaseModel):
    """Generic status payload."""
    status: str = "success"
    message: str = "Operation completed successfully"
    data: Optional[Dict[str, Any]] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard pagination wrapper schema."""
    total: int
    limit: int
    offset: int
    items: List[T]


class HealthCheck(BaseModel):
    """API health status response."""
    status: str = "ok"
    service: str = "PAIMANA PredictIQ API"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    database: str = "connected"


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    sector: Optional[str] = "Road Transport & Highways"
    ministry: Optional[str] = "MoRTH"
    state: Optional[str] = "Maharashtra"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float = 0.0
    status: str = "active"
    overall_risk_score: float = 0.0
    cost_overrun_pct: float = 0.0
    is_synthetic: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectUpdateBase(BaseModel):
    project_id: int
    cost_actual: float
    schedule_variance: float
    status_text: Optional[str] = None
    is_synthetic: bool = False


class ProjectUpdateResponse(ProjectUpdateBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class RiskFactorSchema(BaseModel):
    factor_name: str
    factor_value: float
    shap_value: float

    model_config = ConfigDict(from_attributes=True)


class RiskPredictionResponse(BaseModel):
    id: int
    project_id: int
    cost_risk_score: float
    delay_risk_score: float
    overall_risk_score: float = 0.0
    predicted_delay_days: float = 0.0
    predicted_cost_overrun_pct: float = 0.0
    model_version: str
    prediction_timestamp: datetime
    factors: List[RiskFactorSchema] = []

    model_config = ConfigDict(from_attributes=True)


class AlertResponse(BaseModel):
    id: int
    project_id: int
    timestamp: datetime
    severity: str
    alert_type: str
    message: str
    is_resolved: bool

    model_config = ConfigDict(from_attributes=True)


class ModelVersionResponse(BaseModel):
    id: int
    model_name: str
    version: str
    status: str
    training_timestamp: datetime
    deployment_timestamp: Optional[datetime] = None
    metrics: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InterventionResponse(BaseModel):
    id: int
    project_id: int
    risk_prediction_id: Optional[int] = None
    intervention_type: str
    priority: str
    status: str
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScenarioRequest(BaseModel):
    project_id: int
    budget_delta_percent: float = 0.0
    duration_delta_days: int = 0
    supply_chain_delay_weeks: int = 0


class ScenarioResponse(BaseModel):
    status: str = "placeholder"
    project_id: int
    simulated_cost_impact: float = 0.0
    simulated_delay_impact: float = 0.0
    risk_level_after_intervention: str = "moderate"
    model_version: str = "v0.1-placeholder"


class AnalyticsOverviewResponse(BaseModel):
    total_projects: int
    total_budget_cr: float
    average_risk_score: float
    active_alerts_count: int
    at_risk_projects_count: int
    total_cost_overrun_exposure_cr: float


class AnalyticsGroupItem(BaseModel):
    category_name: str
    project_count: int
    total_budget_cr: float
    average_risk_score: float
    at_risk_count: int
