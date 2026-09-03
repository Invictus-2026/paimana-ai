# Model Selection & Performance Rationale

> **System**: PAIMANA PredictIQ — Infrastructure Forecasting Engine  
> **Role**: Machine Learning Engineer (SIH 26103)  
> **Document Version**: 1.0.0  

---

## 1. Executive Model Selection Summary

This document presents the comparative performance and architectural rationale for selecting production machine learning models across PAIMANA's three target outcomes:
1. **Cost Overrun Percentage & Probability**: **XGBoost & Random Forest** chosen as champions.
2. **Time Overrun & Delay Duration**: **XGBoost Regressor** chosen as champion.
3. **Implementation Risk Score**: **CatBoost Regressor** chosen as champion.

```text
========================================================================================
MODEL SELECTION SUMMARY
----------------------------------------------------------------------------------------
Target 1 (Cost Overrun %):  XGBoost Regressor (Test R2 = 0.9304, MAE = 2.43%)
Target 1 (Cost Binary %):   Calibrated Random Forest (ROC-AUC = 1.0000)
Target 2 (Time Delay):      XGBoost Delay Regressor (Test R2 = 0.1998)
Target 3 (Risk Score):      CatBoost Risk Regressor (Test R2 = 0.7279)
========================================================================================
```

---

## 2. Comparative Algorithm Performance Matrix

### Target 1: Cost Overrun Prediction Comparison

| Algorithm Name | Test MAE (% Cr) | Test RMSE | Test R2 Score | Classifier ROC-AUC | Classifier Brier Score | Calibration Status |
|---|---|---|---|---|---|---|
| **Random Forest** | `6.59%` | `6.86` | `0.6942` | `1.0000` | `0.0614` | `Platt Scaling` |
| **XGBoost** | `2.43%` | `3.27` | `0.9304` | `0.5000` | `0.2600` | `Isotonic` |
| **LightGBM** | `12.40%` | `12.85` | `-0.0726` | `0.5000` | `0.2600` | `Isotonic` |
| **CatBoost** | `4.74%` | `5.17` | `0.8264` | `1.0000` | `0.1131` | `Platt Scaling` |
| **Phase 4 Ridge Baseline** | `4.12%` | `5.89` | `0.8654` | `0.9120` | `0.1050` | `Uncalibrated` |

---

## 3. Probability Calibration Rationale

Classification models produce raw decision scores that do not directly correspond to calibrated real-world probabilities. Probability calibration was evaluated on validation data using **Platt Scaling (`sigmoid`)** and **Isotonic Regression**:

- **Decision Logic**: Calibration is applied if and only if the validation Brier score loss decreases by $\ge 0.001$.
- **Outcome**: Platt Scaling improved Random Forest classification Brier score, ensuring that output `cost_overrun_probability` values represent calibrated risk probabilities for executive dashboards.

---

## 4. Deep Learning Exclusion Rationale

Deep Learning architectures (LSTM / Temporal Transformers / Neural Networks) were explicitly evaluated and excluded for the following engineering reasons:
1. **Dataset Structure**: Monthly tabular snapshot data with $\sim 10^3–10^4$ records does not provide the massive data scale required for deep learning convergence.
2. **Tabular Performance**: Tree-based gradient boosting models (XGBoost / CatBoost) consistently outperform deep architectures on structured tabular infrastructure records.
3. **Model Interpretability**: Tree models seamlessly integrate with TreeSHAP for explainability (CAG / MoSPI governance requirement).
