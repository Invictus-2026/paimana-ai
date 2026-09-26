"""Persistent, auditable intervention workflow."""
import json
from datetime import datetime, timezone
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Project, Intervention, RiskPrediction
from app.models.intelligence import Evidence
from app.api.v1.intelligence import operator
from app.services.intelligence import escalation_tier

router=APIRouter()

def serialize(row, db):
    p=db.get(Project,row.project_id)
    return {'id':str(row.id),'recommendation_id':str(row.id),'projectId':p.id,'project_id':str(p.id),'projectName':p.name,
        'ministry':p.ministry or 'Unknown','state':p.state or 'Unknown','currentRiskScore':round(p.overall_risk_score*100),
        'status':row.status.replace('_',' ').title(),'recommendedAction':row.description or row.intervention_type,
        'evidence':f'Recorded risk {p.overall_risk_score:.3f}; cost overrun {p.cost_overrun_pct:.2f}%. Scoring method: {p.risk_score_method}.',
        'estimatedRiskImpact':'Not estimated','estimatedTimelineImpact':'Requires engineering assessment','assignedOfficer':'Not assigned',
        'lastUpdated':row.created_at.isoformat(),'priority':row.priority}

@router.get('')
def list_interventions(project_id:int|None=None,db:Session=Depends(get_db)):
    q=db.query(Intervention)
    if project_id is not None:q=q.filter_by(project_id=project_id)
    rows=q.order_by(Intervention.created_at.desc()).all()
    return {'status':'success','data':{'interventions':[serialize(r,db) for r in rows],'total_recommendations':len(rows)}}

@router.post('/generate',dependencies=[Depends(operator)])
def generate(db:Session=Depends(get_db)):
    count=0
    for p in db.query(Project).all():
        if db.query(Intervention).filter_by(project_id=p.id,intervention_type='evidence_review').first():continue
        tier_number,tier_reason=escalation_tier(p,db.query(RiskPrediction).filter_by(project_id=p.id).all())
        if tier_number==1 and p.overall_risk_score<.4:continue
        exposure=p.budget*max(0,p.cost_overrun_pct)/100
        tier={1:'medium',2:'high',3:'critical'}[tier_number]
        db.add(Intervention(project_id=p.id,intervention_type='evidence_review',priority=tier,status='proposed',
            description=f'Review project evidence and coordinate mitigation. Recorded cost overrun exposure INR {exposure:,.2f} crore; risk {p.overall_risk_score:.3f}. {tier_reason}. Verify causes before authorizing expenditure.'))
        count+=1
    db.commit()
    return {'status':'success','created':count}

@router.get('/{project_id}')
def get_project_interventions(project_id:int,db:Session=Depends(get_db)):
    if not db.get(Project,project_id):raise HTTPException(404,'Project not found')
    return list_interventions(project_id,db)

class ApprovalRequest(BaseModel):
    new_status:Literal['APPROVED','REJECTED','UNDER_REVIEW']
    reviewer_name:str=Field(min_length=1,max_length=200)
    reviewer_notes:str=Field(default='',max_length=4000)

@router.post('/{recommendation_id}/approve',dependencies=[Depends(operator)])
def approve_intervention(recommendation_id:int,body:ApprovalRequest,db:Session=Depends(get_db)):
    row=db.get(Intervention,recommendation_id)
    if not row:raise HTTPException(404,'Intervention not found')
    target=body.new_status.lower()
    if row.status in ('approved','rejected'):raise HTTPException(409,'Final decision already recorded')
    changed=db.query(Intervention).filter(Intervention.id==row.id,Intervention.status==row.status).update({'status':target},synchronize_session=False)
    if changed!=1:db.rollback();raise HTTPException(409,'Intervention changed; refresh and retry')
    db.add(Evidence(kind='decision',project_id=row.project_id,identity=__import__('secrets').token_hex(24),payload=json.dumps({
        'intervention_id':row.id,'decision':target,'reviewer':body.reviewer_name,'notes':body.reviewer_notes,'at':datetime.now(timezone.utc).isoformat()})))
    db.commit();db.refresh(row)
    return {'status':'success','data':serialize(row,db)}
