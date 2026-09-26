# PAIMANA roadmap implementation and operating guide

The Intelligence workspace (`/intelligence`) implements the roadmap workflows. These are evidence-dependent capabilities, not a claim of 100% accuracy, provider uptime, or production certification. Missing data is shown as unavailable. Existing financial histories are not independent ground truth.

## Run locally

From the repository root:

```bash
.venv/bin/pip install -r backend/requirements.txt -r ml/requirements.txt
PYTHONPATH=backend .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In another terminal:

```bash
cd frontend
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/intelligence`. Vite proxies `/api` (including WebSockets) to the backend. Production Nginx has the same proxy. The PWA requires a production build and HTTPS or localhost; visit the field page online first so the app shell and project directory are cached. A remote phone needs HTTPS and an accessible server, not its own `localhost`.

The backend defaults to `backend/paimana.db`. Set `DATABASE_URL` to select another database. New evidence and action tables are additive. Local startup creates missing tables without deleting existing project data. An Alembic-managed database can apply revisions 0004 and 0005. Do not run initial migrations against an unversioned, already populated database: reconcile its baseline first. Revision 0005 also fixes historical migration/ORM drift. Its downgrade deliberately retains pre-existing columns.

## Features and evidence requirements

| Workflow | Implemented behavior | What must be supplied / validated |
|---|---|---|
| Sat-Inspect | Sentinel-2 / Landsat catalog search, bounded cloud-masked raster extraction, common-pixel NDVI/NDBI change, before/after images, durable evidence and discrepancy alerts; Sentinel-1 RTC common-orbit gamma-naught power and dB change | Surveyed polygon, same-sensor dated scene IDs, usable imagery. Sentinel-1 uses provider terrain-corrected RTC assets and requires a Planetary Computer account key; local terrain correction is not claimed. Spectral change is a review signal, not construction completion or fraud proof. |
| Documents / RAG | PDF/text upload, SHA-256 deduplication, page/chunk retrieval, source excerpts, bounded portfolio query planning against allowlisted database fields, Gemini grounded generation; original PDFs supplied to Gemini for multimodal analysis of selected-project documents | `GEMINI_API_KEY`; choose an enabled `GEMINI_MODEL`. Without it, local retrieval remains usable. Scanned PDFs need Gemini or external OCR; no fabricated OCR. At most two original PDFs and five retrieved chunks are sent per selected-project query. |
| Cost / climate twin | Sector BOM stress calculations, remaining-spend fraction, steel/cement/bitumen/diesel shocks, rain-day productivity buffers, portfolio aggregation, dated index comparison, configured feed refresh | Published index observations with matching geography and dates. BOMs/productivity are explicit assumptions, not exact liabilities. There is no built-in licensed IMD endpoint or autonomous government WPI scraper; an organization-approved normalized feed or imports are required. |
| Uncertainty / working ML | Actual saved tree-model inference, complete feature validation, persisted outputs/input provenance, exact CatBoost TreeSHAP attribution, artifact-fingerprinted model versions, model-specific split-conformal 90% bounds, censored Kaplan-Meier curves and conditional financial-year probability when supported by follow-up | All 18 measured features, correct units, same-model independent held-out outcome pairs (minimum 9), representative survival cohort. Existing historical composite risk records have no matching calibration and correctly show unavailable. Forecast skill on a deployment population still needs independent validation. |
| Escalations | Persisted review actions and audit, Telegram/WhatsApp/Slack/email adapters, provider acceptance/error history, idempotency keys, three urgency tiers, 24-hour signed single-use approve/reject links, scheduled CLI | Approved recipients, provider credentials, stable signing key, publicly reachable HTTPS API. CLI is dry-run unless `--send`. A provider accepting a request does not prove receipt. WhatsApp free-form messages require an allowed conversation window; approved business templates may be needed. |
| InfraScore | Verified-identity contractor records across ministries, on-time index, claims/INR 1,000 crore, payment days, delayed-package count, minimum-three-project score | Sourced contractor identity and delivery records. Agencies are not inferred to be contractors. Score is a disclosed on-time-delivery index, not a credit rating or automatic blacklist. |
| Field PWA | Installable shell, IndexedDB photo queue, local SHA-256, GPS accuracy checks, surveyed-polygon verification, receipt hash, capture/server timestamps, retry-safe synchronization, durable receipts, pause/resume and validated backup restore; connected milestone/progress entry | Browser camera/location/storage permissions and project polygon. Device GPS/time are not hardware attested. Hashes detect changed bytes, not stock photos; duplicate photos in a project are rejected. Offline edits are retained when sync fails. Background sync while the app is closed is not guaranteed. |
| English / Hindi voice | Browser dictation and speech synthesis, bilingual grounded answers; authenticated server-side Gemini Live proxy with PCM capture/playback, transcripts, interruption handling, ten-minute limit | Browser support and microphone permission. Live additionally needs `GEMINI_LIVE_MODEL` enabled on the configured account. No provider API key is exposed in the browser. |
| Executive dossier | Project PDF export with financial metadata, alerts, decisions, prediction-evidence availability and document hashes | Existing project records. PDF layout was rendered and visually checked. |

## Provider configuration

Copy relevant values from `.env.example` into the repository `.env`. Do not put provider keys into `VITE_*` variables or commit them.

- `OPERATOR_API_KEY`: required on write/paid-query routes when configured. Enter it in Connections; it is kept only in browser session storage. Non-development deployments reject writes if it is absent. This is a shared operator credential, not a complete government SSO/RBAC system.
- `PC_SDK_SUBSCRIPTION_KEY`: required to sign Sentinel-1 RTC assets. Optical open-data access does not require this key.
- `GEMINI_API_KEY`, `GEMINI_MODEL`, and optional `GEMINI_LIVE_MODEL`.
- `ACTION_SIGNING_KEY`: at least 32 random characters; changing it invalidates outstanding links.
- `PUBLIC_API_URL`: complete externally reachable HTTPS API base, such as `https://example.org/api/v1`.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`; optional `TELEGRAM_CHAT_ID_TIER_1/2/3` overrides.
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TO`, `WHATSAPP_GRAPH_VERSION`.
- `SLACK_WEBHOOK_URL`, or SMTP settings plus `ALERT_EMAIL_TO`.

An action link is a bearer credential: anyone holding it can record that one decision. GET displays the review page; only POST records the decision. This prevents email link scanners from approving an intervention. Replayed, expired, modified and already-final decisions are rejected. Ambiguous delivery failures are not retried automatically because the provider may have accepted the original request.

To inspect scheduled delivery candidates:

```bash
.venv/bin/python scripts/dispatch_escalations.py --channel telegram
```

Only after configuring approved recipients, schedule the same command with `--send`. It generates persistent evidence-review actions and deduplicates delivery by intervention/channel/day. No messages were sent during implementation; provider calls in tests were mocked. Tier 3 uses exposure above INR 500 crore or predicted delay above 180 days. Tier 2 requires three consecutive reporting months with increasing risk at both transitions and the same model version; missing months or different model versions do not establish deterioration. Other flagged records remain Tier 1.

### Normalized market feed

Set `MARKET_FEED_URL` to an approved HTTPS endpoint returning a JSON array. `MARKET_FEED_TOKEN` optionally adds bearer authorization. Refresh validates every row before committing; repeated rows are deduplicated. Example schema (replace all example values with sourced observations):

```json
[{"as_of":"2026-07-01","source":"Publisher, release and series identifier","region":"Maharashtra","steel":110,"cement":105,"bitumen":103,"diesel":108,"rain_days":12}]
```

Indices must be positive, on a consistent base, and compare the same region. Rain days represent the explicit scenario horizon; this is not an undocumented conversion from precipitation to delay.

### Calibration and inference

Use the forms in Prediction bounds, or `POST /api/v1/intelligence/model/predict` and `/calibration`. See `/api/v1/docs` for exact schemas. Feature units follow `ml/models/predictor.py` and `docs/feature-registry.md`; all features must be supplied through the API, without silent defaults. Saved model availability is checked. Old fabricated 95% bands and fixed calibration scores were removed.

Calibration JSON includes `model_version`, `target`, `source`, `held_out: true`, `pairs: [{"predicted": ..., "actual": ...}]`, and optional `survival: [{"duration_days": ..., "completed": true/false}]`. These are observed outcomes from independent held-out projects, never copies of the training set. Statistical exchangeability is an assumption the importer cannot certify. Dates/probabilities outside known support remain unavailable.

## Verification evidence

- Final full regression run: **111 Python tests passed** (`PYTHONPATH=backend:. .venv/bin/python -m pytest -q --disable-warnings`). Automated API tests exercise isolation, malformed uploads, duplicate documents/photos, cloud handling, cost arithmetic, sparse calibration rejection, survival censoring, geofencing, offline receipt idempotency, shared-key access checks, persistent decisions, action-token expiry/tampering/replay, provider-acceptance/failure history, real serialized model inference and PDF extraction.
- Seven frontend IndexedDB queue tests pass (`cd frontend && npm test`): retries, ambiguous commit recovery, concurrent sync, partial failures, pause/resume, receipt validation, duplicate protection and backup restore.
- Existing ML training, leakage, ETL, SHAP and architecture tests were run. Older API tests were updated for the intentional replacement of placeholder responses with stored evidence and explicit scenario inputs.
- TypeScript and Vite production build were run. Lint has two existing pagination effect warnings; no lint errors. Vite reports a large bundle warning.
- A real public Sentinel-2 scene was downloaded as a bounded raster window from Planetary Computer: `S2B_MSIL2A_20250127T051009_R019_T43PGQ_20250127T075517`, Bengaluru bbox `[77.58,12.97,77.59,12.98]`; 65,275 clear pixels were read. This verifies the adapter, not any project's reported progress. Sentinel-1 numeric/orbit handling has synthetic unit coverage; account-backed RTC retrieval is unverified. Landsat and cross-date comparisons still need live acceptance testing with supplied project evidence.
- A fresh SQLite Alembic upgrade was checked against ORM columns. PostgreSQL and Docker runtime have not been exercised here.
- No connected browser was available. Camera, microphone, PWA installation, airplane-mode reload/sync and narrow-screen visual behavior remain device acceptance checks.
- Gemini, Telegram, WhatsApp, Slack, SMTP and a real market feed were not exercised with account credentials. Their “configured” status is not a claim of connectivity.

Provider references: [Gemini generation](https://ai.google.dev/api/generate-content), [Gemini Live protocol](https://ai.google.dev/api/live), [Telegram Bot API](https://core.telegram.org/bots/api), [Planetary Computer signed assets](https://planetarycomputer.microsoft.com/docs/concepts/sas/), [Copernicus Sentinel-2 processing](https://sentiwiki.copernicus.eu/web/s2-processing).

## API contract changes

Risk results now read saved predictions and attribution rows. Unknown project IDs return 404; missing evidence returns an empty list rather than invented scores. Intervention GET requests never generate recommendations. Use POST /interventions/generate, then record a named review; final decisions reject replay. Scenario requests use database project IDs and explicit numeric shocks/duration changes instead of the old hardcoded scenario presets. Project progress and milestone records are durable and accessible in the field workspace.

The server used for final local smoke checks is on port 8001, with the preview proxy on port 4173 configured using PAIMANA_BACKEND_URL=http://127.0.0.1:8001. This avoids an unrelated existing service on port 8000. Local HTTP checks cover the app shell, manifest, intelligence status, real project directory, persistent record endpoints, cost twin and PDF response. Browser rendering and real-device acceptance remain unverified.
