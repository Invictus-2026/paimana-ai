"""Compatibility route backed by the evidence-grounded copilot."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.v1.intelligence import Question, ask, operator
router = APIRouter()
@router.post('/query', dependencies=[Depends(operator)])
def query_copilot(body: Question, db: Session = Depends(get_db)):
    return {'status':'success', 'data':ask(body, db)}
