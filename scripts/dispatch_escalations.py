"""Scheduled dispatch entrypoint; dry-run by default, never enabled by app startup.
Run periodically with an approved recipient configuration. --send performs delivery.
"""
import argparse
import hashlib
import json
import os
import sys
from datetime import date
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'backend'))
from app.database import SessionLocal
from app.models.entities import Intervention
from app.api.v1.intelligence import Dispatch, dispatch
from app.api.v1.interventions import generate

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--send',action='store_true')
    parser.add_argument('--channel',choices=['telegram','whatsapp','email','slack'],default='telegram')
    args=parser.parse_args()
    with SessionLocal() as db:
        if args.send:generate(db)
        for row in db.query(Intervention).filter(Intervention.status.in_(['proposed','under_review'])):
            identity=hashlib.sha256(f'{date.today()}:{row.id}:{args.channel}'.encode()).hexdigest()
            if not args.send:
                print(json.dumps({'intervention_id':row.id,'priority':row.priority,'channel':args.channel,'dry_run':True}));continue
            result=dispatch(Dispatch(intervention_id=row.id,channel=args.channel,idempotency_key=identity),db)
            print(json.dumps(result))
if __name__=='__main__':main()
