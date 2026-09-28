# PAIMANA — 7-Minute Demo Video Script

**Goal:** Show a reviewer/judge the full breadth of the platform — real-data risk analytics, predictive AI, satellite/field intelligence, multilingual support, and the new Ollama-powered overrun explainability — in a tight, confident walkthrough.

**Format:** Screen recording, narrated voiceover. Timestamps are targets, not hard cuts — adjust pacing live but don't overrun a section by more than ~10s.

**Before recording:**
- Backend + frontend running locally, seeded with real project data.
- Ollama running with the configured model (`OLLAMA_MODEL` set) so the AI Overrun Analysis panel and the Copilot both respond live — no error states on camera.
- Pick 2–3 "hero" projects in advance (one high-risk/critical, one moderate, one on-track) so you're not hunting for good examples on camera.
- Have the language switcher ready to demo (English → Hindi) without fumbling.
- Close devtools/console unless intentionally showing a network call.

---

## 0:00–0:30 — Cold open & positioning (30s)

**Say:**
> "This is PAIMANA — an AI-driven early-warning system for India's public infrastructure projects. It ingests project-level cost, schedule, and progress data, predicts cost and time overruns before they happen, explains *why* using explainable ML and a local LLM, and turns those predictions into concrete interventions and alerts. Let's walk through it end to end."

**Show:** Login/landing → land on Dashboard.

---

## 0:30–1:30 — Dashboard (60s)

**Show:** `/dashboard`

**Say:**
> "The Dashboard is the portfolio-level command center. These KPIs — total projects, at-risk count, aggregate cost overrun exposure — are computed live from the backend, not hardcoded. This sector distribution chart shows where risk is concentrated, and this cost-overrun trend line comes from real monthly project trajectory data pulled from the API."

**Do:**
- Point out KPI tiles.
- Hover the sector pie chart (mention colors are cosmetic, values are real).
- Expand one chart fullscreen using the `ExpandableChartCard` control to show the interactive charting.
- Point at "Recent Alerts" if visible.

---

## 1:30–2:30 — Projects & Project Detail (60s)

**Show:** `/projects` → click into one high-risk project

**Say:**
> "Every project in the portfolio is listed here with sector, ministry, state, and live risk scoring. Let's drill into a high-risk project."

**Do (on Project Detail page):**
- Point out KPI cards: recorded cost overrun %, peak overrun, risk trend.
- Show the monthly trajectory chart (cost overrun over time).
- Show the Risk Assessment section — budget overrun, risk trajectory, utilisation rate — all computed from monthly snapshots.

**Say:**
> "And this is new: an AI Overrun Analysis panel, powered by a locally-hosted Ollama model."

**Do:**
- Click **Generate Analysis**.
- While it loads: *"This call sends the project's top SHAP-ranked risk factors — the actual features driving the ML model's prediction — to Ollama, which is instructed to reason only from those facts, never invent causes."*
- When it returns: read the **Reason**, **Prevention Steps**, and **Severity** badge aloud briefly.
- If severity is high/critical: *"And because severity crossed the threshold, this automatically raised a real alert into the alerts feed — closing the loop from prediction to action."*

---

## 2:30–3:30 — Analytics: Cost & Time Overrun Predictions (60s)

**Show:** `/analytics` → Cost Overrun sub-view

**Say:**
> "The Analytics module is where the prediction models really surface. This table ranks every project by predicted cost overrun percentage and financial exposure in crores, computed by a trained CatBoost classifier and regressor — not a placeholder."

**Do:**
- Sort by exposure or overrun %.
- Click **Explain** on a row — show the inline AI Overrun Analysis panel expanding directly in the table.
- Switch to the **Time / Schedule Overrun** sub-view.

**Say:**
> "Same idea for schedule delay — predicted delay in days and months, with severity classifications like Severe, Significant, or Minor Delay, and the same one-click Explain action."

---

