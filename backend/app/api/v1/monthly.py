"""Monthly time-series API - reads all 13 monthly CSVs from data/dataset/ministry/
and exposes:
  GET /monthly/overview        – month-by-month aggregate totals for the dashboard
  GET /monthly/project/{ext_id} – full 1-year trajectory for a specific project ID
"""

import logging
import csv
from pathlib import Path
from typing import List, Dict, Any, Optional
import re

import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from app.schemas.paimana import GenericResponse

router = APIRouter()
logger = logging.getLogger("PAIMANA_Backend.Monthly")

# Canonical 13-month window (ascending order)
MONTHS = [
    "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
    "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07",
]

MONTH_LABELS = {
    "2025-07": "Jul '25", "2025-08": "Aug '25", "2025-09": "Sep '25",
    "2025-10": "Oct '25", "2025-11": "Nov '25", "2025-12": "Dec '25",
    "2026-01": "Jan '26", "2026-02": "Feb '26", "2026-03": "Mar '26",
    "2026-04": "Apr '26", "2026-05": "May '26", "2026-06": "Jun '26",
    "2026-07": "Jul '26",
}

# Resolve dataset paths relative to this file
_THIS_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _THIS_DIR.parents[3]
_MINISTRY_DIR = _REPO_ROOT / "data" / "dataset" / "ministry"
_SECTOR_DIR = _REPO_ROOT / "data" / "dataset" / "sector"


def _parse_cost_string(val: Any) -> tuple[float, float]:
    """Parse strings like '676815.96 (813263.75)' → (original, revised)."""
    s = str(val).strip()
    # Pattern: "original (revised)" or just "original"
    m = re.match(r"([\d.,]+)\s*\(([\d.,]+)\)", s)
    if m:
        orig = float(m.group(1).replace(",", ""))
        rev = float(m.group(2).replace(",", ""))
        return orig, rev
    try:
        v = float(s.replace(",", ""))
        return v, 0.0
    except Exception:
        return 0.0, 0.0


def _load_ministry_month(month: str) -> Optional[list]:
    """Load a single ministry CSV and return list of row dicts.

    Handles two layouts:
    - Layout A (2025-07..2025-12): sector-summary (5 cols)
    - Layout B (2026-01..2026-07): full project-level (13 cols)
    """
    path = _MINISTRY_DIR / f"{month}.csv"
    if not path.exists():
        return None
    try:
        data_rows = []
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f, quotechar='"')
            for row in reader:
                if not row:
                    continue
                try:
                    int(str(row[0]).strip())
                except Exception:
                    continue
                data_rows.append([v.strip() for v in row])

        if not data_rows:
            return None

        max_cols = max(len(r) for r in data_rows)

        if max_cols >= 12:
            # Full project-level (2026-01 to 2026-06): sr, sector, ministry, agency, project_id, name, orig, revised, exp, …
            result = []
            for r in data_rows:
                while len(r) < 13:
                    r.append("")
                result.append({
                    "sr": r[0], "sector": r[1], "ministry": r[2], "agency": r[3],
                    "project_id": r[4], "name": r[5],
                    "orig_cost": r[6], "revised_cost": r[7], "expenditure": r[8],
                    "progress": r[9], "layout": "B",
                })
            return result
        elif max_cols >= 7:
            # Layout C (2026-07): sr, ministry, sector, project_id, name, orig, revised, exp
            result = []
            for r in data_rows:
                while len(r) < 8:
                    r.append("")
                result.append({
                    "sr": r[0], "ministry": r[1], "sector": r[2],
                    "project_id": r[3], "name": r[4],
                    "orig_cost": r[5], "revised_cost": r[6], "expenditure": r[7],
                    "progress": "0", "layout": "C",
                })
            return result
        elif max_cols >= 5:
            # Sector-summary (2025-07..2025-12)
            result = []
            for r in data_rows:
                while len(r) < 5:
                    r.append("")
                result.append({
                    "sr": r[0], "sector": r[1], "count": r[2],
                    "cost_string": r[3], "expenditure": r[4], "layout": "A",
                })
            return result
        return None
    except Exception as e:
        logger.warning(f"Failed to load {path}: {e}")
        return None


