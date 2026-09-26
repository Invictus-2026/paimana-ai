"""Database-grounded macro scenario endpoint; shared with the intelligence UI."""
from fastapi import APIRouter, Depends
from pydantic import Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.v1.intelligence import Twin, twin

router=APIRouter()
class ScenarioSimulationInput(Twin):
    budget_delta_percent:float=Field(default=0,ge=-100,le=1000)
    duration_delta_days:int=Field(default=0,ge=-3650,le=3650)
    supply_chain_delay_weeks:int=Field(default=0,ge=0,le=520)

@router.post('/simulate')
def simulate_scenario(payload:ScenarioSimulationInput,db:Session=Depends(get_db)):
    body=Twin.model_validate(payload.model_dump(exclude={'budget_delta_percent','duration_delta_days','supply_chain_delay_weeks'}))
    result=twin(body,db)
    from app.models.entities import Project
    for row in result['projects']:
        p=db.get(Project,row['project_id'])
        budget_adjustment=p.budget*payload.remaining_fraction*payload.budget_delta_percent/100
        row['budget_adjustment_cr']=budget_adjustment
        row['cost_increase_cr']+=budget_adjustment
        row['schedule_buffer_days']+=payload.duration_delta_days+payload.supply_chain_delay_weeks*7
    result['total_cost_increase_cr']=sum(r['cost_increase_cr'] for r in result['projects'])
    return {'status':'success','message':'Scenario calculated from project budgets and disclosed assumptions','data':result}
