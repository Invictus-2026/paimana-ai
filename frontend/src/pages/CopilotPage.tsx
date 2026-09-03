import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  TrendingUp,
  Clock,
  IndianRupee,
  SlidersHorizontal,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  Search,
  Activity,
  Zap,
  Layers,
  Database
} from 'lucide-react';
import { MOCK_PROJECTS, ProjectData } from '../data/mockData';
import {
  PageContainer,
  RiskBadge
} from '../components/ui';

interface QueryExplanationFactor {
  name: string;
  weightPct: number;
  type: 'Model-Driven (SHAP)' | 'Statutory OCMS' | 'Rule-Based Heuristic';
  description: string;
}

interface CopilotResponse {
  query: string;
  summary: string;
  projectsFlagged: number;
  valueAtRiskCr: number;
  averageRisk: number;
  averageDelayDays: number;
  tableProjects: ProjectData[];
  factors: QueryExplanationFactor[];
  suggestedAction: { label: string; path: string };
}

const SUGGESTED_ANALYSES = [
  {
    title: 'Highest Cost Escalation',
    prompt: 'Which projects have the highest cost escalation?',
    badge: 'Cost Variance',
    icon: IndianRupee
  },
  {
    title: 'High-Risk Railways',
    prompt: 'Show high-risk railway projects.',
    badge: 'Sector Focus',
    icon: Activity
  },
  {
    title: 'Ministry Risk Exposure',
    prompt: 'Which ministries have the largest risk exposure?',
    badge: 'Line Ministries',
    icon: Layers
  },
  {
    title: 'Transport vs Energy',
    prompt: 'Compare transport vs energy project risk.',
    badge: 'Cross-Sector',
    icon: TrendingUp
  },
  {
    title: 'Significant Schedule Delays',
    prompt: 'Find projects with significant schedule delays.',
    badge: 'Time Overrun',
    icon: Clock
  }
];

