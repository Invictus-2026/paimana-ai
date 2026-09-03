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

export interface StateProjectItem {
  id?: number;
  name: string;
  code: string;
  risk: number;
  status: string;
  budgetCr?: number;
  delayDays?: number;
}

export interface StateRiskData {
  state: string;
  code?: string;
  zone?: string;
  projectCount: number;
  totalBudgetCr: number;
  actualExpenditureCr?: number;
  projectedCostCr?: number;
  savingsOrLossCr?: number; // Positive = Surplus/Savings, Negative = Deficit/Loss
  fiscalStatus?: 'surplus' | 'moderate' | 'deficit'; // surplus = green neon, moderate = orange/yellow neon, deficit = red neon
  avgRiskScore: number;
  criticalCount: number;
  avgDelayDays?: number;
  costRiskLevel: 'high' | 'medium' | 'low';
  delayRiskLevel: 'high' | 'medium' | 'low';
  executionRiskLevel: 'high' | 'medium' | 'low';
  keyBottleneck?: string;
  topProjects?: StateProjectItem[];
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
  'Maharashtra': {
    state: 'Maharashtra',
    code: 'MH',
    zone: 'Western Zone',
    projectCount: 220,
    totalBudgetCr: 398000,
    actualExpenditureCr: 242000,
    projectedCostCr: 432500,
    savingsOrLossCr: -34500, // Deficit / Overrun
    fiscalStatus: 'deficit',
    avgRiskScore: 92,
    criticalCount: 42,
    avgDelayDays: 240,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Right-of-Way obstruction on TBM alignment and high utility diversion density in Mumbai MMR.',
    topProjects: [
      { id: 101, name: 'Mumbai Metro Line 7A', code: 'MMRDA-L7A', risk: 92, status: 'Critical', budgetCr: 6607, delayDays: 240 },
      { name: 'Coastal Road Extension (Versova-Dahisar)', code: 'MCGM-CR-02', risk: 78, status: 'High', budgetCr: 16800, delayDays: 180 },
      { name: 'Pune Ring Road West Package', code: 'MSRDC-PRR', risk: 85, status: 'Critical', budgetCr: 14200, delayDays: 210 }
    ]
  },
  'Delhi': {
    state: 'Delhi',
    code: 'DL',
    zone: 'Northern Zone',
    projectCount: 145,
    totalBudgetCr: 210000,
    actualExpenditureCr: 118000,
    projectedCostCr: 211200,
    savingsOrLossCr: -1200, // Moderate variance
    fiscalStatus: 'moderate',
    avgRiskScore: 62,
    criticalCount: 28,
    avgDelayDays: 95,
    costRiskLevel: 'medium',
    delayRiskLevel: 'high',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Multi-agency municipal statutory clearances and winter construction dust bans.',
    topProjects: [
      { id: 102, name: 'Delhi-Meerut RRTS Corridor', code: 'NCRTC-RRTS', risk: 87, status: 'Critical', budgetCr: 30274, delayDays: 180 },
      { name: 'Urban Extension Road II (UER-II)', code: 'NHAI-UER2', risk: 64, status: 'Moderate', budgetCr: 7700, delayDays: 90 }
    ]
  },
  'Gujarat': {
    state: 'Gujarat',
    code: 'GJ',
    zone: 'Western Zone',
    projectCount: 175,
    totalBudgetCr: 320000,
    actualExpenditureCr: 165000,
    projectedCostCr: 312500,
    savingsOrLossCr: +7500, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 52,
    criticalCount: 14,
    avgDelayDays: 45,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Expedited land pooling mechanisms with high contractor mobilization rates.',
    topProjects: [
      { name: 'Dholera Industrial City Expressway', code: 'NHAI-DHE', risk: 48, status: 'Active', budgetCr: 4300, delayDays: 30 },
      { name: 'Ahmedabad-Mumbai Bullet Train (Gujarat Sector)', code: 'NHSRCL-MAHSR-GJ', risk: 58, status: 'Active', budgetCr: 68000, delayDays: 60 }
    ]
  },
  'Tamil Nadu': {
    state: 'Tamil Nadu',
    code: 'TN',
    zone: 'Southern Zone',
    projectCount: 180,
    totalBudgetCr: 280000,
    actualExpenditureCr: 152000,
    projectedCostCr: 274800,
    savingsOrLossCr: +5200, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 58,
    criticalCount: 22,
    avgDelayDays: 65,
    costRiskLevel: 'low',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'low',
    keyBottleneck: 'Port-connectivity cargo transit nodes and rapid EPC milestone execution.',
    topProjects: [
      { name: 'Chennai Metro Phase 2 Corridor 3', code: 'CMRL-P2-C3', risk: 62, status: 'Moderate', budgetCr: 28500, delayDays: 80 },
      { name: 'Tuticorin Outer Harbour Development', code: 'VOCPA-OHD', risk: 45, status: 'Active', budgetCr: 7200, delayDays: 35 }
    ]
  },
  'Uttar Pradesh': {
    state: 'Uttar Pradesh',
    code: 'UP',
    zone: 'Northern Zone',
    projectCount: 260,
    totalBudgetCr: 360000,
    actualExpenditureCr: 210000,
    projectedCostCr: 388400,
    savingsOrLossCr: -28400, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 88,
    criticalCount: 54,
    avgDelayDays: 210,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Linear railway embankment disputes and contractor machinery availability deficits.',
    topProjects: [
      { name: 'Ganga Expressway Package 3-6', code: 'UPEIDA-GE', risk: 84, status: 'Critical', budgetCr: 36200, delayDays: 210 },
      { name: 'Noida International Airport Ground Transport Node', code: 'NIA-GTN', risk: 74, status: 'High', budgetCr: 5700, delayDays: 140 }
    ]
  },
  'Andhra Pradesh': {
    state: 'Andhra Pradesh',
    code: 'AP',
    zone: 'Southern Zone',
    projectCount: 110,
    totalBudgetCr: 174000,
    actualExpenditureCr: 115000,
    projectedCostCr: 196200,
    savingsOrLossCr: -22200, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 84,
    criticalCount: 35,
    avgDelayDays: 270,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Riverine irrigation spillway rehabilitation and contractor re-tendering delays.',
    topProjects: [
      { id: 104, name: 'Polavaram Irrigation Project Phase II', code: 'PPA-PIP-2', risk: 85, status: 'Critical', budgetCr: 35000, delayDays: 270 },
      { name: 'Ramayapatnam Port Bulk Cargo Berth', code: 'APMB-RPB', risk: 78, status: 'High', budgetCr: 3750, delayDays: 150 }
    ]
  },
  'Karnataka': {
    state: 'Karnataka',
    code: 'KA',
    zone: 'Southern Zone',
    projectCount: 165,
    totalBudgetCr: 240000,
    actualExpenditureCr: 130000,
    projectedCostCr: 235500,
    savingsOrLossCr: +4500, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 56,
    criticalCount: 18,
    avgDelayDays: 60,
    costRiskLevel: 'low',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'low',
    keyBottleneck: 'Solid cost controls on industrial infrastructure with timely milestone certifications.',
    topProjects: [
      { name: 'Bengaluru Suburban Railway Project (K-RIDE)', code: 'KRIDE-BSRP', risk: 68, status: 'Moderate', budgetCr: 15767, delayDays: 90 },
      { name: 'Bengaluru Metro Phase 2A/2B (ORR-Airport)', code: 'BMRCL-P2AB', risk: 58, status: 'Active', budgetCr: 14844, delayDays: 65 }
    ]
  },
  'Madhya Pradesh': {
    state: 'Madhya Pradesh',
    code: 'MP',
    zone: 'Central Zone',
    projectCount: 150,
    totalBudgetCr: 195000,
    actualExpenditureCr: 98000,
    projectedCostCr: 191200,
    savingsOrLossCr: +3800, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 54,
    criticalCount: 16,
    avgDelayDays: 50,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Robust river interlinking project governance with tight contract variance control.',
    topProjects: [
      { name: 'Ken-Betwa River Link Canal Reach I', code: 'NWDA-KBL', risk: 56, status: 'Active', budgetCr: 44605, delayDays: 70 },
      { name: 'Bhopal-Indore Dedicated Freight Highway', code: 'MPRDC-BIDF', risk: 48, status: 'Active', budgetCr: 6500, delayDays: 35 }
    ]
  },
  'Rajasthan': {
    state: 'Rajasthan',
    code: 'RJ',
    zone: 'Northern Zone',
    projectCount: 140,
    totalBudgetCr: 175000,
    actualExpenditureCr: 92000,
    projectedCostCr: 176500,
    savingsOrLossCr: -1500, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 64,
    criticalCount: 24,
    avgDelayDays: 110,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Solar park evacuation transmission line corridor disputes in desert belt.',
    topProjects: [
      { name: 'Bhadla Renewable Energy Grid Corridor', code: 'PGCIL-BREG', risk: 65, status: 'Moderate', budgetCr: 8800, delayDays: 110 },
      { name: 'Amritsar-Jamnagar Expressway Rajasthan Section', code: 'NHAI-AJE-RJ', risk: 58, status: 'Active', budgetCr: 11200, delayDays: 80 }
    ]
  },
  'Bihar': {
    state: 'Bihar',
    code: 'BR',
    zone: 'Eastern Zone',
    projectCount: 135,
    totalBudgetCr: 185000,
    actualExpenditureCr: 112000,
    projectedCostCr: 206800,
    savingsOrLossCr: -21800, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 87,
    criticalCount: 46,
    avgDelayDays: 230,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Ganga river bridge scour depth design revisions and seasonal flood submergence.',
    topProjects: [
      { name: 'Kacchi Dargah-Bidupur 6-Lane Ganga Bridge', code: 'BSRDCL-KDB', risk: 88, status: 'Critical', budgetCr: 5000, delayDays: 240 },
      { name: 'Patna Metro Rail Project Phase 1', code: 'PMRC-P1', risk: 82, status: 'Critical', budgetCr: 13365, delayDays: 210 }
    ]
  },
  'West Bengal': {
    state: 'West Bengal',
    code: 'WB',
    zone: 'Eastern Zone',
    projectCount: 145,
    totalBudgetCr: 190000,
    actualExpenditureCr: 118000,
    projectedCostCr: 211500,
    savingsOrLossCr: -21500, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 85,
    criticalCount: 38,
    avgDelayDays: 220,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Encroachment removal delays along Kolkata East-West metro corridor and port yards.',
    topProjects: [
      { name: 'Kolkata Metro East-West Line Extension', code: 'KMRCL-EW', risk: 84, status: 'Critical', budgetCr: 8575, delayDays: 220 },
      { name: 'Tajpur Deep Sea Port Approach Navigational Channel', code: 'SMPK-TDSP', risk: 78, status: 'High', budgetCr: 4200, delayDays: 160 }
    ]
  },
  'Odisha': {
    state: 'Odisha',
    code: 'OD',
    zone: 'Eastern Zone',
    projectCount: 125,
    totalBudgetCr: 165000,
    actualExpenditureCr: 88000,
    projectedCostCr: 162100,
    savingsOrLossCr: +2900, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 57,
    criticalCount: 15,
    avgDelayDays: 55,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Speedy environmental single-window sanctions for coastal economic corridors.',
    topProjects: [
      { name: 'Paradip Port Western Dock Mechanization', code: 'PPA-WDM', risk: 52, status: 'Active', budgetCr: 3004, delayDays: 40 },
      { name: 'Coastal Highway Package Digha-Gopalpur', code: 'NHAI-CH-OD', risk: 62, status: 'Moderate', budgetCr: 7500, delayDays: 75 }
    ]
  },
  'Telangana': {
    state: 'Telangana',
    code: 'TS',
    zone: 'Southern Zone',
    projectCount: 115,
    totalBudgetCr: 155000,
    actualExpenditureCr: 84000,
    projectedCostCr: 154200,
    savingsOrLossCr: +800, // Moderate / Balanced
    fiscalStatus: 'moderate',
    avgRiskScore: 61,
    criticalCount: 19,
    avgDelayDays: 85,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Regional Ring Road land compensation determinations in peri-urban Hyderabad.',
    topProjects: [
      { name: 'Hyderabad Regional Ring Road (Northern Arc)', code: 'NHAI-HRRR-N', risk: 65, status: 'Moderate', budgetCr: 9500, delayDays: 95 },
      { name: 'Kaleshwaram Additional Lift Irrigation Package', code: 'TSIIC-KALI', risk: 60, status: 'Moderate', budgetCr: 18000, delayDays: 75 }
    ]
  },
  'Kerala': {
    state: 'Kerala',
    code: 'KL',
    zone: 'Southern Zone',
    projectCount: 95,
    totalBudgetCr: 135000,
    actualExpenditureCr: 74000,
    projectedCostCr: 137200,
    savingsOrLossCr: -2200, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 66,
    criticalCount: 20,
    avgDelayDays: 120,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'medium',
    keyBottleneck: 'High land acquisition cost per linear km in dense coastal corridors.',
    topProjects: [
      { name: 'Kochi Metro Phase 2 (JLN Stadium-Infopark)', code: 'KMRL-P2', risk: 64, status: 'Moderate', budgetCr: 1957, delayDays: 90 },
      { name: 'NH-66 Widening Kasaragod-Thiruvananthapuram', code: 'NHAI-NH66-KL', risk: 72, status: 'High', budgetCr: 44000, delayDays: 140 }
    ]
  },
  'Punjab': {
    state: 'Punjab',
    code: 'PB',
    zone: 'Northern Zone',
    projectCount: 80,
    totalBudgetCr: 95000,
    actualExpenditureCr: 52000,
    projectedCostCr: 96400,
    savingsOrLossCr: -1400, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 63,
    criticalCount: 15,
    avgDelayDays: 90,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Farmer compensation arbitration proceedings along greenfield highway corridors.',
    topProjects: [
      { name: 'Delhi-Amritsar-Katra Expressway Punjab Reach', code: 'NHAI-DAKE-PB', risk: 68, status: 'Moderate', budgetCr: 12500, delayDays: 105 }
    ]
  },
  'Haryana': {
    state: 'Haryana',
    code: 'HR',
    zone: 'Northern Zone',
    projectCount: 105,
    totalBudgetCr: 125000,
    actualExpenditureCr: 68000,
    projectedCostCr: 124100,
    savingsOrLossCr: +900, // Moderate / Balanced
    fiscalStatus: 'moderate',
    avgRiskScore: 60,
    criticalCount: 17,
    avgDelayDays: 80,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'low',
    keyBottleneck: 'High industrial density connectivity requiring round-the-clock traffic diversions.',
    topProjects: [
      { name: 'Haryana Orbital Rail Corridor (HORC)', code: 'HRIDC-HORC', risk: 62, status: 'Moderate', budgetCr: 5618, delayDays: 85 }
    ]
  },
  'Uttarakhand': {
    state: 'Uttarakhand',
    code: 'UK',
    zone: 'Northern Zone',
    projectCount: 85,
    totalBudgetCr: 92000,
    actualExpenditureCr: 58000,
    projectedCostCr: 105800,
    savingsOrLossCr: -13800, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 83,
    criticalCount: 19,
    avgDelayDays: 210,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Himalayan fragile geological strata and recurrent monsoon landslide washouts.',
    topProjects: [
      { id: 105, name: 'Chardham Highway Project', code: 'MORTH-CDH', risk: 83, status: 'Critical', budgetCr: 12000, delayDays: 210 },
      { name: 'Rishikesh-Karnaprayag Rail Line Tunnelling', code: 'RVNL-RKRL', risk: 86, status: 'Critical', budgetCr: 16216, delayDays: 230 }
    ]
  },
  'Himachal Pradesh': {
    state: 'Himachal Pradesh',
    code: 'HP',
    zone: 'Northern Zone',
    projectCount: 65,
    totalBudgetCr: 65000,
    actualExpenditureCr: 34000,
    projectedCostCr: 63200,
    savingsOrLossCr: +1800, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 51,
    criticalCount: 9,
    avgDelayDays: 40,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Disciplined hill highway execution with active slope protection engineering.',
    topProjects: [
      { name: 'Shimla-Kalka 4-Lane Four Laning', code: 'NHAI-SK4L', risk: 54, status: 'Active', budgetCr: 4100, delayDays: 45 }
    ]
  },
  'Jammu & Kashmir': {
    state: 'Jammu & Kashmir',
    code: 'JK',
    zone: 'Northern Zone',
    projectCount: 75,
    totalBudgetCr: 115000,
    actualExpenditureCr: 74000,
    projectedCostCr: 129500,
    savingsOrLossCr: -14500, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 86,
    criticalCount: 22,
    avgDelayDays: 250,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Extreme winter freezing and deep Pir Panjal tunneling fault-zone squeezing.',
    topProjects: [
      { name: 'Zojila Tunnel Construction Package', code: 'NHIDCL-ZT', risk: 88, status: 'Critical', budgetCr: 6800, delayDays: 260 },
      { name: 'Udhampur-Srinagar-Baramulla Rail Link', code: 'NR-USBRL', risk: 84, status: 'Critical', budgetCr: 28000, delayDays: 240 }
    ]
  },
  'Chhattisgarh': {
    state: 'Chhattisgarh',
    code: 'CG',
    zone: 'Central Zone',
    projectCount: 90,
    totalBudgetCr: 105000,
    actualExpenditureCr: 56000,
    projectedCostCr: 106800,
    savingsOrLossCr: -1800, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 65,
    criticalCount: 16,
    avgDelayDays: 115,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Dense Sal forest clearances for dedicated coal evacuation railway corridors.',
    topProjects: [
      { name: 'East Rail Corridor Phase 2 (Gevra-Pendra)', code: 'CERL-ERCP2', risk: 67, status: 'Moderate', budgetCr: 3050, delayDays: 120 }
    ]
  },
  'Jharkhand': {
    state: 'Jharkhand',
    code: 'JH',
    zone: 'Eastern Zone',
    projectCount: 95,
    totalBudgetCr: 115000,
    actualExpenditureCr: 62000,
    projectedCostCr: 117100,
    savingsOrLossCr: -2100, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 67,
    criticalCount: 18,
    avgDelayDays: 125,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Mineral corridor right-of-way settlements with coal block leases.',
    topProjects: [
      { name: 'Dhanbad-Chandrapura Railway Alignment Quadrupling', code: 'ECR-DCRQ', risk: 70, status: 'High', budgetCr: 4500, delayDays: 130 }
    ]
  },
  'Assam': {
    state: 'Assam',
    code: 'AS',
    zone: 'North-Eastern Zone',
    projectCount: 85,
    totalBudgetCr: 110000,
    actualExpenditureCr: 55000,
    projectedCostCr: 107800,
    savingsOrLossCr: +2200, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 59,
    criticalCount: 12,
    avgDelayDays: 70,
    costRiskLevel: 'low',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'low',
    keyBottleneck: 'Efficient execution of Brahmaputra bridge spans during dry winter work windows.',
    topProjects: [
      { name: 'Dhubri-Phulbari Brahmaputra Bridge', code: 'NHIDCL-DPBB', risk: 61, status: 'Moderate', budgetCr: 4997, delayDays: 75 }
    ]
  },
  'Arunachal Pradesh': {
    state: 'Arunachal Pradesh',
    code: 'AR',
    zone: 'North-Eastern Zone',
    projectCount: 50,
    totalBudgetCr: 48000,
    actualExpenditureCr: 29000,
    projectedCostCr: 54600,
    savingsOrLossCr: -6600, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 81,
    criticalCount: 14,
    avgDelayDays: 190,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Frontier highway construction in remote high-altitude rain-soaked terrain.',
    topProjects: [
      { name: 'Arunachal Frontier Highway Package 2', code: 'BRO-AFH2', risk: 83, status: 'Critical', budgetCr: 7200, delayDays: 200 }
    ]
  },
  'Nagaland': {
    state: 'Nagaland',
    code: 'NL',
    zone: 'North-Eastern Zone',
    projectCount: 30,
    totalBudgetCr: 19000,
    actualExpenditureCr: 12000,
    projectedCostCr: 22400,
    savingsOrLossCr: -3400, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 78,
    criticalCount: 8,
    avgDelayDays: 180,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Community land tenure negotiations and road formation cut-slope stability.',
    topProjects: [
      { name: 'Dimapur-Kohima 4-Lane Highway', code: 'NHIDCL-DKH', risk: 80, status: 'Critical', budgetCr: 2800, delayDays: 185 }
    ]
  },
  'Manipur': {
    state: 'Manipur',
    code: 'MN',
    zone: 'North-Eastern Zone',
    projectCount: 35,
    totalBudgetCr: 21000,
    actualExpenditureCr: 13500,
    projectedCostCr: 24900,
    savingsOrLossCr: -3900, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 82,
    criticalCount: 11,
    avgDelayDays: 200,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'high',
    keyBottleneck: 'Jiribam-Imphal railway project bridge pier erection in seismic fault zones.',
    topProjects: [
      { name: 'Jiribam-Imphal Railway Line Reach 3', code: 'NFR-JIRL', risk: 84, status: 'Critical', budgetCr: 14322, delayDays: 220 }
    ]
  },
  'Mizoram': {
    state: 'Mizoram',
    code: 'MZ',
    zone: 'North-Eastern Zone',
    projectCount: 25,
    totalBudgetCr: 165000,
    actualExpenditureCr: 10200,
    projectedCostCr: 19100,
    savingsOrLossCr: -2600, // Deficit / Loss
    fiscalStatus: 'deficit',
    avgRiskScore: 77,
    criticalCount: 7,
    avgDelayDays: 170,
    costRiskLevel: 'high',
    delayRiskLevel: 'high',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Bairabi-Sairang hill rail line tunneling amidst monsoonal slope washaways.',
    topProjects: [
      { name: 'Bairabi-Sairang New Broad Gauge Line', code: 'NFR-BSNL', risk: 79, status: 'High', budgetCr: 8214, delayDays: 175 }
    ]
  },
  'Tripura': {
    state: 'Tripura',
    code: 'TR',
    zone: 'North-Eastern Zone',
    projectCount: 28,
    totalBudgetCr: 18500,
    actualExpenditureCr: 9800,
    projectedCostCr: 18900,
    savingsOrLossCr: -400, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 60,
    criticalCount: 5,
    avgDelayDays: 85,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'low',
    keyBottleneck: 'Cross-border Maitri Setu logistics terminal integration and customs gates.',
    topProjects: [
      { name: 'Agartala-Akhaura International Rail Link', code: 'IRCON-AARL', risk: 58, status: 'Active', budgetCr: 972, delayDays: 70 }
    ]
  },
  'Meghalaya': {
    state: 'Meghalaya',
    code: 'ML',
    zone: 'North-Eastern Zone',
    projectCount: 32,
    totalBudgetCr: 26000,
    actualExpenditureCr: 13500,
    projectedCostCr: 26800,
    savingsOrLossCr: -800, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 63,
    criticalCount: 7,
    avgDelayDays: 95,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Limestone quarry clearance and high-rainfall culvert drainage upgrades.',
    topProjects: [
      { name: 'Shillong Western Bypass Highway', code: 'NHIDCL-SWB', risk: 64, status: 'Moderate', budgetCr: 1850, delayDays: 95 }
    ]
  },
  'Sikkim': {
    state: 'Sikkim',
    code: 'SK',
    zone: 'North-Eastern Zone',
    projectCount: 22,
    totalBudgetCr: 22000,
    actualExpenditureCr: 11000,
    projectedCostCr: 21400,
    savingsOrLossCr: +600, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 46,
    criticalCount: 3,
    avgDelayDays: 35,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Sivok-Rangpo railway tunnel safety monitoring with pre-cast concrete lining.',
    topProjects: [
      { name: 'Sivok-Rangpo Rail Line Project', code: 'IRCON-SRRL', risk: 50, status: 'Active', budgetCr: 4085, delayDays: 40 }
    ]
  },
  'Goa': {
    state: 'Goa',
    code: 'GA',
    zone: 'Western Zone',
    projectCount: 25,
    totalBudgetCr: 18000,
    actualExpenditureCr: 9500,
    projectedCostCr: 17300,
    savingsOrLossCr: +700, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 42,
    criticalCount: 2,
    avgDelayDays: 30,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Mormugao Port connectivity with automated toll systems.',
    topProjects: [
      { name: 'New Zuari Bridge Approach Viaducts', code: 'NHAI-NZB', risk: 44, status: 'Active', budgetCr: 2530, delayDays: 30 }
    ]
  },
  'Chandigarh': {
    state: 'Chandigarh',
    code: 'CH',
    zone: 'Northern Zone',
    projectCount: 15,
    totalBudgetCr: 8500,
    actualExpenditureCr: 4800,
    projectedCostCr: 8150,
    savingsOrLossCr: +350, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 38,
    criticalCount: 1,
    avgDelayDays: 20,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Urban civic flyover grade separators executed within timeline.',
    topProjects: [
      { name: 'Chandigarh Ring Road Package 1', code: 'NHAI-CRR1', risk: 36, status: 'Active', budgetCr: 1400, delayDays: 15 }
    ]
  },
  'Puducherry': {
    state: 'Puducherry',
    code: 'PY',
    zone: 'Southern Zone',
    projectCount: 12,
    totalBudgetCr: 6200,
    actualExpenditureCr: 3400,
    projectedCostCr: 5980,
    savingsOrLossCr: +220, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 40,
    criticalCount: 1,
    avgDelayDays: 25,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Coastal storm drainage modernizations completed on budget.',
    topProjects: [
      { name: 'Puducherry Port Commercial Cargo Terminal', code: 'PPD-CCT', risk: 42, status: 'Active', budgetCr: 650, delayDays: 25 }
    ]
  },
  'Daman & Diu': {
    state: 'Daman & Diu',
    code: 'DD',
    zone: 'Western Zone',
    projectCount: 8,
    totalBudgetCr: 4200,
    actualExpenditureCr: 2300,
    projectedCostCr: 4250,
    savingsOrLossCr: -50, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 42,
    criticalCount: 1,
    avgDelayDays: 25,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Coastal erosion seawall strengthening works.',
    topProjects: [
      { name: 'Daman Coastal Road & Promenade', code: 'DD-DCR', risk: 40, status: 'Active', budgetCr: 550, delayDays: 20 }
    ]
  },
  'Dadra & Nagar Haveli': {
    state: 'Dadra & Nagar Haveli',
    code: 'DNH',
    zone: 'Western Zone',
    projectCount: 9,
    totalBudgetCr: 4800,
    actualExpenditureCr: 2600,
    projectedCostCr: 4880,
    savingsOrLossCr: -80, // Moderate
    fiscalStatus: 'moderate',
    avgRiskScore: 45,
    criticalCount: 1,
    avgDelayDays: 30,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Silvassa-Vapi industrial highway lane expansion.',
    topProjects: [
      { name: 'Silvassa Smart City Infrastructure Package', code: 'DNH-SSC', risk: 44, status: 'Active', budgetCr: 620, delayDays: 25 }
    ]
  },
  'Lakshadweep': {
    state: 'Lakshadweep',
    code: 'LD',
    zone: 'Islands',
    projectCount: 6,
    totalBudgetCr: 3500,
    actualExpenditureCr: 1800,
    projectedCostCr: 3350,
    savingsOrLossCr: +150, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 35,
    criticalCount: 0,
    avgDelayDays: 15,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Subsea optical fiber cable operations successfully commissioned.',
    topProjects: [
      { name: 'Lakshadweep Submarine Optical Fiber Cable (KLI-SOFC)', code: 'BSNL-LSOFC', risk: 32, status: 'Completed', budgetCr: 1072, delayDays: 10 }
    ]
  },
  'Andaman and Nicobar Islands': {
    state: 'Andaman and Nicobar Islands',
    code: 'AN',
    zone: 'Islands',
    projectCount: 18,
    totalBudgetCr: 14000,
    actualExpenditureCr: 7500,
    projectedCostCr: 13400,
    savingsOrLossCr: +600, // Surplus / Net Savings
    fiscalStatus: 'surplus',
    avgRiskScore: 44,
    criticalCount: 2,
    avgDelayDays: 30,
    costRiskLevel: 'low',
    delayRiskLevel: 'low',
    executionRiskLevel: 'low',
    keyBottleneck: 'Great Nicobar International Transshipment Terminal preliminary surveys.',
    topProjects: [
      { name: 'Great Nicobar Port Infrastructure Reach 1', code: 'IPA-GNP1', risk: 48, status: 'Active', budgetCr: 4500, delayDays: 35 }
    ]
  }
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
    assignedOfficer: 'Joint Secretary (Urban Dev) / MoHUA',
    evidence: 'Underground tunnel TBM halted 400m before CSMIA Station due to ROW obstruction near runway.',
    lastUpdated: '2026-04-12'
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
    lastUpdated: '2026-04-10'
  },
  {
    id: 'INT-003',
    projectId: 103,
    projectName: 'Polavaram Irrigation Project',
    ministry: 'Ministry of Jal Shakti',
    state: 'Andhra Pradesh',
    currentRiskScore: 87,
    urgency: 'CRITICAL',
    recommendedAction: 'Release Compensatory R&R Tranche to Evacuate 42 Submergence Villages',
    estimatedRiskImpact: '-25.0% Risk Reduction',
    estimatedTimelineImpact: '-180 Days Delay Mitigation',
    status: 'Proposed',
    assignedOfficer: 'Secretary, Department of Water Resources',
    evidence: 'Local resettlement agitation impeding diaphragm wall concrete pour in upstream blocks.',
    lastUpdated: '2026-04-08'
  },
  {
    id: 'INT-004',
    projectId: 104,
    projectName: 'Kudankulam Nuclear Project',
    ministry: 'Department of Atomic Energy',
    state: 'Tamil Nadu',
    currentRiskScore: 85,
    urgency: 'HIGH',
    recommendedAction: 'Diplomatic Inter-Governmental Expediting for Steam Generator Maritime Transit',
    estimatedRiskImpact: '-15.0% Risk Reduction',
    estimatedTimelineImpact: '-75 Days Delay Mitigation',
    status: 'Under Review',
    assignedOfficer: 'Director (Projects), NPCIL',
    evidence: 'Heavy maritime transit shipment clearance bottleneck at international port of origin.',
    lastUpdated: '2026-04-05'
  },
  {
    id: 'INT-005',
    projectId: 105,
    projectName: 'Chardham Highway Project',
    ministry: 'Ministry of Road Transport & Highways',
    state: 'Uttarakhand',
    currentRiskScore: 83,
    urgency: 'HIGH',
    recommendedAction: 'Deploy Specialized Hydro-Seeding & Pre-Stressed Anchoring Crews on Slope B',
    estimatedRiskImpact: '-12.0% Risk Reduction',
    estimatedTimelineImpact: '-45 Days Delay Mitigation',
    status: 'Approved',
    assignedOfficer: 'Chief Engineer, MoRTH',
    evidence: 'Active debris chute detected by satellite InSAR radar monitoring over 3.2km stretch.',
    lastUpdated: '2026-04-02'
  }
];
