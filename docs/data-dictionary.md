# Canonical Data Dictionary: PAIMANA PredictIQ

> **Platform**: PAIMANA PredictIQ Architecture  
> **Version**: 1.0.0 (Canonical Standard)  
> **Author**: Data Research Lead, SIH 26103  

---

## 1. Project Overview & Standard Conventions

This document defines the canonical data dictionary for all entities and attributes used across the PAIMANA PredictIQ dataset. Attributes are standardized to ensure consistent types, ranges, validation constraints, and nullability across ingestion, storage, and machine learning pipelines.

### General Conventions
- **Currency**: Indian Rupees (₹) in **Crores** (1 Crore = 10,000,000 INR).
- **Dates**: ISO 8601 standard format (`YYYY-MM-DD`).
- **Snapshot Frequency**: Monthly (end of observation month).
- **Percentage Values**: Numeric float between `0.0` and `100.0` (or greater in cost overrun scenarios).

---

## 2. Entity Specifications & Field Dictionary

### 2.1 Project Core Metadata (`projects`)

| Field Name | Data Type | Nullable | Valid Values / Range | Source | Update Frequency | Description & Known Issues |
|---|---|---|---|---|---|---|
| `project_id` | Integer | No | Unique Integer > 0 | PAIMANA / OCMS Portal | Static / Project Creation | Primary key identifier assigned by MoSPI IPMD. *Known issue: Renumbered during major portal re-architectures.* |
| `name` | String(255) | No | Non-empty text | PAIMANA Portal / Flash Reports | Static | Official title of the infrastructure project. *Known issue: Slight naming variations between Flash Reports and CAG audits.* |
| `ministry_name` | String(150) | No | Standard Indian Ministry Names | Flash Reports / Public Dashboard | Static | Administrative Union Ministry overseeing project execution (e.g., Ministry of Railways). |
| `sector` | String(100) | No | `Road Transport`, `Railways`, `Power`, `Petroleum`, `Coal`, `Urban Development`, `Water Resources`, `Atomic Energy`, etc. | Flash Reports / Public Dashboard | Static | Economic sector classification. |
| `state_location` | String(100) | No | Standard Indian State / UT Name or `Multi-State` | Flash Reports / Public Dashboard | Static | Primary geographic state or UT where project is executed. |
| `budget` | Float | No | ≥ 150.0 (in ₹ Cr) | Flash Reports / Approval Orders | Static / Revision | Original sanctioned cost of project at CCEA approval. |
| `start_date` | Date | No | ISO Date (`YYYY-MM-DD`) | Flash Reports / Approval Orders | Static | Official date of project sanction or CCEA approval. |
| `end_date` | Date | Yes | ISO Date (`YYYY-MM-DD`) | Flash Reports / Approval Orders | Static | Original target date of commissioning set at project sanction. |
| `status` | String(50) | No | `in_progress`, `completed`, `delayed`, `stalled`, `shelved` | Flash Reports / Public Dashboard | Monthly | Operational execution status of the project. |
| `is_synthetic` | Boolean | No | `True`, `False` | System | Static | Flag distinguishing real government dataset records from simulated prototype records. |
| `created_at` | DateTime | No | ISO Timestamp | System | Static | Database entry record creation timestamp. |

---

### 2.2 Monthly Observation Snapshots (`project_updates`)

