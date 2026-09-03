"""Tests for real-dataset column alias mapping in the ETL ingestion stage."""

import pandas as pd
from app.data_pipeline.ingestion import flatten_and_map_columns


def test_real_dataset_headers_map_to_canonical_columns():
    """Real MoSPI CSV headers (with embedded newlines) must map to canonical names."""
    df = pd.DataFrame({
        "Sr.No.": [1],
        "Sector": ["Roads & Highways"],
        "Line Ministry": ["Ministry of Road Transport & Highways"],
        "ProjectID": ["617885"],
        "Project Name": ["Test Road Project"],
        "Original Cost\n(in Cr)": [302.88],
        "Latest Revised Cost\n(in Cr)": [302.88],
        "Expenditure (Cumm.)\n(in Cr)": [187.77],
    })

    mapped_df, schema_report = flatten_and_map_columns(df, "paimana_projects_master.csv")

    assert "project_id" in mapped_df.columns
    assert "project_name" in mapped_df.columns
    assert "ministry_name" in mapped_df.columns
    assert "sector" in mapped_df.columns
    assert "original_cost" in mapped_df.columns
    assert "revised_cost" in mapped_df.columns
    assert "cumulative_expenditure" in mapped_df.columns

    assert mapped_df["project_id"].iloc[0] == "617885"
    assert mapped_df["ministry_name"].iloc[0] == "Ministry of Road Transport & Highways"
    assert mapped_df["original_cost"].iloc[0] == 302.88
    assert mapped_df["revised_cost"].iloc[0] == 302.88
    assert mapped_df["cumulative_expenditure"].iloc[0] == 187.77

    # Sr.No. has no canonical mapping and should be reported unmapped, not dropped
    assert "Sr.No." in schema_report["unmapped_columns"]
