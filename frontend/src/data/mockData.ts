export interface ProjectData {
  id: number;
  name: string;
  code: string;
  sector: string;
  ministry: string;
  state: string;
  budgetCr: number;
  revisedBudgetCr: number;
  overallRiskScore: number; // 0 - 100
  costRiskScore: number;    // 0 - 100
  delayRiskScore: number;   // 0 - 100
  executionRiskScore: number; // 0 - 100
  status: 'Critical' | 'At Risk' | 'Moderate' | 'Active' | 'Completed';
  costOverrunPct: number;
  scheduleDelayDays: number;
  nextMilestone: string;
  nextMilestoneDate: string;
  plannedCompletionDate: string;
  forecastCompletionDate: string;
  earlyWarningLeadMonths: number;
  topRiskDrivers: {
    driver: string;
    shapContribution: number;
    description: string;
    category: 'milestone' | 'cost' | 'contractor' | 'land' | 'weather';
  }[];
  monthlyRiskHistory: { month: string; score: number }[];
}

export interface StateRiskData {
  state: string;
  projectCount: number;
  totalBudgetCr: number;
  avgRiskScore: number;
  criticalCount: number;
  costRiskLevel: 'high' | 'medium' | 'low';
  delayRiskLevel: 'high' | 'medium' | 'low';
  executionRiskLevel: 'high' | 'medium' | 'low';
}

export interface InterventionData {
  id: string;
  projectId: number;
  projectName: string;
  ministry: string;
  state: string;
  currentRiskScore: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  recommendedAction: string;
  estimatedRiskImpact: string;
  estimatedTimelineImpact: string;
  status: 'Proposed' | 'Under Review' | 'Approved' | 'Rejected';
  assignedOfficer: string;
  evidence: string;
  lastUpdated: string;
}

