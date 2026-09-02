"""Temporal Feature Engineering Module.

Transforms clean monthly progress snapshots into temporal lag features, rolling statistics,
and cost velocity indicators for machine learning models.
"""

import pandas as pd


class FeatureBuilder:
    """Build time-series and domain-specific feature vectors."""

    def build_lag_features(self, df: pd.DataFrame, lag_periods: list[int]) -> pd.DataFrame:
        """Construct rolling delay and expenditure velocity features across periods."""
        raise NotImplementedError("Feature builder stub: Implement temporal lag features.")

    def compute_earned_value_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Compute Cost Performance Index (CPI) and Schedule Performance Index (SPI)."""
        raise NotImplementedError("Feature builder stub: Implement EVM calculations.")