def _load_sector_month(month: str) -> Optional[dict]:
    """Load a sector summary CSV and return {sector: {count, orig_cr, rev_cr, exp_cr}}."""
    path = _SECTOR_DIR / f"{month}.csv"
    if not path.exists():
        return None
    try:
        df = pd.read_csv(path, header=None, dtype=str, on_bad_lines="skip")
        result = {}
        for _, row in df.iterrows():
            raw = [str(v).strip().strip('"') for v in row.tolist()]
            try:
                int(raw[0])
            except Exception:
                continue
            if len(raw) < 4:
                continue
            sector = raw[1]
            count = int(raw[2]) if raw[2].isdigit() else 0
            orig, rev = _parse_cost_string(raw[3])
            exp = float(raw[4].replace(",", "")) if len(raw) > 4 else 0.0
            result[sector] = {"count": count, "orig_cr": orig, "rev_cr": rev, "exp_cr": exp}
        return result
    except Exception as e:
        logger.warning(f"Failed sector CSV {path}: {e}")
        return None


# ─── Cached aggregate ────────────────────────────────────────────────────────
_MONTHLY_AGGREGATE_CACHE: Optional[List[Dict]] = None


def _build_monthly_aggregate() -> List[Dict]:
    global _MONTHLY_AGGREGATE_CACHE
    if _MONTHLY_AGGREGATE_CACHE:
        return _MONTHLY_AGGREGATE_CACHE

    rows = []
    for month in MONTHS:
        ministry_df = _load_ministry_month(month)
        sector_data = _load_sector_month(month)

        total_projects = 0
        total_orig = 0.0
        total_rev = 0.0
        total_exp = 0.0

        if ministry_df is not None and len(ministry_df) > 0 and "project_id" in ministry_df[0]:
            # Full project-level layout (Layout B)
            total_projects = len(ministry_df)
            for row in ministry_df:
                def _safe(v: str) -> float:
                    try: return float(str(v).replace(",", "") or 0)
                    except: return 0.0
                orig = _safe(row.get("orig_cost", "0"))
                rev = _safe(row.get("revised_cost", "0"))
                exp = _safe(row.get("expenditure", "0"))
                total_orig += orig
                total_rev += rev if rev > 0 else 0
                total_exp += exp
        elif ministry_df is not None and len(ministry_df) > 0 and "cost_string" in ministry_df[0]:
            # Sector-summary layout (Layout A)
            for row in ministry_df:
                try: total_projects += int(row.get("count", 0))
                except: pass
                orig, rev = _parse_cost_string(row.get("cost_string", "0"))
                try: exp = float(str(row.get("expenditure", "0")).replace(",", "") or 0)
                except: exp = 0.0
                total_orig += orig
                total_rev += rev
                total_exp += exp
        elif sector_data:
            for s in sector_data.values():
                total_projects += s["count"]
                total_orig += s["orig_cr"]
                total_rev += s["rev_cr"]
                total_exp += s["exp_cr"]

        overrun_pct = round(((total_rev - total_orig) / total_orig * 100), 2) if total_orig > 0 and total_rev > 0 else 0.0
        exp_rate = round((total_exp / total_orig * 100), 2) if total_orig > 0 else 0.0

        rows.append({
            "month": month,
            "label": MONTH_LABELS[month],
            "total_projects": total_projects,
            "total_original_cost_cr": round(total_orig, 2),
            "total_revised_cost_cr": round(total_rev, 2),
            "total_expenditure_cr": round(total_exp, 2),
            "cost_overrun_pct": overrun_pct,
            "expenditure_rate_pct": exp_rate,
        })

    _MONTHLY_AGGREGATE_CACHE = rows
    return rows



# ─── Project trajectory cache (keyed by ext_id) ─────────────────────────────
_PROJECT_CACHE: Dict[str, List[Dict]] = {}


