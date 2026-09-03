# Real Dataset Integration — Design

Date: 2026-09-03

## Context

This supersedes the earlier scheduled-refresh-from-live-scrape idea. The user provided a real dataset at `data/dataset/`:

- `ministry/*.csv` (18 files) — same 1775 projects grouped per ministry, plus `all ministry.csv` (the full 1775-row master).
- `sector/*.csv` (11 files) — same 1775 projects grouped per sector, plus `ALL.csv` (the full 1775-row master).
- Confirmed: `ministry/all ministry.csv` and `sector/ALL.csv` contain the identical 1775 unique `ProjectID`s — one master dataset, sliced two ways for convenience. The per-ministry/per-sector files are redundant subsets of the master; only `sector/ALL.csv` (or `ministry/all ministry.csv`) needs to be ingested.
- Schema (8 columns, consistent across every file): `Sr.No., Line Ministry, Sector, ProjectID, Project Name, Original Cost (in Cr), Latest Revised Cost (in Cr), Expenditure (Cumm.) (in Cr)`.
- No dates, no physical progress, no delay reason, no state/location — a single point-in-time snapshot, not a time series.

Decisions made with the user:
- This dataset **replaces** the synthetic generator as the system's data source everywhere — DB seed, ML training, frontend. The synthetic generator and the prior scheduled-refresh-from-unknown-URL design are dropped.
- ML scope is **cost-overrun only**: train on `binary_cost_overrun` and `continuous_cost_overrun_percentage` (both already implementable from `original_cost`/`revised_cost` per `ml/features/target_generation.py`), using a random train/test split. No delay/schedule targets, no time-series features — the data doesn't support them, and fabricating dates to force the existing machinery to run would produce fake delay predictions.

## What changes

### 1. Data ingestion (`backend/app/data_pipeline/`)

- New raw source: copy `data/dataset/sector/ALL.csv` (the master) into `data/raw/` as the canonical input — the per-ministry/per-sector single-category files are not re-ingested (redundant with the master; `Sector` and `Line Ministry` columns already give both groupings from the one file).
- `schema.py` `COLUMN_ALIASES`: add aliases for the exact real headers — `"Original Cost\n(in Cr)"` → `original_cost`, `"Latest Revised Cost\n(in Cr)"` → `revised_cost`, `"Expenditure (Cumm.)\n(in Cr)"` → `cumulative_expenditure`, `"Line Ministry"` → `ministry_name`, `"Sector"` → `sector`, `"ProjectID"` → `project_id`, `"Project Name"` → `project_name`. (Ingestion already strips/flattens headers; multi-line headers need a normalize-whitespace step added to `flatten_and_map_columns` since real headers contain embedded `\n`.)
- Remaining canonical columns with no source data (`state_location`, `start_date`, `planned_end_date`, `revised_end_date`, `observation_date`, `physical_progress_pct`, `delay_reason_category`) stay `None` — already how the pipeline handles missing canonical columns (see `run_ingestion_and_schema_validation`).
- `feature_engineering.py`'s 13 derived features are almost entirely date/progress-dependent and will produce all-zero/NaN output on this data. Scope them down: keep only `cost_growth_percent` and `expenditure_ratio` (both already computed from cost fields alone); skip computing the date-dependent features rather than emitting misleading zeros — guard the stage to only compute what its inputs support.
- `quality_checks.py` / duplicate detection: unaffected, still keyed on `project_id`.
- `generate_raw_data.py` (synthetic generator): stop calling it from any startup/seed path. Leave the file in place (harmless, useful for future test fixtures) but disconnect it from the live data flow.

### 2. Database (`backend/app/models/entities.py`, `ProjectService`)

- `Project` table already has the fields we need: `name`, `sector`, `ministry`, `budget` (→ `original_cost`), `cost_overrun_pct`, `overall_risk_score`. No schema migration required — just stop using fields we don't have data for (`start_date`, `end_date`, `state`) by leaving them null rather than defaulting to fake values (current `ProjectService.seed_initial_data_if_empty` hardcodes 18 fictional projects — replace this seed path with a real load from the processed dataset).
- Add `revised_cost` and `cumulative_expenditure` as columns on `Project` (currently absent — only `budget`/`cost_overrun_pct` exist) so the real cost fields are queryable/displayed directly, not just folded into a derived percentage. Alembic migration required.
- One-time load script (`scripts/load_real_dataset.py`): run ETL on the real CSV → compute `cost_overrun_pct` per project → upsert into `Project` (matched on `ProjectID` as external key, stored in a new indexed `external_project_id` column so re-runs are idempotent).
- `overall_risk_score`: derive from `cost_growth_percent` via a simple documented bucketing (e.g. normalize/clip cost overrun % into 0-1) until the ML model's predicted risk is wired in — this is a placeholder scoring rule, not a made-up value per project, and should be labeled as such (`is_synthetic=False`, but a `risk_score_method` field or code comment noting it's a rule-based fallback pending the trained model).

