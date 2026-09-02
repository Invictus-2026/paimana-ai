"""
PAIMANA PredictIQ — What-If Risk Scenario Simulation Engine
Module: app.services.scenario_engine
Author: Backend Engineer (SIH 26103)

Implements:
1. Feature Recalculation: Modifies project feature vectors under 8 standard scenario types + custom inputs.
2. Risk Recalculation: Evaluates baseline vs. scenario risk metrics.
3. Delta Analysis: Computes risk change, delay delta, and cost exposure delta.
4. Auditability & Disclaimers: Enforces explicit non-certainty disclaimers and audit logging.
"""

import logging
from enum import Enum
from datetime import datetime
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("PAIMANA_Backend.ScenarioEngine")


class ScenarioType(str, Enum):
    SCHEDULE_DELAY_1M = "SCHEDULE_DELAY_1M"
    SCHEDULE_DELAY_3M = "SCHEDULE_DELAY_3M"
    SCHEDULE_DELAY_6M = "SCHEDULE_DELAY_6M"
    EXPENDITURE_SLOWDOWN = "EXPENDITURE_SLOWDOWN"
    PROGRESS_SLOWDOWN = "PROGRESS_SLOWDOWN"
    COST_INCREASE = "COST_INCREASE"
    PROGRESS_IMPROVEMENT = "PROGRESS_IMPROVEMENT"
    SCHEDULE_RECOVERY = "SCHEDULE_RECOVERY"
    CUSTOM = "CUSTOM"


class RiskMetricsPayload(BaseModel):
    cost_risk: float = Field(..., ge=0.0, le=1.0)
    delay_risk: float = Field(..., ge=0.0, le=1.0)
    overall_risk: float = Field(..., ge=0.0, le=1.0)
    predicted_delay_duration_days: float
    predicted_cost_overrun_pct: float


class DeltaMetricsPayload(BaseModel):
    risk_change: float
    estimated_delay_days: float
    estimated_cost_exposure_pct: float
    is_risk_escalated: bool


class AuditTrailPayload(BaseModel):
    scenario_id: str
    timestamp: str
    simulated_by: str
    assumptions_disclaimer: str


class ScenarioSimulationResult(BaseModel):
    project_id: str
    scenario_type: ScenarioType
    audit_trail: AuditTrailPayload
    assumptions: Dict[str, Any]
    baseline: RiskMetricsPayload
    scenario: RiskMetricsPayload
    delta: DeltaMetricsPayload


