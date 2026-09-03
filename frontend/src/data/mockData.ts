export interface ProjectData {
  id: number;
  name: string;
  code: string;
  sector: string;
  ministry: string;
  state: string;
  budgetCr: number;
  revisedBudgetCr: number;
  cumulativeExpenditureCr: number;
  overallRiskScore: number; // 0 - 100 or 0.00 - 1.00
  costRiskScore: number;
  delayRiskScore: number;
  executionRiskScore: number;
  status: 'Critical' | 'High Risk' | 'At Risk' | 'Moderate' | 'Active' | 'Completed';
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

export const DASHBOARD_STATS = {
  totalProjects: '1,981',
  totalProjectsChange: '+ 2.4% from Mar 2026',
  originalCost: '₹37.13 Lakh Cr',
  originalCostSub: 'Across 22 sectors',
  revisedCost: '₹42.78 Lakh Cr',
  revisedCostChange: '+ 4.1% from Mar 2026',
  cumulativeExpenditure: '₹20.36 Lakh Cr',
  cumulativeExpenditureSub: '48% of Revised Cost',
  highRiskProjects: '312',
  highRiskProjectsSub: '15.8% of total projects',
};

export const SECTOR_DISTRIBUTION = [
  { name: 'Transport & Logistics', pct: '28.5%', count: 564, color: '#0d52ce' },
  { name: 'Energy', pct: '18.1%', count: 358, color: '#f97316' },
  { name: 'Water & Sanitation', pct: '12.4%', count: 246, color: '#10b981' },
  { name: 'Social Infrastructure', pct: '10.3%', count: 204, color: '#ec4899' },
  { name: 'Communication', pct: '7.8%', count: 155, color: '#8b5cf6' },
  { name: 'Others', pct: '22.9%', count: 454, color: '#94a3b8' },
];

export const COST_OVERRUN_RISK_DISTRIBUTION = [
  { level: 'Low', count: 422, pct: '21.3%', color: '#10b981' },
  { level: 'Moderate', count: 767, pct: '38.7%', color: '#eab308' },
  { level: 'High', count: 480, pct: '24.2%', color: '#f97316' },
  { level: 'Very High', count: 312, pct: '15.8%', color: '#ef4444' },
];

export const TOP_HIGH_RISK_PROJECTS = [
  { id: 101, name: 'Mumbai Metro Line 7A', ministry: 'Ministry of Housing & Urban Affairs', riskScore: '0.92', status: 'High Risk' },
  { id: 102, name: 'Delhi–Meerut RRTS Corridor', ministry: 'Ministry of Railways', riskScore: '0.89', status: 'High Risk' },
  { id: 103, name: 'Polavaram Irrigation Project', ministry: 'Ministry of Jal Shakti', riskScore: '0.87', status: 'High Risk' },
  { id: 104, name: 'Kudankulam Nuclear Project', ministry: 'Department of Atomic Energy', riskScore: '0.85', status: 'High Risk' },
  { id: 105, name: 'Chardham Highway Project', ministry: 'Ministry of Road Transport & Highways', riskScore: '0.83', status: 'High Risk' },
];

export const OVERRUN_TRENDS = [
  { month: 'Nov 2025', costOverrun: 18, timeOverrun: 12 },
  { month: 'Dec 2025', costOverrun: 19, timeOverrun: 13 },
  { month: 'Jan 2026', costOverrun: 21, timeOverrun: 14 },
  { month: 'Feb 2026', costOverrun: 22, timeOverrun: 15 },
  { month: 'Mar 2026', costOverrun: 23, timeOverrun: 16 },
  { month: 'Apr 2026', costOverrun: 24, timeOverrun: 17 },
];

export const AI_INSIGHTS = [
  {
    type: 'warning',
    text: '312 projects are at very high risk of cost overrun. Potential additional cost impact: ₹2.41 Lakh Cr',
    color: 'border-l-4 border-l-orange-500 bg-orange-50/50 text-slate-800'
  },
  {
    type: 'analytics',
    text: 'Transport & Logistics sector shows highest time overrun risk. Average delay: 8.7 months',
    color: 'border-l-4 border-l-blue-500 bg-blue-50/50 text-slate-800'
  },
  {
    type: 'action',
    text: 'Early intervention can save up to ₹1.18 Lakh Cr if actioned in next 3 months',
    color: 'border-l-4 border-l-emerald-500 bg-emerald-50/50 text-slate-800'
  }
];

export const RECENT_ALERTS = [
  { id: 'ALT-1', title: 'High risk of cost overrun detected in 12 projects', time: '2 minutes ago', severity: 'critical' },
  { id: 'ALT-2', title: 'Risk escalation in 18 projects', time: '15 minutes ago', severity: 'warning' },
];

export const MOCK_PROJECTS: ProjectData[] = [
  {
    id: 101,
    name: 'Mumbai Metro Line 7A',
    code: 'MMRDA-L7A',
    sector: 'Urban Development',
    ministry: 'Ministry of Housing & Urban Affairs',
    state: 'Maharashtra',
    budgetCr: 6607,
    revisedBudgetCr: 7850,
    cumulativeExpenditureCr: 3925,
    overallRiskScore: 92,
    costRiskScore: 88,
    delayRiskScore: 94,
    executionRiskScore: 90,
    status: 'High Risk',
    costOverrunPct: 18.8,
    scheduleDelayDays: 240,
    nextMilestone: 'Underground Tunnel TBM Breakthrough Package 1',
    nextMilestoneDate: '2026-09-30',
    plannedCompletionDate: '2026-12-31',
    forecastCompletionDate: '2027-08-30',
    earlyWarningLeadMonths: 5.2,
    topRiskDrivers: [
      { driver: 'Airport T2 Underground Alignment Sinking', shapContribution: +0.32, description: 'Underground tunneling obstruction near airport runway pier', category: 'milestone' },
      { driver: 'Right of Way Handover', shapContribution: +0.24, description: 'CSMIA land parcel access clearance pending', category: 'land' },
      { driver: 'Contractor Delay Claims', shapContribution: +0.18, description: 'EPC variation claims under arbitration', category: 'cost' },
    ],
    monthlyRiskHistory: [
      { month: 'Nov 25', score: 62 }, { month: 'Dec 25', score: 68 }, { month: 'Jan 26', score: 75 },
      { month: 'Feb 26', score: 82 }, { month: 'Mar 26', score: 88 }, { month: 'Apr 26', score: 92 }
    ]
  },
  {
    id: 102,
    name: 'Delhi–Meerut RRTS Corridor',
    code: 'NCRTC-RRTS',
    sector: 'Transport & Logistics',
    ministry: 'Ministry of Railways',
    state: 'Delhi',
    budgetCr: 30274,
    revisedBudgetCr: 34180,
    cumulativeExpenditureCr: 17090,
    overallRiskScore: 89,
    costRiskScore: 84,
    delayRiskScore: 91,
    executionRiskScore: 86,
    status: 'High Risk',
    costOverrunPct: 12.9,
    scheduleDelayDays: 180,
    nextMilestone: 'Viaduct Track Signaling & Station Electrification',
    nextMilestoneDate: '2026-10-15',
    plannedCompletionDate: '2026-11-30',
    forecastCompletionDate: '2027-05-30',
    earlyWarningLeadMonths: 4.5,
    topRiskDrivers: [
      { driver: 'Urban Traffic Diversion Permits', shapContribution: +0.29, description: 'Delhi traffic police night-window constraints', category: 'milestone' },
      { driver: 'Rolling Stock Delivery Delay', shapContribution: +0.21, description: 'Train set testing timeline slippage', category: 'contractor' }
    ],
    monthlyRiskHistory: [
      { month: 'Nov 25', score: 58 }, { month: 'Dec 25', score: 65 }, { month: 'Jan 26', score: 72 },
      { month: 'Feb 26', score: 79 }, { month: 'Mar 26', score: 84 }, { month: 'Apr 26', score: 89 }
    ]
  },
  {
    id: 103,
    name: 'Polavaram Irrigation Project',
    code: 'POLAV-01',
    sector: 'Water & Sanitation',
    ministry: 'Ministry of Jal Shakti',
    state: 'Andhra Pradesh',
    budgetCr: 55000,
    revisedBudgetCr: 72050,
    cumulativeExpenditureCr: 36025,
    overallRiskScore: 87,
    costRiskScore: 84,
    delayRiskScore: 90,
    executionRiskScore: 85,
    status: 'High Risk',
    costOverrunPct: 31.0,
    scheduleDelayDays: 365,
    nextMilestone: 'Spillway Concrete Pour Block 24-30',
    nextMilestoneDate: '2026-12-01',
    plannedCompletionDate: '2027-06-30',
    forecastCompletionDate: '2028-06-30',
    earlyWarningLeadMonths: 6.0,
    topRiskDrivers: [
      { driver: 'Rehabilitation & Resettlement (R&R)', shapContribution: +0.34, description: 'Evacuation delays in 42 submergence villages', category: 'land' },
      { driver: 'Cofferdam Seepage Damage', shapContribution: +0.26, description: 'Scour repair work requiring specialized diaphragm walling', category: 'milestone' }
    ],
    monthlyRiskHistory: [
      { month: 'Nov 25', score: 70 }, { month: 'Dec 25', score: 74 }, { month: 'Jan 26', score: 78 },
      { month: 'Feb 26', score: 82 }, { month: 'Mar 26', score: 85 }, { month: 'Apr 26', score: 87 }
    ]
  },
  {
    id: 104,
    name: 'Kudankulam Nuclear Project',
    code: 'KKNPP-34',
    sector: 'Energy',
    ministry: 'Department of Atomic Energy',
    state: 'Tamil Nadu',
    budgetCr: 49600,
    revisedBudgetCr: 62740,
    cumulativeExpenditureCr: 31370,
    overallRiskScore: 85,
    costRiskScore: 80,
    delayRiskScore: 89,
    executionRiskScore: 82,
    status: 'High Risk',
    costOverrunPct: 26.5,
    scheduleDelayDays: 270,
    nextMilestone: 'Reactor Pressure Vessel Assembly & Testing',
    nextMilestoneDate: '2026-11-25',
    plannedCompletionDate: '2027-03-31',
    forecastCompletionDate: '2027-12-31',
    earlyWarningLeadMonths: 5.8,
    topRiskDrivers: [
      { driver: 'International Equipment Supply Delay', shapContribution: +0.33, description: 'Specialized turbine components transit delay', category: 'contractor' }
    ],
    monthlyRiskHistory: [
      { month: 'Nov 25', score: 68 }, { month: 'Dec 25', score: 73 }, { month: 'Jan 26', score: 78 },
      { month: 'Feb 26', score: 81 }, { month: 'Mar 26', score: 83 }, { month: 'Apr 26', score: 85 }
    ]
  },
  {
    id: 105,
    name: 'Chardham Highway Project',
    code: 'MORTH-CDH',
    sector: 'Transport & Logistics',
    ministry: 'Ministry of Road Transport & Highways',
    state: 'Uttarakhand',
    budgetCr: 12000,
    revisedBudgetCr: 14800,
    cumulativeExpenditureCr: 7400,
    overallRiskScore: 83,
    costRiskScore: 78,
    delayRiskScore: 86,
    executionRiskScore: 81,
    status: 'High Risk',
    costOverrunPct: 23.3,
    scheduleDelayDays: 210,
    nextMilestone: 'Hill Slope Protection & Retaining Wall Segment B',
    nextMilestoneDate: '2026-10-20',
    plannedCompletionDate: '2026-11-15',
    forecastCompletionDate: '2027-06-15',
    earlyWarningLeadMonths: 4.8,
    topRiskDrivers: [
      { driver: 'Landslide Debris Blockage', shapContribution: +0.31, description: 'Monsoon slope instability in landslide zone', category: 'weather' }
    ],
    monthlyRiskHistory: [
      { month: 'Nov 25', score: 64 }, { month: 'Dec 25', score: 70 }, { month: 'Jan 26', score: 75 },
      { month: 'Feb 26', score: 79 }, { month: 'Mar 26', score: 81 }, { month: 'Apr 26', score: 83 }
    ]
  }
];

export const STATE_RISK_SUMMARY: Record<string, StateRiskData> = {
  'Maharashtra': { state: 'Maharashtra', projectCount: 220, totalBudgetCr: 398000, avgRiskScore: 68, criticalCount: 42, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'medium' },
  'Delhi': { state: 'Delhi', projectCount: 145, totalBudgetCr: 210000, avgRiskScore: 62, criticalCount: 28, costRiskLevel: 'medium', delayRiskLevel: 'high', executionRiskLevel: 'medium' },
  'Andhra Pradesh': { state: 'Andhra Pradesh', projectCount: 110, totalBudgetCr: 174000, avgRiskScore: 84, criticalCount: 35, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'high' },
  'Tamil Nadu': { state: 'Tamil Nadu', projectCount: 180, totalBudgetCr: 280000, avgRiskScore: 72, criticalCount: 30, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'medium' },
  'Uttarakhand': { state: 'Uttarakhand', projectCount: 85, totalBudgetCr: 92000, avgRiskScore: 76, criticalCount: 19, costRiskLevel: 'high', delayRiskLevel: 'high', executionRiskLevel: 'high' },
};

export const MOCK_INTERVENTIONS: InterventionData[] = [
  {
    id: 'INT-001',
    projectId: 101,
    projectName: 'Mumbai Metro Line 7A',
    ministry: 'Ministry of Housing & Urban Affairs',
    state: 'Maharashtra',
    currentRiskScore: 92,
    urgency: 'CRITICAL',
    recommendedAction: 'Expedite CSMIA Land Parcel Right-of-Way Handover & TBM Clearance',
    estimatedRiskImpact: '-22.5% Risk Reduction',
    estimatedTimelineImpact: '-120 Days Delay Mitigation',
    status: 'Proposed',
    assignedOfficer: 'Secretary, MoHUA',
    evidence: 'Underground tunnel TBM halted 400m before CSMIA Station due to ROW obstruction.',
    lastUpdated: '2026-09-02'
  },
  {
    id: 'INT-002',
    projectId: 102,
    projectName: 'Delhi–Meerut RRTS Corridor',
    ministry: 'Ministry of Railways',
    state: 'Delhi',
    currentRiskScore: 89,
    urgency: 'CRITICAL',
    recommendedAction: 'Convene Joint Traffic Police & Municipal Taskforce for Day-Time Viaduct Launching',
    estimatedRiskImpact: '-18.0% Risk Reduction',
    estimatedTimelineImpact: '-90 Days Delay Mitigation',
    status: 'Under Review',
    assignedOfficer: 'Managing Director, NCRTC',
    evidence: 'Night-only work permit restriction causing 4.5 month cumulative schedule slippage.',
    lastUpdated: '2026-09-01'
  }
];
