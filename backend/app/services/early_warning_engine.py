"""
PAIMANA PredictIQ — Early Warning & Risk Trajectory Engine
Module: app.services.early_warning_engine
Author: Backend Engineer (SIH 26103)

Implements:
1. Finite State Machine: STABLE, WATCH, ESCALATING, HIGH_RISK, CRITICAL.
2. Trajectory Calculation: Risk Delta, Velocity, Acceleration, Consecutive Deterioration,
   Warning Persistence, Expected Failure Horizon, and Early Warning Lead Time.
3. Alert Generation & Deduplication: Prioritization formula (Risk * Impact * Urgency)
   and cooldown window enforcement to eliminate alert fatigue.
"""

import logging
from enum import Enum
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("PAIMANA_Backend.EarlyWarningEngine")


class RiskState(str, Enum):
    STABLE = "STABLE"
    WATCH = "WATCH"
    ESCALATING = "ESCALATING"
    HIGH_RISK = "HIGH_RISK"
    CRITICAL = "CRITICAL"


class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertType(str, Enum):
    THRESHOLD_CROSSING = "THRESHOLD_CROSSING"
    RAPID_ACCELERATION = "RAPID_ACCELERATION"
    REPEATED_DETERIORATION = "REPEATED_DETERIORATION"
    CONVERGENT_RISK = "CONVERGENT_RISK"


class RiskMetrics(BaseModel):
    """Calculated risk trajectory metrics."""
    project_id: str
    current_risk: float
    previous_risk: float
    risk_delta: float
    risk_velocity: float = Field(..., description="Risk change per day")
    risk_acceleration: float = Field(..., description="Velocity change per day")
    consecutive_deterioration: int
    warning_persistence_days: float
    expected_failure_horizon_days: Optional[float]
    early_warning_lead_time_days: float
    current_state: RiskState


class EarlyWarningAlert(BaseModel):
    """Alert output schema."""
    alert_id: str
    project_id: str
    alert_type: AlertType
    severity: SeverityLevel
    risk_score: float
    previous_score: float
    trigger: str
    priority_score: float
    timestamp: str
    recommended_review_window: str