export const MOCK_PROJECTS: ProjectData[] = [
  {
    id: 1,
    name: 'Mumbai-Ahmedabad High Speed Rail',
    code: 'MAHSR-01',
    sector: 'Railways',
    ministry: 'Ministry of Railways',
    state: 'Gujarat',
    budgetCr: 110000,
    revisedBudgetCr: 130350,
    overallRiskScore: 82,
    costRiskScore: 75,
    delayRiskScore: 88,
    executionRiskScore: 80,
    status: 'Critical',
    costOverrunPct: 18.5,
    scheduleDelayDays: 240,
    nextMilestone: 'Land Acquisition Package C3 & Pier Curing',
    nextMilestoneDate: '2026-10-15',
    plannedCompletionDate: '2027-12-31',
    forecastCompletionDate: '2028-08-30',
    earlyWarningLeadMonths: 5.2,
    topRiskDrivers: [
      { driver: 'Land Acquisition Bottleneck', shapContribution: +0.28, description: 'Package C3 ROW handovers delayed in Palghar border section', category: 'land' },
      { driver: 'Milestone Slippage', shapContribution: +0.22, description: 'Viaduct casting rate 34% below target monthly run rate', category: 'milestone' },
      { driver: 'Cost Acceleration', shapContribution: +0.16, description: 'Specialized steel girder procurement costs increased by 14%', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 48 }, { month: 'Jun 25', score: 52 }, { month: 'Jul 25', score: 55 },
      { month: 'Aug 25', score: 60 }, { month: 'Sep 25', score: 64 }, { month: 'Oct 25', score: 68 },
      { month: 'Nov 25', score: 71 }, { month: 'Dec 25', score: 74 }, { month: 'Jan 26', score: 76 },
      { month: 'Feb 26', score: 79 }, { month: 'Mar 26', score: 80 }, { month: 'Apr 26', score: 82 },
    ]
  },
  {
    id: 2,
    name: 'Delhi-Mumbai Expressway Package 4',
    code: 'DME-P4',
    sector: 'Road Transport',
    ministry: 'MoRTH',
    state: 'Rajasthan',
    budgetCr: 45000,
    revisedBudgetCr: 50400,
    overallRiskScore: 64,
    costRiskScore: 60,
    delayRiskScore: 68,
    executionRiskScore: 62,
    status: 'At Risk',
    costOverrunPct: 12.0,
    scheduleDelayDays: 120,
    nextMilestone: 'Bituminous Concrete Paving Km 140-180',
    nextMilestoneDate: '2026-09-30',
    plannedCompletionDate: '2026-11-30',
    forecastCompletionDate: '2027-03-30',
    earlyWarningLeadMonths: 3.8,
    topRiskDrivers: [
      { driver: 'Contractor Financial Distress', shapContribution: +0.24, description: 'EPC contractor working capital shortfall impacting mobilization', category: 'contractor' },
      { driver: 'Monsoon Disruption Risk', shapContribution: +0.19, description: 'Subgrade drainage works incomplete prior to heavy rainfall', category: 'weather' },
      { driver: 'Progress Divergence', shapContribution: +0.15, description: 'Physical progress (62%) lagging behind financial payout (74%)', category: 'milestone' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 38 }, { month: 'Jun 25', score: 40 }, { month: 'Jul 25', score: 42 },
      { month: 'Aug 25', score: 46 }, { month: 'Sep 25', score: 50 }, { month: 'Oct 25', score: 53 },
      { month: 'Nov 25', score: 56 }, { month: 'Dec 25', score: 58 }, { month: 'Jan 26', score: 60 },
      { month: 'Feb 26', score: 61 }, { month: 'Mar 26', score: 63 }, { month: 'Apr 26', score: 64 },
    ]
  },
  {
    id: 3,
    name: 'Bangalore Metro Phase 2B (Airport Line)',
    code: 'BMRCL-P2B',
    sector: 'Urban Development',
    ministry: 'MoHUA',
    state: 'Karnataka',
    budgetCr: 15000,
    revisedBudgetCr: 15630,
    overallRiskScore: 25,
    costRiskScore: 20,
    delayRiskScore: 28,
    executionRiskScore: 24,
    status: 'Active',
    costOverrunPct: 4.2,
    scheduleDelayDays: 30,
    nextMilestone: 'Elevated Viaduct Span Load Testing',
    nextMilestoneDate: '2026-08-20',
    plannedCompletionDate: '2026-12-15',
    forecastCompletionDate: '2027-01-15',
    earlyWarningLeadMonths: 1.5,
    topRiskDrivers: [
      { driver: 'Utility Shifting Delay', shapContribution: +0.09, description: 'Minor delay in optical fiber duct relocation near Yelahanka', category: 'land' },
      { driver: 'Traffic Diversions', shapContribution: +0.06, description: 'Peak hour construction restriction near Silk Board node', category: 'milestone' },
      { driver: 'Material Cost Fluctuation', shapContribution: +0.04, description: 'Cement price increase of 3.2%', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 28 }, { month: 'Jun 25', score: 27 }, { month: 'Jul 25', score: 26 },
      { month: 'Aug 25', score: 25 }, { month: 'Sep 25', score: 24 }, { month: 'Oct 25', score: 25 },
      { month: 'Nov 25', score: 26 }, { month: 'Dec 25', score: 25 }, { month: 'Jan 26', score: 24 },
      { month: 'Feb 26', score: 25 }, { month: 'Mar 26', score: 25 }, { month: 'Apr 26', score: 25 },
    ]
  },
  {
    id: 4,
    name: 'Chenab Railway Bridge USBRL Link',
    code: 'USBRL-CHNB',
    sector: 'Railways',
    ministry: 'Ministry of Railways',
    state: 'Jammu & Kashmir',
    budgetCr: 28000,
    revisedBudgetCr: 34270,
    overallRiskScore: 78,
    costRiskScore: 72,
    delayRiskScore: 84,
    executionRiskScore: 76,
    status: 'Critical',
    costOverrunPct: 22.4,
    scheduleDelayDays: 210,
    nextMilestone: 'Arch Section Track Laying & Signal Integration',
    nextMilestoneDate: '2026-11-10',
    plannedCompletionDate: '2026-10-31',
    forecastCompletionDate: '2027-05-31',
    earlyWarningLeadMonths: 4.6,
    topRiskDrivers: [
      { driver: 'Geological Instability', shapContribution: +0.31, description: 'Landslide mitigation required at Slope Pillar 4', category: 'weather' },
      { driver: 'Severe Weather Standstill', shapContribution: +0.21, description: 'Sub-zero temperatures halting outdoor structural welding', category: 'weather' },
      { driver: 'Cost Acceleration', shapContribution: +0.18, description: 'Specialized slope stabilization cabling cost overrun', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 55 }, { month: 'Jun 25', score: 58 }, { month: 'Jul 25', score: 62 },
      { month: 'Aug 25', score: 65 }, { month: 'Sep 25', score: 68 }, { month: 'Oct 25', score: 71 },
      { month: 'Nov 25', score: 73 }, { month: 'Dec 25', score: 75 }, { month: 'Jan 26', score: 76 },
      { month: 'Feb 26', score: 77 }, { month: 'Mar 26', score: 78 }, { month: 'Apr 26', score: 78 },
    ]
  },
  {
    id: 5,
    name: 'Polavaram Multipurpose Dam Project',
    code: 'POLAV-01',
    sector: 'Water & Irrigation',
    ministry: 'Ministry of Jal Shakti',
    state: 'Andhra Pradesh',
    budgetCr: 55000,
    revisedBudgetCr: 72050,
    overallRiskScore: 87,
    costRiskScore: 84,
    delayRiskScore: 90,
    executionRiskScore: 85,
    status: 'Critical',
    costOverrunPct: 31.0,
    scheduleDelayDays: 365,
    nextMilestone: 'Spillway Concrete Pour Block 24-30',
    nextMilestoneDate: '2026-12-01',
    plannedCompletionDate: '2027-06-30',
    forecastCompletionDate: '2028-06-30',
    earlyWarningLeadMonths: 6.0,
    topRiskDrivers: [
      { driver: 'Rehabilitation & Resettlement (R&R)', shapContribution: +0.34, description: 'Evacuation delays in 42 submergence villages', category: 'land' },
      { driver: 'Cofferdam Seepage Damage', shapContribution: +0.26, description: 'Scour repair work requiring specialized diaphragm walling', category: 'milestone' },
      { driver: 'Revision Cost Claim Disputes', shapContribution: +0.19, description: 'Unresolved EPC variation claims totaling ₹4,200 Cr', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 68 }, { month: 'Jun 25', score: 71 }, { month: 'Jul 25', score: 74 },
      { month: 'Aug 25', score: 78 }, { month: 'Sep 25', score: 81 }, { month: 'Oct 25', score: 83 },
      { month: 'Nov 25', score: 84 }, { month: 'Dec 25', score: 85 }, { month: 'Jan 26', score: 86 },
      { month: 'Feb 26', score: 86 }, { month: 'Mar 26', score: 87 }, { month: 'Apr 26', score: 87 },
    ]
  },
  {
    id: 6,
    name: 'Kudankulam Nuclear Power Unit 3&4',
    code: 'KKNPP-34',
    sector: 'Energy',
    ministry: 'Department of Atomic Energy',
    state: 'Tamil Nadu',
    budgetCr: 49600,
    revisedBudgetCr: 62740,
    overallRiskScore: 85,
    costRiskScore: 80,
    delayRiskScore: 89,
    executionRiskScore: 82,
    status: 'Critical',
    costOverrunPct: 26.5,
    scheduleDelayDays: 270,
    nextMilestone: 'Reactor Pressure Vessel Assembly & Testing',
    nextMilestoneDate: '2026-11-25',
    plannedCompletionDate: '2027-03-31',
    forecastCompletionDate: '2027-12-31',
    earlyWarningLeadMonths: 5.8,
    topRiskDrivers: [
      { driver: 'International Equipment Supply Delay', shapContribution: +0.33, description: 'Specialized turbine components transit delay from overseas supplier', category: 'contractor' },
      { driver: 'Regulatory Safety Clearance', shapContribution: +0.25, description: 'AERB stage-wise inspection checklist compliance pending', category: 'milestone' },
      { driver: 'Cost Acceleration', shapContribution: +0.17, description: 'Extended site overheads and expert consultant retainers', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 62 }, { month: 'Jun 25', score: 65 }, { month: 'Jul 25', score: 70 },
      { month: 'Aug 25', score: 74 }, { month: 'Sep 25', score: 78 }, { month: 'Oct 25', score: 81 },
      { month: 'Nov 25', score: 83 }, { month: 'Dec 25', score: 84 }, { month: 'Jan 26', score: 84 },
      { month: 'Feb 26', score: 85 }, { month: 'Mar 26', score: 85 }, { month: 'Apr 26', score: 85 },
    ]
  },
  {
    id: 7,
    name: 'Mumbai Trans Harbour Link (MTHL)',
    code: 'MTHL-MMRDA',
    sector: 'Road Transport',
    ministry: 'MoRTH',
    state: 'Maharashtra',
    budgetCr: 17840,
    revisedBudgetCr: 18920,
    overallRiskScore: 38,
    costRiskScore: 35,
    delayRiskScore: 40,
    executionRiskScore: 36,
    status: 'Active',
    costOverrunPct: 6.1,
    scheduleDelayDays: 45,
    nextMilestone: 'Intelligent Transport System (ITS) Calibration',
    nextMilestoneDate: '2026-08-30',
    plannedCompletionDate: '2026-09-30',
    forecastCompletionDate: '2026-11-15',
    earlyWarningLeadMonths: 2.1,
    topRiskDrivers: [
      { driver: 'Monsoon Sea State Delay', shapContribution: +0.12, description: 'High tidal swells slowing offshore gantry demobilization', category: 'weather' },
      { driver: 'Toll Plaza Electrification', shapContribution: +0.08, description: 'Grid connection sync pending with MSEDCL', category: 'milestone' },
      { driver: 'Minor Scope Addition', shapContribution: +0.05, description: 'Additional noise barriers near flamingo sanctuary', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 45 }, { month: 'Jun 25', score: 44 }, { month: 'Jul 25', score: 42 },
      { month: 'Aug 25', score: 41 }, { month: 'Sep 25', score: 40 }, { month: 'Oct 25', score: 39 },
      { month: 'Nov 25', score: 38 }, { month: 'Dec 25', score: 38 }, { month: 'Jan 26', score: 38 },
      { month: 'Feb 26', score: 38 }, { month: 'Mar 26', score: 38 }, { month: 'Apr 26', score: 38 },
    ]
  },
  {
    id: 8,
    name: 'Eastern Dedicated Freight Corridor (EDFC)',
    code: 'DFCCIL-EDFC',
    sector: 'Railways',
    ministry: 'Ministry of Railways',
    state: 'Uttar Pradesh',
    budgetCr: 38000,
    revisedBudgetCr: 44380,
    overallRiskScore: 71,
    costRiskScore: 68,
    delayRiskScore: 74,
    executionRiskScore: 70,
    status: 'At Risk',
    costOverrunPct: 16.8,
    scheduleDelayDays: 150,
    nextMilestone: 'Substation Electrification & Track Signalling',
    nextMilestoneDate: '2026-10-01',
    plannedCompletionDate: '2026-12-31',
    forecastCompletionDate: '2027-05-30',
    earlyWarningLeadMonths: 4.1,
    topRiskDrivers: [
      { driver: 'ROB Construction Coordination', shapContribution: +0.27, description: 'State PWD delays in approving Road Overbridge girder launches', category: 'milestone' },
      { driver: 'Land Encroachment Clearence', shapContribution: +0.20, description: 'Litigation pending on 14 km stretch near Ludhiana alignment', category: 'land' },
      { driver: 'Copper Cable Theft Impact', shapContribution: +0.11, description: 'Signal cable replacement costs along rural sections', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 50 }, { month: 'Jun 25', score: 53 }, { month: 'Jul 25', score: 57 },
      { month: 'Aug 25', score: 61 }, { month: 'Sep 25', score: 64 }, { month: 'Oct 25', score: 67 },
      { month: 'Nov 25', score: 69 }, { month: 'Dec 25', score: 70 }, { month: 'Jan 26', score: 71 },
      { month: 'Feb 26', score: 71 }, { month: 'Mar 26', score: 71 }, { month: 'Apr 26', score: 71 },
    ]
  },
  {
    id: 9,
    name: 'Barmer Petroleum Refinery Complex',
    code: 'HRRL-BRM',
    sector: 'Petroleum',
    ministry: 'MoPNG',
    state: 'Rajasthan',
    budgetCr: 43120,
    revisedBudgetCr: 49245,
    overallRiskScore: 59,
    costRiskScore: 55,
    delayRiskScore: 62,
    executionRiskScore: 58,
    status: 'At Risk',
    costOverrunPct: 14.2,
    scheduleDelayDays: 110,
    nextMilestone: 'Hydrocracker Unit (HCU) Erection & Piping',
    nextMilestoneDate: '2026-09-15',
    plannedCompletionDate: '2027-01-31',
    forecastCompletionDate: '2027-05-20',
    earlyWarningLeadMonths: 3.2,
    topRiskDrivers: [
      { driver: 'Heavy Lifting Crane Availability', shapContribution: +0.21, description: 'Shortage of 1600T crawler cranes for heavy vessel erection', category: 'contractor' },
      { driver: 'Pipeline ROW Compensation', shapContribution: +0.17, description: 'Farmer agitation regarding crude intake pipeline easement', category: 'land' },
      { driver: 'Piping Fabrication Slowdown', shapContribution: +0.14, description: 'Welder turnover at site during summer harvest season', category: 'milestone' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 40 }, { month: 'Jun 25', score: 42 }, { month: 'Jul 25', score: 45 },
      { month: 'Aug 25', score: 48 }, { month: 'Sep 25', score: 51 }, { month: 'Oct 25', score: 53 },
      { month: 'Nov 25', score: 55 }, { month: 'Dec 25', score: 57 }, { month: 'Jan 26', score: 58 },
      { month: 'Feb 26', score: 59 }, { month: 'Mar 26', score: 59 }, { month: 'Apr 26', score: 59 },
    ]
  },
  {
    id: 10,
    name: 'Zojila Tunnel Strategic Highway',
    code: 'NHIDCL-ZOJ',
    sector: 'Road Transport',
    ministry: 'MoRTH',
    state: 'Ladakh',
    budgetCr: 6800,
    revisedBudgetCr: 8145,
    overallRiskScore: 76,
    costRiskScore: 71,
    delayRiskScore: 82,
    executionRiskScore: 74,
    status: 'Critical',
    costOverrunPct: 19.8,
    scheduleDelayDays: 195,
    nextMilestone: 'West Portal TBM Breakthrough (Km 8+400)',
    nextMilestoneDate: '2026-10-30',
    plannedCompletionDate: '2026-11-15',
    forecastCompletionDate: '2027-05-28',
    earlyWarningLeadMonths: 4.4,
    topRiskDrivers: [
      { driver: 'Alpine Extreme Cold Ingress', shapContribution: +0.30, description: 'Tunnel heating systems overwhelmed by freezing water ingress', category: 'weather' },
      { driver: 'Heavy Machinery Logistics', shapContribution: +0.22, description: 'Pass closure delaying replacement cutterhead delivery', category: 'contractor' },
      { driver: 'Cost Acceleration', shapContribution: +0.15, description: 'Diesel generator fuel logistics cost overrun', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 52 }, { month: 'Jun 25', score: 55 }, { month: 'Jul 25', score: 60 },
      { month: 'Aug 25', score: 64 }, { month: 'Sep 25', score: 68 }, { month: 'Oct 25', score: 71 },
      { month: 'Nov 25', score: 73 }, { month: 'Dec 25', score: 74 }, { month: 'Jan 26', score: 75 },
      { month: 'Feb 26', score: 76 }, { month: 'Mar 26', score: 76 }, { month: 'Apr 26', score: 76 },
    ]
  },
  {
    id: 11,
    name: 'Pune Metro Line 3 (Hinjewadi-Shivajinagar)',
    code: 'PMRDA-L3',
    sector: 'Urban Development',
    ministry: 'MoHUA',
    state: 'Maharashtra',
    budgetCr: 8300,
    revisedBudgetCr: 8920,
    overallRiskScore: 42,
    costRiskScore: 39,
    delayRiskScore: 44,
    executionRiskScore: 41,
    status: 'Moderate',
    costOverrunPct: 7.5,
    scheduleDelayDays: 60,
    nextMilestone: 'Pier Cap Launching Ganeshkhind Road',
    nextMilestoneDate: '2026-09-10',
    plannedCompletionDate: '2026-12-31',
    forecastCompletionDate: '2027-03-01',
    earlyWarningLeadMonths: 2.3,
    topRiskDrivers: [
      { driver: 'Arterial Road Traffic Restriction', shapContribution: +0.16, description: 'Night-only launching window permitted by Pune Traffic Police', category: 'milestone' },
      { driver: 'Depot Land Handover', shapContribution: +0.12, description: 'Maan village land parcel final boundary demarcation', category: 'land' },
      { driver: 'Steel Reinforcement Pricing', shapContribution: +0.07, description: 'Structural steel cost index escalation of 4.5%', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 35 }, { month: 'Jun 25', score: 36 }, { month: 'Jul 25', score: 38 },
      { month: 'Aug 25', score: 39 }, { month: 'Sep 25', score: 40 }, { month: 'Oct 25', score: 41 },
      { month: 'Nov 25', score: 42 }, { month: 'Dec 25', score: 42 }, { month: 'Jan 26', score: 42 },
      { month: 'Feb 26', score: 42 }, { month: 'Mar 26', score: 42 }, { month: 'Apr 26', score: 42 },
    ]
  },
  {
    id: 12,
    name: 'Paradip Port Deep Draught Outer Harbor',
    code: 'PPT-HARBOR',
    sector: 'Shipping & Ports',
    ministry: 'Ministry of Ports',
    state: 'Odisha',
    budgetCr: 9500,
    revisedBudgetCr: 9860,
    overallRiskScore: 32,
    costRiskScore: 28,
    delayRiskScore: 35,
    executionRiskScore: 30,
    status: 'Active',
    costOverrunPct: 3.8,
    scheduleDelayDays: 20,
    nextMilestone: 'South Breakwater Armor Rock Dumping',
    nextMilestoneDate: '2026-08-25',
    plannedCompletionDate: '2026-11-30',
    forecastCompletionDate: '2026-12-20',
    earlyWarningLeadMonths: 1.2,
    topRiskDrivers: [
      { driver: 'Cyclone Season Work Reduction', shapContribution: +0.10, description: 'Precautionary vessel anchoring during Bay of Bengal depression', category: 'weather' },
      { driver: 'Quarry Stone Logistics', shapContribution: +0.07, description: 'Trucking availability from Jajpur quarries', category: 'contractor' },
      { driver: 'Fuel Surcharge Adjustment', shapContribution: +0.04, description: 'Dredger marine diesel cost adjustment', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 30 }, { month: 'Jun 25', score: 31 }, { month: 'Jul 25', score: 32 },
      { month: 'Aug 25', score: 32 }, { month: 'Sep 25', score: 32 }, { month: 'Oct 25', score: 32 },
      { month: 'Nov 25', score: 32 }, { month: 'Dec 25', score: 32 }, { month: 'Jan 26', score: 32 },
      { month: 'Feb 26', score: 32 }, { month: 'Mar 26', score: 32 }, { month: 'Apr 26', score: 32 },
    ]
  },
  {
    id: 13,
    name: 'Kolkata Metro East-West Metro Extension',
    code: 'KMRCL-EW',
    sector: 'Urban Development',
    ministry: 'MoHUA',
    state: 'West Bengal',
    budgetCr: 8575,
    revisedBudgetCr: 9895,
    overallRiskScore: 68,
    costRiskScore: 64,
    delayRiskScore: 72,
    executionRiskScore: 66,
    status: 'At Risk',
    costOverrunPct: 15.4,
    scheduleDelayDays: 135,
    nextMilestone: 'Bowbazar Subsidence Zone Structural Grouting',
    nextMilestoneDate: '2026-09-20',
    plannedCompletionDate: '2026-10-31',
    forecastCompletionDate: '2027-03-15',
    earlyWarningLeadMonths: 3.9,
    topRiskDrivers: [
      { driver: 'Aquifer Ingress & Ground Subsidence', shapContribution: +0.29, description: 'Soil reinforcement required near heritage structures in Bowbazar', category: 'milestone' },
      { driver: 'Commercial Compensation Claims', shapContribution: +0.18, description: 'Shopkeeper relocation compensation litigation', category: 'land' },
      { driver: 'Cost Acceleration', shapContribution: +0.13, description: 'Specialized chemical grouting material expenditure', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 48 }, { month: 'Jun 25', score: 52 }, { month: 'Jul 25', score: 57 },
      { month: 'Aug 25', score: 61 }, { month: 'Sep 25', score: 64 }, { month: 'Oct 25', score: 66 },
      { month: 'Nov 25', score: 67 }, { month: 'Dec 25', score: 68 }, { month: 'Jan 26', score: 68 },
      { month: 'Feb 26', score: 68 }, { month: 'Mar 26', score: 68 }, { month: 'Apr 26', score: 68 },
    ]
  },
  {
    id: 14,
    name: 'Subansiri Lower Hydroelectric Project (2000 MW)',
    code: 'NHPC-SBN',
    sector: 'Energy',
    ministry: 'Ministry of Power',
    state: 'Arunachal Pradesh',
    budgetCr: 20000,
    revisedBudgetCr: 25600,
    overallRiskScore: 83,
    costRiskScore: 79,
    delayRiskScore: 86,
    executionRiskScore: 81,
    status: 'Critical',
    costOverrunPct: 28.0,
    scheduleDelayDays: 300,
    nextMilestone: 'Power House Unit 1-4 Rotor Insertion',
    nextMilestoneDate: '2026-10-10',
    plannedCompletionDate: '2026-12-31',
    forecastCompletionDate: '2027-10-31',
    earlyWarningLeadMonths: 5.5,
    topRiskDrivers: [
      { driver: 'Landslide Debris Blockage', shapContribution: +0.32, description: 'Tailrace channel blocked by monsoon hillside collapse', category: 'weather' },
      { driver: 'Downstream NGO Agitation', shapContribution: +0.23, description: 'Protests disrupting material transit through Assam border', category: 'land' },
      { driver: 'Cost Escalation Overruns', shapContribution: +0.17, description: 'IDC (Interest During Construction) accumulation over 8 years', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 60 }, { month: 'Jun 25', score: 64 }, { month: 'Jul 25', score: 69 },
      { month: 'Aug 25', score: 73 }, { month: 'Sep 25', score: 77 }, { month: 'Oct 25', score: 80 },
      { month: 'Nov 25', score: 81 }, { month: 'Dec 25', score: 82 }, { month: 'Jan 26', score: 83 },
      { month: 'Feb 26', score: 83 }, { month: 'Mar 26', score: 83 }, { month: 'Apr 26', score: 83 },
    ]
  },
  {
    id: 15,
    name: 'Noida International Airport Jewar (Phase 1)',
    code: 'YIAPL-JEWAR',
    sector: 'Civil Aviation',
    ministry: 'Ministry of Civil Aviation',
    state: 'Uttar Pradesh',
    budgetCr: 10050,
    revisedBudgetCr: 10452,
    overallRiskScore: 29,
    costRiskScore: 24,
    delayRiskScore: 32,
    executionRiskScore: 28,
    status: 'Active',
    costOverrunPct: 4.0,
    scheduleDelayDays: 30,
    nextMilestone: 'DGCA Instrument Landing System (ILS) Calibration Flight',
    nextMilestoneDate: '2026-08-18',
    plannedCompletionDate: '2026-09-30',
    forecastCompletionDate: '2026-10-30',
    earlyWarningLeadMonths: 1.4,
    topRiskDrivers: [
      { driver: 'Terminal Glazing Completion', shapContribution: +0.11, description: 'Glass facade panel sealing under thunderstorm watch', category: 'milestone' },
      { driver: 'BCAS Security Clearance', shapContribution: +0.08, description: 'Passenger baggage screening equipment audit', category: 'contractor' },
      { driver: 'Approach Road Connector', shapContribution: +0.05, description: 'Interchange ramp asphalt top coat', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'May 25', score: 32 }, { month: 'Jun 25', score: 31 }, { month: 'Jul 25', score: 30 },
      { month: 'Aug 25', score: 29 }, { month: 'Sep 25', score: 29 }, { month: 'Oct 25', score: 29 },
      { month: 'Nov 25', score: 29 }, { month: 'Dec 25', score: 29 }, { month: 'Jan 26', score: 29 },
      { month: 'Feb 26', score: 29 }, { month: 'Mar 26', score: 29 }, { month: 'Apr 26', score: 29 },
    ]
  }
];

