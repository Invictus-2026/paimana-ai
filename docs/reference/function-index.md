# PARAM — function and module index

[Return to README](../../README.md) · Source audit: 1 October 2026

## Scope and interpretation

This inventory lists every Python function/method (including named nested helpers) under `backend/app`, `backend/alembic/versions`, `ml` and `scripts`, plus named frontend declarations detected under `frontend/src` and public JavaScript. It excludes dependencies, tests, generated artifacts, notebooks and anonymous callbacks. Frontend entries are a static declaration index, not a full TypeScript call graph.

Python signatures, declared purpose and up to eight direct call names help locate behavior. Existing docstrings can describe intent or contain older terminology; the audited README and API notes take precedence. A function being listed does not mean it is on an active request path. **STUB** explicitly marks bodies that raise `NotImplementedError`.

## Active versus legacy modules

| Module family | Runtime role |
|---|---|
| `backend/app/api/v1` | Registered application HTTP/WebSocket handlers and request models; see API reference |
| `backend/app/services/intelligence.py`, `earth_observation.py`, `portfolio_query.py`, `risk_scoring.py` | Current calculations/provider adapters/query planning/composite scoring |
| `backend/app/services/project_service.py`, `early_warning_engine.py` | Active project access and process-local trajectory calculation |
| `backend/app/services/scenario_engine.py`, `copilot_engine.py`, `intervention_engine.py` | Older standalone engines; current scenario/copilot/intervention routes use other implementations |
| `backend/app/data_pipeline` | Explicit ETL, source normalization, quality checks and loading; not automatically scheduled |
| `ml/models/predictor.py` | Active tree artifact inference called by intelligence API |
| `ml/models/trainer.py`, baseline scripts, feature/target/calibration/registry code | Offline training and research utilities; data requirements differ |
| `ml/ingestion/loader.py`, `preprocessing/cleaner.py`, `features/builder.py`, `pipeline/orchestrator.py`, selected model/evaluation interfaces | Legacy interfaces, including explicit stubs; not evidence of completed automation |
| `frontend/src/pages`, components, API and inspection queue | Current views and browser workflows; route aliases and unused older pages also remain |

## Python functions

### `backend/alembic/versions/0001_initial_schema.py`

