import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  MapPin,
  ArrowRight,
  ShieldAlert,
  IndianRupee,
  CheckCircle2
} from 'lucide-react';
import {
  SECTOR_DISTRIBUTION,
  DASHBOARD_STATS
} from '../data/mockData';
import {
  PageContainer,
  MetricCard
} from '../components/ui';

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer breadcrumb="PORTFOLIO ANALYTICS HUB">
      {/* Header Command Banner */}
      <div className="command-panel p-5 bg-gradient-to-r from-white via-slate-50 to-blue-50/20 border border-slate-200/90 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Cross-Sector Intelligence
            </span>
            <span className="text-[10px] text-slate-400 font-mono">• 22 Line Ministries</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight font-heading mt-1">
            National Infrastructure Portfolio Analytics Hub
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Aggregated KPI distributions, cross-sector benchmarks, and spatial econometric indicators across central projects.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => navigate('/benchmarks')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0d52ce] hover:bg-[#0b45ad] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0d52ce]/20 transition cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Open Benchmarks Matrix</span>
          </button>
        </div>
      </div>

      {/* 4 Macro Portfolio Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Portfolio Capital"
          value={DASHBOARD_STATS.revisedCost}
          subtitle="Across 1,981 central sector projects"
          icon={IndianRupee}
          accentColor="navy"
          badge="Total Outlay"
        />

        <MetricCard
          title="Cumulative Disbursement"
          value={DASHBOARD_STATS.cumulativeExpenditure}
          change={{ value: '48% Utilized', isIncreasePositive: true }}
          icon={TrendingUp}
          accentColor="blue"
        />

        <MetricCard
          title="Critical Early Warnings"
          value={DASHBOARD_STATS.highRiskProjects}
          subtitle="Projects requiring cabinet intervention"
          icon={ShieldAlert}
          accentColor="red"
          badge="Urgent"
        />

        <MetricCard
          title="Data Integrity Benchmark"
          value="96.4%"
          subtitle="OCMS statutory monthly return rate"
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* Analytics Hub Feature Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Module 1: Cross-Sector Benchmarking */}
        <div
          onClick={() => navigate('/benchmarks')}
          className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between hover:border-[#0d52ce] hover:shadow-md cursor-pointer transition group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0d52ce] flex items-center justify-center border border-blue-100 group-hover:scale-105 transition">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-[#0d52ce] transition">
                Cross-Sector Benchmarks Matrix
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Descriptive, non-evaluative comparative analytics across 22 infrastructure sectors with statistical sample size safeguard guardrails.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0d52ce]">
            <span>Explore Benchmarks</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Module 2: Spatial Econometric Risk Map */}
        <div
          onClick={() => navigate('/map')}
          className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between hover:border-[#0d52ce] hover:shadow-md cursor-pointer transition group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-105 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-orange-600 transition">
                National Spatial Risk Map
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Interactive geographic distribution of infrastructure risk across 28 states and union territories with multi-layer overlays.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
            <span>Inspect Spatial Map</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Module 3: Disruption Scenario Simulator */}
        <div
          onClick={() => navigate('/scenarios')}
          className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between hover:border-[#0d52ce] hover:shadow-md cursor-pointer transition group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-purple-600 transition">
                What-If Scenario Simulator
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Interactive parameter simulation modeling predictive risk score changes under budget shocks and schedule slippage.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Simulate Scenarios</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Sector Breakdown Grid */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Key Sector Portfolio Capital Allocations
            </h3>
            <p className="text-xs text-slate-500">
              Aggregate distribution across the top 6 national infrastructure domains
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Total: 1,981 Projects</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SECTOR_DISTRIBUTION.map((sec) => (
            <div
              key={sec.name}
              onClick={() => navigate(`/projects?sector=${encodeURIComponent(sec.name)}`)}
              className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: sec.color }} />
                <div>
                  <p className="font-bold text-xs text-slate-900">{sec.name}</p>
                  <span className="text-[10px] text-slate-400">{sec.count} Projects</span>
                </div>
              </div>
              <span className="text-xs font-black font-mono text-slate-800">
                {sec.pct}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
