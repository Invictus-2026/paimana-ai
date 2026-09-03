# Real Dataset Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fictional 18-project synthetic dataset with the real 1775-project MoSPI dataset at `data/dataset/` across the ETL pipeline, database, ML training, and backend API, so the frontend (already built to merge live API data over mock fallbacks) displays real project names, ministries, sectors, and costs, and the ML model is trained on real cost-overrun outcomes.

**Architecture:** One-time batch load, not a live pipeline. `data/dataset/sector/ALL.csv` (the 1775-row master; `ministry/all ministry.csv` is a duplicate slice, not separately ingested) flows through the existing 16-stage ETL (`backend/app/data_pipeline/`) with new column aliases for its real headers, into `data/processed/`, then a new loader upserts it into the `projects` table. A new, separate cost-overrun-only training script (not a rewrite of the time-series-dependent `scripts/train_baselines.py`) trains on the same processed data. The FastAPI backend and React frontend need no structural changes — just new fields exposed end to end.

**Tech Stack:** Python 3.14, pandas/numpy/scikit-learn (not yet installed — first task installs them), FastAPI, SQLAlchemy, SQLite (`backend/paimana.db`), React/TypeScript frontend already in place.

**Spec:** `docs/superpowers/specs/2026-09-03-real-dataset-integration-design.md`

## Global Constraints

- Only `data/dataset/sector/ALL.csv` (or equivalently `ministry/all ministry.csv` — same 1775 projects) is ingested as raw input; the 27 per-ministry/per-sector single-category files are redundant subsets and are not separately loaded.
- No dates, physical progress, or delay-reason data exists in this dataset — never fabricate values for `start_date`, `end_date`, `physical_progress_pct`, `delay_reason_category`, or `state_location`; leave them `None`/unset.
- ML scope is cost-overrun only (`binary_cost_overrun`, `continuous_cost_overrun_percentage`). No delay/schedule targets, no Cox survival model, no chronological train/val/test split — use a random stratified split.
- The synthetic generator (`backend/app/data_pipeline/generate_raw_data.py`) and the hardcoded 18-project seed in `ProjectService.seed_initial_data_if_empty` are disconnected from the live data path (files can stay on disk, unused).
- Never silently invent fallback numbers for missing real fields — leave null rather than defaulting to a fabricated value, per the project's existing `is_synthetic` distinction.

---

### Task 1: Install pipeline and ML dependencies

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `ml/requirements.txt`

**Interfaces:**
- Produces: a working `backend/.venv` with `pandas`, `pyarrow`, `numpy`, `scikit-learn`, `joblib` importable — required by every later task in this plan.

- [ ] **Step 1: Confirm current gap**

Run: `cd backend && .venv/bin/python3 -c "import pandas"`
Expected: `ModuleNotFoundError: No module named 'pandas'` (confirms the gap this task fixes).

- [ ] **Step 2: Add missing packages to requirements files**

In `backend/requirements.txt`, add a new line:
```
pandas>=2.2.0
pyarrow>=15.0.0
```

In `ml/requirements.txt`, add a new line:
```
joblib>=1.3.0
```
(pandas/numpy/scikit-learn are already listed there; `pyarrow` goes in `backend/requirements.txt` since the ETL writing `.parquet` lives in `backend/app/data_pipeline/`.)

- [ ] **Step 3: Install into the backend venv**

Run:
```bash
cd backend
.venv/bin/pip install -r requirements.txt
.venv/bin/pip install -r ../ml/requirements.txt
```
Expected: all packages install successfully (pip dry-run already confirmed network/cache access works).

- [ ] **Step 4: Verify**

Run: `cd backend && .venv/bin/python3 -c "import pandas, numpy, sklearn, pyarrow, joblib; print('OK')"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add backend/requirements.txt ml/requirements.txt
git commit -m "chore: add pandas/pyarrow/joblib deps needed for data pipeline and ML"
```

---

### Task 2: Copy real dataset into `data/raw/` as canonical ETL input

**Files:**
- Create: `data/raw/paimana_projects_master.csv` (copy of `data/dataset/sector/ALL.csv`)

**Interfaces:**
- Consumes: `data/dataset/sector/ALL.csv` (already on disk, 1775 rows + 3-row header block).
- Produces: `data/raw/paimana_projects_master.csv` — the one file `run_ingestion_and_schema_validation` (Task 3) will pick up via its `raw_dir.glob("*.csv")` scan. `data/raw/` currently holds only a `.gitkeep`; the synthetic generator's old output files (if any were ever generated locally) are not present in git and are not touched here.

- [ ] **Step 1: Strip the title row so the file is a clean CSV with a real header line**