def _find_project_across_months(ext_id: str) -> List[Dict]:
    """Search every monthly CSV for the given project ID and build 1-year trajectory."""
    if ext_id in _PROJECT_CACHE:
        return _PROJECT_CACHE[ext_id]

    trajectory = []
    for month in MONTHS:
        df = _load_ministry_month(month)
        if not df or "project_id" not in df[0]:
            continue
        
        row = next((r for r in df if str(r.get("project_id", "")).strip() == ext_id.strip()), None)
        if not row:
            continue
            
        orig = float(str(row.get("orig_cost", "0")).replace(",", "") or 0)
        rev_val = str(row.get("revised_cost", "0"))
        rev = float(rev_val.replace(",", "") or 0) if rev_val not in ("", "0") else 0.0
        exp = float(str(row.get("expenditure", "0")).replace(",", "") or 0)
        overrun_pct = round(((rev - orig) / orig * 100), 2) if orig > 0 and rev > 0 else 0.0
        exp_rate = round((exp / orig * 100), 2) if orig > 0 else 0.0
        risk_score = round(min(1.0, max(0.0, overrun_pct / 50.0)), 4)

        trajectory.append({
            "month": month,
            "label": MONTH_LABELS[month],
            "ministry": row.get("ministry", ""),
            "sector": row.get("sector", ""),
            "name": row.get("name", ""),
            "original_cost_cr": orig,
            "revised_cost_cr": rev,
            "expenditure_cr": exp,
            "cost_overrun_pct": overrun_pct,
            "expenditure_rate_pct": exp_rate,
            "risk_score": risk_score,
        })

    _PROJECT_CACHE[ext_id] = trajectory
    return trajectory


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("/overview", response_model=GenericResponse, summary="Month-wise aggregate dashboard data")
def get_monthly_overview():
    """Returns month-by-month aggregate statistics for the full 2025-07 → 2026-07 window."""
    data = _build_monthly_aggregate()
    return GenericResponse(
        status="success",
        message="Monthly overview computed from real MoSPI datasets",
        data={"months": data, "period": "2025-07 to 2026-07", "total_snapshots": len(data)},
    )


@router.get("/sectors", response_model=GenericResponse, summary="Month-wise sector breakdown")
def get_monthly_sectors(month: str = Query("2026-07", description="Month in YYYY-MM format")):
    """Returns sector-level breakdown for a specific month."""
    ministry_data = _load_ministry_month(month)
    if not ministry_data:
        raise HTTPException(status_code=404, detail=f"No data found for month {month}")
        
    sector_map = {}
    for row in ministry_data:
        sector = str(row.get("sector", "")).strip()
        if not sector:
            continue
            
        def _safe(v: str) -> float:
            try: return float(str(v).replace(",", "") or 0)
            except: return 0.0
            
        if sector not in sector_map:
            sector_map[sector] = {"count": 0, "orig_cr": 0.0, "rev_cr": 0.0, "exp_cr": 0.0}
            
        count = int(row.get("count", 1)) if row.get("count") else 1
        sector_map[sector]["count"] += count
        
        if row.get("layout") == "A":
            orig, rev = _parse_cost_string(row.get("cost_string", "0"))
            exp = _safe(row.get("expenditure", "0"))
        else:
            orig = _safe(row.get("orig_cost", "0"))
            rev = _safe(row.get("revised_cost", "0"))
            exp = _safe(row.get("expenditure", "0"))
            
        sector_map[sector]["orig_cr"] += orig
        sector_map[sector]["rev_cr"] += rev
        sector_map[sector]["exp_cr"] += exp

    rows = [
        {"sector": k, **v} for k, v in sorted(sector_map.items(), key=lambda x: -x[1]["count"])
    ]
    return GenericResponse(
        status="success",
        message=f"Sector breakdown for {month}",
        data={"month": month, "label": MONTH_LABELS.get(month, month), "sectors": rows},
    )


