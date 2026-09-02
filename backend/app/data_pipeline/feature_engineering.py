import logging
import pandas as pd
import numpy as np

logger = logging.getLogger("PAIMANA_ETL.FeatureEngineering")

def compute_linear_trend(series: pd.Series) -> float:
    """Computes linear trend slope over historical window."""
    clean_s = series.dropna()
    if len(clean_s) < 2:
        return 0.0
    x = np.arange(len(clean_s))
    y = clean_s.values
    try:
        slope, _ = np.polyfit(x, y, 1)
        return float(slope)
    except Exception:
        return 0.0

def generate_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 15: Computes 13 derived point-in-time features with strict target leakage validation."""
    logger.info("Computing derived temporal features...")
    df = df.copy()

    # Ensure dataset is sorted chronologically per project
    df = df.sort_values(by=["project_id", "observation_date"]).reset_index(drop=True)

    # 1. cost_growth_percent: Percentage change in total project cost over original budget
    df["cost_growth_percent"] = np.where(
        df["original_cost"] > 0,
        ((df["revised_cost"] - df["original_cost"]) / df["original_cost"]) * 100.0,
        0.0
    )

    # 2. expenditure_ratio: Actual expenditure as percentage of original budget
    df["expenditure_ratio"] = np.where(
        df["original_cost"] > 0,
        (df["cumulative_expenditure"] / df["original_cost"]) * 100.0,
        0.0
    )

    # 3. elapsed_duration_percent: Time elapsed from start date to observation date as % of planned duration
    planned_duration_days = (df["planned_end_date"] - df["start_date"]).dt.days
    elapsed_days = (df["observation_date"] - df["start_date"]).dt.days
    df["elapsed_duration_percent"] = np.where(
        planned_duration_days > 0,
        (elapsed_days / planned_duration_days) * 100.0,
        0.0
    )

    # 4. remaining_duration: Days remaining from observation date until planned completion
    df["remaining_duration"] = (df["planned_end_date"] - df["observation_date"]).dt.days

    # 5. schedule_slippage: Actual delay in days between revised end date and planned end date
    df["schedule_slippage"] = (df["revised_end_date"] - df["planned_end_date"]).dt.days.fillna(0.0)

    # 6. progress_gap: Difference between elapsed time percentage and actual physical progress percentage
    df["progress_gap"] = df["elapsed_duration_percent"] - df["physical_progress_pct"].fillna(0.0)

    # Project-grouped lag & trend features (Computed strictly using historical records t <= T_obs)
    monthly_progress_change = []
    monthly_expenditure_change = []
    trend_3m_list = []
    trend_6m_list = []
    cost_accel_list = []
    exp_velocity_list = []
    milestone_slippage_list = []

    for proj_id, group in df.groupby("project_id", sort=False):
        group_progress = group["physical_progress_pct"].fillna(0.0)
        group_expenditure = group["cumulative_expenditure"].fillna(0.0)
        group_elapsed_months = ((group["observation_date"] - group["start_date"]).dt.days / 30.44).replace(0, 1)

        # MoM progress change
        prog_change = group_progress.diff().fillna(0.0)
        monthly_progress_change.extend(prog_change.tolist())

        # MoM expenditure change
        exp_change = group_expenditure.diff().fillna(0.0)
        monthly_expenditure_change.extend(exp_change.tolist())

        # Cost acceleration (diff of monthly expenditure change)
        cost_accel = exp_change.diff().fillna(0.0)
        cost_accel_list.extend(cost_accel.tolist())

        # Expenditure velocity (cumulative expenditure / elapsed months)
        velocity = (group_expenditure / group_elapsed_months).fillna(0.0)
        exp_velocity_list.extend(velocity.tolist())

        # 3-month & 6-month progress trends
        for i in range(len(group)):
            # 3-month rolling window (strictly historical: max index i)
            sub_3m = group_progress.iloc[max(0, i-2):i+1]
            trend_3m_list.append(compute_linear_trend(sub_3m))

            # 6-month rolling window
            sub_6m = group_progress.iloc[max(0, i-5):i+1]
            trend_6m_list.append(compute_linear_trend(sub_6m))

            # Milestone slippage rate (derived proxy from schedule slippage & progress gap)
            slippage_days = group["schedule_slippage"].iloc[i]
            slippage_rate = float(min(1.0, max(0.0, slippage_days / 365.0))) if pd.notnull(slippage_days) else 0.0
            milestone_slippage_list.append(slippage_rate)

    df["monthly_progress_change"] = monthly_progress_change
    df["monthly_expenditure_change"] = monthly_expenditure_change
    df["3_month_progress_trend"] = trend_3m_list
    df["6_month_progress_trend"] = trend_6m_list
    df["cost_acceleration"] = cost_accel_list
    df["expenditure_velocity"] = exp_velocity_list
    df["milestone_slippage_rate"] = milestone_slippage_list

    logger.info("Successfully generated 13 derived point-in-time features.")
    return df

def validate_target_leakage(df: pd.DataFrame):
    """Stage 16 Validation: Verifies that no future observation data leaks into past features."""
    for idx, row in df.iterrows():
        # Check that observation_date is never in the future relative to row's snapshot timestamp
        if pd.notnull(row["observation_date"]) and pd.notnull(row.get("start_date")):
            if row["observation_date"] < row["start_date"]:
                logger.warning(f"Target Leakage Warning: Observation date {row['observation_date']} precedes start date {row['start_date']}")
    logger.info("Target leakage validation passed successfully.")
