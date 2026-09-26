"""Persisted project observations and milestones."""
from datetime import datetime, date, timezone
from typing import Literal
from fastapi import APIRouter, Depends, Query
from pydantic import Field, model_validator
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import ProjectUpdate, Milestone
from app.api.v1.intelligence import Input, operator, project
router=APIRouter()

@router.get('')
def list_project_updates(project_id:int|None=None,limit:int=Query(100,ge=1,le=1000),db:Session=Depends(get_db)):
    q=db.query(ProjectUpdate)
    if project_id is not None:project(db,project_id);q=q.filter_by(project_id=project_id)
    rows=q.order_by(ProjectUpdate.timestamp.desc()).limit(limit).all()
    return {'status':'success','data':{'project_id':project_id,'updates':[{'id':r.id,'project_id':r.project_id,'timestamp':r.timestamp.isoformat(),'cost_actual':r.cost_actual,'schedule_variance':r.schedule_variance,'status_text':r.status_text,'is_synthetic':r.is_synthetic} for r in rows]}}

class UpdateInput(Input):
    project_id:int
    timestamp:datetime=Field(default_factory=lambda:datetime.now(timezone.utc))
    cost_actual:float=Field(ge=0)
    schedule_variance:float
    status_text:str=Field(min_length=1,max_length=4000)

@router.post('',dependencies=[Depends(operator)])
def create_update(body:UpdateInput,db:Session=Depends(get_db)):
    project(db,body.project_id)
    row=ProjectUpdate(**body.model_dump(),is_synthetic=False);db.add(row);db.commit()
    return {'status':'success','id':row.id}

@router.get('/milestones')
def list_milestones(project_id:int|None=None,limit:int=Query(100,ge=1,le=1000),db:Session=Depends(get_db)):
    q=db.query(Milestone)
    if project_id is not None:project(db,project_id);q=q.filter_by(project_id=project_id)
    rows=q.order_by(Milestone.planned_date).limit(limit).all()
    return {'status':'success','data':{'project_id':project_id,'milestones':[{'id':r.id,'project_id':r.project_id,'name':r.name,'planned_date':str(r.planned_date) if r.planned_date else None,'actual_date':str(r.actual_date) if r.actual_date else None,'status':r.status,'is_synthetic':r.is_synthetic} for r in rows]}}

class MilestoneInput(Input):
    project_id:int
    name:str=Field(min_length=1,max_length=255)
    planned_date:date
    actual_date:date|None=None
    status:Literal['pending','in_progress','completed']='pending'
    @model_validator(mode='after')
    def validate_completion(self):
        if (self.status=='completed') != (self.actual_date is not None):raise ValueError('Completed milestones require an actual date; other states must not have one')
        return self

@router.post('/milestones',dependencies=[Depends(operator)])
def create_milestone(body:MilestoneInput,db:Session=Depends(get_db)):
    project(db,body.project_id)
    row=Milestone(**body.model_dump(),is_synthetic=False);db.add(row);db.commit()
    return {'status':'success','id':row.id}
