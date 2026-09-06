"""Predictions API endpoints for Cost Overrun and Schedule Delay / Time Overrun."""

import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.paimana import GenericResponse
from app.models.entities import Project, RiskPrediction
from app.services.risk_scoring import compute_project_risk_and_predictions
from app.api.v1.monthly import _load_ministry_month, MONTHS, MONTH_LABELS

router = APIRouter()
logger = logging.getLogger("PAIMANA_Backend.Predictions")


def _get_scored_projects_for_month(month: str, db: Session) -> List[Dict[str, Any]]:
    """Retrieves and scores projects for the requested month.

    If month is 2026-07 (latest month in database), attempts to read from DB,
    otherwise reads the month's ministry snapshot CSV.
    """
    normalized_month = month.strip() if month else "2026-07"
    if normalized_month == "latest":
        normalized_month = "2026-07"

    # For 2026-07, we can use the enriched DB records if populated
    if normalized_month == "2026-07":
        db_projects = db.query(Project).all()
        if db_projects and len(db_projects) > 0:
            results = []
            for p in db_projects:
                risk_info = compute_project_risk_and_predictions(
                    original_cost=p.budget,
                    revised_cost=p.revised_cost,
                    cumulative_expenditure=p.cumulative_expenditure,
                    sector=p.sector
                )
                results.append({
                    "id": p.id,
                    "external_project_id": p.external_project_id or str(p.id),
                    "name": p.name,
                    "sector": p.sector or "Unknown",
                    "ministry": p.ministry or "Unknown",
                    "state": p.state or "Pan-India",
                    "status": p.status,
                    "budget_cr": p.budget,
                    "revised_cost_cr": p.revised_cost if p.revised_cost > 0 else p.budget,
                    "cumulative_expenditure_cr": p.cumulative_expenditure,
                    "cost_overrun_pct": risk_info["predicted_cost_overrun_pct"],
                    "cost_overrun_exposure_cr": risk_info["cost_overrun_exposure_cr"],
                    "expenditure_ratio_pct": risk_info["expenditure_ratio_pct"],
                    "predicted_delay_days": risk_info["predicted_delay_days"],
                    "predicted_delay_months": risk_info["predicted_delay_months"],
                    "delay_severity": risk_info["delay_severity"],
                    "cost_risk_score": risk_info["cost_risk_score"],
                    "delay_risk_score": risk_info["delay_risk_score"],
                    "overall_risk_score": risk_info["overall_risk_score"],
                    "risk_level": risk_info["risk_level"],
                    "risk_method": risk_info["risk_method"],
                })
            return results

    # Fallback or other months: load from monthly CSVs
    raw_rows = _load_ministry_month(normalized_month)
    if not raw_rows:
        return []

    results = []
    for idx, row in enumerate(raw_rows, start=1):
        if "project_id" not in row:
            continue

        def _safe_float(v: Any) -> float:
            try:
                return float(str(v).replace(",", "").strip() or 0.0)
            except Exception:
                return 0.0

        orig = _safe_float(row.get("orig_cost", 0.0))
        rev = _safe_float(row.get("revised_cost", 0.0))
        exp = _safe_float(row.get("expenditure", 0.0))
        sector = str(row.get("sector") or "Unknown").strip()
        ministry = str(row.get("ministry") or "Unknown").strip()
        name = str(row.get("name") or "Unnamed Project").strip()
        ext_id = str(row.get("project_id") or idx).strip()

        risk_info = compute_project_risk_and_predictions(
            original_cost=orig,
            revised_cost=rev,
            cumulative_expenditure=exp,
            sector=sector
        )

        results.append({
            "id": idx,
            "external_project_id": ext_id,
            "name": name,
            "sector": sector,
            "ministry": ministry,
            "state": "Pan-India",
            "status": "active",
            "budget_cr": orig,
            "revised_cost_cr": rev if rev > 0 else orig,
            "cumulative_expenditure_cr": exp,
            "cost_overrun_pct": risk_info["predicted_cost_overrun_pct"],
            "cost_overrun_exposure_cr": risk_info["cost_overrun_exposure_cr"],
            "expenditure_ratio_pct": risk_info["expenditure_ratio_pct"],
            "predicted_delay_days": risk_info["predicted_delay_days"],
            "predicted_delay_months": risk_info["predicted_delay_months"],
            "delay_severity": risk_info["delay_severity"],
            "cost_risk_score": risk_info["cost_risk_score"],
            "delay_risk_score": risk_info["delay_risk_score"],
            "overall_risk_score": risk_info["overall_risk_score"],
            "risk_level": risk_info["risk_level"],
            "risk_method": risk_info["risk_method"],
        })

    return results