class ScenarioEngine:
    """
    Simulation Engine calculating feature recalculations and delta risk metrics.
    """

    DISCLAIMER_NOTICE = (
        "NOTICE: Projections represent model risk predictions calculated strictly "
        "under user-specified scenario assumptions and DO NOT constitute guaranteed "
        "real-world outcomes or causal proof."
    )

    def simulate(
        self,
        project_id: str,
        scenario_type: ScenarioType,
        custom_params: Optional[Dict[str, Any]] = None,
        baseline_state: Optional[Dict[str, Any]] = None,
        user_id: str = "system_user"
    ) -> ScenarioSimulationResult:
        """
        Executes scenario recalculation flow:
        1. Parse baseline project state.
        2. Recalculate features based on scenario modification.
        3. Compute baseline vs. scenario risk metrics.
        4. Calculate deltas (scenario - baseline).
        """
        if not baseline_state:
            # Standard default baseline project state
            baseline_state = {
                "project_original_budget_cr": 500.0,
                "project_planned_duration_days": 730.0,
                "cost_expenditure_ratio": 45.0,
                "cost_acceleration_mom": 1.5,
                "progress_physical_pct": 40.0,
                "progress_gap_pct": 8.0,
                "progress_velocity_mom": 2.2,
                "milestone_slippage_rate": 0.20,
            }

        # Step 1: Calculate Baseline Risk Metrics
        baseline_metrics = self._calculate_risk_from_features(baseline_state)

        # Step 2: Feature Recalculation under Scenario Assumptions
        modified_state, assumptions = self._apply_scenario_modifications(
            baseline_state, scenario_type, custom_params
        )

        # Step 3: Calculate Scenario Risk Metrics
        scenario_metrics = self._calculate_risk_from_features(modified_state)

        # Step 4: Delta Calculation (scenario - baseline)
        risk_change = round(scenario_metrics.overall_risk - baseline_metrics.overall_risk, 4)
        delay_delta = round(scenario_metrics.predicted_delay_duration_days - baseline_metrics.predicted_delay_duration_days, 1)
        cost_delta = round(scenario_metrics.predicted_cost_overrun_pct - baseline_metrics.predicted_cost_overrun_pct, 2)

        now_str = datetime.utcnow().isoformat() + "Z"
        scen_id = f"SCEN_{project_id}_{int(datetime.utcnow().timestamp())}"

        audit_trail = AuditTrailPayload(
            scenario_id=scen_id,
            timestamp=now_str,
            simulated_by=user_id,
            assumptions_disclaimer=self.DISCLAIMER_NOTICE
        )

        delta_payload = DeltaMetricsPayload(
            risk_change=risk_change,
            estimated_delay_days=delay_delta,
            estimated_cost_exposure_pct=cost_delta,
            is_risk_escalated=risk_change > 0.0
        )

        return ScenarioSimulationResult(
            project_id=project_id,
            scenario_type=scenario_type,
            audit_trail=audit_trail,
            assumptions=assumptions,
            baseline=baseline_metrics,
            scenario=scenario_metrics,
            delta=delta_payload
        )

    def _apply_scenario_modifications(
        self,
        base: Dict[str, Any],
        scen_type: ScenarioType,
        custom: Optional[Dict[str, Any]]
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Applies feature transformations for each scenario type."""
        mod = base.copy()
        assumptions: Dict[str, Any] = {"scenario_type": scen_type.value}

        if scen_type == ScenarioType.SCHEDULE_DELAY_1M:
            assumptions["duration_delta_days"] = 30
            mod["progress_gap_pct"] = mod.get("progress_gap_pct", 8.0) + 4.1
            mod["milestone_slippage_rate"] = min(1.0, mod.get("milestone_slippage_rate", 0.2) + 0.10)

        elif scen_type == ScenarioType.SCHEDULE_DELAY_3M:
            assumptions["duration_delta_days"] = 90
            mod["progress_gap_pct"] = mod.get("progress_gap_pct", 8.0) + 12.3
            mod["milestone_slippage_rate"] = min(1.0, mod.get("milestone_slippage_rate", 0.2) + 0.25)

        elif scen_type == ScenarioType.SCHEDULE_DELAY_6M:
            assumptions["duration_delta_days"] = 180
            mod["progress_gap_pct"] = mod.get("progress_gap_pct", 8.0) + 24.6
            mod["milestone_slippage_rate"] = min(1.0, mod.get("milestone_slippage_rate", 0.2) + 0.45)

        elif scen_type == ScenarioType.EXPENDITURE_SLOWDOWN:
            assumptions["expenditure_velocity_change_pct"] = -20.0
            mod["cost_acceleration_mom"] = mod.get("cost_acceleration_mom", 1.5) * 0.8
            mod["progress_gap_pct"] = mod.get("progress_gap_pct", 8.0) + 5.0

        elif scen_type == ScenarioType.PROGRESS_SLOWDOWN:
            assumptions["progress_velocity_change_pct"] = -15.0
            mod["progress_velocity_mom"] = max(0.1, mod.get("progress_velocity_mom", 2.2) * 0.85)
            mod["progress_gap_pct"] = mod.get("progress_gap_pct", 8.0) + 8.5
            mod["milestone_slippage_rate"] = min(1.0, mod.get("milestone_slippage_rate", 0.2) + 0.15)

        elif scen_type == ScenarioType.COST_INCREASE:
            assumptions["budget_overrun_increase_pct"] = 10.0
            mod["cost_expenditure_ratio"] = mod.get("cost_expenditure_ratio", 45.0) + 10.0
            mod["cost_acceleration_mom"] = mod.get("cost_acceleration_mom", 1.5) * 1.3

        elif scen_type == ScenarioType.PROGRESS_IMPROVEMENT:
            assumptions["progress_velocity_acceleration_pct"] = 15.0
            mod["progress_velocity_mom"] = mod.get("progress_velocity_mom", 2.2) * 1.15
            mod["progress_gap_pct"] = max(0.0, mod.get("progress_gap_pct", 8.0) - 5.0)
            mod["milestone_slippage_rate"] = max(0.0, mod.get("milestone_slippage_rate", 0.2) - 0.10)

        elif scen_type == ScenarioType.SCHEDULE_RECOVERY:
            assumptions["duration_recovery_days"] = -60
            mod["progress_gap_pct"] = max(0.0, mod.get("progress_gap_pct", 8.0) - 8.0)
            mod["milestone_slippage_rate"] = max(0.0, mod.get("milestone_slippage_rate", 0.2) - 0.15)

        elif scen_type == ScenarioType.CUSTOM and custom:
            assumptions.update(custom)
            if "budget_delta_percent" in custom:
                mod["cost_expenditure_ratio"] = mod.get("cost_expenditure_ratio", 45.0) + custom["budget_delta_percent"]
            if "duration_delta_days" in custom:
                mod["progress_gap_pct"] = mod.get("progress_gap_pct", 8.0) + (custom["duration_delta_days"] / 7.3)

        return mod, assumptions

    def _calculate_risk_from_features(self, state: Dict[str, Any]) -> RiskMetricsPayload:
        """Internal risk evaluation mapping features to risk metrics."""
        gap = float(state.get("progress_gap_pct", 8.0))
        ms_rate = float(state.get("milestone_slippage_rate", 0.20))
        cost_acc = float(state.get("cost_acceleration_mom", 1.5))
        exp_ratio = float(state.get("cost_expenditure_ratio", 45.0))

        # Risk Score Calculations
        delay_risk = min(0.98, max(0.05, 0.20 + (gap * 0.025) + (ms_rate * 0.40)))
        cost_risk = min(0.98, max(0.05, 0.15 + (cost_acc * 0.08) + (exp_ratio * 0.003)))
        overall_risk = round(0.55 * delay_risk + 0.45 * cost_risk, 4)

        delay_duration_days = round(gap * 10.5 + ms_rate * 120.0, 1)
        cost_overrun_pct = round(cost_acc * 2.5 + exp_ratio * 0.12, 2)

        return RiskMetricsPayload(
            cost_risk=round(cost_risk, 4),
            delay_risk=round(delay_risk, 4),
            overall_risk=overall_risk,
            predicted_delay_duration_days=delay_duration_days,
            predicted_cost_overrun_pct=cost_overrun_pct
        )
