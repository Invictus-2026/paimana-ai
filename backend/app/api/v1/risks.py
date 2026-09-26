"""Read persisted model outputs and their actual factor attributions."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import RiskPrediction
from app.api.v1.intelligence import project
router=APIRouter()
@router.get('')
def get_risk_scores(project_id:int|None=None,limit:int=Query(100,ge=1,le=1000),db:Session=Depends(get_db)):
    query=db.query(RiskPrediction)
    if project_id is not None:project(db,project_id);query=query.filter_by(project_id=project_id)
    rows=query.order_by(RiskPrediction.prediction_timestamp.desc()).limit(limit).all()
    data=[{'project_id':r.project_id,'prediction_id':r.id,'overall_risk_score':r.overall_risk_score,'cost_risk_score':r.cost_risk_score,'delay_risk_score':r.delay_risk_score,'model_version':r.model_version,'timestamp':r.prediction_timestamp.isoformat(),'key_risk_factors':[{'factor_name':f.factor_name,'factor_value':f.factor_value,'shap_value':f.shap_value} for f in r.factors]} for r in rows]
    return {'status':'success','data':{'project_id':project_id,'predictions':data,'source':'persisted_model_outputs','explanation':'Empty factor lists mean no attribution was recorded; no synthetic factors are substituted.'}}