class EarlyWarningEngine:
    """
    Early Warning Engine implementing state transition rules, trajectory metrics,
    alert generation, and cooldown deduplication.
    """

    def __init__(self, cooldown_days: float = 7.0):
        self.cooldown_days = cooldown_days
        # Memory cache for active alerts and cooldown timestamps
        self.alert_history: List[EarlyWarningAlert] = []

    def transition_state(
        self,
        current_risk: float,
        previous_risk: float,
        velocity: float,
        acceleration: float,
        consecutive_increases: int
    ) -> RiskState:
        """
        Determines state machine state based on threshold boundaries:
        - CRITICAL: Risk >= 0.75 or (Risk >= 0.60 and velocity > 0.01/day)
        - HIGH_RISK: Risk >= 0.50
        - ESCALATING: Acceleration > 0.002/day^2 or consecutive_increases >= 3
        - WATCH: Risk >= 0.30 or velocity > 0.001/day or consecutive_increases >= 2
        - STABLE: Otherwise
        """
        if current_risk >= 0.75 or (current_risk >= 0.60 and velocity > 0.01):
            return RiskState.CRITICAL
        elif current_risk >= 0.50:
            return RiskState.HIGH_RISK
        elif acceleration > 0.002 or consecutive_increases >= 3:
            return RiskState.ESCALATING
        elif current_risk >= 0.30 or velocity > 0.001 or consecutive_increases >= 2:
            return RiskState.WATCH
        else:
            return RiskState.STABLE

    def calculate_trajectory_metrics(
        self,
        project_id: str,
        observations: List[Dict[str, Any]]
    ) -> RiskMetrics:
        """
        Calculates 9 trajectory metrics from chronologically ordered project observation snapshots:
        [{ "timestamp": "2026-08-01", "risk_score": 0.35 }, ...]
        """
        if not observations:
            raise ValueError("Observations list cannot be empty.")

        # Ensure sorted by timestamp
        sorted_obs = sorted(observations, key=lambda x: pd_timestamp(x["timestamp"]))
        
        latest = sorted_obs[-1]
        current_risk = float(latest["risk_score"])
        latest_dt = pd_timestamp(latest["timestamp"])

        if len(sorted_obs) == 1:
            return RiskMetrics(
                project_id=project_id,
                current_risk=current_risk,
                previous_risk=current_risk,
                risk_delta=0.0,
                risk_velocity=0.0,
                risk_acceleration=0.0,
                consecutive_deterioration=0,
                warning_persistence_days=0.0,
                expected_failure_horizon_days=None,
                early_warning_lead_time_days=0.0,
                current_state=RiskState.STABLE if current_risk < 0.30 else RiskState.WATCH,
            )

        prev = sorted_obs[-2]
        previous_risk = float(prev["risk_score"])
        prev_dt = pd_timestamp(prev["timestamp"])

        delta_days = max(1.0, (latest_dt - prev_dt).total_seconds() / 86400.0)
        risk_delta = current_risk - previous_risk
        risk_velocity = risk_delta / delta_days

        # Velocity in prior interval for acceleration calculation
        if len(sorted_obs) >= 3:
            prev2 = sorted_obs[-3]
            prev2_dt = pd_timestamp(prev2["timestamp"])
            delta_days_prior = max(1.0, (prev_dt - prev2_dt).total_seconds() / 86400.0)
            prior_velocity = (previous_risk - float(prev2["risk_score"])) / delta_days_prior
            risk_acceleration = (risk_velocity - prior_velocity) / delta_days
        else:
            risk_acceleration = 0.0

        # Calculate consecutive deterioration count
        consecutive_deterioration = 0
        for i in range(len(sorted_obs) - 1, 0, -1):
            if sorted_obs[i]["risk_score"] > sorted_obs[i - 1]["risk_score"]:
                consecutive_deterioration += 1
            else:
                break

        # Transition state
        current_state = self.transition_state(
            current_risk, previous_risk, risk_velocity, risk_acceleration, consecutive_deterioration
        )

        # Persistence & lead time calculation
        first_warning_dt = None
        for obs in sorted_obs:
            r = float(obs["risk_score"])
            if r >= 0.30:
                first_warning_dt = pd_timestamp(obs["timestamp"])
                break

        if first_warning_dt:
            warning_persistence_days = max(0.0, (latest_dt - first_warning_dt).total_seconds() / 86400.0)
            early_warning_lead_time_days = warning_persistence_days
        else:
            warning_persistence_days = 0.0
            early_warning_lead_time_days = 0.0

        # Expected failure horizon to reach Critical threshold (0.75)
        if current_risk >= 0.75:
            expected_failure_horizon_days = 0.0
        elif risk_velocity > 0.0:
            remaining_risk = 0.75 - current_risk
            expected_failure_horizon_days = remaining_risk / risk_velocity
        else:
            expected_failure_horizon_days = None

        return RiskMetrics(
            project_id=project_id,
            current_risk=round(current_risk, 4),
            previous_risk=round(previous_risk, 4),
            risk_delta=round(risk_delta, 4),
            risk_velocity=round(risk_velocity, 6),
            risk_acceleration=round(risk_acceleration, 6),
            consecutive_deterioration=consecutive_deterioration,
            warning_persistence_days=round(warning_persistence_days, 1),
            expected_failure_horizon_days=round(expected_failure_horizon_days, 1) if expected_failure_horizon_days is not None else None,
            early_warning_lead_time_days=round(early_warning_lead_time_days, 1),
            current_state=current_state,
        )

    def evaluate_and_generate_alerts(
        self,
        project_id: str,
        metrics: RiskMetrics,
        project_impact_weight: float = 1.0
    ) -> Optional[EarlyWarningAlert]:
        """
        Evaluates risk metrics, applies trigger conditions, computes priority score,
        enforces cooldown deduplication, and returns an EarlyWarningAlert if triggered.
        """
        triggers: List[str] = []
        alert_type: Optional[AlertType] = None
        severity = SeverityLevel.LOW

        # Trigger 1: Threshold Crossing
        if metrics.current_risk >= 0.75:
            triggers.append("Risk crossed Critical threshold (>= 0.75)")
            alert_type = AlertType.THRESHOLD_CROSSING
            severity = SeverityLevel.CRITICAL
        elif metrics.current_risk >= 0.50 and metrics.previous_risk < 0.50:
            triggers.append("Risk crossed High threshold (>= 0.50)")
            alert_type = AlertType.THRESHOLD_CROSSING
            severity = SeverityLevel.HIGH

        # Trigger 2: Rapid Acceleration or Velocity
        if metrics.risk_acceleration > 0.001 or metrics.risk_velocity > 0.002:
            triggers.append(f"Rapid risk velocity/acceleration (v={metrics.risk_velocity:.4f}/day)")
            if not alert_type:
                alert_type = AlertType.RAPID_ACCELERATION
                severity = SeverityLevel.HIGH if metrics.current_risk >= 0.40 else SeverityLevel.MEDIUM

        # Trigger 3: Repeated Deterioration
        if metrics.consecutive_deterioration >= 3:
            triggers.append(f"Repeated deterioration for {metrics.consecutive_deterioration} consecutive periods")
            if not alert_type:
                alert_type = AlertType.REPEATED_DETERIORATION
                severity = SeverityLevel.MEDIUM

        # Trigger 4: Convergent Risk
        if len(triggers) >= 2:
            alert_type = AlertType.CONVERGENT_RISK
            severity = SeverityLevel.CRITICAL if metrics.current_risk >= 0.60 else SeverityLevel.HIGH

        if not triggers or not alert_type:
            return None # No alert condition met

        # Urgency Factor
        if metrics.expected_failure_horizon_days is not None:
            if metrics.expected_failure_horizon_days <= 30:
                urgency = 3.0
            elif metrics.expected_failure_horizon_days <= 90:
                urgency = 2.0
            else:
                urgency = 1.0
        else:
            urgency = 1.0

        # Prioritization Formula: Priority = Risk * Impact * Urgency
        priority_score = metrics.current_risk * project_impact_weight * urgency

        # Cooldown & Deduplication Check
        if self._is_alert_in_cooldown(project_id, alert_type, severity):
            logger.info(f"Alert suppressed due to cooldown logic: {project_id} | {alert_type}")
            return None

        # Recommended Review Window
        if severity == SeverityLevel.CRITICAL:
            review_window = "24 Hours (Immediate Intervention)"
        elif severity == SeverityLevel.HIGH:
            review_window = "3 Days (Executive Review)"
        elif severity == SeverityLevel.MEDIUM:
            review_window = "7 Days (Next Weekly Review)"
        else:
            review_window = "14 Days (Standard Review)"

        now_str = datetime.utcnow().isoformat() + "Z"
        alert = EarlyWarningAlert(
            alert_id=f"ALT_{project_id}_{int(datetime.utcnow().timestamp())}",
            project_id=project_id,
            alert_type=alert_type,
            severity=severity,
            risk_score=metrics.current_risk,
            previous_score=metrics.previous_risk,
            trigger="; ".join(triggers),
            priority_score=round(priority_score, 2),
            timestamp=now_str,
            recommended_review_window=review_window,
        )

        self.alert_history.append(alert)
        return alert

    def _is_alert_in_cooldown(
        self,
        project_id: str,
        alert_type: AlertType,
        severity: SeverityLevel
    ) -> bool:
        """Enforces cooldown window to eliminate alert fatigue."""
        now = datetime.utcnow()
        for past in reversed(self.alert_history):
            if past.project_id == project_id and past.alert_type == alert_type:
                past_dt = pd_timestamp(past.timestamp)
                elapsed_days = (now - past_dt).total_seconds() / 86400.0
                if elapsed_days < self.cooldown_days:
                    # Escalation bypass: if severity increased, allow alert!
                    if severity == SeverityLevel.CRITICAL and past.severity != SeverityLevel.CRITICAL:
                        return False
                    return True
        return False


def pd_timestamp(ts: Any) -> datetime:
    """Helper to parse datetime strings or objects."""
    if isinstance(ts, datetime):
        return ts
    ts_str = str(ts).replace("Z", "")
    try:
        return datetime.fromisoformat(ts_str)
    except Exception:
        return datetime.utcnow()
