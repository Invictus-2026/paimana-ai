"""Behavior tests for evidence and approval boundaries, with isolated SQLite state."""
import base64
import hashlib
import io
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'backend'))
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db
from app.models.entities import Project, Intervention, RiskPrediction
from app.models.intelligence import ActionGrant
from app.api.v1.intelligence import issue_token
from app.services.intelligence import conformal, kaplan_meier, stress, point_in_polygon

@pytest.fixture
def context(monkeypatch):
    engine=create_engine('sqlite://',connect_args={'check_same_thread':False},poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session=sessionmaker(bind=engine)()
    session.add(Project(id=1,name='Test rail corridor',sector='Railways',ministry='Railways',state='Maharashtra',budget=1000,overall_risk_score=.8))
    session.add(Project(id=2,name='Other railway',sector='Railways',ministry='Railways',state='Kerala',budget=100))
    session.add(Project(id=3,name='Maharashtra road',sector='Road',ministry='Roads',state='Maharashtra',budget=100))
    session.add(Intervention(id=1,project_id=1,intervention_type='coordination',description='Review access',status='proposed'))
    session.commit()
    def override(): yield session
    app.dependency_overrides[get_db]=override
    monkeypatch.setenv('ACTION_SIGNING_KEY','s'*40)
    monkeypatch.setenv('ENVIRONMENT','development')
    monkeypatch.delenv('OPERATOR_API_KEY',raising=False)
    monkeypatch.delenv('GEMINI_API_KEY',raising=False)
    with TestClient(app) as client: yield client,session
    app.dependency_overrides.clear();session.close();engine.dispose()

P='/api/v1/intelligence'
def test_documents_grounded_and_deduplicated(context):
    c,_=context
    body={'project_id':1,'name':'Audit.txt','mime':'text/plain','content_base64':base64.b64encode(b'Clause 44: land acquisition delayed Package Four.').decode()}
    assert c.post(P+'/documents',json=body).status_code==200
    assert c.post(P+'/documents',json=body).status_code==409
    r=c.post(P+'/ask',json={'query':'land acquisition','project_id':1}).json()
    assert r['citations'][0]['page']==1
    assert 'Clause 44' in r['citations'][0]['text']
    assert r['provider']=='local evidence retrieval'
    assert c.post(P+'/documents',json={**body,'content_base64':'!bad'}).status_code==422
    assert c.post(P+'/ask',json={'query':'railway Maharashtra'}).json()['project_ids']==[1]

def test_twin_math_and_validation(context):
    c,_=context
    result=c.post(P+'/twin',json={'project_id':1,'steel':10,'remaining_fraction':.5,'rain_days':20,'productivity_loss':.5}).json()
    assert result['total_cost_increase_cr']==17.5
    assert result['projects'][0]['schedule_buffer_days']==10
    assert c.post(P+'/twin',json={'steel':-101}).status_code==422
    assert c.post(P+'/twin',json={'project_id':999}).status_code==404

def test_satellite_quality_and_alert(context):
    c,db=context
    before={'date':'2026-01-01','sensor':'Sentinel-2','scene_id':'a','red':.2,'nir':.4,'swir':.3,'cloud_pct':0}
    after={**before,'date':'2026-02-01','scene_id':'b'}
    body={'project_id':1,'source':'verified source','before':before,'after':after,'claimed_progress_pct':20}
    assert c.post(P+'/satellite',json=body).json()['status']=='review_required'
    assert c.post(P+'/satellite',json={**body,'after':{**after,'cloud_pct':80}}).json()['status']=='inconclusive'
    assert c.post(P+'/satellite',json={**body,'after':before}).status_code==422

def test_calibration_and_survival(context):
    c,db=context
    assert c.get(P+'/uncertainty/1').json()['status']=='unavailable'
    db.add(RiskPrediction(project_id=1,model_version='test-v1',predicted_delay_days=100));db.commit()
    pairs=[{'predicted':100,'actual':100+i} for i in range(1,10)]
    body={'model_version':'test-v1','target':'delay_days','source':'independent test cohort','held_out':True,'pairs':pairs,'survival':[{'duration_days':10,'completed':True},{'duration_days':20,'completed':False}]}
    assert c.post(P+'/calibration',json=body).status_code==200
    result=c.get(P+'/uncertainty/1').json()
    assert result['interval']['lower']==91
    assert result['interval']['upper']==109
    assert result['survival_curve'][-1]['completion_probability']==.5
    assert c.post(P+'/calibration',json={**body,'pairs':pairs[:8]}).status_code==422
    with pytest.raises(ValueError):conformal(100,pairs[:8])

def test_contractor_insufficient_sample(context):
    c,_=context
    body={'project_id':1,'contractor_id':'verified-id','name':'Engineering Ltd','source':'official record','as_of':'2026-01-01','milestone_count':10,'on_time_count':8,'arbitration_claims':1,'work_value_cr':1000,'payment_days':30,'delay_days':200}
    assert c.post(P+'/contractors',json=body).status_code==200
    result=c.get(P+'/contractors').json()[0]
    assert result['score'] is None and result['critical_packages']==1
    assert result['on_time_index']==80
    assert c.post(P+'/contractors',json={**body,'on_time_count':11}).status_code==422

def test_inspection_integrity_geofence_idempotency(context):
    from PIL import Image
    c,_=context
    buf=io.BytesIO();Image.new('RGB',(5,5),'blue').save(buf,format='PNG');raw=buf.getvalue()
    body={'project_id':1,'client_id':'a'*32,'latitude':19.5,'longitude':72.5,'accuracy_m':10,'captured_at':datetime.now(timezone.utc).isoformat(),'note':'Pier cap complete','photo_base64':base64.b64encode(raw).decode(),'photo_sha256':hashlib.sha256(raw).hexdigest()}
    assert c.post(P+'/inspections',json=body).status_code==422
    assert c.post(P+'/boundaries',json={'project_id':1,'source':'Surveyed polygon','ring':[[72,19],[73,19],[73,20],[72,20]]}).status_code==200
    r=c.post(P+'/inspections',json=body); assert r.status_code==200, r.text
    assert c.post(P+'/inspections',json=body).json()['id']==r.json()['id']
    assert c.post(P+'/inspections',json={**body,'note':'Changed'}).status_code==409
    assert c.post(P+'/inspections',json={**body,'client_id':'b'*32,'longitude':75}).status_code==422
    assert c.post(P+'/inspections',json={**body,'client_id':'c'*32,'photo_sha256':'0'*64}).status_code==422
    assert 'photo_base64' not in c.get(P+'/inspections/1').json()[0]

def test_signed_action_preview_and_replay(context):
    c,db=context
    token=issue_token(db,1)
    assert c.get(P+'/actions/'+token).status_code==200
    assert db.get(Intervention,1).status=='proposed'
    assert c.post(P+'/actions/'+token,json={'decision':'approved'}).status_code==200
    assert c.post(P+'/actions/'+token,json={'decision':'approved'}).status_code==410
    assert c.post(P+'/actions/'+token[:-1]+'x',json={'decision':'approved'}).status_code==410
    db.expire_all();assert db.get(Intervention,1).status=='approved'

def test_writes_require_key_when_configured(context,monkeypatch):
    c,_=context;monkeypatch.setenv('OPERATOR_API_KEY','secret')
    assert c.post(P+'/boundaries',json={'project_id':1,'source':'survey','ring':[[0,0],[1,0],[0,1]]}).status_code==401

def test_dispatch_unconfigured_and_pdf(context,monkeypatch):
    c,_=context;monkeypatch.delenv('PUBLIC_API_URL',raising=False)
    assert c.post(P+'/dispatch',json={'intervention_id':1,'channel':'telegram','idempotency_key':'x'*32}).status_code==503
    assert c.get(P+'/dispatch').json()==[]
    r=c.get(P+'/dossier/1');assert r.status_code==200 and r.content.startswith(b'%PDF')
    from pypdf import PdfReader
    assert 'Test rail corridor' in PdfReader(io.BytesIO(r.content)).pages[0].extract_text()

def test_boundary_edges_and_km_ties():
    assert point_in_polygon(0,0,[[0,0],[1,0],[1,1],[0,1]])
    assert not point_in_polygon(2,2,[[0,0],[1,0],[1,1],[0,1]])
    curve=kaplan_meier([{'duration_days':1,'completed':True},{'duration_days':1,'completed':False}])
    assert curve[-1]['survival']==.5

def test_persistent_intervention_lifecycle(context):
    c,db=context
    response=c.post('/api/v1/interventions/generate')
    assert response.status_code==200
    count=len(c.get('/api/v1/interventions').json()['data']['interventions'])
    assert c.post('/api/v1/interventions/generate').json()['created']==0
    assert len(c.get('/api/v1/interventions').json()['data']['interventions'])==count
    body={'new_status':'UNDER_REVIEW','reviewer_name':'Reviewer','reviewer_notes':'Check the evidence'}
    assert c.post('/api/v1/interventions/1/approve',json=body).status_code==200
    assert c.get('/api/v1/interventions/1').json()['data']['interventions'][-1]['status']=='Under Review'
    assert c.post('/api/v1/interventions/1/approve',json={**body,'new_status':'APPROVED'}).status_code==200
    assert c.post('/api/v1/interventions/1/approve',json={**body,'new_status':'REJECTED'}).status_code==409

def test_dispatch_audit_and_idempotency(context,monkeypatch):
    c,_=context
    monkeypatch.setenv('PUBLIC_API_URL','https://test.invalid/api/v1')
    monkeypatch.setenv('TELEGRAM_BOT_TOKEN','test-only')
    monkeypatch.setenv('TELEGRAM_CHAT_ID','test-chat')
    sent=[]
    class FakeResponse:
        def raise_for_status(self):pass
        def json(self):return {'ok':True}
    def fake_post(*args,**kwargs):sent.append(kwargs);return FakeResponse()
    monkeypatch.setattr('app.api.v1.intelligence.httpx.post',fake_post)
    body={'intervention_id':1,'channel':'telegram','idempotency_key':'dispatch-identity-0001'}
    r=c.post(P+'/dispatch',json=body)
    assert r.status_code==200 and r.json()['status']=='accepted_by_provider'
    assert c.post(P+'/dispatch',json=body).json()['id']==r.json()['id']
    assert len(sent)==1
    assert 'Review action' in sent[0]['json']['text']
    def fail(*args,**kwargs):raise TimeoutError()
    monkeypatch.setattr('app.api.v1.intelligence.httpx.post',fail)
    r=c.post(P+'/dispatch',json={**body,'idempotency_key':'dispatch-identity-0002'})
    assert r.json()['status']=='failed_or_unknown'

def test_expired_action_does_not_mutate(context):
    c,db=context
    token=issue_token(db,1)
    grant=db.get(ActionGrant,token.split('.')[0]);grant.expires=1;db.commit()
    assert c.post(P+'/actions/'+token,json={'decision':'approved'}).status_code==410
    assert db.get(Intervention,1).status=='proposed'

def test_model_input_requires_complete_observations(context):
    c,_=context
    assert c.post(P+'/model/predict',json={'project_id':1,'features':{'project_original_budget_cr':100}}).status_code==422

def test_real_model_inference_is_persisted(context):
    c,db=context
    from ml.models.predictor import ProductionPredictor
    features={k:0.0 for k in ProductionPredictor.FEATURE_COLUMNS}
    features.update(project_original_budget_cr=500,project_planned_duration_days=730,cost_expenditure_ratio=45,progress_physical_pct=38,progress_gap_pct=7,schedule_remaining_days=300,schedule_elapsed_pct=45)
    r=c.post(P+'/model/predict',json={'project_id':1,'features':features})
    assert r.status_code==200,r.text
    row=db.get(RiskPrediction,r.json()['prediction_id'])
    assert row.project_id==1 and row.model_version==r.json()['model_version']
    assert r.json()['confidence_bounds']['status']=='uncalibrated'
    assert r.json()['explanation']['status']=='available'
    assert len(row.factors)==18
    assert sum(f.shap_value for f in row.factors)+r.json()['explanation']['base_value']==pytest.approx(r.json()['implementation_risk'],abs=.0001)

def test_satellite_common_pixel_mask():
    import numpy as np
    from app.services.earth_observation import compare_pixels
    def scene(date):
        return {'scene_id':date,'date':date,'sensor':'Sentinel-2','source':'test fixture',
                'valid':np.ones((8,8),dtype=bool),'arrays':{k:np.full((8,8),v) for k,v in {'red':.2,'green':.2,'blue':.1,'nir':.4,'swir':.3}.items()}}
    a,b=scene('2026-01-01'),scene('2026-02-01')
    r=compare_pixels(a,b,20)
    assert r['common_clear_pixels']==64 and r['status']=='review_required'
    assert r['before']['image_data'].startswith('data:image/png;base64,')
    b['valid'][:4]=False
    assert compare_pixels(a,b,20)['status']=='inconclusive'
    b['valid'][:]=False
    with pytest.raises(ValueError):compare_pixels(a,b,20)

def test_live_requires_configuration(context,monkeypatch):
    c,_=context
    monkeypatch.delenv('GEMINI_LIVE_MODEL',raising=False)
    with c.websocket_connect(P+'/live') as ws:
        ws.send_json({'project_id':1,'language':'en-IN','operator_key':''})
        assert 'Configure' in ws.receive_json()['error']

def test_market_feed_is_atomic_and_repeatable(context,monkeypatch):
    c,_=context
    monkeypatch.setenv('MARKET_FEED_URL','https://feed.invalid/observations')
    body=[{'as_of':'2026-01-01','source':'published series','region':'Maharashtra','steel':100,'cement':100,'bitumen':100,'diesel':100,'rain_days':10}]
    class Feed:
        def __enter__(self):return self
        def __exit__(self,*args):pass
        def raise_for_status(self):pass
        def iter_bytes(self):yield __import__('json').dumps(body).encode()
    monkeypatch.setattr('app.api.v1.intelligence.httpx.stream',lambda *a,**kw:Feed())
    assert c.post(P+'/market/refresh',json={}).json()['created']==1
    assert c.post(P+'/market/refresh',json={}).json()['created']==0
    body.append({**body[0],'steel':0})
    assert c.post(P+'/market/refresh',json={}).status_code==502
    assert len(c.get(P+'/market').json())==1

def test_public_scenario_route_uses_project_budget(context):
    c,_=context
    r=c.post('/api/v1/scenarios/simulate',json={'project_id':1,'steel':10,'budget_delta_percent':5,'duration_delta_days':7,'supply_chain_delay_weeks':1})
    assert r.status_code==200
    assert r.json()['data']['total_cost_increase_cr']==85
    assert r.json()['data']['projects'][0]['schedule_buffer_days']==14

def test_escalation_requires_consecutive_comparable_months():
    from types import SimpleNamespace
    from app.services.intelligence import escalation_tier
    p=SimpleNamespace(budget=100,cost_overrun_pct=10)
    def prediction(month,risk,version='v1'):
        return SimpleNamespace(prediction_timestamp=datetime(2026,month,1),overall_risk_score=risk,model_version=version,predicted_delay_days=20)
    assert escalation_tier(p,[prediction(1,.2),prediction(2,.3),prediction(3,.4)])[0]==2
    assert escalation_tier(p,[prediction(1,.2),prediction(3,.3),prediction(4,.4)])[0]==1
    assert escalation_tier(p,[prediction(1,.2),prediction(2,.3),prediction(3,.4,'v2')])[0]==1
    p.budget=10000
    assert escalation_tier(p,[])[0]==3

def test_radar_comparison_requires_matching_orbit_and_uses_power():
    import numpy as np
    from app.services.earth_observation import compare_radar
    def scene(day,power,orbit=12):
        return {'scene_id':day,'date':day,'orbit':{'relative':orbit},'polarization':'vv','source':'fixture',
            'valid':np.ones((8,8),dtype=bool),'power':np.full((8,8),power)}
    mask=np.ones((8,8),dtype=bool)
    a=scene('2026-01-01',.1);b=scene('2026-02-01',.2)
    result=compare_radar(a,b,mask,20)
    assert result['sar_delta_db']==pytest.approx(3.0103,abs=.001)
    assert result['sar_power_delta_pct']==pytest.approx(100)
    assert result['status']=='no_threshold_breach'
    assert compare_radar(a,scene('2026-02-01',.1),mask,20)['status']=='review_required'
    with pytest.raises(ValueError):compare_radar(a,scene('2026-02-01',.1,13),mask,20)

def test_portfolio_copilot_filters_delay_without_inventing_forecasts(context):
    c,db=context
    db.add(RiskPrediction(project_id=1,model_version='test',predicted_delay_days=250));db.commit()
    response=c.post(P+'/ask',json={'query':'railway Maharashtra over 200 days'}).json()
    assert response['total_matches']==1
    assert response['projects'][0]['recorded_delay_days']==250
    assert response['project_ids']==[1]
    assert c.post(P+'/ask',json={'query':'railways over 300 days'}).json()['total_matches']==0

def test_project_updates_milestones_and_risk_are_persisted(context):
    c,db=context
    r=c.post('/api/v1/project-updates',json={'project_id':1,'cost_actual':40,'schedule_variance':12,'status_text':'Site report received'})
    assert r.status_code==200
    assert c.get('/api/v1/project-updates?project_id=1').json()['data']['updates'][0]['cost_actual']==40
    milestone={'project_id':1,'name':'Pier','planned_date':'2026-02-01','actual_date':'2026-02-03','status':'completed'}
    assert c.post('/api/v1/project-updates/milestones',json=milestone).status_code==200
    assert c.post('/api/v1/project-updates/milestones',json={**milestone,'actual_date':None}).status_code==422
    assert c.get('/api/v1/project-updates/milestones?project_id=1').json()['data']['milestones'][0]['name']=='Pier'
    assert c.get('/api/v1/risks?project_id=1').json()['data']['predictions']==[]
    assert c.get('/api/v1/risks?project_id=999').status_code==404

def test_alert_resolution_requires_auditable_review(context):
    from app.models.entities import Alert
    c,db=context
    row=Alert(project_id=1,severity='high',alert_type='reporting_discrepancy',message='Review required');db.add(row);db.commit()
    assert c.post(f'/api/v1/alerts/{row.id}/resolve',json={'reviewer_name':'Officer','note':''}).status_code==422
    body={'reviewer_name':'Officer','note':'Site evidence reviewed'}
    assert c.post(f'/api/v1/alerts/{row.id}/resolve',json=body).status_code==200
    db.expire_all();assert db.get(Alert,row.id).is_resolved
    assert c.post(f'/api/v1/alerts/{row.id}/resolve',json=body).status_code==409
