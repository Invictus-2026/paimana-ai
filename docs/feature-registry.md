# Canonical Feature Registry: PAIMANA PredictIQ

> **System**: PAIMANA PredictIQ Machine Learning Engine  
> **Registry Version**: 1.0.0  
> **Total Registered Features**: 35  

---

## 1. Overview & Leakage Flag Legend

The feature registry catalogs all candidate features used for model training and inference. To guarantee point-in-time correctness, every feature is evaluated against strict availability timestamps ($t \le T_{\text{prediction}}$).

### Leakage Risk Classifications
- `NONE`: Feature is purely static or historical, available at project sanction.
- `LOW`: Feature is computed from past monthly snapshots ($t \le T$).
- `MEDIUM`: Requires strict temporal masking to avoid incorporating same-month post-hoc revisions.
- `HIGH (LEAKAGE RISK)`: Feature uses post-observation data or final project completion actuals. **MUST BE EXCLUDED FROM MODEL INPUTS**.

---

## 2. Comprehensive Feature Registry Table

| Feature Name | Feature Group | Definition & Purpose | Source Table | Calculation Formula / Pseudocode | Availability Time | Leakage Risk | Business Interpretation |
|---|---|---|---|---|---|---|---|
| `project_original_budget_cr` | Project | Approved baseline budget in ₹ Cr | `projects` | `df['original_cost']` | Sanction Time ($t=0$) | `NONE` | Initial capital sanctioned for project execution |
| `project_planned_duration_days` | Project | Total baseline duration planned | `projects` | `(planned_end_date - start_date).days` | Sanction Time ($t=0$) | `NONE` | Approved timeline commitment |
| `project_sector_code` | Sector | Industrial sector classification | `projects` | `df['sector']` | Sanction Time ($t=0$) | `NONE` | Infrastructure domain (Roads, Railways, Power) |
| `sector_historical_overrun_avg` | Sector | Mean historical cost overrun % for sector | `analytics` | `mean(cost_overrun_pct)` for sector prior to $T$ | Snapshot Time ($t=T$) | `LOW` | Historical cost instability index for the sector |
| `sector_historical_delay_avg_months` | Sector | Mean historical delay in months for sector | `analytics` | `mean(delay_duration_months)` for sector prior to $T$ | Snapshot Time ($t=T$) | `LOW` | Industry benchmark for delay vulnerability |
| `ministry_active_projects_count` | Ministry | Number of active projects under ministry | `projects` | `count(project_id)` for ministry at $T$ | Snapshot Time ($t=T$) | `LOW` | Executive workload and management bandwidth |
| `ministry_avg_completion_rate` | Ministry | On-time project completion ratio for ministry | `projects` | `on_time_count / total_completed` prior to $T$ | Snapshot Time ($t=T$) | `LOW` | Ministry operational execution capacity |
| `cost_current_revised_cr` | Cost | Latest approved/anticipated budget at $T$ | `project_updates` | `df['revised_cost']` at $t=T$ | Snapshot Time ($t=T$) | `LOW` | Current budget requirement after formal revisions |
| `cost_growth_pct` | Cost | % increase in budget over original sanction | Cost | `((revised_cost - original_cost) / original_cost) * 100` | Snapshot Time ($t=T$) | `LOW` | Level of budget expansion to date |
| `cost_cumulative_expenditure_cr` | Cost | Total capital spent up to snapshot $T$ | `project_updates` | `df['cumulative_expenditure']` at $t=T$ | Snapshot Time ($t=T$) | `LOW` | Actual funds drawn from treasury |
| `cost_expenditure_ratio` | Cost | Actual spent as % of original budget | Cost | `(cumulative_expenditure / original_cost) * 100` | Snapshot Time ($t=T$) | `LOW` | Capital consumption rate |
| `cost_acceleration_mom` | Cost | Month-over-month change in monthly burn rate | Cost | $\Delta (\Delta \text{Expenditure}_t)$ | Snapshot Time ($t=T$) | `LOW` | Sudden changes in cash drawdown velocity |
| `schedule_revised_end_date` | Schedule | Current anticipated completion date | `project_updates` | `df['revised_end_date']` at $t=T$ | Snapshot Time ($t=T$) | `LOW` | Latest target date for commissioning |
| `schedule_slippage_days` | Schedule | Delay between revised end date and original end date | Schedule | `(revised_end_date - planned_end_date).days` | Snapshot Time ($t=T$) | `LOW` | Cumulative schedule extension requested to date |
| `schedule_remaining_days` | Schedule | Days remaining until planned end date | Schedule | `(planned_end_date - observation_date).days` | Snapshot Time ($t=T$) | `LOW` | Time cushion remaining under original plan |
| `schedule_elapsed_pct` | Schedule | Time elapsed as % of planned duration | Schedule | `((observation_date - start_date) / planned_duration).days * 100` | Snapshot Time ($t=T$) | `LOW` | Timeline progress ratio |
| `progress_physical_pct` | Progress | Actual physical completion percentage | `project_updates` | `df['physical_progress_pct']` at $t=T$ | Snapshot Time ($t=T$) | `LOW` | Field physical work completed |
| `progress_gap_pct` | Progress | Difference between elapsed time % and physical progress % | Progress | `elapsed_duration_pct - physical_progress_pct` | Snapshot Time ($t=T$) | `LOW` | Lag between time spent and work completed |
| `progress_velocity_mom` | Progress | Month-over-month progress percentage gain | Progress | $\text{progress}_t - \text{progress}_{t-1}$ | Snapshot Time ($t=T$) | `LOW` | Monthly execution speed |
| `progress_trend_3m` | Progress | 3-month linear slope of physical progress | Progress | `LinearSlope(progress_{t-2:t})` | Snapshot Time ($t=T$) | `LOW` | Short-term momentum of execution |
| `progress_trend_6m` | Progress | 6-month linear slope of physical progress | Progress | `LinearSlope(progress_{t-5:t})` | Snapshot Time ($t=T$) | `LOW` | Medium-term momentum of execution |
| `milestone_total_planned` | Milestone | Number of milestones planned up to date $T$ | `milestones` | `count(milestone_id)` where target date $\le T$ | Snapshot Time ($t=T$) | `LOW` | Total key stage targets set for project |
| `milestone_achieved_count` | Milestone | Number of completed milestones at date $T$ | `milestones` | `count(milestone_id)` completed at or before $T$ | Snapshot Time ($t=T$) | `LOW` | Key stage targets successfully delivered |
| `milestone_slippage_rate` | Milestone | Ratio of missed/delayed milestones | Milestone | `(planned_milestones - achieved_milestones) / planned_milestones` | Snapshot Time ($t=T$) | `LOW` | Milestone execution reliability index |
| `temporal_project_age_months` | Temporal | Elapsed project age in months | Temporal | `(observation_date - start_date).days / 30.44` | Snapshot Time ($t=T$) | `LOW` | Maturity stage of project execution |
| `temporal_reporting_lag_days` | Temporal | Days between observation month and data entry | System | `(entry_date - observation_date).days` | Snapshot Time ($t=T$) | `LOW` | Administrative reporting lag |
| `historical_contractor_delay_score` | Historical | Average historical delay score for assigned contractor | `contractors` | `mean(delay_days)` for contractor prior to $T$ | Snapshot Time ($t=T$) | `LOW` | Vendor execution track record |
| `final_actual_cost_cr` | Cost Target | Final actual project cost at completion | `projects` | `df['actual_final_cost']` | Post-Completion ($t=T_{\text{final}}$) | `HIGH (LEAKAGE)` | **Target variable ONLY. Do NOT use as feature.** |
| `final_actual_end_date` | Schedule Target | Final actual completion date | `projects` | `df['actual_completion_date']` | Post-Completion ($t=T_{\text{final}}$) | `HIGH (LEAKAGE)` | **Target variable ONLY. Do NOT use as feature.** |