@router.get("/available-months", response_model=GenericResponse, summary="List all available months")
def get_available_months():
    """Returns the list of months for which dataset files exist."""
    available = []
    for m in MONTHS:
        path = _MINISTRY_DIR / f"{m}.csv"
        if path.exists():
            available.append({"month": m, "label": MONTH_LABELS[m]})
    return GenericResponse(
        status="success",
        message="Available monthly snapshots",
        data={"months": available},
    )


@router.get("/project/{ext_project_id}", response_model=GenericResponse, summary="Full 1-year trajectory for a project")
def get_project_monthly_trajectory(ext_project_id: str):
    """Searches all 13 monthly CSVs for the given MoSPI project ID and returns its
    full temporal trajectory covering budget, expenditure, overrun %, and computed risk score."""
    trajectory = _find_project_across_months(ext_project_id)
    if not trajectory:
        raise HTTPException(
            status_code=404,
            detail=f"Project ID '{ext_project_id}' not found in any monthly dataset (2025-07 to 2026-07)."
        )

    # Compute summary statistics
    risk_scores = [t["risk_score"] for t in trajectory]
    overrun_pcts = [t["cost_overrun_pct"] for t in trajectory]
    exp_crs = [t["expenditure_cr"] for t in trajectory]

    summary = {
        "project_id": ext_project_id,
        "project_name": trajectory[-1]["name"],
        "ministry": trajectory[-1]["ministry"],
        "sector": trajectory[-1]["sector"],
        "months_found": len(trajectory),
        "latest_month": trajectory[-1]["month"],
        "latest_risk_score": trajectory[-1]["risk_score"],
        "peak_risk_score": max(risk_scores),
        "min_risk_score": min(risk_scores),
        "latest_cost_overrun_pct": trajectory[-1]["cost_overrun_pct"],
        "peak_cost_overrun_pct": max(overrun_pcts),
        "latest_original_cost_cr": trajectory[-1]["original_cost_cr"],
        "latest_revised_cost_cr": trajectory[-1]["revised_cost_cr"],
        "latest_expenditure_cr": trajectory[-1]["expenditure_cr"],
        "total_expenditure_cr": round(max(exp_crs), 2),
        "risk_trend": "increasing" if len(risk_scores) >= 2 and risk_scores[-1] > risk_scores[0] else "stable_or_decreasing",
    }

    return GenericResponse(
        status="success",
        message=f"1-year trajectory for project {ext_project_id}",
        data={"summary": summary, "trajectory": trajectory},
    )

@router.get("/projects", response_model=GenericResponse, summary="List all projects for a specific month")
def get_monthly_projects(month: str = Query("2026-07", description="Month in YYYY-MM format")):
    """Returns the list of projects for a given month, matching the standard DB project schema."""
    ministry_data = _load_ministry_month(month)
    if not ministry_data:
        raise HTTPException(status_code=404, detail=f"No data found for month {month}")

    projects = []
    if ministry_data and "project_id" not in ministry_data[0]:
        return GenericResponse(status="success", message="Layout A has no project level data", data={"projects": []})

    for row in ministry_data:
        def _safe(v: str) -> float:
            try: return float(str(v).replace(",", "") or 0)
            except: return 0.0

        orig = _safe(row.get("orig_cost", "0"))
        rev = _safe(row.get("revised_cost", "0"))
        exp = _safe(row.get("expenditure", "0"))
        overrun_pct = round(((rev - orig) / orig * 100), 2) if orig > 0 and rev > 0 else 0.0
        risk_score = min(1.0, max(0.0, overrun_pct / 50.0))

        projects.append({
            "id": row.get("project_id", ""),
            "external_project_id": row.get("project_id", ""),
            "name": row.get("name", ""),
            "sector": row.get("sector", ""),
            "ministry": row.get("ministry", ""),
            "state": "Pan-India",
            "status": "active",
            "budget": orig,
            "revised_cost": rev,
            "cost_overrun_pct": overrun_pct,
            "cumulative_expenditure": exp,
            "overall_risk_score": risk_score,
            "predicted_delay_days": 0,
            "cost_risk_score": risk_score,
            "delay_risk_score": 0.0,
        })
        
    return GenericResponse(status="success", message="OK", data={"projects": projects})
