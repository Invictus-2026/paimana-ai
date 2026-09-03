# Explainable AI (XAI) Architecture & SHAP Methodology

> **System**: PAIMANA PredictIQ — MoSPI Infrastructure Monitoring Platform  
> **Module**: Explainable AI Layer (`ml.explainability.shap_explainer`)  
> **Target Audience**: Government Project Managers, Cabinet Secretariat, & Auditors  

---

## 1. Core Objective & Philosophy

Machine learning predictions in public infrastructure governance cannot operate as "black boxes." When PAIMANA PredictIQ flags a project with a high implementation risk score (e.g. $\text{Risk} = 0.84$), government decision-makers require **interpretable, defensible justification** detailing *why* the model assigned that score.

The Explainable AI (XAI) layer decomposes every prediction into:
1. **Risk Drivers (Positive Attributions)**: Features that pushed the predicted risk score higher.
2. **Protective Factors (Negative Attributions)**: Operational strengths that mitigated risk score escalation.
3. **Non-Causal Probabilistic Framing**: Language engineered to prevent executive misinterpretation regarding physical causality.

---

## 2. SHAP (SHapley Additive exPlanations) Methodology

PAIMANA utilizes **TreeSHAP**—a game-theoretic approach that calculates exact Shapley values for tree-based models (XGBoost, CatBoost, LightGBM, Random Forest).

### Mathematical Definition
For a project feature vector $x = (x_1, x_2, \dots, x_M)$, the prediction $f(x)$ is decomposed as:

$$f(x) = \phi_0 + \sum_{i=1}^M \phi_i$$

Where:
- $\phi_0$: Expected baseline value (average prediction across the training dataset).
- $\phi_i$: Local SHAP contribution score for feature $i$.
- $x_i$: Actual observed feature value for the project.

---

## 3. Explanation Structure & Schema

Every project risk prediction produces a `ProjectExplanationOutput` object:

```json
{
  "project_id": "P123_RAILWAY_EXPANSION",
  "risk_score": 0.84,
  "risk_level": "Critical",
  "drivers": [
    {
      "feature_name": "milestone_slippage_rate",
      "shap_value": 0.21,
      "actual_value": 0.65,
      "description": "Ratio of Missed Milestone Targets (value: 0.65) contributed +0.2100 toward increased risk."
    },
    {
      "feature_name": "progress_gap_pct",
      "shap_value": 0.17,
      "actual_value": 18.5,
      "description": "Physical Progress vs. Elapsed Time Divergence (%) (value: 18.50) contributed +0.1700 toward increased risk."
    }
  ],
  "protective_factors": [
    {
      "feature_name": "progress_velocity_mom",
      "shap_value": -0.06,
      "actual_value": 2.8,
      "description": "Month-over-Month Physical Progress Velocity (value: 2.80) acted as a protective factor (-0.0600)."
    }
  ],
  "model_version": "PAIMANA-ML-v1.0.0",
  "prediction_timestamp": "2026-09-02T21:27:00Z",
  "disclaimer": "NOTICE: Feature attributions represent SHAP statistical values within the predictive model. They indicate feature influence on the model output and DO NOT constitute direct causal proof of delay or failure."
}
```

---

## 4. Government Stakeholder Language & Non-Causal Framing

### Regulatory & Policy Guidelines
To maintain scientific and legal integrity:
- **Never Claim Causality**: SHAP values measure statistical attribution within a statistical model, not physical causality in project execution.
- **Approved Terminology**:
  - ✅ *"Milestone slippage contributed +0.21 to the model's elevated risk score."*
  - ❌ *"Milestone slippage caused the project delay."*
- **Executive Summary Terms**: Use intuitive descriptions (e.g., *"Physical Progress vs. Elapsed Time Divergence"*) rather than raw code variable names (`progress_gap_pct`).

---

## 5. Limitations & Edge Cases

1. **Feature Multicollinearity**: High correlation between `cost_expenditure_ratio` and `progress_physical_pct` can divide SHAP attributions between correlated features.
2. **Missing Feature Fallbacks**: If certain optional features are missing (within the allowed $<20\%$ missingness threshold), SHAP calculation uses mean feature baselines without distorting surrounding drivers.
