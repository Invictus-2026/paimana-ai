import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATE_RISK_SUMMARY, StateRiskData } from '../data/mockData';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Clock,
  IndianRupee,
  Search,
  Sparkles,
  ExternalLink,
  Layers,
  MapPin
} from 'lucide-react';
import {
  PageContainer,
  RiskBadge
} from '../components/ui';

type MapOverlay = 'fiscal' | 'overall' | 'delay' | 'cost';

interface IndiaStatePath {
  name: string;
  code: string;
  path: string;
  nodeX: number;
  nodeY: number;
  labelX: number;
  labelY: number;
  labelAnchor?: 'start' | 'middle' | 'end';
}

const INDIA_STATES_PATHS: IndiaStatePath[] = [
  // Northern Region
  {
    name: 'Jammu & Kashmir',
    code: 'JK',
    path: 'M 290,110 L 320,50 L 360,25 L 430,25 L 490,65 L 510,130 L 460,155 L 410,140 L 380,140 L 340,150 L 290,110 Z',
    nodeX: 390,
    nodeY: 85,
    labelX: 390,
    labelY: 65,
    labelAnchor: 'middle'
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    path: 'M 380,140 L 440,135 L 465,185 L 420,205 L 375,190 L 380,140 Z',
    nodeX: 415,
    nodeY: 168,
    labelX: 440,
    labelY: 165,
    labelAnchor: 'start'
  },
  {
    name: 'Punjab',
    code: 'PB',
    path: 'M 305,155 L 375,145 L 380,215 L 320,225 L 305,155 Z',
    nodeX: 345,
    nodeY: 185,
    labelX: 335,
    labelY: 175,
    labelAnchor: 'middle'
  },
  {
    name: 'Chandigarh',
    code: 'CH',
    path: 'M 378,168 L 394,168 L 394,184 L 378,184 Z',
    nodeX: 386,
    nodeY: 176,
    labelX: 386,
    labelY: 162,
    labelAnchor: 'middle'
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    path: 'M 440,135 L 495,145 L 515,205 L 460,225 L 425,200 L 440,135 Z',
    nodeX: 465,
    nodeY: 180,
    labelX: 475,
    labelY: 195,
    labelAnchor: 'start'
  },
  {
    name: 'Haryana',
    code: 'HR',
    path: 'M 335,215 L 415,205 L 425,275 L 360,285 L 335,215 Z',
    nodeX: 375,
    nodeY: 240,
    labelX: 360,
    labelY: 232,
    labelAnchor: 'middle'
  },
  {
    name: 'Delhi',
    code: 'DL',
    path: 'M 396,224 L 422,224 L 422,246 L 396,246 Z',
    nodeX: 409,
    nodeY: 235,
    labelX: 430,
    labelY: 238,
    labelAnchor: 'start'
  },
  // Western Region
  {
    name: 'Rajasthan',
    code: 'RJ',
    path: 'M 190,245 L 335,215 L 360,285 L 385,355 L 260,375 L 180,310 L 190,245 Z',
    nodeX: 270,
    nodeY: 295,
    labelX: 270,
    labelY: 318,
    labelAnchor: 'middle'
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    path: 'M 135,345 L 255,335 L 275,450 L 205,470 L 135,415 Z',
    nodeX: 205,
    nodeY: 400,
    labelX: 190,
    labelY: 420,
    labelAnchor: 'middle'
  },
  {
    name: 'Daman & Diu',
    code: 'DD',
    path: 'M 215,450 L 235,450 L 235,468 L 215,468 Z',
    nodeX: 225,
    nodeY: 459,
    labelX: 175,
    labelY: 462,
    labelAnchor: 'end'
  },
  {
    name: 'Dadra & Nagar Haveli',
    code: 'DNH',
    path: 'M 235,470 L 255,470 L 255,490 L 235,490 Z',
    nodeX: 245,
    nodeY: 480,
    labelX: 190,
    labelY: 486,
    labelAnchor: 'end'
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    path: 'M 245,450 L 440,445 L 450,580 L 260,585 L 245,450 Z',
    nodeX: 350,
    nodeY: 515,
    labelX: 350,
    labelY: 538,
    labelAnchor: 'middle'
  },
  {
    name: 'Goa',
    code: 'GA',
    path: 'M 275,595 L 305,595 L 305,625 L 275,625 Z',
    nodeX: 290,
    nodeY: 610,
    labelX: 260,
    labelY: 614,
    labelAnchor: 'end'
  },
  // Central Region
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    path: 'M 315,345 L 525,340 L 535,450 L 325,455 L 315,345 Z',
    nodeX: 425,
    nodeY: 395,
    labelX: 425,
    labelY: 418,
    labelAnchor: 'middle'
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    path: 'M 505,390 L 585,385 L 575,535 L 495,525 L 505,390 Z',
    nodeX: 540,
    nodeY: 460,
    labelX: 550,
    labelY: 478,
    labelAnchor: 'middle'
  },
  // Eastern Region
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    path: 'M 385,225 L 575,235 L 585,345 L 420,365 L 365,285 L 385,225 Z',
    nodeX: 480,
    nodeY: 290,
    labelX: 480,
    labelY: 312,
    labelAnchor: 'middle'
  },
  {
    name: 'Bihar',
    code: 'BR',
    path: 'M 575,270 L 685,275 L 695,355 L 585,355 L 575,270 Z',
    nodeX: 635,
    nodeY: 315,
    labelX: 635,
    labelY: 335,
    labelAnchor: 'middle'
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    path: 'M 585,355 L 685,355 L 680,430 L 575,420 L 585,355 Z',
    nodeX: 630,
    nodeY: 390,
    labelX: 630,
    labelY: 408,
    labelAnchor: 'middle'
  },
  {
    name: 'West Bengal',
    code: 'WB',
    path: 'M 685,280 L 725,280 L 725,370 L 710,480 L 655,445 L 685,355 L 685,280 Z',
    nodeX: 680,
    nodeY: 400,
    labelX: 710,
    labelY: 418,
    labelAnchor: 'start'
  },
  {
    name: 'Odisha',
    code: 'OD',
    path: 'M 575,420 L 675,425 L 665,545 L 565,525 L 575,420 Z',
    nodeX: 620,
    nodeY: 480,
    labelX: 620,
    labelY: 502,
    labelAnchor: 'middle'
  },
  // Southern Region
  {
    name: 'Telangana',
    code: 'TS',
    path: 'M 395,525 L 515,520 L 520,620 L 400,620 L 395,525 Z',
    nodeX: 460,
    nodeY: 570,
    labelX: 460,
    labelY: 592,
    labelAnchor: 'middle'
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    path: 'M 435,620 L 585,530 L 565,725 L 425,730 L 435,620 Z',
    nodeX: 485,
    nodeY: 675,
    labelX: 510,
    labelY: 692,
    labelAnchor: 'middle'
  },
  {
    name: 'Karnataka',
    code: 'KA',
    path: 'M 295,585 L 425,580 L 425,755 L 320,755 L 295,585 Z',
    nodeX: 360,
    nodeY: 665,
    labelX: 345,
    labelY: 688,
    labelAnchor: 'middle'
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    path: 'M 380,730 L 495,725 L 445,915 L 375,875 L 380,730 Z',
    nodeX: 440,
    nodeY: 800,
    labelX: 440,
    labelY: 825,
    labelAnchor: 'middle'
  },
  {
    name: 'Kerala',
    code: 'KL',
    path: 'M 330,750 L 380,745 L 395,895 L 345,895 L 330,750 Z',
    nodeX: 365,
    nodeY: 820,
    labelX: 330,
    labelY: 840,
    labelAnchor: 'end'
  },
  {
    name: 'Puducherry',
    code: 'PY',
    path: 'M 465,745 L 485,745 L 485,765 L 465,765 Z',
    nodeX: 475,
    nodeY: 755,
    labelX: 495,
    labelY: 759,
    labelAnchor: 'start'
  },
  // North-Eastern Region
  {
    name: 'Sikkim',
    code: 'SK',
    path: 'M 685,245 L 710,245 L 710,280 L 685,280 Z',
    nodeX: 698,
    nodeY: 262,
    labelX: 718,
    labelY: 266,
    labelAnchor: 'start'
  },
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    path: 'M 755,220 L 905,230 L 915,285 L 795,285 L 755,220 Z',
    nodeX: 840,
    nodeY: 255,
    labelX: 840,
    labelY: 236,
    labelAnchor: 'middle'
  },
  {
    name: 'Assam',
    code: 'AS',
    path: 'M 725,280 L 860,280 L 865,340 L 735,340 L 725,280 Z',
    nodeX: 795,
    nodeY: 310,
    labelX: 820,
    labelY: 308,
    labelAnchor: 'start'
  },
  {
    name: 'Nagaland',
    code: 'NL',
    path: 'M 855,285 L 900,285 L 905,335 L 860,335 Z',
    nodeX: 880,
    nodeY: 310,
    labelX: 910,
    labelY: 312,
    labelAnchor: 'start'
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    path: 'M 725,335 L 805,335 L 805,370 L 725,370 Z',
    nodeX: 765,
    nodeY: 352,
    labelX: 745,
    labelY: 375,
    labelAnchor: 'end'
  },
  {
    name: 'Manipur',
    code: 'MN',
    path: 'M 845,335 L 895,335 L 895,390 L 845,390 Z',
    nodeX: 870,
    nodeY: 362,
    labelX: 900,
    labelY: 366,
    labelAnchor: 'start'
  },
  {
    name: 'Tripura',
    code: 'TR',
    path: 'M 755,390 L 795,390 L 795,440 L 755,440 Z',
    nodeX: 775,
    nodeY: 415,
    labelX: 745,
    labelY: 418,
    labelAnchor: 'end'
  },
  {
    name: 'Mizoram',
    code: 'MZ',
    path: 'M 800,390 L 850,390 L 850,465 L 800,465 Z',
    nodeX: 825,
    nodeY: 428,
    labelX: 855,
    labelY: 432,
    labelAnchor: 'start'
  },
  // Island Territories
  {
    name: 'Lakshadweep',
    code: 'LD',
    path: 'M 215,785 L 255,785 L 255,865 L 215,865 Z',
    nodeX: 235,
    nodeY: 825,
    labelX: 200,
    labelY: 830,
    labelAnchor: 'end'
  },
  {
    name: 'Andaman and Nicobar Islands',
    code: 'AN',
    path: 'M 795,685 L 830,685 L 830,895 L 795,895 Z',
    nodeX: 812,
    nodeY: 790,
    labelX: 785,
    labelY: 770,
    labelAnchor: 'end'
  }
];

