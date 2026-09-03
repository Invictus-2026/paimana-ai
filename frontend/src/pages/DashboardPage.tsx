import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  DASHBOARD_STATS,
  SECTOR_DISTRIBUTION,
  COST_OVERRUN_RISK_DISTRIBUTION,
  TOP_HIGH_RISK_PROJECTS,
  OVERRUN_TRENDS
} from '../data/mockData';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  LayoutGrid,
  IndianRupee,
  TrendingUp,
  Clock,
  Shield,
  Download,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Bell,
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: overviewResponse } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: api.getAnalyticsOverview,
  });
  const overview = overviewResponse?.data;

  const { data: sectorResponse } = useQuery({
    queryKey: ['sector-analytics'],
    queryFn: api.getSectorAnalytics,
  });

  const sectorChartData = React.useMemo(() => {
    if (!sectorResponse?.data?.sectors || sectorResponse.data.sectors.length === 0) {
      return SECTOR_DISTRIBUTION;
    }
    const realSectors = sectorResponse.data.sectors;
    const totalProjects = overview?.total_projects || 1775;
    return realSectors.map((sec: any, idx: number) => ({
      name: sec.category_name || 'Unknown',
      count: sec.project_count || 0,
      pct: ((sec.project_count / totalProjects) * 100).toFixed(1) + '%',
      color: SECTOR_DISTRIBUTION[idx % SECTOR_DISTRIBUTION.length].color
    }));
  }, [sectorResponse, overview?.total_projects]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-6 text-slate-800">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-sans tracking-tight">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            AI-powered insights for smarter infrastructure monitoring
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>April 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <button className="flex items-center space-x-2 bg-[#0d52ce] hover:bg-[#0b45ad] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#0d52ce]/20 transition">
            <span>Export Report</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top 5 Stat Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Projects */}
        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Projects</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1 font-sans">{overview ? overview.total_projects.toLocaleString() : DASHBOARD_STATS.totalProjects}</h2>
            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 2.4%</span> <span className="text-slate-400 font-normal">from Mar 2026</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0d52ce] text-white flex items-center justify-center shadow-md shadow-[#0d52ce]/20 shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Original Cost */}
        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Original Cost</span>
            <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">{overview ? '₹' + overview.total_budget_cr.toLocaleString() + ' Cr' : DASHBOARD_STATS.originalCost}</h2>
            <p className="text-[11px] font-normal text-slate-400 mt-1">{DASHBOARD_STATS.originalCostSub}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Revised Cost */}
        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Revised Cost</span>
            <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">{overview ? '₹' + (overview.total_budget_cr + overview.total_cost_overrun_exposure_cr).toLocaleString() + ' Cr' : DASHBOARD_STATS.revisedCost}</h2>
            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 4.1%</span> <span className="text-slate-400 font-normal">from Mar 2026</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0d52ce] text-white flex items-center justify-center shadow-md shadow-[#0d52ce]/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Cumulative Expenditure */}
        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Cumulative Expenditure</span>
            <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">{DASHBOARD_STATS.cumulativeExpenditure}</h2>
            <p className="text-[11px] font-normal text-slate-400 mt-1">{DASHBOARD_STATS.cumulativeExpenditureSub}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: High Risk Projects */}
        <div className="light-card p-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">High Risk Projects</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1 font-sans">{overview ? overview.at_risk_projects_count.toLocaleString() : DASHBOARD_STATS.highRiskProjects}</h2>
            <p className="text-[11px] font-normal text-slate-400 mt-1">{DASHBOARD_STATS.highRiskProjectsSub}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Middle Row 1 (3 Column Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Projects by Sector (Donut) */}
        <div className="light-card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Projects by Sector</h3>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              {/* Donut Chart */}
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {sectorChartData.map((entry: any, index: number) => (
                        <Cell key={`sector-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-base font-black text-slate-900">{overview ? overview.total_projects.toLocaleString() : "1,981"}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 flex-1 text-xs">
                {sectorChartData.map((sec: any) => (
                  <div key={sec.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                      <span className="text-slate-600 font-medium truncate">{sec.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 ml-2">{sec.pct} <span className="text-slate-400 font-normal">({sec.count})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/projects')}
            className="mt-4 text-xs font-bold text-[#0d52ce] hover:underline flex items-center space-x-1"
          >
            <span>View all sectors</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Cost Overrun Risk Distribution (Bar Chart) */}
        <div className="light-card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Cost Overrun Risk Distribution</h3>
              <button onClick={() => navigate('/projects')} className="text-xs font-bold text-[#0d52ce] hover:underline flex items-center space-x-0.5">
                <span>View details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COST_OVERRUN_RISK_DISTRIBUTION} margin={{ top: 15, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="level" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {COST_OVERRUN_RISK_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center border-t border-slate-100 pt-2 mt-1 text-[11px]">
              {COST_OVERRUN_RISK_DISTRIBUTION.map((d) => (
                <div key={d.level}>
                  <p className="font-extrabold text-slate-800">{d.pct}</p>
                  <p className="text-[10px] text-slate-400">({d.count})</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Top High Risk Projects */}
        <div className="light-card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">Top High Risk Projects <span className="text-[10px] text-slate-400 font-normal ml-2">(sample data)</span></h3>
              <button onClick={() => navigate('/projects?status=High Risk')} className="text-xs font-bold text-[#0d52ce] hover:underline flex items-center space-x-0.5">
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {TOP_HIGH_RISK_PROJECTS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{p.ministry}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                      High Risk
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 font-mono">
                      {p.riskScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Middle Row 2 (Line Chart + AI Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cost vs Time Overrun Trends Chart (2/3 width) */}
        <div className="light-card p-5 lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Cost vs Time Overrun Trends <span className="text-[10px] text-slate-400 font-normal ml-2">(sample data)</span></h3>
              </div>
              <button onClick={() => navigate('/analytics')} className="text-xs font-bold text-[#0d52ce] hover:underline flex items-center space-x-0.5">
                <span>View analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-6 text-xs font-semibold mt-2">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-[#0d52ce] inline-block rounded" />
                <span className="text-slate-600">Cost Overrun (%)</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-orange-500 inline-block rounded" />
                <span className="text-slate-600">Time Overrun (%)</span>
              </span>
            </div>

            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={OVERRUN_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 40]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="costOverrun" stroke="#0d52ce" strokeWidth={3} dot={{ r: 4, fill: '#0d52ce' }} />
                  <Line type="monotone" dataKey="timeOverrun" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights Card (1/3 width) */}
        <div className="light-card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#0d52ce]" />
                <h3 className="font-bold text-sm text-slate-900">AI Insights <span className="text-[10px] text-slate-400 font-normal ml-2">(sample data)</span></h3>
              </div>
              <button onClick={() => navigate('/copilot')} className="text-xs font-bold text-[#0d52ce] hover:underline flex items-center space-x-0.5">
                <span>View all insights</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-orange-50/60 border-l-4 border-l-orange-500 text-xs font-medium text-slate-800 flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="leading-snug">312 projects are at very high risk of cost overrun. Potential additional cost impact: <strong>₹2.41 Lakh Cr</strong></p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border-l-4 border-l-blue-500 text-xs font-medium text-slate-800 flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="leading-snug">Transport & Logistics sector shows highest time overrun risk. Average delay: <strong>8.7 months</strong></p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border-l-4 border-l-emerald-500 text-xs font-medium text-slate-800 flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="leading-snug">Early intervention can save up to <strong>₹1.18 Lakh Cr</strong> if actioned in next 3 months</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row (3 Columns: Quick Actions, Recent Alerts, Data Quality Score) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions (5 Columns) */}
        <div className="light-card p-5 lg:col-span-5 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-5 gap-2">
            <button onClick={() => navigate('/projects')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition">
              <div className="w-8 h-8 rounded-full bg-[#0d52ce] text-white flex items-center justify-center mb-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Add Project</span>
            </button>

            <button onClick={() => navigate('/interventions')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center mb-1.5 shadow-sm">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Risk Alerts</span>
            </button>

            <button onClick={() => navigate('/reports')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition">
              <div className="w-8 h-8 rounded-full bg-[#0d52ce] text-white flex items-center justify-center mb-1.5 shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Generate Report</span>
            </button>

            <button onClick={() => navigate('/copilot')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">AI Assistant</span>
            </button>

            <button onClick={() => navigate('/projects')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Data Upload</span>
            </button>
          </div>
        </div>

        {/* Recent Alerts (4 Columns) */}
        <div className="light-card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">Recent Alerts <span className="text-[10px] text-slate-400 font-normal ml-2">(sample data)</span></h3>
              <button onClick={() => navigate('/interventions')} className="text-xs font-bold text-[#0d52ce] hover:underline flex items-center space-x-0.5">
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-snug">High risk of cost overrun detected in 12 projects</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-snug">Risk escalation in 18 projects</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">15 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Score (3 Columns) */}
        <div className="light-card p-5 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900">Data Quality Score</h3>
              <button onClick={() => navigate('/settings')} className="text-xs font-bold text-[#0d52ce] hover:underline flex items-center space-x-0.5">
                <span>View details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-4 mt-3">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#0d52ce]"
                    strokeDasharray="92, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-900">
                  92%
                </div>
              </div>

              <div>
                <h4 className="font-black text-sm text-slate-900">Excellent</h4>
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Data is updated and validated</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
