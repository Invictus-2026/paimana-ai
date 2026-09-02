import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Sparkles, ArrowRight } from 'lucide-react';
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
      { label: 'Projects Flagged', value: '4 Projects', color: 'text-red-600' },
      { label: 'Total Value at Risk', value: '₹121,000 Cr', color: 'text-orange-600' },
      { label: 'Avg Schedule Slippage', value: '236 Days', color: 'text-amber-700' },
    ],
    tableProjects: MOCK_PROJECTS,
    suggestedAction: { label: 'Open Risk & Alerts for Critical Monsoon Projects', path: '/interventions' },
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
          { label: 'Total Portfolio Budget Variance', value: '₹56,470 Cr', color: 'text-red-600' },
          { label: 'Highest Overrun Ministry', value: 'Jal Shakti (+31.0%)', color: 'text-orange-600' },
          { label: 'Projects Exceeding Budget', value: '8 Projects', color: 'text-amber-700' },
        ],
        tableProjects: MOCK_PROJECTS.filter(p => p.costOverrunPct >= 14),
        suggestedAction: { label: 'View All Cost Overrun Projects in Explorer', path: '/projects?costOverrun=high' }
      });
    } else if (qLower.includes('railway') || qLower.includes('maharashtra')) {
      setActiveResponse({
        query: queryText,
        summary: 'Filtered 5 high-impact railway & urban transit corridors in Maharashtra and Western alignment with active ROW bottlenecks and pier launching delays.',
        kpis: [
          { label: 'Matched Projects', value: '3 Projects', color: 'text-[#0d52ce]' },
          { label: 'Avg Risk Index', value: '0.88', color: 'text-red-600' },
          { label: 'Pending ROW Land', value: 'Palghar & Hinjewadi', color: 'text-slate-800' },
        ],
        tableProjects: MOCK_PROJECTS.filter(p => p.state === 'Maharashtra' || p.ministry.includes('Railways')),
        suggestedAction: { label: 'Simulate ROW Clearance Disruption', path: '/scenarios?project_id=101' }
      });
    } else {
      setActiveResponse({
        query: queryText,
        summary: `Computed spatial & temporal predictive risk vectors for "${queryText}". Found ${MOCK_PROJECTS.length} critical projects requiring immediate ministerial attention.`,
        kpis: [
          { label: 'Critical Risk Items', value: '5 Projects', color: 'text-red-600' },
          { label: 'Portfolio Risk Score', value: '86 / 100', color: 'text-orange-600' },
          { label: 'Forecast Lead Time', value: '4.8 Months', color: 'text-emerald-600' },
        ],
        tableProjects: MOCK_PROJECTS,
        suggestedAction: { label: 'Review Priority Interventions', path: '/interventions' }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans pb-6">
      {/* Header Banner */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#0d52ce]" />
            <h1 className="text-xl font-bold text-slate-900">AI Assistant & Natural Language Query</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Natural language decision intelligence. Query the entire national project monitoring database using conversational English.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#0d52ce] font-bold shrink-0">
          <Sparkles className="w-4 h-4" />
          <span>PAIMANA LLM Assistant v2.4 Active</span>
        </div>
      </div>

      {/* Query Bar & Prompt Chips */}
      <div className="light-card p-5 space-y-4 bg-white">
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
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-3 bg-[#0d52ce] hover:bg-[#0b45ad] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#0d52ce]/20 shrink-0"
          >
            <span>Ask AI Assistant</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Suggested Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Prompts:</span>
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleRunQuery(chip)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition"
            >
              "{chip}"
            </button>
          ))}
        </div>
      </div>

      {/* Structured Copilot Answer Response */}
      {activeResponse && (
        <div className="light-card p-6 space-y-6 border-l-4 border-l-[#0d52ce]">
          {/* Query Summary Box */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#0d52ce]">
              <Bot className="w-4 h-4" />
              <span>Query Result: "{activeResponse.query}"</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">{activeResponse.summary}</p>
          </div>

          {/* Key KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeResponse.kpis.map((kpi, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <p className={`text-2xl font-black ${kpi.color} font-sans mt-1`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Matched Projects Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Matched Projects Data Table:</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3.5">Project</th>
                    <th className="p-3.5">Sector & Ministry</th>
                    <th className="p-3.5">Risk Score</th>
                    <th className="p-3.5">Schedule Delay</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeResponse.tableProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{p.ministry} ({p.sector})</td>
                      <td className="p-3.5 font-bold text-red-600">Risk: {typeof p.overallRiskScore === 'number' && p.overallRiskScore > 1 ? p.overallRiskScore : p.overallRiskScore}</td>
                      <td className="p-3.5 font-bold text-orange-600">+{p.scheduleDelayDays} Days</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="px-3 py-1 rounded-xl bg-[#0d52ce] text-white hover:bg-[#0b45ad] font-bold text-[11px] shadow-sm transition"
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
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#0d52ce] hover:bg-[#0b45ad] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0d52ce]/20 transition"
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