@router.get("/cost-overrun", response_model=GenericResponse, summary="Cost Overrun predictions for every project")
def get_cost_overrun_predictions(
    month: str = Query("2026-07", description="Month identifier (e.g. 2026-07, 2026-06, etc.)"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    ministry: Optional[str] = Query(None, description="Filter by ministry"),
    risk_level: Optional[str] = Query(None, description="Filter by risk tier (Low, Moderate, High, Critical)"),
    search: Optional[str] = Query(None, description="Search project name or ID"),
    sort_by: str = Query("cost_overrun_pct", description="Sort field: cost_overrun_pct, cost_overrun_exposure_cr, budget_cr, overall_risk_score"),
    order: str = Query("desc", description="Sort direction: asc or desc"),
    limit: int = Query(50, ge=1, le=2000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    month = str(month) if isinstance(month, str) else "2026-07"
    sort_by = str(sort_by) if isinstance(sort_by, str) else "cost_overrun_pct"
    order = str(order) if isinstance(order, str) else "desc"
    limit = int(limit) if isinstance(limit, int) else 50
    offset = int(offset) if isinstance(offset, int) else 0

    projects = _get_scored_projects_for_month(month, db)

    # 1. Filtering
    filtered = projects
    if sector and isinstance(sector, str) and sector.upper() != "ALL":
        filtered = [p for p in filtered if p["sector"].lower() == sector.lower()]
    if ministry and isinstance(ministry, str) and ministry.upper() != "ALL":
        filtered = [p for p in filtered if ministry.lower() in p["ministry"].lower()]
    if risk_level and isinstance(risk_level, str) and risk_level.upper() != "ALL":
        filtered = [p for p in filtered if p["risk_level"].lower() == risk_level.lower()]
    if search and isinstance(search, str):
        s = search.lower().strip()
        filtered = [p for p in filtered if s in p["name"].lower() or s in p["external_project_id"].lower() or s in p["sector"].lower()]

    # 2. Summary Statistics (computed over filtered set)
    total_count = len(filtered)
    overrun_projects = [p for p in filtered if p["cost_overrun_pct"] > 0]
    total_exposure = sum(p["cost_overrun_exposure_cr"] for p in filtered)
    avg_overrun_pct = (sum(p["cost_overrun_pct"] for p in filtered) / total_count) if total_count > 0 else 0.0

    # Sector Exposure Aggregation (top 8 sectors)
    sector_agg: Dict[str, Dict[str, Any]] = {}
    for p in filtered:
        sec = p["sector"]
        if sec not in sector_agg:
            sector_agg[sec] = {"sector": sec, "total_exposure_cr": 0.0, "project_count": 0, "overrun_count": 0}
        sector_agg[sec]["total_exposure_cr"] += p["cost_overrun_exposure_cr"]
        sector_agg[sec]["project_count"] += 1
        if p["cost_overrun_pct"] > 0:
            sector_agg[sec]["overrun_count"] += 1

    sector_breakdown = sorted(
        [
            {
                "sector": v["sector"],
                "total_exposure_cr": round(v["total_exposure_cr"], 2),
                "project_count": v["project_count"],
                "overrun_count": v["overrun_count"],
            }
            for v in sector_agg.values()
        ],
        key=lambda x: x["total_exposure_cr"],
        reverse=True
    )[:8]

    # 3. Sorting
    reverse_sort = (order.lower() == "desc")
    filtered.sort(key=lambda x: x.get(sort_by, 0.0) or 0.0, reverse=reverse_sort)

    # 4. Paginate
    paginated_items = filtered[offset: offset + limit]

    return GenericResponse(
        status="success",
        message="Cost overrun predictions computed successfully",
        data={
            "month": month,
            "month_label": MONTH_LABELS.get(month, month),
            "available_months": [{"value": m, "label": MONTH_LABELS.get(m, m)} for m in MONTHS if m >= "2025-08"],
            "summary": {
                "total_projects": total_count,
                "projects_with_overrun": len(overrun_projects),
                "overrun_percentage_of_portfolio": round((len(overrun_projects) / total_count * 100.0), 1) if total_count > 0 else 0.0,
                "total_cost_exposure_cr": round(total_exposure, 2),
                "average_cost_overrun_pct": round(avg_overrun_pct, 2),
                "critical_risk_count": sum(1 for p in filtered if p["risk_level"] == "Critical"),
                "high_risk_count": sum(1 for p in filtered if p["risk_level"] == "High"),
            },
            "sector_exposure_breakdown": sector_breakdown,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
            },
            "projects": paginated_items
        }
    )


@router.get("/time-overrun", response_model=GenericResponse, summary="Time / Schedule Overrun predictions for every project")
def get_time_overrun_predictions(
    month: str = Query("2026-07", description="Month identifier (e.g. 2026-07, 2026-06, etc.)"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    ministry: Optional[str] = Query(None, description="Filter by ministry"),
    delay_severity: Optional[str] = Query(None, description="Filter by delay category: Severe Delay, Significant Delay, Minor Delay, On-Track"),
    search: Optional[str] = Query(None, description="Search project name or ID"),
    sort_by: str = Query("predicted_delay_days", description="Sort field: predicted_delay_days, delay_risk_score, overall_risk_score, budget_cr"),
    order: str = Query("desc", description="Sort direction: asc or desc"),
    limit: int = Query(50, ge=1, le=2000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    month = str(month) if isinstance(month, str) else "2026-07"
    sort_by = str(sort_by) if isinstance(sort_by, str) else "predicted_delay_days"
    order = str(order) if isinstance(order, str) else "desc"
    limit = int(limit) if isinstance(limit, int) else 50
    offset = int(offset) if isinstance(offset, int) else 0

    projects = _get_scored_projects_for_month(month, db)

    # 1. Filtering
    filtered = projects
    if sector and isinstance(sector, str) and sector.upper() != "ALL":
        filtered = [p for p in filtered if p["sector"].lower() == sector.lower()]
    if ministry and isinstance(ministry, str) and ministry.upper() != "ALL":
        filtered = [p for p in filtered if ministry.lower() in p["ministry"].lower()]
    if delay_severity and isinstance(delay_severity, str) and delay_severity.upper() != "ALL":
        filtered = [p for p in filtered if p["delay_severity"].lower() == delay_severity.lower()]
    if search and isinstance(search, str):
        s = search.lower().strip()
        filtered = [p for p in filtered if s in p["name"].lower() or s in p["external_project_id"].lower() or s in p["sector"].lower()]

    # 2. Summary Statistics
    total_count = len(filtered)
    avg_delay_days = (sum(p["predicted_delay_days"] for p in filtered) / total_count) if total_count > 0 else 0.0
    avg_delay_months = avg_delay_days / 30.4

    severe_delay_count = sum(1 for p in filtered if p["delay_severity"] == "Severe Delay")
    significant_delay_count = sum(1 for p in filtered if p["delay_severity"] == "Significant Delay")
    minor_delay_count = sum(1 for p in filtered if p["delay_severity"] == "Minor Delay")
    on_track_count = sum(1 for p in filtered if p["delay_severity"] == "On-Track")

    # Sector Delay Aggregation (top 8 sectors by average delay)
    sector_delay_agg: Dict[str, Dict[str, Any]] = {}
    for p in filtered:
        sec = p["sector"]
        if sec not in sector_delay_agg:
            sector_delay_agg[sec] = {"sector": sec, "total_delay_days": 0, "project_count": 0}
        sector_delay_agg[sec]["total_delay_days"] += p["predicted_delay_days"]
        sector_delay_agg[sec]["project_count"] += 1

    sector_delay_breakdown = sorted(
        [
            {
                "sector": v["sector"],
                "avg_delay_days": round(v["total_delay_days"] / v["project_count"], 1) if v["project_count"] > 0 else 0,
                "avg_delay_months": round((v["total_delay_days"] / v["project_count"]) / 30.4, 1) if v["project_count"] > 0 else 0,
                "project_count": v["project_count"],
            }
            for v in sector_delay_agg.values()
        ],
        key=lambda x: x["avg_delay_days"],
        reverse=True
    )[:8]

    # 3. Sorting
    reverse_sort = (order.lower() == "desc")
    filtered.sort(key=lambda x: x.get(sort_by, 0.0) or 0.0, reverse=reverse_sort)

    # 4. Paginate
    paginated_items = filtered[offset: offset + limit]

    return GenericResponse(
        status="success",
        message="Time overrun predictions computed successfully",
        data={
            "month": month,
            "month_label": MONTH_LABELS.get(month, month),
            "available_months": [{"value": m, "label": MONTH_LABELS.get(m, m)} for m in MONTHS if m >= "2025-08"],
            "summary": {
                "total_projects": total_count,
                "average_delay_days": round(avg_delay_days, 1),
                "average_delay_months": round(avg_delay_months, 1),
                "severe_delay_count": severe_delay_count,
                "significant_delay_count": significant_delay_count,
                "minor_delay_count": minor_delay_count,
                "on_track_count": on_track_count,
                "delayed_projects_pct": round(((severe_delay_count + significant_delay_count) / total_count * 100.0), 1) if total_count > 0 else 0.0,
            },
            "sector_delay_breakdown": sector_delay_breakdown,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
            },
            "projects": paginated_items
        }
    )


@router.get("", response_model=GenericResponse, summary="Get cost and schedule predictions")
def get_predictions(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Fetch AI model cost overrun and delay predictions for a project or placeholder."""
    if project_id:
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            risk_info = compute_project_risk_and_predictions(
                original_cost=project.budget,
                revised_cost=project.revised_cost,
                cumulative_expenditure=project.cumulative_expenditure,
                sector=project.sector
            )
            return GenericResponse(
                status="success",
                message=f"Predictions for project {project_id}",
                data={
                    "project_id": project.id,
                    "project_name": project.name,
                    "predicted_cost_overrun_pct": risk_info["predicted_cost_overrun_pct"],
                    "predicted_delay_days": risk_info["predicted_delay_days"],
                    "predicted_delay_months": risk_info["predicted_delay_months"],
                    "cost_risk_score": risk_info["cost_risk_score"],
                    "delay_risk_score": risk_info["delay_risk_score"],
                    "overall_risk_score": risk_info["overall_risk_score"],
                    "risk_level": risk_info["risk_level"],
                    "delay_severity": risk_info["delay_severity"],
                    "model_version": "composite_v2.0",
                }
            )

    return GenericResponse(
        status="success",
        message="Cost and schedule prediction summary",
        data={
            "predicted_cost_overrun_pct": 14.5,
            "predicted_delay_days": 42,
            "model_version": "composite_v2.0",
        }
    )
