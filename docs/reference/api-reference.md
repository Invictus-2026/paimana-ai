# PARAM — API route reference

[Return to README](../../README.md) · Source audit: 1 October 2026

Generated from actual router registration and decorators without importing the app or changing its database. The configured default REST prefix is `/api/v1`. Signatures and Pydantic field definitions are in source and runtime OpenAPI; table purposes include audited corrections to older docstrings.

## Access and behavior

- **Operator** means the route declares `Depends(operator)`: `X-Operator-Key` is required when configured; absent key permits these routes in development but rejects them outside development. This is not user/RBAC authentication.
- **Bearer grant** means the signed action token is the authority. GET previews; POST makes a decision.
- **WebSocket hello** means the first message carries the operator key; see the live handler for its own checks.
- **No route gate** means no such route-level check was found. Read access is not globally protected; legacy project creation is also ungated.
- A POST can be a pure calculation/search, an external provider request, or a mutation. See behavior rather than inferring solely from the method.
- Numeric intelligence IDs refer to `projects.id`; several legacy project routes additionally resolve `external_project_id`.
- Error conventions: 401 operator credential; 404 absent project/action; 409 conflicts/replay; 410 invalid/expired token; 422 validation/input/inference; 502 provider failure; 503 missing service configuration. Exact route behavior is authoritative.
- Some older endpoints return arrays, some wrap `{status,data}`, and newer intelligence routes return direct JSON. Do not assume one common envelope.

