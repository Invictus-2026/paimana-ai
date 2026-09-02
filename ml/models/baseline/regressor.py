"""Baseline Linear & Simple Tree Models Structure."""

import numpy as np


class BaselineModel:
    """Simple heuristic or linear baseline for benchmarking predictions."""

    def __init__(self, version: str = "baseline_v0.1"):
        self.version = version
        self.is_trained = False

    def train(self, X: np.ndarray, y: np.ndarray) -> None:
        """Train baseline regression model."""
        raise NotImplementedError("Baseline model stub: Implement linear baseline fitting.")

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Generate baseline predictions."""
        raise NotImplementedError("Baseline model stub: Implement prediction inference.")