export const RiskMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeOverlay, setActiveOverlay] = useState<MapOverlay>('fiscal');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedStateData: StateRiskData = STATE_RISK_SUMMARY[selectedState] || {
    state: selectedState,
    code: 'IN',
    zone: 'National',
    projectCount: 45,
    totalBudgetCr: 88000,
    actualExpenditureCr: 52000,
    projectedCostCr: 89500,
    savingsOrLossCr: -1500,
    fiscalStatus: 'moderate',
    avgRiskScore: 64,
    criticalCount: 8,
    avgDelayDays: 95,
    costRiskLevel: 'medium',
    delayRiskLevel: 'high',
    executionRiskLevel: 'medium',
    keyBottleneck: 'Multi-agency statutory clearances and right-of-way settlements.',
    topProjects: []
  };

  // State Neon and Color Resolver
  const getStateNeonTheme = (stateName: string) => {
    const data = STATE_RISK_SUMMARY[stateName];
    if (!data) {
      return {
        neonColor: '#10b981',
        fill: 'rgba(16, 185, 129, 0.16)',
        stroke: '#10b981',
        filter: 'url(#neon-glow-green)',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: '#10b981',
        status: 'surplus'
      };
    }

    if (activeOverlay === 'fiscal') {
      if (data.fiscalStatus === 'surplus') {
        return {
          neonColor: '#10b981', // Neon Green (High Savings / Surplus)
          fill: 'rgba(16, 185, 129, 0.22)',
          stroke: '#10b981',
          filter: 'url(#neon-glow-green)',
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-emerald-500/30',
          dotColor: '#34d399',
          status: 'surplus'
        };
      }
      if (data.fiscalStatus === 'moderate') {
        return {
          neonColor: '#f59e0b', // Neon Orange/Yellow (Moderate / Balanced)
          fill: 'rgba(245, 158, 11, 0.24)',
          stroke: '#f59e0b',
          filter: 'url(#neon-glow-yellow)',
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-amber-500/30',
          dotColor: '#fbbf24',
          status: 'moderate'
        };
      }
      return {
        neonColor: '#ef4444', // Neon Red (High Loss / Cost Escalation)
        fill: 'rgba(239, 68, 68, 0.28)',
        stroke: '#ef4444',
        filter: 'url(#neon-glow-red)',
        badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-rose-500/30',
        dotColor: '#f87171',
        status: 'deficit'
      };
    }

    if (activeOverlay === 'overall') {
      if (data.avgRiskScore >= 75) {
        return { neonColor: '#ef4444', fill: 'rgba(239, 68, 68, 0.28)', stroke: '#ef4444', filter: 'url(#neon-glow-red)', dotColor: '#f87171', status: 'critical' };
      }
      if (data.avgRiskScore >= 60) {
        return { neonColor: '#f59e0b', fill: 'rgba(245, 158, 11, 0.24)', stroke: '#f59e0b', filter: 'url(#neon-glow-yellow)', dotColor: '#fbbf24', status: 'moderate' };
      }
      return { neonColor: '#10b981', fill: 'rgba(16, 185, 129, 0.22)', stroke: '#10b981', filter: 'url(#neon-glow-green)', dotColor: '#34d399', status: 'low' };
    }

    if (activeOverlay === 'delay') {
      const delay = data.avgDelayDays || 90;
      if (delay >= 180) {
        return { neonColor: '#ef4444', fill: 'rgba(239, 68, 68, 0.28)', stroke: '#ef4444', filter: 'url(#neon-glow-red)', dotColor: '#f87171', status: 'critical' };
      }
      if (delay >= 80) {
        return { neonColor: '#f59e0b', fill: 'rgba(245, 158, 11, 0.24)', stroke: '#f59e0b', filter: 'url(#neon-glow-yellow)', dotColor: '#fbbf24', status: 'moderate' };
      }
      return { neonColor: '#10b981', fill: 'rgba(16, 185, 129, 0.22)', stroke: '#10b981', filter: 'url(#neon-glow-green)', dotColor: '#34d399', status: 'low' };
    }

    // cost risk
    if (data.costRiskLevel === 'high') {
      return { neonColor: '#ef4444', fill: 'rgba(239, 68, 68, 0.28)', stroke: '#ef4444', filter: 'url(#neon-glow-red)', dotColor: '#f87171', status: 'critical' };
    }
    if (data.costRiskLevel === 'medium') {
      return { neonColor: '#f59e0b', fill: 'rgba(245, 158, 11, 0.24)', stroke: '#f59e0b', filter: 'url(#neon-glow-yellow)', dotColor: '#fbbf24', status: 'moderate' };
    }
    return { neonColor: '#10b981', fill: 'rgba(16, 185, 129, 0.22)', stroke: '#10b981', filter: 'url(#neon-glow-green)', dotColor: '#34d399', status: 'low' };
  };

  // National Aggregations
  const allStatesList = Object.values(STATE_RISK_SUMMARY);
  const surplusCount = allStatesList.filter(s => s.fiscalStatus === 'surplus').length;
  const moderateCount = allStatesList.filter(s => s.fiscalStatus === 'moderate').length;
  const deficitCount = allStatesList.filter(s => s.fiscalStatus === 'deficit').length;
  const netNationalSavingsLoss = allStatesList.reduce((acc, s) => acc + (s.savingsOrLossCr || 0), 0);

  const filteredStates = INDIA_STATES_PATHS.filter(st =>
    st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hoveredData = hoveredState ? STATE_RISK_SUMMARY[hoveredState] : null;

  return (
    <PageContainer breadcrumb="NATIONAL SPATIAL RISK & FISCAL MAP">
      {/* Top Header Banner */}
      <div className="command-panel p-5 bg-gradient-to-r from-[#0b172a] via-[#0f2444] to-[#091e38] text-white border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
              ● Spatial Fiscal Intelligence
            </span>
            <span className="text-[10px] text-slate-400 font-mono">• 28 States & 8 Union Territories</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight font-heading mt-1">
            National Infrastructure Spatial Risk Map
          </h1>
          <p className="text-slate-300 text-xs mt-0.5 font-medium max-w-2xl">
            Interactive territorial intelligence engine mapping capital savings, profit & loss variances, and multi-variable project risk across India.
          </p>
        </div>

        {/* Overlay Layer Switches */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/80 shrink-0">
          <button
            onClick={() => setActiveOverlay('fiscal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeOverlay === 'fiscal'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>⚡ Savings & P&L (Neon)</span>
          </button>

          <button
            onClick={() => setActiveOverlay('overall')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeOverlay === 'overall'
                ? 'bg-[#0d52ce] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-300" />
            <span>Composite Risk</span>
          </button>

          <button
            onClick={() => setActiveOverlay('delay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeOverlay === 'delay'
                ? 'bg-[#0d52ce] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-300" />
            <span>Schedule Delay</span>
          </button>

          <button
            onClick={() => setActiveOverlay('cost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeOverlay === 'cost'
                ? 'bg-[#0d52ce] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-blue-300" />
            <span>Cost Overrun</span>
          </button>
        </div>
      </div>

      {/* National Fiscal Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-[#0b172a] border border-slate-800 text-white shadow-md">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>National Net Variance (P&L)</span>
            <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className={`text-xl font-black font-heading tabular-nums ${netNationalSavingsLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netNationalSavingsLoss >= 0 ? `+₹${netNationalSavingsLoss.toLocaleString()} Cr` : `-₹${Math.abs(netNationalSavingsLoss).toLocaleString()} Cr`}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Cumulative variance against original sanctions</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#0b172a] border border-emerald-500/40 text-white shadow-md">
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Surplus Territories (Green Neon)</span>
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-black text-emerald-400 font-heading tabular-nums">{surplusCount} States</span>
            <span className="text-[10px] text-emerald-300/80 font-mono">Net Positive Capital Savings</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Gujarat, Tamil Nadu, MP, Karnataka, Odisha, etc.</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-[#0b172a] border border-amber-500/40 text-white shadow-md">
          <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Moderate Variance (Orange/Yellow Neon)</span>
            </span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-black text-amber-400 font-heading tabular-nums">{moderateCount} States</span>
            <span className="text-[10px] text-amber-300/80 font-mono">Within 3% Tolerance</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Delhi, Rajasthan, Telangana, Punjab, Haryana, etc.</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-[#0b172a] border border-rose-500/40 text-white shadow-md">
          <div className="flex items-center justify-between text-[10px] font-bold text-rose-300 uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Deficit / Escalation (Red Neon)</span>
            </span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-black text-rose-400 font-heading tabular-nums">{deficitCount} States</span>
            <span className="text-[10px] text-rose-300/80 font-mono">Severe Cost Overrun (Loss)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Maharashtra, UP, Bihar, WB, Andhra, UK, etc.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive India Spatial Map Box (7 cols) */}
        <div className="command-panel p-5 bg-[#07101e] text-slate-100 border border-slate-800 rounded-2xl lg:col-span-7 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Neon Glow Definitions */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  Active Spatial Neon Layer:
                </span>
                <span className="px-2 py-0.5 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 rounded-md">
                  {activeOverlay === 'fiscal' ? '⚡ Savings & P&L Neon Distribution' : `${activeOverlay.toUpperCase()} Risk Map`}
                </span>
              </div>

              {/* Dynamic Semantic Legend */}
              <div className="flex items-center space-x-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  <span>Surplus / Savings</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                  <span>Moderate / Watch</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" />
                  <span>Deficit / Overrun</span>
                </span>
              </div>
            </div>

            {/* Quick State Search and Quick Chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center space-x-2 flex-1 min-w-[200px] max-w-xs">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Indian State or UT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {['Maharashtra', 'Gujarat', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh', 'Andhra Pradesh'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedState(st)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer border ${
                      selectedState === st
                        ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive India SVG Map */}
            <div className="relative py-2 flex items-center justify-center min-h-[580px]">
              {/* Floating Hover Tooltip HUD */}
              {hoveredData && (
                <div className="absolute top-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl pointer-events-none transition-all duration-150 text-xs">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-white font-heading">{hoveredData.state}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({hoveredData.code})</span>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between space-x-4">
                      <span className="text-slate-400 text-[11px]">Fiscal Balance:</span>
                      <span className={`font-mono font-bold ${hoveredData.fiscalStatus === 'surplus' ? 'text-emerald-400' : hoveredData.fiscalStatus === 'moderate' ? 'text-amber-400' : 'text-rose-400'}`}>
                        {(hoveredData.savingsOrLossCr || 0) >= 0 ? `+₹${hoveredData.savingsOrLossCr?.toLocaleString()} Cr` : `-₹${Math.abs(hoveredData.savingsOrLossCr || 0).toLocaleString()} Cr`}
                      </span>
                    </div>
                    <div className="flex justify-between space-x-4">
                      <span className="text-slate-400 text-[11px]">Projects Monitored:</span>
                      <span className="font-bold text-white">{hoveredData.projectCount}</span>
                    </div>
                    <div className="flex justify-between space-x-4">
                      <span className="text-slate-400 text-[11px]">Risk Index:</span>
                      <span className="font-bold text-white">{hoveredData.avgRiskScore} / 100</span>
                    </div>
                  </div>
                </div>
              )}

              <svg
                viewBox="0 0 940 980"
                className="w-full max-w-2xl h-auto drop-shadow-2xl select-none"
              >
                {/* SVG Neon Glow Filter Definitions */}
                <defs>
                  {/* Neon Green Glow */}
                  <filter id="neon-glow-green" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10b981" floodOpacity="0.9" />
                    <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#10b981" floodOpacity="0.4" />
                  </filter>

                  {/* Neon Yellow/Orange Glow */}
                  <filter id="neon-glow-yellow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.9" />
                    <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#f59e0b" floodOpacity="0.4" />
                  </filter>

                  {/* Neon Red Glow */}
                  <filter id="neon-glow-red" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ef4444" floodOpacity="0.95" />
                    <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#ef4444" floodOpacity="0.45" />
                  </filter>

                  {/* Active Selected State Glow */}
                  <filter id="neon-glow-selected" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#38bdf8" floodOpacity="1" />
                    <feDropShadow dx="0" dy="0" stdDeviation="20" floodColor="#38bdf8" floodOpacity="0.6" />
                  </filter>

                  {/* Subtle Blueprint Grid Pattern */}
                  <pattern id="india-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.45" />
                  </pattern>
                </defs>

                {/* Technical Blueprint Backdrop */}
                <rect width="940" height="980" fill="url(#india-grid)" rx="16" />

                {/* State Polygons with Neon Strokes & Interactive Hover */}
                <g strokeLinejoin="round" strokeLinecap="round">
                  {filteredStates.map((st) => {
                    const isSelected = selectedState === st.name;
                    const isHovered = hoveredState === st.name;
                    const theme = getStateNeonTheme(st.name);

                    return (
                      <g
                        key={st.name}
                        onClick={() => setSelectedState(st.name)}
                        onMouseEnter={() => setHoveredState(st.name)}
                        onMouseLeave={() => setHoveredState(null)}
                        className="cursor-pointer transition-all duration-200 group"
                      >
                        {/* State Polygon Region */}
                        <path
                          d={st.path}
                          fill={isSelected ? 'rgba(56, 189, 248, 0.35)' : isHovered ? theme.neonColor : theme.fill}
                          fillOpacity={isHovered ? 0.45 : isSelected ? 0.5 : 0.85}
                          stroke={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : theme.stroke}
                          strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.6}
                          filter={isSelected ? 'url(#neon-glow-selected)' : theme.filter}
                          className="transition-all duration-150"
                        />

                        {/* Interactive Neon Node Marker (Like reference image dots) */}
                        <g transform={`translate(${st.nodeX}, ${st.nodeY})`}>
                          {/* Pulsing Radar Wave (Active on selected or hovered) */}
                          {(isSelected || isHovered) && (
                            <circle
                              r="13"
                              fill="none"
                              stroke={isSelected ? '#38bdf8' : theme.neonColor}
                              strokeWidth="1.5"
                              opacity="0.8"
                              className="animate-ping"
                            />
                          )}

                          {/* Outer Neon Halo */}
                          <circle
                            r={isSelected ? 7.5 : 5.5}
                            fill={isSelected ? '#0284c7' : '#0f172a'}
                            stroke={isSelected ? '#ffffff' : theme.dotColor}
                            strokeWidth={isSelected ? 2.5 : 1.8}
                            filter={theme.filter}
                          />

                          {/* Radiant Core LED Dot */}
                          <circle
                            r={isSelected ? 4 : 2.8}
                            fill={isSelected ? '#ffffff' : theme.dotColor}
                          />
                        </g>

                        {/* State Name Typography Label */}
                        <text
                          x={st.labelX}
                          y={st.labelY}
                          textAnchor={st.labelAnchor || 'middle'}
                          fill={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#e2e8f0'}
                          fontSize={isSelected ? 10.5 : 9}
                          fontWeight={isSelected ? '800' : '700'}
                          letterSpacing="0.05em"
                          pointerEvents="none"
                          className="select-none transition-all duration-150"
                          style={{
                            textShadow: isSelected
                              ? '0 0 10px rgba(56, 189, 248, 0.9), 0 1px 3px #000'
                              : '0 1px 2px #000000, 0 0 4px #000000'
                          }}
                        >
                          {st.name.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* Bottom Coordinate Strip */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-2">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click any state polygon or pulsing node to display granular state financial dossier.</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              GatiShakti Coordinate Grid • 100% Vectorized
            </span>
          </div>
        </div>

        {/* Selected State Regional Financial & Risk Dossier (5 cols) */}
        <div className="command-panel p-5 bg-white border border-slate-200/90 rounded-2xl lg:col-span-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-4">
            {/* Header with State Emblem & Code */}
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold text-[#0d52ce] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    State Dossier • {selectedStateData.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedStateData.zone}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-1 font-heading">
                  {selectedStateData.state}
                </h2>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>IPMD Feed Active</span>
                </span>
              </div>
            </div>

            {/* Neon Savings & Profit/Loss Hero Banner */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                selectedStateData.fiscalStatus === 'surplus'
                  ? 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-emerald-900/60 border-emerald-500/70 shadow-lg shadow-emerald-500/20 text-white'
                  : selectedStateData.fiscalStatus === 'moderate'
                  ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-900/60 border-amber-500/70 shadow-lg shadow-amber-500/20 text-white'
                  : 'bg-gradient-to-br from-rose-950/90 via-slate-900 to-rose-900/60 border-rose-500/70 shadow-lg shadow-rose-500/20 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedStateData.fiscalStatus === 'surplus'
                      ? 'bg-emerald-900/80 text-emerald-300 border-emerald-400/50'
                      : selectedStateData.fiscalStatus === 'moderate'
                      ? 'bg-amber-900/80 text-amber-300 border-amber-400/50'
                      : 'bg-rose-900/80 text-rose-300 border-rose-400/50'
                  }`}
                >
                  {selectedStateData.fiscalStatus === 'surplus'
                    ? '● FISCAL SURPLUS • NET CAPITAL SAVINGS'
                    : selectedStateData.fiscalStatus === 'moderate'
                    ? '● BALANCED STANCE • MARGINAL VARIANCE'
                    : '● FISCAL DEFICIT • COST ESCALATION (LOSS)'}
                </span>

                <span className="text-[10px] text-slate-300 font-mono">CCEA Outlay Audit</span>
              </div>

              <div className="mt-3 flex items-baseline space-x-2">
                <span
                  className={`text-3xl font-black font-heading tabular-nums ${
                    selectedStateData.fiscalStatus === 'surplus'
                      ? 'text-emerald-400 drop-shadow-[0_0_12px_#10b981]'
                      : selectedStateData.fiscalStatus === 'moderate'
                      ? 'text-amber-400 drop-shadow-[0_0_12px_#f59e0b]'
                      : 'text-rose-400 drop-shadow-[0_0_12px_#ef4444]'
                  }`}
                >
                  {(selectedStateData.savingsOrLossCr || 0) >= 0
                    ? `+₹${(selectedStateData.savingsOrLossCr || 0).toLocaleString()} Cr`
                    : `-₹${Math.abs(selectedStateData.savingsOrLossCr || 0).toLocaleString()} Cr`}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {(selectedStateData.savingsOrLossCr || 0) >= 0 ? 'Surplus / Capital Savings' : 'Total Cost Escalation (Loss)'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                {selectedStateData.fiscalStatus === 'surplus'
                  ? 'Active capital savings achieved through tight contractor milestone verification and expedited right-of-way acquisitions.'
                  : selectedStateData.fiscalStatus === 'moderate'
                  ? 'Expenditure executing within 3% tolerance of sanctioned outlay with balanced interim milestone disbursements.'
                  : 'Severe cost escalations over sanctioned baseline requiring Cabinet Committee on Economic Affairs (CCEA) revision review.'}
              </p>
            </div>

            {/* Financial Outlay Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Financial Outlay & Capital Absorption
              </span>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Sanctioned Outlay</span>
                  <p className="text-xs font-black text-slate-800 font-heading tabular-nums mt-0.5">
                    ₹{selectedStateData.totalBudgetCr.toLocaleString()} Cr
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Cumulative Spent</span>
                  <p className="text-xs font-black text-slate-800 font-heading tabular-nums mt-0.5">
                    ₹{(selectedStateData.actualExpenditureCr || Math.round(selectedStateData.totalBudgetCr * 0.58)).toLocaleString()} Cr
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Projected Total</span>
                  <p className="text-xs font-black text-slate-800 font-heading tabular-nums mt-0.5">
                    ₹{(selectedStateData.projectedCostCr || Math.round(selectedStateData.totalBudgetCr * 1.05)).toLocaleString()} Cr
                  </p>
                </div>
              </div>

              {/* Absorption Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span>Capital Absorption Rate</span>
                  <span className="text-slate-800">
                    {Math.round(((selectedStateData.actualExpenditureCr || selectedStateData.totalBudgetCr * 0.6) / selectedStateData.totalBudgetCr) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedStateData.fiscalStatus === 'surplus'
                        ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                        : selectedStateData.fiscalStatus === 'moderate'
                        ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round(((selectedStateData.actualExpenditureCr || selectedStateData.totalBudgetCr * 0.6) / selectedStateData.totalBudgetCr) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Operational & Risk Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Risk Score</span>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-lg font-black text-slate-900 font-heading tabular-nums">{selectedStateData.avgRiskScore}</span>
                  <span className="text-[10px] text-slate-400">/100</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Active Projects</span>
                <p className="text-lg font-black text-slate-900 font-heading tabular-nums mt-1">
                  {selectedStateData.projectCount}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Avg Delay</span>
                <p className="text-lg font-black text-slate-900 font-heading tabular-nums mt-1">
                  +{selectedStateData.avgDelayDays || 90}d
                </p>
              </div>
            </div>

            {/* Ground Reality Bottleneck Insight */}
            {selectedStateData.keyBottleneck && (
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                    Strategic Ground Bottleneck
                  </span>
                  <p className="text-xs text-blue-950 font-medium mt-0.5 leading-snug">
                    {selectedStateData.keyBottleneck}
                  </p>
                </div>
              </div>
            )}

            {/* Monitored Projects in this State */}
            {selectedStateData.topProjects && selectedStateData.topProjects.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Key Central Sector Projects in {selectedStateData.state}:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedStateData.topProjects.map((proj, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 transition flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{proj.name}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{proj.code} • ₹{proj.budgetCr?.toLocaleString()} Cr</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <RiskBadge score={proj.risk} size="sm" />
                        {proj.id && (
                          <button
                            onClick={() => navigate(`/projects/${proj.id}`)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                            title="Inspect Project Dossier"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Directives */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => navigate(`/projects?state=${encodeURIComponent(selectedStateData.state)}`)}
              className="w-full py-2.5 px-4 bg-[#0d52ce] hover:bg-[#0b45ad] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0d52ce]/20 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>View All {selectedStateData.projectCount} {selectedStateData.state} Projects in Matrix</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/scenarios')}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Simulate State Fiscal Stress Scenario</span>
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
