import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  Activity,
  Clock,
  Search,
  ArrowUpDown,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  MapPin,
  PieChart as PieIcon,
  Maximize2,
  X
} from 'lucide-react';
import { api } from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip
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

const PALETTE = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  emerald: '#10b981',
  teal: '#14b8a6',
  amber: '#f59e0b',
  orange: '#f97316',
  rose: '#f43f5e',
  red: '#ef4444',
  slate: '#64748b',
};

const GEO_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#84cc16'
];

// Helper: Smart category label formatter for X and Y axes
const truncateLabel = (val: string, maxLen = 16): string => {
  if (!val) return '';
  const str = String(val);
  return str.length > maxLen ? `${str.slice(0, maxLen - 1)}…` : str;
};

// Helper: Currency formatter
const formatCurrencyCr = (val: number): string => {
  if (val == null || isNaN(val)) return '₹0 Cr';
  const abs = Math.abs(val);
  if (abs >= 100000) return `₹${(val / 100000).toFixed(1)}L Cr`;
  if (abs >= 1000) return `₹${(val / 1000).toFixed(1)}k Cr`;
  return `₹${Math.round(val).toLocaleString()} Cr`;
};

// Custom Tooltip Component for Recharts
const CustomChartTooltip: React.FC<any> = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/60 text-xs min-w-[200px] z-50">
      <div className="font-bold text-slate-100 border-b border-slate-700/60 pb-1.5 mb-2 leading-tight">
        {label}
      </div>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          let formattedValue = entry.value;
          if (typeof entry.value === 'number') {
            if (entry.name?.toLowerCase().includes('cr') || entry.name?.toLowerCase().includes('budget') || entry.name?.toLowerCase().includes('exposure')) {
              formattedValue = formatCurrencyCr(entry.value);
            } else if (entry.name?.toLowerCase().includes('%') || entry.name?.toLowerCase().includes('growth') || entry.name?.toLowerCase().includes('rate')) {
              formattedValue = `${entry.value.toFixed(1)}%`;
            } else if (entry.name?.toLowerCase().includes('month') || entry.name?.toLowerCase().includes('delay')) {
              formattedValue = `${entry.value} Months`;
            } else if (entry.name?.toLowerCase().includes('risk')) {
              formattedValue = `${Number(entry.value).toFixed(1)} / 100`;
            } else {
              formattedValue = entry.value.toLocaleString();
            }
          }
          return (
            <div key={`tip-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="truncate max-w-[150px]">{entry.name}:</span>
              </span>
              <span className="font-bold text-white text-right shrink-0">
                {formattedValue} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ defaultSubTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  // Determine active sub-tab from path or prop
  const currentSubTab: 'benchmarks' | 'cost-overrun' | 'time-overrun' = useMemo(() => {
    if (location.pathname.includes('/cost-overrun')) return 'cost-overrun';
    if (location.pathname.includes('/time-overrun')) return 'time-overrun';
    return defaultSubTab || 'benchmarks';
  }, [location.pathname, defaultSubTab]);

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [loading, setLoading] = useState<boolean>(true);

  // Fullscreen Modal State
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);

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
  const [selectedSector] = useState<string>('ALL');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('ALL');
  const [selectedDelaySeverity, setSelectedDelaySeverity] = useState<string>('ALL');
  const [costSortBy, setCostSortBy] = useState<string>('cost_overrun_pct');
  const [timeSortBy, setTimeSortBy] = useState<string>('predicted_delay_days');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  // Close fullscreen on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenChart) {
        setFullscreenChart(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenChart]);

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

  // Cost Overrun Severity Distribution for Sub-View 2
  const costDistribution = useMemo(() => {
    if (!costData?.projects) return [];
    let noOverrun = 0;
    let minor = 0;
    let moderate = 0;
    let high = 0;
    let severe = 0;
    for (const p of costData.projects) {
      const pct = p.cost_overrun_pct || 0;
      if (pct <= 0) noOverrun++;
      else if (pct < 10) minor++;
      else if (pct <= 25) moderate++;
      else if (pct <= 50) high++;
      else severe++;
    }
    return [
      { name: 'On-Budget (0%)', value: noOverrun, color: PALETTE.emerald },
      { name: 'Minor (<10%)', value: minor, color: PALETTE.teal },
      { name: 'Moderate (10-25%)', value: moderate, color: PALETTE.amber },
      { name: 'High (25-50%)', value: high, color: PALETTE.orange },
      { name: 'Severe (>50%)', value: severe, color: PALETTE.rose },
    ];
  }, [costData]);

  // Toggle browser fullscreen
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Render Fullscreen Chart Modal Content
  const renderFullscreenModal = () => {
    if (!fullscreenChart) return null;

    let title = "";
    let subtitle = "";
    let chartContent = null;

    if (fullscreenChart === 'benchmarks') {
      title = "Performance Benchmarks: Cost Growth vs Risk Score";
      subtitle = `Descriptive comparative benchmarking by ${benchmarkDimension.replace('_', ' ')}`;
      chartContent = (
        <div className="h-full w-full flex flex-col">
          <div className="flex items-center justify-end gap-6 text-xs font-bold mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#3b82f6]" />
              <span className="text-slate-800">Avg Cost Growth (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#f43f5e]" />
              <span className="text-slate-800">Avg Risk Score (0-100)</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={benchmarks?.benchmark_groups || []}
                margin={{ top: 20, right: 40, left: 10, bottom: 65 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={65}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v}`} />
                <RechartsTooltip content={<CustomChartTooltip />} />
                <Bar yAxisId="left" dataKey="avg_cost_growth_pct" name="Avg Cost Growth (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="avg_risk_score" name="Avg Risk Score" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else if (fullscreenChart === 'regional') {
      title = "Regional & State Infrastructure Concentration";
      subtitle = "Comprehensive breakdown of monitored projects across Indian states and jurisdictions";
      chartContent = (
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="h-[420px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={geography?.geography || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={150}
                  paddingAngle={3}
                  dataKey="project_count"
                  nameKey="category_name"
                >
                  {(geography?.geography || []).map((_: any, index: number) => (
                    <Cell key={`geo-full-${index}`} fill={GEO_COLORS[index % GEO_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomChartTooltip unit="Projects" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">{overview?.total_projects || 0}</span>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Projects</span>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[440px] pr-2 space-y-2">
            {(geography?.geography || []).map((geo: any, idx: number) => {
              const total = overview?.total_projects || 1776;
              const pct = ((geo.project_count / total) * 100).toFixed(1);
              return (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: GEO_COLORS[idx % GEO_COLORS.length] }} />
                    <span className="text-slate-800 font-bold">{geo.category_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium">Budget: {formatCurrencyCr(geo.total_budget_cr)}</span>
                    <span className="font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {geo.project_count} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else if (fullscreenChart === 'ministry') {
      title = "Ministry Risk Profiles & Portfolio Health";
      subtitle = "Multi-dimensional composite risk index across line ministries";
      chartContent = (
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={ministries?.ministries?.map((m: any) => ({
                name: m.category_name,
                shortName: m.category_name,
                risk_score: Number((m.average_risk_score * 100).toFixed(1)),
                projects: m.project_count,
                budget: m.total_budget_cr
              })) || []}
              margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v}`} />
              <YAxis dataKey="shortName" type="category" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }} width={240} />
              <RechartsTooltip content={<CustomChartTooltip unit="/ 100" />} />
              <Bar barSize={24} name="Avg Risk Score" dataKey="risk_score" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (fullscreenChart === 'capital') {
      title = "Capital Outlay Allocation by Sector";
      subtitle = "Total sanctioned expenditure allocation (₹ Cr) across infrastructure domains";
      chartContent = (
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={benchmarks?.benchmark_groups?.map((b: any) => ({
                name: b.category,
                shortName: b.category,
                total_budget_cr: b.total_budget_cr,
                sample_size: b.sample_size
              })) || []}
              margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => formatCurrencyCr(v)} />
              <YAxis dataKey="shortName" type="category" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }} width={220} />
              <RechartsTooltip content={<CustomChartTooltip unit="Cr" />} />
              <Bar barSize={24} name="Total Budget" dataKey="total_budget_cr" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (fullscreenChart === 'cost_sector') {
      title = "Sector-Wise Cost Escalation Exposure";
      subtitle = `Aggregate rupee cost overrun exposure across sectors in ${selectedMonth}`;
      chartContent = (
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={costData?.sector_exposure_breakdown || []}
              margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="sector" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" height={65} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => formatCurrencyCr(v)} />
              <RechartsTooltip content={<CustomChartTooltip unit="Cr" />} />
              <Bar barSize={36} name="Cost Escalation Exposure" dataKey="total_exposure_cr" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (fullscreenChart === 'cost_projects') {
      title = "Top Capital Escalation Mega Projects";
      subtitle = "Individual projects with the highest absolute cost overrun exposure (₹ Cr)";
      chartContent = (
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={costData?.projects?.slice(0, 10).map((p: any) => ({
                name: p.name,
                shortName: p.name,
                exposure: p.cost_overrun_exposure_cr,
                budget: p.budget_cr,
                revised: p.revised_cost_cr,
                overrun_pct: p.cost_overrun_pct
              })) || []}
              margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${Number(v).toLocaleString()} Cr`} />
              <YAxis dataKey="shortName" type="category" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} width={260} />
              <RechartsTooltip content={<CustomChartTooltip unit="Cr" />} />
              <Bar barSize={24} name="Cost Overrun Exposure" dataKey="exposure" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (fullscreenChart === 'time_sector') {
      title = "Sector-Wise Average Schedule Slippage";
      subtitle = `Empirical commissioning delay across infrastructure domains in ${selectedMonth}`;
      chartContent = (
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeData?.sector_delay_breakdown || []}
              margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="sector" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" height={65} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v} Mo`} />
              <RechartsTooltip content={<CustomChartTooltip unit="Months" />} />
              <Bar barSize={36} name="Average Delay" dataKey="avg_delay_months" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (fullscreenChart === 'time_projects') {
      title = "Top Schedule Delay Mega Projects";
      subtitle = "Critical initiatives experiencing highest duration slippage past sanctioned commissioning";
      chartContent = (
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={timeData?.projects?.slice(0, 10).map((p: any) => ({
                name: p.name,
                shortName: p.name,
                delay_months: p.predicted_delay_months,
                delay_days: p.predicted_delay_days,
                budget: p.budget_cr,
                severity: p.delay_severity
              })) || []}
              margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v} Mo`} />
              <YAxis dataKey="shortName" type="category" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} width={260} />
              <RechartsTooltip content={<CustomChartTooltip unit="Months" />} />
              <Bar barSize={24} name="Predicted Delay" dataKey="delay_months" fill="#f97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (fullscreenChart === 'cost_severity') {
      title = "Cost Overrun Severity Distribution";
      subtitle = `Portfolio distribution by cost escalation tier in ${selectedMonth}`;
      const totalCount = costData?.projects?.length || 0;
      chartContent = (
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="h-[450px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={160}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {costDistribution.map((entry, index) => (
                    <Cell key={`full-cost-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomChartTooltip unit="Projects" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">{totalCount}</span>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Projects</span>
            </div>
          </div>
          <div className="space-y-3 pr-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Cost Escalation Breakdown</h4>
            {costDistribution.map((item, idx) => {
              const pct = totalCount ? ((item.value / totalCount) * 100).toFixed(1) : '0';
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">{item.value.toLocaleString()} Projects</span>
                    <span className="text-xs font-bold text-slate-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else if (fullscreenChart === 'time_severity') {
      title = "Schedule Slippage & Delay Severity Distribution";
      subtitle = `Projects categorized by delay severity in ${selectedMonth}`;
      const slippageData = [
        { name: 'Severe (>12 Mo)', value: timeData?.summary?.severe_delay_count || 0, color: '#ef4444' },
        { name: 'Significant (6-12 Mo)', value: timeData?.summary?.significant_delay_count || 0, color: '#f97316' },
        { name: 'Minor (2-6 Mo)', value: timeData?.summary?.minor_delay_count || 0, color: '#3b82f6' },
        { name: 'On-Track (<2 Mo)', value: timeData?.summary?.on_track_count || 0, color: '#10b981' }
      ];
      const totalCount = slippageData.reduce((acc, curr) => acc + curr.value, 0);
      chartContent = (
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="h-[450px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slippageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={160}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {slippageData.map((entry, index) => (
                    <Cell key={`full-time-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomChartTooltip unit="Projects" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">{totalCount}</span>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Monitored</span>
            </div>
          </div>
          <div className="space-y-3 pr-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Schedule Slippage Breakdown</h4>
            {slippageData.map((item, idx) => {
              const pct = totalCount ? ((item.value / totalCount) * 100).toFixed(1) : '0';
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">{item.value.toLocaleString()} Projects</span>
                    <span className="text-xs font-bold text-slate-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in">
        <div
          ref={modalRef}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[1550px] h-[92vh] flex flex-col p-6 sm:p-8 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-outfit">{title}</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBrowserFullscreen}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Toggle Screen Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFullscreenChart(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors"
                title="Close Fullscreen View (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="flex-1 w-full pt-6 pb-2 min-h-0">
            {chartContent}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>PAIMANA PredictIQ Enterprise Visualizer • High-Resolution View</span>
            <span>Press Esc or click Close to return to dashboard</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pb-14 font-sans">
      {/* Fullscreen Overlay */}
      {renderFullscreenModal()}

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
                  <p className="text-xs text-slate-500 mt-1">Snapshot month: {selectedMonth}</p>
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
                    {costData?.summary?.overrun_percentage_of_portfolio || 0}% of portfolio experiencing cost growth
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
                  <p className="text-xs text-slate-500 mt-1">Projects requiring proactive cabinet intervention</p>
                </div>
              </div>

              {/* Visual Charts Grid: 3 Rich Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart 1: Sector Cost Overrun Exposure */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-outfit">
                          Sector-Wise Cost Escalation Exposure (₹ Cr)
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Aggregate rupee overrun exposure across top infrastructure sectors in {selectedMonth}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
                          Top Impact Sectors
                        </span>
                        <button
                          onClick={() => setFullscreenChart('cost_sector')}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Chart in Full Screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-[290px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={costData?.sector_exposure_breakdown?.slice(0, 8) || []}
                          margin={{ top: 15, right: 20, left: 10, bottom: 55 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="sector"
                            tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                            interval={0}
                            angle={-30}
                            textAnchor="end"
                            height={55}
                            tickFormatter={(val) => truncateLabel(val, 16)}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k Cr` : `₹${v} Cr`)}
                          />
                          <RechartsTooltip content={<CustomChartTooltip unit="Cr" />} />
                          <Bar
                            barSize={32}
                            name="Cost Escalation Exposure"
                            dataKey="total_exposure_cr"
                            fill="#ef4444"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>X-Axis: Major Sectors</span>
                    <span>Y-Axis: Total Capital Overrun Exposure (₹ Cr)</span>
                  </div>
                </div>

                {/* Chart 2: Cost Overrun Severity Distribution (Donut) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-outfit">Overrun Severity Spread</h3>
                        <p className="text-xs text-slate-500 font-medium">Portfolio distribution by cost escalation tier</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-slate-400" />
                        <button
                          onClick={() => setFullscreenChart('cost_severity')}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Chart in Full Screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-[200px] w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={costDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {costDistribution.map((entry, index) => (
                              <Cell key={`cost-slice-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomChartTooltip unit="Projects" />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-extrabold text-slate-900">
                          {costData?.summary?.total_projects || 0}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Total Projects
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {costDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-900">
                            {item.value} ({((item.value / (costData?.summary?.total_projects || 1)) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 3: Top Overrun Impact Projects (Horizontal Bar Chart) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-outfit">
                      Top Capital Escalation Mega Projects (₹ Cr)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Individual projects with the largest monetary increase between original budget and revised sanction
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      Sorted by Absolute Overrun Exposure
                    </span>
                    <button
                      onClick={() => setFullscreenChart('cost_projects')}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="View Chart in Full Screen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-[290px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={costData?.projects?.slice(0, 7).map((p: any) => ({
                        name: p.name,
                        shortName: truncateLabel(p.name, 24),
                        exposure: p.cost_overrun_exposure_cr,
                        budget: p.budget_cr,
                        revised: p.revised_cost_cr,
                        overrun_pct: p.cost_overrun_pct
                      })) || []}
                      margin={{ top: 10, right: 35, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(v) => `₹${Number(v).toLocaleString()} Cr`}
                      />
                      <YAxis
                        dataKey="shortName"
                        type="category"
                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                        width={160}
                      />
                      <RechartsTooltip content={<CustomChartTooltip unit="Cr" />} />
                      <Bar
                        barSize={20}
                        name="Cost Overrun Exposure"
                        dataKey="exposure"
                        fill="#3b82f6"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
                    Project-by-Project Cost Overrun Predictions ({costData?.projects?.length || 0} Monitored Projects)
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
                    ~{timeData?.summary?.average_delay_days || 0} days estimated slippage
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
                    Projects slipping beyond 12 calendar months
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
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    Moderate slippage requiring milestone recovery
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-Track Adherence</p>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600 mt-2">
                    {timeData?.summary?.on_track_count?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {timeData?.summary?.total_projects ? ((timeData.summary.on_track_count / timeData.summary.total_projects) * 100).toFixed(1) : 0}% adhering to target commissioning
                  </p>
                </div>
              </div>

              {/* Visual Charts Grid: 3 Rich Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart 1: Average Delay by Sector (Months) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-outfit">
                          Sector-Wise Average Schedule Slippage (Months)
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Empirical commissioning delay across infrastructure domains for {selectedMonth}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                          Schedule Variance
                        </span>
                        <button
                          onClick={() => setFullscreenChart('time_sector')}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Chart in Full Screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-[290px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={timeData?.sector_delay_breakdown?.slice(0, 8) || []}
                          margin={{ top: 15, right: 20, left: 10, bottom: 55 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="sector"
                            tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                            interval={0}
                            angle={-30}
                            textAnchor="end"
                            height={55}
                            tickFormatter={(val) => truncateLabel(val, 16)}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => `${v} Mo`}
                          />
                          <RechartsTooltip content={<CustomChartTooltip unit="Months" />} />
                          <Bar
                            barSize={32}
                            name="Average Delay"
                            dataKey="avg_delay_months"
                            fill="#f59e0b"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>X-Axis: Infrastructure Sectors</span>
                    <span>Y-Axis: Average Delay (Months)</span>
                  </div>
                </div>

                {/* Chart 2: Schedule Slippage Breakdown (Donut) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-outfit">Slippage Distribution</h3>
                        <p className="text-xs text-slate-500 font-medium">Projects categorized by delay severity</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <button
                          onClick={() => setFullscreenChart('time_severity')}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Chart in Full Screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-[200px] w-full relative flex items-center justify-center">
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
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {[
                              { color: '#ef4444' },
                              { color: '#f97316' },
                              { color: '#3b82f6' },
                              { color: '#10b981' }
                            ].map((entry, index) => (
                              <Cell key={`time-cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomChartTooltip unit="Projects" />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-extrabold text-slate-900">
                          {timeData?.summary?.total_projects || 0}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Monitored
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {[
                        { label: 'Severe (>12 Mo)', count: timeData?.summary?.severe_delay_count || 0, color: '#ef4444' },
                        { label: 'Significant (6-12 Mo)', count: timeData?.summary?.significant_delay_count || 0, color: '#f97316' },
                        { label: 'Minor (2-6 Mo)', count: timeData?.summary?.minor_delay_count || 0, color: '#3b82f6' },
                        { label: 'On-Track (<2 Mo)', count: timeData?.summary?.on_track_count || 0, color: '#10b981' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 font-medium">{item.label}</span>
                          </div>
                          <span className="font-bold text-slate-900">
                            {item.count} ({((item.count / (timeData?.summary?.total_projects || 1)) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 3: Top Delayed Mega Projects (Horizontal Bar Chart) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-outfit">
                      Top Schedule Delay Mega Projects (Months)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Critical infrastructure initiatives experiencing the highest duration slippage past sanctioned commissioning
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      Ranked by Calendar Months Delayed
                    </span>
                    <button
                      onClick={() => setFullscreenChart('time_projects')}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="View Chart in Full Screen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-[290px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={timeData?.projects?.slice(0, 7).map((p: any) => ({
                        name: p.name,
                        shortName: truncateLabel(p.name, 24),
                        delay_months: p.predicted_delay_months,
                        delay_days: p.predicted_delay_days,
                        budget: p.budget_cr,
                        severity: p.delay_severity
                      })) || []}
                      margin={{ top: 10, right: 35, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(v) => `${v} Mo`}
                      />
                      <YAxis
                        dataKey="shortName"
                        type="category"
                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                        width={160}
                      />
                      <RechartsTooltip content={<CustomChartTooltip unit="Months" />} />
                      <Bar
                        barSize={20}
                        name="Predicted Delay"
                        dataKey="delay_months"
                        fill="#f97316"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
                    Project-by-Project Schedule & Delay Predictions ({timeData?.projects?.length || 0} Monitored Projects)
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
                  <p className="text-xs text-slate-500 mt-1">Monitored infrastructure portfolio</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-indigo-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Capital Outlay</p>
                    <IndianRupee className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    ₹{((overview?.total_budget_cr || 0) / 1000).toFixed(1)}k Cr
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Sanctioned public expenditure</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-amber-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Risk Score</p>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {((overview?.average_risk_score || 0) * 100).toFixed(1)}
                  </p>
                  <p className="text-xs text-amber-600 font-semibold mt-1">Multi-dimensional composite benchmark</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-rose-500">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Overrun Exposure</p>
                    <TrendingUp className="h-5 w-5 text-rose-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    ₹{((overview?.total_cost_overrun_exposure_cr || 0) / 1000).toFixed(1)}k Cr
                  </p>
                  <p className="text-xs text-rose-600 font-semibold mt-1">Total portfolio cost escalation</p>
                </div>
              </div>

              {/* Main Growth / Risk Benchmark Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 font-outfit">Performance Benchmarks</h2>
                        <p className="text-xs text-slate-500">
                          Cross-category comparison of Cost Growth (%) vs. Risk Score
                        </p>
                      </div>

                      {/* Dimension Selector Tabs & Fullscreen */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
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
                              By {tab === 'geographic_region' ? 'Region' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setFullscreenChart('benchmarks')}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Chart in Full Screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {benchmarks?.explanatory_annotations && (
                      <div className="mb-4 text-xs p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-800 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Statistical Context: </span>
                          {benchmarks.explanatory_annotations.what_should_not_be_concluded}
                        </div>
                      </div>
                    )}

                    {/* Legend header for clarity */}
                    <div className="flex items-center justify-end gap-5 text-xs font-semibold mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
                        <span className="text-slate-700">Avg Cost Growth (%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-[#f43f5e]" />
                        <span className="text-slate-700">Avg Risk Score (0-100)</span>
                      </div>
                    </div>

                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={benchmarks?.benchmark_groups?.slice(0, 10) || []}
                          margin={{ top: 15, right: 35, left: 10, bottom: 55 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="category"
                            tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                            interval={0}
                            angle={-30}
                            textAnchor="end"
                            height={55}
                            tickFormatter={(val) => truncateLabel(val, 16)}
                          />
                          <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => `${v}`}
                          />
                          <RechartsTooltip content={<CustomChartTooltip />} />
                          <Bar
                            barSize={16}
                            yAxisId="left"
                            dataKey="avg_cost_growth_pct"
                            name="Avg Cost Growth (%)"
                            fill="#3b82f6"
                            radius={[6, 6, 0, 0]}
                          />
                          <Bar
                            barSize={16}
                            yAxisId="right"
                            dataKey="avg_risk_score"
                            name="Avg Risk Score"
                            fill="#f43f5e"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Left Axis: Cost Growth (%)</span>
                    <span>Right Axis: Risk Score (0-100)</span>
                  </div>
                </div>

                {/* State/Geography Distribution Chart (Donut + Ranked List) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 font-outfit">Regional Distribution</h2>
                        <p className="text-xs text-slate-500">Project concentration by state & jurisdiction</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <button
                          onClick={() => setFullscreenChart('regional')}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Chart in Full Screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-[210px] w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={geography?.geography?.slice(0, 8) || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="project_count"
                            nameKey="category_name"
                          >
                            {(geography?.geography?.slice(0, 8) || []).map((_: any, index: number) => (
                              <Cell key={`geo-cell-${index}`} fill={GEO_COLORS[index % GEO_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomChartTooltip unit="Projects" />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-extrabold text-slate-900">
                          {overview?.total_projects || 0}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Total Projects
                        </span>
                      </div>
                    </div>

                    {/* Clean Top States List with counts & % */}
                    <div className="mt-2 space-y-1.5">
                      {(geography?.geography?.slice(0, 5) || []).map((geo: any, idx: number) => {
                        const total = overview?.total_projects || 1776;
                        const pct = ((geo.project_count / total) * 100).toFixed(1);
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: GEO_COLORS[idx % GEO_COLORS.length] }}
                              />
                              <span className="text-slate-700 font-medium truncate max-w-[140px]" title={geo.category_name}>
                                {geo.category_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{geo.project_count}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom 2 Charts: Ministry Risk Profiles (Horizontal) and Capital Outlay by Sector (Horizontal) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ministry Risk Profiles (Horizontal Bar Chart) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 font-outfit">Ministry Risk Profiles</h2>
                        <p className="text-xs text-slate-500">Average risk score across key line ministries</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <button
                          onClick={() => setFullscreenChart('ministry')}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Chart in Full Screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-[290px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={ministries?.ministries?.slice(0, 7).map((m: any) => ({
                            name: m.category_name,
                            shortName: truncateLabel(m.category_name, 22),
                            risk_score: Number((m.average_risk_score * 100).toFixed(1)),
                            projects: m.project_count,
                            budget: m.total_budget_cr
                          })) || []}
                          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => `${v}`}
                          />
                          <YAxis
                            dataKey="shortName"
                            type="category"
                            tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                            width={140}
                          />
                          <RechartsTooltip content={<CustomChartTooltip unit="/ 100" />} />
                          <Bar
                            barSize={20}
                            name="Avg Risk Score"
                            dataKey="risk_score"
                            fill="#f59e0b"
                            radius={[0, 6, 6, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Y-Axis: Line Ministries</span>
                    <span>X-Axis: Composite Risk Index (0-100 Scale)</span>
                  </div>
                </div>

                {/* Capital Outlay by Sector (Horizontal Bar Chart) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 font-outfit">Capital Outlay by Sector</h2>
                        <p className="text-xs text-slate-500">Total sanctioned expenditure allocation (₹ Cr)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                        <button
                          onClick={() => setFullscreenChart('capital')}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Chart in Full Screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-[290px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={benchmarks?.benchmark_groups?.slice(0, 7).map((b: any) => ({
                            name: b.category,
                            shortName: truncateLabel(b.category, 22),
                            total_budget_cr: b.total_budget_cr,
                            sample_size: b.sample_size
                          })) || []}
                          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k Cr` : `₹${v} Cr`)}
                          />
                          <YAxis
                            dataKey="shortName"
                            type="category"
                            tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                            width={140}
                          />
                          <RechartsTooltip content={<CustomChartTooltip unit="Cr" />} />
                          <Bar
                            barSize={20}
                            name="Total Budget"
                            dataKey="total_budget_cr"
                            fill="#10b981"
                            radius={[0, 6, 6, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Y-Axis: Major Sectors</span>
                    <span>X-Axis: Capital Outlay (₹ Cr)</span>
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