### 3. ML (`ml/features/`, `ml/models/`, `scripts/train_baselines.py`)

- New trimmed training script path (or flag on the existing one) that:
  - Loads the processed real dataset.
  - Computes only `binary_cost_overrun` and `continuous_cost_overrun_percentage` targets.
  - Uses `ministry_name`, `sector`, `original_cost`, `expenditure_ratio`, `cost_growth_percent` as features (drop every date/progress-derived feature — they don't exist for this data).
  - Random train/test split (e.g. 80/20, stratified on the binary target) — the existing chronological Train≤Oct2025/Val-Nov/Test-Dec split does not apply to a snapshot dataset and must not be used here.
  - Trains the existing baseline regressors/classifiers (Linear/Ridge/Logistic — reuse, don't reinvent) against this reduced feature/target set.
  - Skip Cox proportional hazards (survival analysis needs time-to-event data we don't have).
- Serialize to `models/baseline/` as before; `ModelVersion` registry entry records that this version is cost-overrun-only, trained on the real MoSPI dataset, so future viewers of `/api/v1/models` aren't misled into thinking delay prediction is covered.
- Wire `ml/models/predictor.py` (or equivalent) into the risk-score computation replacing the placeholder bucketing from step 2, once trained — same task, sequenced after training works.

### 4. Backend API / services

- `ProjectService.seed_initial_data_if_empty`: replace the hardcoded 18-project list with a call to load from the processed real dataset (same script/module as the one-time load, reused as a function so both a manual script run and app-startup seeding go through one code path).
- No endpoint contract changes needed — `ProjectResponse` schema already has `budget`, `cost_overrun_pct`, `overall_risk_score`; add `revised_cost`, `cumulative_expenditure` to `ProjectBase`/`ProjectResponse` to expose the new columns.
- Endpoints that assume `start_date`/`end_date`/`state` (none currently do beyond optional display) continue to work with those fields simply `None`.

### 5. Frontend

- `frontend/src/api/client.ts` already merges live API fields over `MOCK_PROJECTS` per-project and falls back cleanly — this pattern is kept, not rewritten.
- Add mapping for the two new numeric fields (`revised_cost` → `revisedBudgetCr`, already a mock field; `cumulative_expenditure` → new display field) in `getProjects`/`getProjectById`.
- Fields with no real backing (`scheduleDelayDays`, `nextMilestone`, `monthlyRiskHistory`, state-level breakdowns) keep falling back to mock values as today — no claim is made that these are real, since the merge already only overrides fields the API actually returns. No UI copy changes are required by this design, but if the user separately wants those cards visually flagged as "illustrative" that's a follow-up, not part of this data-integration change.
- `getStateSummaries` currently returns pure mock (`STATE_RISK_SUMMARY`) — real data has no state field, so this stays mock; no change here.

## Error handling

- Malformed/missing-column rows in the CSV: existing `quality_checks.py` anomaly flagging already covers negative/zero cost cases; extend detection for the real data's specific shape only if the load script surfaces problems (e.g. zero `original_cost` breaks the overrun ratio divide — `target_generation.py` already guards this by replacing 0 with NaN).
- Load script failure: existing pipeline logging; startup seed falls back to leaving DB empty rather than reintroducing fictional data, since the whole point is not to ship fake numbers as real ones.

## Testing

- Unit: header-alias mapping test against the real CSV headers (multi-line `\n` headers specifically, since that's a new wrinkle vs. existing test fixtures).
- Unit: `cost_growth_percent`/`expenditure_ratio` computed correctly on a few known rows from the dataset (hand-verify 2-3 sample projects' expected overrun %).
- Integration: run full ETL + load script against `data/dataset/sector/ALL.csv`, assert 1775 `Project` rows land in the DB, no duplicates, `cost_overrun_pct` populated for all.
- ML: train/test split produces stratified classes; baseline models report metrics (ROC-AUC etc.) into `reports/baseline-results.json` as before, scoped to the two cost targets only.
- Manual: start backend, confirm `/api/v1/projects` returns real project names/ministries/costs; confirm frontend dashboard renders real counts/budgets while gracefully showing mock-sourced fields where real data doesn't exist.

## Out of scope

- Delay/schedule prediction, time-series risk trajectory, milestone tracking — no data support: today's `overall_risk_score` and trajectory-based alerts/interventions logic (`EarlyWarningEngine`, calculated from historical risk score series) will have at most one data point per project and should be understood as degraded/placeholder until a time-series source exists. Not being redesigned in this pass; flagged as a known limitation.
- State-level breakdowns (no state column in this dataset).
- Any live scraping or scheduled fetch from `paimana-proj.mospi.gov.in` or another live source — this is a one-time real dataset load, not a recurring pipeline. If/when a real periodic source is identified later, that's a separate, future spec.
