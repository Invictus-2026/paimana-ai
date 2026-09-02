import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  IndianRupee,
  Calendar,
  TrendingUp,
  AlertTriangle,
  FileText,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProjectById(id || '1'),
    enabled: Boolean(id),
  });

  if (isLoading || !project) {
    return (
      <div className="p-8 text-center text-slate-400 font-bold">
        Loading Project Intelligence for Project #{id}...
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', fill: '#ef4444', label: 'CRITICAL' };
    if (score >= 50) return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', fill: '#f97316', label: 'HIGH RISK' };
    if (score >= 35) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', fill: '#eab308', label: 'MODERATE' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', fill: '#10b981', label: 'STABLE' };
  };

  const overallColor = getRiskColor(project.overallRiskScore);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131c31] border border-[#23304a] p-5 rounded-2xl">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Explorer</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-white font-outfit">{project.name}</h1>
            <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${overallColor.bg}/20 ${overallColor.text} border ${overallColor.border}/40`}>
              {overallColor.label} ({project.overallRiskScore}/100)
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            {project.code} • {project.ministry} • {project.sector} • State: {project.state}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate(`/scenarios?project_id=${project.id}`)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#f8880f] hover:bg-[#e0770b] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#f8880f]/20 transition"
          >
            <Sliders className="w-4 h-4" />
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* Risk Metrics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Risk Score */}
        <div className="dark-dashboard-card p-5 flex flex-col justify-between border-l-4 border-l-red-500 bg-gradient-to-br from-[#1c1424] to-[#131b2e]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Risk Score</span>
          <div className="mt-3">
            <h2 className={`text-4xl font-black ${overallColor.text} font-outfit`}>{project.overallRiskScore} <span className="text-xs text-slate-400">/ 100</span></h2>
            <p className="text-xs text-slate-300 font-semibold mt-1">Status: {project.status}</p>
          </div>
        </div>

        {/* Sub-Risk: Cost Risk */}
        <div className="dark-dashboard-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cost Risk Score</span>
            <IndianRupee className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white font-outfit">{project.costRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span></h3>
            <p className="text-xs text-yellow-400 font-semibold mt-1">+{project.costOverrunPct}% Cost Overrun</p>
          </div>
        </div>

        {/* Sub-Risk: Delay Risk */}
        <div className="dark-dashboard-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule Delay Risk</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white font-outfit">{project.delayRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span></h3>
            <p className="text-xs text-orange-400 font-semibold mt-1">+{project.scheduleDelayDays} Days Delay</p>
          </div>
        </div>

        {/* Sub-Risk: Execution Risk */}
        <div className="dark-dashboard-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Execution Risk</span>
            <ShieldAlert className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white font-outfit">{project.executionRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span></h3>
            <p className="text-xs text-blue-400 font-semibold mt-1">Ground Progress Divergence</p>
          </div>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Trajectory Line Chart */}
        <div className="dark-dashboard-card p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-white font-outfit uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>12-Month Risk Score Trajectory</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                Accelerating Trend (+34 pts)
              </span>
            </div>

            <div className="mt-6 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={project.monthlyRiskHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#23304a] text-xs text-slate-300 flex items-center justify-between">
            <span>Current Trajectory Status: <strong className="text-red-400">Deteriorating Rapidly</strong></span>
            <span className="text-[11px] text-slate-400">Updated: April 2026</span>
          </div>
        </div>

        {/* Forecast & Early Warning Card */}
        <div className="dark-dashboard-card p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white font-outfit uppercase tracking-wide flex items-center gap-2 border-b border-[#23304a] pb-3">
              <Calendar className="w-4 h-4 text-[#f8880f]" />
              <span>Completion Forecast & Early Warning</span>
            </h2>

            {/* Early Warning Lead Time Highlight Card */}
            <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Early Warning Lead Time</span>
                <p className="text-base font-black text-white mt-0.5">
                  Detected <strong className="text-orange-400 font-extrabold">{project.earlyWarningLeadMonths} months</strong> prior to baseline delay
                </p>
              </div>
            </div>

            {/* Completion Dates Side-by-Side */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-[#1b253b] border border-[#283654]">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Baseline Target Completion</span>
                <p className="text-sm font-extrabold text-white mt-1">{project.plannedCompletionDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#1b253b] border border-[#283654]">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Forecasted Completion</span>
                <p className="text-sm font-extrabold text-red-400 mt-1">{project.forecastCompletionDate}</p>
              </div>
            </div>

            {/* Budget Variance */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-[#1b253b] border border-[#283654]">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Original Budget</span>
                <p className="text-sm font-extrabold text-white mt-1">₹{project.budgetCr.toLocaleString()} Cr</p>
              </div>

              <div className="p-3 rounded-xl bg-[#1b253b] border border-[#283654]">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Revised Estimated Budget</span>
                <p className="text-sm font-extrabold text-yellow-400 mt-1">₹{project.revisedBudgetCr.toLocaleString()} Cr</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHY: Causal Drivers Analysis (Top 3 Active Risk Drivers) */}
      <div className="dark-dashboard-card p-6">
        <h2 className="text-sm font-extrabold text-white font-outfit uppercase tracking-wide flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#f8880f]" />
          <span>Why Is This Project Risky? (Causal SHAP Drivers Analysis)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {project.topRiskDrivers.map((driver, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#182238] border border-[#283654] space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase">
                  Driver #{idx + 1}
                </span>
                <span className="text-xs font-mono font-bold text-red-400">
                  SHAP: +{driver.shapContribution.toFixed(2)}
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-white">{driver.driver}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{driver.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
