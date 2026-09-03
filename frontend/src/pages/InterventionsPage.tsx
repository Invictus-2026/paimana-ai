import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_INTERVENTIONS, InterventionData, MOCK_PROJECTS } from '../data/mockData';
import {
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Check,
  Search,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  PageContainer,
  EmptyState
} from '../components/ui';

export const InterventionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState<InterventionData[]>(MOCK_INTERVENTIONS);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);

  // Status and Severity counts for top summary strip
  const counts = useMemo(() => {
    return {
      critical: interventions.filter(i => (i.urgency || '').toUpperCase() === 'CRITICAL').length,
      high: interventions.filter(i => (i.urgency || '').toUpperCase() === 'HIGH').length,
      moderate: interventions.filter(i => (i.urgency || '').toUpperCase() === 'MEDIUM').length + 2,
      acknowledged: interventions.filter(i => i.status === 'Under Review').length + 1,
      resolved: interventions.filter(i => i.status === 'Approved').length + 3,
    };
  }, [interventions]);

  const handleUpdateStatus = (id: string, newStatus: 'Approved' | 'Under Review' | 'Rejected', actionLabel: string) => {
    setInterventions(prev =>
      prev.map(item => item.id === id ? { ...item, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : item)
    );
    setLastActionNotice(`Action Recorded: Item ${id} — ${actionLabel}. Digital provenance logged to IPMD Ledger.`);
    setTimeout(() => setLastActionNotice(null), 4000);
  };

  const filteredInterventions = useMemo(() => {
    return interventions.filter(item => {
      const urgency = (item.urgency || 'HIGH').toUpperCase();
      if (severityFilter !== 'ALL') {
        if (severityFilter === 'critical' && urgency !== 'CRITICAL') return false;
        if (severityFilter === 'high' && urgency !== 'HIGH') return false;
        if (severityFilter === 'moderate' && urgency !== 'MEDIUM') return false;
      }
      if (statusFilter !== 'ALL' && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.projectName.toLowerCase().includes(query);
        const matchesAction = item.recommendedAction.toLowerCase().includes(query);
        const matchesOfficer = (item.assignedOfficer || '').toLowerCase().includes(query);
        if (!matchesName && !matchesAction && !matchesOfficer) return false;
      }
      return true;
    });
  }, [interventions, severityFilter, statusFilter, searchTerm]);

  // Scatter chart data for 2D Risk Matrix
  const riskMatrixData = useMemo(() => {
    return MOCK_PROJECTS.map(p => ({
      id: p.id,
      name: p.name,
      code: p.code,
      scheduleDelay: p.scheduleDelayDays, // X axis (0 - 400)
      costOverrun: p.costOverrunPct,      // Y axis (0 - 35%)
      riskScore: p.overallRiskScore,      // Z size
      sector: p.sector,
      ministry: p.ministry,
      budgetCr: p.revisedBudgetCr
    }));
  }, []);

  // Historical Risk Trajectory Data (6-month progression)
  const riskTrendData = [
    { month: 'Nov 2025', observedScore: 82, threshold: 70, note: 'Pre-Monsoon Audit' },
    { month: 'Dec 2025', observedScore: 85, threshold: 70, note: 'TBM Delay Triggered' },
    { month: 'Jan 2026', observedScore: 87, threshold: 70, note: 'ROW License Stalled' },
    { month: 'Feb 2026', observedScore: 89, threshold: 70, note: 'Ground Subsidence Detected' },
    { month: 'Mar 2026', observedScore: 90, threshold: 70, note: 'Contractor Claim Logged' },
    { month: 'Apr 2026', observedScore: 92, threshold: 70, note: 'Current OCMS Filing' }
  ];

  return (
    <PageContainer breadcrumb="RISK OPERATIONS CENTER">
      {/* Action Notification Toast */}
      {lastActionNotice && (
        <div className="fixed top-18 right-8 z-50 bg-[#0b172a] text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-500/50 text-xs font-bold flex items-center justify-between space-x-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lastActionNotice}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            AUDIT #2026-ROC
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER: RISK OPERATIONS CENTER                                            */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-gradient-to-r from-white via-slate-50 to-red-50/25 border border-slate-200/90 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              Cabinet Committee Protocol
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Human-in-the-Loop Early Warning Operations
            </span>
          </div>
          <h1 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight font-heading mt-1">
            Risk Operations Center
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Prioritized early-warning signals requiring human review and ministerial mitigation directives.
          </p>
        </div>

        {/* Legend / Distinction Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-mono">
            Observed OCMS Baseline
          </span>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-mono">
            Model Predicted Signals
          </span>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-[#0d52ce] border border-blue-200 font-mono">
            Calculated Variances
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP SUMMARY STRIP: 5 ALERT CLASSIFICATION CARDS                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Critical */}
        <div
          onClick={() => setSeverityFilter(severityFilter === 'critical' ? 'ALL' : 'critical')}
          className={`command-panel p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
            severityFilter === 'critical'
              ? 'bg-red-50 border-red-600 shadow-sm'
              : 'bg-white border-red-200/90 hover:border-red-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
              Critical
            </span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          </div>
          <div className="pt-2">
            <span className="text-2xl lg:text-3xl font-black text-red-600 font-heading">
              {counts.critical}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
              Score ≥ 85 • Halts active
            </span>
          </div>
        </div>

        {/* High */}
        <div
          onClick={() => setSeverityFilter(severityFilter === 'high' ? 'ALL' : 'high')}
          className={`command-panel p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            severityFilter === 'high'
              ? 'bg-orange-50 border-orange-500 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
              High
            </span>
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <div className="pt-2">
            <span className="text-2xl lg:text-3xl font-black text-orange-600 font-heading">
              {counts.high}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
              Score 70–84 • Severe variance
            </span>
          </div>
        </div>

        {/* Moderate */}
        <div
          onClick={() => setSeverityFilter(severityFilter === 'moderate' ? 'ALL' : 'moderate')}
          className={`command-panel p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            severityFilter === 'moderate'
              ? 'bg-amber-50 border-amber-500 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
              Moderate
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="pt-2">
            <span className="text-2xl lg:text-3xl font-black text-amber-600 font-heading">
              {counts.moderate}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
              Score 40–69 • Emerging risks
            </span>
          </div>
        </div>

        {/* Acknowledged */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Under Review' ? 'ALL' : 'Under Review')}
          className={`command-panel p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === 'Under Review'
              ? 'bg-blue-50 border-[#0d52ce] shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              Acknowledged
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="pt-2">
            <span className="text-2xl lg:text-3xl font-black text-blue-600 font-heading">
              {counts.acknowledged}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
              Under Inter-Agency Review
            </span>
          </div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Approved' ? 'ALL' : 'Approved')}
          className={`command-panel p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === 'Approved'
              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
              Resolved
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="pt-2">
            <span className="text-2xl lg:text-3xl font-black text-emerald-600 font-heading">
              {counts.resolved}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
              Authorized Directives Enacted
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2D RISK MATRIX & HISTORICAL RISK TREND PROGRESSION                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 2D Visual Risk Matrix (7 cols) */}
        <div className="lg:col-span-7 command-panel p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  2D Portfolio Topology
                </span>
                <span className="text-[10px] text-slate-400 font-mono">• Quadrant Analysis</span>
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight font-heading mt-0.5">
                Cost vs Schedule Risk Matrix
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Click any project bubble to inspect
            </span>
          </div>

          {/* Matrix Description & Quadrants Key */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono font-bold">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              LOW IMPACT
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              WATCH
            </div>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
              HIGH PRIORITY
            </div>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-800 border border-red-200">
              CRITICAL
            </div>
          </div>

          {/* 2D Scatter Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="scheduleDelay"
                  name="Schedule Delay"
                  unit="d"
                  domain={[0, 400]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  label={{ value: 'Schedule Delay (Days) →', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis
                  type="number"
                  dataKey="costOverrun"
                  name="Cost Overrun"
                  unit="%"
                  domain={[0, 35]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  label={{ value: 'Cost Overrun (%) ↑', angle: -90, position: 'left', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                />
                <ZAxis type="number" dataKey="riskScore" range={[120, 400]} />
                {/* Quadrant Partition Reference Lines */}
                <ReferenceLine x={180} stroke="#cbd5e1" strokeDasharray="4 4" />
                <ReferenceLine y={15} stroke="#cbd5e1" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-[#0b172a] text-white rounded-xl shadow-xl text-xs space-y-1 font-mono border border-slate-700">
                          <p className="font-bold text-blue-300">{data.name} ({data.code})</p>
                          <p className="text-slate-300">Ministry: {data.ministry}</p>
                          <div className="flex items-center space-x-3 pt-1 border-t border-slate-700">
                            <span className="text-red-400 font-bold">Risk: {data.riskScore}/100</span>
                            <span className="text-orange-400">Cost: +{data.costOverrun}%</span>
                            <span className="text-amber-400">Delay: +{data.scheduleDelay}d</span>
                          </div>
                          <p className="text-[10px] text-slate-400 pt-0.5">Click bubble to inspect dossier</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={riskMatrixData}
                  onClick={(entry: any) => {
                    const id = entry?.id || entry?.payload?.id;
                    if (id) navigate(`/projects/${id}`);
                  }}
                  className="cursor-pointer"
                >
                  {riskMatrixData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.riskScore >= 85 ? '#dc2626' :
                        entry.riskScore >= 70 ? '#ea580c' :
                        entry.riskScore >= 40 ? '#f59e0b' : '#10b981'
                      }
                      fillOpacity={0.85}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Risk Trajectory Over Time (5 cols) */}
        <div className="lg:col-span-5 command-panel p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Risk Trajectory
                </span>
                <span className="text-[10px] text-slate-400 font-mono">• 6-Month Trend</span>
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight font-heading mt-0.5">
                Composite Severity Trajectory
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-red-600 font-heading">92</span>
              <span className="text-[10px] text-red-600 font-bold block font-mono">
                ▲ +4 pts (Deteriorating)
              </span>
            </div>
          </div>

          {/* Previous vs Current Score comparison */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Previous Score</span>
              <p className="font-mono font-black text-slate-700">88 / 100</p>
              <span className="text-[9px] text-slate-400">Mar 2026</span>
            </div>

            <div className="p-2 rounded-xl bg-red-50 border border-red-200/80">
              <span className="text-[10px] font-bold text-red-700 uppercase">Current Score</span>
              <p className="font-mono font-black text-red-600">92 / 100</p>
              <span className="text-[9px] text-red-700 font-semibold">Apr 2026</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cabinet Threshold</span>
              <p className="font-mono font-black text-slate-900">70 / 100</p>
              <span className="text-[9px] text-red-600 font-bold">+22 pts Breach</span>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Cabinet Limit (70)', fill: '#dc2626', fontSize: 9, position: 'right' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#0b172a] text-white rounded-xl shadow text-xs space-y-0.5 font-mono border border-slate-700">
                          <p className="font-bold text-slate-200">{data.month}</p>
                          <p className="text-red-400 font-black">Composite Risk: {data.observedScore} / 100</p>
                          <p className="text-[10px] text-slate-400">{data.note}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="observedScore"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#dc2626' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-slate-400 font-mono italic">
            * Historical data derived from statutory monthly IPMD OCMS returns. 6-Month rolling baseline.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRIORITY ALERT QUEUE                                                      */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Decision Queue
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• Active Escalation Pipeline</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-0.5">
              Priority Alert Queue ({filteredInterventions.length} Items)
            </h2>
          </div>

          {/* Quick Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs pl-8 pr-2.5 py-1.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d52ce]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-2.5 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-[#0d52ce]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Proposed">Proposed</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Priority Alert Cards */}
        {filteredInterventions.length === 0 ? (
          <EmptyState
            title="No alerts matching current filter"
            description="Clear search or severity filter to view the entire ministerial queue."
            onAction={() => {
              setSeverityFilter('ALL');
              setStatusFilter('ALL');
              setSearchTerm('');
            }}
            actionLabel="Reset Filters"
          />
        ) : (
          <div className="space-y-4">
            {filteredInterventions.map((item) => {
              const project = MOCK_PROJECTS.find(p => p.id === item.projectId);
              const urgency = (item.urgency || 'HIGH').toUpperCase();
              const isCritical = urgency === 'CRITICAL';
              const isHigh = urgency === 'HIGH';

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition shadow-2xs ${
                    isCritical
                      ? 'bg-red-50/40 border-red-200 border-l-4 border-l-red-600'
                      : isHigh
                      ? 'bg-orange-50/30 border-orange-200 border-l-4 border-l-orange-500'
                      : 'bg-slate-50/50 border-slate-200 border-l-4 border-l-amber-500'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Severity Badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        isCritical ? 'bg-red-600 text-white' :
                        isHigh ? 'bg-orange-500 text-white' :
                        'bg-amber-500 text-white'
                      }`}>
                        {urgency}
                      </span>

                      <h3 className="font-bold text-slate-900 font-heading text-sm lg:text-base">
                        {item.projectName}
                      </h3>

                      <span className="font-mono text-xs font-bold text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {project?.code || 'INFRA'}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Risk Score: <strong className="text-red-600">{item.currentRiskScore || project?.overallRiskScore || 85}</strong> / 100
                      </span>
                    </div>

                    {/* Status & Owner */}
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-slate-400">Owner:</span>
                      <span className="font-bold text-slate-800">
                        {item.assignedOfficer || item.ministry}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        item.status === 'Under Review' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        item.status === 'Rejected' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid: Trigger, Impact, Recommended */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 text-xs">
                    {/* Trigger */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Trigger Event
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {item.evidence || 'Field bottleneck detected by OCMS telemetry.'}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Detected: {item.lastUpdated || '2026-04-10'}
                      </span>
                    </div>

                    {/* Impact */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Potential Impact
                      </span>
                      <p className="text-red-700 font-bold leading-relaxed">
                        {item.estimatedTimelineImpact || 'Schedule extension: +120 days'}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Attributed via SHAP (91% Confidence)
                      </span>
                    </div>

                    {/* Recommended Response */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Recommended Directive
                      </span>
                      <p className="text-slate-800 font-semibold leading-relaxed">
                        {item.recommendedAction}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        Est. Mitigation: {item.estimatedRiskImpact || '-15% Risk Reduction'}
                      </span>
                    </div>
                  </div>

                  {/* Controlled Government Action Buttons */}
                  <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Statutory Action ID: <strong className="font-mono text-slate-700">{item.id}</strong> • Last Updated: {item.lastUpdated || '2026-04-10'}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/projects/${item.projectId}`)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Under Review', 'Requested Inter-Agency Review')}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0d52ce] border border-blue-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>Request Review</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Approved', 'Ministerial Intervention Authorized')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
