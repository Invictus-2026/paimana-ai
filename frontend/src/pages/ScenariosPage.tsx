import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_PROJECTS } from '../data/mockData';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Sliders, RefreshCw } from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedProjectId = searchParams.get('project_id') || '101';

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });
  const project = projects.find(p => p.id === parseInt(selectedProjectId)) || projects[0] || MOCK_PROJECTS[0];

  const [costAdjPct, setCostAdjPct] = useState<number>(10);
  const [scheduleDelayWeeks, setScheduleDelayWeeks] = useState<number>(12);
  const [laborCapacityPct, setLaborCapacityPct] = useState<number>(85);

  // Real-time calculation of simulated risk score
  const baseScore = project.overallRiskScore;
  const costImpact = Math.round(costAdjPct * 0.45);
  const delayImpact = Math.round((scheduleDelayWeeks / 4) * 3.5);
  const laborImpact = Math.round((100 - laborCapacityPct) * 0.25);

  const simulatedScore = Math.min(100, Math.max(10, baseScore + costImpact + delayImpact + laborImpact));
  const scoreDelta = simulatedScore - baseScore;

  const resetSliders = () => {
    setCostAdjPct(0);
    setScheduleDelayWeeks(0);
    setLaborCapacityPct(100);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans pb-6">
      {/* Header Banner */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#0d52ce]" />
            <h1 className="text-xl font-bold text-slate-900">What-If Risk Scenario Simulator</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Interactively simulate project condition changes (budget shifts, schedule delays, resource shortages) to model predictive risk outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs font-bold text-[#0d52ce] bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200">
            Selected: {project.name} ({project.code})
          </span>
          <button
            onClick={resetSliders}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Levers</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disruption Levers (7 Cols) */}
        <div className="light-card p-6 lg:col-span-7 space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
            Adjust Disruption Parameters
          </h2>

          {/* Lever 1: Budget Adjustment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Budget Escalation / Cuts (%)</span>
              <span className="font-mono font-bold text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {costAdjPct > 0 ? `+${costAdjPct}%` : `${costAdjPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="40"
              value={costAdjPct}
              onChange={(e) => setCostAdjPct(parseInt(e.target.value))}
              className="w-full accent-[#0d52ce] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>-20% Budget Cut</span>
              <span>Baseline (0%)</span>
              <span>+40% Cost Escalation</span>
            </div>
          </div>

          {/* Lever 2: Schedule Delay */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Schedule Slippage (Weeks)</span>
              <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                +{scheduleDelayWeeks} Weeks
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="52"
              value={scheduleDelayWeeks}
              onChange={(e) => setScheduleDelayWeeks(parseInt(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>On Schedule (0 wks)</span>
              <span>+26 Weeks</span>
              <span>+52 Weeks (1 Year Delay)</span>
            </div>
          </div>

          {/* Lever 3: Labor & Equipment Capacity */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Labor & Heavy Machinery Deployment (%)</span>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {laborCapacityPct}% Capacity
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              value={laborCapacityPct}
              onChange={(e) => setLaborCapacityPct(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>40% Severe Shortage</span>
              <span>100% Full Capacity</span>
              <span>150% Mobilized Boost</span>
            </div>
          </div>
        </div>

        {/* Real-time Simulated Outcome (5 Cols) */}
        <div className="light-card p-6 lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
              Simulated Predictive Impact
            </h2>

            <div className="space-y-4 mt-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Simulated Risk Score</span>
                  <h3 className="text-3xl font-black text-red-600 mt-1 font-sans">
                    {simulatedScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Score Delta</span>
                  <p className={`text-lg font-black mt-1 ${scoreDelta >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {scoreDelta >= 0 ? `+${scoreDelta} pts` : `${scoreDelta} pts`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Baseline Score</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{baseScore} / 100</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Cost Impact</span>
                  <p className="text-xl font-black text-orange-600 mt-1">₹{Math.round(project.budgetCr * (1 + costAdjPct / 100)).toLocaleString()} Cr</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs font-medium text-slate-800 space-y-1">
            <span className="font-bold text-[#0d52ce]">Scenario Note:</span>
            <p className="leading-snug text-slate-700">
              Modifications represent what-if assumptions to evaluate risk trajectory shifts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