| Field Name | Data Type | Nullable | Valid Values / Range | Source | Update Frequency | Description & Known Issues |
|---|---|---|---|---|---|---|
| `update_id` | Integer | No | Unique Integer > 0 | System | Monthly | Primary key for project monthly observation snapshot. |
| `project_id` | Integer | No | FK to `projects.project_id` | System | Monthly | Foreign key linking update snapshot to parent project record. |
| `observation_month` | Date | No | First day of month (`YYYY-MM-01`) | Flash Reports / Public Dashboard | Monthly | Monthly observation period snapshot identifier. |
| `revised_cost` | Float | No | ≥ `original_cost` (in ₹ Cr) | Flash Reports | Monthly | Latest approved or anticipated project cost. *Known issue: Delayed official sanctioning of cost revisions.* |
| `revised_end_date` | Date | Yes | ISO Date (`YYYY-MM-DD`) | Flash Reports | Monthly | Latest target completion date estimated by PIU. |
| `cumulative_expenditure` | Float | No | 0.0 to `revised_cost` * 1.5 | Flash Reports / Public Dashboard | Monthly | Total actual expenditure incurred from start date up to observation month. |
| `physical_progress_pct` | Float | No | 0.0 to 100.0 | Flash Reports / Public Dashboard | Monthly | Subjective or milestone-weighted physical completion percentage reported by PIU. *Known issue: Non-linear reporting jumps.* |
| `financial_progress_pct` | Float | No | 0.0 to 200.0 | Derived | Monthly | Computed ratio: `(cumulative_expenditure / revised_cost) * 100`. |
| `time_overrun_months` | Float | No | ≥ 0.0 | Derived | Monthly | Computed delay: Months between `revised_end_date` and original `end_date`. |
| `cost_overrun_pct` | Float | No | ≥ 0.0 | Derived | Monthly | Computed percentage: `((revised_cost - original_cost) / original_cost) * 100`. |
| `delay_reason_category` | String(100) | Yes | `Land Acquisition`, `Environmental Clearance`, `Civil Works Delay`, `Fund Constraint`, `Law & Order`, `Vendor Failure`, `Scope Change` | Flash Reports / Parsing | Monthly | Standardized primary driver of delay recorded for the month. |
| `delay_narrative` | Text | Yes | Free text text block | Flash Reports / Restricted Portal | Monthly | Detailed textual remarks submitted by Project Implementation Unit. |

---

### 2.3 Milestone Tracking Records (`milestones`)

| Field Name | Data Type | Nullable | Valid Values / Range | Source | Update Frequency | Description & Known Issues |
|---|---|---|---|---|---|---|
| `milestone_id` | Integer | No | Unique Integer > 0 | System | Event-driven | Primary key for project milestone record. |
| `project_id` | Integer | No | FK to `projects.project_id` | System | Event-driven | Foreign key linking milestone to parent project. |
| `milestone_name` | String(255) | No | Non-empty text | Restricted Portal / Flash Reports | Static | Specific technical activity (e.g., Tendering, Land Transfer, Foundation, Girder Launching). |
| `original_target_date` | Date | No | ISO Date (`YYYY-MM-DD`) | Project Baseline | Static | Target date for milestone completion established at sanction. |
| `revised_target_date` | Date | Yes | ISO Date (`YYYY-MM-DD`) | Restricted Portal | Monthly | Revised schedule for milestone execution. |
| `actual_completion_date` | Date | Yes | ISO Date (`YYYY-MM-DD`) | Restricted Portal | Event-driven | Actual date milestone was completed and verified. |
| `status` | String(50) | No | `pending`, `achieved`, `delayed`, `missed` | Restricted Portal | Monthly | Execution status of milestone. |

---

### 2.4 ML Risk Predictions Log (`risk_predictions`)

| Field Name | Data Type | Nullable | Valid Values / Range | Source | Update Frequency | Description & Known Issues |
|---|---|---|---|---|---|---|
| `prediction_id` | Integer | No | Unique Integer > 0 | ML Inference Pipeline | Real-time / Scheduled | Primary key for recorded inference output. |
| `project_id` | Integer | No | FK to `projects.project_id` | System | Real-time / Scheduled | Foreign key linking prediction output to project. |
| `observation_month` | Date | No | ISO Date (`YYYY-MM-01`) | System | Scheduled | Data snapshot date used for feature input vector. |
| `cost_overrun_probability` | Float | No | 0.0 to 1.0 | ML Model Output | Scheduled | Model output: Likelihood of cost overrun > 10%. |
| `predicted_delay_months` | Float | No | ≥ 0.0 | ML Model Output | Scheduled | Model output: Estimated schedule delay in months. |
| `overall_risk_score` | Float | No | 0.0 to 1.0 | ML Risk Engine | Scheduled | Composite index combining cost, schedule, and issue severity. |
| `model_version` | String(50) | No | e.g., `xgb_cost_v1.2` | System | Scheduled | Unique identifier of ML model binary used for inference. |
| `predicted_at` | DateTime | No | ISO Timestamp | System | Scheduled | System timestamp when prediction was generated. |
