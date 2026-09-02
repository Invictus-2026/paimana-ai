"""ML Pipeline Orchestration Layer.

Orchestrates monthly data ingestion, preprocessing, feature engineering,
model training, evaluation, and registry update workflows.
"""

from typing import Dict, Any


class PipelineOrchestrator:
    """Orchestrate training and prediction batch jobs."""

    def run_training_pipeline(self, raw_data_path: str) -> Dict[str, Any]:
        """Execute full training workflow from raw CSV to deployed model artifacts."""
        raise NotImplementedError("Pipeline orchestrator stub: Implement training execution workflow.")

    def run_inference_pipeline(self, project_id: int) -> Dict[str, Any]:
        """Run monthly batch risk evaluation for specified project."""
        raise NotImplementedError("Pipeline orchestrator stub: Implement inference execution workflow.")
