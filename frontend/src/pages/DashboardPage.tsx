import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
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
  Layers,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  ChevronRight,
  Sparkles,
  MapPin,
  Sliders,
  Bell
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  // Calculate aggregated health metrics
  const totalProjects = projects.length;
  const criticalProjects = projects.filter(p => p.overallRiskScore >= 75);
  const highRiskProjects = projects.filter(p => p.overallRiskScore >= 50 && p.overallRiskScore < 75);
  const costExposureProjects = projects.filter(p => p.costOverrunPct >= 10);
  const delayProjects = projects.filter(p => p.scheduleDelayDays >= 90);

  const avgRiskScore = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.overallRiskScore, 0) / totalProjects)
    : 58;

  const totalCostOverrunExposureCr = projects.reduce((acc, p) => {
    return acc + Math.round(p.budgetCr * (p.costOverrunPct / 100));
  }, 0);

  const earlyWarningCount = projects.filter(p => p.earlyWarningLeadMonths >= 3.0).length;

  // Donut chart sector data
  const sectorCounts: Record<string, number> = {};
  projects.forEach(p => {
    sectorCounts[p.sector] = (sectorCounts[p.sector] || 0) + 1;
  });
  const sectorColors = ['#3b82f6', '#f8880f', '#10b981', '#ef4444', '#eab308', '#8b5cf6'];
  const sectorData = Object.keys(sectorCounts).map((sec, idx) => ({
    name: sec,
    value: sectorCounts[sec],
    color: sectorColors[idx % sectorColors.length]
  }));

  // Bar chart risk distribution data
  const riskDistributionData = [
    { name: 'Low (<25)', count: projects.filter(p => p.overallRiskScore < 25).length, color: '#10b981' },
    { name: 'Moderate (25-49)', count: projects.filter(p => p.overallRiskScore >= 25 && p.overallRiskScore < 50).length, color: '#eab308' },
    { name: 'High (50-74)', count: highRiskProjects.length, color: '#f97316' },
    { name: 'Critical (≥75)', count: criticalProjects.length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131c31] border border-[#23304a] p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
              National Oversight Board
            </span>
            <span className="text-slate-400 text-xs">• MoSPI Infrastructure Portal</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1.5 font-outfit tracking-tight">
            PAIMANA PredictIQ — National Risk Command Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time decision support & predictive overrun early warning across India’s mega infrastructure pipeline.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-[#1b2640] hover:bg-[#233254] text-slate-200 border border-[#2e3e60] rounded-xl text-xs font-bold transition"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Open Risk Map</span>
          </button>
          <button
            onClick={() => navigate('/scenarios')}
            className="flex items-center space-x-2 px-4 py-2 bg-[#f8880f] hover:bg-[#e0770b] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#f8880f]/20 transition"
          >
            <Sliders className="w-4 h-4" />
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Projects */}
        <div className="dark-dashboard-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-white font-outfit">{totalProjects}</h2>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">Total Monitored Portfolio</p>
          </div>
        </div>

        {/* KPI 2: Average Risk Score */}
        <div className="dark-dashboard-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Risk Index</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-amber-400 font-outfit">{avgRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span></h2>
            <p className="text-[11px] font-semibold text-amber-400/80 mt-1">Moderate Systemic Escalation</p>
          </div>
        </div>

        {/* KPI 3: Projects in Early Warning */}
        <div className="dark-dashboard-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Early Warning Lead</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-orange-400 font-outfit">{earlyWarningCount} Projects</h2>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">Avg 4.2 mo lead time prior to delay</p>
          </div>
        </div>

        {/* KPI 4: Total Potential Cost Overrun Exposure */}
        <div className="dark-dashboard-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Overrun Exposure</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-red-400 font-outfit">₹{totalCostOverrunExposureCr.toLocaleString()} Cr</h2>
            <p className="text-[11px] font-semibold text-red-400/80 mt-1">Aggregate Potential Risk Value</p>
          </div>
        </div>
      </div>

      {/* 3. Clickable Metric Cards across Risk Tiers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-white tracking-wide uppercase font-outfit flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#f8880f]" />
            <span>Risk Tier Distribution (Click Card to Filter Project Explorer)</span>
          </h2>
          <span className="text-xs text-slate-400">Interactive Filter Trigger</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Critical Risk Projects */}
          <div
            onClick={() => navigate('/projects?status=Critical')}
            className="dark-dashboard-card dark-dashboard-card-clickable p-4 border-l-4 border-l-red-500 bg-gradient-to-br from-[#1b1523] to-[#131b2e] group"
          >
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
                Critical Tier (≥75)
              </span>
              <ArrowUpRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-red-400 font-outfit">{criticalProjects.length}</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Projects at imminent delay/cost risk</p>
              <p className="text-[10px] text-red-400/80 mt-2 font-bold flex items-center gap-1">
                <span>Filter Critical Projects →</span>
              </p>
            </div>
          </div>

          {/* Card 2: High Risk Projects */}
          <div
            onClick={() => navigate('/projects?status=At Risk')}
            className="dark-dashboard-card dark-dashboard-card-clickable p-4 border-l-4 border-l-orange-500 bg-gradient-to-br from-[#231d16] to-[#131b2e] group"
          >
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider border border-orange-500/30">
                High Risk Tier (50-74)
              </span>
              <ArrowUpRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-orange-400 font-outfit">{highRiskProjects.length}</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Accelerating risk trajectories</p>
              <p className="text-[10px] text-orange-400/80 mt-2 font-bold flex items-center gap-1">
                <span>Filter High Risk Projects →</span>
              </p>
            </div>
          </div>

          {/* Card 3: Potential Cost Exposure */}
          <div
            onClick={() => navigate('/projects?costOverrun=high')}
            className="dark-dashboard-card dark-dashboard-card-clickable p-4 border-l-4 border-l-yellow-500 bg-gradient-to-br from-[#232016] to-[#131b2e] group"
          >
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/30">
                Cost Overrun (&gt;10%)
              </span>
              <ArrowUpRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-yellow-400 font-outfit">{costExposureProjects.length}</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Significant budget variance</p>
              <p className="text-[10px] text-yellow-400/80 mt-2 font-bold flex items-center gap-1">
                <span>Filter Cost Exposure Projects →</span>
              </p>
            </div>
          </div>

          {/* Card 4: Potential Delay */}
          <div
            onClick={() => navigate('/projects?delayDays=90')}
            className="dark-dashboard-card dark-dashboard-card-clickable p-4 border-l-4 border-l-blue-500 bg-gradient-to-br from-[#161d2b] to-[#131b2e] group"
          >
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                Schedule Delay (&gt;90d)
              </span>
              <ArrowUpRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-blue-400 font-outfit">{delayProjects.length}</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Schedule milestone slippage</p>
              <p className="text-[10px] text-blue-400/80 mt-2 font-bold flex items-center gap-1">
                <span>Filter Schedule Delay Projects →</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Charts & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector Breakdown Donut */}
        <div className="dark-dashboard-card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white font-outfit uppercase tracking-wide">Sector Portfolio Breakdown</h3>
            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={3} dataKey="value">
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-lg font-black text-white font-outfit">{totalProjects}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Projects</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 w-full text-xs">
                {sectorData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2 bg-[#1b253b] p-1.5 rounded-lg border border-[#283654]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 text-[11px] truncate">{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Distribution Bar Chart */}
        <div className="dark-dashboard-card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white font-outfit uppercase tracking-wide">Risk Severity Distribution</h3>
            <p className="text-[11px] text-slate-400 mt-1">Classification across portfolio risk tiers</p>
            <div className="mt-6 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="w-full mt-3 py-2 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center space-x-1 border border-blue-500/20 rounded-lg hover:bg-blue-500/10 transition"
          >
            <span>Explore All Projects Table</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Critical Projects Urgent Feed */}
        <div className="dark-dashboard-card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white font-outfit uppercase tracking-wide">Urgent Priority Feed</h3>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">Top Critical</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {criticalProjects.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-2.5 rounded-xl bg-[#1b253b] border border-[#283654] hover:border-blue-500 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{p.ministry} • {p.state}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      {p.overallRiskScore}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/interventions')}
            className="w-full mt-3 py-2 text-xs font-bold text-[#f8880f] hover:text-[#fb923c] flex items-center justify-center space-x-1 border border-[#f8880f]/20 rounded-lg hover:bg-[#f8880f]/10 transition"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Open Intervention Panel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