## 3:30–4:15 — Benchmarks (45s)

**Show:** `/benchmarks`

**Say:**
> "Benchmarks compares projects against peer groups — same sector, similar budget band — so a 'high' risk score is judged relative to comparable projects, not a single global threshold. Every group here enforces a minimum sample size before showing a comparison, so we're not drawing conclusions from two or three data points."

**Do:** Point at sample-size guardrail text, milestone rate table.

---

## 4:15–5:00 — State Progress & India Map (45s)

**Show:** `/progress`

**Say:**
> "State Progress rolls the same risk data up geographically, using an interactive India map, so a reviewer can spot which states are carrying the most schedule or cost risk at a glance."

**Do:** Hover a couple of states, click into one to show the state-level breakdown.

---

## 5:00–5:45 — Interventions & Alerts (45s)

**Show:** `/interventions`

**Say:**
> "When risk crosses a threshold, the Intervention Engine generates a recommended action automatically — weighted by financial exposure and schedule slip — and logs it here alongside the alert. Operators can review, escalate, or mark these resolved, and every recommendation carries the evidence — recorded risk score, cost overrun percentage, and scoring method — that produced it, so decisions stay auditable."

**Do:** Show an alert card + its linked intervention recommendation, click to review/resolve if there's time.

---

## 5:45–6:30 — Intelligence Workspace (45s)

**Show:** `/intelligence`

**Say:**
> "This is the field intelligence workspace — where the platform ingests ground truth. It covers document evidence upload, satellite-based progress verification comparing before/after NDBI change against claimed physical progress, uncertainty-calibrated delay predictions, contractor performance tracking, dispatch logs, and field inspection capture with GPS and photo evidence — all offline-tolerant for field operators with poor connectivity."

**Do (pick 2 of these live, don't try all):**
- **Ask Copilot:** type or dictate a portfolio question (e.g. "which railway projects have the highest cost overrun in Gujarat?") and show the grounded, cited answer.
- **Satellite:** show a before/after comparison flag reporting-discrepancy alert if one exists.

---

## 6:30–7:00 — Multilingual & close (30s)

**Show:** Language switcher in the header

**Say:**
> "Finally, the entire interface — including the AI Copilot's responses — supports English, Hindi, Tamil, and Bengali, so this scales across states with different primary languages."

**Do:** Toggle language switcher, show one page (e.g. Dashboard or Projects) re-render in Hindi.

**Say (closing line):**
> "From raw project data, to explainable predictions, to automatic alerts and interventions — PAIMANA turns infrastructure monitoring from reactive reporting into proactive risk management. Thank you."

**Show:** Cut back to Dashboard or a title card.

---

## Recording checklist

- [ ] Ollama running and warmed up (first request can be slow — do a throwaway call before recording)
- [ ] Backend seeded with at least one high-risk, one medium, one on-track project
- [ ] Hero project(s) for the AI Overrun Analysis demo pre-verified to return a clean response
- [ ] Language switcher tested once before recording (no layout breakage in Hindi)
- [ ] Browser zoom/resolution set so text is legible at 1080p
- [ ] Notifications/other apps muted; only the app tab visible
- [ ] Mic levels checked; no long silences during page loads (talk over loading states)

## Timing summary

| Segment | Time | Duration |
|---|---|---|
| Cold open | 0:00–0:30 | 30s |
| Dashboard | 0:30–1:30 | 60s |
| Projects + Project Detail + AI Overrun Analysis | 1:30–2:30 | 60s |
| Analytics (Cost/Time Overrun Predictions) | 2:30–3:30 | 60s |
| Benchmarks | 3:30–4:15 | 45s |
| State Progress / India Map | 4:15–5:00 | 45s |
| Interventions & Alerts | 5:00–5:45 | 45s |
| Intelligence Workspace | 5:45–6:30 | 45s |
| Multilingual + Close | 6:30–7:00 | 30s |
| **Total** | | **7:00** |
