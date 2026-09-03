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
