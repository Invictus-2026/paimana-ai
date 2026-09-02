from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.copilot_engine import CopilotEngine

router = APIRouter(prefix="/copilot", tags=["copilot"])

class CopilotQueryRequest(BaseModel):
    query: str
    user_id: Optional[str] = "admin_user"

class CopilotQueryResponse(BaseModel):
    answer: str
    audit_log: Dict[str, Any]
    data: Dict[str, Any]

@router.post("/query", response_model=CopilotQueryResponse)
def query_copilot(req: CopilotQueryRequest, db: Session = Depends(get_db)):
    engine = CopilotEngine(db)
    result = engine.process_user_query(req.query)
    return result

@router.get("/tools")
def list_copilot_tools():
    return {
        "tools": [
            "get_project(project_id)",
            "get_project_risk(project_id)",
            "get_risk_trajectory(project_id, timespan)",
            "search_projects(filters)",
            "compare_projects(project_id_1, project_id_2)",
            "get_risk_drivers(project_id)",
            "simulate_scenario(project_id, change)",
            "get_interventions(project_id)",
            "get_data_source(claim)"
        ],
        "system_prompt": "You are the Project Intelligence Copilot for PAIMANA PredictIQ—a specialized decision-support assistant designed to answer complex questions about infrastructure projects using real backend data, verified risk models, and scenario simulation.",
        "disclaimer": "AI-generated decision support. Final decisions remain with authorized officials."
    }
