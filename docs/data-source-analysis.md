# Data Source Analysis: PAIMANA Ecosystem

> **Role**: Data Research Lead, SIH 26103 PAIMANA PredictIQ  
> **Date**: September 2, 2026  
> **Status**: Verified Data Discovery & Acquisition Assessment  

---

## 1. Executive Summary & Provenance Investigation

This document provides a rigorous data discovery and acquisition analysis for the **PAIMANA (Project Assessment, Infrastructure Monitoring & Analytics National Application)** platform, managed by the **Infrastructure and Project Monitoring Division (IPMD)** under the **Ministry of Statistics and Programme Implementation (MoSPI), Government of India**, developed in technical collaboration with **NeGD (National e-Governance Division)**.

### Primary Portal Probe Findings (`https://paimana-proj.mospi.gov.in/`)
An investigation of the primary PAIMANA portal endpoints yielded the following empirical findings:

1. **`https://paimana-proj.mospi.gov.in/ReportPage`**:
   - Status: Active web interface for publication links ("Project Monitoring", "Performance Monitoring", "Public Dashboard").
   - Finding: Public direct data download pages are currently displaying transition notices ("Coming Soon") as NeGD migrates legacy OCMS (Online Computerized Monitoring System) features into the new PAIMANA stack.

2. **`https://paimana-proj.mospi.gov.in/Home/PublicDashboardNew`**:
   - Status: Active high-level executive visualization dashboard.
   - Finding: Exposes aggregated macro metrics (*Total Project Count*, *Original Approved Cost (in Cr)*, *Latest Revised Cost (in Cr)*, *Cumulative Expenditure (in Cr)*, *Sector-wise Distribution*, *Cost Overview*, *Physical Progress*, *State-wise Distribution*). Granular project-by-project records are rendered client-side via ASP.NET Web API endpoints.

3. **`https://paimana-proj.mospi.gov.in/User/Login`**:
   - Status: Restricted access portal.
   - Finding: Detailed monthly project updates, milestone-level completion logs, and agency-level progress entries require government agency authentication (Ministry Nodal Officers, Project Implementation Units).

4. **Official Secondary Public Sources**:
   - **IPMD Monthly Flash Reports (MoSPI)**: Published monthly for Central Sector Projects costing ₹150 Crore and above. Available as formatted PDF/HTML reports detailing cost overrun, time overrun, and delay reasons.
   - **CAG (Comptroller and Auditor General of India) Audit Reports**: In-depth audit performance reports covering infrastructure execution, milestone delays, and financial irregularities.
   - **Lok Sabha / Rajya Sabha Parliamentary Unstarred & Starred Question Answers**: Official tabular disclosures of infrastructure delay lists and cost escalations released by MoSPI and line ministries.
   - **PM Gati Shakti National Master Plan Data & Line Ministry Portals**: MoRTH (INAM-Pro), Indian Railways (Pink Book), MoHUA (Metro Rail Portal).

---

## 2. Field-Level Data Landscape & Availability Matrix

The following table catalogs every identified field within the PAIMANA ecosystem. Each field is classified according to data type, granularity, historical window, missingness risk, ML usefulness, access method, confidence level, and one of five mandatory availability classifications:

- `AVAILABLE_PUBLIC`: Accessible without authentication.
- `AVAILABLE_RESTRICTED`: Accessible only with government credentials.
- `NOT_FOUND`: Searched but not located in official sources.
- `DERIVABLE`: Computed from primary fields.
- `SYNTHETIC_BACKUP`: Simulated for prototype purposes.

### Data Landscape Table

