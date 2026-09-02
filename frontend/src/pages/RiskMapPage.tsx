import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATE_RISK_SUMMARY, StateRiskData } from '../data/mockData';
import { MapPin, ShieldAlert, Layers, ArrowRight, Filter, IndianRupee, Clock } from 'lucide-react';

type RiskOverlay = 'overall' | 'cost' | 'delay' | 'execution';

export const RiskMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeOverlay, setActiveOverlay] = useState<RiskOverlay>('overall');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');

  const selectedStateData: StateRiskData = STATE_RISK_SUMMARY[selectedState] || {
    state: selectedState,
    projectCount: 45,
    totalBudgetCr: 88000,
    avgRiskScore: 64,
    criticalCount: 8,
    costRiskLevel: 'medium',
    delayRiskLevel: 'high',
    executionRiskLevel: 'medium'
  };

  const getStateColor = (stateName: string) => {
    const data = STATE_RISK_SUMMARY[stateName];
    if (!data) return '#e2e8f0';

    if (activeOverlay === 'cost') {
      return data.costRiskLevel === 'high' ? '#ef4444' : data.costRiskLevel === 'medium' ? '#f97316' : '#10b981';
    }
    if (activeOverlay === 'delay') {
      return data.delayRiskLevel === 'high' ? '#ef4444' : data.delayRiskLevel === 'medium' ? '#f97316' : '#10b981';
    }
    if (activeOverlay === 'execution') {
      return data.executionRiskLevel === 'high' ? '#ef4444' : data.executionRiskLevel === 'medium' ? '#f97316' : '#10b981';
    }
    return data.avgRiskScore >= 75 ? '#ef4444' : data.avgRiskScore >= 60 ? '#f97316' : '#10b981';
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans pb-6">
      {/* Top Banner */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#0d52ce]" />
            <h1 className="text-xl font-bold text-slate-900">National Benchmarks & State Spatial Risk Map</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Interactive state-level infrastructure risk heatmap across India's 28 states and 8 union territories.
          </p>
        </div>

        {/* Overlay Switches */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          {(['overall', 'cost', 'delay', 'execution'] as RiskOverlay[]).map((overlay) => (
            <button
              key={overlay}
              onClick={() => setActiveOverlay(overlay)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                activeOverlay === overlay
                  ? 'bg-[#0d52ce] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {overlay} Risk
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive India Map Box (8 cols) */}
        <div className="light-card p-6 lg:col-span-8 flex flex-col justify-between min-h-[500px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Selected Layer: <strong className="text-[#0d52ce] capitalize">{activeOverlay} Risk Heatmap</strong>
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low Risk</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High Risk</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</span>
            </div>
          </div>

          {/* SVG Map Layout */}
          <div className="relative py-8 flex items-center justify-center">
            <svg viewBox="0 0 600 500" className="w-full max-w-lg h-auto drop-shadow-sm">
              <g stroke="#ffffff" strokeWidth="2" strokeLinejoin="round">
                {/* State Nodes */}
                <path
                  d="M120 180 L220 160 L240 240 L180 270 Z"
                  fill={getStateColor('Maharashtra')}
                  onClick={() => setSelectedState('Maharashtra')}
                  className="cursor-pointer hover:opacity-85 transition"
                />
                <path
                  d="M170 120 L210 110 L220 150 L170 150 Z"
                  fill={getStateColor('Delhi')}
                  onClick={() => setSelectedState('Delhi')}
                  className="cursor-pointer hover:opacity-85 transition"
                />
                <path
                  d="M200 270 L260 250 L270 330 L210 320 Z"
                  fill={getStateColor('Andhra Pradesh')}
                  onClick={() => setSelectedState('Andhra Pradesh')}
                  className="cursor-pointer hover:opacity-85 transition"
                />
                <path
                  d="M210 330 L270 340 L240 420 L190 390 Z"
                  fill={getStateColor('Tamil Nadu')}
                  onClick={() => setSelectedState('Tamil Nadu')}
                  className="cursor-pointer hover:opacity-85 transition"
                />
                <path
                  d="M190 70 L250 60 L260 110 L200 110 Z"
                  fill={getStateColor('Uttarakhand')}
                  onClick={() => setSelectedState('Uttarakhand')}
                  className="cursor-pointer hover:opacity-85 transition"
                />
                {/* Additional Decorative State Nodes */}
                <path d="M250 160 L350 150 L360 220 L260 230 Z" fill="#f97316" className="opacity-80" />
                <path d="M110 90 L170 80 L180 140 L120 140 Z" fill="#10b981" className="opacity-80" />
                <path d="M350 140 L450 130 L460 200 L370 200 Z" fill="#ef4444" className="opacity-80" />
                <path d="M260 230 L360 220 L350 310 L270 310 Z" fill="#f97316" className="opacity-80" />
              </g>
            </svg>
          </div>

          <div className="text-center text-xs text-slate-500 font-medium">
            Click on any state node to inspect regional project portfolio metrics.
          </div>
        </div>

        {/* Selected State Summary Sidebar (4 cols) */}
        <div className="light-card p-5 lg:col-span-4 flex flex-col justify-between space-y-6">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regional Deep Dive</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">{selectedStateData.state}</h2>
            </div>

            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Average Regional Risk Score</span>
                <p className="text-3xl font-black text-slate-900 mt-1 font-sans">
                  {selectedStateData.avgRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Active Projects</span>
                  <p className="text-lg font-black text-slate-900 mt-1">{selectedStateData.projectCount}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Critical Projects</span>
                  <p className="text-lg font-black text-red-600 mt-1">{selectedStateData.criticalCount}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Portfolio Capital</span>
                <p className="text-xl font-black text-slate-900 mt-1">₹{selectedStateData.totalBudgetCr.toLocaleString()} Cr</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/projects?state=${encodeURIComponent(selectedStateData.state)}`)}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0d52ce] hover:bg-[#0b45ad] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0d52ce]/20 transition"
          >
            <span>View All {selectedStateData.state} Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