export const STATE_RISK_SUMMARY: Record<string, StateRiskData> = {
  'Gujarat': { state: 'Gujarat', projectCount: 14, totalBudgetCr: 145000, avgRiskScore: 78, criticalCount: 4, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'high' },
  'Maharashtra': { state: 'Maharashtra', projectCount: 22, totalBudgetCr: 198000, avgRiskScore: 48, criticalCount: 2, costRiskLevel: 'medium', delayRiskLevel: 'medium', executionRiskLevel: 'low' },
  'Rajasthan': { state: 'Rajasthan', projectCount: 12, totalBudgetCr: 98000, avgRiskScore: 62, criticalCount: 3, costRiskLevel: 'medium', delayRiskLevel: 'high', executionRiskLevel: 'medium' },
  'Karnataka': { state: 'Karnataka', projectCount: 16, totalBudgetCr: 82000, avgRiskScore: 32, criticalCount: 1, costRiskLevel: 'low', delayRiskLevel: 'low', executionRiskLevel: 'low' },
  'Jammu & Kashmir': { state: 'Jammu & Kashmir', projectCount: 8, totalBudgetCr: 42000, avgRiskScore: 76, criticalCount: 3, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'high' },
  'Andhra Pradesh': { state: 'Andhra Pradesh', projectCount: 11, totalBudgetCr: 74000, avgRiskScore: 84, criticalCount: 5, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'high' },
  'Tamil Nadu': { state: 'Tamil Nadu', projectCount: 18, totalBudgetCr: 112000, avgRiskScore: 72, criticalCount: 4, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'medium' },
  'Uttar Pradesh': { state: 'Uttar Pradesh', projectCount: 28, totalBudgetCr: 210000, avgRiskScore: 54, criticalCount: 5, costRiskLevel: 'medium', delayRiskLevel: 'medium', executionRiskLevel: 'medium' },
  'Ladakh': { state: 'Ladakh', projectCount: 4, totalBudgetCr: 12500, avgRiskScore: 74, criticalCount: 2, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'high' },
  'Odisha': { state: 'Odisha', projectCount: 10, totalBudgetCr: 56000, avgRiskScore: 36, criticalCount: 1, costRiskLevel: 'low', delayRiskLevel: 'medium', executionRiskLevel: 'low' },
  'West Bengal': { state: 'West Bengal', projectCount: 15, totalBudgetCr: 68000, avgRiskScore: 65, criticalCount: 3, costRiskLevel: 'medium', delayRiskLevel: 'high', executionRiskLevel: 'medium' },
  'Arunachal Pradesh': { state: 'Arunachal Pradesh', projectCount: 6, totalBudgetCr: 31000, avgRiskScore: 81, criticalCount: 3, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'high' },
  'Delhi': { state: 'Delhi', projectCount: 19, totalBudgetCr: 94000, avgRiskScore: 45, criticalCount: 2, costRiskLevel: 'medium', delayRiskLevel: 'medium', executionRiskLevel: 'low' },
  'Madhya Pradesh': { state: 'Madhya Pradesh', projectCount: 13, totalBudgetCr: 72000, avgRiskScore: 51, criticalCount: 2, costRiskLevel: 'medium', delayRiskLevel: 'medium', executionRiskLevel: 'medium' },
};