- [upgrade](../../backend/alembic/versions/0001_initial_schema.py#L18)
  - Signature: `upgrade()` → `None`
  - Purpose: Apply the schema changes declared by this migration revision.
  - Calls include: `op.create_table`, `op.create_index`, `sa.Column`, `sa.PrimaryKeyConstraint`, `op.f`, `sa.ForeignKeyConstraint`, `sa.Integer`, `sa.String`.
- [downgrade](../../backend/alembic/versions/0001_initial_schema.py#L157)
  - Signature: `downgrade()` → `None`
  - Purpose: Apply this revision's rollback policy; revision 0005 deliberately keeps reconciled columns.
  - Calls include: `op.drop_table`.

### `backend/alembic/versions/0002_add_real_dataset_columns.py`

- [upgrade](../../backend/alembic/versions/0002_add_real_dataset_columns.py#L18)
  - Signature: `upgrade()` → `None`
  - Purpose: Apply the schema changes declared by this migration revision.
  - Calls include: `op.add_column`, `op.create_index`, `sa.Column`, `op.f`, `sa.Float`, `sa.String`.
- [downgrade](../../backend/alembic/versions/0002_add_real_dataset_columns.py#L25)
  - Signature: `downgrade()` → `None`
  - Purpose: Apply this revision's rollback policy; revision 0005 deliberately keeps reconciled columns.
  - Calls include: `op.drop_index`, `op.drop_column`, `op.f`.

### `backend/alembic/versions/0003_add_risk_score_method.py`

- [upgrade](../../backend/alembic/versions/0003_add_risk_score_method.py#L18)
  - Signature: `upgrade()` → `None`
  - Purpose: Apply the schema changes declared by this migration revision.
  - Calls include: `op.add_column`, `sa.Column`, `sa.String`.
- [downgrade](../../backend/alembic/versions/0003_add_risk_score_method.py#L22)
  - Signature: `downgrade()` → `None`
  - Purpose: Apply this revision's rollback policy; revision 0005 deliberately keeps reconciled columns.
  - Calls include: `op.drop_column`.

### `backend/alembic/versions/0004_intelligence_evidence.py`

- [upgrade](../../backend/alembic/versions/0004_intelligence_evidence.py#L9)
  - Signature: `upgrade()`
  - Purpose: Apply the schema changes declared by this migration revision.
  - Calls include: `op.create_table`, `op.create_index`, `sa.Column`, `sa.UniqueConstraint`, `sa.Integer`, `sa.String`, `sa.Text`, `sa.DateTime`.
- [downgrade](../../backend/alembic/versions/0004_intelligence_evidence.py#L15)
  - Signature: `downgrade()`
  - Purpose: Apply this revision's rollback policy; revision 0005 deliberately keeps reconciled columns.
  - Calls include: `op.drop_table`, `op.drop_index`.

### `backend/alembic/versions/0005_reconcile_runtime_schema.py`

- [upgrade](../../backend/alembic/versions/0005_reconcile_runtime_schema.py#L14)
  - Signature: `upgrade()`
  - Purpose: Apply the schema changes declared by this migration revision.
  - Calls include: `sa.inspect`, `COLUMNS.items`, `op.get_bind`, `inspector.get_columns`, `op.add_column`, `sa.Column`.
- [downgrade](../../backend/alembic/versions/0005_reconcile_runtime_schema.py#L22)
  - Signature: `downgrade()`
  - Purpose: Apply this revision's rollback policy; revision 0005 deliberately keeps reconciled columns.

### `backend/app/api/v1/alerts.py`

- [list_alerts](../../backend/app/api/v1/alerts.py#L16)
  - Signature: `list_alerts(limit: int=Query(50, ge=1, le=500), offset: int=Query(0, ge=0), project_id: Optional[int]=Query(None, description='Filter by project ID'), severity: Optional[str]=Query(None, description='Filter by severity (low, medium, high, critical)'), is_resolved: Optional[bool]=Query(None, description='Filter by resolution status'), db: Session=Depends(get_db))`
  - Purpose: Retrieve early warning alerts from DB with filtering and pagination.
  - Calls include: `router.get`, `Query`, `Depends`, `ProjectService.seed_initial_data_if_empty`, `db.query`, `query.order_by(desc(Alert.timestamp)).offset(offset).limit(limit).all`, `query.filter`, `Alert.severity.ilike`.
- [get_alert_by_id](../../backend/app/api/v1/alerts.py#L40)
  - Signature: `get_alert_by_id(alert_id: int, db: Session=Depends(get_db))`
  - Purpose: Retrieve single alert details by ID from DB.
  - Calls include: `router.get`, `Depends`, `ProjectService.seed_initial_data_if_empty`, `db.query(Alert).filter(Alert.id == alert_id).first`, `HTTPException`, `db.query(Alert).filter`, `db.query`.
- [resolve_alert](../../backend/app/api/v1/alerts.py#L58)
  - Signature: `resolve_alert(alert_id: int, body: AlertReview, db: Session=Depends(get_db))`
  - Purpose: Record named alert resolution and review evidence.
  - Calls include: `router.post`, `Depends`, `db.get`, `db.query(Alert).filter_by(id=alert_id, is_resolved=False).update`, `save`, `HTTPException`, `db.rollback`, `db.query(Alert).filter_by`.

### `backend/app/api/v1/analytics.py`

- [get_analytics_overview](../../backend/app/api/v1/analytics.py#L51)
  - Signature: `get_analytics_overview(db: Session=Depends(get_db))`
  - Purpose: Computes macro dashboard metrics directly from DB queries.
  - Calls include: `router.get`, `Depends`, `ProjectService.seed_initial_data_if_empty`, `AnalyticsOverviewResponse`, `GenericResponse`, `db.query(func.count(Project.id)).scalar`, `db.query(func.sum(Project.budget)).scalar`, `db.query(func.avg(Project.overall_risk_score)).scalar`.
- [get_benchmark_analytics](../../backend/app/api/v1/analytics.py#L81)
  - Signature: `get_benchmark_analytics(dimension: str=Query('sector', description='Grouping dimension: sector, ministry, project_size, geographic_region, implementation_stage, risk_profile'), sector: Optional[str]=Query(None), ministry: Optional[str]=Query(None), db: Session=Depends(get_db))`
  - Purpose: Computes descriptive comparative benchmarks with mandatory statistical safeguards: - Minimum sample size threshold (N >= 3) - Transparency metadata (N, completeness %, time window) - 3 core non-evaluative pedagogical caveats
  - Calls include: `router.get`, `Query`, `Depends`, `ProjectService.seed_initial_data_if_empty`, `dim_column_map.get`, `db.query`, `query.group_by(col).order_by(func.count(Project.id).desc()).all`, `DIMENSION_CAVEATS.get`.
- [get_sector_analytics](../../backend/app/api/v1/analytics.py#L176)
  - Signature: `get_sector_analytics(db: Session=Depends(get_db))`
  - Purpose: Computes sector-level aggregate metrics directly from database queries.
  - Calls include: `router.get`, `Depends`, `ProjectService.seed_initial_data_if_empty`, `GenericResponse`, `func.count(Project.id).desc`, `AnalyticsGroupItem`, `len`, `func.count`.
- [get_ministry_analytics](../../backend/app/api/v1/analytics.py#L209)
  - Signature: `get_ministry_analytics(db: Session=Depends(get_db))`
  - Purpose: Computes ministry-level aggregate metrics directly from database queries.
  - Calls include: `router.get`, `Depends`, `ProjectService.seed_initial_data_if_empty`, `GenericResponse`, `func.count(Project.id).desc`, `AnalyticsGroupItem`, `len`, `func.count`.
- [get_geography_analytics](../../backend/app/api/v1/analytics.py#L242)
  - Signature: `get_geography_analytics(db: Session=Depends(get_db))`
  - Purpose: Computes state/geography-level aggregate metrics directly from database queries.
  - Calls include: `router.get`, `Depends`, `ProjectService.seed_initial_data_if_empty`, `GenericResponse`, `func.count(Project.id).desc`, `AnalyticsGroupItem`, `len`, `func.count`.

### `backend/app/api/v1/copilot.py`

- [query_copilot](../../backend/app/api/v1/copilot.py#L8)
  - Signature: `query_copilot(body: Question, db: Session=Depends(get_db))`
  - Purpose: Wrap the active evidence assistant for the compatibility route.
  - Calls include: `router.post`, `Depends`, `ask`.

### `backend/app/api/v1/health.py`

- [check_health](../../backend/app/api/v1/health.py#L10)
  - Signature: `check_health()`
  - Purpose: Return schema defaults; despite the older docstring, no database probe is performed.
  - Calls include: `router.get`, `HealthCheck`.

### `backend/app/api/v1/intelligence.py`

- [operator](../../backend/app/api/v1/intelligence.py#L29)
  - Signature: `operator(x_operator_key: str \| None=Header(default=None))`
  - Purpose: Validate the shared operator header when configured; reject ungated non-development writes using this dependency.
  - Calls include: `Header`, `os.getenv`, `HTTPException`, `secrets.compare_digest`.
- [project](../../backend/app/api/v1/intelligence.py#L36)
  - Signature: `project(db, pid)`
  - Purpose: Resolve a numeric database project ID or raise 404.
  - Calls include: `db.get`, `HTTPException`.
- [records](../../backend/app/api/v1/intelligence.py#L42)
  - Signature: `records(db, kind, pid=None)`
  - Purpose: Read and decode evidence JSON by kind and optional project, newest first.
  - Calls include: `db.query(Evidence).filter`, `q.filter`, `db.query`, `r.created_at.isoformat`, `json.loads`, `q.order_by(Evidence.id.desc()).all`, `q.order_by`, `Evidence.id.desc`.
- [save](../../backend/app/api/v1/intelligence.py#L48)
  - Signature: `save(db, kind, pid, payload, identity=None)`
  - Purpose: Persist evidence with kind/identity uniqueness and duplicate handling.
  - Calls include: `Evidence`, `db.add`, `db.commit`, `json.dumps`, `db.rollback`, `HTTPException`, `secrets.token_hex`.
- [status](../../backend/app/api/v1/intelligence.py#L59)
  - Signature: `status()`
  - Purpose: Report configured integrations and write-auth mode; does not probe connectivity.
  - Calls include: `router.get`, `bool`, `os.getenv`, `len`.
- [project_options](../../backend/app/api/v1/intelligence.py#L71)
  - Signature: `project_options(db: Session=Depends(get_db))`
  - Purpose: Return project choices for the Intelligence workspace.
  - Calls include: `router.get`, `Depends`, `db.query(Project).order_by(Project.name).all`, `db.query(Project).order_by`, `db.query`.
- [upload_document](../../backend/app/api/v1/intelligence.py#L81)
  - Signature: `upload_document(body: DocumentInput, db: Session=Depends(get_db))`
  - Purpose: Validate/decode PDF or text, extract pages, hash bytes and save deduplicated project evidence.
  - Calls include: `router.post`, `Depends`, `project`, `hashlib.sha256(raw).hexdigest`, `save`, `base64.b64decode`, `any`, `len`.
- [documents](../../backend/app/api/v1/intelligence.py#L103)
  - Signature: `documents(pid: int, db: Session=Depends(get_db))`
  - Purpose: List document metadata/pages while withholding stored original PDF base64.
  - Calls include: `router.get`, `Depends`, `project`, `records`, `r.items`.
- [ask](../../backend/app/api/v1/intelligence.py#L113)
  - Signature: `ask(body: Question, db: Session=Depends(get_db))`
  - Purpose: Apply project/portfolio filters, retrieve lexical passages, optionally ask Ollama and return facts/citations.
  - Calls include: `router.post`, `Depends`, `db.query`, `q.count`, `q.order_by(Project.overall_risk_score.desc()).limit(30).all`, `set`, `records`, `os.getenv`.
- [overrun_analysis](../../backend/app/api/v1/intelligence.py#L180)
  - Signature: `overrun_analysis(pid: int, db: Session=Depends(get_db))`
  - Purpose: Ask Ollama to explain a saved prediction and available factors; persist an alert on high/critical severity.
  - Calls include: `router.post`, `Depends`, `project`, `HTTPException`, `sorted`, `os.getenv`, `httpx.post`, `response.raise_for_status`.
- [market_save](../../backend/app/api/v1/intelligence.py#L225)
  - Signature: `market_save(body: Market, db: Session=Depends(get_db))`
  - Purpose: Save a supplied dated market/rain observation.
  - Calls include: `router.post`, `Depends`, `save`, `body.model_dump`.
- [market_list](../../backend/app/api/v1/intelligence.py#L229)
  - Signature: `market_list(db: Session=Depends(get_db))`
  - Purpose: List saved market observations.
  - Calls include: `router.get`, `Depends`, `records`.
- [twin](../../backend/app/api/v1/intelligence.py#L245)
  - Signature: `twin(body: Twin, db: Session=Depends(get_db))`
  - Purpose: Calculate project or portfolio material/rain scenario; optionally derive shocks from two market records.
  - Calls include: `router.post`, `Depends`, `body.model_dump`, `db.query(Project).all`, `sum`, `project`, `db.get`, `HTTPException`.
- [Satellite.ordered](../../backend/app/api/v1/intelligence.py#L281)
  - Signature: `Satellite.ordered(self)`
  - Purpose: Require increasing observation dates and compatible before/after sensor values.
  - Calls include: `model_validator`, `ValueError`.
- [satellite](../../backend/app/api/v1/intelligence.py#L287)
  - Signature: `satellite(body: Satellite, db: Session=Depends(get_db))`
  - Purpose: Validate and save imported before/after band observations; create discrepancy alert if rule triggers.
  - Calls include: `router.post`, `Depends`, `project`, `satellite_change`, `save`, `body.before.model_dump`, `body.after.model_dump`, `body.model_dump`.
- [satellite_list](../../backend/app/api/v1/intelligence.py#L298)
  - Signature: `satellite_list(pid: int, db: Session=Depends(get_db))`
  - Purpose: List persisted satellite observations for a project.
  - Calls include: `router.get`, `Depends`, `project`, `records`.
- [satellite_search](../../backend/app/api/v1/intelligence.py#L312)
  - Signature: `satellite_search(body: Catalog)`
  - Purpose: Search fixed Planetary Computer catalog by bounded coordinates, collection and dates.
  - Calls include: `router.post`, `HTTPException`, `httpx.post`, `r.raise_for_status`, `r.json`.
- [calibration](../../backend/app/api/v1/intelligence.py#L339)
  - Signature: `calibration(body: Calibration, db: Session=Depends(get_db))`
  - Purpose: Store operator-declared held-out model/target outcome pairs and optional survival cohort.
  - Calls include: `router.post`, `Depends`, `save`, `body.model_dump`.
- [uncertainty](../../backend/app/api/v1/intelligence.py#L343)
  - Signature: `uncertainty(pid: int, db: Session=Depends(get_db))`
  - Purpose: Match latest prediction to delay calibration, return residual interval, cohort curve and supported dates.
  - Calls include: `router.get`, `Depends`, `project`, `conformal`, `date.today`, `date`, `kaplan_meier`, `str`.
- [Contractor.counts](../../backend/app/api/v1/intelligence.py#L391)
  - Signature: `Contractor.counts(self)`
  - Purpose: Reject on-time milestone counts larger than the total milestone count.
  - Calls include: `model_validator`, `ValueError`.
- [contractor_save](../../backend/app/api/v1/intelligence.py#L397)
  - Signature: `contractor_save(body: Contractor, db: Session=Depends(get_db))`
  - Purpose: Save a sourced contractor/project delivery record after count validation.
  - Calls include: `router.post`, `Depends`, `project`, `save`, `body.model_dump`.
- [contractor_list](../../backend/app/api/v1/intelligence.py#L402)
  - Signature: `contractor_list(db: Session=Depends(get_db))`
  - Purpose: Aggregate latest contractor/project records; compute on-time/claims/payment/package indicators.
  - Calls include: `router.get`, `Depends`, `set`, `sorted`, `groups.items`, `records`, `seen.add`, `groups.setdefault(r['contractor_id'], []).append`.
- [Boundary.valid_ring](../../backend/app/api/v1/intelligence.py#L426)
  - Signature: `Boundary.valid_ring(self)`
  - Purpose: Validate distinct longitude/latitude vertices and nonzero polygon area; not a full topology validator.
  - Calls include: `model_validator`, `sum`, `any`, `ValueError`, `abs`, `len`, `set`, `zip`.
- [boundary_save](../../backend/app/api/v1/intelligence.py#L434)
  - Signature: `boundary_save(body: Boundary, db: Session=Depends(get_db))`
  - Purpose: Store supplied surveyed polygon after coordinate/area validation.
  - Calls include: `router.post`, `Depends`, `project`, `save`, `body.model_dump`.
- [boundary_get](../../backend/app/api/v1/intelligence.py#L439)
  - Signature: `boundary_get(pid: int, db: Session=Depends(get_db))`
  - Purpose: List boundaries by project ID.
  - Calls include: `router.get`, `Depends`, `records`.
- [inspection_save](../../backend/app/api/v1/intelligence.py#L454)
  - Signature: `inspection_save(body: Inspection, db: Session=Depends(get_db))`
  - Purpose: Validate retry identity, timestamp, photo/hash and GPS polygon; persist receipt or reject conflict.
  - Calls include: `router.post`, `Depends`, `project`, `body.model_dump`, `records`, `save`, `json.loads`, `any`.
- [inspection_list](../../backend/app/api/v1/intelligence.py#L489)
  - Signature: `inspection_list(pid: int, db: Session=Depends(get_db))`
  - Purpose: List saved inspection metadata excluding photo payload.
  - Calls include: `router.get`, `Depends`, `records`, `r.items`.
- [signing_key](../../backend/app/api/v1/intelligence.py#L497)
  - Signature: `signing_key()`
  - Purpose: Read the action-signing secret and require its minimum length.
  - Calls include: `os.getenv`, `key.encode`, `len`, `HTTPException`.
- [issue_token](../../backend/app/api/v1/intelligence.py#L502)
  - Signature: `issue_token(db, intervention_id)`
  - Purpose: Create an expiring action grant and HMAC-signed bearer token.
  - Calls include: `secrets.token_hex`, `hmac.new(signing_key(), data.encode(), hashlib.sha256).hexdigest`, `db.add`, `db.commit`, `int`, `ActionGrant`, `time.time`, `hmac.new`.
- [verify_token](../../backend/app/api/v1/intelligence.py#L510)
  - Signature: `verify_token(db, token)`
  - Purpose: Verify signature, expiry and unused persisted grant.
  - Calls include: `token.split`, `hmac.new(signing_key(), data.encode(), hashlib.sha256).hexdigest`, `db.get`, `ValueError`, `HTTPException`, `hmac.new`, `hmac.compare_digest`, `int`.
- [action_preview](../../backend/app/api/v1/intelligence.py#L523)
  - Signature: `action_preview(token: str, db: Session=Depends(get_db))`
  - Purpose: Return escaped HTML review form without applying the decision.
  - Calls include: `router.get`, `Depends`, `verify_token`, `db.get`, `HTMLResponse`, `HTTPException`, `escape`.
- [action_apply](../../backend/app/api/v1/intelligence.py#L536)
  - Signature: `action_apply(token: str, request: Request, db: Session=Depends(get_db))`
  - Purpose: Atomically consume grant and finalize intervention; persist signed-bearer decision evidence.
  - Calls include: `router.post`, `Depends`, `verify_token`, `request.headers.get('content-type', '').startswith`, `db.query(ActionGrant).filter_by(id=grant.id, consumed_at=None).update`, `db.add`, `db.commit`, `(await request.json()).get`.
- [dispatch_list](../../backend/app/api/v1/intelligence.py#L554)
  - Signature: `dispatch_list(db: Session=Depends(get_db))`
  - Purpose: List persisted delivery attempts.
  - Calls include: `router.get`, `Depends`, `records`.
- [dispatch](../../backend/app/api/v1/intelligence.py#L558)
  - Signature: `dispatch(body: Dispatch, db: Session=Depends(get_db))`
  - Purpose: Validate action/configuration and idempotency; create grant/attempt, call adapter and record acceptance/ambiguity.
  - Calls include: `router.post`, `Depends`, `db.get`, `project`, `os.getenv('PUBLIC_API_URL', '').rstrip`, `any`, `issue_token`, `escalation_tier`.
- [dossier](../../backend/app/api/v1/intelligence.py#L613)
  - Signature: `dossier(pid: int, db: Session=Depends(get_db))`
  - Purpose: Generate PDF from selected project records and available evidence.
  - Calls include: `router.get`, `Depends`, `project`, `io.BytesIO`, `getSampleStyleSheet`, `SimpleDocTemplate`, `Table`, `table.setStyle`.
- [dossier.paragraph](../../backend/app/api/v1/intelligence.py#L622)
  - Signature: `dossier.paragraph(text, style='BodyText')`
  - Purpose: Escape supplied text before placing it into a ReportLab paragraph with the chosen style.
  - Calls include: `Paragraph`, `escape`, `str`.
- [dossier.footer](../../backend/app/api/v1/intelligence.py#L641)
  - Signature: `dossier.footer(canvas, document)`
  - Purpose: Draw report page/footer information on the PDF canvas.
  - Calls include: `canvas.setFont`, `canvas.drawString`, `canvas.drawRightString`, `str`.
- [model_predict](../../backend/app/api/v1/intelligence.py#L651)
  - Signature: `model_predict(body: ModelInference, db: Session=Depends(get_db))`
  - Purpose: Require all feature keys, execute artifacts, fingerprint models and persist prediction/input/optional SHAP.
  - Calls include: `router.post`, `Depends`, `project`, `set`, `RiskPrediction`, `db.add`, `db.flush`, `db.commit`.
- [satellite_compute](../../backend/app/api/v1/intelligence.py#L707)
  - Signature: `satellite_compute(body: SatelliteCompute, db: Session=Depends(get_db))`
  - Purpose: Fetch optical raster pair, mask project/common usable pixels, calculate change and save review evidence.
  - Calls include: `router.post`, `Depends`, `project`, `records`, `zip`, `result.update`, `save`, `HTTPException`.
- [refresh_market](../../backend/app/api/v1/intelligence.py#L742)
  - Signature: `refresh_market(db: Session=Depends(get_db))`
  - Purpose: Fetch configured HTTPS normalized feed, validate all records, hash/deduplicate and commit.
  - Calls include: `router.post`, `Depends`, `os.getenv`, `url.startswith`, `HTTPException`, `json.loads`, `observation.model_dump`, `hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest`.
- [radar_compute](../../backend/app/api/v1/intelligence.py#L774)
  - Signature: `radar_compute(body: RadarCompute, db: Session=Depends(get_db))`
  - Purpose: Fetch compatible Sentinel-1 RTC pair, compute power/dB change and save review evidence.
  - Calls include: `router.post`, `Depends`, `project`, `records`, `zip`, `result.update`, `save`, `os.getenv`.

### `backend/app/api/v1/interventions.py`

- [serialize](../../backend/app/api/v1/interventions.py#L16)
  - Signature: `serialize(row, db)`
  - Purpose: Convert a saved intervention and its project metadata to the legacy frontend response shape.
  - Calls include: `db.get`, `str`, `round`, `row.status.replace('_', ' ').title`, `row.created_at.isoformat`, `row.status.replace`.
- [list_interventions](../../backend/app/api/v1/interventions.py#L26)
  - Signature: `list_interventions(project_id: int \| None=None, db: Session=Depends(get_db))`
  - Purpose: List saved interventions, optionally filtered by project; does not generate actions.
  - Calls include: `router.get`, `Depends`, `db.query`, `q.order_by(Intervention.created_at.desc()).all`, `q.filter_by`, `q.order_by`, `len`, `Intervention.created_at.desc`.
- [generate](../../backend/app/api/v1/interventions.py#L33)
  - Signature: `generate(db: Session=Depends(get_db))`
  - Purpose: Explicitly generate persistent evidence-review actions, skipping previously generated project/type pairs.
  - Calls include: `router.post`, `Depends`, `db.query(Project).all`, `db.commit`, `escalation_tier`, `db.add`, `db.query`, `db.query(RiskPrediction).filter_by(project_id=p.id).all`.
- [get_project_interventions](../../backend/app/api/v1/interventions.py#L48)
  - Signature: `get_project_interventions(project_id: int, db: Session=Depends(get_db))`
  - Purpose: List saved project interventions; exact ID resolution/response depends on the route module.
  - Calls include: `router.get`, `Depends`, `list_interventions`, `db.get`, `HTTPException`.
- [approve_intervention](../../backend/app/api/v1/interventions.py#L58)
  - Signature: `approve_intervention(recommendation_id: int, body: ApprovalRequest, db: Session=Depends(get_db))`
  - Purpose: Record named review/decision with an atomic state check; reject changes to final states.
  - Calls include: `router.post`, `Depends`, `db.get`, `body.new_status.lower`, `db.add`, `db.commit`, `db.refresh`, `HTTPException`.

### `backend/app/api/v1/live.py`

- [live](../../backend/app/api/v1/live.py#L13)
  - Signature: `live(ws: WebSocket)`
  - Purpose: Validate WebSocket hello and configuration; relay project-context audio/transcripts with session limits.
  - Calls include: `router.websocket`, `ws.accept`, `operator`, `os.getenv`, `hello.get`, `asyncio.wait_for`, `ValueError`, `SessionLocal`.
- [live.send_audio](../../backend/app/api/v1/live.py#L38)
  - Signature: `live.send_audio()`
  - Purpose: Receive/validate browser PCM messages and forward accepted audio to Gemini.
  - Calls include: `json.loads`, `message.get`, `base64.b64decode`, `ws.receive_text`, `len`, `ValueError`, `isinstance`, `upstream.send`.
- [live.receive_audio](../../backend/app/api/v1/live.py#L51)
  - Signature: `live.receive_audio()`
  - Purpose: Relay provider messages, transcripts and audio events to the browser.
  - Calls include: `ws.send_text`, `isinstance`, `message.decode`.

### `backend/app/api/v1/models.py`

- [_load_cost_overrun_model_entry](../../backend/app/api/v1/models.py#L24)
  - Signature: `_load_cost_overrun_model_entry()`
  - Purpose: Builds a ModelVersionResponse describing the cost-overrun model, if scripts/train_cost_overrun_model.py has produced a results report.
  - Calls include: `Path`, `ModelVersionResponse`, `report_path.exists`, `open`, `json.load`, `_CLASSIFIER_PATH.exists`, `_REGRESSOR_PATH.exists`, `datetime.fromtimestamp`.
- [list_models](../../backend/app/api/v1/models.py#L58)
  - Signature: `list_models(db: Session=Depends(get_db))`
  - Purpose: Retrieve metadata for trained and deployed machine learning models from DB.
  - Calls include: `router.get`, `Depends`, `_load_cost_overrun_model_entry`, `db.query(ModelVersion).order_by`, `list`, `ModelVersion.training_timestamp.desc`, `db.query`.

### `backend/app/api/v1/monthly.py`

- [_parse_cost_string](../../backend/app/api/v1/monthly.py#L42)
  - Signature: `_parse_cost_string(val: Any)` → `tuple[float, float]`
  - Purpose: Parse strings like '676815.96 (813263.75)' → (original, revised).
  - Calls include: `str(val).strip`, `re.match`, `float`, `str`, `m.group(1).replace`, `m.group(2).replace`, `s.replace`, `m.group`.
- [_load_ministry_month](../../backend/app/api/v1/monthly.py#L58)
  - Signature: `_load_ministry_month(month: str)` → `Optional[list]`
  - Purpose: Load a single ministry CSV and return list of row dicts.
  - Calls include: `path.exists`, `max`, `open`, `csv.reader`, `logger.warning`, `data_rows.append`, `len`, `result.append`.
- [_load_sector_month](../../backend/app/api/v1/monthly.py#L129)
  - Signature: `_load_sector_month(month: str)` → `Optional[dict]`
  - Purpose: Load a sector summary CSV and return {sector: {count, orig_cr, rev_cr, exp_cr}}.
  - Calls include: `path.exists`, `pd.read_csv`, `df.iterrows`, `_parse_cost_string`, `logger.warning`, `str(v).strip().strip`, `int`, `len`.
- [_build_monthly_aggregate](../../backend/app/api/v1/monthly.py#L160)
  - Signature: `_build_monthly_aggregate()` → `List[Dict]`
  - Purpose: Read the coded month window and aggregate financial/project summaries across supported CSV layouts.
  - Calls include: `_load_ministry_month`, `_load_sector_month`, `rows.append`, `len`, `round`, `_safe`, `row.get`, `_parse_cost_string`.
- [_build_monthly_aggregate._safe](../../backend/app/api/v1/monthly.py#L179)
  - Signature: `_build_monthly_aggregate._safe(v: str)` → `float`
  - Purpose: Parse a numeric CSV field and use the local fallback for malformed values.
  - Calls include: `float`, `str(v).replace`, `str`.
- [_find_project_across_months](../../backend/app/api/v1/monthly.py#L229)
  - Signature: `_find_project_across_months(ext_id: str)` → `List[Dict]`
  - Purpose: Search every monthly CSV for the given project ID and build 1-year trajectory.
  - Calls include: `_load_ministry_month`, `next`, `float`, `str`, `compute_project_risk_and_predictions`, `trajectory.append`, `row.get`, `round`.
- [get_monthly_overview](../../backend/app/api/v1/monthly.py#L283)
  - Signature: `get_monthly_overview()`
  - Purpose: Returns month-by-month aggregate statistics for the full 2025-07 → 2026-07 window.
  - Calls include: `router.get`, `_build_monthly_aggregate`, `GenericResponse`, `len`.
- [get_monthly_sectors](../../backend/app/api/v1/monthly.py#L294)
  - Signature: `get_monthly_sectors(month: str=Query('2026-07', description='Month in YYYY-MM format'))`
  - Purpose: Returns sector-level breakdown for a specific month.
  - Calls include: `router.get`, `Query`, `_load_ministry_month`, `GenericResponse`, `HTTPException`, `str(row.get('sector', '')).strip`, `row.get`, `int`.
- [get_monthly_sectors._safe](../../backend/app/api/v1/monthly.py#L306)
  - Signature: `get_monthly_sectors._safe(v: str)` → `float`
  - Purpose: Parse a numeric CSV field and use the local fallback for malformed values.
  - Calls include: `float`, `str(v).replace`, `str`.
- [get_available_months](../../backend/app/api/v1/monthly.py#L339)
  - Signature: `get_available_months()`
  - Purpose: Returns the list of months for which dataset files exist.
  - Calls include: `router.get`, `GenericResponse`, `path.exists`, `available.append`.
- [get_project_monthly_trajectory](../../backend/app/api/v1/monthly.py#L354)
  - Signature: `get_project_monthly_trajectory(ext_project_id: str)`
  - Purpose: Searches all 13 monthly CSVs for the given MoSPI project ID and returns its full temporal trajectory covering budget, expenditure, overrun %, and computed risk score.
  - Calls include: `router.get`, `_find_project_across_months`, `GenericResponse`, `HTTPException`, `len`, `max`, `min`, `round`.
- [get_monthly_projects](../../backend/app/api/v1/monthly.py#L395)
  - Signature: `get_monthly_projects(month: str=Query('2026-07', description='Month in YYYY-MM format'))`
  - Purpose: Returns the list of projects for a given month, matching the standard DB project schema.
  - Calls include: `router.get`, `Query`, `_load_ministry_month`, `GenericResponse`, `HTTPException`, `_safe`, `compute_project_risk_and_predictions`, `projects.append`.
- [get_monthly_projects._safe](../../backend/app/api/v1/monthly.py#L407)
  - Signature: `get_monthly_projects._safe(v: str)` → `float`
  - Purpose: Parse a numeric CSV field and use the local fallback for malformed values.
  - Calls include: `float`, `str(v).replace`, `str`.
- [_parse_summary_file](../../backend/app/api/v1/monthly.py#L448)
  - Signature: `_parse_summary_file(path: Path)` → `List[dict]`
  - Purpose: Parse a 5-column summary CSV like state or physical-progress.
  - Calls include: `enumerate`, `path.exists`, `open`, `csv.reader`, `list`, `line[0].isdigit`, `len`, `row[1].strip`.
- [get_monthly_state](../../backend/app/api/v1/monthly.py#L485)
  - Signature: `get_monthly_state(month: str=Query('2026-07'))`
  - Purpose: Returns the state-wise breakdown for a specific month.
  - Calls include: `router.get`, `Query`, `_parse_summary_file`, `GenericResponse`, `HTTPException`.
- [get_monthly_physical_progress](../../backend/app/api/v1/monthly.py#L494)
  - Signature: `get_monthly_physical_progress(month: str=Query('2026-07'))`
  - Purpose: Returns the physical progress distribution for a specific month.
  - Calls include: `router.get`, `Query`, `_parse_summary_file`, `GenericResponse`, `HTTPException`.

### `backend/app/api/v1/predictions.py`

- [_get_scored_projects_for_month](../../backend/app/api/v1/predictions.py#L18)
  - Signature: `_get_scored_projects_for_month(month: str, db: Session)` → `List[Dict[str, Any]]`
  - Purpose: Retrieves and scores projects for the requested month.
  - Calls include: `_load_ministry_month`, `enumerate`, `month.strip`, `db.query(Project).all`, `_safe_float`, `str(row.get('sector') or 'Unknown').strip`, `str(row.get('ministry') or 'Unknown').strip`, `str(row.get('name') or 'Unnamed Project').strip`.
- [_get_scored_projects_for_month._safe_float](../../backend/app/api/v1/predictions.py#L75)
  - Signature: `_get_scored_projects_for_month._safe_float(v: Any)` → `float`
  - Purpose: Normalize source numeric values for month-specific scoring.
  - Calls include: `float`, `str(v).replace(',', '').strip`, `str(v).replace`, `str`.
- [get_cost_overrun_predictions](../../backend/app/api/v1/predictions.py#L124)
  - Signature: `get_cost_overrun_predictions(month: str=Query('2026-07', description='Month identifier (e.g. 2026-07, 2026-06, etc.)'), sector: Optional[str]=Query(None, description='Filter by sector'), ministry: Optional[str]=Query(None, description='Filter by ministry'), risk_level: Optional[str]=Query(None, description='Filter by risk tier (Low, Moderate, High, Critical)'), search: Optional[str]=Query(None, description='Search project name or ID'), sort_by: str=Query('cost_overrun_pct', description='Sort field: cost_overrun_pct, cost_overrun_exposure_cr, budget_cr, overall_risk_score'), order: str=Query('desc', description='Sort direction: asc or desc'), limit: int=Query(50, ge=1, le=2000), offset: int=Query(0, ge=0), db: Session=Depends(get_db))`
  - Purpose: Filter/sort/paginate formula-derived cost-growth estimates and exposure for the selected reporting month.
  - Calls include: `router.get`, `Query`, `Depends`, `_get_scored_projects_for_month`, `len`, `sum`, `filtered.sort`, `GenericResponse`.
- [get_time_overrun_predictions](../../backend/app/api/v1/predictions.py#L222)
  - Signature: `get_time_overrun_predictions(month: str=Query('2026-07', description='Month identifier (e.g. 2026-07, 2026-06, etc.)'), sector: Optional[str]=Query(None, description='Filter by sector'), ministry: Optional[str]=Query(None, description='Filter by ministry'), delay_severity: Optional[str]=Query(None, description='Filter by delay category: Severe Delay, Significant Delay, Minor Delay, On-Track'), search: Optional[str]=Query(None, description='Search project name or ID'), sort_by: str=Query('predicted_delay_days', description='Sort field: predicted_delay_days, delay_risk_score, overall_risk_score, budget_cr'), order: str=Query('desc', description='Sort direction: asc or desc'), limit: int=Query(50, ge=1, le=2000), offset: int=Query(0, ge=0), db: Session=Depends(get_db))`
  - Purpose: Filter/sort/paginate formula-derived schedule estimates and aggregate delay statistics.
  - Calls include: `router.get`, `Query`, `Depends`, `_get_scored_projects_for_month`, `len`, `sum`, `filtered.sort`, `GenericResponse`.
- [get_predictions](../../backend/app/api/v1/predictions.py#L323)
  - Signature: `get_predictions(project_id: Optional[int]=None, db: Session=Depends(get_db))`
  - Purpose: Recompute composite estimates for a valid project; otherwise returns fixed fallback values 14.5 percent and 42 days. Not trained inference.
  - Calls include: `router.get`, `Depends`, `GenericResponse`, `db.query(Project).filter(Project.id == project_id).first`, `compute_project_risk_and_predictions`, `db.query(Project).filter`, `db.query`.

### `backend/app/api/v1/project_updates.py`

- [list_project_updates](../../backend/app/api/v1/project_updates.py#L13)
  - Signature: `list_project_updates(project_id: int \| None=None, limit: int=Query(100, ge=1, le=1000), db: Session=Depends(get_db))`
  - Purpose: List persisted project observations, newest first, optionally scoped to project.
  - Calls include: `router.get`, `Query`, `Depends`, `db.query`, `q.order_by(ProjectUpdate.timestamp.desc()).limit(limit).all`, `project`, `q.filter_by`, `q.order_by(ProjectUpdate.timestamp.desc()).limit`.
- [create_update](../../backend/app/api/v1/project_updates.py#L27)
  - Signature: `create_update(body: UpdateInput, db: Session=Depends(get_db))`
  - Purpose: Create a non-synthetic-tagged progress/expenditure record for an existing project.
  - Calls include: `router.post`, `Depends`, `project`, `ProjectUpdate`, `db.add`, `db.commit`, `body.model_dump`.
- [list_milestones](../../backend/app/api/v1/project_updates.py#L33)
  - Signature: `list_milestones(project_id: int \| None=None, limit: int=Query(100, ge=1, le=1000), db: Session=Depends(get_db))`
  - Purpose: List stored milestones by planned date, optionally scoped to project.
  - Calls include: `router.get`, `Query`, `Depends`, `db.query`, `q.order_by(Milestone.planned_date).limit(limit).all`, `project`, `q.filter_by`, `q.order_by(Milestone.planned_date).limit`.
- [MilestoneInput.validate_completion](../../backend/app/api/v1/project_updates.py#L46)
  - Signature: `MilestoneInput.validate_completion(self)`
  - Purpose: Require actual date exactly when milestone state is completed.
  - Calls include: `model_validator`, `ValueError`.
- [create_milestone](../../backend/app/api/v1/project_updates.py#L51)
  - Signature: `create_milestone(body: MilestoneInput, db: Session=Depends(get_db))`
  - Purpose: Create milestone with validated planned/actual date and completion-state relationship.
  - Calls include: `router.post`, `Depends`, `project`, `Milestone`, `db.add`, `db.commit`, `body.model_dump`.

### `backend/app/api/v1/projects.py`

- [get_projects](../../backend/app/api/v1/projects.py#L23)
  - Signature: `get_projects(limit: int=Query(2000, ge=1, le=5000), offset: int=Query(0, ge=0), status: Optional[str]=Query(None, description='Filter by status (e.g. active, at_risk, completed)'), sector: Optional[str]=Query(None, description='Filter by sector'), ministry: Optional[str]=Query(None, description='Filter by ministry'), search: Optional[str]=Query(None, description='Search keyword in name or description'), sort_by: str=Query('id', description='Field to sort by'), order: str=Query('asc', description='Sort order (asc or desc)'), db: Session=Depends(get_db))`
  - Purpose: Retrieve list of monitored infrastructure projects from DB with filtering and pagination.
  - Calls include: `router.get`, `Query`, `Depends`, `ProjectService.get_projects`.
- [get_project](../../backend/app/api/v1/projects.py#L43)
  - Signature: `get_project(project_id: str, db: Session=Depends(get_db))`
  - Purpose: Fetch metadata for a single project by ID or external_project_id.
  - Calls include: `router.get`, `Depends`, `ProjectService.get_project_by_id`, `HTTPException`.
- [get_project_predictions](../../backend/app/api/v1/projects.py#L55)
  - Signature: `get_project_predictions(project_id: str, db: Session=Depends(get_db))`
  - Purpose: Get stored ML risk predictions for a project from DB.
  - Calls include: `router.get`, `Depends`, `ProjectService.get_project_by_id`, `HTTPException`, `RiskPrediction.timestamp.desc`, `db.query(RiskPrediction).filter`, `db.query`.
- [get_project_risk](../../backend/app/api/v1/projects.py#L68)
  - Signature: `get_project_risk(project_id: str, db: Session=Depends(get_db))`
  - Purpose: Retrieve complete risk assessment for a project directly from DB.
  - Calls include: `router.get`, `Depends`, `ProjectService.get_project_by_id`, `GenericResponse`, `HTTPException`, `RiskPrediction.timestamp.desc`, `db.query(RiskPrediction).filter`, `str`.
- [get_project_risk_trajectory](../../backend/app/api/v1/projects.py#L99)
  - Signature: `get_project_risk_trajectory(project_id: str, db: Session=Depends(get_db))`
  - Purpose: Retrieve historical risk scores, trajectory metrics, and state machine state for a project.
  - Calls include: `router.get`, `Depends`, `ProjectService.get_project_by_id`, `early_warning_engine.calculate_trajectory_metrics`, `early_warning_engine.evaluate_and_generate_alerts`, `GenericResponse`, `HTTPException`, `str`.
- [get_project_interventions](../../backend/app/api/v1/projects.py#L131)
  - Signature: `get_project_interventions(project_id: int, db: Session=Depends(get_db))`
  - Purpose: List saved project interventions; exact ID resolution/response depends on the route module.
  - Calls include: `router.get`, `Depends`, `ProjectService.get_project_by_id`, `HTTPException`, `Intervention.created_at.desc`, `db.query(Intervention).filter`, `db.query`.
- [create_project](../../backend/app/api/v1/projects.py#L144)
  - Signature: `create_project(project_in: ProjectCreate, db: Session=Depends(get_db))`
  - Purpose: Create a new project record.
  - Calls include: `router.post`, `Depends`, `ProjectService.create_project`.

### `backend/app/api/v1/risks.py`

- [get_risk_scores](../../backend/app/api/v1/risks.py#L9)
  - Signature: `get_risk_scores(project_id: int \| None=None, limit: int=Query(100, ge=1, le=1000), db: Session=Depends(get_db))`
  - Purpose: Read saved predictions and attribution rows, never synthesize missing factors.
  - Calls include: `router.get`, `Query`, `Depends`, `db.query`, `project`, `query.filter_by`, `query.order_by(RiskPrediction.prediction_timestamp.desc()).limit`, `r.prediction_timestamp.isoformat`.

### `backend/app/api/v1/scenarios.py`

- [simulate_scenario](../../backend/app/api/v1/scenarios.py#L15)
  - Signature: `simulate_scenario(payload: ScenarioSimulationInput, db: Session=Depends(get_db))`
  - Purpose: Apply the twin plus explicit budget, duration and supply-chain deltas to stored projects.
  - Calls include: `router.post`, `Depends`, `Twin.model_validate`, `twin`, `sum`, `payload.model_dump`, `db.get`.

### `backend/app/config.py`

- [Settings.get_database_url](../../backend/app/config.py#L33)
  - Signature: `Settings.get_database_url(self)` → `str`
  - Purpose: Retrieve database URL from environment or fallback to absolute backend/paimana.db.
  - Calls include: `os.getenv`, `Path(__file__).resolve`, `Path`.

### `backend/app/data_pipeline/db_loader.py`

- [_compute_risk_score](../../backend/app/data_pipeline/db_loader.py#L12)
  - Signature: `_compute_risk_score(cost_growth_percent: float)` → `float`
  - Purpose: Legacy compatibility helper.
  - Calls include: `pd.isna`, `max`, `min`, `float`.
- [load_projects_from_dataframe](../../backend/app/data_pipeline/db_loader.py#L19)
  - Signature: `load_projects_from_dataframe(db: Session, df: pd.DataFrame)` → `int`
  - Purpose: Upserts processed dataset rows into the projects table.
  - Calls include: `df.iterrows`, `db.commit`, `logger.info`, `str`, `float`, `row.get`, `pd.isna`, `existing.get`.

### `backend/app/data_pipeline/feature_engineering.py`

- [compute_linear_trend](../../backend/app/data_pipeline/feature_engineering.py#L7)
  - Signature: `compute_linear_trend(series: pd.Series)` → `float`
  - Purpose: Computes linear trend slope over historical window.
  - Calls include: `series.dropna`, `np.arange`, `len`, `np.polyfit`, `float`.
- [generate_derived_features](../../backend/app/data_pipeline/feature_engineering.py#L20)
  - Signature: `generate_derived_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Stage 15: Computes derived point-in-time features with strict target leakage validation.
  - Calls include: `logger.info`, `df.copy`, `any`, `df.sort_values(by=['project_id', 'observation_date']).reset_index`, `np.where`, `(df['revised_end_date'] - df['planned_end_date']).dt.days.fillna`, `df.groupby`, `df['physical_progress_pct'].fillna`.
- [validate_target_leakage](../../backend/app/data_pipeline/feature_engineering.py#L131)
  - Signature: `validate_target_leakage(df: pd.DataFrame)`
  - Purpose: Stage 16 Validation: Verifies that no future observation data leaks into past features.
  - Calls include: `df.iterrows`, `logger.info`, `pd.notnull`, `row.get`, `logger.warning`.

### `backend/app/data_pipeline/generate_raw_data.py`

- [generate_raw_sample_data](../../backend/app/data_pipeline/generate_raw_data.py#L6)
  - Signature: `generate_raw_sample_data()`
  - Purpose: Generate raw sample data for demonstrations/experiments; not a government feed.
  - Calls include: `Path`, `raw_dir.mkdir`, `pd.DataFrame`, `df_csv.to_csv`, `df_excel.to_excel`, `df_pdf.to_csv`, `print`, `open`.

### `backend/app/data_pipeline/ingestion.py`

- [load_file](../../backend/app/data_pipeline/ingestion.py#L10)
  - Signature: `load_file(file_path: Path)` → `pd.DataFrame`
  - Purpose: Reads input data from CSV, Excel, JSON, or PDF-derived formats.
  - Calls include: `file_path.suffix.lower`, `logger.info`, `pd.read_csv`, `pd.read_excel`, `pd.json_normalize`, `ValueError`, `len`, `open`.
- [flatten_and_map_columns](../../backend/app/data_pipeline/ingestion.py#L29)
  - Signature: `flatten_and_map_columns(df: pd.DataFrame, source_filename: str)` → `Tuple[pd.DataFrame, Dict[str, Any]]`
  - Purpose: Stage 2: Schema validation & canonical mapping across heterogeneous raw formats.
  - Calls include: `list`, `df.rename`, `' '.join`, `len`, `col.split`, `clean_col.split`, `unmapped_cols.append`.
- [run_ingestion_and_schema_validation](../../backend/app/data_pipeline/ingestion.py#L65)
  - Signature: `run_ingestion_and_schema_validation(raw_dir: Path)` → `Tuple[pd.DataFrame, List[Dict[str, Any]]]`
  - Purpose: Runs Stage 1 (Ingestion) and Stage 2 (Schema Validation) over data/raw/.
  - Calls include: `pd.concat`, `logger.info`, `files.extend`, `FileNotFoundError`, `list`, `load_file`, `flatten_and_map_columns`, `all_dfs.append`.

### `backend/app/data_pipeline/normalization.py`

- [normalize_project_id](../../backend/app/data_pipeline/normalization.py#L8)
  - Signature: `normalize_project_id(val: any)` → `str`
  - Purpose: Stage 7: Standardizes project identifiers (e.g. 'PRJ-1001', '1001', 'PROJ_1001' -> '1001').
  - Calls include: `str(val).strip`, `re.findall`, `val_str.upper`, `pd.isna`, `str`.
- [normalize_dates](../../backend/app/data_pipeline/normalization.py#L18)
  - Signature: `normalize_dates(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Stage 8: Standardizes all date fields to pd.Timestamp / ISO YYYY-MM-DD.
  - Calls include: `pd.to_datetime`.
- [normalize_costs](../../backend/app/data_pipeline/normalization.py#L26)
  - Signature: `normalize_costs(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Stage 9: Standardizes cost and expenditure columns to numeric float (in ₹ Crores).
  - Calls include: `pd.to_numeric(df[col], errors='coerce').astype`, `pd.to_numeric`.
- [normalize_progress](../../backend/app/data_pipeline/normalization.py#L34)
  - Signature: `normalize_progress(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Stage 10: Ensures progress percentage metrics are on 0-100 float scale.
  - Calls include: `pd.to_numeric(df['physical_progress_pct'], errors='coerce').astype`, `df['physical_progress_pct'].dropna`, `pd.to_numeric`, `len`, `valid_vals.max`.
- [normalize_categorical_fields](../../backend/app/data_pipeline/normalization.py#L44)
  - Signature: `normalize_categorical_fields(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Stage 11: Categorical encoding preparation (standardizes strings & trims whitespace).
  - Calls include: `df[col].astype(str).str.strip`, `df[col].replace`, `df[col].astype`.
- [run_normalization_pipeline](../../backend/app/data_pipeline/normalization.py#L53)
  - Signature: `run_normalization_pipeline(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Executes Stages 3, 7, 8, 9, 10, 11, 12, 13, 14.
  - Calls include: `logger.info`, `df['project_id'].apply`, `normalize_dates`, `normalize_costs`, `normalize_progress`, `normalize_categorical_fields`, `df.sort_values(by=['project_id', 'observation_date']).reset_index`, `df['observation_date'].dt.to_period('M').dt.to_timestamp`.

### `backend/app/data_pipeline/quality_checks.py`

- [detect_duplicates](../../backend/app/data_pipeline/quality_checks.py#L9)
  - Signature: `detect_duplicates(df: pd.DataFrame)` → `Tuple[pd.DataFrame, Dict[str, Any]]`
  - Purpose: Stage 4: Identifies duplicate records across core business keys (project_id, observation_date).
  - Calls include: `df.duplicated`, `logger.info`, `len`, `int`, `df[key_dups]['project_id'].unique().tolist`, `exact_dups.sum`, `key_dups.sum`, `df[key_dups]['project_id'].unique`.
- [analyze_missingness](../../backend/app/data_pipeline/quality_checks.py#L30)
  - Signature: `analyze_missingness(df: pd.DataFrame)` → `Dict[str, Any]`
  - Purpose: Stage 5: Analyzes missing value patterns across attributes.
  - Calls include: `df.isnull().sum`, `(df.isnull().sum() / len(df) * 100).round`, `df.isnull`, `int`, `float`, `len`.
- [detect_anomalies_and_quality_flags](../../backend/app/data_pipeline/quality_checks.py#L43)
  - Signature: `detect_anomalies_and_quality_flags(df: pd.DataFrame)` → `Tuple[pd.DataFrame, Dict[str, Any]]`
  - Purpose: Stage 6 & 16: Analyzes statistical outliers & domain rules, attaching quality_flags.
  - Calls include: `df.iterrows`, `';'.join`, `range`, `pd.notnull`, `row_flags.append`, `len`, `row.get`.
- [generate_markdown_quality_report](../../backend/app/data_pipeline/quality_checks.py#L93)
  - Signature: `generate_markdown_quality_report(schema_reports: List[Dict[str, Any]], dup_report: Dict[str, Any], missing_report: Dict[str, Any], anomalies_report: Dict[str, Any], output_path: Path)`
  - Purpose: Generates the comprehensive docs/data-quality-report.md document.
  - Calls include: `output_path.parent.mkdir`, `missing_report.items`, `logger.info`, `len`, `open`, `f.write`, `', '.join`, `map`.

### `backend/app/data_pipeline/recompute_risk_scores.py`

- [recompute_all_project_risks](../../backend/app/data_pipeline/recompute_risk_scores.py#L15)
  - Signature: `recompute_all_project_risks()`
  - Purpose: Recalculate and persist composite scores for database projects.
  - Calls include: `SessionLocal`, `db.query(Project).all`, `logger.info`, `db.commit`, `db.close`, `compute_project_risk_and_predictions`, `db.rollback`, `logger.error`.

### `backend/app/data_pipeline/runner.py`

- [run_etl_pipeline](../../backend/app/data_pipeline/runner.py#L23)
  - Signature: `run_etl_pipeline(raw_dir: Path=Path('data/raw'), interim_dir: Path=Path('data/interim'), processed_dir: Path=Path('data/processed'), docs_dir: Path=Path('docs'))` → `Tuple[pd.DataFrame, Path]`
  - Purpose: Executes the 16-stage production ETL pipeline deterministically.
  - Calls include: `Path`, `logger.info`, `interim_dir.mkdir`, `processed_dir.mkdir`, `docs_dir.mkdir`, `run_ingestion_and_schema_validation`, `raw_df.to_csv`, `run_normalization_pipeline`.

### `backend/app/database.py`

- [get_db](../../backend/app/database.py#L27)
  - Signature: `get_db()` → `Generator[Session, None, None]`
  - Purpose: Dependency that provides a database session to API route handlers.
  - Calls include: `SessionLocal`, `db.close`.

### `backend/app/main.py`

- [root](../../backend/app/main.py#L39)
  - Signature: `root()`
  - Purpose: Root status greeting.
  - Calls include: `app.get`.

### `backend/app/services/copilot_engine.py`

- [CopilotEngine.__init__](../../backend/app/services/copilot_engine.py#L27)
  - Signature: `CopilotEngine.__init__(self, db: Session)`
  - Purpose: Initialize CopilotEngine state/dependencies; see constructor assignments and calls for defaults.
- [CopilotEngine.get_project](../../backend/app/services/copilot_engine.py#L32)
  - Signature: `CopilotEngine.get_project(self, project_id: int)` → `Dict[str, Any]`
  - Purpose: Legacy tool: retrieve project metadata and shape a copilot response; not the active assistant route.
  - Calls include: `self.db.query(Project).filter(Project.id == project_id).first`, `self.db.query(Project).filter`, `project.target_completion.isoformat`, `datetime.utcnow().isoformat`, `self.db.query`, `datetime.utcnow`.
- [CopilotEngine.get_project_risk](../../backend/app/services/copilot_engine.py#L54)
  - Signature: `CopilotEngine.get_project_risk(self, project_id: int)` → `Dict[str, Any]`
  - Purpose: Legacy tool: return risk information/defaults; current assistant uses the intelligence API.
  - Calls include: `risk.created_at.isoformat`, `datetime.utcnow().isoformat`, `RiskAssessment.created_at.desc`, `Prediction.created_at.desc`, `self.db.query(RiskAssessment).filter`, `self.db.query(Prediction).filter`, `datetime.utcnow`, `self.db.query`.
- [CopilotEngine.get_risk_trajectory](../../backend/app/services/copilot_engine.py#L80)
  - Signature: `CopilotEngine.get_risk_trajectory(self, project_id: int, timespan: str='12m')` → `Dict[str, Any]`
  - Purpose: Legacy tool: assemble trajectory information/defaults; not a current routed retrieval tool.
  - Calls include: `history.append`, `datetime.utcnow().isoformat`, `RiskAssessment.created_at.asc`, `self.db.query(RiskAssessment).filter`, `a.created_at.strftime`, `datetime.utcnow`, `self.db.query`.
- [CopilotEngine.search_projects](../../backend/app/services/copilot_engine.py#L114)
  - Signature: `CopilotEngine.search_projects(self, sector: Optional[str]=None, state: Optional[str]=None, risk_level: Optional[str]=None, risk_trend: Optional[str]=None, delay_probability_min: Optional[float]=None)` → `Dict[str, Any]`
  - Purpose: Legacy tool: search project records using supported filters; not used by current portfolio planner.
  - Calls include: `self.db.query`, `query.all`, `query.filter`, `results.append`, `len`, `Project.sector.ilike`, `Project.state.ilike`, `datetime.utcnow().isoformat`.
- [CopilotEngine.compare_projects](../../backend/app/services/copilot_engine.py#L147)
  - Signature: `CopilotEngine.compare_projects(self, project_id_1: int, project_id_2: int)` → `Dict[str, Any]`
  - Purpose: Legacy tool: assemble two project records for a comparative answer.
  - Calls include: `self.get_project`, `self.get_project_risk`, `datetime.utcnow().isoformat`, `p1.get`, `p2.get`, `datetime.utcnow`.
- [CopilotEngine.get_risk_drivers](../../backend/app/services/copilot_engine.py#L163)
  - Signature: `CopilotEngine.get_risk_drivers(self, project_id: int)` → `Dict[str, Any]`
  - Purpose: Legacy tool with illustrative risk-factor values; not active evidence-backed TreeSHAP retrieval.
  - Calls include: `datetime.utcnow().isoformat`, `datetime.utcnow`.
- [CopilotEngine.simulate_scenario](../../backend/app/services/copilot_engine.py#L177)
  - Signature: `CopilotEngine.simulate_scenario(self, project_id: int, change: Dict[str, Any])` → `Dict[str, Any]`
  - Purpose: Apply the twin plus explicit budget, duration and supply-chain deltas to stored projects.
  - Calls include: `self.get_project_risk`, `base_risk.get`, `change.get`, `min`, `max`, `round`, `datetime.utcnow().isoformat`, `datetime.utcnow`.
- [CopilotEngine.get_interventions](../../backend/app/services/copilot_engine.py#L199)
  - Signature: `CopilotEngine.get_interventions(self, project_id: int)` → `Dict[str, Any]`
  - Purpose: Legacy copilot tool for suggested interventions; not the current durable generation endpoint.
  - Calls include: `datetime.utcnow().isoformat`, `datetime.utcnow`.
- [CopilotEngine.get_data_source](../../backend/app/services/copilot_engine.py#L217)
  - Signature: `CopilotEngine.get_data_source(self, claim: str)` → `Dict[str, Any]`
  - Purpose: Legacy tool mapping a claim to source information; not a citation-entailment validator.
  - Calls include: `datetime.utcnow().isoformat`, `datetime.utcnow`.
- [CopilotEngine.process_user_query](../../backend/app/services/copilot_engine.py#L226)
  - Signature: `CopilotEngine.process_user_query(self, query: str)` → `Dict[str, Any]`
  - Purpose: Legacy rule-based query dispatcher; replaced at the API boundary by intelligence.ask.
  - Calls include: `query.lower`, `self.audit_logs.append`, `self.compare_projects`, `tools_called.append`, `datetime.utcnow().isoformat`, `self.simulate_scenario`, `data['project_1'].get`, `self.get_risk_drivers`.

### `backend/app/services/early_warning_engine.py`

- [EarlyWarningEngine.__init__](../../backend/app/services/early_warning_engine.py#L80)
  - Signature: `EarlyWarningEngine.__init__(self, cooldown_days: float=7.0)`
  - Purpose: Initialize EarlyWarningEngine state/dependencies; see constructor assignments and calls for defaults.
- [EarlyWarningEngine.transition_state](../../backend/app/services/early_warning_engine.py#L85)
  - Signature: `EarlyWarningEngine.transition_state(self, current_risk: float, previous_risk: float, velocity: float, acceleration: float, consecutive_increases: int)` → `RiskState`
  - Purpose: Determines state machine state based on threshold boundaries: - CRITICAL: Risk >= 0.75 or (Risk >= 0.60 and velocity > 0.01/day) - HIGH_RISK: Risk >= 0.50 - ESCALATING: Acceleration > 0.002/day^2 or consecutive_increases >= 3 - WATCH: Risk >= 0.30 or velocity > 0.001/day or consecutive_increases >= 2 - STABLE: Otherwise
- [EarlyWarningEngine.calculate_trajectory_metrics](../../backend/app/services/early_warning_engine.py#L112)
  - Signature: `EarlyWarningEngine.calculate_trajectory_metrics(self, project_id: str, observations: List[Dict[str, Any]])` → `RiskMetrics`
  - Purpose: Calculates 9 trajectory metrics from chronologically ordered project observation snapshots: [{ "timestamp": "2026-08-01", "risk_score": 0.35 }, ...]
  - Calls include: `sorted`, `float`, `pd_timestamp`, `max`, `range`, `self.transition_state`, `RiskMetrics`, `ValueError`.
- [EarlyWarningEngine.evaluate_and_generate_alerts](../../backend/app/services/early_warning_engine.py#L215)
  - Signature: `EarlyWarningEngine.evaluate_and_generate_alerts(self, project_id: str, metrics: RiskMetrics, project_impact_weight: float=1.0)` → `Optional[EarlyWarningAlert]`
  - Purpose: Evaluates risk metrics, applies trigger conditions, computes priority score, enforces cooldown deduplication, and returns an EarlyWarningAlert if triggered.
  - Calls include: `self._is_alert_in_cooldown`, `EarlyWarningAlert`, `self.alert_history.append`, `triggers.append`, `len`, `logger.info`, `datetime.utcnow().isoformat`, `'; '.join`.
- [EarlyWarningEngine._is_alert_in_cooldown](../../backend/app/services/early_warning_engine.py#L307)
  - Signature: `EarlyWarningEngine._is_alert_in_cooldown(self, project_id: str, alert_type: AlertType, severity: SeverityLevel)` → `bool`
  - Purpose: Enforces cooldown window to eliminate alert fatigue.
  - Calls include: `datetime.utcnow`, `reversed`, `pd_timestamp`, `(now - past_dt).total_seconds`.
- [pd_timestamp](../../backend/app/services/early_warning_engine.py#L327)
  - Signature: `pd_timestamp(ts: Any)` → `datetime`
  - Purpose: Helper to parse datetime strings or objects.
  - Calls include: `isinstance`, `str(ts).replace`, `datetime.fromisoformat`, `str`, `datetime.utcnow`.

### `backend/app/services/earth_observation.py`

- [load_scene](../../backend/app/services/earth_observation.py#L10)
  - Signature: `load_scene(collection, scene_id, bbox)`
  - Purpose: Retrieve an approved optical STAC item and signed raster assets; reproject/calibrate bands and mask quality.
  - Calls include: `httpx.get`, `r.raise_for_status`, `r.json`, `np.ones`, `mapping.items`, `arrays['quality'].astype`, `item.get`, `ValueError`.
- [compare_pixels](../../backend/app/services/earth_observation.py#L54)
  - Signature: `compare_pixels(before, after, claimed)`
  - Purpose: Measure common-valid optical NDVI/NDBI, create preview images and classify evidence quality/review status.
  - Calls include: `int`, `float`, `valid.sum`, `ValueError`, `ndvis.append`, `ndbis.append`, `np.stack`, `(np.clip(rgb / 0.3, 0, 1) * 255).astype`.
- [load_radar_scene](../../backend/app/services/earth_observation.py#L80)
  - Signature: `load_radar_scene(scene_id, polarization, bbox)`
  - Purpose: Use provider-processed RTC gamma-naught power; never treat raw GRD as RTC.
  - Calls include: `os.getenv`, `httpx.get`, `r.raise_for_status`, `r.json`, `urlparse`, `signed.raise_for_status`, `np.asarray`, `any`.
- [compare_radar](../../backend/app/services/earth_observation.py#L107)
  - Signature: `compare_radar(before, after, polygon_mask, claimed)`
  - Purpose: Validate acquisition comparability, calculate common-area mean power/dB change and create previews.
  - Calls include: `int`, `ValueError`, `valid.sum`, `polygon_mask.sum`, `float`, `np.zeros`, `io.BytesIO`, `Image.fromarray(gray).save`.

### `backend/app/services/intelligence.py`

- [stress](../../backend/app/services/intelligence.py#L12)
  - Signature: `stress(budget, sector, shocks, remaining, rain_days, productivity_loss)`
  - Purpose: Apply illustrative sector BOM shares and rain productivity assumptions.
  - Calls include: `next`, `round`, `weights.items`, `sum`, `shocks.get`, `components.values`, `(sector or '').lower`.
- [conformal](../../backend/app/services/intelligence.py#L20)
  - Signature: `conformal(prediction, pairs, coverage=0.9)`
  - Purpose: Calculate finite-sample absolute-residual interval at requested nominal coverage.
  - Calls include: `sorted`, `math.ceil`, `len`, `ValueError`, `max`, `abs`.
- [kaplan_meier](../../backend/app/services/intelligence.py#L31)
  - Signature: `kaplan_meier(observations)`
  - Purpose: Build cohort survival/completion curve, grouping tied events and censoring.
  - Calls include: `len`, `Counter`, `sorted`, `curve.append`, `set`.
- [point_in_polygon](../../backend/app/services/intelligence.py#L43)
  - Signature: `point_in_polygon(lon, lat, ring)`
  - Purpose: Ray-casting inclusion check with boundary points accepted.
  - Calls include: `zip`, `abs`, `min`, `max`.
- [satellite_change](../../backend/app/services/intelligence.py#L54)
  - Signature: `satellite_change(before, after, claimed)`
  - Purpose: Compute imported optical indices, optional SAR delta and quality-dependent review status.
  - Calls include: `index`, `max`, `before.get`, `after.get`.
- [satellite_change.index](../../backend/app/services/intelligence.py#L55)
  - Signature: `satellite_change.index(a, b)`
  - Purpose: Compute a normalized difference when the band sum is positive, otherwise return unavailable.
- [escalation_tier](../../backend/app/services/intelligence.py#L66)
  - Signature: `escalation_tier(project, predictions)`
  - Purpose: Evaluate exposure/delay criticality and three comparable months of deterioration.
  - Calls include: `sorted`, `months.setdefault`, `max`, `len`.

### `backend/app/services/intervention_engine.py`

- [InterventionEngine.__init__](../../backend/app/services/intervention_engine.py#L62)
  - Signature: `InterventionEngine.__init__(self)`
  - Purpose: Initialize InterventionEngine state/dependencies; see constructor assignments and calls for defaults.
- [InterventionEngine.calculate_priority_score](../../backend/app/services/intervention_engine.py#L66)
  - Signature: `InterventionEngine.calculate_priority_score(self, risk_score: float, trajectory_status: str, budget_cr: float, cost_overrun_pct: float, schedule_delay_days: float, strategic_importance_weight: float=1.0)` → `Tuple[float, InterventionPriority]`
  - Purpose: Calculates multi-factor priority score (0 - 100): Score = (0.35 * Risk + 0.25 * Trajectory + 0.20 * FinancialExp + 0.20 * ScheduleSlip) * 100 * Impact
  - Calls include: `min`, `trajectory_status.upper`, `max`, `round`.
- [InterventionEngine.generate_interventions_for_project](../../backend/app/services/intervention_engine.py#L114)
  - Signature: `InterventionEngine.generate_interventions_for_project(self, project_id: str, prediction_output: Dict[str, Any], trajectory_metrics: Dict[str, Any], budget_cr: float=500.0, strategic_importance: float=1.1)` → `List[InterventionRecommendation]`
  - Purpose: Maps project risk signals and feature drivers to grounded review actions.
  - Calls include: `float`, `str`, `self.calculate_priority_score`, `recommendations.sort`, `prediction_output.get`, `trajectory_metrics.get`, `datetime.utcnow().isoformat`, `prediction_output.get('feature_values', {}).get`.
- [InterventionEngine.update_human_approval_status](../../backend/app/services/intervention_engine.py#L209)
  - Signature: `InterventionEngine.update_human_approval_status(self, recommendation_id: str, new_status: ApprovalStatus, reviewer_notes: str, reviewer_name: str)` → `InterventionRecommendation`
  - Purpose: Updates the human approval status of a recommendation.
  - Calls include: `self.recommendations_store.get`, `logger.info`, `KeyError`, `datetime.utcnow().isoformat`, `datetime.utcnow`.

### `backend/app/services/portfolio_query.py`

- [plan_filters](../../backend/app/services/portfolio_query.py#L21)
  - Signature: `plan_filters(query, db)`
  - Purpose: Build validated allowlisted portfolio filters locally or through Ollama JSON planning.
  - Calls include: `query.lower`, `choices.items`, `re.search`, `QueryFilters`, `os.getenv`, `sorted`, `float`, `httpx.post`.
- [apply_filters](../../backend/app/services/portfolio_query.py#L52)
  - Signature: `apply_filters(query, plan)`
  - Purpose: Apply SQLAlchemy filters, including latest prediction delay via a correlated subquery.
  - Calls include: `query.filter`, `field.in_`, `RiskPrediction.prediction_timestamp.desc`, `RiskPrediction.id.desc`, `select(RiskPrediction.predicted_delay_days).where`, `select`.

### `backend/app/services/project_service.py`

- [ProjectService.seed_initial_data_if_empty](../../backend/app/services/project_service.py#L17)
  - Signature: `ProjectService.seed_initial_data_if_empty(db: Session)`
  - Purpose: Seed initial database records if project table is empty.
  - Calls include: `db.query(Project).count`, `Path`, `pd.read_parquet`, `load_projects_from_dataframe`, `processed_path.exists`, `logger.warning`, `db.query`, `Path(__file__).resolve`.
- [ProjectService.get_projects](../../backend/app/services/project_service.py#L52)
  - Signature: `ProjectService.get_projects(db: Session, limit: int=50, offset: int=0, status: Optional[str]=None, sector: Optional[str]=None, ministry: Optional[str]=None, search: Optional[str]=None, sort_by: str='id', order: str='asc')` → `Tuple[List[Project], int]`
  - Purpose: Fetch paginated, filtered, and sorted project records from DB with total count.
  - Calls include: `ProjectService.seed_initial_data_if_empty`, `db.query`, `query.count`, `getattr`, `query.offset(offset).limit(limit).all`, `query.filter`, `order.lower`, `query.order_by`.
- [ProjectService.get_project_by_id](../../backend/app/services/project_service.py#L93)
  - Signature: `ProjectService.get_project_by_id(db: Session, project_id: Any)` → `Optional[Project]`
  - Purpose: Fetch project details by ID or external_project_id, resolving across DB and monthly archives.
  - Calls include: `ProjectService.seed_initial_data_if_empty`, `str(project_id).strip`, `db.query(Project).filter(Project.external_project_id == str_id).first`, `int`, `db.query(Project).filter(Project.id == int_id).first`, `_find_project_across_months`, `str`, `db.query(Project).filter`.
- [ProjectService.create_project](../../backend/app/services/project_service.py#L174)
  - Signature: `ProjectService.create_project(db: Session, project_in: ProjectCreate)` → `Project`
  - Purpose: Create new project entry.
  - Calls include: `Project`, `db.add`, `db.commit`, `db.refresh`, `hasattr`.

### `backend/app/services/risk_scoring.py`

- [compute_project_risk_and_predictions](../../backend/app/services/risk_scoring.py#L40)
  - Signature: `compute_project_risk_and_predictions(original_cost: float, revised_cost: float, cumulative_expenditure: float, sector: Optional[str]=None)` → `Dict[str, Any]`
  - Purpose: Computes comprehensive multi-dimensional risk scores and predictions for a project.
  - Calls include: `float`, `max`, `min`, `SECTOR_BASELINE_DAYS.get`, `round`, `int`, `math.log10`.

### `backend/app/services/scenario_engine.py`

- [ScenarioEngine.simulate](../../backend/app/services/scenario_engine.py#L77)
  - Signature: `ScenarioEngine.simulate(self, project_id: str, scenario_type: ScenarioType, custom_params: Optional[Dict[str, Any]]=None, baseline_state: Optional[Dict[str, Any]]=None, user_id: str='system_user')` → `ScenarioSimulationResult`
  - Purpose: Executes scenario recalculation flow: 1. Parse baseline project state. 2. Recalculate features based on scenario modification. 3. Compute baseline vs. scenario risk metrics. 4. Calculate deltas (scenario - baseline).
  - Calls include: `self._calculate_risk_from_features`, `self._apply_scenario_modifications`, `round`, `AuditTrailPayload`, `DeltaMetricsPayload`, `ScenarioSimulationResult`, `datetime.utcnow().isoformat`, `int`.
- [ScenarioEngine._apply_scenario_modifications](../../backend/app/services/scenario_engine.py#L148)
  - Signature: `ScenarioEngine._apply_scenario_modifications(self, base: Dict[str, Any], scen_type: ScenarioType, custom: Optional[Dict[str, Any]])` → `Tuple[Dict[str, Any], Dict[str, Any]]`
  - Purpose: Applies feature transformations for each scenario type.
  - Calls include: `base.copy`, `min`, `mod.get`, `max`, `assumptions.update`.
- [ScenarioEngine._calculate_risk_from_features](../../backend/app/services/scenario_engine.py#L209)
  - Signature: `ScenarioEngine._calculate_risk_from_features(self, state: Dict[str, Any])` → `RiskMetricsPayload`
  - Purpose: Internal risk evaluation mapping features to risk metrics.
  - Calls include: `float`, `min`, `round`, `RiskMetricsPayload`, `state.get`, `max`.

### `backend/app/utils/errors.py`

- [EntityNotFoundError.__init__](../../backend/app/utils/errors.py#L9)
  - Signature: `EntityNotFoundError.__init__(self, entity_name: str, entity_id: int \| str)`
  - Purpose: Initialize EntityNotFoundError state/dependencies; see constructor assignments and calls for defaults.
  - Calls include: `super().__init__`, `super`.
- [ServiceUnavailableError.__init__](../../backend/app/utils/errors.py#L19)
  - Signature: `ServiceUnavailableError.__init__(self, service_name: str)`
  - Purpose: Initialize ServiceUnavailableError state/dependencies; see constructor assignments and calls for defaults.
  - Calls include: `super().__init__`, `super`.

### `backend/app/utils/logging.py`

- [setup_logging](../../backend/app/utils/logging.py#L7)
  - Signature: `setup_logging(log_level: str='INFO')` → `logging.Logger`
  - Purpose: Configure structured console logging.
  - Calls include: `logging.getLogger`, `getattr`, `logger.setLevel`, `log_level.upper`, `logging.StreamHandler`, `logging.Formatter`, `handler.setFormatter`, `logger.addHandler`.

### `ml/evaluation/metrics.py`

- [evaluate_regression_performance](../../ml/evaluation/metrics.py#L11) — **STUB**
  - Signature: `evaluate_regression_performance(y_true: np.ndarray, y_pred: np.ndarray)` → `Dict[str, float]`
  - Purpose: Calculate RMSE, MAE, R2, and MAPE performance metrics for models.
  - Calls include: `NotImplementedError`.

### `ml/explainability/shap_explainer.py`

- [SHAPExplainer.__init__](../../ml/explainability/shap_explainer.py#L95)
  - Signature: `SHAPExplainer.__init__(self, model: Optional[Any]=None, model_path: Optional[Path]=None)`
  - Purpose: Initialize SHAPExplainer state/dependencies; see constructor assignments and calls for defaults.
  - Calls include: `model_path.exists`, `joblib.load`, `Path`, `default_path.exists`, `shap.TreeExplainer`, `logger.warning`.
- [SHAPExplainer.compute_global_importance](../../ml/explainability/shap_explainer.py#L116)
  - Signature: `SHAPExplainer.compute_global_importance(self, df_features: pd.DataFrame)` → `Dict[str, float]`
  - Purpose: Calculates global feature importance (mean absolute SHAP value across dataset).
  - Calls include: `df_features[self.FEATURE_COLUMNS].fillna`, `dict`, `self.explainer.shap_values`, `isinstance`, `np.mean`, `sorted`, `np.abs`, `zip`.
- [SHAPExplainer.explain_project_risk](../../ml/explainability/shap_explainer.py#L138)
  - Signature: `SHAPExplainer.explain_project_risk(self, project_id: str, input_feature_row: pd.Series, risk_score: float, top_n: int=5)` → `ProjectExplanationOutput`
  - Purpose: Decomposes a specific project risk score into positive risk drivers and protective factors.
  - Calls include: `enumerate`, `drivers.sort`, `protective_factors.sort`, `ProjectExplanationOutput`, `input_feature_row[self.FEATURE_COLUMNS].fillna(0.0).to_frame`, `self._heuristic_shap_vector`, `float`, `FRIENDLY_DESCRIPTIONS.get`.
- [SHAPExplainer._heuristic_shap_vector](../../ml/explainability/shap_explainer.py#L221)
  - Signature: `SHAPExplainer._heuristic_shap_vector(self, row: pd.Series)` → `np.ndarray`
  - Purpose: Heuristic fallback vector for SHAP attribution calculation.
  - Calls include: `np.array`, `float`, `row.get`, `vec.append`.

### `ml/features/builder.py`

- [FeatureBuilder.build_lag_features](../../ml/features/builder.py#L13) — **STUB**
  - Signature: `FeatureBuilder.build_lag_features(self, df: pd.DataFrame, lag_periods: list[int])` → `pd.DataFrame`
  - Purpose: Construct rolling delay and expenditure velocity features across periods.
  - Calls include: `NotImplementedError`.
- [FeatureBuilder.compute_earned_value_metrics](../../ml/features/builder.py#L17) — **STUB**
  - Signature: `FeatureBuilder.compute_earned_value_metrics(self, df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Compute Cost Performance Index (CPI) and Schedule Performance Index (SPI).
  - Calls include: `NotImplementedError`.

### `ml/features/feature_engineering.py`

- [compute_linear_trend_slope](../../ml/features/feature_engineering.py#L31)
  - Signature: `compute_linear_trend_slope(series: pd.Series)` → `float`
  - Purpose: Helper utility to calculate the linear trend slope over a historical window.
  - Calls include: `series.dropna`, `np.arange`, `len`, `np.polyfit`, `float`.
- [compute_project_features](../../ml/features/feature_engineering.py#L53)
  - Signature: `compute_project_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates static and baseline project-level features.
  - Calls include: `df.copy`, `df['original_cost'].astype`, `pd.to_datetime`, `(planned_end_dt - start_dt).dt.days.fillna(0).astype`, `(planned_end_dt - start_dt).dt.days.fillna`.
- [compute_sector_features](../../ml/features/feature_engineering.py#L74)
  - Signature: `compute_sector_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates sector-level domain benchmarking features.
  - Calls include: `df.copy`, `df['sector'].map(sector_cost_benchmarks).fillna`, `df['sector'].map`.
- [compute_ministry_features](../../ml/features/feature_engineering.py#L105)
  - Signature: `compute_ministry_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates ministry administrative workload and capacity features.
  - Calls include: `df.copy`, `ministry_counts.fillna(1).astype`, `ministry_counts.fillna`, `df['ministry_name'].map`, `df.groupby`, `str`.
- [compute_cost_features](../../ml/features/feature_engineering.py#L130)
  - Signature: `compute_cost_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates cost growth, expenditure velocity, and burn-rate acceleration features.
  - Calls include: `df.copy`, `df['original_cost'].astype(float).replace`, `df['revised_cost'].astype`, `df['cumulative_expenditure'].astype`, `((rev_cost - orig_cost) / orig_cost * 100.0).fillna`, `(exp / orig_cost * 100.0).fillna`, `df.groupby`, `group['cumulative_expenditure'].fillna(0.0).diff().fillna`.
- [compute_schedule_features](../../ml/features/feature_engineering.py#L166)
  - Signature: `compute_schedule_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates schedule tightness, slippage, and time remaining features.
  - Calls include: `df.copy`, `pd.to_datetime`, `(revised_end_dt - planned_end_dt).dt.days.fillna(0.0).astype`, `(planned_end_dt - obs_dt).dt.days.fillna(0.0).astype`, `(planned_end_dt - start_dt).dt.days.replace`, `(elapsed_dur / planned_dur * 100.0).fillna(0.0).astype`, `(revised_end_dt - planned_end_dt).dt.days.fillna`, `(planned_end_dt - obs_dt).dt.days.fillna`.
- [compute_progress_features](../../ml/features/feature_engineering.py#L199)
  - Signature: `compute_progress_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates physical progress velocity, gap analysis, and 3M/6M trend features.
  - Calls include: `df.copy`, `df['physical_progress_pct'].fillna(0.0).astype`, `df.groupby`, `group['physical_progress_pct'].fillna`, `g_prog.diff().fillna`, `velocity_list.extend`, `range`, `df['physical_progress_pct'].fillna`.
- [compute_milestone_features](../../ml/features/feature_engineering.py#L247)
  - Signature: `compute_milestone_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates milestone execution density and slippage rate features.
  - Calls include: `df.copy`, `np.clip`.
- [compute_temporal_features](../../ml/features/feature_engineering.py#L267)
  - Signature: `compute_temporal_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates project age and snapshot temporal features.
  - Calls include: `df.copy`, `pd.to_datetime`, `((obs_dt - start_dt).dt.days / 30.44).fillna(0.0).astype`, `((obs_dt - start_dt).dt.days / 30.44).fillna`.
- [compute_historical_features](../../ml/features/feature_engineering.py#L286)
  - Signature: `compute_historical_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Calculates historical contractor and vendor performance metrics.
  - Calls include: `df.copy`.
- [extract_all_features](../../ml/features/feature_engineering.py#L302)
  - Signature: `extract_all_features(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Orchestrates the sequential extraction of all 9 feature groups.
  - Calls include: `logger.info`, `compute_project_features`, `compute_sector_features`, `compute_ministry_features`, `compute_cost_features`, `compute_schedule_features`, `compute_progress_features`, `compute_milestone_features`.

### `ml/features/leakage_detector.py`

- [check_temporal_ordering](../../ml/features/leakage_detector.py#L21)
  - Signature: `check_temporal_ordering(df: pd.DataFrame, time_col: str='observation_date')` → `Dict[str, Any]`
  - Purpose: Validates temporal ordering constraints: Features must be recorded at or before T_obs.
  - Calls include: `logger.info`, `pd.to_datetime`, `len`, `violations.append`.
- [check_statistical_target_leakage](../../ml/features/leakage_detector.py#L50)
  - Signature: `check_statistical_target_leakage(df: pd.DataFrame, target_col: str='target_continuous_cost_overrun_pct', correlation_threshold: float=0.98)` → `Dict[str, Any]`
  - Purpose: Executes statistical leakage detection by evaluating pairwise correlation between candidate features and the specified target variable.
  - Calls include: `logger.info`, `df.select_dtypes(include=[np.number]).dropna`, `numeric_df.corrwith(numeric_df[target_col]).abs`, `correlations.drop`, `correlations[correlations >= correlation_threshold].to_dict`, `logger.warning`, `df.select_dtypes`, `numeric_df.corrwith`.
- [run_full_leakage_audit](../../ml/features/leakage_detector.py#L92)
  - Signature: `run_full_leakage_audit(df: pd.DataFrame)` → `Dict[str, Any]`
  - Purpose: Executes comprehensive temporal and statistical leakage audit suite across all target variables.
  - Calls include: `logger.info`, `check_temporal_ordering`, `check_statistical_target_leakage`.

### `ml/features/target_generation.py`

- [generate_binary_cost_overrun](../../ml/features/target_generation.py#L25)
  - Signature: `generate_binary_cost_overrun(df: pd.DataFrame, baseline: str='approved', threshold: float=0.05)` → `pd.Series`
  - Purpose: Generates binary cost overrun classification target.
  - Calls include: `df[baseline_col].astype(float).replace`, `df['revised_cost'].astype`, `(overrun_ratio > threshold).astype`, `df[baseline_col].astype`.
- [generate_continuous_cost_overrun_percentage](../../ml/features/target_generation.py#L53)
  - Signature: `generate_continuous_cost_overrun_percentage(df: pd.DataFrame, baseline: str='approved')` → `pd.Series`
  - Purpose: Generates continuous cost overrun percentage regression target.
  - Calls include: `df[baseline_col].astype(float).replace`, `df['revised_cost'].astype`, `((curr_cost - base_cost) / base_cost * 100.0).fillna`, `df[baseline_col].astype`.
- [generate_binary_time_overrun](../../ml/features/target_generation.py#L78)
  - Signature: `generate_binary_time_overrun(df: pd.DataFrame, baseline: str='original', threshold_days: int=90)` → `pd.Series`
  - Purpose: Generates binary time overrun classification target.
  - Calls include: `pd.to_datetime`, `(revised_end - base_end).dt.days.fillna`, `(delay_days > threshold_days).astype`.
- [generate_continuous_delay_duration](../../ml/features/target_generation.py#L106)
  - Signature: `generate_continuous_delay_duration(df: pd.DataFrame, baseline: str='original')` → `pd.Series`
  - Purpose: Generates continuous schedule delay duration regression target in days.
  - Calls include: `pd.to_datetime`, `(revised_end - base_end).dt.days.fillna(0).clip`, `delay_days.astype`, `(revised_end - base_end).dt.days.fillna`.
- [generate_implementation_risk](../../ml/features/target_generation.py#L131)
  - Signature: `generate_implementation_risk(df: pd.DataFrame, weight_fin: float=0.4, weight_sched: float=0.35, weight_exec: float=0.25)` → `pd.DataFrame`
  - Purpose: Generates the Hybrid Weighted Composite Implementation Risk Framework targets.
  - Calls include: `pd.DataFrame`, `df.get`, `np.clip`, `generate_continuous_cost_overrun_percentage`, `generate_continuous_delay_duration`, `categories.append`, `np.maximum`.
- [validate_temporal_target_boundary](../../ml/features/target_generation.py#L201)
  - Signature: `validate_temporal_target_boundary(df: pd.DataFrame, feature_date_col: str='observation_date')`
  - Purpose: Automated assertion verifying that feature observation dates precede target evaluation timestamps.
  - Calls include: `logger.info`, `pd.to_datetime`, `len`.
- [generate_all_targets](../../ml/features/target_generation.py#L218)
  - Signature: `generate_all_targets(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Generates all canonical ML target variables and appends them to the DataFrame.
  - Calls include: `logger.info`, `df.copy`, `validate_temporal_target_boundary`, `generate_binary_cost_overrun`, `generate_continuous_cost_overrun_percentage`, `generate_binary_time_overrun`, `generate_continuous_delay_duration`, `generate_implementation_risk`.

### `ml/ingestion/loader.py`

- [DataLoader.__init__](../../ml/ingestion/loader.py#L14)
  - Signature: `DataLoader.__init__(self, raw_data_path: str='data/raw/')`
  - Purpose: Initialize data loader with raw data directory path.
- [DataLoader.load_raw_project_updates](../../ml/ingestion/loader.py#L18) — **STUB**
  - Signature: `DataLoader.load_raw_project_updates(self, filename: str)` → `pd.DataFrame`
  - Purpose: Load raw project update records from raw data directory.
  - Calls include: `NotImplementedError`.
- [DataLoader.load_from_db](../../ml/ingestion/loader.py#L26) — **STUB**
  - Signature: `DataLoader.load_from_db(self, connection_string: str)` → `Dict[str, pd.DataFrame]`
  - Purpose: Fetch raw snapshot tables directly from PostgreSQL db.
  - Calls include: `NotImplementedError`.

### `ml/models/baseline/regressor.py`

- [BaselineModel.__init__](../../ml/models/baseline/regressor.py#L9)
  - Signature: `BaselineModel.__init__(self, version: str='baseline_v0.1')`
  - Purpose: Initialize BaselineModel state/dependencies; see constructor assignments and calls for defaults.
- [BaselineModel.train](../../ml/models/baseline/regressor.py#L13) — **STUB**
  - Signature: `BaselineModel.train(self, X: np.ndarray, y: np.ndarray)` → `None`
  - Purpose: Train baseline regression model.
  - Calls include: `NotImplementedError`.
- [BaselineModel.predict](../../ml/models/baseline/regressor.py#L17) — **STUB**
  - Signature: `BaselineModel.predict(self, X: np.ndarray)` → `np.ndarray`
  - Purpose: Generate baseline predictions.
  - Calls include: `NotImplementedError`.

### `ml/models/calibrator.py`

- [ProbabilityCalibrator.__init__](../../ml/models/calibrator.py#L16)
  - Signature: `ProbabilityCalibrator.__init__(self, method: str='sigmoid')`
  - Purpose: Initialize ProbabilityCalibrator state/dependencies; see constructor assignments and calls for defaults.
- [ProbabilityCalibrator.fit_and_evaluate](../../ml/models/calibrator.py#L22)
  - Signature: `ProbabilityCalibrator.fit_and_evaluate(self, base_estimator: Any, X_val: np.ndarray, y_val: np.ndarray, improvement_threshold: float=0.001)` → `Tuple[Any, Dict[str, Any]]`
  - Purpose: Evaluates uncalibrated vs. calibrated probabilities on validation data.
  - Calls include: `hasattr`, `float`, `CalibratedClassifierCV`, `calibrator_platt.fit`, `calibrator_iso.fit`, `min`, `base_estimator.predict`, `brier_score_loss`.

### `ml/models/cost/predictor.py`

- [CostPredictor.__init__](../../ml/models/cost/predictor.py#L10)
  - Signature: `CostPredictor.__init__(self, model_version: str='cost_xgb_v1.0')`
  - Purpose: Initialize CostPredictor state/dependencies; see constructor assignments and calls for defaults.
- [CostPredictor.fit](../../ml/models/cost/predictor.py#L13) — **STUB**
  - Signature: `CostPredictor.fit(self, X: np.ndarray, y: np.ndarray)` → `Dict[str, Any]`
  - Purpose: Fit gradient boosted cost overrun regressor.
  - Calls include: `NotImplementedError`.
- [CostPredictor.predict](../../ml/models/cost/predictor.py#L17) — **STUB**
  - Signature: `CostPredictor.predict(self, X: np.ndarray)` → `np.ndarray`
  - Purpose: Predict cost variance percentages for feature vectors.
  - Calls include: `NotImplementedError`.

### `ml/models/delay/predictor.py`

- [DelayPredictor.__init__](../../ml/models/delay/predictor.py#L10)
  - Signature: `DelayPredictor.__init__(self, model_version: str='delay_xgb_v1.0')`
  - Purpose: Initialize DelayPredictor state/dependencies; see constructor assignments and calls for defaults.
- [DelayPredictor.fit](../../ml/models/delay/predictor.py#L13) — **STUB**
  - Signature: `DelayPredictor.fit(self, X: np.ndarray, y: np.ndarray)` → `Dict[str, Any]`
  - Purpose: Fit schedule delay regression model.
  - Calls include: `NotImplementedError`.
- [DelayPredictor.predict](../../ml/models/delay/predictor.py#L17) — **STUB**
  - Signature: `DelayPredictor.predict(self, X: np.ndarray)` → `np.ndarray`
  - Purpose: Predict delay days for feature matrix.
  - Calls include: `NotImplementedError`.

### `ml/models/predictor.py`

- [ProductionPredictor.__init__](../../ml/models/predictor.py#L80)
  - Signature: `ProductionPredictor.__init__(self, models_dir: Path=Path('models'), missing_threshold_pct: float=20.0)`
  - Purpose: Initialize ProductionPredictor state/dependencies; see constructor assignments and calls for defaults.
  - Calls include: `Path`, `ModelRegistry`, `self._load_production_models`.
- [ProductionPredictor._load_production_models](../../ml/models/predictor.py#L91)
  - Signature: `ProductionPredictor._load_production_models(self)`
  - Purpose: Loads serialized champion production models.
  - Calls include: `(self.models_dir / 'xgboost_cost_regressor.joblib').exists`, `(self.models_dir / 'random_forest_cost_classifier.joblib').exists`, `(self.models_dir / 'xgboost_delay_regressor.joblib').exists`, `(self.models_dir / 'catboost_risk_regressor.joblib').exists`, `logger.info`, `joblib.load`, `(self.models_dir / 'random_forest_cost_regressor.joblib').exists`, `logger.warning`.
- [ProductionPredictor.validate_feature_missingness](../../ml/models/predictor.py#L115)
  - Signature: `ProductionPredictor.validate_feature_missingness(self, feature_dict: Dict[str, Any])` → `float`
  - Purpose: Calculates percentage of missing required features. Raises ValueError if missingness exceeds threshold.
  - Calls include: `sum`, `ValueError`, `len`, `pd.isna`, `feature_dict.get`.
- [ProductionPredictor.predict_project](../../ml/models/predictor.py#L133)
  - Signature: `ProductionPredictor.predict_project(self, input_data: PredictionInput)` → `PredictionOutput`
  - Purpose: Generates schema-compliant prediction payload for a project input.
  - Calls include: `input_data.model_dump`, `self.validate_feature_missingness`, `float`, `PredictionOutput`, `self.models.keys`, `RuntimeError`, `hasattr`, `np.clip`.

### `ml/models/registry.py`

- [ModelRegistry.__init__](../../ml/models/registry.py#L15)
  - Signature: `ModelRegistry.__init__(self, registry_path: Path=Path('models/model_registry.json'))`
  - Purpose: Initialize ModelRegistry state/dependencies; see constructor assignments and calls for defaults.
  - Calls include: `Path`, `self.registry_path.parent.mkdir`, `self._load_registry`.
- [ModelRegistry._load_registry](../../ml/models/registry.py#L20)
  - Signature: `ModelRegistry._load_registry(self)` → `Dict[str, Any]`
  - Purpose: Loads existing model registry JSON file if present.
  - Calls include: `self.registry_path.exists`, `open`, `json.load`, `logger.warning`.
- [ModelRegistry.register_model](../../ml/models/registry.py#L30)
  - Signature: `ModelRegistry.register_model(self, model_name: str, version: str, model_type: str, target_name: str, feature_columns: List[str], training_period: str, validation_period: str, performance_metrics: Dict[str, float], artifact_path: str, calibration_status: str='UNAVAILABLE', missing_feature_threshold_pct: float=20.0)` → `Dict[str, Any]`
  - Purpose: Registers a trained model entry into the registry.
  - Calls include: `self._save_registry`, `logger.info`, `len`, `str`, `datetime.utcnow().isoformat`, `datetime.utcnow`.
- [ModelRegistry.get_model_entry](../../ml/models/registry.py#L68)
  - Signature: `ModelRegistry.get_model_entry(self, model_name: str, version: Optional[str]=None)` → `Optional[Dict[str, Any]]`
  - Purpose: Retrieves registered metadata for a given model.
  - Calls include: `self.records['models'].get`, `matching.sort`, `self.records['models'].items`.
- [ModelRegistry._save_registry](../../ml/models/registry.py#L84)
  - Signature: `ModelRegistry._save_registry(self)`
  - Purpose: Saves current state to JSON registry file.
  - Calls include: `open`, `json.dump`.

### `ml/models/risk/calculator.py`

- [RiskCalculator.__init__](../../ml/models/risk/calculator.py#L9)
  - Signature: `RiskCalculator.__init__(self, model_version: str='risk_calc_v1.0')`
  - Purpose: Initialize RiskCalculator state/dependencies; see constructor assignments and calls for defaults.
- [RiskCalculator.compute_composite_risk](../../ml/models/risk/calculator.py#L12) — **STUB**
  - Signature: `RiskCalculator.compute_composite_risk(self, cost_risk: float, delay_risk: float, external_factors: Dict[str, float])` → `float`
  - Purpose: Combine individual sub-scores into normalized composite risk index [0.0 - 1.0].
  - Calls include: `NotImplementedError`.

### `ml/models/trainer.py`

- [train_and_compare_all_models](../../ml/models/trainer.py#L80)
  - Signature: `train_and_compare_all_models()`
  - Purpose: Main execution function for production ML model training and comparison.
  - Calls include: `logger.info`, `run_etl_pipeline`, `extract_all_features`, `generate_all_targets`, `pd.to_datetime`, `full_df[obs_dt <= pd.Timestamp('2025-10-01')].copy`, `full_df[obs_dt == pd.Timestamp('2025-11-01')].copy`, `full_df[obs_dt >= pd.Timestamp('2025-12-01')].copy`.
- [generate_model_selection_markdown](../../ml/models/trainer.py#L299)
  - Signature: `generate_model_selection_markdown(results: Dict[str, Any], output_path: Path)`
  - Purpose: Generates the comprehensive docs/model-selection.md report.
  - Calls include: `output_path.parent.mkdir`, `logger.info`, `open`, `f.write`.

### `ml/pipeline/orchestrator.py`

- [PipelineOrchestrator.run_training_pipeline](../../ml/pipeline/orchestrator.py#L13) — **STUB**
  - Signature: `PipelineOrchestrator.run_training_pipeline(self, raw_data_path: str)` → `Dict[str, Any]`
  - Purpose: Execute full training workflow from raw CSV to deployed model artifacts.
  - Calls include: `NotImplementedError`.
- [PipelineOrchestrator.run_inference_pipeline](../../ml/pipeline/orchestrator.py#L17) — **STUB**
  - Signature: `PipelineOrchestrator.run_inference_pipeline(self, project_id: int)` → `Dict[str, Any]`
  - Purpose: Run monthly batch risk evaluation for specified project.
  - Calls include: `NotImplementedError`.

### `ml/preprocessing/cleaner.py`

- [DataCleaner.__init__](../../ml/preprocessing/cleaner.py#L13)
  - Signature: `DataCleaner.__init__(self, output_path: str='data/processed/')`
  - Purpose: Initialize DataCleaner state/dependencies; see constructor assignments and calls for defaults.
- [DataCleaner.clean_monthly_updates](../../ml/preprocessing/cleaner.py#L16) — **STUB**
  - Signature: `DataCleaner.clean_monthly_updates(self, df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Sanitize numerical fields, check range bounds, and handle missing values.
  - Calls include: `NotImplementedError`.
- [DataCleaner.validate_schema](../../ml/preprocessing/cleaner.py#L20) — **STUB**
  - Signature: `DataCleaner.validate_schema(self, df: pd.DataFrame, expected_columns: list[str])` → `bool`
  - Purpose: Ensure incoming project update data matches required columnar schema.
  - Calls include: `NotImplementedError`.

### `scripts/dispatch_escalations.py`

- [main](../../scripts/dispatch_escalations.py#L17)
  - Signature: `main()`
  - Purpose: Parse dry-run/send options, enumerate eligible actions and optionally execute configured dispatch.
  - Calls include: `argparse.ArgumentParser`, `parser.add_argument`, `parser.parse_args`, `SessionLocal`, `db.query(Intervention).filter`, `generate`, `Intervention.status.in_`, `dispatch`.

### `scripts/load_real_dataset.py`

- [main](../../scripts/load_real_dataset.py#L21)
  - Signature: `main()`
  - Purpose: Run ETL and database loading using the legacy import path; prefer the explicit loader command in README.
  - Calls include: `Base.metadata.create_all`, `run_etl_pipeline`, `SessionLocal`, `load_projects_from_dataframe`, `logger.info`, `db.close`, `Path`.

### `scripts/train_baselines.py`

- [calculate_mape](../../scripts/train_baselines.py#L74)
  - Signature: `calculate_mape(y_true: np.ndarray, y_pred: np.ndarray)` → `float`
  - Purpose: Calculates Mean Absolute Percentage Error (MAPE).
  - Calls include: `float`, `np.any`, `np.mean`, `np.abs`.
- [run_temporal_split](../../scripts/train_baselines.py#L82)
  - Signature: `run_temporal_split(df: pd.DataFrame)` → `Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, str]]`
  - Purpose: Applies strict temporal partitioning: - Train: observation_date <= 2025-10-01 - Val: observation_date == 2025-11-01 - Test: observation_date == 2025-12-01
  - Calls include: `pd.to_datetime`, `df[obs_dt <= pd.Timestamp('2025-10-01')].copy`, `df[obs_dt == pd.Timestamp('2025-11-01')].copy`, `df[obs_dt >= pd.Timestamp('2025-12-01')].copy`, `logger.info`, `sorted`, `len`, `obs_dt.unique`.
- [train_and_evaluate_baselines](../../scripts/train_baselines.py#L122)
  - Signature: `train_and_evaluate_baselines()`
  - Purpose: Main execution workflow for baseline training and evaluation.
  - Calls include: `logger.info`, `run_etl_pipeline`, `extract_all_features`, `generate_all_targets`, `run_temporal_split`, `StandardScaler`, `scaler.fit_transform`, `scaler.transform`.
- [generate_baseline_analysis_markdown](../../scripts/train_baselines.py#L345)
  - Signature: `generate_baseline_analysis_markdown(results: Dict[str, Any], output_path: Path)`
  - Purpose: Generates the comprehensive docs/baseline-analysis.md report.
  - Calls include: `output_path.parent.mkdir`, `logger.info`, `open`, `f.write`.

### `scripts/train_cost_overrun_model.py`

- [build_feature_matrix](../../scripts/train_cost_overrun_model.py#L43)
  - Signature: `build_feature_matrix(df: pd.DataFrame)` → `pd.DataFrame`
  - Purpose: Builds the model feature matrix, label-encoding categoricals.
  - Calls include: `df[FEATURE_COLUMNS].copy`, `LabelEncoder().fit_transform`, `X[col].astype`, `LabelEncoder`.
- [stratified_split](../../scripts/train_cost_overrun_model.py#L55)
  - Signature: `stratified_split(X: pd.DataFrame, y: pd.Series, test_size: float=0.2, random_state: int=RANDOM_SEED)` → `Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]`
  - Purpose: Random stratified split — no chronological split is possible on snapshot data.
  - Calls include: `train_test_split`.
- [main](../../scripts/train_cost_overrun_model.py#L62)
  - Signature: `main()`
  - Purpose: Prepare snapshot features/split, train logistic/ridge baselines and save artifacts plus evaluation report.
  - Calls include: `Path`, `pd.read_parquet`, `logger.info`, `generate_binary_cost_overrun`, `generate_continuous_cost_overrun_percentage`, `df.dropna`, `build_feature_matrix`, `stratified_split`.

## Key frontend function responsibilities

| Functions / component | Responsibility |
|---|---|
| `fetchJson`, `api.get*` | Legacy fetch/response adapters and portfolio data mapping; some failures become default/empty data and some risk sub-scores are derived |
| `intelligence`, `encodeFile` | Direct intelligence API requests with operator header/timeouts and bounded base64 file encoding |
| `IntelligencePage`, `IntelligenceWorkspace` | URL-keyed project/tab workspace, queries, results and provider/evidence controls |
| `EvidenceImport`, `JsonView`, `MarketComparison`, `CatalogSearch` | Structured evidence input, JSON result display, index comparison and catalog search |
| `recognize`, `speak` | Browser speech recognition and synthesis; separate from streaming Live audio |
| `LiveVoice` and its named audio helpers | Microphone/worklet/WebSocket lifecycle, playback, transcript and stop behavior |
| `ProjectRecords`, `records`, `save` | Connected milestone/progress entry and refetch; not the offline inspection queue |
| `openDB`, `transaction` | Open/version IndexedDB stores and resolve operations after transaction completion |
| `queueInspection`, `getQueue`, `getReceipts` | Add without overwriting duplicate identity; retrieve local pending evidence/receipts |
| `pauseInspection` | Wait for current synchronization and toggle queued upload pause state |
| `acknowledge` | Store server receipt and remove queued payload atomically; omit photo from local receipt |
| `syncQueue` | Single-flight iteration over unpaused items; validate receipts and retain failures with retry metadata |
| `restoreQueueBackup` | Validate backup before writing, skip existing identities and restore uploads paused |
| `OverrunAnalysisPanel` | POST explanation request; render generated severity, reason and prevention steps |
| `ExpandableChartCard`, tooltip/fullscreen helpers | Chart presentation, overlays and interactions |
| Page components and named filter/sort handlers | Manage visible data selection and navigation for their associated route |
| `LanguageSwitcher`, layout/header/sidebar | Change i18n language, navigate routes and render shared application chrome |

## Frontend named declarations

### `frontend/public/pcm-worklet.js`

- [PaimanaPCM.constructor](../../frontend/public/pcm-worklet.js#L2) — Initialize the microphone sample buffer.
- [PaimanaPCM.process](../../frontend/public/pcm-worklet.js#L3) — Aggregate incoming mono samples, downsample to 16 kHz, encode signed little-endian PCM and post transferable audio buffers to the browser thread.


Each entry links to the function body. Named event handlers and nested helpers are included when statically recognized; anonymous JSX/hook callbacks are intentionally omitted. Object API methods are listed with their property name.

### `frontend/src/App.tsx`

- [App](../../frontend/src/App.tsx#L17)

### `frontend/src/api/client.ts`

- [fetchJson](../../frontend/src/api/client.ts#L5)
- [getHealth](../../frontend/src/api/client.ts#L28)
- [getProjects](../../frontend/src/api/client.ts#L36)
- [getProjectById](../../frontend/src/api/client.ts#L76)
- [getAlerts](../../frontend/src/api/client.ts#L167)
- [getInterventions](../../frontend/src/api/client.ts#L169)
- [getStateSummaries](../../frontend/src/api/client.ts#L170)
- [getAnalyticsOverview](../../frontend/src/api/client.ts#L171)
- [getSectorAnalytics](../../frontend/src/api/client.ts#L172)
- [getMinistryAnalytics](../../frontend/src/api/client.ts#L173)
- [getGeographyAnalytics](../../frontend/src/api/client.ts#L174)
- [getBenchmarks](../../frontend/src/api/client.ts#L175)
- [getCostOverrunPredictions](../../frontend/src/api/client.ts#L180)
- [getTimeOverrunPredictions](../../frontend/src/api/client.ts#L201)
- [getMonthlyOverview](../../frontend/src/api/client.ts#L222)
- [getMonthlyAvailableMonths](../../frontend/src/api/client.ts#L223)
- [getMonthlySectors](../../frontend/src/api/client.ts#L224)
- [getMonthlyState](../../frontend/src/api/client.ts#L225)
- [getMonthlyPhysicalProgress](../../frontend/src/api/client.ts#L226)
- [getProjectMonthlyTrajectory](../../frontend/src/api/client.ts#L227)
- [queryCopilot](../../frontend/src/api/client.ts#L228)

### `frontend/src/api/intelligence.ts`

- [intelligence](../../frontend/src/api/intelligence.ts#L2)
- [encodeFile](../../frontend/src/api/intelligence.ts#L21)

### `frontend/src/components/IndiaMap.tsx`

- [onStateClick](../../frontend/src/components/IndiaMap.tsx#L7)
- [IndiaMap](../../frontend/src/components/IndiaMap.tsx#L10)
- [getStateColor](../../frontend/src/components/IndiaMap.tsx#L49)

### `frontend/src/components/common/ExpandableChartCard.tsx`

- [handleKeyDown](../../frontend/src/components/common/ExpandableChartCard.tsx#L28)
- [toggleBrowserFullscreen](../../frontend/src/components/common/ExpandableChartCard.tsx#L43)
- [renderContent](../../frontend/src/components/common/ExpandableChartCard.tsx#L51)

### `frontend/src/components/common/OverrunAnalysisPanel.tsx`

- [OverrunAnalysisPanel](../../frontend/src/components/common/OverrunAnalysisPanel.tsx#L24)
- [mutationFn](../../frontend/src/components/common/OverrunAnalysisPanel.tsx#L27)

### `frontend/src/components/intelligence/LiveVoice.tsx`

- [LiveVoice](../../frontend/src/components/intelligence/LiveVoice.tsx#L4)
- [stop](../../frontend/src/components/intelligence/LiveVoice.tsx#L10)
- [start](../../frontend/src/components/intelligence/LiveVoice.tsx#L12)

### `frontend/src/components/intelligence/ProjectRecords.tsx`

- [records](../../frontend/src/components/intelligence/ProjectRecords.tsx#L6)
- [ProjectRecords](../../frontend/src/components/intelligence/ProjectRecords.tsx#L17)
- [save](../../frontend/src/components/intelligence/ProjectRecords.tsx#L30)

### `frontend/src/components/layout/Header.tsx`

- [Header](../../frontend/src/components/layout/Header.tsx#L7)
- [getTitle](../../frontend/src/components/layout/Header.tsx#L12)

### `frontend/src/components/layout/LanguageSwitcher.tsx`

- [LanguageSwitcher](../../frontend/src/components/layout/LanguageSwitcher.tsx#L8)
- [onClick](../../frontend/src/components/layout/LanguageSwitcher.tsx#L16)
- [onKey](../../frontend/src/components/layout/LanguageSwitcher.tsx#L17)

### `frontend/src/components/layout/Layout.tsx`

- [Layout](../../frontend/src/components/layout/Layout.tsx#L7)

### `frontend/src/components/layout/Sidebar.tsx`

- [Sidebar](../../frontend/src/components/layout/Sidebar.tsx#L41)

### `frontend/src/lib/inspectionQueue.ts`

- [openDB](../../frontend/src/lib/inspectionQueue.ts#L4)
- [transaction](../../frontend/src/lib/inspectionQueue.ts#L13)
- [queueInspection](../../frontend/src/lib/inspectionQueue.ts#L22)
- [getQueue](../../frontend/src/lib/inspectionQueue.ts#L23)
- [getReceipts](../../frontend/src/lib/inspectionQueue.ts#L24)
- [pauseInspection](../../frontend/src/lib/inspectionQueue.ts#L26)
- [acknowledge](../../frontend/src/lib/inspectionQueue.ts#L32)
- [syncQueue](../../frontend/src/lib/inspectionQueue.ts#L45)
- [restoreQueueBackup](../../frontend/src/lib/inspectionQueue.ts#L67)

### `frontend/src/pages/AlertsPage.tsx`

- [AlertsPage](../../frontend/src/pages/AlertsPage.tsx#L6)

### `frontend/src/pages/AnalyticsPage.tsx`

- [truncateLabel](../../frontend/src/pages/AnalyticsPage.tsx#L71)
- [formatCurrencyCr](../../frontend/src/pages/AnalyticsPage.tsx#L78)
- [CustomChartTooltip](../../frontend/src/pages/AnalyticsPage.tsx#L87)
- [AnalyticsPage](../../frontend/src/pages/AnalyticsPage.tsx#L128)
- [handleKeyDown](../../frontend/src/pages/AnalyticsPage.tsx#L174)
- [fetchData](../../frontend/src/pages/AnalyticsPage.tsx#L185)
- [handleSubTabChange](../../frontend/src/pages/AnalyticsPage.tsx#L239)
- [renderRiskBadge](../../frontend/src/pages/AnalyticsPage.tsx#L246)
- [renderDelayBadge](../../frontend/src/pages/AnalyticsPage.tsx#L260)
- [toggleBrowserFullscreen](../../frontend/src/pages/AnalyticsPage.tsx#L299)
- [renderFullscreenModal](../../frontend/src/pages/AnalyticsPage.tsx#L308)

### `frontend/src/pages/BenchmarksPage.tsx`

- [BenchmarksPage](../../frontend/src/pages/BenchmarksPage.tsx#L61)
- [queryFn](../../frontend/src/pages/BenchmarksPage.tsx#L70)

### `frontend/src/pages/CopilotPage.tsx`

- [CopilotPage](../../frontend/src/pages/CopilotPage.tsx#L2)

### `frontend/src/pages/DashboardPage.tsx`

- [DashboardPage](../../frontend/src/pages/DashboardPage.tsx#L29)
- [queryFn](../../frontend/src/pages/DashboardPage.tsx#L48)
- [pct](../../frontend/src/pages/DashboardPage.tsx#L79)

### `frontend/src/pages/IntelligencePage.tsx`

- [JsonView](../../frontend/src/pages/IntelligencePage.tsx#L18)
- [EvidenceImport](../../frontend/src/pages/IntelligencePage.tsx#L19)
- [IntelligencePage](../../frontend/src/pages/IntelligencePage.tsx#L29)
- [IntelligenceWorkspace](../../frontend/src/pages/IntelligencePage.tsx#L33)
- [reload](../../frontend/src/pages/IntelligencePage.tsx#L40)
- [run](../../frontend/src/pages/IntelligencePage.tsx#L43)
- [sync](../../frontend/src/pages/IntelligencePage.tsx#L56)
- [recognize](../../frontend/src/pages/IntelligencePage.tsx#L58)
- [speak](../../frontend/src/pages/IntelligencePage.tsx#L63)
- [MarketComparison](../../frontend/src/pages/IntelligencePage.tsx#L152)
- [CatalogSearch](../../frontend/src/pages/IntelligencePage.tsx#L153)

### `frontend/src/pages/InterventionsPage.tsx`

- [InterventionsPage](../../frontend/src/pages/InterventionsPage.tsx#L10)
- [mutationFn](../../frontend/src/pages/InterventionsPage.tsx#L18)
- [mutationFn](../../frontend/src/pages/InterventionsPage.tsx#L30)
- [onSuccess](../../frontend/src/pages/InterventionsPage.tsx#L39)
- [mutationFn](../../frontend/src/pages/InterventionsPage.tsx#L45)
- [onSuccess](../../frontend/src/pages/InterventionsPage.tsx#L50)
- [handleUpdateStatus](../../frontend/src/pages/InterventionsPage.tsx#L52)
- [getStatusBadge](../../frontend/src/pages/InterventionsPage.tsx#L56)

### `frontend/src/pages/ProjectDetailPage.tsx`

- [ProjectDetailPage](../../frontend/src/pages/ProjectDetailPage.tsx#L17)
- [queryFn](../../frontend/src/pages/ProjectDetailPage.tsx#L24)
- [queryFn](../../frontend/src/pages/ProjectDetailPage.tsx#L32)
- [getRiskColor](../../frontend/src/pages/ProjectDetailPage.tsx#L53)

### `frontend/src/pages/ProjectsPage.tsx`

- [ProjectsPage](../../frontend/src/pages/ProjectsPage.tsx#L20)
- [queryFn](../../frontend/src/pages/ProjectsPage.tsx#L45)
- [handleSort](../../frontend/src/pages/ProjectsPage.tsx#L110)
- [resetFilters](../../frontend/src/pages/ProjectsPage.tsx#L126)
- [getRiskBadge](../../frontend/src/pages/ProjectsPage.tsx#L138)

### `frontend/src/pages/RiskMapPage.tsx`

- [RiskMapPage](../../frontend/src/pages/RiskMapPage.tsx#L2)

### `frontend/src/pages/ScenariosPage.tsx`

- [ScenariosPage](../../frontend/src/pages/ScenariosPage.tsx#L2)

### `frontend/src/pages/StateProgressPage.tsx`

- [StateProgressPage](../../frontend/src/pages/StateProgressPage.tsx#L26)
- [queryFn](../../frontend/src/pages/StateProgressPage.tsx#L33)
- [queryFn](../../frontend/src/pages/StateProgressPage.tsx#L38)

**Inventory totals:** 244 Python functions/methods (16 containing explicit unimplemented raises); 107 recognized named frontend declarations. Counts describe this audit snapshot.