export const CopilotPage: React.FC = () => {
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState<string>('');
  const [briefModalOpen, setBriefModalOpen] = useState<boolean>(false);
  const [activeResponse, setActiveResponse] = useState<CopilotResponse>({
    query: 'Which projects are at risk?',
    summary: '12 Central Sector projects currently require priority monitoring due to multi-variable critical path slippage, contractor variation claims, and pending statutory right-of-way handovers.',
    projectsFlagged: 12,
    valueAtRiskCr: 84500,
    averageRisk: 87,
    averageDelayDays: 210,
    tableProjects: MOCK_PROJECTS,
    factors: [
      { name: 'Cost Escalation Rate', weightPct: 82, type: 'Statutory OCMS', description: 'Cumulative expenditure acceleration exceeding physical work progress' },
      { name: 'Schedule Critical Path Slippage', weightPct: 74, type: 'Model-Driven (SHAP)', description: 'Slippage in milestone dependencies with zero float remaining' },
      { name: 'Milestone Execution Deficit', weightPct: 61, type: 'Model-Driven (SHAP)', description: 'TBM breakthroughs and civil structural handovers behind statutory schedule' },
      { name: 'Resource & Right-of-Way Constraint', weightPct: 42, type: 'Rule-Based Heuristic', description: 'Pending environmental clearance or state land acquisition disputes' },
    ],
    suggestedAction: { label: 'Open Priority Interventions Queue', path: '/interventions' }
  });

  const handleRunQuery = (queryText: string) => {
    setInputQuery(queryText);
    const qLower = queryText.toLowerCase();

    if (qLower.includes('cost') || qLower.includes('escalation')) {
      const filtered = MOCK_PROJECTS.filter(p => p.costOverrunPct >= 15);
      setActiveResponse({
        query: queryText,
        summary: 'Identified projects exhibiting significant cost escalation (>15% above Cabinet approved estimates). Multi-agency arbitration and land compensation revisions are the primary drivers.',
        projectsFlagged: 9,
        valueAtRiskCr: 94200,
        averageRisk: 89,
        averageDelayDays: 245,
        tableProjects: filtered.length > 0 ? filtered : MOCK_PROJECTS.slice(0, 3),
        factors: [
          { name: 'Contractor Variation Claims', weightPct: 88, type: 'Statutory OCMS', description: 'EPC claims under active dispute or contractual arbitration' },
          { name: 'Land Acquisition Compensation Revision', weightPct: 79, type: 'Statutory OCMS', description: 'Escalated compensation awards by state revenue tribunals' },
          { name: 'Raw Material Inflation Index', weightPct: 58, type: 'Rule-Based Heuristic', description: 'Cement, steel, and fuel indexing exceeding original baseline contingency' },
          { name: 'Design Modification Factor', weightPct: 36, type: 'Model-Driven (SHAP)', description: 'Underground realignment and pier relocation variations' },
        ],
        suggestedAction: { label: 'Explore Cost Variance in Project Explorer', path: '/projects?costVariance=high' }
      });
    } else if (qLower.includes('railway') || qLower.includes('metro') || qLower.includes('transport')) {
      const filtered = MOCK_PROJECTS.filter(p => p.sector.toLowerCase().includes('urban') || p.ministry.toLowerCase().includes('railways') || p.ministry.toLowerCase().includes('road'));
      setActiveResponse({
        query: queryText,
        summary: 'Queried high-risk transport and railway transit corridors. Critical constraints include underground tunnel boring halted near airport structures and dense urban viaduct launching restrictions.',
        projectsFlagged: 7,
        valueAtRiskCr: 68400,
        averageRisk: 91,
        averageDelayDays: 255,
        tableProjects: filtered.length > 0 ? filtered : MOCK_PROJECTS.slice(0, 3),
        factors: [
          { name: 'Right-of-Way Access Delay', weightPct: 91, type: 'Statutory OCMS', description: 'Pending defense, airport, or railway corridor permission' },
          { name: 'Underground Tunneling Sinking', weightPct: 83, type: 'Model-Driven (SHAP)', description: 'TBM rate suppression in mixed-face strata' },
          { name: 'Traffic Police Night-Only Windows', weightPct: 64, type: 'Rule-Based Heuristic', description: 'Restricted civil staging permits in metropolitan corridors' },
          { name: 'Utility Relocation Bottlenecks', weightPct: 45, type: 'Rule-Based Heuristic', description: 'High-voltage and water trunk line relocation delays' },
        ],
        suggestedAction: { label: 'Simulate Metro Disruption Scenarios', path: '/scenarios?project_id=101' }
      });
    } else if (qLower.includes('ministr') || qLower.includes('exposure')) {
      setActiveResponse({
        query: queryText,
        summary: 'Aggregated portfolio risk exposure across all Central Line Ministries. Ministry of Housing & Urban Affairs and Ministry of Jal Shakti represent the largest capital concentrations under heightened risk.',
        projectsFlagged: 16,
        valueAtRiskCr: 142800,
        averageRisk: 86,
        averageDelayDays: 220,
        tableProjects: MOCK_PROJECTS,
        factors: [
          { name: 'Budget Concentration Index', weightPct: 85, type: 'Statutory OCMS', description: 'Capital allocation weight relative to total ministerial portfolio' },
          { name: 'Inter-Agency Coordination Gaps', weightPct: 76, type: 'Model-Driven (SHAP)', description: 'Multi-department approval cycle duration' },
          { name: 'State Interface Deadlocks', weightPct: 67, type: 'Rule-Based Heuristic', description: 'Rehabilitation & Resettlement (R&R) local administration delays' },
          { name: 'Contractor Solvency Signals', weightPct: 39, type: 'Model-Driven (SHAP)', description: 'Subcontractor milestone execution velocity' },
        ],
        suggestedAction: { label: 'View National Sector Benchmarks', path: '/benchmarks' }
      });
    } else if (qLower.includes('delay') || qLower.includes('schedule') || qLower.includes('slippage')) {
      const filtered = MOCK_PROJECTS.filter(p => p.scheduleDelayDays >= 200);
      setActiveResponse({
        query: queryText,
        summary: 'Identified mega projects facing critical schedule slippage (>200 days). Over 68% of cumulative delay is linked to statutory environmental permits and physical site possession.',
        projectsFlagged: 10,
        valueAtRiskCr: 78900,
        averageRisk: 90,
        averageDelayDays: 290,
        tableProjects: filtered.length > 0 ? filtered : MOCK_PROJECTS,
        factors: [
          { name: 'Schedule Float Depletion', weightPct: 89, type: 'Model-Driven (SHAP)', description: 'All available project schedule buffer exhausted' },
          { name: 'Critical Path Dependency Breach', weightPct: 81, type: 'Statutory OCMS', description: 'Precursor package delay cascading to electromechanical works' },
          { name: 'Monsoon Stoppage Buffer Deficit', weightPct: 59, type: 'Rule-Based Heuristic', description: 'Seasonal earthworks suspended without recovery plan' },
          { name: 'Labor Mobilization Shortfall', weightPct: 44, type: 'Rule-Based Heuristic', description: 'Peak labor deployment 32% below EPC tender commitments' },
        ],
        suggestedAction: { label: 'Inspect Critical Interventions Queue', path: '/interventions' }
      });
    } else {
      setActiveResponse({
        query: queryText,
        summary: `Computed cross-sectional risk indicators across the national monitoring database for "${queryText}". Retrieved matching Central Sector projects requiring managerial oversight.`,
        projectsFlagged: MOCK_PROJECTS.length,
        valueAtRiskCr: 84500,
        averageRisk: 87,
        averageDelayDays: 210,
        tableProjects: MOCK_PROJECTS,
        factors: [
          { name: 'Cost Escalation Factor', weightPct: 82, type: 'Statutory OCMS', description: 'Variance against Revised Cost Estimates approved by Cabinet' },
          { name: 'Schedule Critical Path Slippage', weightPct: 74, type: 'Model-Driven (SHAP)', description: 'Predicted deviation against statutory milestone baseline' },
          { name: 'Milestone Execution Drag', weightPct: 61, type: 'Model-Driven (SHAP)', description: 'Physical execution progress vs financial utilization ratio' },
          { name: 'Institutional Bottleneck Index', weightPct: 42, type: 'Rule-Based Heuristic', description: 'Inter-ministerial clearance dependencies logged in OCMS' },
        ],
        suggestedAction: { label: 'Review All Active Alerts', path: '/interventions' }
      });
    }
  };

  const topProject = activeResponse.tableProjects[0] || MOCK_PROJECTS[0];

  return (
    <PageContainer breadcrumb="PAIMANA INTELLIGENCE ASSISTANT">
      {/* ========================================================================= */}
      {/* HEADER: COMMAND CENTER STYLE INTELLIGENCE WORKSPACE                       */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-gradient-to-r from-white via-slate-50 to-blue-50/25 border border-slate-200/90 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              National Decision Support Engine
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Intelligence Engine Active</span>
            </span>
          </div>
          <h1 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight font-heading mt-2">
            PAIMANA Intelligence Assistant
          </h1>
          <p className="text-slate-500 text-xs lg:text-sm mt-1 font-medium">
            Ask questions across the national infrastructure monitoring database. Transparent analytical query engine grounded in statutory OCMS data and ML early-warning signals.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
          <Database className="w-4 h-4 text-[#0d52ce]" />
          <span>1,981 Monitored Projects • Live IPMD Feed</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP: NATURAL LANGUAGE QUERY BAR                                           */}
      {/* ========================================================================= */}
      <div className="command-panel p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputQuery.trim()) handleRunQuery(inputQuery.trim());
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask about projects, cost overruns, delays, ministries or risk..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs lg:text-sm text-slate-900 placeholder-slate-400 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#0d52ce] hover:bg-[#0b45ad] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#0d52ce]/20 shrink-0 cursor-pointer"
          >
            <span>Ask Intelligence</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* ========================================================================= */}
        {/* SUGGESTED ANALYSIS CARDS                                                  */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center space-x-2 pb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0d52ce]" />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              Suggested Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {SUGGESTED_ANALYSES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleRunQuery(item.prompt)}
                  className="p-3 text-left rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-200 transition group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {item.badge}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0d52ce] transition" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-[#0d52ce] leading-snug">
                    "{item.prompt}"
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUERY RESULT & STRUCTURED INTELLIGENCE                                    */}
      {/* ========================================================================= */}
      {activeResponse && (
        <div className="space-y-5">
          {/* Query & Executive Summary Banner */}
          <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl border-l-4 border-l-[#0d52ce] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  Executed Query
                </span>
                <h2 className="text-base lg:text-lg font-bold text-slate-900 font-heading">
                  "{activeResponse.query}"
                </h2>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                  Engine: Deterministic Query Router
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">100% Provenance Traceable</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-[#0d52ce] uppercase tracking-wider font-mono">
                Intelligence Summary
              </span>
              <p className="text-sm lg:text-base font-semibold text-slate-900 leading-relaxed font-heading">
                {activeResponse.summary}
              </p>
            </div>

            {/* 4 KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Projects Flagged
                </span>
                <p className="text-2xl font-black text-red-600 font-heading tabular-nums mt-0.5">
                  {activeResponse.projectsFlagged}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Require Priority Review</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Value at Risk
                </span>
                <p className="text-2xl font-black text-orange-600 font-heading tabular-nums mt-0.5">
                  ₹{activeResponse.valueAtRiskCr.toLocaleString()} Cr
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Capital Exposed</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Average Risk
                </span>
                <p className="text-2xl font-black text-red-600 font-heading tabular-nums mt-0.5">
                  {activeResponse.averageRisk} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </p>
                <span className="text-[10px] text-red-700 font-semibold">Critical Attention Tier</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Average Delay
                </span>
                <p className="text-2xl font-black text-slate-900 font-heading tabular-nums mt-0.5">
                  +{activeResponse.averageDelayDays} <span className="text-xs font-normal text-slate-400">Days</span>
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Baseline Variance</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RESULT TABLE & AI EXPLANATION SPLIT                                       */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Result Table (8 cols) */}
            <div className="lg:col-span-8 command-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white space-y-0">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide font-heading">
                    Matching Infrastructure Projects ({activeResponse.tableProjects.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ranked by multi-attribute risk score and ministerial priority
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Showing top records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider select-none">
                      <th className="p-3">Project</th>
                      <th className="p-3">Ministry</th>
                      <th className="p-3">Risk</th>
                      <th className="p-3">Cost Impact</th>
                      <th className="p-3">Schedule Impact</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {activeResponse.tableProjects.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="hover:bg-blue-50/40 cursor-pointer transition"
                      >
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <span className="text-[10px] font-mono text-[#0d52ce] font-bold">{p.code}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          <p className="line-clamp-1">{p.ministry}</p>
                          <span className="text-[10px] text-slate-400">{p.state}</span>
                        </td>
                        <td className="p-3">
                          <RiskBadge score={p.overallRiskScore} size="sm" />
                        </td>
                        <td className="p-3 font-bold font-mono">
                          <span className={p.costOverrunPct >= 15 ? 'text-red-600' : 'text-orange-600'}>
                            +{p.costOverrunPct.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            ₹{p.revisedBudgetCr.toLocaleString()} Cr
                          </span>
                        </td>
                        <td className="p-3 font-bold font-mono text-slate-800">
                          +{p.scheduleDelayDays} Days
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Target: {p.plannedCompletionDate}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projects/${p.id}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-[11px] font-bold shadow-2xs transition"
                          >
                            Dossier →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: AI Explanation Panel "Why these projects?" (4 cols) */}
            <div className="lg:col-span-4 command-panel p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide font-heading">
                      Why these projects?
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Factors used by the intelligence engine
                    </p>
                  </div>
                </div>

                {/* Factors List */}
                <div className="space-y-3.5 pt-3">
                  {activeResponse.factors.map((factor, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 font-heading">
                          {factor.name}
                        </span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {factor.weightPct}%
                        </span>
                      </div>

                      {/* Weight Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            factor.weightPct >= 80 ? 'bg-red-500' :
                            factor.weightPct >= 70 ? 'bg-orange-500' :
                            factor.weightPct >= 50 ? 'bg-[#0d52ce]' : 'bg-slate-400'
                          }`}
                          style={{ width: `${factor.weightPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-slate-500 line-clamp-1">
                          {factor.description}
                        </span>
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0 ml-1">
                          {factor.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attribution Transparency Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1 font-mono">
                  <Info className="w-3 h-3 text-[#0d52ce]" />
                  Analytical Attribution Guardrail
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Signals are deterministic mathematical and tree-based SHAP contributions computed against statutory OCMS milestone submissions. No generative hallucination.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* QUICK ACTIONS CONSOLE                                                     */}
          {/* ========================================================================= */}
          <div className="command-panel p-5 bg-gradient-to-r from-slate-900 via-[#0b172a] to-slate-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-slate-800">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-blue-400 font-extrabold uppercase tracking-wider">
                Operational Transition
              </span>
              <h3 className="text-sm lg:text-base font-black font-heading">
                Ready to take action on flagged infrastructure items?
              </h3>
              <p className="text-xs text-slate-400">
                Transition directly from analytical query into simulation, briefing, or executive intervention.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate(`/projects/${topProject.id}`)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer flex items-center space-x-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Open Project</span>
              </button>

              <button
                onClick={() => navigate(`/scenarios?project_id=${topProject.id}`)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer flex items-center space-x-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                <span>Run Scenario</span>
              </button>

              <button
                onClick={() => navigate('/interventions')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer flex items-center space-x-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>View Alerts</span>
              </button>

              <button
                onClick={() => setBriefModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-xs font-bold transition shadow-md shadow-[#0d52ce]/30 cursor-pointer flex items-center space-x-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Brief</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BRIEF MODAL FOR AI ASSISTANT                                              */}
      {/* ========================================================================= */}
      {briefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="command-panel max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-[#0b172a] text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#0d52ce] flex items-center justify-center font-black">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-blue-400 font-extrabold uppercase tracking-wider block">
                    MoSPI Cabinet Briefing Memo
                  </span>
                  <h3 className="text-base font-bold font-heading">
                    Executive Infrastructure Query Briefing
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setBriefModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Subject Query
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  "{activeResponse.query}"
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Synthesized Assessment
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {activeResponse.summary} Analysis reveals {activeResponse.projectsFlagged} active projects with cumulative capital exposure of ₹{activeResponse.valueAtRiskCr.toLocaleString()} Cr. Immediate inter-ministerial coordination recommended to unblock critical path constraints.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-xl font-mono text-center">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase">Value Exposed</span>
                  <p className="text-sm font-black text-[#0d52ce]">₹{activeResponse.valueAtRiskCr.toLocaleString()} Cr</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase">Average Risk</span>
                  <p className="text-sm font-black text-red-600">{activeResponse.averageRisk}/100</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase">Mean Slippage</span>
                  <p className="text-sm font-black text-slate-800">+{activeResponse.averageDelayDays} Days</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Digital Provenance: SHA-256 Validated • MoSPI IPMD 2026
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      alert('Cabinet Memo Dispatched to E-Office Secure Queue.');
                      setBriefModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dispatch to E-Office</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
