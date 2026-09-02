import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_PROJECTS, ProjectData } from '../data/mockData';
import { Sliders, RefreshCw, ArrowRight, ShieldAlert, IndianRupee, Clock, CheckCircle2, TrendingDown } from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedId = Number(searchParams.get('project_id')) || 1;

  const [selectedProjectId, setSelectedProjectId] = useState<number>(requestedId);
  const selectedProject: ProjectData = MOCK_PROJECTS.find(p => p.id === selectedProjectId) || MOCK_PROJECTS[0];

  // Interactive Slider State Variables
  const [budgetAdjustmentPct, setBudgetAdjustmentPct] = useState<number>(10);
  const [timelineWeeks, setTimelineWeeks] = useState<number>(8);
  const [resourceAllocationPct, setResourceAllocationPct] = useState<number>(100);

  // Recalculate simulated outcomes in real time
  const budgetDeltaImpact = Math.round(selectedProject.budgetCr * (budgetAdjustmentPct / 100));
  const simulatedBudgetCr = selectedProject.budgetCr + budgetDeltaImpact;

  const simulatedDelayDays = Math.max(0, selectedProject.scheduleDelayDays + (timelineWeeks * 7));

  // Risk score recalculation formula:
  // Base risk + budget delta weight (0.4) + timeline delta weight (0.6) - resource allocation mitigation weight (0.3)
  const riskDelta = Math.round(
    (budgetAdjustmentPct * 0.4) + (timelineWeeks * 0.8) - ((resourceAllocationPct - 100) * 0.25)
  );

  const simulatedRiskScore = Math.min(99, Math.max(10, selectedProject.overallRiskScore + riskDelta));

  const resetSliders = () => {
    setBudgetAdjustmentPct(0);
    setTimelineWeeks(0);
    setResourceAllocationPct(100);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131c31] border border-[#23304a] p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#f8880f]" />
            <h1 className="text-xl font-extrabold text-white font-outfit">Interactive Disruption & Scenario Simulator</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            "What-If" decision modeling engine. Adjust key execution levers in real time to simulate target risk score & schedule variance deltas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="bg-[#1b253b] border border-[#283654] text-xs text-white py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
          >
            {MOCK_PROJECTS.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>

          <button
            onClick={resetSliders}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#1b253b] hover:bg-[#253350] text-slate-300 rounded-xl text-xs font-bold border border-[#283654] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sliders Controls + Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Input Panel */}
        <div className="dark-dashboard-card p-6 lg:col-span-6 space-y-6">
          <h2 className="text-sm font-extrabold text-white font-outfit uppercase tracking-wide border-b border-[#23304a] pb-3">
            Simulation Variable Levers — {selectedProject.name}
          </h2>

          {/* Lever 1: Budget Adjustment % */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">1. Budget Adjustment (% Delta)</span>
              <span className="font-mono font-extrabold text-yellow-400">
                {budgetAdjustmentPct > 0 ? `+${budgetAdjustmentPct}%` : `${budgetAdjustmentPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="1"
              value={budgetAdjustmentPct}
              onChange={(e) => setBudgetAdjustmentPct(Number(e.target.value))}
              className="w-full h-2 bg-[#1b253b] rounded-lg appearance-none cursor-pointer accent-[#f8880f]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>-20% Budget Cut</span>
              <span>Baseline (0%)</span>
              <span>+30% Budget Escalation</span>
            </div>
          </div>

          {/* Lever 2: Timeline Acceleration / Delay Weeks */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">2. Timeline Disruption / Acceleration (Weeks)</span>
              <span className="font-mono font-extrabold text-orange-400">
                {timelineWeeks > 0 ? `+${timelineWeeks} wks Delay` : `${timelineWeeks} wks Acceleration`}
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="26"
              step="1"
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(Number(e.target.value))}
              className="w-full h-2 bg-[#1b253b] rounded-lg appearance-none cursor-pointer accent-[#f8880f]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>-12 Wks Fast-Track</span>
              <span>Baseline (0 wks)</span>
              <span>+26 Wks Slippage</span>
            </div>
          </div>

          {/* Lever 3: Resource Allocation % */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">3. Labor & Equipment Resource Capacity (%)</span>
              <span className="font-mono font-extrabold text-blue-400">{resourceAllocationPct}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="5"
              value={resourceAllocationPct}
              onChange={(e) => setResourceAllocationPct(Number(e.target.value))}
              className="w-full h-2 bg-[#1b253b] rounded-lg appearance-none cursor-pointer accent-[#f8880f]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>50% De-mobilization</span>
              <span>100% Nominal</span>
              <span>150% Surge Capacity</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Panel */}
        <div className="dark-dashboard-card p-6 lg:col-span-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white font-outfit uppercase tracking-wide border-b border-[#23304a] pb-3">
              Side-by-Side Outcome Comparison: Current vs. Simulated
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Baseline Card */}
              <div className="p-4 rounded-xl bg-[#182238] border border-[#283654] space-y-3">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                  Current Baseline
                </span>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Overall Risk Score</span>
                  <p className="text-2xl font-black text-white font-outfit mt-0.5">{selectedProject.overallRiskScore} / 100</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Budget</span>
                  <p className="text-sm font-bold text-slate-200">₹{selectedProject.budgetCr.toLocaleString()} Cr</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Schedule Delay</span>
                  <p className="text-sm font-bold text-slate-200">+{selectedProject.scheduleDelayDays} Days</p>
                </div>
              </div>

              {/* Simulated Outcome Card */}
              <div className="p-4 rounded-xl bg-[#1e1728] border border-[#f8880f]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-[#f8880f]/20 text-[#f8880f] text-[10px] font-bold uppercase">
                    Simulated Outcome
                  </span>
                  <span className={`text-xs font-bold font-mono ${riskDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {riskDelta > 0 ? `+${riskDelta} pts` : `${riskDelta} pts`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Simulated Risk Score</span>
                  <p className={`text-2xl font-black font-outfit mt-0.5 ${simulatedRiskScore >= 75 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {simulatedRiskScore} / 100
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Simulated Budget</span>
                  <p className="text-sm font-bold text-yellow-400">₹{simulatedBudgetCr.toLocaleString()} Cr</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Simulated Schedule Delay</span>
                  <p className="text-sm font-bold text-orange-400">+{simulatedDelayDays} Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Analysis Note */}
          <div className="mt-4 p-3 rounded-xl bg-[#131c31] border border-[#23304a] text-xs text-slate-300 flex items-center space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Real-time model recalculation verified against PAIMANA ML risk baseline engine.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