export const MOCK_INTERVENTIONS: InterventionData[] = [
  {
    id: 'INT-001',
    projectId: 5,
    projectName: 'Polavaram Multipurpose Dam Project',
    ministry: 'Ministry of Jal Shakti',
    state: 'Andhra Pradesh',
    currentRiskScore: 87,
    urgency: 'CRITICAL',
    recommendedAction: 'Convene Empowered Cabinet Committee on R&R Village Evacuation & Settle ₹4,200 Cr EPC Variation Claim',
    estimatedRiskImpact: '-18.5% Risk Score Reduction',
    estimatedTimelineImpact: '-120 Days Delay Mitigation',
    status: 'Proposed',
    assignedOfficer: 'Secretary, Ministry of Jal Shakti',
    evidence: 'Submergence village evacuations 4 months behind scheduled dam filling window. Scour repair costs accelerating.',
    lastUpdated: '2026-09-02'
  },
  {
    id: 'INT-002',
    projectId: 6,
    projectName: 'Kudankulam Nuclear Power Unit 3&4',
    ministry: 'Department of Atomic Energy',
    state: 'Tamil Nadu',
    currentRiskScore: 85,
    urgency: 'CRITICAL',
    recommendedAction: 'Initiate Diplomatic Inter-Governmental Expedite for Nuclear Reactor Pressure Vessel Component Shipment',
    estimatedRiskImpact: '-15.0% Risk Score Reduction',
    estimatedTimelineImpact: '-90 Days Delay Mitigation',
    status: 'Under Review',
    assignedOfficer: 'Chairman, Atomic Energy Commission',
    evidence: 'AERB stage clearance blocked by missing overseas turbine valve test certificates.',
    lastUpdated: '2026-09-01'
  },
  {
    id: 'INT-003',
    projectId: 14,
    projectName: 'Subansiri Lower Hydroelectric Project (2000 MW)',
    ministry: 'Ministry of Power',
    state: 'Arunachal Pradesh',
    currentRiskScore: 83,
    urgency: 'CRITICAL',
    recommendedAction: 'Deploy Border Roads Organisation (BRO) Heavy Clearing Fleet for Tailrace Monsoon Landslide Bypass',
    estimatedRiskImpact: '-14.2% Risk Score Reduction',
    estimatedTimelineImpact: '-75 Days Delay Mitigation',
    status: 'Proposed',
    assignedOfficer: 'Joint Secretary (Hydro), MoP',
    evidence: 'Assam border transit blockade causing ₹12 Cr daily Interest During Construction (IDC) leakage.',
    lastUpdated: '2026-08-30'
  },
  {
    id: 'INT-004',
    projectId: 1,
    projectName: 'Mumbai-Ahmedabad High Speed Rail',
    ministry: 'Ministry of Railways',
    state: 'Gujarat',
    currentRiskScore: 82,
    urgency: 'CRITICAL',
    recommendedAction: 'Authorize High-Level Joint Land Handover Taskforce between Maharashtra & Gujarat Border Revenue Officers',
    estimatedRiskImpact: '-12.8% Risk Score Reduction',
    estimatedTimelineImpact: '-60 Days Delay Mitigation',
    status: 'Approved',
    assignedOfficer: 'Managing Director, NHSRCL',
    evidence: 'Palghar ROW handover standstill impacting 34 km viaduct casting progress.',
    lastUpdated: '2026-08-28'
  },
  {
    id: 'INT-005',
    projectId: 4,
    projectName: 'Chenab Railway Bridge USBRL Link',
    ministry: 'Ministry of Railways',
    state: 'Jammu & Kashmir',
    currentRiskScore: 78,
    urgency: 'HIGH',
    recommendedAction: 'Contract Geological Slope Stabilization Taskforce for Pillar 4 Rockfall Anchorage',
    estimatedRiskImpact: '-10.5% Risk Score Reduction',
    estimatedTimelineImpact: '-45 Days Delay Mitigation',
    status: 'Under Review',
    assignedOfficer: 'Chief Administrative Officer (Const), Northern Railway',
    evidence: 'Sub-zero welding protocol delays track laying on arch span.',
    lastUpdated: '2026-08-26'
  }
];
