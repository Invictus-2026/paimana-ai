import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATE_RISK_SUMMARY, StateRiskData, MOCK_PROJECTS } from '../data/mockData';
import { MapPin, ShieldAlert, ArrowRight, Layers, Sliders, CheckCircle2, TrendingUp, IndianRupee, Clock } from 'lucide-react';

export const RiskMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [riskOverlay, setRiskOverlay] = useState<'overall' | 'cost' | 'delay' | 'execution'>('overall');

  const stateData: StateRiskData = STATE_RISK_SUMMARY[selectedState] || {
    state: selectedState,
    projectCount: 5,
    totalBudgetCr: 35000,
    avgRiskScore: 55,
    criticalCount: 1,
    costRiskLevel: 'medium',
    delayRiskLevel: 'medium',
    executionRiskLevel: 'low',
  };

  const stateProjects = MOCK_PROJECTS.filter(p => p.state === selectedState);

  const getRiskColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', fill: '#ef4444' };
    if (score >= 50) return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', fill: '#f97316' };
    if (score >= 35) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', fill: '#eab308' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', fill: '#10b981' };
  };

  const indianStatesList = [
    { name: 'Maharashtra', x: 38, y: 55, r: 28 },
    { name: 'Gujarat', x: 22, y: 46, r: 24 },
    { name: 'Rajasthan', x: 26, y: 32, r: 30 },
    { name: 'Karnataka', x: 38, y: 72, r: 24 },
    { name: 'Tamil Nadu', x: 44, y: 84, r: 22 },
    { name: 'Andhra Pradesh', x: 48, y: 66, r: 24 },
    { name: 'Uttar Pradesh', x: 48, y: 32, r: 32 },
    { name: 'Jammu & Kashmir', x: 34, y: 14, r: 20 },
    { name: 'Ladakh', x: 42, y: 10, r: 20 },
    { name: 'Odisha', x: 62, y: 52, r: 22 },
    { name: 'West Bengal', x: 68, y: 44, r: 20 },
    { name: 'Arunachal Pradesh', x: 86, y: 26, r: 18 },
    { name: 'Madhya Pradesh', x: 42, y: 44, r: 28 },
    { name: 'Delhi', x: 38, y: 28, r: 14 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & Overlay Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#131c31] border border-[#23304a] p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <h1 className="text-xl font-extrabold text-white font-outfit">Geographic Risk Map — India</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Choropleth spatial analysis of aggregate project risks across states. Click any state to filter Explorer.
          </p>
        </div>

        {/* Overlay Mode Toggles */}
        <div className="flex items-center space-x-1.5 bg-[#0b101d] p-1.5 rounded-xl border border-[#23304a]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Overlay:</span>
          {(['overall', 'cost', 'delay', 'execution'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setRiskOverlay(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                riskOverlay === mode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#162035]'
              }`}
            >
              {mode === 'overall' ? 'Overall Risk' : `${mode} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map + State Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Visualizer */}
        <div className="dark-dashboard-card p-6 lg:col-span-7 flex flex-col justify-between relative overflow-hidden bg-[#0d1424]">
          <div className="flex items-center justify-between z-10">
            <h2 className="text-sm font-extrabold text-white font-outfit uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>State Risk Intensity Map</span>
            </h2>
            <div className="flex items-center space-x-3 text-[10px] text-slate-300 font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt;35)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Med (35-49)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High (50-74)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Crit (≥75)</span>
            </div>
          </div>

          {/* Map Representation Canvas */}
          <div className="my-6 relative h-96 w-full flex items-center justify-center bg-[#090e1a] rounded-xl border border-[#1e2b45] p-4">
            <svg viewBox="0 0 100 100" className="w-full h-full max-w-lg">
              {/* Background map silhouette outlines */}
              <path
                d="M 30 10 L 50 8 L 60 18 L 85 24 L 95 30 L 75 45 L 65 60 L 50 90 L 40 85 L 35 70 L 20 50 L 25 30 Z"
                fill="#131c31"
                stroke="#23304a"
                strokeWidth="0.8"
                opacity="0.6"
              />

              {/* State Interactive Nodes */}
              {indianStatesList.map((st) => {
                const summary = STATE_RISK_SUMMARY[st.name];
                let score = summary ? summary.avgRiskScore : 45;
                if (riskOverlay === 'cost') score = summary?.costRiskLevel === 'high' ? 80 : summary?.costRiskLevel === 'medium' ? 55 : 25;
                if (riskOverlay === 'delay') score = summary?.delayRiskLevel === 'high' ? 82 : summary?.delayRiskLevel === 'medium' ? 58 : 28;
                if (riskOverlay === 'execution') score = summary?.executionRiskLevel === 'high' ? 78 : summary?.executionRiskLevel === 'medium' ? 52 : 22;

                const colorInfo = getRiskColor(score);
                const isSelected = selectedState === st.name;

                return (
                  <g
                    key={st.name}
                    onClick={() => setSelectedState(st.name)}
                    className="cursor-pointer transition-all duration-200 group"
                  >
                    <circle
                      cx={st.x}
                      cy={st.y}
                      r={isSelected ? st.r / 2.2 : st.r / 2.8}
                      fill={colorInfo.fill}
                      fillOpacity={isSelected ? 0.9 : 0.65}
                      stroke={isSelected ? '#ffffff' : '#1e293b'}
                      strokeWidth={isSelected ? 1.5 : 0.8}
                      className="group-hover:scale-125 transition-transform"
                    />
                    <text
                      x={st.x}
                      y={st.y + 0.8}
                      fontSize="2.8"
                      fill="#ffffff"
                      fontWeight="bold"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {st.name.substring(0, 3).toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover instruction overlay */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[#131c31]/90 border border-[#23304a] text-[11px] text-slate-300">
              Selected State: <strong className="text-white">{selectedState}</strong> (Click node to switch)
            </div>
          </div>
        </div>

        {/* State Detail Summary Panel */}
        <div className="dark-dashboard-card p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#23304a] pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">State Deep-Dive</span>
                <h2 className="text-xl font-extrabold text-white font-outfit mt-0.5">{stateData.state}</h2>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${getRiskColor(stateData.avgRiskScore).bg}/20 ${getRiskColor(stateData.avgRiskScore).text} ${getRiskColor(stateData.avgRiskScore).border}`}>
                Risk Score: {stateData.avgRiskScore} / 100
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-[#1b253b] border border-[#283654]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Monitored Projects</span>
                <p className="text-lg font-black text-white font-outfit mt-1">{stateData.projectCount}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#1b253b] border border-[#283654]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Budget Cr</span>
                <p className="text-lg font-black text-white font-outfit mt-1">₹{stateData.totalBudgetCr.toLocaleString()} Cr</p>
              </div>

              <div className="p-3 rounded-xl bg-[#1b253b] border border-[#283654]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Critical Projects</span>
                <p className="text-lg font-black text-red-400 font-outfit mt-1">{stateData.criticalCount}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#1b253b] border border-[#283654]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Cost Risk Tier</span>
                <p className="text-sm font-extrabold text-yellow-400 capitalize mt-1">{stateData.costRiskLevel}</p>
              </div>
            </div>

            {/* State Projects List */}
            <div className="mt-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Projects in {selectedState}:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {stateProjects.length > 0 ? (
                  stateProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="p-2.5 rounded-lg bg-[#182238] hover:bg-[#202d4a] border border-[#283654] cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{p.sector} • ₹{p.budgetCr.toLocaleString()} Cr</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${getRiskColor(p.overallRiskScore).bg}/20 ${getRiskColor(p.overallRiskScore).text}`}>
                        {p.overallRiskScore}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">5 baseline regional highway and power grid expansion projects monitored in {selectedState}.</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/projects?state=${encodeURIComponent(selectedState)}`)}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition"
          >
            <span>Filter Project Explorer for {selectedState}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
