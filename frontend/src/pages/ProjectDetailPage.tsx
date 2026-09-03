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
  Sliders,
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
    queryFn: () => api.getProjectById(id || '101'),
    enabled: Boolean(id),
  });

  if (isLoading || !project) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading Project Intelligence...
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 75 || score > 0.75) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', fill: '#ef4444', label: 'HIGH RISK' };
    if (score >= 50) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', fill: '#f97316', label: 'AT RISK' };
    if (score >= 35) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', fill: '#eab308', label: 'MODERATE' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', fill: '#10b981', label: 'ACTIVE' };
  };

  const overallColor = getRiskColor(project.overallRiskScore);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-6 text-slate-800">
      {/* Header & Back Button */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center space-x-1.5 text-xs text-[#0d52ce] hover:underline font-bold mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Explorer</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-slate-900">{project.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${overallColor.bg} ${overallColor.text} border ${overallColor.border}`}>
              {overallColor.label} ({project.overallRiskScore})
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {project.code} • {project.ministry} • {project.sector} • State: {project.state}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate(`/scenarios?project_id=${project.id}`)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#0d52ce] hover:bg-[#0b45ad] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0d52ce]/20 transition"
          >
            <Sliders className="w-4 h-4" />
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* Risk Metrics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Risk Score */}
        <div className="light-card p-5 border-l-4 border-l-red-500 bg-red-50/20 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Risk Index</span>
          <div className="mt-3">
            <h2 className="text-3xl font-black text-red-600 font-sans">{project.overallRiskScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></h2>
            <p className="text-xs text-slate-700 font-semibold mt-1">Status: {project.status}</p>
          </div>
        </div>

        {/* Sub-Risk: Cost Risk */}
        <div className="light-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cost Risk Score</span>
            <IndianRupee className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">{project.costRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span></h3>
            <p className="text-xs text-orange-600 font-bold mt-1">+{project.costOverrunPct}% Cost Overrun</p>
          </div>
        </div>

        {/* Sub-Risk: Delay Risk */}
        <div className="light-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Schedule Delay Risk</span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">{project.delayRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span></h3>
            <p className="text-xs text-red-600 font-bold mt-1">+{project.scheduleDelayDays} Days Delay</p>
          </div>
        </div>

        {/* Sub-Risk: Execution Risk */}
        <div className="light-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Execution Risk</span>
            <ShieldAlert className="w-4 h-4 text-[#0d52ce]" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">{project.executionRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span></h3>
            <p className="text-xs text-[#0d52ce] font-bold mt-1">Physical Progress Divergence</p>
          </div>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Trajectory Line Chart */}
        <div className="light-card p-5 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0d52ce]" />
                <span>12-Month Risk Score Trajectory</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-bold border border-red-200">
                Accelerating Risk (+30 pts)
              </span>
            </div>

            <div className="mt-6 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={project.monthlyRiskHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Current Trajectory Status: <strong className="text-red-600">High Deterioration Rate</strong></span>
            <span className="text-[11px] text-slate-400 font-medium">Updated April 2026</span>
          </div>
        </div>

        {/* Forecast & Early Warning Card */}
        <div className="light-card p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Completion Forecast & Early Warning</span>
            </h2>

            {/* Early Warning Lead Time Highlight */}
            <div className="mt-4 p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Early Warning Lead Time</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  Detected <strong className="text-orange-600 font-extrabold">{project.earlyWarningLeadMonths} months</strong> prior to baseline delay
                </p>
              </div>
            </div>

            {/* Completion Dates Side-by-Side */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Baseline Target</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{project.plannedCompletionDate}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Forecast Completion</span>
                <p className="text-sm font-bold text-red-600 mt-1">{project.forecastCompletionDate}</p>
              </div>
            </div>

            {/* Budget Variance */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Original Budget</span>
                <p className="text-sm font-bold text-slate-900 mt-1">₹{project.budgetCr.toLocaleString()} Cr</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Revised Estimated</span>
                <p className="text-sm font-bold text-orange-600 mt-1">₹{project.revisedBudgetCr.toLocaleString()} Cr</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHY: Causal Drivers Analysis (Top 3 Active Risk Drivers) */}
      <div className="light-card p-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#0d52ce]" />
          <span>Why Is This Project Risky? (Causal SHAP Drivers Analysis)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {project.topRiskDrivers.map((driver, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase">
                  Driver #{idx + 1}
                </span>
                <span className="text-xs font-mono font-bold text-red-600">
                  SHAP: +{driver.shapContribution.toFixed(2)}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{driver.driver}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{driver.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