| Field Name | Category | Description | Data Type | Granularity | Historical Window | Missingness Risk | ML Usefulness | Access Method | Availability Class | Confidence Level |
|---|---|---|---|---|---|---|---|---|---|---|
| `project_id` | Identifiers | Unique government project code / OCMS ID | String / Int | Project-level | 1999–Present | Low | High | Web Scraping / PDF Parse | `AVAILABLE_PUBLIC` | High |
| `project_name` | Identifiers | Official name of infrastructure project | String | Project-level | 1999–Present | Low | High | Web Scraping / PDF Parse | `AVAILABLE_PUBLIC` | High |
| `ministry_name` | Identifiers | Administrative Ministry (e.g., MoR, MoRTH) | String | Project-level | 1999–Present | Low | High | Web Scraping / PDF Parse | `AVAILABLE_PUBLIC` | High |
| `implementing_agency` | Identifiers | Executing PSU / Contractor / Authority (e.g., NHAI, RVNL) | String | Project-level | 2010–Present | Medium | High | PDF Parse / Restricted Portal | `AVAILABLE_RESTRICTED` | Medium |
| `sector_name` | Identifiers | Sector (Roads, Railways, Power, Coal, Petroleum, etc.) | String | Project-level | 1999–Present | Low | High | Public Dashboard / PDF | `AVAILABLE_PUBLIC` | High |
| `state_location` | Identifiers | Primary State / UT of project location | String | Project-level | 1999–Present | Low | High | Public Dashboard / PDF | `AVAILABLE_PUBLIC` | High |
| `district_location` | Identifiers | Specific district or corridor route | String | Project-level | 2015–Present | Medium | Medium | PDF Parse / Restricted Portal | `AVAILABLE_RESTRICTED` | Medium |
| `original_cost` | Financial | Initial sanctioned cost (in ₹ Crore) | Float | Project-level | 1999–Present | Low | High | Public Dashboard / PDF | `AVAILABLE_PUBLIC` | High |
| `revised_cost` | Financial | Latest sanctioned or anticipated cost (in ₹ Crore) | Float | Monthly / Current | 1999–Present | Low | High | Public Dashboard / PDF | `AVAILABLE_PUBLIC` | High |
| `cost_overrun_amount` | Financial | `revised_cost - original_cost` (in ₹ Crore) | Float | Monthly / Current | 1999–Present | Low | High | Derived | `DERIVABLE` | High |
| `cost_overrun_pct` | Financial | `((revised_cost - original_cost) / original_cost) * 100` | Float | Monthly / Current | 1999–Present | Low | High | Derived | `DERIVABLE` | High |
| `cumulative_expenditure` | Financial | Total actual expenditure to date (in ₹ Crore) | Float | Monthly | 1999–Present | Low | High | Public Dashboard / PDF | `AVAILABLE_PUBLIC` | High |
| `financial_progress_pct` | Financial | `(cumulative_expenditure / revised_cost) * 100` | Float | Monthly | 1999–Present | Low | High | Derived | `DERIVABLE` | High |
| `budget_allocation_annual` | Financial | Current fiscal year budget allocation | Float | Annual | 2010–Present | Medium | Medium | Union Budget / PDF | `AVAILABLE_PUBLIC` | Medium |
| `original_start_date` | Temporal | Date of CCEA approval / sanction | Date (YYYY-MM-DD) | Project-level | 1999–Present | Low | High | PDF Parse / Flash Reports | `AVAILABLE_PUBLIC` | High |
| `original_completion_date` | Temporal | Target completion date specified at approval | Date (YYYY-MM-DD) | Project-level | 1999–Present | Low | High | PDF Parse / Flash Reports | `AVAILABLE_PUBLIC` | High |
| `revised_completion_date` | Temporal | Latest anticipated date of commissioning | Date (YYYY-MM-DD) | Monthly | 1999–Present | Low | High | PDF Parse / Flash Reports | `AVAILABLE_PUBLIC` | High |
| `time_overrun_months` | Temporal | Delay duration in months (`revised_date - original_date`) | Float | Monthly | 1999–Present | Low | High | Derived | `DERIVABLE` | High |
| `project_age_months` | Temporal | Months elapsed since original start date | Int | Monthly | 1999–Present | Low | High | Derived | `DERIVABLE` | High |
| `physical_progress_pct` | Progress | Cumulative physical execution completion percentage | Float | Monthly | 2005–Present | Medium | High | Public Dashboard / Flash Report | `AVAILABLE_PUBLIC` | High |
| `milestone_name` | Progress | Name of specific project milestone (e.g., Land Acquisition, Pier Casting) | String | Milestone-level | 2015–Present | High | High | Restricted Portal (PAIMANA Login) | `AVAILABLE_RESTRICTED` | Medium |
| `milestone_target_date` | Progress | Scheduled completion date for milestone | Date (YYYY-MM-DD) | Milestone-level | 2015–Present | High | High | Restricted Portal (PAIMANA Login) | `AVAILABLE_RESTRICTED` | Medium |
| `milestone_actual_date` | Progress | Actual completion date for milestone | Date (YYYY-MM-DD) | Milestone-level | 2015–Present | High | High | Restricted Portal (PAIMANA Login) | `AVAILABLE_RESTRICTED` | Medium |
| `project_status` | Status | Classification (`Under Construction`, `Commissioned`, `Delayed`, `Stalled`) | String | Monthly | 1999–Present | Low | High | Public Dashboard / PDF | `AVAILABLE_PUBLIC` | High |
| `delay_reasons_category` | Status & Issues | Categorized cause of delay (Land Acquisition, Environmental Clearance, Fund Constraint, Civil Works, Law & Order, Vendor) | String (Enum) | Monthly | 2005–Present | Medium | High | Flash Reports / PDF Parsing | `AVAILABLE_PUBLIC` | High |
| `delay_reasons_narrative` | Status & Issues | Unstructured text remarks provided by PIU | Text | Monthly | 2010–Present | High | High | Flash Reports / Restricted Portal | `AVAILABLE_RESTRICTED` | Medium |
| `contractor_performance_score` | Status & Issues | Evaluation metric for EPC contractor execution speed | Float | Annual | N/A | High | High | Not available in public records | `SYNTHETIC_BACKUP` | Low |
| `geospatial_coordinates` | Identifiers | Latitude/Longitude coordinates of project site/corridor | GeoJSON / String | Project-level | N/A | High | Medium | PM Gati Shakti (Restricted) | `SYNTHETIC_BACKUP` | Low |
| `observation_month` | Historical Data | Reporting snapshot month (YYYY-MM) | Date (YYYY-MM) | Snapshot | 1999–Present | Low | High | Flash Reports / Web Scraping | `AVAILABLE_PUBLIC` | High |

---

## 3. Official Endpoints, Reports, and Data Sources Summary

The analysis relied upon the following official endpoints and public domain resources:

1. **PAIMANA Official Portal (`https://paimana-proj.mospi.gov.in/`)**:
   - Primary target for real-time data ingestion.
   - Endpoint: `/Home/PublicDashboardNew` (Macro metrics & sector distribution).
   - Endpoint: `/User/Login` (Restricted gateway for granular milestone and monthly observation data).

2. **MoSPI IPMD Monthly Flash Reports**:
   - Official monthly publications covering 1,500+ Central Sector Projects costing ₹150 Crore and above.
   - Format: PDF documents containing structured tables of cost/schedule overruns and delay classifications.

3. **Parliamentary Records & PIB Disclosures**:
   - Lok Sabha / Rajya Sabha Starred & Unstarred Answers (Ministry of Statistics and Programme Implementation).
   - Discloses project-wise original vs. revised cost, delay reasons, and commissioning targets.

4. **CAG Infrastructure Audit Reports**:
   - Sector-wise performance audit reports (Railways, Highways, Power, Water Resources).