## Health

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/health` | No route gate | [check_health](../../backend/app/api/v1/health.py#L10) — Return schema defaults; despite the older docstring, no database probe is performed. |

## Projects

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/projects` | No route gate | [get_projects](../../backend/app/api/v1/projects.py#L23) — Retrieve list of monitored infrastructure projects from DB with filtering and pagination. |
| GET | `/api/v1/projects/{project_id}` | No route gate | [get_project](../../backend/app/api/v1/projects.py#L43) — Fetch metadata for a single project by ID or external_project_id. |
| GET | `/api/v1/projects/{project_id}/predictions` | No route gate | [get_project_predictions](../../backend/app/api/v1/projects.py#L55) — Get stored ML risk predictions for a project from DB. |
| GET | `/api/v1/projects/{project_id}/risk` | No route gate | [get_project_risk](../../backend/app/api/v1/projects.py#L68) — Retrieve complete risk assessment for a project directly from DB. |
| GET | `/api/v1/projects/{project_id}/risk-trajectory` | No route gate | [get_project_risk_trajectory](../../backend/app/api/v1/projects.py#L99) — Retrieve historical risk scores, trajectory metrics, and state machine state for a project. |
| GET | `/api/v1/projects/{project_id}/interventions` | No route gate | [get_project_interventions](../../backend/app/api/v1/projects.py#L131) — List saved project interventions; exact ID resolution/response depends on the route module. |
| POST | `/api/v1/projects` | No route gate | [create_project](../../backend/app/api/v1/projects.py#L144) — Create a new project record. |

## Project Updates

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/project-updates` | No route gate | [list_project_updates](../../backend/app/api/v1/project_updates.py#L13) — List persisted project observations, newest first, optionally scoped to project. |
| POST | `/api/v1/project-updates` | Operator | [create_update](../../backend/app/api/v1/project_updates.py#L27) — Create a non-synthetic-tagged progress/expenditure record for an existing project. |
| GET | `/api/v1/project-updates/milestones` | No route gate | [list_milestones](../../backend/app/api/v1/project_updates.py#L33) — List stored milestones by planned date, optionally scoped to project. |
| POST | `/api/v1/project-updates/milestones` | Operator | [create_milestone](../../backend/app/api/v1/project_updates.py#L51) — Create milestone with validated planned/actual date and completion-state relationship. |

## Predictions

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/predictions/cost-overrun` | No route gate | [get_cost_overrun_predictions](../../backend/app/api/v1/predictions.py#L124) — Filter/sort/paginate formula-derived cost-growth estimates and exposure for the selected reporting month. |
| GET | `/api/v1/predictions/time-overrun` | No route gate | [get_time_overrun_predictions](../../backend/app/api/v1/predictions.py#L222) — Filter/sort/paginate formula-derived schedule estimates and aggregate delay statistics. |
| GET | `/api/v1/predictions` | No route gate | [get_predictions](../../backend/app/api/v1/predictions.py#L323) — Recompute composite estimates for a valid project; otherwise returns fixed fallback values 14.5 percent and 42 days. Not trained inference. |

## Risks

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/risks` | No route gate | [get_risk_scores](../../backend/app/api/v1/risks.py#L9) — Read saved predictions and attribution rows, never synthesize missing factors. |

## Alerts

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/alerts` | No route gate | [list_alerts](../../backend/app/api/v1/alerts.py#L16) — Retrieve early warning alerts from DB with filtering and pagination. |
| GET | `/api/v1/alerts/{alert_id}` | No route gate | [get_alert_by_id](../../backend/app/api/v1/alerts.py#L40) — Retrieve single alert details by ID from DB. |
| POST | `/api/v1/alerts/{alert_id}/resolve` | Operator | [resolve_alert](../../backend/app/api/v1/alerts.py#L58) — Record named alert resolution and review evidence. |

## Analytics

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/analytics/overview` | No route gate | [get_analytics_overview](../../backend/app/api/v1/analytics.py#L51) — Computes macro dashboard metrics directly from DB queries. |
| GET | `/api/v1/analytics/benchmarks` | No route gate | [get_benchmark_analytics](../../backend/app/api/v1/analytics.py#L81) — Computes descriptive comparative benchmarks with mandatory statistical safeguards: - Minimum sample size threshold (N >= 3) - Transparency metadata (N, completeness %, time window) - 3 core non-evaluative pedagogical caveats |
| GET | `/api/v1/analytics/sectors` | No route gate | [get_sector_analytics](../../backend/app/api/v1/analytics.py#L176) — Computes sector-level aggregate metrics directly from database queries. |
| GET | `/api/v1/analytics/ministries` | No route gate | [get_ministry_analytics](../../backend/app/api/v1/analytics.py#L209) — Computes ministry-level aggregate metrics directly from database queries. |
| GET | `/api/v1/analytics/geography` | No route gate | [get_geography_analytics](../../backend/app/api/v1/analytics.py#L242) — Computes state/geography-level aggregate metrics directly from database queries. |

## Monthly

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/monthly/overview` | No route gate | [get_monthly_overview](../../backend/app/api/v1/monthly.py#L283) — Returns month-by-month aggregate statistics for the full 2025-07 → 2026-07 window. |
| GET | `/api/v1/monthly/sectors` | No route gate | [get_monthly_sectors](../../backend/app/api/v1/monthly.py#L294) — Returns sector-level breakdown for a specific month. |
| GET | `/api/v1/monthly/available-months` | No route gate | [get_available_months](../../backend/app/api/v1/monthly.py#L339) — Returns the list of months for which dataset files exist. |
| GET | `/api/v1/monthly/project/{ext_project_id}` | No route gate | [get_project_monthly_trajectory](../../backend/app/api/v1/monthly.py#L354) — Searches all 13 monthly CSVs for the given MoSPI project ID and returns its full temporal trajectory covering budget, expenditure, overrun %, and computed risk score. |
| GET | `/api/v1/monthly/projects` | No route gate | [get_monthly_projects](../../backend/app/api/v1/monthly.py#L395) — Returns the list of projects for a given month, matching the standard DB project schema. |
| GET | `/api/v1/monthly/state` | No route gate | [get_monthly_state](../../backend/app/api/v1/monthly.py#L485) — Returns the state-wise breakdown for a specific month. |
| GET | `/api/v1/monthly/physical-progress` | No route gate | [get_monthly_physical_progress](../../backend/app/api/v1/monthly.py#L494) — Returns the physical progress distribution for a specific month. |

## Scenarios

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| POST | `/api/v1/scenarios/simulate` | No route gate | [simulate_scenario](../../backend/app/api/v1/scenarios.py#L15) — Apply the twin plus explicit budget, duration and supply-chain deltas to stored projects. |

## Interventions

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/interventions` | No route gate | [list_interventions](../../backend/app/api/v1/interventions.py#L26) — List saved interventions, optionally filtered by project; does not generate actions. |
| POST | `/api/v1/interventions/generate` | Operator | [generate](../../backend/app/api/v1/interventions.py#L33) — Explicitly generate persistent evidence-review actions, skipping previously generated project/type pairs. |
| GET | `/api/v1/interventions/{project_id}` | No route gate | [get_project_interventions](../../backend/app/api/v1/interventions.py#L48) — List saved project interventions; exact ID resolution/response depends on the route module. |
| POST | `/api/v1/interventions/{recommendation_id}/approve` | Operator | [approve_intervention](../../backend/app/api/v1/interventions.py#L58) — Record named review/decision with an atomic state check; reject changes to final states. |

## Models

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/models` | No route gate | [list_models](../../backend/app/api/v1/models.py#L58) — Retrieve metadata for trained and deployed machine learning models from DB. |

## Copilot

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| POST | `/api/v1/copilot/query` | Operator | [query_copilot](../../backend/app/api/v1/copilot.py#L8) — Wrap the active evidence assistant for the compatibility route. |

## Intelligence

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| GET | `/api/v1/intelligence/status` | No route gate | [status](../../backend/app/api/v1/intelligence.py#L59) — Report configured integrations and write-auth mode; does not probe connectivity. |
| GET | `/api/v1/intelligence/projects` | No route gate | [project_options](../../backend/app/api/v1/intelligence.py#L71) — Return project choices for the Intelligence workspace. |
| POST | `/api/v1/intelligence/documents` | Operator | [upload_document](../../backend/app/api/v1/intelligence.py#L81) — Validate/decode PDF or text, extract pages, hash bytes and save deduplicated project evidence. |
| GET | `/api/v1/intelligence/documents/{pid}` | No route gate | [documents](../../backend/app/api/v1/intelligence.py#L103) — List document metadata/pages while withholding stored original PDF base64. |
| POST | `/api/v1/intelligence/ask` | Operator | [ask](../../backend/app/api/v1/intelligence.py#L113) — Apply project/portfolio filters, retrieve lexical passages, optionally ask Ollama and return facts/citations. |
| POST | `/api/v1/intelligence/overrun-analysis/{pid}` | Operator | [overrun_analysis](../../backend/app/api/v1/intelligence.py#L180) — Ask Ollama to explain a saved prediction and available factors; persist an alert on high/critical severity. |
| POST | `/api/v1/intelligence/market` | Operator | [market_save](../../backend/app/api/v1/intelligence.py#L225) — Save a supplied dated market/rain observation. |
| GET | `/api/v1/intelligence/market` | No route gate | [market_list](../../backend/app/api/v1/intelligence.py#L229) — List saved market observations. |
| POST | `/api/v1/intelligence/twin` | No route gate | [twin](../../backend/app/api/v1/intelligence.py#L245) — Calculate project or portfolio material/rain scenario; optionally derive shocks from two market records. |
| POST | `/api/v1/intelligence/satellite` | Operator | [satellite](../../backend/app/api/v1/intelligence.py#L287) — Validate and save imported before/after band observations; create discrepancy alert if rule triggers. |
| GET | `/api/v1/intelligence/satellite/{pid}` | No route gate | [satellite_list](../../backend/app/api/v1/intelligence.py#L298) — List persisted satellite observations for a project. |
| POST | `/api/v1/intelligence/satellite/search` | No route gate | [satellite_search](../../backend/app/api/v1/intelligence.py#L312) — Search fixed Planetary Computer catalog by bounded coordinates, collection and dates. |
| POST | `/api/v1/intelligence/calibration` | Operator | [calibration](../../backend/app/api/v1/intelligence.py#L339) — Store operator-declared held-out model/target outcome pairs and optional survival cohort. |
| GET | `/api/v1/intelligence/uncertainty/{pid}` | No route gate | [uncertainty](../../backend/app/api/v1/intelligence.py#L343) — Match latest prediction to delay calibration, return residual interval, cohort curve and supported dates. |
| POST | `/api/v1/intelligence/contractors` | Operator | [contractor_save](../../backend/app/api/v1/intelligence.py#L397) — Save a sourced contractor/project delivery record after count validation. |
| GET | `/api/v1/intelligence/contractors` | No route gate | [contractor_list](../../backend/app/api/v1/intelligence.py#L402) — Aggregate latest contractor/project records; compute on-time/claims/payment/package indicators. |
| POST | `/api/v1/intelligence/boundaries` | Operator | [boundary_save](../../backend/app/api/v1/intelligence.py#L434) — Store supplied surveyed polygon after coordinate/area validation. |
| GET | `/api/v1/intelligence/boundaries/{pid}` | No route gate | [boundary_get](../../backend/app/api/v1/intelligence.py#L439) — List boundaries by project ID. |
| POST | `/api/v1/intelligence/inspections` | Operator | [inspection_save](../../backend/app/api/v1/intelligence.py#L454) — Validate retry identity, timestamp, photo/hash and GPS polygon; persist receipt or reject conflict. |
| GET | `/api/v1/intelligence/inspections/{pid}` | No route gate | [inspection_list](../../backend/app/api/v1/intelligence.py#L489) — List saved inspection metadata excluding photo payload. |
| GET | `/api/v1/intelligence/actions/{token}` | Bearer grant | [action_preview](../../backend/app/api/v1/intelligence.py#L523) — Return escaped HTML review form without applying the decision. |
| POST | `/api/v1/intelligence/actions/{token}` | Bearer grant | [action_apply](../../backend/app/api/v1/intelligence.py#L536) — Atomically consume grant and finalize intervention; persist signed-bearer decision evidence. |
| GET | `/api/v1/intelligence/dispatch` | No route gate | [dispatch_list](../../backend/app/api/v1/intelligence.py#L554) — List persisted delivery attempts. |
| POST | `/api/v1/intelligence/dispatch` | Operator | [dispatch](../../backend/app/api/v1/intelligence.py#L558) — Validate action/configuration and idempotency; create grant/attempt, call adapter and record acceptance/ambiguity. |
| GET | `/api/v1/intelligence/dossier/{pid}` | No route gate | [dossier](../../backend/app/api/v1/intelligence.py#L613) — Generate PDF from selected project records and available evidence. |
| POST | `/api/v1/intelligence/model/predict` | Operator | [model_predict](../../backend/app/api/v1/intelligence.py#L651) — Require all feature keys, execute artifacts, fingerprint models and persist prediction/input/optional SHAP. |
| POST | `/api/v1/intelligence/satellite/compute` | Operator | [satellite_compute](../../backend/app/api/v1/intelligence.py#L707) — Fetch optical raster pair, mask project/common usable pixels, calculate change and save review evidence. |
| POST | `/api/v1/intelligence/market/refresh` | Operator | [refresh_market](../../backend/app/api/v1/intelligence.py#L742) — Fetch configured HTTPS normalized feed, validate all records, hash/deduplicate and commit. |
| POST | `/api/v1/intelligence/satellite/radar` | Operator | [radar_compute](../../backend/app/api/v1/intelligence.py#L774) — Fetch compatible Sentinel-1 RTC pair, compute power/dB change and save review evidence. |

## Live

| Method | Full default path | Access | Handler / behavior |
|---|---|---|---|
| WEBSOCKET | `/api/v1/intelligence/live` | WebSocket hello | [live](../../backend/app/api/v1/live.py#L13) — Validate WebSocket hello and configuration; relay project-context audio/transcripts with session limits. |

## Root and generated documentation

| Method | Path | Behavior |
|---|---|---|
| GET | `/` | Root metadata greeting |
| GET | `/api/v1/docs` | Swagger UI |
| GET | `/api/v1/redoc` | ReDoc |
| GET | `/api/v1/openapi.json` | Generated OpenAPI schema |

**Inventory:** 68 router-declared HTTP/WebSocket endpoints, plus root and framework documentation routes.

## Important side effects and limitations

- `/projects/{project_id}/risk-trajectory` evaluates the process-local early-warning engine; this can affect in-memory cooldown state and is not a persisted alert writer.
- `/intelligence/overrun-analysis/{pid}` can add an alert on each successful high/critical generation. A client timeout does not necessarily cancel this server operation.
- `/interventions/generate` writes actions explicitly; GET/list operations do not generate recommendations.
- `/intelligence/dispatch` records an attempt before calling its provider. An ambiguous/crashed attempt should not be treated as safe to resend with a new idempotency key.
- The scheduled CLI calls these Python functions directly, bypassing HTTP dependency injection; restrict access to that process/environment appropriately.
- Document/inspection listing hides original PDF/photo base64 but does not implement per-user project visibility. Source excerpts can still be sensitive.
- `POST /projects` has no operator dependency in current source. A deployment needing uniform write authorization must address this.
- `GET /health` does not establish DB connectivity. `GET /intelligence/status` is configuration readiness only.

## Request models and fields

Field expressions below preserve the declared validation/defaults. Refer to validators and OpenAPI for inheritance and semantic checks; this is a source reference, not a substitute for executing validation.

### intelligence.DocumentInput

Source: [DocumentInput](../../backend/app/api/v1/intelligence.py#L74). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `name` | `str` | `Field(min_length=1, max_length=200)` |
| `content_base64` | `str` | `Field(max_length=14000000)` |
| `mime` | `Literal['application/pdf', 'text/plain']` | `required` |

### intelligence.Question

Source: [Question](../../backend/app/api/v1/intelligence.py#L107). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `query` | `str` | `Field(min_length=2, max_length=4000)` |
| `project_id` | `int \| None` | `None` |
| `language` | `Literal['en-IN', 'hi-IN', 'ta-IN', 'bn-IN']` | `'en-IN'` |

### intelligence.OverrunAnalysis

Source: [OverrunAnalysis](../../backend/app/api/v1/intelligence.py#L172). Bases: `BaseModel`.

| Field | Type | Default / validation expression |
|---|---|---|
| `reason` | `str` | `Field(min_length=1, max_length=2000)` |
| `prevention_steps` | `list[str]` | `Field(min_length=1, max_length=10)` |
| `severity` | `Literal['low', 'medium', 'high', 'critical']` | `required` |
| `alert_message` | `str` | `Field(min_length=1, max_length=500)` |

### intelligence.Market

Source: [Market](../../backend/app/api/v1/intelligence.py#L214). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `as_of` | `date` | `required` |
| `source` | `str` | `Field(min_length=3, max_length=500)` |
| `steel` | `float` | `Field(gt=0)` |
| `cement` | `float` | `Field(gt=0)` |
| `bitumen` | `float` | `Field(gt=0)` |
| `diesel` | `float` | `Field(gt=0)` |
| `rain_days` | `float` | `Field(ge=0, le=366)` |
| `region` | `str` | `Field(min_length=1, max_length=100)` |

### intelligence.Twin

Source: [Twin](../../backend/app/api/v1/intelligence.py#L232). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int \| None` | `None` |
| `steel` | `float` | `Field(default=0, ge=-100, le=1000)` |
| `cement` | `float` | `Field(default=0, ge=-100, le=1000)` |
| `bitumen` | `float` | `Field(default=0, ge=-100, le=1000)` |
| `diesel` | `float` | `Field(default=0, ge=-100, le=1000)` |
| `remaining_fraction` | `float` | `Field(default=1, ge=0, le=1)` |
| `rain_days` | `float` | `Field(default=0, ge=0, le=366)` |
| `productivity_loss` | `float` | `Field(default=0.5, ge=0, le=1)` |
| `baseline_id` | `int \| None` | `None` |
| `current_id` | `int \| None` | `None` |

### intelligence.BandObservation

Source: [BandObservation](../../backend/app/api/v1/intelligence.py#L263). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `date` | `date` | `required` |
| `sensor` | `Literal['Sentinel-2', 'Landsat-8', 'Landsat-9']` | `required` |
| `scene_id` | `str` | `Field(min_length=1, max_length=200)` |
| `red` | `float` | `Field(ge=0, le=1)` |
| `nir` | `float` | `Field(ge=0, le=1)` |
| `swir` | `float` | `Field(ge=0, le=1)` |
| `cloud_pct` | `float` | `Field(ge=0, le=100)` |
| `sar_db` | `float \| None` | `Field(default=None, ge=-60, le=30)` |
| `image_url` | `str \| None` | `Field(default=None, max_length=2000, pattern='^https://')` |

### intelligence.Satellite

Source: [Satellite](../../backend/app/api/v1/intelligence.py#L274). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `before` | `BandObservation` | `required` |
| `after` | `BandObservation` | `required` |
| `claimed_progress_pct` | `float` | `Field(ge=0, le=100)` |
| `source` | `str` | `Field(min_length=3, max_length=500)` |

### intelligence.Catalog

Source: [Catalog](../../backend/app/api/v1/intelligence.py#L302). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `west` | `float` | `Field(ge=-180, le=180)` |
| `south` | `float` | `Field(ge=-90, le=90)` |
| `east` | `float` | `Field(ge=-180, le=180)` |
| `north` | `float` | `Field(ge=-90, le=90)` |
| `start` | `date` | `required` |
| `end` | `date` | `required` |
| `collection` | `Literal['sentinel-2-l2a', 'landsat-c2-l2', 'sentinel-1-grd', 'sentinel-1-rtc']` | `'sentinel-2-l2a'` |

### intelligence.Pair

Source: [Pair](../../backend/app/api/v1/intelligence.py#L324). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `predicted` | `float` | `Field(ge=0)` |
| `actual` | `float` | `Field(ge=0)` |

### intelligence.SurvivalObservation

Source: [SurvivalObservation](../../backend/app/api/v1/intelligence.py#L327). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `duration_days` | `float` | `Field(gt=0)` |
| `completed` | `bool` | `required` |

### intelligence.Calibration

Source: [Calibration](../../backend/app/api/v1/intelligence.py#L330). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `model_version` | `str` | `Field(min_length=1, max_length=100)` |
| `target` | `Literal['delay_days', 'cost_overrun_pct']` | `required` |
| `source` | `str` | `Field(min_length=3, max_length=500)` |
| `held_out` | `Literal[True]` | `required` |
| `pairs` | `list[Pair]` | `Field(min_length=9, max_length=10000)` |
| `survival` | `list[SurvivalObservation]` | `Field(default_factory=list, max_length=10000)` |

### intelligence.Contractor

Source: [Contractor](../../backend/app/api/v1/intelligence.py#L378). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `contractor_id` | `str` | `Field(min_length=1, max_length=100)` |
| `name` | `str` | `Field(min_length=1, max_length=200)` |
| `source` | `str` | `Field(min_length=3, max_length=500)` |
| `as_of` | `date` | `required` |
| `milestone_count` | `int` | `Field(ge=1)` |
| `on_time_count` | `int` | `Field(ge=0)` |
| `arbitration_claims` | `int` | `Field(ge=0)` |
| `work_value_cr` | `float` | `Field(gt=0)` |
| `payment_days` | `float \| None` | `Field(default=None, ge=0, le=3650)` |
| `delay_days` | `float` | `Field(ge=0)` |

### intelligence.Boundary

Source: [Boundary](../../backend/app/api/v1/intelligence.py#L421). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `source` | `str` | `Field(min_length=3, max_length=500)` |
| `ring` | `list[tuple[float, float]]` | `Field(min_length=3, max_length=10000)` |

### intelligence.Inspection

Source: [Inspection](../../backend/app/api/v1/intelligence.py#L442). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `client_id` | `str` | `Field(min_length=16, max_length=64)` |
| `latitude` | `float` | `Field(ge=-90, le=90)` |
| `longitude` | `float` | `Field(ge=-180, le=180)` |
| `accuracy_m` | `float` | `Field(gt=0, le=100)` |
| `captured_at` | `datetime` | `required` |
| `note` | `str` | `Field(min_length=1, max_length=4000)` |
| `photo_base64` | `str` | `Field(max_length=11000000)` |
| `photo_sha256` | `str` | `Field(pattern='^[a-f0-9]{64}$')` |

### intelligence.Dispatch

Source: [Dispatch](../../backend/app/api/v1/intelligence.py#L492). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `intervention_id` | `int` | `required` |
| `channel` | `Literal['telegram', 'whatsapp', 'email', 'slack']` | `required` |
| `idempotency_key` | `str` | `Field(min_length=16, max_length=64)` |

### intelligence.ModelInference

Source: [ModelInference](../../backend/app/api/v1/intelligence.py#L646). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `features` | `dict[str, float]` | `required` |

### intelligence.SatelliteCompute

Source: [SatelliteCompute](../../backend/app/api/v1/intelligence.py#L699). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `collection` | `Literal['sentinel-2-l2a', 'landsat-c2-l2']` | `'sentinel-2-l2a'` |
| `before_scene_id` | `str` | `Field(min_length=1, max_length=200, pattern='^[A-Za-z0-9_.-]+$')` |
| `after_scene_id` | `str` | `Field(min_length=1, max_length=200, pattern='^[A-Za-z0-9_.-]+$')` |
| `claimed_progress_pct` | `float` | `Field(ge=0, le=100)` |

### intelligence.RadarCompute

Source: [RadarCompute](../../backend/app/api/v1/intelligence.py#L766). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `before_scene_id` | `str` | `Field(min_length=1, max_length=200, pattern='^[A-Za-z0-9_.-]+$')` |
| `after_scene_id` | `str` | `Field(min_length=1, max_length=200, pattern='^[A-Za-z0-9_.-]+$')` |
| `polarization` | `Literal['vv', 'vh', 'hh', 'hv']` | `'vv'` |
| `claimed_progress_pct` | `float` | `Field(ge=0, le=100)` |

### project_updates.UpdateInput

Source: [UpdateInput](../../backend/app/api/v1/project_updates.py#L19). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `timestamp` | `datetime` | `Field(default_factory=lambda: datetime.now(timezone.utc))` |
| `cost_actual` | `float` | `Field(ge=0)` |
| `schedule_variance` | `float` | `required` |
| `status_text` | `str` | `Field(min_length=1, max_length=4000)` |

### project_updates.MilestoneInput

Source: [MilestoneInput](../../backend/app/api/v1/project_updates.py#L39). Bases: `Input`.

| Field | Type | Default / validation expression |
|---|---|---|
| `project_id` | `int` | `required` |
| `name` | `str` | `Field(min_length=1, max_length=255)` |
| `planned_date` | `date` | `required` |
| `actual_date` | `date \| None` | `None` |
| `status` | `Literal['pending', 'in_progress', 'completed']` | `'pending'` |

### interventions.ApprovalRequest

Source: [ApprovalRequest](../../backend/app/api/v1/interventions.py#L52). Bases: `BaseModel`.

| Field | Type | Default / validation expression |
|---|---|---|
| `new_status` | `Literal['APPROVED', 'REJECTED', 'UNDER_REVIEW']` | `required` |
| `reviewer_name` | `str` | `Field(min_length=1, max_length=200)` |
| `reviewer_notes` | `str` | `Field(default='', max_length=4000)` |

### alerts.AlertReview

Source: [AlertReview](../../backend/app/api/v1/alerts.py#L53). Bases: `BaseModel`.

| Field | Type | Default / validation expression |
|---|---|---|
| `reviewer_name` | `str` | `Field(min_length=1, max_length=200)` |
| `note` | `str` | `Field(min_length=1, max_length=4000)` |

### scenarios.ScenarioSimulationInput

Source: [ScenarioSimulationInput](../../backend/app/api/v1/scenarios.py#L9). Bases: `Twin`.

| Field | Type | Default / validation expression |
|---|---|---|
| `budget_delta_percent` | `float` | `Field(default=0, ge=-100, le=1000)` |
| `duration_delta_days` | `int` | `Field(default=0, ge=-3650, le=3650)` |
| `supply_chain_delay_weeks` | `int` | `Field(default=0, ge=0, le=520)` |

