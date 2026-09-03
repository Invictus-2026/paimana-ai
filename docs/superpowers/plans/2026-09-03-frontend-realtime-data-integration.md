# Frontend Realtime Data Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire every frontend page that currently reads mock data directly to the real backend API (with automatic mock fallback preserved), and add consistent 30-second polling so the dashboard reflects backend changes without a manual reload.

**Architecture:** Extend `frontend/src/api/client.ts` with the handful of missing typed fetch methods (analytics overview/sectors/ministries/geography/benchmarks), fix two real bugs found in the existing `getProjects`/`getAlerts` methods (a scale-mismatch bug in the mock-merge logic, and a shape mismatch in the alerts fallback), extract a shared `QueryClient` with default polling, then rewire 6 pages (DashboardPage, ProjectsPage, InterventionsPage, RiskMapPage, ScenariosPage, CopilotPage) plus fix BenchmarksPage's inconsistent direct-fetch call — each swap follows the same `useQuery` pattern already used correctly in `AlertsPage`/`ProjectDetailPage`. AnalyticsPage (an unrouted stub) and the color palette are explicitly out of scope.

**Tech Stack:** React, TypeScript, `@tanstack/react-query` (already installed and used correctly in 3 of 10 pages — this plan extends that existing pattern, not a new one), FastAPI backend (already serving all needed endpoints — no backend changes in this plan except where noted).

**Spec:** `docs/superpowers/specs/2026-09-03-frontend-realtime-data-design.md`

## Global Constraints

