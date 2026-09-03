"""One-time script: runs the ETL pipeline against the real MoSPI dataset
and loads the result into the projects database.

Usage:
    backend/.venv/bin/python3 -m scripts.load_real_dataset
(run from the repo root, NOT from inside backend/ — this script imports
backend.app.* using the repo root as the package root)
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
