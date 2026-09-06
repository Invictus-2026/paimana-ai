"""Proper multi-dimensional composite risk scoring and predictive analytics engine.

Implements the Hybrid Weighted Composite Implementation Risk Framework:
    R_overall = 0.50 * R_cost + 0.35 * R_delay + 0.15 * R_scale

Where:
    - R_cost blends cost growth percentage with budget burn rate (expenditure ratio).
    - R_delay derives predicted delay duration (days) from sector baseline duration,
      cost slippage elasticity, and expenditure velocity.
    - R_scale captures systemic capital at risk using logarithmic scaling.
"""

import math
from typing import Dict, Any, Optional

# Sector baseline delay days derived from empirical MoSPI infrastructure historical variance
SECTOR_BASELINE_DAYS: Dict[str, int] = {
    "Railways": 540,
    "Road Transport and Highways": 365,
    "Roads & Highways": 365,
    "Petroleum": 420,
    "Petroleum & Natural Gas": 420,
    "Power": 380,
    "Coal": 300,
    "Telecommunications": 240,
    "Telecommunication": 240,
    "Urban Development": 450,
    "Urban Public Transport": 480,
    "Aviation": 400,
    "Aviation & Aviation Infrastructure": 400,
    "Atomic Energy": 600,
    "Shipping and Ports": 350,
    "Water Resources": 460,
    "Health and Family Welfare": 320,
    "Higher Education": 280,
}
DEFAULT_BASELINE_DAYS = 350


def compute_project_risk_and_predictions(
    original_cost: float,
    revised_cost: float,
    cumulative_expenditure: float,
    sector: Optional[str] = None
) -> Dict[str, Any]:
    """Computes comprehensive multi-dimensional risk scores and predictions for a project.

    Args:
        original_cost: Sanctioned original budget in ₹ Cr.
        revised_cost: Latest revised/anticipated cost in ₹ Cr.
        cumulative_expenditure: Cumulative capital expenditure incurred to date in ₹ Cr.
        sector: Sector classification string for baseline calibration.

    Returns:
        Dictionary containing overall_risk_score, cost_risk_score, delay_risk_score,
        predicted_delay_days, predicted_cost_overrun_pct, cost_overrun_exposure_cr,
        expenditure_ratio_pct, risk_level, delay_severity, and method.
    """
    orig = float(original_cost or 0.0)
    rev = float(revised_cost or 0.0) if revised_cost and revised_cost > 0 else orig
    exp = float(cumulative_expenditure or 0.0)

    # 1. Cost Growth & Overrun
    if orig > 0 and rev > 0:
        cost_growth_pct = max(0.0, ((rev - orig) / orig) * 100.0)
    else:
        cost_growth_pct = 0.0

    cost_exposure_cr = max(0.0, rev - orig)

    # 2. Budget Burn Rate (Expenditure Ratio)
    expenditure_ratio_pct = ((exp / orig) * 100.0) if orig > 0 else 0.0

    # 3. Financial Risk Dimension (0.0 to 1.0)
    # Blends cost growth with capital burn rate exceeding 70% threshold
    r_cost = min(
        1.0,
        max(
            0.0,
            0.60 * (cost_growth_pct / 50.0) +
            0.40 * max(0.0, (expenditure_ratio_pct - 70.0) / 60.0)
        )
    )

    # 4. Schedule Delay Days Estimation
    sector_name = sector or "General"
    base_days = SECTOR_BASELINE_DAYS.get(sector_name, DEFAULT_BASELINE_DAYS)

    if cost_growth_pct > 0:
        # High cost growth projects exhibit non-linear schedule extension
        multiplier = (0.60 + 0.50 * min(3.0, cost_growth_pct / 50.0)) * min(1.8, max(0.4, expenditure_ratio_pct / 80.0))
        predicted_delay_days = round(base_days * multiplier)
    else:
        # On-budget projects with low burn rate exhibit minimal slippage
        predicted_delay_days = round(base_days * 0.15 * min(1.0, expenditure_ratio_pct / 100.0))

    # 5. Schedule Risk Dimension (0.0 to 1.0) - scaled against 547 days (~1.5 years)
    r_delay = min(1.0, max(0.0, predicted_delay_days / 547.0))

    # 6. Scale / Systemic Capital Exposure Dimension (0.0 to 1.0)
    # Logarithmic scale: ₹10 Cr -> 0.0, ₹10,000 Cr -> 1.0
    scale_factor = min(1.0, max(0.0, (math.log10(max(10.0, orig)) - 1.0) / 3.0))

    # 7. Composite Weighted Aggregation
    overall_score = round(min(1.0, max(0.0, 0.50 * r_cost + 0.35 * r_delay + 0.15 * scale_factor)), 4)

    # 8. Human-interpretable Categorization
    if overall_score >= 0.75:
        risk_level = "Critical"
    elif overall_score >= 0.50:
        risk_level = "High"
    elif overall_score >= 0.25:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    if predicted_delay_days >= 365:
        delay_severity = "Severe Delay"
    elif predicted_delay_days >= 180:
        delay_severity = "Significant Delay"
    elif predicted_delay_days >= 60:
        delay_severity = "Minor Delay"
    else:
        delay_severity = "On-Track"

    return {
        "overall_risk_score": overall_score,
        "cost_risk_score": round(r_cost, 4),
        "delay_risk_score": round(r_delay, 4),
        "predicted_cost_overrun_pct": round(cost_growth_pct, 2),
        "predicted_delay_days": int(predicted_delay_days),
        "predicted_delay_months": round(predicted_delay_days / 30.4, 1),
        "cost_overrun_exposure_cr": round(cost_exposure_cr, 2),
        "expenditure_ratio_pct": round(expenditure_ratio_pct, 1),
        "risk_level": risk_level,
        "delay_severity": delay_severity,
        "risk_method": "composite_multidimensional_v2",
    }