- Every page must degrade gracefully to mock data on backend failure (2.5s timeout, existing `fetchJson` contract) — never show a blank/broken page if the backend is down.
- Never claim real data where none exists: `RiskMapPage`'s state-level breakdown, `DashboardPage`'s trend chart and AI-insight narrative text have no real backend equivalent (real MoSPI projects have no `state` field and no time-series data, confirmed in the prior real-dataset-integration plan) — these stay mock-labeled, not silently wired to fake real-looking data.
- Polling interval: 30 seconds (`refetchInterval: 30_000`), applied via one shared `QueryClient` default, not repeated per page.
- `AnalyticsPage.tsx` (unrouted stub) is explicitly out of scope for this plan.
- Color palette / visual redesign is explicitly out of scope for this plan (separate spec).
- No backend changes except where a task explicitly says so (Task 5's `list_interventions` note is investigate-only, fix only if trivial and clearly scoped).

---

### Task 1: Shared QueryClient with default polling

**Files:**
- Create: `frontend/src/api/queryClient.ts`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Produces: `export const queryClient: QueryClient` — a `QueryClient` instance with `defaultOptions.queries: { retry: 1, refetchOnWindowFocus: true, refetchInterval: 30_000 }`. All later tasks' `useQuery` calls inherit this automatically (no per-call `refetchInterval` needed) since `App.tsx`'s `QueryClientProvider` uses this instance.

- [ ] **Step 1: Create the shared query client**

Create `frontend/src/api/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      refetchInterval: 30_000,
    },
  },
});
```

- [ ] **Step 2: Use it in App.tsx**

In `frontend/src/App.tsx`, find:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
```

Replace with:

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
```

Then find and delete the inline client construction:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

(the `<QueryClientProvider client={queryClient}>` JSX usage stays unchanged — it now references the imported instance).

- [ ] **Step 3: Verify the app builds**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/api/queryClient.ts frontend/src/App.tsx
git commit -m "feat(frontend): extract shared QueryClient with 30s default polling"
```

---

### Task 2: Fix two real bugs in client.ts, add missing analytics/benchmarks methods

**Files:**
- Modify: `frontend/src/api/client.ts`

**Interfaces:**
- Consumes: nothing new (extends the existing `fetchJson<T>(endpoint, fallback)` helper, unchanged signature).
- Produces: `api.getAnalyticsOverview()`, `api.getSectorAnalytics()`, `api.getMinistryAnalytics()`, `api.getGeographyAnalytics()`, `api.getBenchmarks(dimension: string, sector?: string)` — all return `Promise<any>` matching the existing untyped `GenericResponse` pattern used by `getAlerts`/`getInterventions` (the backend wraps everything in `{status, message, data}`; callers destructure `.data` themselves, matching `AlertsPage`'s existing `alertResponse?.data?.alerts` pattern). Also fixes `getProjects`'s mock-merge index bug and `getAlerts`'s fallback shape mismatch (both described below) — later tasks depend on both fixes being in place.

- [ ] **Step 1: Fix the `getProjects` mock-merge scale bug**

**The bug:** `data.map((p, idx) => { const mockMatch = MOCK_PROJECTS.find(m => m.id === p.id) || MOCK_PROJECTS[idx % MOCK_PROJECTS.length]; ...})` — with 1775 real projects and only 18 mock templates, `idx % 18` wraps around, so real projects visually inherit duplicate `nextMilestone`/`monthlyRiskHistory`/`scheduleDelayDays`/etc. from whichever of the 18 mock templates their index happens to land on. This isn't a crash, but it produces visibly repeating fake sub-data across ~99 real projects per template — worth fixing since this plan is about making real data actually look real.

In `frontend/src/api/client.ts`, find:

```typescript
  getProjects: async (): Promise<ProjectData[]> => {
    const data = await fetchJson<any[]>('/projects', []);
    if (data && Array.isArray(data) && data.length > 0) {
      // Map API entities if returned
      return data.map((p, idx) => {
        const mockMatch = MOCK_PROJECTS.find(m => m.id === p.id) || MOCK_PROJECTS[idx % MOCK_PROJECTS.length];
        return {
```

Replace the `mockMatch` line with a single fixed template (index 0) rather than a wrapping index — this is honest about the fact that fields with no real backing (milestone/trend data) are illustrative placeholders shared across all real projects, rather than pretending each real project has unique fake sub-data:

```typescript
  getProjects: async (): Promise<ProjectData[]> => {
    const data = await fetchJson<any[]>('/projects', []);
    if (data && Array.isArray(data) && data.length > 0) {
      // Map API entities if returned. Fields with no real backend equivalent
      // (nextMilestone, monthlyRiskHistory, topRiskDrivers, etc.) fall back to
      // a single shared illustrative template rather than a per-index mock
      // match, since with more real projects (1775) than mock templates (18)
      // an index-wrapped match produced misleading duplicate-looking fake data.
      return data.map((p) => {
        const mockMatch = MOCK_PROJECTS.find(m => m.id === p.id) || MOCK_PROJECTS[0];
        return {
```

(The rest of the `return {...mockMatch, id: p.id || ..., ...}` block is unchanged — only the `mockMatch` resolution line and the `map` callback's parameter list change.)

- [ ] **Step 2: Fix `getAlerts`'s fallback shape mismatch**

**The bug:** `AlertsPage.tsx` reads `alertResponse?.data?.alerts`, but `getAlerts: () => fetchJson('/alerts', MOCK_INTERVENTIONS)` falls back to `MOCK_INTERVENTIONS` — a flat array, not `{data: {alerts: [...]}}`. On a real backend failure, `alertResponse.data` is `undefined` on the flat array, so `alerts` silently becomes `[]` instead of gracefully showing mock alerts. `InterventionsPage` (Task 6) will hit the same shape expectation.

In `frontend/src/api/client.ts`, find:

```typescript
  getAlerts: () => fetchJson('/alerts', MOCK_INTERVENTIONS),
  getInterventions: () => fetchJson('/interventions', MOCK_INTERVENTIONS),
```

Replace with:

```typescript
  getAlerts: () => fetchJson('/alerts', { status: 'success', data: { alerts: MOCK_INTERVENTIONS } }),
  getInterventions: () => fetchJson('/interventions', { status: 'success', data: { interventions: MOCK_INTERVENTIONS } }),
```

(Verify against the actual backend response shape first — read `backend/app/api/v1/alerts.py`'s `list_alerts` handler's return statement and `backend/app/api/v1/interventions.py`'s `list_interventions` return statement to confirm the exact key name used inside `data` — e.g. it may be `data.alerts` vs `data.interventions` vs a bare list; match the fallback's shape to whatever the real endpoint actually returns so success and failure paths have identical shape for the calling page to destructure.)

- [ ] **Step 3: Add the missing analytics/benchmarks methods**

In `frontend/src/api/client.ts`, after the `getStateSummaries` line, add:

```typescript
  getAnalyticsOverview: () => fetchJson('/analytics/overview', { status: 'success', data: null }),
  getSectorAnalytics: () => fetchJson('/analytics/sectors', { status: 'success', data: { sectors: [] } }),
  getMinistryAnalytics: () => fetchJson('/analytics/ministries', { status: 'success', data: { ministries: [] } }),
  getGeographyAnalytics: () => fetchJson('/analytics/geography', { status: 'success', data: { geography: [] } }),
  getBenchmarks: (dimension: string, sector?: string) => {
    const params = new URLSearchParams({ dimension });
    if (sector && sector !== 'ALL') params.set('sector', sector);
    return fetchJson(`/analytics/benchmarks?${params.toString()}`, { status: 'success', data: null });
  },
```

(As in Step 2, verify the exact `data` sub-key names — `sectors`/`ministries`/`geography` — against the actual backend response shape in `backend/app/api/v1/analytics.py`'s `get_sector_analytics`/`get_ministry_analytics`/`get_geography_analytics` handlers before finalizing the fallback shapes, so success/failure shapes match exactly.)

- [ ] **Step 4: Verify the app builds**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/api/client.ts
git commit -m "fix(frontend): correct mock-merge and fallback-shape bugs, add analytics API methods"
```

---

### Task 3: Rewire ProjectsPage to real data

**Files:**
- Modify: `frontend/src/pages/ProjectsPage.tsx`

**Interfaces:**
- Consumes: `api.getProjects(): Promise<ProjectData[]>` (existing, fixed in Task 2).
- Produces: no new exports — internal rewiring only.

- [ ] **Step 1: Replace the direct `MOCK_PROJECTS` import with a `useQuery` call**

In `frontend/src/pages/ProjectsPage.tsx`, find:

```typescript
import { MOCK_PROJECTS, ProjectData } from '../data/mockData';
```

Replace with:

```typescript
import { ProjectData } from '../data/mockData';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
```

Inside the component body, after the existing `useState`/`useSearchParams` declarations, add:

```typescript
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });
```

- [ ] **Step 2: Replace every remaining `MOCK_PROJECTS` reference with `projects`**

Find each remaining usage of `MOCK_PROJECTS` in the file (the `ministries`/`sectors`/`states` `useMemo` derivations and the `filteredProjects` `useMemo`) and replace `MOCK_PROJECTS` with `projects`, adding `projects` to each hook's dependency array. For example:

```typescript
  const ministries = useMemo(() => Array.from(new Set(projects.map(p => p.ministry))), [projects]);
  const sectors = useMemo(() => Array.from(new Set(projects.map(p => p.sector))), [projects]);
  const states = useMemo(() => Array.from(new Set(projects.map(p => p.state))), [projects]);
```

And the `filteredProjects` block: change `return MOCK_PROJECTS.filter(...)` to `return projects.filter(...)`, and add `projects` to that `useMemo`'s dependency array alongside the existing filter/sort state dependencies.

- [ ] **Step 3: Verify the app builds**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new type errors, no remaining references to `MOCK_PROJECTS` in this file (`grep -n "MOCK_PROJECTS" frontend/src/pages/ProjectsPage.tsx` returns nothing).

- [ ] **Step 4: Manual verification**

Start both dev servers (`cd backend && .venv/bin/python3 -m uvicorn app.main:app --reload` and `cd frontend && npm run dev`), navigate to `/projects`, confirm real project names/ministries render (not the 18 fictional ones), confirm filter dropdowns populate from real data, confirm no console errors. Stop both servers when done.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ProjectsPage.tsx
git commit -m "feat(frontend): wire ProjectsPage to real API data with polling"
```

---

### Task 4: Rewire DashboardPage's real-backed stats, leave unbacked sections clearly mock

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`

**Interfaces:**
- Consumes: `api.getAnalyticsOverview()` (new, Task 2) — returns `{status, message, data: {total_projects, total_budget_cr, average_risk_score, active_alerts_count, at_risk_projects_count, total_cost_overrun_exposure_cr}}` per `AnalyticsOverviewResponse` (backend/app/schemas/paimana.py, unchanged by this plan). `api.getSectorAnalytics()` (new, Task 2) — returns grouped sector data matching `AnalyticsGroupItem[]` (category_name, project_count, total_budget_cr, average_risk_score, at_risk_count).
- Produces: no new exports.

- [ ] **Step 1: Read the full current file first**

Read `frontend/src/pages/DashboardPage.tsx` in full (486 lines) before editing — this plan was written having read only representative excerpts; confirm the exact JSX structure around `DASHBOARD_STATS`, `SECTOR_DISTRIBUTION`, and the other mock imports before changing them, since a 486-line file may have structure not fully captured here.

- [ ] **Step 2: Wire the top-level stat cards to `getAnalyticsOverview`**

Add the `useQuery` import and call:

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
```

```typescript
  const { data: overviewResponse } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: api.getAnalyticsOverview,
  });
  const overview = overviewResponse?.data;
```

Find every place `DASHBOARD_STATS.totalProjects`, `.originalCost`, `.revisedCost`, `.cumulativeExpenditure`, `.highRiskProjects` (and their `Sub`/`Change` companion strings) are rendered in JSX, and replace the primary numeric values with real data where a direct mapping exists, falling back to the mock value when `overview` is undefined (loading/error state) — e.g.:

```typescript
{overview ? overview.total_projects.toLocaleString() : DASHBOARD_STATS.totalProjects}
```

Map: `total_projects` → totalProjects card, `total_budget_cr` → originalCost card (format as `₹X Cr` — check the existing formatting helper used elsewhere in this file, e.g. for `MOCK_PROJECTS` budget display, and reuse it rather than inventing new formatting), `total_cost_overrun_exposure_cr` → informs the revisedCost card context, `at_risk_projects_count` → highRiskProjects card. The `*Sub`/`*Change` descriptive sub-text strings (e.g. "+ 2.4% from Mar 2026") have no real backend equivalent (no time-series data) — leave these as the existing mock strings, since inventing a fake percentage-change number would be worse than an honest static label.

- [ ] **Step 3: Wire the sector distribution chart to `getSectorAnalytics`**

```typescript
  const { data: sectorResponse } = useQuery({
    queryKey: ['sector-analytics'],
    queryFn: api.getSectorAnalytics,
  });
```

Find where `SECTOR_DISTRIBUTION` feeds the pie/bar chart (`PieChart`/`Pie` per the imports seen). Map the real response's array (verify the exact key from Task 2's Step 3 investigation — likely `sectorResponse?.data?.sectors`) into the same `{name, pct, count, color}` shape the chart component expects: `category_name` → `name`, `project_count` → `count`, compute `pct` as `(project_count / total_projects * 100).toFixed(1) + '%'` using the total from Step 2's `overview.total_projects`. Colors have no real backend equivalent — assign from a fixed palette array indexed by position (reuse `SECTOR_DISTRIBUTION`'s existing color values as the palette to cycle through, so real sector names get consistent-looking colors even though the specific color-to-sector mapping isn't semantically meaningful). If `sectorResponse` is loading/undefined, fall back to rendering `SECTOR_DISTRIBUTION` unchanged.

- [ ] **Step 4: Leave `OVERRUN_TRENDS`, `AI_INSIGHTS`, `RECENT_ALERTS`, `TOP_HIGH_RISK_PROJECTS` as mock, but label them**

These have no real backend equivalent (no time-series data for trends; no narrative-insight generator; `RECENT_ALERTS` could theoretically use `api.getAlerts()` but is a small, separable follow-up not required by this task — skip it here to keep this task's scope to what the brief specifies). `TOP_HIGH_RISK_PROJECTS` COULD be derived from the already-fetched `projects` data in a later task, but is out of scope here since DashboardPage doesn't currently fetch the full project list.

For each of these sections' rendering block, find the nearest heading/label JSX (e.g. a `<h3>` or section title) and add a small visual indicator that the content is illustrative, not live — e.g. append a `<span className="text-[10px] text-slate-400 font-normal ml-2">(sample data)</span>` next to the section heading. Keep this minimal — a one-line JSX addition per section, not a redesign (redesign is out of scope for this plan).

- [ ] **Step 5: Verify the app builds**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 6: Manual verification**

Start both dev servers, navigate to `/dashboard`, confirm the stat cards show real numbers (1775 total projects, real budget totals), confirm the sector chart reflects real sector groupings, confirm the "(sample data)" labels appear on the trend/insights/alerts sections, confirm no console errors. Stop both servers when done.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/DashboardPage.tsx
git commit -m "feat(frontend): wire DashboardPage stat cards and sector chart to real API data"
```

---

### Task 5: Investigate and rewire InterventionsPage

**Files:**
- Modify: `frontend/src/pages/InterventionsPage.tsx`
- Read (investigate only): `backend/app/api/v1/interventions.py`

**Interfaces:**
- Consumes: `api.getInterventions()` (existing, fallback shape fixed in Task 2).
- Produces: no new exports.

- [ ] **Step 1: Investigate the backend endpoint's real behavior**

Read `backend/app/api/v1/interventions.py`'s `list_interventions` handler in full. It's known (from prior investigation during planning) to hardcode `project_id = str(project_id) if project_id else "1"` and use hardcoded `mock_prediction`/`mock_trajectory` inputs regardless of which real project is asked about — meaning the endpoint currently returns generated recommendation text that isn't genuinely grounded in each real project's actual data. This is a pre-existing backend limitation, not something this frontend task should silently paper over.

**Decision point:** if fixing the backend to use real per-project data is a small, contained change (e.g. querying the real `Project.cost_overrun_pct`/`overall_risk_score` for the requested `project_id` instead of the hardcoded mock inputs), make that fix as part of this task. If it requires larger changes to `InterventionEngine` or touches the ML/risk-prediction subsystem in ways that go beyond a quick fix, leave the backend as-is and note this as a known limitation in your task report — do not attempt a large backend change inside what should be a frontend-focused task.

- [ ] **Step 2: Replace the local mock state with a `useQuery` + mutation**

In `frontend/src/pages/InterventionsPage.tsx`, find:

```typescript
import { MOCK_INTERVENTIONS, InterventionData } from '../data/mockData';
```

Replace with:

```typescript
import { InterventionData } from '../data/mockData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
```

Find:

```typescript
  const [interventions, setInterventions] = useState<InterventionData[]>(MOCK_INTERVENTIONS);

  const handleUpdateStatus = (id: string, newStatus: 'Approved' | 'Under Review' | 'Rejected') => {
    setInterventions(prev =>
      prev.map(item => item.id === id ? { ...item, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : item)
    );
  };
```

Replace with a `useQuery` for the list and a `useMutation` for status updates (matching the real `POST /interventions/{recommendation_id}/approve` endpoint from `backend/app/api/v1/interventions.py` — read that endpoint's exact request/response shape before wiring the mutation call):

```typescript
  const queryClient = useQueryClient();
  const { data: interventionsResponse } = useQuery({
    queryKey: ['interventions'],
    queryFn: api.getInterventions,
  });
  const interventions: InterventionData[] = interventionsResponse?.data?.interventions ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'Approved' | 'Under Review' | 'Rejected' }) => {
      // Adjust endpoint/payload to match the real backend contract read in Step 1
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/interventions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: newStatus, reviewer_name: 'Admin', reviewer_notes: '' }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    },
  });

  const handleUpdateStatus = (id: string, newStatus: 'Approved' | 'Under Review' | 'Rejected') => {
    updateStatusMutation.mutate({ id, newStatus });
  };
```

(Verify the exact request body shape against `ApprovalRequest` in `backend/app/api/v1/interventions.py` — it requires `new_status`, `reviewer_name`, `reviewer_notes` per the model seen during planning; adjust the mutation payload if the actual schema differs.)

- [ ] **Step 3: Verify the app builds**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 4: Manual verification**

Start both dev servers, navigate to `/interventions`, confirm real intervention data renders (or, if Step 1's investigation found the backend still returns generic recommendations, confirm this is at least now coming from the real API rather than static frontend mock data), test the approve/reject workflow updates state correctly, confirm no console errors. Stop both servers when done.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/InterventionsPage.tsx
# Include backend/app/api/v1/interventions.py only if Step 1's investigation led to a fix there
git commit -m "feat(frontend): wire InterventionsPage to real API data and approval mutation"
```

---

### Task 6: Rewire RiskMapPage, ScenariosPage, CopilotPage project pickers

**Files:**
- Modify: `frontend/src/pages/RiskMapPage.tsx`
- Modify: `frontend/src/pages/ScenariosPage.tsx`
- Modify: `frontend/src/pages/CopilotPage.tsx`

**Interfaces:**
- Consumes: `api.getProjects()` (existing, fixed in Task 2), `api.getGeographyAnalytics()` (new, Task 2).
- Produces: no new exports.

This task batches three smaller, same-shape changes — each page needs its `MOCK_PROJECTS`/`STATE_RISK_SUMMARY` usage replaced with a `useQuery` call, following the identical pattern from Task 3.

- [ ] **Step 1: RiskMapPage**

In `frontend/src/pages/RiskMapPage.tsx`, find:

```typescript
import { STATE_RISK_SUMMARY, StateRiskData } from '../data/mockData';
```

Replace with:

```typescript
import { STATE_RISK_SUMMARY, StateRiskData } from '../data/mockData';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
```

(`STATE_RISK_SUMMARY` import stays — per the Global Constraints, real MoSPI projects have no `state` field, so `getGeographyAnalytics()` will return a single "Unspecified" bucket for real data, not a genuine state-level breakdown. This page's map visualization stays mock-backed, but should now at least attempt the real call and clearly indicate when data is unspecified/mock rather than silently always using mock.)

Add:

```typescript
  const { data: geoResponse } = useQuery({
    queryKey: ['geography-analytics'],
    queryFn: api.getGeographyAnalytics,
  });
```

Find the component's main rendering logic that maps over `STATE_RISK_SUMMARY`. If `geoResponse?.data` contains more than one real state entry (i.e. the real dataset gained state data in the future), prefer it; otherwise fall back to `STATE_RISK_SUMMARY`:

```typescript
  const stateSummaries: StateRiskData[] = (geoResponse?.data?.geography?.length > 1)
    ? geoResponse.data.geography // shape may need adapting to StateRiskData — adjust based on actual AnalyticsGroupItem fields
    : STATE_RISK_SUMMARY;
```

(This is intentionally conservative — since geography data is known to be unavailable for real projects today, don't force a broken real-data path; the check for `.length > 1` guards against treating the single "Unspecified" bucket as real state data.)

- [ ] **Step 2: ScenariosPage**

In `frontend/src/pages/ScenariosPage.tsx`, find:

```typescript
import { MOCK_PROJECTS } from '../data/mockData';
```

Replace with:

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
```

Find:

```typescript
  const project = MOCK_PROJECTS.find(p => p.id === parseInt(selectedProjectId)) || MOCK_PROJECTS[0];
```

Replace with (adjust variable naming/placement to fit the actual surrounding component structure — read the file's full `useState`/`useSearchParams` setup first to place this correctly relative to `selectedProjectId`):

```typescript
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });
  const project = projects.find(p => p.id === parseInt(selectedProjectId)) || projects[0];
```

Find any other `MOCK_PROJECTS` references in the file (e.g. a project-picker dropdown) and replace with `projects`.

- [ ] **Step 3: CopilotPage**

In `frontend/src/pages/CopilotPage.tsx`, find:

```typescript
import { MOCK_PROJECTS } from '../data/mockData';
```

Replace with:

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
```

Read the file's actual usages of `MOCK_PROJECTS` (7 occurrences per the earlier grep) in full before editing — this page uses `MOCK_PROJECTS` as `tableProjects: typeof MOCK_PROJECTS` in a type position too, not just as data, so some replacements need `ProjectData[]` as the type instead of `typeof MOCK_PROJECTS`. Add:

```typescript
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });
```

Replace each data-usage occurrence of `MOCK_PROJECTS` with `projects`, and each type-position occurrence of `typeof MOCK_PROJECTS` with `ProjectData[]` (import `ProjectData` from `'../data/mockData'` if not already imported).

- [ ] **Step 4: Verify the app builds**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new type errors, no remaining `MOCK_PROJECTS` references in these 3 files.

- [ ] **Step 5: Manual verification**

Start both dev servers, navigate to `/map`, `/scenarios`, `/copilot` — confirm each page's project picker/dropdown shows real project names, confirm no console errors, confirm RiskMapPage's state visualization still renders (using mock data, since real geography data isn't available) without crashing. Stop both servers when done.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/RiskMapPage.tsx frontend/src/pages/ScenariosPage.tsx frontend/src/pages/CopilotPage.tsx
git commit -m "feat(frontend): wire RiskMapPage, ScenariosPage, CopilotPage project pickers to real API data"
```

---

### Task 7: Route BenchmarksPage through api.ts instead of a direct hardcoded fetch

**Files:**
- Modify: `frontend/src/pages/BenchmarksPage.tsx`

**Interfaces:**
- Consumes: `api.getBenchmarks(dimension, sector)` (new, Task 2).
- Produces: no new exports.

- [ ] **Step 1: Replace the inline fetch with the new api.ts method**

In `frontend/src/pages/BenchmarksPage.tsx`, find:

```typescript
  const { data, isLoading } = useQuery<{ data: BenchmarkData }>({
    queryKey: ['benchmarks', selectedDimension, selectedSectorFilter],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/api/v1/analytics/benchmarks?dimension=${selectedDimension}&sector=${selectedSectorFilter}`);
      return res.json();
    }
  });
```

Replace with:

```typescript
  const { data, isLoading } = useQuery<{ data: BenchmarkData }>({
    queryKey: ['benchmarks', selectedDimension, selectedSectorFilter],
    queryFn: () => api.getBenchmarks(selectedDimension, selectedSectorFilter),
  });
```

Add the import if not already present:

```typescript
import { api } from '../api/client';
```

This fixes the hardcoded `localhost:8000` (now respects `VITE_API_BASE_URL` like every other page), adds the 2.5s timeout + mock-fallback behavior other pages get for free, and picks up the shared 30s polling default from Task 1 automatically (previously this page had no polling at all, refetching only on `selectedDimension`/`selectedSectorFilter` changes).

- [ ] **Step 2: Verify the app builds**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 3: Manual verification**

Start both dev servers, navigate to `/benchmarks`, confirm data still renders correctly for each dimension filter, confirm Network tab shows requests going through the configured `API_BASE_URL` rather than a hardcoded URL, confirm no console errors. Stop both servers when done.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/BenchmarksPage.tsx
git commit -m "fix(frontend): route BenchmarksPage through api.ts for consistency and env-var support"
```

---

## Post-plan verification checklist

After all tasks complete:

```bash
cd frontend && npx tsc --noEmit  # full type check
cd frontend && grep -rn "MOCK_PROJECTS\|MOCK_INTERVENTIONS\|STATE_RISK_SUMMARY" src/pages/*.tsx
```

Expected: type check clean. The grep should show `STATE_RISK_SUMMARY` still referenced in `RiskMapPage.tsx` (intentional, no real geography data available) and nowhere else except `frontend/src/data/mockData.ts` itself (the definitions) and `frontend/src/api/client.ts` (the fallback usages from Task 2).

Manual end-to-end: start both dev servers, click through every route in the sidebar, confirm each shows real data where available and clearly-marked mock data where not, confirm the Network tab shows periodic ~30s background refetches on pages using polling, confirm stopping the backend causes graceful fallback to mock data (not a crash) on every page.
