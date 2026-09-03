import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DASHBOARD_STATS,
  SECTOR_DISTRIBUTION,
  MOCK_PROJECTS
} from '../data/mockData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Download,
  Search,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';
import {
  PageContainer,
  RiskBadge
} from '../components/ui';

// Extended trend data for 3M, 6M, and 12M horizons
const TREND_HISTORY_12M = [
  { month: 'May 25', costOverrun: 14.2, timeOverrun: 9.5, threshold: 15 },
  { month: 'Jun 25', costOverrun: 15.0, timeOverrun: 10.2, threshold: 15 },
  { month: 'Jul 25', costOverrun: 15.8, timeOverrun: 10.8, threshold: 15 },
  { month: 'Aug 25', costOverrun: 16.5, timeOverrun: 11.4, threshold: 15 },
  { month: 'Sep 25', costOverrun: 17.1, timeOverrun: 11.9, threshold: 15 },
  { month: 'Oct 25', costOverrun: 17.6, timeOverrun: 12.3, threshold: 15 },
  { month: 'Nov 25', costOverrun: 18.2, timeOverrun: 12.8, threshold: 15 },
  { month: 'Dec 25', costOverrun: 19.4, timeOverrun: 13.5, threshold: 15 },
  { month: 'Jan 26', costOverrun: 21.0, timeOverrun: 14.3, threshold: 15 },
  { month: 'Feb 26', costOverrun: 22.3, timeOverrun: 15.1, threshold: 15 },
  { month: 'Mar 26', costOverrun: 23.5, timeOverrun: 16.2, threshold: 15 },
  { month: 'Apr 26', costOverrun: 24.8, timeOverrun: 17.4, threshold: 15 },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeHorizon, setTimeHorizon] = useState<'3M' | '6M' | '12M'>('6M');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Filter trend points based on selected horizon
  const trendData = useMemo(() => {
    if (timeHorizon === '3M') return TREND_HISTORY_12M.slice(-3);
    if (timeHorizon === '6M') return TREND_HISTORY_12M.slice(-6);
    return TREND_HISTORY_12M;
  }, [timeHorizon]);

  // Handle mock refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Handle report export
  const handleExport = () => {
    setExportNotification('Monthly Flash Report generated: MoSPI-Flash-Apr2026.pdf');
    setTimeout(() => {
      setExportNotification(null);
    }, 3500);
  };

  // Open global command palette
  const handleOpenCommand = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  // Sector intelligence with cost exposure and risk highlights
  const sectorData = useMemo(() => {
    return [
      {
        rank: 1,
        name: 'Transport & Logistics',
        count: 564,
        pct: 28.5,
        exposure: '₹14.28 Lakh Cr',
        riskTier: 'High Risk Conc.',
        riskColor: 'text-orange-600 bg-orange-50 border-orange-200',
        barColor: '#0d52ce'
      },
      {
        rank: 2,
        name: 'Energy (Power & Petroleum)',
        count: 358,
        pct: 18.1,
        exposure: '₹9.84 Lakh Cr',
        riskTier: 'Moderate Risk',
        riskColor: 'text-amber-600 bg-amber-50 border-amber-200',
        barColor: '#f97316'
      },
      {
        rank: 3,
        name: 'Water & Sanitation',
        count: 246,
        pct: 12.4,
        exposure: '₹6.15 Lakh Cr',
        riskTier: 'High Risk Conc.',
        riskColor: 'text-orange-600 bg-orange-50 border-orange-200',
        barColor: '#10b981'
      },
      {
        rank: 4,
        name: 'Social Infrastructure',
        count: 204,
        pct: 10.3,
        exposure: '₹4.32 Lakh Cr',
        riskTier: 'Low Risk',
        riskColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        barColor: '#ec4899'
      },
      {
        rank: 5,
        name: 'Telecommunications & IT',
        count: 155,
        pct: 7.8,
        exposure: '₹3.18 Lakh Cr',
        riskTier: 'Moderate Risk',
        riskColor: 'text-amber-600 bg-amber-50 border-amber-200',
        barColor: '#8b5cf6'
      },
      {
        rank: 6,
        name: 'Other Infrastructure Sectors',
        count: 454,
        pct: 22.9,
        exposure: '₹5.01 Lakh Cr',
        riskTier: 'Low Risk',
        riskColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        barColor: '#94a3b8'
      },
    ];
  }, []);

  // National Project Risk Overview breakdown data
  const nationalRiskTiers = [
    {
      level: 'Low',
      scoreRange: '0–39',
      count: 422,
      pct: '21.3%',
      valueExposed: '₹8.92 Lakh Cr',
      barPct: 21.3,
      color: '#10b981',
      bgClass: 'hover:bg-emerald-50/40 hover:border-emerald-300',
      borderClass: 'border-l-emerald-500',
      tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      filterVal: 'Low'
    },
    {
      level: 'Moderate',
      scoreRange: '40–69',
      count: 767,
      pct: '38.7%',
      valueExposed: '₹16.55 Lakh Cr',
      barPct: 38.7,
      color: '#eab308',
      bgClass: 'hover:bg-amber-50/40 hover:border-amber-300',
      borderClass: 'border-l-amber-500',
      tagClass: 'bg-amber-50 text-amber-700 border-amber-200',
      filterVal: 'Moderate'
    },
    {
      level: 'High',
      scoreRange: '70–84',
      count: 480,
      pct: '24.2%',
      valueExposed: '₹10.35 Lakh Cr',
      barPct: 24.2,
      color: '#f97316',
      bgClass: 'hover:bg-orange-50/40 hover:border-orange-300',
      borderClass: 'border-l-orange-500',
      tagClass: 'bg-orange-50 text-orange-700 border-orange-200',
      filterVal: 'High'
    },
    {
      level: 'Very High',
      scoreRange: '85–100',
      count: 312,
      pct: '15.8%',
      valueExposed: '₹6.96 Lakh Cr',
      barPct: 15.8,
      color: '#ef4444',
      bgClass: 'hover:bg-red-50/40 hover:border-red-300',
      borderClass: 'border-l-red-500',
      tagClass: 'bg-red-50 text-red-700 border-red-200',
      filterVal: 'High Risk'
    },
  ];

  return (
    <PageContainer breadcrumb="EXECUTIVE NATIONAL COMMAND OVERVIEW">
      {/* Toast Notification for Export */}
      {exportNotification && (
        <div className="fixed top-18 right-8 z-50 bg-[#0b172a] text-white px-4 py-2.5 rounded-xl shadow-xl border border-blue-500/40 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXECUTIVE HEADER                                                          */}
      {/* ========================================================================= */}
      <div className="command-panel p-5 bg-gradient-to-r from-white via-slate-50 to-blue-50/30 border border-slate-200/90 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
              National Command Matrix
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Central Sector Projects (≥ ₹150 Cr)
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight font-heading mt-1">
            National Infrastructure Intelligence
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            AI-powered monitoring of Central Sector Infrastructure Projects across 22 Line Ministries
          </p>
        </div>

        {/* Right Side Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Data as of April 2026 */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Data as of: <strong className="text-slate-900">April 2026</strong></span>
          </div>

          {/* Refresh/Status Indicator */}
          <button
            onClick={handleRefresh}
            title="Refresh OCMS Ingestion Pipeline"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync</span>
            <RefreshCw className={`w-3 h-3 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Report */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-300" />
            <span>Export Report</span>
          </button>

          {/* Command/Search Button */}
          <button
            onClick={handleOpenCommand}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[#0d52ce] text-xs font-bold transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-blue-300 shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 — EXECUTIVE KPIs STRIP                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Projects */}
        <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#0d52ce] transition">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Total Projects
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-[#0d52ce] border border-blue-100">
                22 Sectors
              </span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl lg:text-3xl font-black text-slate-900 font-heading tabular-nums">
                {DASHBOARD_STATS.totalProjects}
              </span>
              <span className="text-xs text-slate-400 font-medium">Projects</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+2.4% vs Mar 2026</span>
            </div>
            {/* Sparkline Visual */}
            <svg className="w-16 h-5 text-emerald-500" viewBox="0 0 64 20" fill="none">
              <path d="M2 18 L16 14 L30 15 L44 9 L62 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 2: Original Cost */}
        <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 transition">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Original Cost
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                CCEA Base
              </span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl lg:text-3xl font-black text-slate-900 font-heading tabular-nums">
                {DASHBOARD_STATS.originalCost}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Sanctioned Baseline
            </span>
            {/* Sparkline Visual */}
            <svg className="w-16 h-5 text-slate-400" viewBox="0 0 64 20" fill="none">
              <path d="M2 12 L20 12 L35 12 L50 12 L62 12" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </div>
        </div>

        {/* KPI 3: Revised Cost */}
        <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-orange-300 transition">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Revised Cost
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-orange-50 text-orange-700 border border-orange-200">
                +15.2% Growth
              </span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl lg:text-3xl font-black text-orange-600 font-heading tabular-nums">
                {DASHBOARD_STATS.revisedCost}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700 font-mono">
              +₹5.65L Cr Variance
            </span>
            {/* Sparkline Visual */}
            <svg className="w-16 h-5 text-orange-500" viewBox="0 0 64 20" fill="none">
              <path d="M2 16 L18 14 L32 11 L46 7 L62 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 4: Cumulative Expenditure */}
        <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 transition">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Cumulative Expenditure
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-[#0d52ce] border border-blue-100">
                47.6% Deployed
              </span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl lg:text-3xl font-black text-slate-900 font-heading tabular-nums">
                {DASHBOARD_STATS.cumulativeExpenditure}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Absorbed of Revised Cost
            </span>
            {/* Sparkline Visual */}
            <svg className="w-16 h-5 text-[#0d52ce]" viewBox="0 0 64 20" fill="none">
              <path d="M2 17 L16 15 L32 12 L48 8 L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 5: High Risk Projects (Prominent without making whole dashboard red) */}
        <div className="command-panel p-4 bg-white border-2 border-red-200/90 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-red-400 hover:shadow-sm transition">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                  High Risk Projects
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                Critical
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl lg:text-3xl font-black text-red-600 font-heading tabular-nums">
                {DASHBOARD_STATS.highRiskProjects}
              </span>
              <span className="text-xs text-red-500 font-bold">Projects</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-red-100 flex items-center justify-between">
            <span className="text-xs font-bold text-red-700">
              15.8% of Monitored Portfolio
            </span>
            {/* Sparkline Visual */}
            <svg className="w-16 h-5 text-red-600" viewBox="0 0 64 20" fill="none">
              <path d="M2 18 L16 16 L32 10 L48 8 L62 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 — NATIONAL PROJECT RISK OVERVIEW                                */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Macro Risk Spectrum
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• 1,981 Central Projects</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-1">
              National Project Risk Overview
            </h2>
            <p className="text-xs text-slate-500">
              Distribution of infrastructure portfolio across machine learning risk classifications. Click any tier to filter project records.
            </p>
          </div>

          <button
            onClick={() => navigate('/projects')}
            className="flex items-center space-x-1 text-xs font-bold text-[#0d52ce] hover:underline shrink-0"
          >
            <span>Open Projects Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sophisticated Segmented Distribution Bar */}
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded-lg overflow-hidden flex shadow-inner bg-slate-100 border border-slate-200/80">
            {nationalRiskTiers.map((tier) => (
              <div
                key={tier.level}
                onClick={() => navigate(`/projects?status=${encodeURIComponent(tier.filterVal)}`)}
                style={{ width: `${tier.barPct}%`, backgroundColor: tier.color }}
                className="h-full cursor-pointer hover:opacity-90 transition relative group"
                title={`${tier.level} Risk: ${tier.count} Projects (${tier.pct}) - Value: ${tier.valueExposed}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-0.5">
            <span>Low Risk (0–39)</span>
            <span>Moderate Risk (40–69)</span>
            <span>High Risk (70–84)</span>
            <span>Very High Risk (85–100)</span>
          </div>
        </div>

        {/* 4 Interactive Risk Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {nationalRiskTiers.map((tier) => (
            <div
              key={tier.level}
              onClick={() => navigate(`/projects?status=${encodeURIComponent(tier.filterVal)}`)}
              className={`p-4 rounded-xl border border-slate-200/90 bg-slate-50/70 border-l-4 ${tier.borderClass} ${tier.bgClass} cursor-pointer transition flex flex-col justify-between group`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${tier.tagClass}`}>
                    {tier.level}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200/80 shrink-0">
                    Score {tier.scoreRange}
                  </span>
                </div>

                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 font-heading tabular-nums group-hover:text-[#0d52ce] transition">
                    {tier.count}
                  </span>
                  <span className="text-xs font-extrabold font-mono text-slate-600">
                    {tier.pct}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Value Exposed:</span>
                <span className="font-bold text-slate-900 font-heading tabular-nums">
                  {tier.valueExposed}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5 & 6 — TREND INTELLIGENCE & AI-DETECTED SIGNALS (2-COLUMN GRID)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SECTION 5: Cost & Schedule Risk Trend Chart (8 cols) */}
        <div className="lg:col-span-8 command-panel p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Econometric Progression
                </span>
                <span className="text-[10px] text-slate-400 font-mono">• Machine Learning Time-Series</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading mt-0.5">
                Cost & Schedule Risk Trend
              </h2>
              <p className="text-xs text-slate-500">
                Trailing trajectory of portfolio cost overrun % and schedule delay % against Cabinet benchmark
              </p>
            </div>

            {/* Selectable Horizon Buttons (3M / 6M / 12M) */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              {(['3M', '6M', '12M'] as const).map((horizon) => (
                <button
                  key={horizon}
                  onClick={() => setTimeHorizon(horizon)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    timeHorizon === horizon
                      ? 'bg-white text-[#0d52ce] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {horizon}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Timeline Graph */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                  domain={[0, 30]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 bg-[#0b172a] text-white rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[190px]">
                          <p className="font-extrabold text-slate-300 uppercase tracking-wider text-[10px]">
                            {label} Trajectory
                          </p>
                          <div className="flex items-center justify-between text-blue-300 font-bold">
                            <span>Cost Overrun:</span>
                            <span className="font-mono">+{payload[0]?.value}%</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-300 font-bold">
                            <span>Schedule Delay:</span>
                            <span className="font-mono">+{payload[1]?.value}%</span>
                          </div>
                          <div className="flex items-center justify-between text-red-400 font-mono text-[10px] pt-1 border-t border-slate-700">
                            <span>Risk Threshold:</span>
                            <span>15.0% Max</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={15}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Cabinet Risk Threshold (15%)',
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'insideTopRight'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="costOverrun"
                  name="Cost Overrun %"
                  stroke="#0d52ce"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#0d52ce', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="timeOverrun"
                  name="Time Overrun %"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend & Contextual Note */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-4 font-semibold text-slate-700">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-1 bg-[#0d52ce] rounded" />
                <span>Cost Overrun %</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-1 bg-[#f59e0b] rounded" />
                <span>Time Overrun %</span>
              </div>
              <div className="flex items-center space-x-1.5 text-red-600">
                <span className="w-3 h-0.5 border-b border-dashed border-red-500" />
                <span>Threshold (15%)</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Source: OCMS Monthly Statistical Return • 96.4% Reporting Validated
            </span>
          </div>
        </div>

        {/* SECTION 6: AI-Detected Signals Panel (4 cols) */}
        <div className="lg:col-span-4 command-panel p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Early Warning Engine
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• SHAP Attribution</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading mt-0.5">
              AI-Detected Signals
            </h2>
            <p className="text-xs text-slate-500">
              Statistical anomalies & predictive early warnings synthesized by PAIMANA Core
            </p>
          </div>

          {/* Signal 1: Critical Cost Overrun Alert */}
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/90 border-l-4 border-l-red-600 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-red-700 font-extrabold text-[11px] uppercase tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Critical Risk Signal</span>
              </div>
              <span className="text-[10px] font-mono text-red-600 font-bold">312 Projects</span>
            </div>

            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              312 projects show very-high cost-overrun risk due to compounded land handover disputes and delayed sub-structure milestones.
            </p>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Potential Exposure:</span>
                <span className="font-extrabold text-red-700 font-heading">₹2.41 Lakh Cr</span>
              </div>

              <button
                onClick={() => navigate('/projects?status=High%20Risk')}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
              >
                Investigate →
              </button>
            </div>
          </div>

          {/* Signal 2: Transport Sector Schedule Slippage */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/90 border-l-4 border-l-[#0d52ce] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[#0d52ce] font-extrabold text-[11px] uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-[#0d52ce]" />
                <span>Schedule Slippage</span>
              </div>
              <span className="text-[10px] font-mono text-[#0d52ce] font-bold">Transport Sector</span>
            </div>

            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              Transport & Logistics exhibits the highest schedule slippage (+8.7 months average delay), primarily driven by underground utility shifts.
            </p>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Impacted Value:</span>
                <span className="font-extrabold text-[#0d52ce] font-heading">₹1.18 Lakh Cr</span>
              </div>

              <button
                onClick={() => navigate('/scenarios?project_id=101')}
                className="px-2.5 py-1 rounded-lg bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
              >
                Simulate →
              </button>
            </div>
          </div>

          {/* Signal 3: Interventions Opportunity */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/90 border-l-4 border-l-emerald-600 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Early Mitigation Window</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">Next 90 Days</span>
            </div>

            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              Early ministerial intervention in right-of-way dispute arbitration can prevent up to ₹1.18 Lakh Cr in contractor claims.
            </p>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Projected Savings:</span>
                <span className="font-extrabold text-emerald-700 font-heading">Up to ₹1.18L Cr</span>
              </div>

              <button
                onClick={() => navigate('/interventions')}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
              >
                Review Actions →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3 — SECTOR INTELLIGENCE                                           */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Sectoral Allocation
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• 22 Central Line Ministries</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-1">
              Sector Intelligence & Capital Exposure
            </h2>
            <p className="text-xs text-slate-500">
              Ranked horizontal analysis of project distribution, capital exposure, and risk concentration across core domains.
            </p>
          </div>

          <button
            onClick={() => navigate('/benchmarks')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shrink-0 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Cross-Sector Benchmarks</span>
          </button>
        </div>

        {/* Ranked Sector Horizontal Bars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Ranked Horizontal Bars (8 cols) */}
          <div className="lg:col-span-8 space-y-3.5">
            {sectorData.map((sec) => (
              <div
                key={sec.name}
                onClick={() => navigate(`/projects?sector=${encodeURIComponent(sec.name)}`)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  sec.rank <= 3
                    ? 'bg-slate-50/80 border-slate-300/80 hover:border-[#0d52ce] hover:bg-blue-50/20'
                    : 'bg-white border-slate-200/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] ${
                      sec.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      sec.rank === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                      sec.rank === 3 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      #{sec.rank}
                    </span>
                    <span className="font-bold text-slate-900 font-heading">
                      {sec.name}
                    </span>
                    {sec.rank <= 3 && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-100 text-[#0d52ce]">
                        Top 3 Monitored
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sec.riskColor}`}>
                      {sec.riskTier}
                    </span>
                    <span className="font-extrabold text-slate-900 font-heading tabular-nums">
                      {sec.exposure}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex items-center">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${sec.pct * 2.8}%`, backgroundColor: sec.barColor }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>{sec.count} Projects</span>
                  <span>{sec.pct}% of total projects</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Embedded Distribution Chart & Top 3 Summary (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Portfolio Distribution
              </span>
              <h3 className="text-sm font-bold text-slate-900 font-heading mt-0.5">
                Top 3 Sectors Hold 59.0% of Capital
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Transport & Logistics, Energy, and Water & Sanitation represent ₹30.27 Lakh Cr of the monitored capital baseline.
              </p>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SECTOR_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {SECTOR_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 bg-[#0b172a] text-white rounded-xl shadow-lg text-xs space-y-1 border border-slate-700">
                            <p className="font-bold text-slate-200">{data.name}</p>
                            <p className="text-blue-300 font-mono">{data.count} Projects ({data.pct})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-200/80 text-center">
              <button
                onClick={() => navigate('/projects')}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#0d52ce] transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <span>Filter Projects by Sector</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4 — HIGH-RISK PROJECTS (PRIORITY INTERVENTION QUEUE)              */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Cabinet Escalation
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• Score ≥ 80 / 100</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-1">
              Priority Intervention Queue
            </h2>
            <p className="text-xs text-slate-500">
              Mega infrastructure projects exhibiting severe cost variance and timeline slippage requiring inter-ministerial resolution.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => navigate('/interventions')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Interventions Action Center</span>
            </button>
            <button
              onClick={() => navigate('/projects?status=High%20Risk')}
              className="flex items-center space-x-1 text-xs font-bold text-[#0d52ce] hover:underline"
            >
              <span>View All 312 High Risk →</span>
            </button>
          </div>
        </div>

        {/* Compact Table Rows */}
        <div className="border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
          <table className="table-fixed w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3 w-[20%]">Project & Code</th>
                <th className="p-3 w-[18%]">Ministry & Sector</th>
                <th className="p-3 w-[11%]">Risk Score</th>
                <th className="p-3 w-[11%]">Cost Overrun</th>
                <th className="p-3 w-[11%]">Schedule Delay</th>
                <th className="p-3 w-[15%]">Current Early Warning</th>
                <th className="p-3 pr-4 text-right w-[14%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {MOCK_PROJECTS.slice(0, 5).map((project) => (
                <tr
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="hover:bg-blue-50/40 cursor-pointer transition"
                >
                  {/* Project Name & Code */}
                  <td className="p-3">
                    <p className="font-bold text-slate-900 group-hover:text-[#0d52ce] transition">
                      {project.name}
                    </p>
                    <span className="text-[10px] font-mono text-[#0d52ce] font-bold">
                      {project.code}
                    </span>
                  </td>

                  {/* Ministry & Sector */}
                  <td className="p-3 font-medium text-slate-700">
                    <p className="truncate max-w-[150px]">{project.ministry}</p>
                    <span className="text-[10px] text-slate-400 font-normal">{project.sector}</span>
                  </td>

                  {/* Risk Score */}
                  <td className="p-3">
                    <RiskBadge score={project.overallRiskScore} size="sm" />
                  </td>

                  {/* Cost Overrun */}
                  <td className="p-3 font-bold font-mono">
                    <span className={project.costOverrunPct >= 18 ? 'text-red-600' : 'text-orange-600'}>
                      +{project.costOverrunPct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      ₹{project.revisedBudgetCr.toLocaleString('en-IN')} Cr
                    </span>
                  </td>

                  {/* Schedule Delay */}
                  <td className="p-3 font-bold font-mono text-slate-800">
                    +{project.scheduleDelayDays} Days
                    <span className="text-[10px] text-slate-400 block font-normal font-sans">
                      Target: {project.forecastCompletionDate}
                    </span>
                  </td>

                  {/* Current Warning */}
                  <td className="p-3">
                    <div className="flex items-center space-x-1.5 text-slate-700 max-w-[180px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="text-[11px] truncate font-medium">
                        {project.topRiskDrivers[0]?.driver || 'Sub-structure alignment constraint'}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-3 pr-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-[11px] font-bold shadow-2xs transition whitespace-nowrap cursor-pointer"
                    >
                      <span>View Intelligence</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 7 — NATIONAL STATUS STRIP                                         */}
      {/* ========================================================================= */}
      <div className="command-panel p-4 bg-gradient-to-r from-slate-900 via-[#0b172a] to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/80">
            Data Coverage
          </span>
          <span className="font-semibold text-white">22 Sectors</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-white">17 Line Ministries</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-white">1,981 Projects Monitored</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-emerald-400 font-bold">₹42.78 Lakh Cr Revised Cost</span>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 text-[11px] shrink-0">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>OCMS Return Rate: <strong className="text-white">96.4%</strong></span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono">Last updated: <strong className="text-slate-200">April 2026</strong></span>
        </div>
      </div>
    </PageContainer>
  );
};