The source file has a stray first line (`"Sector Wise Projects"`) and a blank second line before the actual header on line 3. Write a small one-off script to do the copy correctly (not just `cp`, since the ETL's `pd.read_csv` should see the header as row 0):

```bash
cd /home/abishekraj/new-sih/paimana-ai
python3 -c "
import csv
with open('data/dataset/sector/ALL.csv', encoding='utf-8-sig', newline='') as f:
    rows = list(csv.reader(f))
# rows[0] = title, rows[1] = blank, rows[2] = header, rows[3:] = data
with open('data/raw/paimana_projects_master.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(rows[2])
    writer.writerows(rows[3:])
"
```

- [ ] **Step 2: Verify the output file**

Run: `head -3 data/raw/paimana_projects_master.csv && wc -l data/raw/paimana_projects_master.csv`
Expected: first line is `Sr.No.,Sector,Line Ministry,ProjectID,Project Name,"Original Cost\n(in Cr)",...` (or similar quoted multi-line header), and line count is 1776 (1 header + 1775 data rows).

- [ ] **Step 3: Commit**

```bash
git add data/raw/paimana_projects_master.csv
git commit -m "data: add real MoSPI project dataset as ETL raw input"
```

---

### Task 3: Add column aliases and whitespace normalization for the real dataset's headers

**Files:**
- Modify: `backend/app/data_pipeline/schema.py`
- Modify: `backend/app/data_pipeline/ingestion.py`
- Test: `backend/tests/test_data_pipeline_ingestion.py` (new)

**Interfaces:**
- Consumes: `CANONICAL_COLUMNS`, `COLUMN_ALIASES` from `schema.py` (existing); `flatten_and_map_columns(df, source_filename)` from `ingestion.py` (existing signature, `Tuple[pd.DataFrame, Dict[str, Any]]`).
- Produces: `flatten_and_map_columns` now also strips embedded newlines/extra whitespace from column names before alias lookup, so headers like `"Original Cost\n(in Cr)"` map correctly. `COLUMN_ALIASES` gains entries for the real dataset's exact header text (post-whitespace-normalization).

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_data_pipeline_ingestion.py`:

```python
"""Tests for real-dataset column alias mapping in the ETL ingestion stage."""

import pandas as pd
from app.data_pipeline.ingestion import flatten_and_map_columns


def test_real_dataset_headers_map_to_canonical_columns():
    """Real MoSPI CSV headers (with embedded newlines) must map to canonical names."""
    df = pd.DataFrame({
        "Sr.No.": [1],
        "Sector": ["Roads & Highways"],
        "Line Ministry": ["Ministry of Road Transport & Highways"],
        "ProjectID": ["617885"],
        "Project Name": ["Test Road Project"],
        "Original Cost\n(in Cr)": [302.88],
        "Latest Revised Cost\n(in Cr)": [302.88],
        "Expenditure (Cumm.)\n(in Cr)": [187.77],
    })

    mapped_df, schema_report = flatten_and_map_columns(df, "paimana_projects_master.csv")

    assert "project_id" in mapped_df.columns
    assert "project_name" in mapped_df.columns
    assert "ministry_name" in mapped_df.columns
    assert "sector" in mapped_df.columns
    assert "original_cost" in mapped_df.columns
    assert "revised_cost" in mapped_df.columns
    assert "cumulative_expenditure" in mapped_df.columns

    assert mapped_df["project_id"].iloc[0] == "617885"
    assert mapped_df["ministry_name"].iloc[0] == "Ministry of Road Transport & Highways"
    assert mapped_df["original_cost"].iloc[0] == 302.88
    assert mapped_df["revised_cost"].iloc[0] == 302.88
    assert mapped_df["cumulative_expenditure"].iloc[0] == 187.77

    # Sr.No. has no canonical mapping and should be reported unmapped, not dropped
    assert "Sr.No." in schema_report["unmapped_columns"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_data_pipeline_ingestion.py -v`
Expected: FAIL — columns like `original_cost` missing because `"Original Cost\n(in Cr)"` isn't in `COLUMN_ALIASES` and the embedded `\n` breaks any naive lookup.

- [ ] **Step 3: Add whitespace normalization in `flatten_and_map_columns`**

In `backend/app/data_pipeline/ingestion.py`, modify the column-cleaning loop. Find:

```python
    col_rename_dict = {}
    for col in initial_cols:
        # Check direct mapping
        clean_col = col.strip()
        if clean_col in COLUMN_ALIASES:
```

Replace with:

```python
    col_rename_dict = {}
    for col in initial_cols:
        # Check direct mapping (collapse embedded newlines/whitespace first,
        # since multi-line CSV headers like "Original Cost\n(in Cr)" are common
        # in real government export files)
        clean_col = " ".join(col.split())
        if clean_col in COLUMN_ALIASES:
```

And further down in the same function, the fallback dot-notation branch:

```python
        else:
            # Flatten nested dot-notation (e.g. financials.approved_budget_cr)
            tail_col = clean_col.split(".")[-1]
            if tail_col in COLUMN_ALIASES:
```

leave as-is (still works against the now-normalized `clean_col`).

- [ ] **Step 4: Add the real dataset's header aliases to `schema.py`**

In `backend/app/data_pipeline/schema.py`, add to `COLUMN_ALIASES` (insert near the existing cost/ministry/sector entries):

```python
    # Real MoSPI dataset headers (multi-line headers normalized to single spaces
    # by flatten_and_map_columns before this lookup)
    "ProjectID": "project_id",
    "Project Name": "project_name",
    "Line Ministry": "ministry_name",
    "Sector": "sector",
    "Original Cost (in Cr)": "original_cost",
    "Latest Revised Cost (in Cr)": "revised_cost",
    "Expenditure (Cumm.) (in Cr)": "cumulative_expenditure",
```

(Note: `"Sector": "sector"` already exists in the file from before — if so, don't duplicate the key; Python dict literals would just have the later one win, but avoid the redundant line for clarity.)

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_data_pipeline_ingestion.py -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/app/data_pipeline/schema.py backend/app/data_pipeline/ingestion.py backend/tests/test_data_pipeline_ingestion.py
git commit -m "feat(etl): map real MoSPI dataset headers to canonical columns"
```

---

### Task 4: Scope `feature_engineering.py` to skip date/progress-dependent features when those columns are entirely absent

**Files:**
- Modify: `backend/app/data_pipeline/feature_engineering.py`
- Test: `backend/tests/test_feature_engineering_snapshot.py` (new)

**Interfaces:**
- Consumes: `generate_derived_features(df: pd.DataFrame) -> pd.DataFrame` (existing signature, unchanged).
- Produces: same function, now checks whether `start_date`/`planned_end_date`/`observation_date`/`physical_progress_pct` are entirely null (a "snapshot dataset" with no temporal data) and, if so, computes only `cost_growth_percent` and `expenditure_ratio`, skipping the other 11 features (leaving them absent from the output rather than filled with misleading zeros). When temporal columns have real data (as with the old synthetic fixtures), behavior is unchanged — this must not break the existing 13-feature path.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_feature_engineering_snapshot.py`:

```python
"""Tests that feature engineering degrades gracefully on snapshot-only (no-date) data."""

import pandas as pd
import numpy as np
from app.data_pipeline.feature_engineering import generate_derived_features


def _snapshot_df():
    return pd.DataFrame({
        "project_id": ["1", "2"],
        "original_cost": [100.0, 200.0],
        "revised_cost": [120.0, 180.0],
        "cumulative_expenditure": [60.0, 90.0],
        "start_date": [pd.NaT, pd.NaT],
        "planned_end_date": [pd.NaT, pd.NaT],
        "revised_end_date": [pd.NaT, pd.NaT],
        "observation_date": [pd.NaT, pd.NaT],
        "physical_progress_pct": [np.nan, np.nan],
    })


def test_snapshot_dataset_computes_cost_features_only():
    df = generate_derived_features(_snapshot_df())

    assert "cost_growth_percent" in df.columns
    assert "expenditure_ratio" in df.columns
    assert df["cost_growth_percent"].iloc[0] == 20.0  # (120-100)/100 * 100
    assert df["expenditure_ratio"].iloc[0] == 60.0     # 60/100 * 100

    # Date/progress-dependent features must not be fabricated as misleading zeros
    for col in [
        "elapsed_duration_percent", "remaining_duration", "schedule_slippage",
        "progress_gap", "monthly_progress_change", "monthly_expenditure_change",
        "3_month_progress_trend", "6_month_progress_trend", "cost_acceleration",
        "expenditure_velocity", "milestone_slippage_rate",
    ]:
        assert col not in df.columns


def test_temporal_dataset_still_computes_all_13_features():
    df = pd.DataFrame({
        "project_id": ["1", "1"],
        "original_cost": [100.0, 100.0],
        "revised_cost": [110.0, 115.0],
        "cumulative_expenditure": [40.0, 55.0],
        "start_date": pd.to_datetime(["2024-01-01", "2024-01-01"]),
        "planned_end_date": pd.to_datetime(["2025-01-01", "2025-01-01"]),
        "revised_end_date": pd.to_datetime(["2025-02-01", "2025-02-01"]),
        "observation_date": pd.to_datetime(["2024-06-01", "2024-07-01"]),
        "physical_progress_pct": [40.0, 45.0],
    })

    result = generate_derived_features(df)

    assert "elapsed_duration_percent" in result.columns
    assert "schedule_slippage" in result.columns
    assert "milestone_slippage_rate" in result.columns
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_feature_engineering_snapshot.py -v`
Expected: FAIL on `test_snapshot_dataset_computes_cost_features_only` (currently all 13 features are always computed, so the date-dependent columns exist even when full of zeros/NaT-derived garbage).

- [ ] **Step 3: Add the snapshot-mode guard**

In `backend/app/data_pipeline/feature_engineering.py`, modify `generate_derived_features`. Find the function start:

```python
def generate_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 15: Computes 13 derived point-in-time features with strict target leakage validation."""
    logger.info("Computing derived temporal features...")
    df = df.copy()

    # Ensure dataset is sorted chronologically per project
    df = df.sort_values(by=["project_id", "observation_date"]).reset_index(drop=True)
```

Replace with:

```python
def generate_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 15: Computes derived point-in-time features with strict target leakage validation.

    Cost-based features (cost_growth_percent, expenditure_ratio) are always computed.
    Date/progress-dependent features are skipped entirely when the source dataset has
    no temporal data at all (a single-snapshot dataset), rather than emitting misleading
    zero/NaT-derived values for fields that were never actually observed.
    """
    logger.info("Computing derived temporal features...")
    df = df.copy()

    temporal_cols = ["start_date", "planned_end_date", "observation_date", "physical_progress_pct"]
    has_temporal_data = any(
        col in df.columns and df[col].notna().any() for col in temporal_cols
    )

    # Ensure dataset is sorted chronologically per project (no-op ordering if no dates)
    df = df.sort_values(by=["project_id", "observation_date"]).reset_index(drop=True)
```

Then find the cost feature block (features 1 and 2) and leave it unconditional — it already only depends on `original_cost`/`revised_cost`/`cumulative_expenditure`:

```python
    # 1. cost_growth_percent: Percentage change in total project cost over original budget
    df["cost_growth_percent"] = np.where(
        df["original_cost"] > 0,
        ((df["revised_cost"] - df["original_cost"]) / df["original_cost"]) * 100.0,
        0.0
    )

    # 2. expenditure_ratio: Actual expenditure as percentage of original budget
    df["expenditure_ratio"] = np.where(
        df["original_cost"] > 0,
        (df["cumulative_expenditure"] / df["original_cost"]) * 100.0,
        0.0
    )
```

Now find where feature 3 (`elapsed_duration_percent`) begins, through the end of the function (the `for proj_id, group in df.groupby(...)` loop and the final column assignments), and wrap that entire remaining block in `if has_temporal_data:`. Specifically, change:

```python
    # 3. elapsed_duration_percent: Time elapsed from start date to observation date as % of planned duration
    planned_duration_days = (df["planned_end_date"] - df["start_date"]).dt.days
```

to:

```python
    if not has_temporal_data:
        logger.info("No temporal data present (snapshot-only dataset) — skipping 11 date/progress-dependent features.")
        return df

    # 3. elapsed_duration_percent: Time elapsed from start date to observation date as % of planned duration
    planned_duration_days = (df["planned_end_date"] - df["start_date"]).dt.days
```

Everything from there to the existing `return df` at the end of the function stays exactly as-is (still runs unmodified when `has_temporal_data` is `True`).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_feature_engineering_snapshot.py -v`
Expected: PASS (both tests)

- [ ] **Step 5: Run full existing test suite to check nothing broke**

Run: `cd backend && .venv/bin/python3 -m pytest -v`
Expected: all pre-existing tests still PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/data_pipeline/feature_engineering.py backend/tests/test_feature_engineering_snapshot.py
git commit -m "feat(etl): skip date/progress-dependent features on snapshot-only datasets"
```

---

### Task 5: Run the ETL pipeline against the real dataset and verify output

**Files:**
- No new source files — this task runs the existing pipeline and inspects output.
- Modify: `backend/app/data_pipeline/runner.py` only if a bug surfaces (see Step 3 contingency).

**Interfaces:**
- Consumes: `run_etl_pipeline(raw_dir, interim_dir, processed_dir, docs_dir) -> Tuple[pd.DataFrame, Path]` (existing signature).
- Produces: `data/processed/project_monthly_dataset.parquet` populated with 1775 real projects — this is what Task 6's DB loader and Task 8's training script both read.

- [ ] **Step 1: Run the pipeline**

Run:
```bash
cd /home/abishekraj/new-sih/paimana-ai
backend/.venv/bin/python3 -c "
from pathlib import Path
from backend.app.data_pipeline.runner import run_etl_pipeline
df, out_path = run_etl_pipeline(
    raw_dir=Path('data/raw'),
    interim_dir=Path('data/interim'),
    processed_dir=Path('data/processed'),
    docs_dir=Path('docs'),
)
print(f'Rows: {len(df)}, Columns: {len(df.columns)}')
print(f'Output: {out_path}')
print(df[['project_id', 'project_name', 'original_cost', 'revised_cost', 'cost_growth_percent', 'expenditure_ratio']].head(3))
"
```

- [ ] **Step 2: Verify output**

Expected: `Rows: 1775` (or very close — a handful may be dropped by duplicate detection if `data/raw/` still contains other files from earlier synthetic test runs; if so, check `data/raw/` only contains `paimana_projects_master.csv` from Task 2). `cost_growth_percent`/`expenditure_ratio` populated with real-looking percentages (not all zero).

- [ ] **Step 3: If the run fails, diagnose against the specific stage**

Common failure points to check, in order:
- `normalize_costs` (Stage 9) casting `original_cost`/`revised_cost` to float — if any string cells have stray characters (e.g. commas as thousands separators), `pd.to_numeric(errors="coerce")` will silently produce NaN. Check: `df['original_cost'].isna().sum()` after the run — if nonzero, inspect `data/raw/paimana_projects_master.csv` for the offending rows and confirm whether the source CSV uses comma-formatted numbers (spot-checked in Task exploration: it does not — values like `302.88` appeared unformatted — but re-verify on the full file, not just the first few rows already sampled).
- `detect_anomalies_and_quality_flags` iterating with `.iterrows()` over 1775 rows — slow but should complete; not a correctness risk.
- If `data/raw/` accidentally contains leftover synthetic files, remove them (they were never committed to git per `data/raw/.gitkeep` being the only tracked entry, but check for local uncommitted files with `git status data/raw/`).

- [ ] **Step 4: Confirm the data quality report was generated**

Run: `cat docs/data-quality-report.md | head -40`
Expected: report shows schema mapping and missingness stats for the real dataset (dates/progress columns should show ~100% missing — expected and correct, not a bug).

- [ ] **Step 5: No commit needed for this task**

This task only runs existing code and verifies output; `data/processed/` and `data/interim/` are pipeline-generated artifacts. Check whether they're gitignored:

Run: `git check-ignore data/processed/project_monthly_dataset.parquet data/interim/01_ingested_raw.csv`

If NOT ignored (empty output), add them to `.gitignore` (they're regeneratable from `data/raw/` + the pipeline, per the existing `data/raw/` "immutable raw, generated processed" convention already implied by the directory structure):

```bash
cd /home/abishekraj/new-sih/paimana-ai
cat >> .gitignore << 'EOF'

# ETL pipeline generated artifacts (regenerate via run_etl_pipeline)
data/interim/*
data/processed/*
!data/interim/.gitkeep
!data/processed/.gitkeep
EOF
git add .gitignore
git commit -m "chore: gitignore ETL-generated interim/processed data artifacts"
```
(Skip this step entirely if they're already ignored.)

---

### Task 6: Add `revised_cost`, `cumulative_expenditure`, `external_project_id` columns to the `Project` model

**Files:**
- Modify: `backend/app/models/entities.py`
- Modify: `backend/app/schemas/paimana.py`
- Create: `backend/alembic/versions/0002_add_real_dataset_columns.py`
- Test: `backend/tests/test_project_model_columns.py` (new)

**Interfaces:**
- Consumes: existing `Project` ORM class, `ProjectBase`/`ProjectResponse` Pydantic schemas.
- Produces: `Project.revised_cost: float`, `Project.cumulative_expenditure: float`, `Project.external_project_id: Optional[str]` (indexed, unique — the real dataset's `ProjectID` field, used by Task 7's loader to make re-runs idempotent). `ProjectBase`/`ProjectResponse` gain matching optional fields so the API can serialize them.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_project_model_columns.py`:

```python
"""Tests that Project model exposes the new real-dataset cost/identity columns."""

from app.models.entities import Project


def test_project_has_real_dataset_columns(db_session):
    project = Project(
        name="Test Project",
        external_project_id="617885",
        budget=302.88,
        revised_cost=302.88,
        cumulative_expenditure=187.77,
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    assert project.external_project_id == "617885"
    assert project.revised_cost == 302.88
    assert project.cumulative_expenditure == 187.77
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_project_model_columns.py -v`
Expected: FAIL with `TypeError: 'revised_cost' is an invalid keyword argument for Project` (or similar — the columns don't exist yet).

- [ ] **Step 3: Add columns to the ORM model**

In `backend/app/models/entities.py`, in the `Project` class, find:

```python
    overall_risk_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    cost_overrun_pct: Mapped[float] = mapped_column(Float, default=0.0)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)
```

Replace with:

```python
    overall_risk_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    cost_overrun_pct: Mapped[float] = mapped_column(Float, default=0.0)
    revised_cost: Mapped[float] = mapped_column(Float, default=0.0)
    cumulative_expenditure: Mapped[float] = mapped_column(Float, default=0.0)
    external_project_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, unique=True, index=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_project_model_columns.py -v`
Expected: PASS

- [ ] **Step 5: Run full existing backend test suite**

Run: `cd backend && .venv/bin/python3 -m pytest -v`
Expected: all PASS (these tests use `Base.metadata.create_all` via `conftest.py`, so the new columns are picked up automatically for the in-memory test DB).

- [ ] **Step 6: Update Pydantic schemas to expose the new fields**

In `backend/app/schemas/paimana.py`, find:

```python
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    sector: Optional[str] = "Road Transport & Highways"
    ministry: Optional[str] = "MoRTH"
    state: Optional[str] = "Maharashtra"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float = 0.0
    status: str = "active"
    overall_risk_score: float = 0.0
    cost_overrun_pct: float = 0.0
    is_synthetic: bool = False
```

Replace with:

```python
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    sector: Optional[str] = "Road Transport & Highways"
    ministry: Optional[str] = "MoRTH"
    state: Optional[str] = "Maharashtra"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float = 0.0
    status: str = "active"
    overall_risk_score: float = 0.0
    cost_overrun_pct: float = 0.0
    revised_cost: float = 0.0
    cumulative_expenditure: float = 0.0
    external_project_id: Optional[str] = None
    is_synthetic: bool = False
```

(`ProjectResponse` inherits `ProjectBase` and needs no separate edit.)

- [ ] **Step 7: Generate the alembic migration**

Create `backend/alembic/versions/0002_add_real_dataset_columns.py`:

```python
"""Add revised_cost, cumulative_expenditure, external_project_id to projects.

Revision ID: 0002_add_real_dataset_columns
Revises: 0001_initial_schema
Create Date: 2026-09-03 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0002_add_real_dataset_columns'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('revised_cost', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('projects', sa.Column('cumulative_expenditure', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('projects', sa.Column('external_project_id', sa.String(length=50), nullable=True))
    op.create_index(op.f('ix_projects_external_project_id'), 'projects', ['external_project_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_projects_external_project_id'), table_name='projects')
    op.drop_column('projects', 'external_project_id')
    op.drop_column('projects', 'cumulative_expenditure')
    op.drop_column('projects', 'revised_cost')
```

Note: `backend/paimana.db` (the committed dev DB) was created via `Base.metadata.create_all`, not via alembic history, so this migration file exists for schema-history correctness but the actual dev DB update happens by re-running `create_all` (already automatic on app startup per `main.py`) or by deleting `paimana.db` and letting Task 7's loader recreate it fresh.

- [ ] **Step 8: Commit**

```bash
git add backend/app/models/entities.py backend/app/schemas/paimana.py backend/alembic/versions/0002_add_real_dataset_columns.py backend/tests/test_project_model_columns.py
git commit -m "feat(db): add revised_cost, cumulative_expenditure, external_project_id columns"
```

---

### Task 7: Build the real-dataset loader and replace the fictional 18-project seed

**Files:**
- Create: `backend/app/data_pipeline/db_loader.py`
- Modify: `backend/app/services/project_service.py`
- Create: `scripts/load_real_dataset.py`
- Test: `backend/tests/test_db_loader.py` (new)

**Interfaces:**
- Consumes: a `pd.DataFrame` matching the processed ETL output schema (columns include `project_id`, `project_name`, `ministry_name`, `sector`, `original_cost`, `revised_cost`, `cumulative_expenditure`, `cost_growth_percent`); a SQLAlchemy `Session`.
- Produces: `load_projects_from_dataframe(db: Session, df: pd.DataFrame) -> int` (returns count of projects created-or-updated) in `db_loader.py`. `ProjectService.seed_initial_data_if_empty` calls this instead of building the hardcoded 18-project list. `scripts/load_real_dataset.py` is a CLI entry point that runs the full ETL then calls the loader, for one-time manual execution.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_db_loader.py`:

```python
"""Tests for loading real dataset rows into the Project table."""

import pandas as pd
from app.data_pipeline.db_loader import load_projects_from_dataframe
from app.models.entities import Project


def _sample_df():
    return pd.DataFrame({
        "project_id": ["617885", "400010"],
        "project_name": ["Test Road Project", "Test Airport Project"],
        "ministry_name": ["Ministry of Road Transport & Highways", "Ministry of Civil Aviation"],
        "sector": ["Roads & Highways", "Aviation & Aviation Infrastructure"],
        "original_cost": [302.88, 480.0],
        "revised_cost": [302.88, 640.0],
        "cumulative_expenditure": [187.77, 512.55],
        "cost_growth_percent": [0.0, 33.33],
    })


def test_load_creates_projects(db_session):
    count = load_projects_from_dataframe(db_session, _sample_df())

    assert count == 2
    projects = db_session.query(Project).order_by(Project.external_project_id).all()
    assert len(projects) == 2
    assert projects[0].external_project_id == "400010"
    assert projects[0].name == "Test Airport Project"
    assert projects[0].ministry == "Ministry of Civil Aviation"
    assert projects[0].budget == 480.0
    assert projects[0].revised_cost == 640.0
    assert projects[0].cumulative_expenditure == 512.55
    assert round(projects[0].cost_overrun_pct, 2) == 33.33
    assert projects[0].is_synthetic is False


def test_load_is_idempotent_on_rerun(db_session):
    df = _sample_df()
    load_projects_from_dataframe(db_session, df)
    count_second_run = load_projects_from_dataframe(db_session, df)

    assert count_second_run == 2
    assert db_session.query(Project).count() == 2  # no duplicate rows created


def test_load_updates_existing_project_on_rerun_with_changed_cost(db_session):
    df = _sample_df()
    load_projects_from_dataframe(db_session, df)

    updated_df = df.copy()
    updated_df.loc[updated_df["project_id"] == "617885", "revised_cost"] = 350.0
    load_projects_from_dataframe(db_session, updated_df)

    project = db_session.query(Project).filter_by(external_project_id="617885").first()
    assert project.revised_cost == 350.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_db_loader.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.data_pipeline.db_loader'`

- [ ] **Step 3: Implement the loader**

Create `backend/app/data_pipeline/db_loader.py`:

```python
"""Loads processed real-dataset rows into the Project table.

Idempotent: matches existing rows by external_project_id (the source dataset's
ProjectID) so re-running the loader updates existing projects rather than
duplicating them.
"""

import logging
import pandas as pd
from sqlalchemy.orm import Session

from app.models.entities import Project

logger = logging.getLogger("PAIMANA_ETL.DBLoader")


def _compute_risk_score(cost_growth_percent: float) -> float:
    """Rule-based placeholder risk score derived from cost overrun magnitude,
    pending a trained ML model's predicted risk (see ml/models/predictor.py).
    Clips cost growth of 0-50% onto a 0.0-1.0 scale; not a validated risk model.
    """
    if pd.isna(cost_growth_percent):
        return 0.0
    return max(0.0, min(1.0, float(cost_growth_percent) / 50.0))


def load_projects_from_dataframe(db: Session, df: pd.DataFrame) -> int:
    """Upserts processed dataset rows into the projects table.

    Args:
        db: active SQLAlchemy session.
        df: processed DataFrame with columns project_id, project_name,
            ministry_name, sector, original_cost, revised_cost,
            cumulative_expenditure, cost_growth_percent.

    Returns:
        Number of projects created or updated.
    """
    existing = {
        p.external_project_id: p
        for p in db.query(Project).filter(Project.external_project_id.isnot(None)).all()
    }

    count = 0
    for _, row in df.iterrows():
        ext_id = str(row["project_id"])
        cost_growth_pct = row.get("cost_growth_percent")
        if pd.isna(cost_growth_pct):
            original = row.get("original_cost") or 0.0
            revised = row.get("revised_cost") or 0.0
            cost_growth_pct = ((revised - original) / original * 100.0) if original else 0.0

        project = existing.get(ext_id)
        if project is None:
            project = Project(external_project_id=ext_id, is_synthetic=False)
            db.add(project)

        project.name = str(row["project_name"])
        project.ministry = str(row.get("ministry_name") or "Unknown")
        project.sector = str(row.get("sector") or "Unknown")
        project.budget = float(row.get("original_cost") or 0.0)
        project.revised_cost = float(row.get("revised_cost") or 0.0)
        project.cumulative_expenditure = float(row.get("cumulative_expenditure") or 0.0)
        project.cost_overrun_pct = float(cost_growth_pct)
        project.overall_risk_score = _compute_risk_score(cost_growth_pct)
        project.status = "active"

        count += 1

    db.commit()
    logger.info(f"Loaded {count} real projects into the database.")
    return count
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_db_loader.py -v`
Expected: PASS (all 3 tests)

- [ ] **Step 5: Replace the hardcoded seed in `ProjectService`**

In `backend/app/services/project_service.py`, find the entire `seed_initial_data_if_empty` method (from `@staticmethod\n    def seed_initial_data_if_empty(db: Session):` through its closing, including the alert/intervention creation that follows the project list — read the full method in the file before editing to capture its exact end boundary) and replace the project-list-building portion. Specifically find:

```python
    @staticmethod
    def seed_initial_data_if_empty(db: Session):
        """Seed initial database records if project table is empty."""
        if db.query(Project).count() == 0:
            sample_projects = [
```

...through the line:

```python
            db.add_all(sample_projects)
            db.commit()
```

Replace that whole span with:

```python
    @staticmethod
    def seed_initial_data_if_empty(db: Session):
        """Seed initial database records if project table is empty.

        Loads the real MoSPI project dataset from the pipeline's processed
        output (data/processed/project_monthly_dataset.parquet) rather than
        fictional sample data. If the processed dataset doesn't exist yet
        (pipeline never run), leaves the table empty rather than fabricating
        placeholder projects.
        """
        if db.query(Project).count() == 0:
            from pathlib import Path
            import pandas as pd
            from app.data_pipeline.db_loader import load_projects_from_dataframe

            processed_path = Path("data/processed/project_monthly_dataset.parquet")
            if not processed_path.exists():
                logger.warning(
                    f"{processed_path} not found — skipping seed. "
                    "Run scripts/load_real_dataset.py to populate real project data."
                )
                return

            df = pd.read_parquet(processed_path)
            load_projects_from_dataframe(db, df)
            return
```

Leave the alert/intervention-creation code that originally followed the sample project list (`a1 = Alert(...)` etc.) — check whether it references `sample_projects[0].id` or similar; if it hardcodes references to the now-removed fictional projects (e.g. `project_id=1` assuming "Mumbai Metro Line 7A" exists), remove that seed-alert block too, since there's no guaranteed project id 1 in the real data and fabricating an alert against an arbitrary real project would be misleading. Read the method's full original body first to confirm exactly what follows before deciding what to keep.

Add the missing import at the top of the file if not already present:
```python
import logging
logger = logging.getLogger("PAIMANA_API.ProjectService")
```
(Check whether `project_service.py` already imports `logging`/defines a logger before adding — most files in this codebase already follow this pattern via `from app.utils.logging import logger`; prefer reusing that existing shared logger if it's already imported elsewhere in the file, to match codebase convention rather than creating a second logger instance.)

- [ ] **Step 6: Create the one-time manual load script**

Create `scripts/load_real_dataset.py`:

```python
"""One-time script: runs the ETL pipeline against the real MoSPI dataset
and loads the result into the projects database.

Usage:
    cd backend && .venv/bin/python3 -m scripts.load_real_dataset
(run from the repo root with backend/ on the path, or adjust PYTHONPATH)
"""

import logging
from pathlib import Path

from backend.app.data_pipeline.runner import run_etl_pipeline
from backend.app.data_pipeline.db_loader import load_projects_from_dataframe
from backend.app.database import SessionLocal, Base, engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("PAIMANA.LoadRealDataset")


def main():
    Base.metadata.create_all(bind=engine)

    df, _ = run_etl_pipeline(
        raw_dir=Path("data/raw"),
        interim_dir=Path("data/interim"),
        processed_dir=Path("data/processed"),
        docs_dir=Path("docs"),
    )

    db = SessionLocal()
    try:
        count = load_projects_from_dataframe(db, df)
        logger.info(f"Successfully loaded {count} real projects into the database.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
```

- [ ] **Step 7: Run the script against the real data end to end**

Run: `cd /home/abishekraj/new-sih/paimana-ai && backend/.venv/bin/python3 -m scripts.load_real_dataset`
Expected: log output ending in "Successfully loaded 1775 real projects into the database." (or close to it, per Task 5's actual row count).

- [ ] **Step 8: Verify via sqlite directly**

Run:
```bash
cd backend
.venv/bin/python3 -c "
import sqlite3
con = sqlite3.connect('paimana.db')
print(con.execute('SELECT COUNT(*) FROM projects').fetchone())
print(con.execute('SELECT name, ministry, sector, budget, revised_cost, cost_overrun_pct FROM projects LIMIT 3').fetchall())
"
```
Expected: real project names/ministries, non-fictional data.

- [ ] **Step 9: Run full backend test suite**

Run: `cd backend && .venv/bin/python3 -m pytest -v`
Expected: all PASS. Note: `test_get_project_by_id` in `test_projects.py` asserts `data["id"] == 1` — since tests use an isolated in-memory DB seeded fresh per test via `seed_initial_data_if_empty`, and that now depends on `data/processed/project_monthly_dataset.parquet` existing on disk (it does, from Task 5), the first project loaded will get id 1 by autoincrement regardless of which real project it is — this test should still pass unmodified. If it fails, check whether `data/processed/project_monthly_dataset.parquet`'s row order is deterministic between pipeline runs (it is, since `run_normalization_pipeline` sorts by `project_id`).

- [ ] **Step 10: Commit**

```bash
git add backend/app/data_pipeline/db_loader.py backend/app/services/project_service.py scripts/load_real_dataset.py backend/tests/test_db_loader.py
git commit -m "feat(db): load real MoSPI dataset into projects table, replacing fictional seed data"
```

---

### Task 8: Build the cost-overrun-only ML training script

**Files:**
- Create: `scripts/train_cost_overrun_model.py`
- Test: `backend/tests/test_train_cost_overrun_model.py` (new) — tests the extracted pure functions, not the full script run (which needs the real processed dataset on disk and is verified manually in Step 5).

**Interfaces:**
- Consumes: `data/processed/project_monthly_dataset.parquet` (from Task 5); `generate_binary_cost_overrun`, `generate_continuous_cost_overrun_percentage` from `ml/features/target_generation.py` (existing, unchanged signatures).
- Produces: `build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame` and `stratified_split(X, y, test_size=0.2, random_state=42) -> Tuple[...]` as testable pure functions in the new script; `models/baseline/cost_overrun_classifier.joblib` and `models/baseline/cost_overrun_regressor.joblib` as script output; `reports/cost-overrun-baseline-results.json` as metrics output.

- [ ] **Step 1: Write the failing test for feature matrix construction**

Create `backend/tests/test_train_cost_overrun_model.py`:

```python
"""Tests for the cost-overrun-only training script's pure data functions."""

import sys
from pathlib import Path

import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from scripts.train_cost_overrun_model import build_feature_matrix


def test_build_feature_matrix_encodes_categoricals_and_keeps_numeric_features():
    df = pd.DataFrame({
        "project_id": ["1", "2", "3"],
        "ministry_name": ["Ministry A", "Ministry B", "Ministry A"],
        "sector": ["Roads", "Aviation", "Roads"],
        "original_cost": [100.0, 200.0, 150.0],
        "cumulative_expenditure": [50.0, 80.0, 90.0],
        "expenditure_ratio": [50.0, 40.0, 60.0],
        "cost_growth_percent": [10.0, 0.0, 20.0],
    })

    X = build_feature_matrix(df)

    assert "original_cost" in X.columns
    assert "expenditure_ratio" in X.columns
    # categorical columns must be numerically encoded, not left as raw strings
    assert X.select_dtypes(include="object").shape[1] == 0
    assert len(X) == 3


def test_build_feature_matrix_never_includes_leakage_columns():
    df = pd.DataFrame({
        "project_id": ["1"],
        "ministry_name": ["Ministry A"],
        "sector": ["Roads"],
        "original_cost": [100.0],
        "revised_cost": [120.0],
        "cumulative_expenditure": [50.0],
        "expenditure_ratio": [50.0],
        "cost_growth_percent": [20.0],
    })

    X = build_feature_matrix(df)

    # revised_cost and cost_growth_percent are used to derive the targets
    # (target_generation.py), so they must never leak into the feature matrix
    assert "revised_cost" not in X.columns
    assert "cost_growth_percent" not in X.columns
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/abishekraj/new-sih/paimana-ai && backend/.venv/bin/python3 -m pytest backend/tests/test_train_cost_overrun_model.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'scripts.train_cost_overrun_model'`

- [ ] **Step 3: Implement the training script**

Create `scripts/train_cost_overrun_model.py`:

```python
"""PAIMANA PredictIQ — Cost-Overrun-Only Baseline Training

Trains on the real MoSPI project dataset, which has no dates/progress/delay
data. Scope is intentionally limited to what the data supports:
  - binary_cost_overrun (classification)
  - continuous_cost_overrun_percentage (regression)

No time-series features, no chronological split (impossible without dates),
no delay/schedule targets, no Cox survival model — see
docs/superpowers/specs/2026-09-03-real-dataset-integration-design.md.
"""

import json
import logging
from pathlib import Path
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    f1_score,
    mean_absolute_error,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

from ml.features.target_generation import (
    generate_binary_cost_overrun,
    generate_continuous_cost_overrun_percentage,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("PAIMANA_ML.CostOverrunTraining")

RANDOM_SEED = 42
FEATURE_COLUMNS = ["ministry_name", "sector", "original_cost", "cumulative_expenditure", "expenditure_ratio"]


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Builds the model feature matrix, label-encoding categoricals.

    Excludes revised_cost and cost_growth_percent since both targets are
    derived from them (target leakage).
    """
    X = df[FEATURE_COLUMNS].copy()
    for col in ["ministry_name", "sector"]:
        X[col] = LabelEncoder().fit_transform(X[col].astype(str))
    return X


def stratified_split(
    X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, random_state: int = RANDOM_SEED
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Random stratified split — no chronological split is possible on snapshot data."""
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)


def main():
    processed_path = Path("data/processed/project_monthly_dataset.parquet")
    df = pd.read_parquet(processed_path)
    logger.info(f"Loaded {len(df)} rows from {processed_path}")

    df["binary_cost_overrun"] = generate_binary_cost_overrun(df)
    df["continuous_cost_overrun_percentage"] = generate_continuous_cost_overrun_percentage(df)
    df = df.dropna(subset=["binary_cost_overrun", "continuous_cost_overrun_percentage"])

    X = build_feature_matrix(df)
    y_class = df["binary_cost_overrun"]
    y_reg = df["continuous_cost_overrun_percentage"]

    X_train, X_test, y_class_train, y_class_test = stratified_split(X, y_class)
    _, _, y_reg_train, y_reg_test = train_test_split(
        X, y_reg, test_size=0.2, random_state=RANDOM_SEED
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    classifier = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
    classifier.fit(X_train_scaled, y_class_train)
    class_preds = classifier.predict(X_test_scaled)
    class_probs = classifier.predict_proba(X_test_scaled)[:, 1]

    regressor = Ridge(random_state=RANDOM_SEED)
    regressor.fit(X_train_scaled, y_reg_train)
    reg_preds = regressor.predict(X_test_scaled)

    metrics = {
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "classification": {
            "precision": float(precision_score(y_class_test, class_preds, zero_division=0)),
            "recall": float(recall_score(y_class_test, class_preds, zero_division=0)),
            "f1_score": float(f1_score(y_class_test, class_preds, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_class_test, class_probs)) if y_class_test.nunique() > 1 else None,
        },
        "regression": {
            "mae": float(mean_absolute_error(y_reg_test, reg_preds)),
        },
        "scope_note": "Cost overrun prediction only; no delay/schedule model (dataset has no dates).",
    }
    logger.info(f"Metrics: {json.dumps(metrics, indent=2)}")

    Path("models/baseline").mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": classifier, "scaler": scaler, "feature_columns": FEATURE_COLUMNS}, "models/baseline/cost_overrun_classifier.joblib")
    joblib.dump({"model": regressor, "scaler": scaler, "feature_columns": FEATURE_COLUMNS}, "models/baseline/cost_overrun_regressor.joblib")

    Path("reports").mkdir(parents=True, exist_ok=True)
    with open("reports/cost-overrun-baseline-results.json", "w") as f:
        json.dump(metrics, f, indent=2)

    logger.info("Saved models to models/baseline/ and metrics to reports/cost-overrun-baseline-results.json")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/abishekraj/new-sih/paimana-ai && backend/.venv/bin/python3 -m pytest backend/tests/test_train_cost_overrun_model.py -v`
Expected: PASS (both tests)

- [ ] **Step 5: Run the full training script against the real processed dataset**

Run: `cd /home/abishekraj/new-sih/paimana-ai && backend/.venv/bin/python3 -m scripts.train_cost_overrun_model`
Expected: completes, logs metrics (precision/recall/f1/roc_auc/mae), writes `models/baseline/cost_overrun_classifier.joblib`, `models/baseline/cost_overrun_regressor.joblib`, `reports/cost-overrun-baseline-results.json`.

- [ ] **Step 6: Sanity-check the metrics are plausible**

Run: `cat reports/cost-overrun-baseline-results.json`
Expected: `dataset_size` close to 1775, `train_size`/`test_size` roughly 80/20, ROC-AUC between 0.5 and 1.0 (not exactly 0.5, which would indicate the model learned nothing — and not suspiciously close to 1.0, which given `expenditure_ratio` is derived from `cumulative_expenditure`/`original_cost` and the overrun label is derived from `revised_cost`/`original_cost`, both drawing on the same underlying cost fields, should be checked for correlation but not treated as leakage since `expenditure_ratio` and the cost-overrun label are computed from genuinely different source columns — `cumulative_expenditure` vs `revised_cost`).

- [ ] **Step 7: Commit**

```bash
git add scripts/train_cost_overrun_model.py backend/tests/test_train_cost_overrun_model.py models/baseline/cost_overrun_classifier.joblib models/baseline/cost_overrun_regressor.joblib reports/cost-overrun-baseline-results.json
git commit -m "feat(ml): add cost-overrun-only baseline training for real dataset"
```

(If `models/baseline/*.joblib` files are large or the repo gitignores `models/`, check `git status` first — if ignored, skip adding those two files and only commit the script/test/report.)

---

### Task 9: Register the trained model and expose new cost fields via the API

**Files:**
- Modify: `backend/app/api/v1/models.py`
- Test: `backend/tests/test_models_endpoint.py` (new)

**Interfaces:**
- Consumes: `reports/cost-overrun-baseline-results.json` (from Task 8).
- Produces: `/api/v1/models` now includes an entry describing the cost-overrun model with its real metrics and an explicit scope note, alongside (not replacing) the existing fallback registry entries — so `/api/v1/models` still returns something even before any model is trained in a fresh environment.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_models_endpoint.py`:

```python
"""Tests that the models registry endpoint surfaces the real cost-overrun model."""

import json
from pathlib import Path

import pytest


@pytest.fixture
def cost_overrun_report(tmp_path, monkeypatch):
    report = {
        "dataset_size": 1775,
        "train_size": 1420,
        "test_size": 355,
        "classification": {"precision": 0.7, "recall": 0.65, "f1_score": 0.67, "roc_auc": 0.81},
        "regression": {"mae": 12.4},
        "scope_note": "Cost overrun prediction only; no delay/schedule model (dataset has no dates).",
    }
    reports_dir = tmp_path / "reports"
    reports_dir.mkdir()
    report_path = reports_dir / "cost-overrun-baseline-results.json"
    report_path.write_text(json.dumps(report))
    monkeypatch.chdir(tmp_path)
    return report_path


def test_models_endpoint_includes_cost_overrun_model_when_report_exists(client, cost_overrun_report):
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    names = [m["model_name"] for m in data]
    assert "CostOverrun_LogisticRegression_Real" in names

    entry = next(m for m in data if m["model_name"] == "CostOverrun_LogisticRegression_Real")
    assert "roc_auc" in entry["metrics"]
    assert "cost overrun" in entry["metrics"].lower() or "scope_note" in entry["metrics"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_models_endpoint.py -v`
Expected: FAIL — `CostOverrun_LogisticRegression_Real` not in the returned names.

- [ ] **Step 3: Read the current `models.py` to see the full existing fallback list**

Read `backend/app/api/v1/models.py` in full before editing (only the first ~40 lines were seen earlier) to find the exact end of the `list_models` function and its fallback list structure.

- [ ] **Step 4: Add the real model entry**

In `backend/app/api/v1/models.py`, modify `list_models` to, after checking the DB (`if not models:` branch or in addition to it — read the existing structure first to decide whether the fallback list runs only when DB is empty, or always), append a dynamically-built entry when `reports/cost-overrun-baseline-results.json` exists. Add near the top of the file:

```python
import json
from pathlib import Path
```

And add a helper function above `list_models`:

```python
def _load_cost_overrun_model_entry():
    """Builds a ModelVersionResponse describing the trained cost-overrun model,
    if scripts/train_cost_overrun_model.py has been run."""
    report_path = Path("reports/cost-overrun-baseline-results.json")
    if not report_path.exists():
        return None
    with open(report_path) as f:
        report = json.load(f)
    return ModelVersionResponse(
        id=100,
        model_name="CostOverrun_LogisticRegression_Real",
        version="v1.0.0-real-data",
        status="deployed",
        training_timestamp="2026-09-03T00:00:00Z",
        deployment_timestamp="2026-09-03T00:00:00Z",
        metrics=json.dumps(report),
    )
```

Then in `list_models`, before the final `return`, insert the real entry into whatever list is being returned (append to `models` if DB-backed, or to the fallback list — match to the function's actual existing return structure found in Step 3).

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_models_endpoint.py -v`
Expected: PASS

- [ ] **Step 6: Run full backend test suite**

Run: `cd backend && .venv/bin/python3 -m pytest -v`
Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add backend/app/api/v1/models.py backend/tests/test_models_endpoint.py
git commit -m "feat(api): surface real cost-overrun model metrics via /api/v1/models"
```

---

### Task 10: Update frontend to display the new real cost fields

**Files:**
- Modify: `frontend/src/api/client.ts`
- Modify: `frontend/src/types/api.ts`
- Test: manual browser verification (frontend has no existing test runner configured — check `frontend/package.json` for a test script; if none exists, this task is manually verified only, consistent with how the rest of the frontend is tested in this repo).

**Interfaces:**
- Consumes: `/api/v1/projects` now returning `revised_cost`, `cumulative_expenditure`, `external_project_id` fields (from Task 6/7).
- Produces: `api.getProjects()`/`api.getProjectById()` map these onto `ProjectData.revisedBudgetCr` (existing mock field, now real-backed) and a new `ProjectData.cumulativeExpenditureCr` field.

- [ ] **Step 1: Check for an existing frontend test setup**

Run: `cat frontend/package.json | grep -A3 '"scripts"'`

If a test script exists (e.g. `vitest`, `jest`), write an automated test for the mapping logic in Step 3 below in the appropriate existing test directory/pattern. If none exists, proceed with manual verification only (Step 5) — do not introduce a new test framework as a side effect of this task.

- [ ] **Step 2: Add the new field to `ProjectData`**

In `frontend/src/data/mockData.ts`, find the `ProjectData` interface (already shown to contain `revisedBudgetCr`) and add:

```typescript
  cumulativeExpenditureCr: number;
```

Add a default value for this field wherever `MOCK_PROJECTS` array entries are constructed — read the existing mock data entries' shape first, then add `cumulativeExpenditureCr: <some plausible value, e.g. budgetCr * 0.5>` consistent with the pattern used for other mock numeric fields in that file.

- [ ] **Step 3: Map the new API fields in `client.ts`**

In `frontend/src/api/client.ts`, in `getProjects`, find:

```typescript
          budgetCr: p.budget || mockMatch.budgetCr,
          overallRiskScore: Math.round((p.overall_risk_score || mockMatch.overallRiskScore / 100) * 100),
          costOverrunPct: p.cost_overrun_pct || mockMatch.costOverrunPct,
```

Replace with:

```typescript
          budgetCr: p.budget || mockMatch.budgetCr,
          revisedBudgetCr: p.revised_cost || mockMatch.revisedBudgetCr,
          cumulativeExpenditureCr: p.cumulative_expenditure || mockMatch.cumulativeExpenditureCr,
          overallRiskScore: Math.round((p.overall_risk_score || mockMatch.overallRiskScore / 100) * 100),
          costOverrunPct: p.cost_overrun_pct || mockMatch.costOverrunPct,
```

Apply the equivalent addition in `getProjectById` (find its similar field-mapping block and add the same two lines).

- [ ] **Step 4: Update `ProjectResponse`-adjacent TypeScript types if separately declared**

Check `frontend/src/types/api.ts`'s `Project` interface (shown earlier — has `id`, `name`, `budget`, etc. but not `sector`/`ministry`/`cost_overrun_pct`, meaning it's likely a minimal/unused type rather than what `client.ts` actually consumes, since `client.ts` types incoming data as `any[]`). If this interface is actually used elsewhere for the raw API shape, add `revised_cost?: number;` and `cumulative_expenditure?: number;`; if it's dead/unused (verify with `grep -rn "types/api" frontend/src/`), leave it as-is rather than maintaining an unused type.

- [ ] **Step 5: Manually verify in the browser**

Run:
```bash
cd /home/abishekraj/new-sih/paimana-ai/backend && .venv/bin/python3 -m uvicorn app.main:app --reload &
cd /home/abishekraj/new-sih/paimana-ai/frontend && npm run dev
```
Open the dashboard/projects page in a browser. Confirm:
- Project names/ministries/sectors shown are real (e.g. "Amended BharatNet Program", "Ministry of Road Transport & Highways"), not the old fictional 18 projects.
- Budget and revised cost figures match what's in `data/dataset/sector/ALL.csv` for a couple of spot-checked projects.
- No console errors from the new field mappings.

Stop both dev servers after verifying (`kill %1 %2` or Ctrl+C each).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/api/client.ts frontend/src/data/mockData.ts
git commit -m "feat(frontend): map real revised cost and cumulative expenditure fields from API"
```

---

### Task 11: Update `docs/data-quality-report.md`'s consumers and note the known early-warning limitation

**Files:**
- Modify: `backend/app/services/early_warning_engine.py` (docstring/comment only — no behavior change) OR confirm no change needed after reading it.

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — this task is a documentation/honesty check, not a feature change.

- [ ] **Step 1: Read `early_warning_engine.py` in full**

This engine computes trajectory metrics from `historical_observations` (a list of `{timestamp, risk_score}` pairs). With the real dataset, each project now has exactly one `RiskPrediction`-equivalent data point (the rule-based score from Task 7's loader) rather than a time series, since there's no historical snapshot data. Confirm how `calculate_trajectory_metrics` behaves with a single observation (check for division-by-zero or empty-list assumptions when computing trend/velocity over 1 point).

- [ ] **Step 2: If it crashes or produces misleading output on a single data point, add a guard**

Only make this change if Step 1's read reveals an actual bug (e.g. an unguarded `series[1] - series[0]` that would `IndexError` on a length-1 list). If the existing code already handles short series gracefully (e.g. returns a zero/neutral trend), no code change is needed — just confirm via a quick manual check:

```bash
cd backend && .venv/bin/python3 -c "
from app.services.early_warning_engine import EarlyWarningEngine
engine = EarlyWarningEngine(cooldown_days=7.0)
metrics = engine.calculate_trajectory_metrics('test', [{'timestamp': '2026-09-03T00:00:00', 'risk_score': 0.4}])
print(metrics)
"
```

If this raises an exception, fix the specific crash found (add a length check before whatever line fails) — write the fix based on the actual error, not speculatively.

- [ ] **Step 3: Run the project-risk-trajectory endpoint test to confirm it still works end to end**

Run: `cd backend && .venv/bin/python3 -m pytest tests/test_early_warning_engine.py -v`
Expected: PASS. If this test was already passing before this plan's changes and nothing in this task altered `early_warning_engine.py`, this step just confirms no regression.

- [ ] **Step 4: Commit (only if Step 2 required a code change)**

```bash
git add backend/app/services/early_warning_engine.py
git commit -m "fix: guard trajectory metrics against single-observation real-data projects"
```

(Skip this commit entirely if Step 2 found no bug — not every task needs a commit if investigation confirms existing code already handles the case correctly.)

---

## Post-plan verification checklist

After all tasks complete, run once more to confirm the whole system works together:

```bash
cd /home/abishekraj/new-sih/paimana-ai
rm -f backend/paimana.db  # force a fresh DB so seeding runs against real data
cd backend && .venv/bin/python3 -m pytest -v  # full suite
cd .. && backend/.venv/bin/python3 -m uvicorn --app-dir backend app.main:app &
sleep 2
curl -s http://localhost:8000/api/v1/projects | python3 -m json.tool | head -30
curl -s http://localhost:8000/api/v1/models | python3 -m json.tool
kill %1
```

Expected: fresh DB auto-seeds with real projects on first API call (via `seed_initial_data_if_empty`), `/api/v1/projects` returns real project data, `/api/v1/models` includes the cost-overrun model entry.
