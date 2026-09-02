import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Sparkles, ArrowRight, Layers, ShieldAlert, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import { MOCK_PROJECTS } from '../data/mockData';

interface CopilotResponse {
  query: string;
  summary: string;
  kpis: { label: string; value: string; color: string }[];
  tableProjects: typeof MOCK_PROJECTS;
  suggestedAction: { label: string; path: string };
}

export const CopilotPage: React.FC = () => {
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState<string>('');
  const [activeResponse, setActiveResponse] = useState<CopilotResponse | null>({
    query: 'Which projects are at risk of missing monsoon deadlines?',
    summary: 'Identified 4 mega infrastructure projects in coastal & alpine terrain (Maharashtra, J&K, Arunachal Pradesh) with un-cleared earthworks and slope stabilization pending prior to heavy rainfall.',
    kpis: [
      { label: 'Projects Flagged', value: '4 Projects', color: 'text-red-400' },
      { label: 'Total Value at Risk', value: '₹121,000 Cr', color: 'text-yellow-400' },
      { label: 'Avg Schedule Slippage', value: '236 Days', color: 'text-orange-400' },
    ],
    tableProjects: MOCK_PROJECTS.filter(p => [1, 4, 5, 14].includes(p.id)),
    suggestedAction: { label: 'Open Intervention Panel for Critical Monsoon Projects', path: '/interventions' },
  });

  const promptChips = [
    'Which projects are at risk of missing monsoon deadlines?',
    'Show me cost overruns by ministry',
    'Identify high risk railway projects in Maharashtra',
    'List projects with >200 days schedule delay',
  ];

  const handleRunQuery = (queryText: string) => {
    setInputQuery(queryText);
    const qLower = queryText.toLowerCase();

    if (qLower.includes('cost overrun') || qLower.includes('ministry')) {
      setActiveResponse({
        query: queryText,
        summary: 'Analyzed portfolio cost overruns across all 22 line ministries. Ministry of Jal Shakti and Ministry of Railways exhibit the highest cumulative budget variance.',
        kpis: [
          { label: 'Total Portfolio Budget Variance', value: '₹56,470 Cr', color: 'text-red-400' },
          { label: 'Highest Overrun Ministry', value: 'Jal Shakti (+31.0%)', color: 'text-yellow-400' },
          { label: 'Projects Exceeding Budget', value: '8 Projects', color: 'text-orange-400' },
        ],
        tableProjects: MOCK_PROJECTS.filter(p => p.costOverrunPct >= 14),
        suggestedAction: { label: 'View All Cost Overrun Projects in Explorer', path: '/projects?costOverrun=high' }
      });
    } else if (qLower.includes('railway') || qLower.includes('maharashtra')) {
      setActiveResponse({
        query: queryText,
        summary: 'Filtered 5 high-impact railway & urban transit corridors in Maharashtra and Western alignment with active ROW bottlenecks and pier launching delays.',
        kpis: [
          { label: 'Matched Projects', value: '3 Projects', color: 'text-blue-400' },
          { label: 'Avg Risk Index', value: '64 / 100', color: 'text-[#f8880f]' },
          { label: 'Pending ROW Land', value: ' Palghar & Hinjewadi', color: 'text-[#3b82f6]' },
        ],
        tableProjects: MOCK_PROJECTS.filter(p => [1, 7, 11].includes(p.id)),
        suggestedAction: { label: 'Simulate ROW Clearance Disruption', path: '/scenarios?project_id=1' }
      });
    } else {
      setActiveResponse({
        query: queryText,
        summary: `Computed spatial & temporal predictive risk vectors for "${queryText}". Found ${MOCK_PROJECTS.filter(p => p.overallRiskScore >= 70).length} critical projects requiring immediate ministerial attention.`,
        kpis: [
          { label: 'Critical Risk Items', value: '5 Projects', color: 'text-red-400' },
          { label: 'Portfolio Risk Score', value: '76 / 100', color: 'text-orange-400' },
          { label: 'Forecast Lead Time', value: '4.8 Months', color: 'text-emerald-400' },
        ],
        tableProjects: MOCK_PROJECTS.filter(p => p.overallRiskScore >= 70),
        suggestedAction: { label: 'Review Priority Interventions', path: '/interventions' }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131c31] border border-[#23304a] p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#f8880f]" />
            <h1 className="text-xl font-extrabold text-white font-outfit">Copilot AI Insight Engine</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Natural language decision intelligence. Query the entire national project monitoring database using conversational English.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>PAIMANA LLM Assistant v2.4 Active</span>
        </div>
      </div>

      {/* Query Bar & Prompt Chips */}
      <div className="dark-dashboard-card p-5 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputQuery) handleRunQuery(inputQuery);
          }}
          className="flex items-center space-x-3"
        >
          <div className="relative flex-1">
            <Bot className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask Copilot (e.g., 'Which projects are at risk of missing monsoon deadlines?')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full bg-[#1b253b] border border-[#283654] text-xs text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-3 bg-[#f8880f] hover:bg-[#e0770b] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-[#f8880f]/20 shrink-0"
          >
            <span>Ask Copilot</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Suggested Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suggested Prompts:</span>
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleRunQuery(chip)}
              className="px-3 py-1 rounded-lg bg-[#182238] hover:bg-[#202d4a] text-slate-300 border border-[#283654] text-xs font-semibold transition"
            >
              "{chip}"
            </button>
          ))}
        </div>
      </div>

      {/* Structured Copilot Answer Response */}
      {activeResponse && (
        <div className="dark-dashboard-card p-6 space-y-6 border-l-4 border-l-[#f8880f]">
          {/* Query Summary Box */}
          <div className="space-y-2 border-b border-[#23304a] pb-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-blue-400">
              <Bot className="w-4 h-4" />
              <span>Query Result: "{activeResponse.query}"</span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">{activeResponse.summary}</p>
          </div>

          {/* Key KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeResponse.kpis.map((kpi, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#182238] border border-[#283654]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <p className={`text-xl font-black ${kpi.color} font-outfit mt-1`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Matched Projects Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Matched Projects Data Table:</h3>
            <div className="overflow-x-auto rounded-xl border border-[#23304a]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#10172a] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Project</th>
                    <th className="p-3">Sector & Ministry</th>
                    <th className="p-3">Risk Score</th>
                    <th className="p-3">Schedule Delay</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2b45] bg-[#131b2e]">
                  {activeResponse.tableProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1c2742]">
                      <td className="p-3 font-bold text-white">{p.name}</td>
                      <td className="p-3 text-slate-300">{p.ministry} ({p.sector})</td>
                      <td className="p-3 font-bold text-red-400">{p.overallRiskScore} / 100</td>
                      <td className="p-3 font-bold text-orange-400">+{p.scheduleDelayDays} Days</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suggested Next Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigate(activeResponse.suggestedAction.path)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
            >
              <span>{activeResponse.suggestedAction.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
