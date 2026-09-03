# Frontend Realtime Data Integration — Design

Date: 2026-09-03

## Context

The backend now serves real MoSPI project data (1775 projects) via a working REST API, but most frontend pages never call it — they read `MOCK_PROJECTS`/`MOCK_INTERVENTIONS`/`STATE_RISK_SUMMARY` directly from `frontend/src/data/mockData.ts`. Only `AlertsPage` and `ProjectDetailPage` correctly use `useQuery` + `api.ts`; `BenchmarksPage` uses `useQuery` but calls `fetch()` directly against a hardcoded `localhost:8000` URL instead of going through `api.ts`. This is user-visible: navigating the dashboard shows the old fictional 18-project data almost everywhere except the two pages already wired.

The user asked for the frontend to "use the data" and be "realtime." This spec covers only the data/realtime piece — a separate spec will cover the requested color palette redesign, sequenced after this ships (decided with the user: functional correctness first, visual polish second, as independent sub-projects).

## Survey of current state

| Page | Current data source | Needs |
|---|---|---|
| ProjectsPage | `MOCK_PROJECTS` directly | Wire to `api.getProjects()` via `useQuery`, polling |
| DashboardPage | Inline/no data hook found (static) | Wire to `api.getAnalyticsOverview()` via `useQuery`, polling |
| AnalyticsPage | No data (placeholder icon only) | Wire to `api.getSectorAnalytics()`/`getMinistryAnalytics()`, polling |
| AlertsPage | Already `useQuery` + `api.ts` | No change needed |
| InterventionsPage | `MOCK_INTERVENTIONS` via local `useState` | Wire to `api.getInterventions()` via `useQuery`, polling |
| ProjectDetailPage | Already `useQuery` + `api.ts` | No change needed |
| ScenariosPage | `MOCK_PROJECTS` for its project picker only | Wire picker to `api.getProjects()` (no polling — simulate is on-demand POST) |
| CopilotPage | `MOCK_PROJECTS` for its project-table context | Wire to `api.getProjects()` (no polling — query is on-demand POST) |
| RiskMapPage | `STATE_RISK_SUMMARY` (mock, no real state-level backend data exists) | Wire to `api.getGeographyAnalytics()`; state-level breakdown stays mock where the real dataset has no `state` field (per the earlier real-dataset-integration spec — real projects have no state), degrading gracefully via the existing merge-over-mock pattern |
| BenchmarksPage | `useQuery` but raw `fetch('http://localhost:8000...')` | Route through `api.ts` instead (respects `VITE_API_BASE_URL`, consistent error handling) |

## Design

### 1. Shared polling configuration

`frontend/src/api/queryClient.ts` (new file, extracted from the `QueryClient` currently inlined in `App.tsx`): defines one `QueryClient` with a default `refetchInterval: 30_000` (30s) and `refetchOnWindowFocus: true`, so every `useQuery` call in the app polls consistently without each page repeating the number. `App.tsx` imports this instead of constructing its own.

### 2. Extend `api.ts` with missing methods

Add to `frontend/src/api/client.ts`, following the existing `fetchJson<T>(endpoint, fallback)` pattern (real data merged/preferred, mock fallback on error/timeout — unchanged contract):
- `getAnalyticsOverview()` → `/analytics/overview`
- `getSectorAnalytics()` → `/analytics/sectors`
- `getMinistryAnalytics()` → `/analytics/ministries`
- `getGeographyAnalytics()` → `/analytics/geography`
- `getBenchmarks(dimension, sector)` → `/analytics/benchmarks?dimension=...&sector=...` (replaces `BenchmarksPage`'s inline fetch)

`getInterventions()` already exists in `api.ts` but currently returns `MOCK_INTERVENTIONS` as both endpoint call and fallback in one — verify it actually calls `/interventions` (per earlier review) and returns real data when available.

### 3. Per-page rewiring

Each of the 7 pages needing changes: replace `MOCK_*` array usage with a `useQuery({ queryKey: [...], queryFn: () => api.xxx() })` call (matching `AlertsPage`'s/`ProjectDetailPage`'s existing pattern exactly), using the shared `queryClient`'s default polling. Pages whose interaction is fundamentally on-demand (ScenariosPage's simulate button, CopilotPage's chat query) fetch project list data once via `useQuery` for their pickers/context, without needing polling to apply to the simulate/query actions themselves.

No changes to page layout/markup structure — this task is data-source swaps only, not a redesign (that's the separate palette spec).

### 4. Error handling

Unchanged from the existing pattern: `fetchJson`'s try/catch + 2.5s timeout already falls back to mock data on any network failure, so a backend outage degrades every page to its current mock-data behavior rather than crashing. No new error-handling code needed — extending the existing contract to more callers.

## Testing

Manual, per page: start both dev servers, confirm each rewired page renders real project names/costs (not the fictional 18), confirm Network tab shows periodic refetches (~30s) on pages using polling, confirm no console errors, confirm graceful mock fallback still works by briefly stopping the backend.

## Out of scope

- Color palette / visual redesign (separate spec, sequenced after this).
- WebSocket/SSE push — polling only, per earlier decision in this project's history.
- Backend changes — all needed endpoints already exist.
