"""Migration utility to recompute proper multi-dimensional risk scores
for all projects in the SQLite database and populate the risk_predictions table.
"""

import logging
from datetime import datetime
from app.database import SessionLocal
from app.models.entities import Project, RiskPrediction
from app.services.risk_scoring import compute_project_risk_and_predictions

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("PAIMANA.RecomputeRisk")


def recompute_all_project_risks():
    db = SessionLocal()
    try:
        projects = db.query(Project).all()
        logger.info(f"Recomputing risk scores for {len(projects)} projects in DB...")

        updated_count = 0
        predictions_created = 0

        for project in projects:
            risk_info = compute_project_risk_and_predictions(
                original_cost=project.budget,
                revised_cost=project.revised_cost,
                cumulative_expenditure=project.cumulative_expenditure,
                sector=project.sector
            )

            project.overall_risk_score = risk_info["overall_risk_score"]
            project.cost_overrun_pct = risk_info["predicted_cost_overrun_pct"]
            project.risk_score_method = risk_info["risk_method"]
            updated_count += 1

            # Check or create RiskPrediction
            existing_pred = db.query(RiskPrediction).filter(RiskPrediction.project_id == project.id).first()
            if existing_pred:
                existing_pred.cost_risk_score = risk_info["cost_risk_score"]
                existing_pred.delay_risk_score = risk_info["delay_risk_score"]
                existing_pred.overall_risk_score = risk_info["overall_risk_score"]
                existing_pred.predicted_delay_days = risk_info["predicted_delay_days"]
                existing_pred.predicted_cost_overrun_pct = risk_info["predicted_cost_overrun_pct"]
                existing_pred.model_version = "composite_v2.0"
                existing_pred.timestamp = datetime.utcnow()
            else:
                pred = RiskPrediction(
                    project_id=project.id,
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
                predictions_created += 1

        db.commit()
        logger.info(f"Successfully recomputed {updated_count} projects and ensured {predictions_created} new risk_predictions records.")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to recompute risk scores: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    recompute_all_project_risks()
