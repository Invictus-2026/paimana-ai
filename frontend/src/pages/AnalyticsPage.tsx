import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  Activity,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

interface AnalyticsPageProps {
  defaultSubTab?: 'benchmarks' | 'cost-overrun' | 'time-overrun';
}

const MONTH_OPTIONS = [
  { value: '2026-07', label: "Jul '26 (1,775 projects)" },
  { value: '2026-06', label: "Jun '26 (1,847 projects)" },
  { value: '2026-05', label: "May '26 (1,987 projects)" },
  { value: '2026-04', label: "Apr '26 (1,981 projects)" },
  { value: '2026-03', label: "Mar '26 (1,941 projects)" },
  { value: '2026-02', label: "Feb '26 (1,948 projects)" },
  { value: '2026-01', label: "Jan '26 (1,702 projects)" },
  { value: '2025-12', label: "Dec '25 (1,392 projects)" },
  { value: '2025-11', label: "Nov '25 (823 projects)" },
  { value: '2025-10', label: "Oct '25 (820 projects)" },
  { value: '2025-09', label: "Sep '25 (794 projects)" },
  { value: '2025-08', label: "Aug '25 (800 projects)" },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ defaultSubTab }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active sub-tab from path or prop
  const currentSubTab: 'benchmarks' | 'cost-overrun' | 'time-overrun' = useMemo(() => {
    if (location.pathname.includes('/cost-overrun')) return 'cost-overrun';
    if (location.pathname.includes('/time-overrun')) return 'time-overrun';
    return defaultSubTab || 'benchmarks';
  }, [location.pathname, defaultSubTab]);

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [loading, setLoading] = useState<boolean>(true);

  // Benchmarks State
  const [overview, setOverview] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [ministries, setMinistries] = useState<any>(null);
  const [geography, setGeography] = useState<any>(null);
  const [benchmarkDimension, setBenchmarkDimension] = useState<'sector' | 'ministry' | 'geographic_region'>('sector');

  // Predictions State
  const [costData, setCostData] = useState<any>(null);
  const [timeData, setTimeData] = useState<any>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('ALL');
  const [selectedDelaySeverity, setSelectedDelaySeverity] = useState<string>('ALL');
  const [costSortBy, setCostSortBy] = useState<string>('cost_overrun_pct');
  const [timeSortBy, setTimeSortBy] = useState<string>('predicted_delay_days');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  // Fetch data on tab or month change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentSubTab === 'benchmarks') {
          const [overviewData, benchmarkData, ministryData, geographyData] = await Promise.all([
            api.getAnalyticsOverview(),
            api.getBenchmarks(benchmarkDimension),
            api.getMinistryAnalytics(),
            api.getGeographyAnalytics()
          ]);
          setOverview(overviewData?.data);
          setBenchmarks(benchmarkData?.data);
          setMinistries(ministryData?.data);
          setGeography(geographyData?.data);
        } else if (currentSubTab === 'cost-overrun') {
          const res = await api.getCostOverrunPredictions({
            month: selectedMonth,
            sector: selectedSector !== 'ALL' ? selectedSector : undefined,
            risk_level: selectedRiskTier !== 'ALL' ? selectedRiskTier : undefined,
            search: searchQuery || undefined,
            sort_by: costSortBy,
            order: sortOrder,
            limit: 2000,
            offset: 0
          });
          setCostData(res?.data);
        } else if (currentSubTab === 'time-overrun') {
          const res = await api.getTimeOverrunPredictions({
            month: selectedMonth,
            sector: selectedSector !== 'ALL' ? selectedSector : undefined,
            delay_severity: selectedDelaySeverity !== 'ALL' ? selectedDelaySeverity : undefined,
            search: searchQuery || undefined,
            sort_by: timeSortBy,
            order: sortOrder,
            limit: 2000,
            offset: 0
          });
          setTimeData(res?.data);
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentSubTab, selectedMonth, benchmarkDimension, selectedSector, selectedRiskTier, selectedDelaySeverity, costSortBy, timeSortBy, sortOrder, searchQuery]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSector, selectedRiskTier, selectedDelaySeverity, selectedMonth, currentSubTab]);

  const handleSubTabChange = (tab: 'benchmarks' | 'cost-overrun' | 'time-overrun') => {
    if (tab === 'benchmarks') navigate('/analytics');
    else if (tab === 'cost-overrun') navigate('/analytics/cost-overrun');
    else if (tab === 'time-overrun') navigate('/analytics/time-overrun');
  };

  // Helper for rendering risk badges
  const renderRiskBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Critical</span>;
      case 'high':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">High</span>;
      case 'moderate':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Moderate</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Low</span>;
    }
  };

  // Helper for rendering delay severity badges
  const renderDelayBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe delay':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Severe Delay (&gt;1 yr)</span>;
      case 'significant delay':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Significant (6-12 mo)</span>;
      case 'minor delay':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Minor (2-6 mo)</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">On-Track</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14 font-sans">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">
              Portfolio Analytics & Predictive Intelligence
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              v2.0 Model
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Multi-dimensional risk scoring, cost overrun predictions & schedule delay forecasting across all monitored MoSPI datasets
          </p>
        </div>

        {/* Global Month Selector */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center gap-2 text-slate-600 pl-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dataset Month:</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Sub-Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-1.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubTabChange('benchmarks')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              currentSubTab === 'benchmarks'
                ? 'bg-[#0d52ce] text-white shadow-md shadow-[#0d52ce]/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Macro Trends & Benchmarks</span>
          </button>

          <button
            onClick={() => handleSubTabChange('cost-overrun')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              currentSubTab === 'cost-overrun'
                ? 'bg-[#0d52ce] text-white shadow-md shadow-[#0d52ce]/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Cost Overrun Prediction</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold uppercase">
              All Projects
            </span>
          </button>

          <button
            onClick={() => handleSubTabChange('time-overrun')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              currentSubTab === 'time-overrun'
                ? 'bg-[#0d52ce] text-white shadow-md shadow-[#0d52ce]/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Time Overrun Prediction</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-extrabold uppercase">
              Schedule Risk
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pr-3 font-medium">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Scored with Hybrid Multi-Dimensional Engine</span>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[55vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-slate-500 font-semibold text-sm">Computing predictive risk vectors for {selectedMonth}...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* SUB-VIEW 1: COST OVERRUN PREDICTIONS                                     */}
          {/* ========================================================================= */}
          {currentSubTab === 'cost-overrun' && (
            <div className="space-y-6">
              {/* Cost Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Monitored Projects</p>
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {costData?.summary?.total_projects?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">In selected month ({selectedMonth})</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-rose-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Cost Overrun Exposure</p>
                    <IndianRupee className="h-5 w-5 text-rose-500" />
                  </div>
                  <p className="text-2xl font-black text-rose-600 mt-2">
                    ₹{((costData?.summary?.total_cost_exposure_cr || 0) / 1000).toFixed(1)}k Cr
                  </p>
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    Exchequer capital escalation
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-amber-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects With Overrun</p>
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {costData?.summary?.projects_with_overrun?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    {costData?.summary?.overrun_percentage_of_portfolio || 0}% of portfolio
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-red-600">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Cost Risk Tier</p>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-black text-red-600 mt-2">
                    {costData?.summary?.critical_risk_count?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Requiring proactive intervention</p>
                </div>
              </div>

              {/* Sector Cost Overrun Exposure Visual Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Sector Cost Overrun Exposure (₹ Cr)</h3>
                    <span className="text-xs font-medium text-slate-500">Top sectors by capital growth</span>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costData?.sector_exposure_breakdown || []} margin={{ top: 10, right: 20, left: 10, bottom: 45 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="sector" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip
                          formatter={(value: any) => [`₹${Number(value).toLocaleString()} Cr`, 'Exposure']}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="total_exposure_cr" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Top Overrun Impact Projects</h3>
                    <span className="text-xs font-medium text-slate-500">Highest individual escalations</span>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={costData?.projects?.slice(0, 6).map((p: any) => ({
                          name: p.name.length > 25 ? p.name.slice(0, 25) + '...' : p.name,
                          exposure: p.cost_overrun_exposure_cr,
                          overrun_pct: p.cost_overrun_pct
                        })) || []}
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                        <RechartsTooltip
                          formatter={(value: any, name: string) => [
                            name === 'exposure' ? `₹${Number(value).toLocaleString()} Cr` : `${value}%`,
                            name === 'exposure' ? 'Cost Exposure' : 'Overrun %'
                          ]}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="exposure" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search project name, ID, or sector..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                      value={selectedRiskTier}
                      onChange={(e) => setSelectedRiskTier(e.target.value)}
                      className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="ALL">All Risk Tiers</option>
                      <option value="Critical">Critical Risk (&ge;75)</option>
                      <option value="High">High Risk (50-74)</option>
                      <option value="Moderate">Moderate Risk (25-49)</option>
                      <option value="Low">Low Risk (&lt;25)</option>
                    </select>

                    <select
                      value={costSortBy}
                      onChange={(e) => setCostSortBy(e.target.value)}
                      className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="cost_overrun_pct">Sort by: Cost Overrun %</option>
                      <option value="cost_overrun_exposure_cr">Sort by: Exposure (₹ Cr)</option>
                      <option value="budget_cr">Sort by: Original Budget</option>
                      <option value="overall_risk_score">Sort by: Risk Score</option>
                    </select>

                    <button
                      onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                      title="Toggle Sort Order"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comprehensive Cost Overrun Projects Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">
                    Project-by-Project Cost Overrun Predictions ({costData?.projects?.length || 0} Total)
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, costData?.projects?.length || 0)} - {Math.min(currentPage * pageSize, costData?.projects?.length || 0)} of {costData?.projects?.length || 0}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Project Details</th>
                        <th className="py-3 px-3">Sector & Ministry</th>
                        <th className="py-3 px-3 text-right">Original (₹ Cr)</th>
                        <th className="py-3 px-3 text-right">Revised (₹ Cr)</th>
                        <th className="py-3 px-3 text-right">Expenditure (₹ Cr)</th>
                        <th className="py-3 px-3 text-right">Predicted Overrun</th>
                        <th className="py-3 px-3 text-right">Exposure (₹ Cr)</th>
                        <th className="py-3 px-3 text-center">Risk Tier</th>
                        <th className="py-3 px-3 text-center">Risk Score</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(costData?.projects || [])
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((proj: any, idx: number) => {
                          const hasOverrun = proj.cost_overrun_pct > 0;
                          return (
                            <tr key={proj.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[280px]">
                                <div className="truncate font-bold text-slate-800" title={proj.name}>
                                  {proj.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-normal">
                                  ID: {proj.external_project_id || proj.id}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 max-w-[180px]">
                                <div className="truncate text-slate-700 font-medium" title={proj.sector}>
                                  {proj.sector}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate" title={proj.ministry}>
                                  {proj.ministry}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                                ₹{proj.budget_cr?.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
                                ₹{proj.revised_cost_cr?.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-3 text-right font-medium text-slate-600">
                                <div>₹{proj.cumulative_expenditure_cr?.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-400">
                                  {proj.expenditure_ratio_pct}% spent
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <span className={`font-black ${hasOverrun ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {hasOverrun ? `+${proj.cost_overrun_pct.toFixed(1)}%` : '0.0%'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                                {hasOverrun ? (
                                  <span className="text-rose-700 font-bold">₹{proj.cost_overrun_exposure_cr.toLocaleString()}</span>
                                ) : (
                                  <span className="text-slate-400 font-normal">-</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                {renderRiskBadge(proj.risk_level)}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-extrabold text-slate-800">
                                    {(proj.overall_risk_score * 100).toFixed(0)}
                                  </span>
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        proj.overall_risk_score >= 0.75
                                          ? 'bg-rose-500'
                                          : proj.overall_risk_score >= 0.50
                                          ? 'bg-orange-500'
                                          : proj.overall_risk_score >= 0.25
                                          ? 'bg-amber-500'
                                          : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${Math.min(100, proj.overall_risk_score * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <Link
                                  to={`/projects/${proj.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-[#0d52ce] hover:text-white transition-colors"
                                >
                                  <span>View</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Page {currentPage} of {Math.ceil((costData?.projects?.length || 1) / pageSize)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil((costData?.projects?.length || 1) / pageSize), p + 1))}
                      disabled={currentPage >= Math.ceil((costData?.projects?.length || 1) / pageSize)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 2: TIME / SCHEDULE OVERRUN PREDICTIONS                           */}
          {/* ========================================================================= */}
          {currentSubTab === 'time-overrun' && (
            <div className="space-y-6">
              {/* Time Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Schedule Delay</p>
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {timeData?.summary?.average_delay_months || 0} Mo
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ~{timeData?.summary?.average_delay_days || 0} days per project
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-rose-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severe Delay (&gt;1 Year)</p>
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
                  <p className="text-2xl font-black text-rose-600 mt-2">
                    {timeData?.summary?.severe_delay_count?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    Critical commissioning hazard
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-amber-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Significant Delay (6-12 Mo)</p>
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-amber-600 mt-2">
                    {timeData?.summary?.significant_delay_count?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-amber-600 font-semibold mt-1">Moderate slippage threshold</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-Track Ratio</p>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600 mt-2">
                    {timeData?.summary?.on_track_count?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {timeData?.summary?.total_projects ? ((timeData.summary.on_track_count / timeData.summary.total_projects) * 100).toFixed(1) : 0}% adhering to schedule
                  </p>
                </div>
              </div>

              {/* Sector Delay Visual Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Average Delay by Sector (Months)</h3>
                    <span className="text-xs font-medium text-slate-500">Structural sector delay rankings</span>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeData?.sector_delay_breakdown || []} margin={{ top: 10, right: 20, left: 10, bottom: 45 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="sector" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip
                          formatter={(value: any) => [`${value} Months`, 'Avg Delay']}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="avg_delay_months" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Schedule Slippage Breakdown</h3>
                    <span className="text-xs font-medium text-slate-500">Distribution across portfolio</span>
                  </div>
                  <div className="h-[280px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Severe (>12 Mo)', value: timeData?.summary?.severe_delay_count || 0, color: '#ef4444' },
                            { name: 'Significant (6-12 Mo)', value: timeData?.summary?.significant_delay_count || 0, color: '#f97316' },
                            { name: 'Minor (2-6 Mo)', value: timeData?.summary?.minor_delay_count || 0, color: '#3b82f6' },
                            { name: 'On-Track (<2 Mo)', value: timeData?.summary?.on_track_count || 0, color: '#10b981' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {[
                            { color: '#ef4444' },
                            { color: '#f97316' },
                            { color: '#3b82f6' },
                            { color: '#10b981' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: any) => [value, 'Projects']}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search project name, ID, or sector..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                      value={selectedDelaySeverity}
                      onChange={(e) => setSelectedDelaySeverity(e.target.value)}
                      className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="ALL">All Delay Severities</option>
                      <option value="Severe Delay">Severe Delay (&gt;1 yr)</option>
                      <option value="Significant Delay">Significant Delay (6-12 mo)</option>
                      <option value="Minor Delay">Minor Delay (2-6 mo)</option>
                      <option value="On-Track">On-Track (&lt;2 mo)</option>
                    </select>

                    <select
                      value={timeSortBy}
                      onChange={(e) => setTimeSortBy(e.target.value)}
                      className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="predicted_delay_days">Sort by: Delay Duration</option>
                      <option value="delay_risk_score">Sort by: Delay Risk Score</option>
                      <option value="overall_risk_score">Sort by: Overall Risk Score</option>
                      <option value="budget_cr">Sort by: Original Budget</option>
                    </select>

                    <button
                      onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                      title="Toggle Sort Order"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comprehensive Time Overrun Projects Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">
                    Project-by-Project Schedule & Delay Predictions ({timeData?.projects?.length || 0} Total)
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, timeData?.projects?.length || 0)} - {Math.min(currentPage * pageSize, timeData?.projects?.length || 0)} of {timeData?.projects?.length || 0}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Project Details</th>
                        <th className="py-3 px-3">Sector & Ministry</th>
                        <th className="py-3 px-3 text-right">Sanctioned Budget</th>
                        <th className="py-3 px-3 text-right">Predicted Delay (Days)</th>
                        <th className="py-3 px-3 text-right">Delay (Months)</th>
                        <th className="py-3 px-3 text-center">Delay Classification</th>
                        <th className="py-3 px-3 text-center">Delay Risk</th>
                        <th className="py-3 px-3 text-center">Overall Risk</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(timeData?.projects || [])
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((proj: any, idx: number) => {
                          return (
                            <tr key={proj.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[300px]">
                                <div className="truncate font-bold text-slate-800" title={proj.name}>
                                  {proj.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-normal">
                                  ID: {proj.external_project_id || proj.id}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 max-w-[180px]">
                                <div className="truncate text-slate-700 font-medium" title={proj.sector}>
                                  {proj.sector}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate" title={proj.ministry}>
                                  {proj.ministry}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                                ₹{proj.budget_cr?.toLocaleString()} Cr
                              </td>
                              <td className="py-3.5 px-3 text-right font-black text-slate-900">
                                {proj.predicted_delay_days > 0 ? (
                                  <span>{proj.predicted_delay_days} days</span>
                                ) : (
                                  <span className="text-emerald-600 font-medium">On-Track</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-right font-bold text-amber-600">
                                {proj.predicted_delay_months > 0 ? `${proj.predicted_delay_months} mo` : '0 mo'}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                {renderDelayBadge(proj.delay_severity)}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-extrabold text-slate-800">
                                    {(proj.delay_risk_score * 100).toFixed(0)}
                                  </span>
                                  <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-amber-500 rounded-full"
                                      style={{ width: `${Math.min(100, proj.delay_risk_score * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                {renderRiskBadge(proj.risk_level)}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <Link
                                  to={`/projects/${proj.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-[#0d52ce] hover:text-white transition-colors"
                                >
                                  <span>View</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Page {currentPage} of {Math.ceil((timeData?.projects?.length || 1) / pageSize)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil((timeData?.projects?.length || 1) / pageSize), p + 1))}
                      disabled={currentPage >= Math.ceil((timeData?.projects?.length || 1) / pageSize)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 3: BENCHMARKS & MACRO TRENDS                                     */}
          {/* ========================================================================= */}
          {currentSubTab === 'benchmarks' && (
            <div className="space-y-6">
              {/* KPI Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Projects</p>
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{overview?.total_projects || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-indigo-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Capital Outlay</p>
                    <IndianRupee className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    ₹{((overview?.total_budget_cr || 0) / 1000).toFixed(1)}k Cr
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-amber-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Risk Score</p>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {((overview?.average_risk_score || 0) * 100).toFixed(1)}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-rose-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Overrun Exposure</p>
                    <TrendingUp className="h-5 w-5 text-rose-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    ₹{((overview?.total_cost_overrun_exposure_cr || 0) / 1000).toFixed(1)}k Cr
                  </p>
                </div>
              </div>

              {/* Main Growth / Risk Benchmark Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-bold text-slate-900 font-outfit">Performance Benchmarks</h2>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['sector', 'ministry', 'geographic_region'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setBenchmarkDimension(tab)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                            benchmarkDimension === tab 
                              ? 'bg-white text-slate-900 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          By {tab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {benchmarks?.explanatory_annotations && (
                    <div className="mb-4 text-xs p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-800">
                      <span className="font-bold block mb-0.5">Statistical Transparency:</span>
                      {benchmarks.explanatory_annotations.what_should_not_be_concluded}
                    </div>
                  )}

                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={benchmarks?.benchmark_groups?.slice(0, 10) || []} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any, name: string) => [
                            name === 'avg_cost_growth_pct' ? `${value.toFixed(1)}%` : value, 
                            name === 'avg_cost_growth_pct' ? 'Avg Cost Growth' : 'Avg Risk Score'
                          ]}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="avg_cost_growth_pct" name="Avg Cost Growth (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="avg_risk_score" name="Avg Risk Score" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* State/Geography Distribution Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                  <h2 className="text-base font-bold text-slate-900 font-outfit mb-4">State/Region Concentration</h2>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={geography?.geography?.slice(0, 7) || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="project_count"
                          nameKey="category_name"
                        >
                          {geography?.geography?.slice(0, 7).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => [value, 'Projects']}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {geography?.geography?.slice(0, 5).map((geo: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-slate-600 font-medium truncate max-w-[140px]" title={geo.category_name}>{geo.category_name}</span>
                        </div>
                        <span className="font-bold text-slate-900">{geo.project_count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 font-outfit mb-6">Ministry Risk Profiles</h2>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ministries?.ministries?.slice(0, 8) || []} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="category_name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <RechartsTooltip 
                          formatter={(value: any) => [(Number(value) * 100).toFixed(1), 'Avg Risk Score']}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="average_risk_score" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRisk)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 font-outfit mb-6">Capital Outlay by Sector</h2>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={benchmarks?.benchmark_groups?.slice(0, 8) || []} margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={110} />
                        <RechartsTooltip 
                          formatter={(value: any) => [`₹${(Number(value) / 1000).toFixed(1)}k Cr`, 'Total Budget']}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="total_budget_cr" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AnalyticsPage;
