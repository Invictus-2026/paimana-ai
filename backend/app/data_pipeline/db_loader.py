import logging
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.entities import Project, RiskPrediction
from app.services.risk_scoring import compute_project_risk_and_predictions

logger = logging.getLogger("PAIMANA_ETL.DBLoader")


def _compute_risk_score(cost_growth_percent: float) -> float:
    """Legacy compatibility helper."""
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
        original = float(row.get("original_cost") or 0.0)
        revised = float(row.get("revised_cost") or 0.0) if row.get("revised_cost") else original
        cum_exp = float(row.get("cumulative_expenditure") or 0.0)
        sector = str(row.get("sector") or "Unknown")

        cost_growth_pct = row.get("cost_growth_percent")
        if pd.isna(cost_growth_pct):
            cost_growth_pct = ((revised - original) / original * 100.0) if original else 0.0

        project = existing.get(ext_id)
        if project is None:
            project = Project(external_project_id=ext_id, is_synthetic=False)
            db.add(project)
            existing[ext_id] = project

        project.name = str(row["project_name"])
        project.ministry = str(row.get("ministry_name") or "Unknown")
        project.sector = sector
        project.budget = original
        project.revised_cost = revised
        project.cumulative_expenditure = cum_exp
        project.cost_overrun_pct = float(cost_growth_pct)

        # Compute proper multi-dimensional composite risk scores
        risk_info = compute_project_risk_and_predictions(
            original_cost=original,
            revised_cost=revised,
            cumulative_expenditure=cum_exp,
            sector=sector
        )

        project.overall_risk_score = risk_info["overall_risk_score"]
        project.risk_score_method = risk_info["risk_method"]
        project.status = "active"

        # Create or update RiskPrediction audit record
        existing_pred = db.query(RiskPrediction).filter(RiskPrediction.project_id == project.id).first() if project.id else None
        if not existing_pred:
            pred = RiskPrediction(
                project=project,
                cost_risk_score=risk_info["cost_risk_score"],
                delay_risk_score=risk_info["delay_risk_score"],
                overall_risk_score=risk_info["overall_risk_score"],
                predicted_delay_days=risk_info["predicted_delay_days"],
                predicted_cost_overrun_pct=risk_info["predicted_cost_overrun_pct"],
                model_version="composite_v2.0",
                timestamp=datetime.utcnow(),
                prediction_timestamp=datetime.utcnow()
            )
            db.add(pred)
        else:
            existing_pred.cost_risk_score = risk_info["cost_risk_score"]
            existing_pred.delay_risk_score = risk_info["delay_risk_score"]
            existing_pred.overall_risk_score = risk_info["overall_risk_score"]
            existing_pred.predicted_delay_days = risk_info["predicted_delay_days"]
            existing_pred.predicted_cost_overrun_pct = risk_info["predicted_cost_overrun_pct"]
            existing_pred.model_version = "composite_v2.0"
            existing_pred.timestamp = datetime.utcnow()

        count += 1

    db.commit()
    logger.info(f"Loaded {count} real projects into the database with multi-dimensional risk scores.")
    return count

