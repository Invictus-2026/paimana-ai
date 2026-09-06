import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { SECTOR_DISTRIBUTION } from '../data/mockData';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';
import {
  LayoutGrid, IndianRupee, TrendingUp, Clock, Shield, Download,
  Calendar, ChevronDown, ArrowUpRight, ChevronRight, AlertTriangle,
  CheckCircle2, Zap, Activity, Sparkles
} from 'lucide-react';
import ExpandableChartCard from '../components/common/ExpandableChartCard';

const MONTHS_LIST = [
  "2025-07","2025-08","2025-09","2025-10","2025-11","2025-12",
  "2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07",
];
const MONTH_LABELS: Record<string, string> = {
  "2025-07":"Jul '25","2025-08":"Aug '25","2025-09":"Sep '25","2025-10":"Oct '25",
  "2025-11":"Nov '25","2025-12":"Dec '25","2026-01":"Jan '26","2026-02":"Feb '26",
  "2026-03":"Mar '26","2026-04":"Apr '26","2026-05":"May '26","2026-06":"Jun '26",
  "2026-07":"Jul '26",
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState("2026-07");

  const { data: overviewResponse } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: api.getAnalyticsOverview,
  });
  const overview = overviewResponse?.data;

  const { data: monthlyResponse } = useQuery({
    queryKey: ['monthly-overview'],
    queryFn: api.getMonthlyOverview,
  });
  const monthlyData: any[] = monthlyResponse?.data?.months || [];

  const { data: sectorsResponse } = useQuery({
    queryKey: ['monthly-sectors', selectedMonth],
    queryFn: () => api.getMonthlySectors(selectedMonth),
  });
  const sectorData: any[] = sectorsResponse?.data?.sectors || [];

  const { data: sectorAnalyticsResponse } = useQuery({
    queryKey: ['sector-analytics'],
    queryFn: api.getSectorAnalytics,
  });

  // Selected month stats
  const selectedIndex = monthlyData.findIndex(m => m.month === selectedMonth);
  const currentMonthData = selectedIndex >= 0 ? monthlyData[selectedIndex] : monthlyData[monthlyData.length - 1];
  const prevMonthData = selectedIndex > 0 ? monthlyData[selectedIndex - 1] : null;
  const projectGrowth = currentMonthData && prevMonthData && prevMonthData.total_projects > 0
    ? (((currentMonthData.total_projects - prevMonthData.total_projects) / prevMonthData.total_projects) * 100).toFixed(1)
    : '0.0';

  // Sector donut data
  const sectorChartData = React.useMemo(() => {
    if (sectorData.length > 0) {
      return sectorData.slice(0, 10).map((s: any, i: number) => ({
        name: s.sector,
        count: s.count,
        pct: currentMonthData ? ((s.count / currentMonthData.total_projects) * 100).toFixed(1) + '%' : '0%',
        color: SECTOR_DISTRIBUTION[i % SECTOR_DISTRIBUTION.length].color,
      }));
    }
    const raw = sectorAnalyticsResponse?.data?.sectors || [];
    const total = overview?.total_projects || 1;
    return raw.slice(0, 10).map((s: any, i: number) => ({
      name: s.category_name, count: s.project_count,
      pct: ((s.project_count / total) * 100).toFixed(1) + '%',
      color: SECTOR_DISTRIBUTION[i % SECTOR_DISTRIBUTION.length].color,
    }));
  }, [sectorData, sectorAnalyticsResponse, currentMonthData, overview]);

  const filteredMonthlyData = selectedIndex >= 0 ? monthlyData.slice(0, selectedIndex + 1) : monthlyData;

  // Cost overrun trend data
  const overrunTrend = filteredMonthlyData.filter(m => m.cost_overrun_pct !== undefined).map(m => ({
    label: m.label,
    costOverrun: m.cost_overrun_pct,
    expRate: m.expenditure_rate_pct,
    projects: m.total_projects,
  }));

  // Projects growth trend
  const projectsTrend = filteredMonthlyData.map(m => ({
    label: m.label,
    projects: m.total_projects,
    expenditure: Math.round(m.total_expenditure_cr / 1000),
  }));

  // Top sectors by count for bar chart
  const topSectors = sectorData.slice(0, 8).map((s: any) => ({
    name: s.sector.length > 16 ? s.sector.slice(0, 16) + '…' : s.sector,
    count: s.count,
    exp: Math.round(s.exp_cr / 100) / 10,
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-sans tracking-tight">
            National Infrastructure Monitor
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Real-time MoSPI data · Jul 2025 – Jul 2026 · {monthlyData.length} monthly snapshots loaded
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-4 py-2.5 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0d52ce] cursor-pointer"
            >
              {MONTHS_LIST.map(m => (
                <option key={m} value={m}>{MONTH_LABELS[m]}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="flex items-center space-x-2 bg-[#0d52ce] hover:bg-[#0b45ad] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition">
            <span>Export</span><Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Projects</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{(currentMonthData?.total_projects || overview?.total_projects || 0).toLocaleString()}</h2>
            <p className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${Number(projectGrowth) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
              <span>{Number(projectGrowth) >= 0 ? '↑' : '↓'} {Math.abs(Number(projectGrowth))}%</span><span className="text-slate-400 font-normal">from prev month</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0d52ce] text-white flex items-center justify-center shadow-md shadow-[#0d52ce]/20 shrink-0"><LayoutGrid className="w-5 h-5" /></div>
        </div>

        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Original Budget</span>
            <h2 className="text-xl font-black text-slate-900 mt-1">₹{currentMonthData ? (currentMonthData.total_original_cost_cr / 100000).toFixed(1) + ' L Cr' : '—'}</h2>
            <p className="text-[11px] font-normal text-slate-400 mt-1">For {MONTH_LABELS[selectedMonth]}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0"><IndianRupee className="w-5 h-5" /></div>
        </div>

        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Revised Cost</span>
            <h2 className="text-xl font-black text-slate-900 mt-1">₹{currentMonthData && currentMonthData.total_revised_cost_cr > 0 ? (currentMonthData.total_revised_cost_cr / 100000).toFixed(1) + ' L Cr' : '—'}</h2>
            <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
              <span>+{currentMonthData?.cost_overrun_pct?.toFixed(1) || '0'}%</span><span className="text-slate-400 font-normal">overrun</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0d52ce] text-white flex items-center justify-center shadow-md shadow-[#0d52ce]/20 shrink-0"><TrendingUp className="w-5 h-5" /></div>
        </div>

        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Cumulative Expenditure</span>
            <h2 className="text-xl font-black text-slate-900 mt-1">₹{currentMonthData ? (currentMonthData.total_expenditure_cr / 100000).toFixed(1) + ' L Cr' : '—'}</h2>
            <p className="text-[11px] font-normal text-slate-400 mt-1">Utilisation: {currentMonthData?.expenditure_rate_pct?.toFixed(1) || '—'}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0"><Clock className="w-5 h-5" /></div>
        </div>

        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">High Risk Projects</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{overview?.at_risk_projects_count?.toLocaleString() || '—'}</h2>
            <p className="text-[11px] font-normal text-slate-400 mt-1">Risk score ≥ 50/100</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0"><Shield className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Row 2: Month-wise trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project count growth trend */}
        <ExpandableChartCard
          className="light-card p-5 lg:col-span-8"
          title="Month-wise Project & Expenditure Trend"
          subtitle="Jul 2025 → Jul 2026 · Real MoSPI data"
          headerRight={<Activity className="w-4 h-4 text-[#0d52ce]" />}
          chartHeight="h-56"
        >
          {(isFull) => (
            <ResponsiveContainer width="100%" height={isFull ? 500 : "100%"}>
              <AreaChart data={projectsTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d52ce" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d52ce" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}k Cr`} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: any, n: string) => n === 'expenditure' ? [`₹${v}k Cr`, 'Expenditure'] : [v, 'Projects']} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area yAxisId="left" type="monotone" dataKey="projects" name="Projects" stroke="#0d52ce" strokeWidth={2.5} fill="url(#gradProjects)" dot={{ r: 3, fill: '#0d52ce' }} />
                <Area yAxisId="right" type="monotone" dataKey="expenditure" name="Expenditure" stroke="#f97316" strokeWidth={2.5} fill="url(#gradExp)" dot={{ r: 3, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ExpandableChartCard>

        {/* Sector donut for selected month */}
        <ExpandableChartCard
          className="light-card p-5 lg:col-span-4"
          title={`Sectors – ${MONTH_LABELS[selectedMonth]}`}
          subtitle="Portfolio distribution"
          headerRight={
            <button onClick={() => navigate('/projects')} className="text-xs font-bold text-[#0d52ce] hover:underline flex items-center gap-1">
              All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          }
          chartHeight="h-56"
        >
          {(isFull) => (
            <div className={`flex items-center gap-4 ${isFull ? 'h-[500px] justify-center' : 'mt-3 h-full'}`}>
              <div className={`relative ${isFull ? 'w-64 h-64' : 'w-32 h-32'} shrink-0`}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorChartData} cx="50%" cy="50%" innerRadius={isFull ? 75 : 40} outerRadius={isFull ? 120 : 60} paddingAngle={3} dataKey="count">
                      {sectorChartData.map((_: any, i: number) => <Cell key={i} fill={SECTOR_DISTRIBUTION[i % SECTOR_DISTRIBUTION.length].color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`${isFull ? 'text-2xl' : 'text-sm'} font-black text-slate-900`}>{currentMonthData?.total_projects || '—'}</span>
                  <span className={`${isFull ? 'text-xs' : 'text-[9px]'} text-slate-400 font-semibold`}>Total</span>
                </div>
              </div>
              <div className={`space-y-1.5 flex-1 ${isFull ? 'text-sm max-w-md' : 'text-[11px]'}`}>
                {sectorChartData.slice(0, isFull ? 12 : 7).map((s: any, i: number) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: SECTOR_DISTRIBUTION[i % SECTOR_DISTRIBUTION.length].color }} />
                      <span className="text-slate-600 truncate">{s.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 ml-1">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ExpandableChartCard>
      </div>

      {/* Row 3: Cost overrun trend + Sector bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cost overrun & expenditure rate trend */}
        <ExpandableChartCard
          className="light-card p-5 lg:col-span-7"
          title="Cost Overrun & Expenditure Rate Trend"
          subtitle="Month-wise overrun % vs budget utilisation % · Real data"
          chartHeight="h-52"
        >
          {(isFull) => (
            <ResponsiveContainer width="100%" height={isFull ? 500 : "100%"}>
              <LineChart data={overrunTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="costOverrun" name="Cost Overrun %" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expRate" name="Expenditure Rate %" stroke="#0d52ce" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ExpandableChartCard>

        {/* Top sectors bar for selected month */}
        <ExpandableChartCard
          className="light-card p-5 lg:col-span-5"
          title={`Top Sectors – ${MONTH_LABELS[selectedMonth]}`}
          subtitle="Projects by sector volume"
          chartHeight="h-52"
        >
          {(isFull) => (
            <ResponsiveContainer width="100%" height={isFull ? 500 : "100%"}>
              <BarChart data={topSectors} layout="vertical" margin={{ top: 5, right: 25, left: 0, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} tickLine={false} axisLine={false} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: any, n: string) => [n === 'exp' ? `₹${v}k Cr` : v, n === 'exp' ? 'Expenditure' : 'Projects']} />
                <Bar dataKey="count" name="Projects" fill="#0d52ce" radius={[0, 4, 4, 0]} barSize={isFull ? 24 : 16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ExpandableChartCard>
      </div>

      {/* Row 4: Insights + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="light-card p-5 lg:col-span-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#0d52ce]" />
            <h3 className="font-bold text-sm text-slate-900">AI-Driven Insights from MoSPI Data</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-rose-50 border-l-4 border-l-rose-500 text-xs text-slate-800">
              <AlertTriangle className="w-4 h-4 text-rose-500 mb-1.5" />
              <p className="font-bold">Cost Overrun Alert</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {overview?.at_risk_projects_count || '—'} projects have ≥50% risk score. Avg overrun: {currentMonthData?.cost_overrun_pct?.toFixed(1) || '—'}%
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border-l-4 border-l-blue-500 text-xs text-slate-800">
              <TrendingUp className="w-4 h-4 text-blue-500 mb-1.5" />
              <p className="font-bold">Expenditure Rate</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Budget utilisation at {currentMonthData?.expenditure_rate_pct?.toFixed(1) || '—'}% in {MONTH_LABELS[selectedMonth]}. Rail & Highways lead disbursement.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border-l-4 border-l-emerald-500 text-xs text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1.5" />
              <p className="font-bold">Portfolio Growth</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {currentMonthData?.total_projects || '—'} projects tracked in {MONTH_LABELS[selectedMonth]}, up {projectGrowth}% month-on-month across all sectors.
              </p>
            </div>
          </div>
        </div>

        <div className="light-card p-5 lg:col-span-4">
          <h3 className="font-bold text-sm text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Project Explorer', path: '/projects', color: 'bg-[#0d52ce]', Icon: LayoutGrid },
              { label: 'Risk Alerts', path: '/interventions', color: 'bg-orange-500', Icon: Zap },
              { label: 'Analytics', path: '/analytics', color: 'bg-purple-600', Icon: Activity },
              { label: 'AI Copilot', path: '/copilot', color: 'bg-emerald-600', Icon: Sparkles },
            ].map(({ label, path, color, Icon }) => (
              <button key={label} onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition gap-2">
                <div className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center shadow-sm`}><Icon className="w-4 h-4" /></div>
                <span className="text-[11px] font-bold text-slate-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
