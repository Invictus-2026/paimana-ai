# Scheduled Data Refresh Pipeline — Design

Date: 2026-09-03

## Context

The user asked to "web scrape paimana-proj.mospi.gov.in and update all the data in realtime." Scraping that live `.gov.in` portal directly was ruled out: no public API, no documented scraping policy, and it's a live government monitoring system — not something to hit with an unauthorized bulk crawl. The user agreed to instead:

- Source data from official open-data channels when available, rather than scraping the live portal.
- Treat "realtime" as a scheduled periodic refresh, not continuous polling.
- Build the pipeline now against the existing synthetic data generator as a stand-in source, so a real dataset URL/file can be wired in later with a small, isolated change.

## Existing system (already in the repo, unchanged by this work)

- `backend/app/data_pipeline/`: a 16-stage ETL (`runner.py` → `ingestion.py`, `normalization.py`, `quality_checks.py`, `feature_engineering.py`). Reads any CSV/XLSX/JSON dropped in `data/raw/`, writes `data/processed/project_monthly_dataset.parquet` (+ CSV).
- `backend/app/data_pipeline/generate_raw_data.py`: generates synthetic sample files into `data/raw/`. Current stand-in data source.
- `backend/app/models/entities.py`: SQLAlchemy `Project` / `ProjectUpdate` / etc. tables.
- `backend/app/api/v1/projects.py` + `ProjectService`: REST endpoints reading from the DB.
- `frontend/src/api/client.ts`: fetches `/projects` etc. once per page load, falls back to `MOCK_PROJECTS` on error/timeout.

None of this is touched structurally — new work plugs into it.

## Design

Three isolated pieces:

### 1. Source connector (`backend/app/data_pipeline/connectors/`)

A small interface: a function that produces one or more raw files in `data/raw/` and returns their paths. Two implementations:
- `synthetic_connector.py`: wraps the existing `generate_raw_data.py` — the default/active source for now.
- `http_connector.py`: stub that downloads a file from a configured URL (`DATA_SOURCE_URL` env var) — not wired to any real MoSPI/data.gov.in URL yet, since none was confirmed reachable in this environment. Selecting it requires only setting `DATA_SOURCE_URL` and `DATA_SOURCE_TYPE=http`; no pipeline changes.

Connector selection via one config value in `app/config.py` (`DATA_SOURCE_TYPE: str = "synthetic"`).

### 2. Scheduled refresh job (`backend/app/data_pipeline/refresh_job.py` + `scripts/refresh_data.py`)

Sequence: connector.fetch() → `run_etl_pipeline()` (existing, unchanged) → load `project_monthly_dataset.parquet` into the DB.

DB load logic (new, in `data_pipeline/db_loader.py`):
- Group processed rows by project id.
- Upsert `Project` (match by name+ministry since synthetic/real sources won't share numeric IDs; create if new, update mutable fields like `budget`, `status`, `cost_overrun_pct`, `overall_risk_score` if present).
- Insert one new `ProjectUpdate` row per (project, observation date) not already present (dedupe on project_id+timestamp).
- Wrapped in a single DB transaction per run; on failure, log and roll back — the last good DB state stays live (no partial/corrupt writes reach the API).

Scheduling: APScheduler `BackgroundScheduler`, started from `app/main.py` alongside the FastAPI app, interval configurable via `REFRESH_INTERVAL_MINUTES` (default 360 = 6h — infra project data doesn't change minute to minute). Also runs once at startup so the DB isn't empty-of-real-data on first boot.

`scripts/refresh_data.py` is a thin CLI entry to the same job function, for manual/cron-external runs independent of the API process.

### 3. Frontend polling (`frontend/src/api/client.ts` + consuming pages)

Add a small `usePolling`-style helper (or `setInterval` in the existing data-fetch hook) that re-calls `api.getProjects()` / `api.getAlerts()` every `POLL_INTERVAL_MS` (default 60s, configurable via `VITE_POLL_INTERVAL_MS`). Reuses the existing `fetchJson` fallback-on-error behavior — no new dependency, no change to the mock-data fallback contract. Pages already reading from `api.ts` get live updates automatically once this is added at the call site(s) currently doing a one-shot fetch.

## Error handling

- Connector fetch failure: job logs and skips this cycle; previous DB data remains untouched and served.
- ETL failure (bad file, schema mismatch): existing pipeline's own error handling/logging applies; job catches, logs, skips DB load for this cycle.
- DB load failure: transaction rolled back; no partial writes.
- Frontend poll failure: existing fallback-to-mock/previous-data behavior in `fetchJson` already covers this.

## Testing

- Unit test `db_loader.py` upsert logic against a small fixture parquet (new vs. existing project ids, duplicate observation dates).
- Integration test: run `synthetic_connector` → ETL → `db_loader` end-to-end against a temp sqlite DB, assert `Project`/`ProjectUpdate` row counts.
- Manual: start backend, confirm scheduler fires on startup and DB is populated from synthetic source; confirm `/api/v1/projects` reflects it.
- Frontend: manually verify polling triggers a refetch on the configured interval (devtools network tab) and that UI updates without a page reload.

## Out of scope

- Any actual scraping or automated fetching from `paimana-proj.mospi.gov.in`.
- Locating/confirming a specific data.gov.in or MoSPI open-data URL — user will supply this later; `http_connector.py` is a stub ready to receive it.
- Websocket/SSE push (\"realtime\" here means scheduled polling, per user decision).
