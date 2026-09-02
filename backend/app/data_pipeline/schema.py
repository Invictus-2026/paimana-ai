from typing import Dict, List

CANONICAL_COLUMNS = [
    "project_id",
    "project_name",
    "ministry_name",
    "sector",
    "state_location",
    "original_cost",
    "revised_cost",
    "cumulative_expenditure",
    "start_date",
    "planned_end_date",
    "revised_end_date",
    "observation_date",
    "physical_progress_pct",
    "delay_reason_category",
    "is_duplicate",
    "quality_flags",
]

# Field mapping dictionary for flexible schema normalization across raw input files
COLUMN_ALIASES: Dict[str, str] = {
    # Project ID
    "Proj_ID": "project_id",
    "id": "project_id",
    "project_code": "project_id",
    "raw_id_col": "project_id",
    "Project_ID": "project_id",
    
    # Project Name
    "Project_Name": "project_name",
    "title": "project_name",
    "project_title": "project_name",
    "Name": "project_name",
    
    # Ministry
    "Ministry": "ministry_name",
    "ministry": "ministry_name",
    "ministry_name": "ministry_name",
    
    # Sector
    "Sector": "sector",
    "sector": "sector",
    "sector_group": "sector",
    
    # State / Location
    "State": "state_location",
    "location_state": "state_location",
    "state_name": "state_location",
    "state": "state_location",
    
    # Costs
    "Sanctioned_Cost_Cr": "original_cost",
    "approved_budget_cr": "original_cost",
    "original_cost": "original_cost",
    "cost_approved": "original_cost",
    "Original_Cost": "original_cost",
    
    "Latest_Cost_Cr": "revised_cost",
    "revised_budget_cr": "revised_cost",
    "revised_cost": "revised_cost",
    "cost_revised": "revised_cost",
    "Revised_Cost": "revised_cost",
    
    "Exp_Incurred_Cr": "cumulative_expenditure",
    "cumulative_spent_cr": "cumulative_expenditure",
    "spent_cost": "cumulative_expenditure",
    "expenditure_total": "cumulative_expenditure",
    "Cumulative_Expenditure": "cumulative_expenditure",
    
    # Dates
    "Approved_Date": "start_date",
    "start_date": "start_date",
    "start_dt": "start_date",
    "date_sanctioned": "start_date",
    
    "Planned_End_Date": "planned_end_date",
    "planned_completion": "planned_end_date",
    "original_end": "planned_end_date",
    "date_target": "planned_end_date",
    
    "Anticipated_End_Date": "revised_end_date",
    "revised_completion": "revised_end_date",
    "revised_end": "revised_end_date",
    "date_anticipated": "revised_end_date",
    
    "Obs_Date": "observation_date",
    "observation_period": "observation_date",
    "month_year": "observation_date",
    "report_month": "observation_date",
    
    # Physical Progress
    "Physical_Progress": "physical_progress_pct",
    "progress_percent": "physical_progress_pct",
    "physical_completion": "physical_progress_pct",
    "progress_pct_scale_100": "physical_progress_pct",
    
    # Delay Reason
    "Delay_Reason": "delay_reason_category",
    "delay_classification": "delay_reason_category",
    "issue_category": "delay_reason_category",
    "reason_delay": "delay_reason_category",
}
