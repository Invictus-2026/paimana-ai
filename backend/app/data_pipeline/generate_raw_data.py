import json
import pandas as pd
import numpy as np
from pathlib import Path

def generate_raw_sample_data():
    raw_dir = Path("data/raw")
    raw_dir.mkdir(parents=True, exist_ok=True)

    # 1. CSV raw file: Projects batch 1 (2025-2026 updates)
    csv_data = [
        # Normal record
        {"Proj_ID": "PRJ-1001", "Project_Name": "Mumbai Metro Line 7A", "Ministry": "Ministry of Housing & Urban Affairs", "Sector": "Transport & Logistics", "State": "Maharashtra", "Sanctioned_Cost_Cr": 1200.5, "Latest_Cost_Cr": 1450.0, "Exp_Incurred_Cr": 650.0, "Approved_Date": "2021-04-15", "Planned_End_Date": "2025-12-31", "Anticipated_End_Date": "2026-10-30", "Obs_Date": "2025-10-01", "Physical_Progress": 45.0, "Delay_Reason": "Land Acquisition"},
        {"Proj_ID": "PRJ-1001", "Project_Name": "Mumbai Metro Line 7A", "Ministry": "Ministry of Housing & Urban Affairs", "Sector": "Transport & Logistics", "State": "Maharashtra", "Sanctioned_Cost_Cr": 1200.5, "Latest_Cost_Cr": 1450.0, "Exp_Incurred_Cr": 720.0, "Approved_Date": "2021-04-15", "Planned_End_Date": "2025-12-31", "Anticipated_End_Date": "2026-11-30", "Obs_Date": "2025-11-01", "Physical_Progress": 50.0, "Delay_Reason": "Civil Works Delay"},
        {"Proj_ID": "PRJ-1001", "Project_Name": "Mumbai Metro Line 7A", "Ministry": "Ministry of Housing & Urban Affairs", "Sector": "Transport & Logistics", "State": "Maharashtra", "Sanctioned_Cost_Cr": 1200.5, "Latest_Cost_Cr": 1500.0, "Exp_Incurred_Cr": 810.0, "Approved_Date": "2021-04-15", "Planned_End_Date": "2025-12-31", "Anticipated_End_Date": "2026-12-31", "Obs_Date": "2025-12-01", "Physical_Progress": 56.5, "Delay_Reason": "Vendor Failure"},
        
        # Duplicate record (to test stage 4 duplicate detection)
        {"Proj_ID": "PRJ-1001", "Project_Name": "Mumbai Metro Line 7A", "Ministry": "Ministry of Housing & Urban Affairs", "Sector": "Transport & Logistics", "State": "Maharashtra", "Sanctioned_Cost_Cr": 1200.5, "Latest_Cost_Cr": 1500.0, "Exp_Incurred_Cr": 810.0, "Approved_Date": "2021-04-15", "Planned_End_Date": "2025-12-31", "Anticipated_End_Date": "2026-12-31", "Obs_Date": "2025-12-01", "Physical_Progress": 56.5, "Delay_Reason": "Vendor Failure"},

        # Project 1002 with anomalies (Negative expenditure & progress > 100%)
        {"Proj_ID": "PRJ-1002", "Project_Name": "Delhi-Meerut RRTS Corridor", "Ministry": "Ministry of Railways", "Sector": "Railways", "State": "Delhi", "Sanctioned_Cost_Cr": 30274.0, "Latest_Cost_Cr": 30274.0, "Exp_Incurred_Cr": 12500.0, "Approved_Date": "2019-03-01", "Planned_End_Date": "2025-06-30", "Anticipated_End_Date": "2025-12-31", "Obs_Date": "2025-10-01", "Physical_Progress": 78.0, "Delay_Reason": "None"},
        {"Proj_ID": "PRJ-1002", "Project_Name": "Delhi-Meerut RRTS Corridor", "Ministry": "Ministry of Railways", "Sector": "Railways", "State": "Delhi", "Sanctioned_Cost_Cr": 30274.0, "Latest_Cost_Cr": 30274.0, "Exp_Incurred_Cr": -500.0, "Approved_Date": "2019-03-01", "Planned_End_Date": "2025-06-30", "Anticipated_End_Date": "2025-12-31", "Obs_Date": "2025-11-01", "Physical_Progress": 82.0, "Delay_Reason": "None"}, # Negative expenditure anomaly
        {"Proj_ID": "PRJ-1002", "Project_Name": "Delhi-Meerut RRTS Corridor", "Ministry": "Ministry of Railways", "Sector": "Railways", "State": "Delhi", "Sanctioned_Cost_Cr": 30274.0, "Latest_Cost_Cr": 30274.0, "Exp_Incurred_Cr": 14000.0, "Approved_Date": "2019-03-01", "Planned_End_Date": "2025-06-30", "Anticipated_End_Date": "2025-12-31", "Obs_Date": "2025-12-01", "Physical_Progress": 105.0, "Delay_Reason": "None"}, # Physical progress > 100% anomaly
    ]
    df_csv = pd.DataFrame(csv_data)
    df_csv.to_csv(raw_dir / "projects_batch1.csv", index=False)

    # 2. JSON raw file: Projects batch 2 (Nested structure)
    json_data = [
        {
            "id": "1003",
            "title": "Polavaram Irrigation Project",
            "ministry": "Ministry of Jal Shakti",
            "sector": "Water Resources",
            "location_state": "Andhra Pradesh",
            "financials": {
                "approved_budget_cr": 55548.8,
                "revised_budget_cr": 55548.8,
                "cumulative_spent_cr": 22000.0
            },
            "timeline": {
                "start_date": "2014-03-01",
                "planned_completion": "2024-03-31",
                "revised_completion": "2027-06-30"
            },
            "observation_period": "2025-10-01",
            "progress_percent": 62.0,
            "delay_classification": "Environmental Clearance"
        },
        {
            "id": "1003",
            "title": "Polavaram Irrigation Project",
            "ministry": "Ministry of Jal Shakti",
            "sector": "Water Resources",
            "location_state": "Andhra Pradesh",
            "financials": {
                "approved_budget_cr": 55548.8,
                "revised_budget_cr": 55548.8,
                "cumulative_spent_cr": 22800.0
            },
            "timeline": {
                "start_date": "2014-03-01",
                "planned_completion": "2024-03-31",
                "revised_completion": "2027-06-30"
            },
            "observation_period": "2025-11-01",
            "progress_percent": 63.5,
            "delay_classification": "Environmental Clearance"
        },
        {
            "id": "1003",
            "title": "Polavaram Irrigation Project",
            "ministry": "Ministry of Jal Shakti",
            "sector": "Water Resources",
            "location_state": "Andhra Pradesh",
            "financials": {
                "approved_budget_cr": 55548.8,
                "revised_budget_cr": 55548.8,
                "cumulative_spent_cr": 23500.0
            },
            "timeline": {
                "start_date": "2014-03-01",
                "planned_completion": "2024-03-31",
                "revised_completion": "2027-06-30"
            },
            "observation_period": "2025-12-01",
            "progress_percent": 65.0,
            "delay_classification": "Environmental Clearance"
        }
    ]
    with open(raw_dir / "projects_batch2.json", "w") as f:
        json.dump(json_data, f, indent=2)

    # 3. Excel raw file: Sector Energy Monitoring
    excel_data = [
        {"project_code": "PROJ-1004", "project_name": "Kudankulam Nuclear Power Units 3&4", "ministry": "Department of Atomic Energy", "sector": "Power", "state": "Tamil Nadu", "original_cost": 39849.0, "revised_cost": 49621.0, "spent_cost": 28000.0, "start_dt": "2017-06-01", "original_end": "2023-03-31", "revised_end": "2027-12-31", "month_year": "2025-10-01", "physical_completion": 70.0, "issue_category": "Vendor Supply"},
        {"project_code": "PROJ-1004", "project_name": "Kudankulam Nuclear Power Units 3&4", "ministry": "Department of Atomic Energy", "sector": "Power", "state": "Tamil Nadu", "original_cost": 39849.0, "revised_cost": 49621.0, "spent_cost": 28900.0, "start_dt": "2017-06-01", "original_end": "2023-03-31", "revised_end": "2027-12-31", "month_year": "2025-11-01", "physical_completion": 71.2, "issue_category": "Vendor Supply"},
        {"project_code": "PROJ-1004", "project_name": "Kudankulam Nuclear Power Units 3&4", "ministry": "Department of Atomic Energy", "sector": "Power", "state": "Tamil Nadu", "original_cost": 39849.0, "revised_cost": 49621.0, "spent_cost": 29800.0, "start_dt": "2017-06-01", "original_end": "2023-03-31", "revised_end": "2027-12-31", "month_year": "2025-12-01", "physical_completion": 72.8, "issue_category": "Vendor Supply"},
    ]
    df_excel = pd.DataFrame(excel_data)
    df_excel.to_excel(raw_dir / "energy_sector_monitoring.xlsx", index=False)

    # 4. PDF-derived table export (CSV format with PDF artifact columns)
    pdf_derived_data = [
        {"pdf_page": 14, "raw_id_col": "PRJ_1005", "project_title": "Chardham National Highway Connectivity", "ministry_name": "Ministry of Road Transport & Highways", "sector_group": "Road Transport", "state_name": "Uttarakhand", "cost_approved": 12000.0, "cost_revised": 12000.0, "expenditure_total": 8500.0, "date_sanctioned": "2016-12-01", "date_target": "2022-03-31", "date_anticipated": "2026-06-30", "report_month": "2025-10-01", "progress_pct_scale_100": 80.0, "reason_delay": "Land Acquisition & Eco-sensitive Clearances"},
        {"pdf_page": 14, "raw_id_col": "PRJ_1005", "project_title": "Chardham National Highway Connectivity", "ministry_name": "Ministry of Road Transport & Highways", "sector_group": "Road Transport", "state_name": "Uttarakhand", "cost_approved": 12000.0, "cost_revised": 12000.0, "expenditure_total": 8900.0, "date_sanctioned": "2016-12-01", "date_target": "2022-03-31", "date_anticipated": "2026-06-30", "report_month": "2025-11-01", "progress_pct_scale_100": 81.5, "reason_delay": "Land Acquisition & Eco-sensitive Clearances"},
        {"pdf_page": 14, "raw_id_col": "PRJ_1005", "project_title": "Chardham National Highway Connectivity", "ministry_name": "Ministry of Road Transport & Highways", "sector_group": "Road Transport", "state_name": "Uttarakhand", "cost_approved": 12000.0, "cost_revised": 12000.0, "expenditure_total": 9400.0, "date_sanctioned": "2016-12-01", "date_target": "2022-03-31", "date_anticipated": "2026-06-30", "report_month": "2025-12-01", "progress_pct_scale_100": 83.0, "reason_delay": "Land Acquisition & Eco-sensitive Clearances"},
    ]
    df_pdf = pd.DataFrame(pdf_derived_data)
    df_pdf.to_csv(raw_dir / "pdf_flash_report_extracted.csv", index=False)
    print("Raw sample datasets created in data/raw/")

if __name__ == "__main__":
    generate_raw_sample_data()
