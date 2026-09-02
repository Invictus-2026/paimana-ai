import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

logger = logging.getLogger("PAIMANA_ML.ModelRegistry")

class ModelRegistry:
    """
    Production Model Registry managing metadata, versioning, feature schemas,
    performance metrics, and serialization locations for all trained models.
    """

    def __init__(self, registry_path: Path = Path("models/model_registry.json")):
        self.registry_path = registry_path
        self.registry_path.parent.mkdir(parents=True, exist_ok=True)
        self.records: Dict[str, Any] = self._load_registry()

    def _load_registry(self) -> Dict[str, Any]:
        """Loads existing model registry JSON file if present."""
        if self.registry_path.exists():
            try:
                with open(self.registry_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to parse registry file {self.registry_path}: {e}")
        return {"system_version": "1.0.0", "models": {}}

    def register_model(
        self,
        model_name: str,
        version: str,
        model_type: str,
        target_name: str,
        feature_columns: List[str],
        training_period: str,
        validation_period: str,
        performance_metrics: Dict[str, float],
        artifact_path: str,
        calibration_status: str = "UNAVAILABLE",
        missing_feature_threshold_pct: float = 20.0
    ) -> Dict[str, Any]:
        """
        Registers a trained model entry into the registry.
        """
        key = f"{model_name}_{version}"
        entry = {
            "model_name": model_name,
            "version": version,
            "model_type": model_type,
            "target_name": target_name,
            "feature_columns": feature_columns,
            "feature_count": len(feature_columns),
            "training_period": training_period,
            "validation_period": validation_period,
            "performance_metrics": performance_metrics,
            "artifact_path": str(artifact_path),
            "calibration_status": calibration_status,
            "missing_feature_threshold_pct": missing_feature_threshold_pct,
            "created_timestamp": datetime.utcnow().isoformat() + "Z"
        }
        self.records["models"][key] = entry
        self._save_registry()
        logger.info(f"Registered model '{key}' in {self.registry_path}")
        return entry

    def get_model_entry(self, model_name: str, version: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieves registered metadata for a given model."""
        if version:
            key = f"{model_name}_{version}"
            return self.records["models"].get(key)
        
        # Return latest matching entry if version not specified
        matching = [
            v for k, v in self.records["models"].items()
            if v["model_name"] == model_name
        ]
        if matching:
            matching.sort(key=lambda x: x["created_timestamp"], reverse=True)
            return matching[0]
        return None

    def _save_registry(self):
        """Saves current state to JSON registry file."""
        with open(self.registry_path, "w", encoding="utf-8") as f:
            json.dump(self.records, f, indent=2)
