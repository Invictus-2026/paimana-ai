import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS } from '../data/mockData';
import {
  RefreshCw,
  ArrowRight,
  Clock,
  IndianRupee,
  Layers,
  CheckCircle2,
  Info,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  PageContainer
} from '../components/ui';

export const ScenariosPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedProjectId = searchParams.get('project_id') || '101';

  const project = MOCK_PROJECTS.find(p => p.id === parseInt(selectedProjectId)) || MOCK_PROJECTS[0];

  // 3 Scenario Levers
  const [costAdjPct, setCostAdjPct] = useState<number>(15);       // -20% to +50%
  const [scheduleDelayDays, setScheduleDelayDays] = useState<number>(120); // -60d to +360d
  const [resourceCapacityPct, setResourceCapacityPct] = useState<number>(85); // 50% to 150%
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time calculation of simulated risk score
  const baseScore = project.overallRiskScore;
  const costImpact = Math.round(costAdjPct * 0.4);
  const delayImpact = Math.round((scheduleDelayDays / 30) * 2.2);
  const resourceImpact = Math.round((100 - resourceCapacityPct) * 0.3);

  const simulatedScore = Math.min(100, Math.max(10, baseScore + costImpact + delayImpact + resourceImpact));
  const scoreDelta = simulatedScore - baseScore;

  // Financial calculations
  const baselineCostCr = project.revisedBudgetCr;
  const scenarioCostCr = Math.round(baselineCostCr * (1 + costAdjPct / 100));
  const costDifferenceCr = scenarioCostCr - baselineCostCr;

  // Schedule calculations
  const baselineDelayDays = project.scheduleDelayDays;
  const scenarioDelayDays = Math.max(0, baselineDelayDays + scheduleDelayDays);

  // Scenario comparison chart data
  const comparisonData = [
    {
      metric: 'Risk Score',
      baseline: baseScore,
      scenario: simulatedScore,
      unit: ' / 100'
    },
    {
      metric: 'Cost Exposure',
      baseline: Math.round(baselineCostCr / 100), // In hundred Cr for scale
      scenario: Math.round(scenarioCostCr / 100),
      unit: ' ×100 Cr'
    },
    {
      metric: 'Timeline Delay',
      baseline: baselineDelayDays,
      scenario: scenarioDelayDays,
      unit: ' Days'
    },
    {
      metric: 'Resource Cap.',
      baseline: 100,
      scenario: resourceCapacityPct,
      unit: '%'
    }
  ];

  // Preset scenarios handler
  const handleApplyPreset = (name: string, cost: number, delay: number, resource: number) => {
    setActivePreset(name);
    setCostAdjPct(cost);
    setScheduleDelayDays(delay);
    setResourceCapacityPct(resource);
    setToastMessage(`Applied scenario preset: "${name}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetSliders = () => {
    setActivePreset(null);
    setCostAdjPct(0);
    setScheduleDelayDays(0);
    setResourceCapacityPct(100);
    setToastMessage('Reset scenario levers to observed project baseline');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectProject = (id: number) => {
    setSearchParams({ project_id: id.toString() });
  };

  const handleCreateIntervention = () => {
    setToastMessage(`Draft Ministerial Intervention created for ${project.code} based on simulated +${scoreDelta} pts risk shock.`);
    setTimeout(() => {
      setToastMessage(null);
      navigate('/interventions');
    }, 2500);
  };

  return (
    <PageContainer breadcrumb="FORECASTING & SCENARIO LAB">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-8 z-50 bg-[#0b172a] text-white px-4 py-2.5 rounded-xl shadow-xl border border-blue-500/50 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER: FORECASTING & SCENARIO LAB                                        */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-gradient-to-r from-white via-slate-50 to-blue-50/20 border border-slate-200/90 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Predictive Simulation Engine
            </span>
            <span className="text-[10px] text-slate-400 font-mono">• Multi-Variable Stress Test</span>
          </div>
          <h1 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight font-heading mt-1">
            Forecasting & Scenario Lab
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Explore how changes in budget, schedule and resource availability may affect project risk trajectory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Target Project Dropdown */}
          <div className="flex items-center space-x-2 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Target Project:</span>
            <select
              value={project.id}
              onChange={(e) => handleSelectProject(parseInt(e.target.value))}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {MOCK_PROJECTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetSliders}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Levers</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCENARIO PRESETS BAR                                                      */}
      {/* ========================================================================= */}
      <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>One-Click Policy & Disruption Presets</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Select to simulate standardized shocks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { name: 'Normal Operations', cost: 0, delay: 0, res: 100, desc: 'Statutory Baseline' },
            { name: 'Budget Stress', cost: 25, delay: 30, res: 90, desc: '+25% Cost Shock' },
            { name: 'Monsoon Delay', cost: 5, delay: 90, res: 70, desc: '+3 Mo Site Stoppage' },
            { name: 'Resource Shortage', cost: 10, delay: 60, res: 60, desc: 'Labor/Machinery Deficit' },
            { name: 'Major Schedule Slippage', cost: 15, delay: 180, res: 80, desc: '+6 Mo Critical Path' },
            { name: 'Cost Escalation', cost: 35, delay: 45, res: 95, desc: 'Contractor Variation Claims' }
          ].map((preset) => {
            const isSelected = activePreset === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset.name, preset.cost, preset.delay, preset.res)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50 border-[#0d52ce] shadow-2xs text-[#0d52ce]'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <p className="text-xs font-bold truncate">{preset.name}</p>
                <span className="text-[10px] text-slate-400 mt-0.5 font-mono">{preset.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN WORKBENCH: LEVERS (7 COLS) & OUTCOME CONSOLE (5 COLS)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 3 Scenario Controls with Elegant Sliders (7 Cols) */}
        <div className="lg:col-span-7 command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Scenario Parameters
                </span>
                <span className="text-[10px] text-slate-400 font-mono">• Interactive Stress Controls</span>
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight font-heading mt-0.5">
                Simulation Levers for {project.name}
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-[#0d52ce] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              {project.code}
            </span>
          </div>

          {/* Lever 1: Budget Shock */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-orange-600" />
                  <span>Budget Variance (Cost Shock)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Model material escalation, unbudgeted civil claims, or contingency savings
                </span>
              </div>
              <span className={`text-base font-black font-mono px-3 py-1 rounded-xl border ${
                costAdjPct > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                costAdjPct < 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {costAdjPct > 0 ? `+${costAdjPct}%` : `${costAdjPct}%`}
              </span>
            </div>

            <input
              type="range"
              min="-20"
              max="50"
              step="5"
              value={costAdjPct}
              onChange={(e) => {
                setCostAdjPct(parseInt(e.target.value));
                setActivePreset(null);
              }}
              className="w-full accent-[#0d52ce] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>-20% (Contingency Recovery)</span>
              <span>0% (Baseline)</span>
              <span>+50% (Severe Escalation)</span>
            </div>
          </div>

          {/* Lever 2: Schedule Slippage */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Schedule Slippage (Timeline Shock)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Simulate land acquisition hold-ups, environmental clearances, or weather delays
                </span>
              </div>
              <span className={`text-base font-black font-mono px-3 py-1 rounded-xl border ${
                scheduleDelayDays > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                scheduleDelayDays < 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {scheduleDelayDays > 0 ? `+${scheduleDelayDays} Days` : `${scheduleDelayDays} Days`}
              </span>
            </div>

            <input
              type="range"
              min="-60"
              max="360"
              step="15"
              value={scheduleDelayDays}
              onChange={(e) => {
                setScheduleDelayDays(parseInt(e.target.value));
                setActivePreset(null);
              }}
              className="w-full accent-[#0d52ce] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>-60d (Fast-tracked)</span>
              <span>0d (Baseline)</span>
              <span>+360d (+1 Year Slippage)</span>
            </div>
          </div>

          {/* Lever 3: Resources (Labor & Machinery Capacity) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0d52ce]" />
                  <span>Resource Capacity (Labour & Machinery)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Adjust active equipment mobilization, shift staffing, and specialized crane availability
                </span>
              </div>
              <span className={`text-base font-black font-mono px-3 py-1 rounded-xl border ${
                resourceCapacityPct < 100 ? 'bg-red-50 text-red-700 border-red-200' :
                resourceCapacityPct > 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {resourceCapacityPct}%
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="150"
              step="5"
              value={resourceCapacityPct}
              onChange={(e) => {
                setResourceCapacityPct(parseInt(e.target.value));
                setActivePreset(null);
              }}
              className="w-full accent-[#0d52ce] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>50% (Acute Deficit)</span>
              <span>100% (Standard Norm)</span>
              <span>150% (Surge Mobilization)</span>
            </div>
          </div>
        </div>

        {/* Right: Outcome Console (Baseline vs Scenario vs Change) (5 Cols) */}
        <div className="lg:col-span-5 command-panel p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Predictive Outcome Console
              </span>
              <span className="text-[10px] font-mono text-slate-400">Calculated Stress Result</span>
            </div>

            {/* Large Baseline vs Scenario vs Change Strip */}
            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-xl bg-slate-900 text-white shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Baseline</span>
                <p className="text-2xl font-black font-heading text-slate-200">
                  {baseScore}
                </p>
                <span className="text-[9px] text-slate-400 font-mono">Observed</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Scenario</span>
                <p className="text-2xl font-black font-heading text-white">
                  {simulatedScore}
                </p>
                <span className="text-[9px] text-slate-400 font-mono">Simulated</span>
              </div>

              <div className="space-y-0.5 border-l border-slate-700 pl-2.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Change</span>
                <p className={`text-2xl font-black font-heading font-mono ${
                  scoreDelta > 0 ? 'text-red-400' : scoreDelta < 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                </p>
                <span className="text-[9px] text-slate-400 font-mono">Points</span>
              </div>
            </div>

            {/* 3 Impact Cards */}
            <div className="space-y-2.5">
              {/* Cost Impact */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Cost Impact</span>
                  <p className="text-sm font-bold text-slate-900">
                    {costDifferenceCr >= 0 ? `+₹${costDifferenceCr.toLocaleString('en-IN')} Cr` : `-₹${Math.abs(costDifferenceCr).toLocaleString('en-IN')} Cr`}
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-500">Projected:</span>
                  <p className="font-bold text-slate-900">₹{scenarioCostCr.toLocaleString('en-IN')} Cr</p>
                </div>
              </div>

              {/* Schedule Impact */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Schedule Impact</span>
                  <p className="text-sm font-bold text-slate-900">
                    {scheduleDelayDays >= 0 ? `+${scheduleDelayDays} Days` : `${scheduleDelayDays} Days`}
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-500">Total Slippage:</span>
                  <p className="font-bold text-slate-900">+{scenarioDelayDays} Days</p>
                </div>
              </div>

              {/* Risk Change */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Escalation Probability</span>
                  <p className="text-sm font-bold text-red-600">
                    {simulatedScore >= 85 ? 'Critical (88%)' : simulatedScore >= 70 ? 'High (64%)' : 'Moderate (32%)'}
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-500">Variance:</span>
                  <p className="font-bold text-red-600">{scoreDelta >= 0 ? `+${(scoreDelta * 0.9).toFixed(1)}%` : `${(scoreDelta * 0.9).toFixed(1)}%`}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleCreateIntervention}
            className="w-full py-3 px-4 rounded-xl bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <span>Create Ministerial Intervention</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCENARIO COMPARISON (BEFORE / AFTER VISUALIZATION)                         */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Comparative Variance Matrix
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• Baseline vs Scenario</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-1">
              Before vs After Multi-Factor Profile
            </h2>
          </div>

          <div className="flex items-center space-x-4 text-xs font-bold font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-slate-400" />
              <span>Baseline</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-[#0d52ce]" />
              <span>Simulated Scenario</span>
            </div>
          </div>
        </div>

        {/* Comparison Dual-Bar Chart */}
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-[#0b172a] text-white rounded-xl shadow-xl text-xs space-y-1 font-mono border border-slate-700">
                        <p className="font-bold text-slate-200">{data.metric}</p>
                        <p className="text-slate-400">Baseline: {data.baseline}{data.unit}</p>
                        <p className="text-blue-400 font-bold">Simulated: {data.scenario}{data.unit}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="scenario" fill="#0d52ce" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#0d52ce] shrink-0" />
          <p className="leading-relaxed">
            <strong>Policy Simulation Caveat:</strong> Scenario modifications represent assumptions used to evaluate potential risk trajectory changes. They are not forecasts of actual outcomes. All operational interventions must be validated by the respective Project Steering Committee.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DECISION SUMMARY (BOTTOM STRIP)                                           */}
      {/* ========================================================================= */}
      <div className="command-panel p-5 bg-gradient-to-r from-slate-900 to-[#0b172a] text-white border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              Decision Impact
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Synthesis Engine</span>
          </div>
          <p className="text-sm font-bold text-white">
            {scoreDelta > 0
              ? `Simulated conditions increase portfolio risk by +${scoreDelta} points (${baseScore} → ${simulatedScore}).`
              : `Simulated interventions reduce portfolio risk by ${Math.abs(scoreDelta)} points (${baseScore} → ${simulatedScore}).`}
          </p>
          <p className="text-xs text-slate-400">
            Primary driver: <strong className="text-slate-200">{scheduleDelayDays > 60 ? 'Critical Path Schedule Slippage' : 'Civil Cost Variation'}</strong> • Suggested response: <span className="text-blue-300">Increase deployment capacity / accelerate inter-ministerial milestone review.</span>
          </p>
        </div>

        <button
          onClick={handleCreateIntervention}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shrink-0 flex items-center space-x-2 cursor-pointer"
        >
          <span>Create Intervention</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </PageContainer>
  );
};
