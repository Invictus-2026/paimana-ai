import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  ArrowLeft,
  Clock,
  Sliders,
  Download,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  FileCheck
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  PageContainer,
  RiskBadge,
  LoadingSkeleton
} from '../components/ui';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Interactive feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [interventionState, setInterventionState] = useState<'pending' | 'authorized' | 'reviewed' | 'rejected'>('pending');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProjectById(id || '101'),
    enabled: Boolean(id),
  });

  if (isLoading || !project) {
    return (
      <PageContainer breadcrumb="LOADING PROJECT BRIEFING">
        <LoadingSkeleton variant="card" count={5} />
        <LoadingSkeleton variant="chart" className="mt-6" />
      </PageContainer>
    );
  }

  const handleExportDossier = () => {
    setToastMessage(`Project Briefing Dossier downloaded: ${project.code}-Briefing.pdf`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateBrief = () => {
    setBriefModalOpen(true);
  };

  const handleInterventionAction = (action: 'authorized' | 'reviewed' | 'rejected') => {
    setInterventionState(action);
    const messages = {
      authorized: 'Ministerial Intervention Authorized: E-Office Order dispatched to State Chief Secretary',
      reviewed: 'Sent for Inter-Ministerial Review: Placed on Cabinet Infrastructure Committee agenda',
      rejected: 'Exception Logged: Officer recorded rationale into IPMD Audit Ledger',
    };
    setToastMessage(messages[action]);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Cost progression data
  const costProgressionData = [
    { stage: 'Sanctioned Base', amount: project.budgetCr, note: 'CCEA Approved' },
    { stage: 'Revised Budget', amount: project.revisedBudgetCr, note: 'Cabinet Approved' },
    { stage: 'Cumulative Disbursed', amount: project.cumulativeExpenditureCr, note: 'Audited Drawdown' },
    { stage: 'Forecast Exposure', amount: Math.round(project.revisedBudgetCr * 1.08), note: 'With Escalation' }
  ];

  // Milestones timeline data
  const milestoneTimeline = [
    {
      title: 'Preliminary Environmental & CRZ Clearances',
      stage: 'Clearances',
      date: 'Jan 2024',
      status: 'completed',
      detail: 'MoEFCC statutory clearance granted'
    },
    {
      title: 'Geotechnical Borehole Survey Package A',
      stage: 'Investigation',
      date: 'Aug 2024',
      status: 'completed',
      detail: 'Rock strata & water-table profiling completed'
    },
    {
      title: 'Depot Land Acquisition Phase 1',
      stage: 'Land Handover',
      date: 'Mar 2025',
      status: 'completed',
      detail: '92% land parcel encumbrance removed'
    },
    {
      title: 'TBM Launching Shaft Excavation',
      stage: 'Sub-structure',
      date: 'Feb 2026 (Was Oct 2025)',
      status: 'delayed',
      slippage: '+120 Days Slippage',
      detail: 'Severe hard rock blasting permit delay near highway junction'
    },
    {
      title: project.nextMilestone,
      stage: 'Critical Path Tunneling',
      date: `Due: ${project.nextMilestoneDate}`,
      status: 'critical',
      slippage: `+${project.scheduleDelayDays} Days Anticipated Slippage`,
      detail: 'Underground tunneling obstruction near runway pier. Critical slippage active.'
    },
    {
      title: 'Track Signaling & 25kV Traction Electrification',
      stage: 'Systems',
      date: 'Forecast Dec 2026',
      status: 'upcoming',
      detail: 'Dependent on tunnel breakthrough clearance'
    },
    {
      title: 'Commercial Revenue Operations Launch',
      stage: 'Commissioning',
      date: `Forecast: ${project.forecastCompletionDate} (Target: ${project.plannedCompletionDate})`,
      status: 'upcoming',
      detail: 'Final CRS safety certification inspection'
    }
  ];

  return (
    <PageContainer breadcrumb={`PROJECT DIGITAL BRIEFING / ${project.code}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-8 z-50 bg-[#0b172a] text-white px-4 py-2.5 rounded-xl shadow-xl border border-blue-500/40 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Briefing Generation Modal */}
      {briefModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0d52ce]" />
                <span className="text-sm font-bold text-slate-900">Cabinet Executive Brief Generated</span>
              </div>
              <button
                onClick={() => setBriefModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80 font-mono">
              <p className="font-bold text-slate-900">MEMORANDUM FOR JOINT SECRETARY (INFRA)</p>
              <p>PROJECT: {project.name} ({project.code})</p>
              <p>COMPOSITE RISK INDEX: {project.overallRiskScore} / 100 (CRITICAL)</p>
              <p>ESCALATION: +{project.costOverrunPct}% Cost Variance | +{project.scheduleDelayDays} Days Delay</p>
              <p className="text-red-600 font-bold">PRIMARY BOTTLENECK: {project.topRiskDrivers[0]?.driver}</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setBriefModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setBriefModalOpen(false);
                  handleExportDossier();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0d52ce] text-white hover:bg-[#0b45ad]"
              >
                Download PDF Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXECUTIVE HEADER: PROJECT DIGITAL BRIEFING                                */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-gradient-to-r from-white via-slate-50 to-blue-50/20 border border-slate-200/90 rounded-2xl space-y-4">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center space-x-1.5 text-xs text-[#0d52ce] hover:underline font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to National Project Matrix</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight font-heading">
                {project.name}
              </h1>
              <span className="font-mono font-bold text-[#0d52ce] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 text-xs">
                {project.code}
              </span>
              <RiskBadge score={project.overallRiskScore} size="lg" pulse />
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wide bg-red-100 text-red-800 border border-red-200">
                Critical Attention
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1.5">
              <span className="text-slate-800 font-bold">{project.ministry}</span>
              <span>•</span>
              <span>{project.sector}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.state}
              </span>
              <span>•</span>
              <span className="text-[#0d52ce] font-bold">Cabinet Baseline Sanction</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/scenarios?project_id=${project.id}`)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Run Scenario</span>
            </button>

            <button
              onClick={() => navigate('/interventions')}
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>View Alerts</span>
            </button>

            <button
              onClick={handleGenerateBrief}
              className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0d52ce] rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Brief</span>
            </button>

            <button
              onClick={handleExportDossier}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 — PROJECT HEALTH (5 INTELLIGENCE CARDS)                          */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Section 1 • Project Health Indices
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Validated by OCMS Monthly Statistical Return
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Overall Risk */}
          <div className="command-panel p-4 bg-white border-2 border-red-200/90 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                  Overall Risk
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                  Critical
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-red-600 font-heading tabular-nums">
                  {project.overallRiskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-red-700 font-semibold">
                Deteriorating (+4 pts MoM)
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-red-100 leading-snug">
              High multi-factor vulnerability across civil tunneling works & pending ROW permits.
            </p>
          </div>

          {/* Card 2: Cost Risk */}
          <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Cost Risk
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-orange-50 text-orange-700 border border-orange-200">
                  High Growth
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-orange-600 font-heading tabular-nums">
                  {project.costRiskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-orange-700 font-semibold font-mono">
                +{project.costOverrunPct}% Overrun Anticipated
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 leading-snug">
              Sub-structure variation claims and contractor arbitration pending resolution.
            </p>
          </div>

          {/* Card 3: Schedule Risk */}
          <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Schedule Risk
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                  Severe Delay
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-amber-600 font-heading tabular-nums">
                  {project.delayRiskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold font-mono">
                +{project.scheduleDelayDays} Days Timeline Slippage
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 leading-snug">
              Critical path shaft obstruction and delayed airport land parcel access.
            </p>
          </div>

          {/* Card 4: Execution Risk */}
          <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Execution Risk
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-[#0d52ce] border border-blue-100">
                  Physical Divergence
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-slate-900 font-heading tabular-nums">
                  {project.executionRiskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-[#0d52ce] font-semibold">
                Physical 48% vs Financial 59%
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 leading-snug">
              Billing velocity is outstripping physically certified civil excavation.
            </p>
          </div>

          {/* Card 5: Data Confidence */}
          <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Data Confidence
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  High Confidence
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-emerald-600 font-heading tabular-nums">
                  94%
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold">
                OCMS Statutory Return Verified
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 leading-snug">
              100% monthly returns filed with geo-tagged drone milestone audit verification.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 — RISK BREAKDOWN & DECOMPOSITION                                */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Risk Decomposition
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• Multi-Layer Feature Analysis</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-1">
              Why Is This Project At High Risk?
            </h2>
            <p className="text-xs text-slate-500">
              Comparative dimensional decomposition and root cause drivers distinguishing machine-learning SHAP attributions from statutory baselines.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-[#0d52ce]" />
            <span>Composite Score: <strong>{project.overallRiskScore} / 100</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Visual Risk Decomposition Bars (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
              Dimensional Risk Spectrum
            </span>

            {/* Overall Risk Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Overall Risk</span>
                <span className="text-red-600 font-mono font-black">{project.overallRiskScore} / 100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div className="bg-red-600 h-full rounded-full" style={{ width: `${project.overallRiskScore}%` }} />
              </div>
            </div>

            {/* Cost Risk Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Cost Risk</span>
                <span className="text-orange-600 font-mono font-black">{project.costRiskScore} / 100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${project.costRiskScore}%` }} />
              </div>
            </div>

            {/* Schedule Risk Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Schedule Risk</span>
                <span className="text-amber-600 font-mono font-black">{project.delayRiskScore} / 100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${project.delayRiskScore}%` }} />
              </div>
            </div>

            {/* Execution Risk Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Execution Risk</span>
                <span className="text-[#0d52ce] font-mono font-black">{project.executionRiskScore} / 100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div className="bg-[#0d52ce] h-full rounded-full" style={{ width: `${project.executionRiskScore}%` }} />
              </div>
            </div>
          </div>

          {/* Right: Top 4 Drivers with Model-Driven vs Statutory Badges (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
              Top Ranked Bottleneck Drivers
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Driver 1: Schedule Slippage */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Model-Driven (SHAP +0.32)
                  </span>
                  <span className="text-xs font-bold text-red-600">#1 Driver</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Underground Alignment Sinking
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  TBM tunneling subsidence near airport runway pier triggering safety window halts.
                </p>
              </div>

              {/* Driver 2: Resource / Land Handover */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Model-Driven (SHAP +0.24)
                  </span>
                  <span className="text-xs font-bold text-orange-600">#2 Driver</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Right-of-Way Parcel Handover
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  CSMIA airport land parcel transfer clearances pending inter-agency sign-off.
                </p>
              </div>

              {/* Driver 3: Cost Escalation */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Statutory Rule-Based
                  </span>
                  <span className="text-xs font-bold text-slate-700">#3 Driver</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Cost Escalation (+18.8%)
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  CCEA approved revised cost increased from ₹6,607 Cr to ₹7,850 Cr due to civil variation claims.
                </p>
              </div>

              {/* Driver 4: Milestone Delay */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Statutory Rule-Based
                  </span>
                  <span className="text-xs font-bold text-slate-700">#4 Driver</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Milestone Delay (+240 Days)
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Anticipated commercial commissioning slipped from Dec 2026 to Aug 2027.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3 — PROJECT TIMELINE & MILESTONES PROGRESS                         */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Milestone Execution Tracker
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• Critical Path Analysis</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-1">
              Project Timeline & Critical Path Milestones
            </h2>
            <p className="text-xs text-slate-500">
              Progression tracking across sanctioned project milestones with highlight on severe slippages.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Cumulative Critical Path Slippage: +240 Days</span>
          </div>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {milestoneTimeline.map((m, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Marker Dot */}
              <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                m.status === 'completed' ? 'border-emerald-600 bg-emerald-600' :
                m.status === 'critical' ? 'border-red-600 bg-red-100' :
                m.status === 'delayed' ? 'border-amber-500 bg-amber-100' :
                'border-slate-300 bg-slate-100'
              }`}>
                {m.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                {m.status === 'critical' && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
              </div>

              <div className={`p-3.5 rounded-xl border transition ${
                m.status === 'critical' ? 'bg-red-50/60 border-red-200/90 shadow-2xs' :
                m.status === 'delayed' ? 'bg-amber-50/50 border-amber-200/80' :
                m.status === 'completed' ? 'bg-slate-50/70 border-slate-200/70' :
                'bg-white border-slate-200/70'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400">
                      {m.stage}
                    </span>
                    <span className="text-slate-300">•</span>
                    <h3 className="font-bold text-slate-900 font-heading text-xs lg:text-sm">
                      {m.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-[11px] shrink-0">
                    <span className="font-semibold text-slate-600">{m.date}</span>
                    {m.slippage && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.2 rounded">
                        {m.slippage}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  {m.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4 — COST INTELLIGENCE & PROGRESSION                                */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Financial Velocity & Exposure
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• Statutory Sanction Audits</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-1">
              Cost Intelligence & Escalation Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Audited capital progression comparing sanctioned base, approved revisions, and projected unbudgeted exposure.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
            <span>Variance: +₹{(project.revisedBudgetCr - project.budgetCr).toLocaleString('en-IN')} Cr</span>
          </div>
        </div>

        {/* 4 Cost Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Original Cost
            </span>
            <p className="text-2xl font-black text-slate-900 font-heading tabular-nums">
              ₹{project.budgetCr.toLocaleString('en-IN')} Cr
            </p>
            <span className="text-[10px] text-slate-400 font-medium">CCEA Sanctioned Base</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Revised Cost
            </span>
            <p className="text-2xl font-black text-orange-600 font-heading tabular-nums">
              ₹{project.revisedBudgetCr.toLocaleString('en-IN')} Cr
            </p>
            <span className="text-[10px] text-orange-700 font-bold font-mono">+{project.costOverrunPct}% Approved Growth</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Cumulative Expenditure
            </span>
            <p className="text-2xl font-black text-slate-900 font-heading tabular-nums">
              ₹{project.cumulativeExpenditureCr.toLocaleString('en-IN')} Cr
            </p>
            <span className="text-[10px] text-blue-700 font-bold font-mono">50.0% Financial Drawdown</span>
          </div>

          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/90 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
              Potential Escalation Exposure
            </span>
            <p className="text-2xl font-black text-red-600 font-heading tabular-nums">
              ₹{(project.revisedBudgetCr * 1.08).toFixed(0)} Cr
            </p>
            <span className="text-[10px] text-red-700 font-bold font-mono">+₹{Math.round(project.revisedBudgetCr * 0.08)} Cr At Risk</span>
          </div>
        </div>

        {/* Cost Progression Bar Chart */}
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costProgressionData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} unit=" Cr" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-[#0b172a] text-white rounded-xl shadow-lg text-xs space-y-1 border border-slate-700 font-mono">
                        <p className="font-bold text-slate-200">{data.stage}</p>
                        <p className="text-blue-400 font-black">₹{data.amount.toLocaleString('en-IN')} Cr</p>
                        <p className="text-slate-400 text-[10px]">{data.note}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {costProgressionData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 3 ? '#dc2626' : index === 1 ? '#f97316' : index === 2 ? '#0d52ce' : '#94a3b8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5 — EARLY WARNING SIGNALS (EARLY WARNING CENTER)                   */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-white border border-slate-200/90 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Predictive Synthesis
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• Lead Time: 5.2 Months Ahead</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading mt-1">
              Early Warning Center
            </h2>
            <p className="text-xs text-slate-500">
              Active anomaly signals and threshold triggers synthesized across physical, environmental, and financial feeds.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>3 Active Early Warnings</span>
          </div>
        </div>

        {/* 3 Early Warning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Critical Signal */}
          <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/90 border-l-4 border-l-red-600 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  🔴 Critical Signal
                </span>
                <span className="text-[10px] font-mono text-red-600">12 Jan 2026</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 font-heading">
                TBM Activity Delayed & Ground Subsidence
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Trigger: Cutterhead torque readings indicate ground sinking near Runway 27 pier alignment.
              </p>
            </div>

            <div className="pt-2 border-t border-red-100 text-xs space-y-1">
              <p className="text-[11px] font-bold text-red-800">
                Impact: +180 days delay on primary corridor
              </p>
              <p className="text-[10px] text-slate-500">
                Action: Mobilize specialized chemical grouting crew.
              </p>
            </div>
          </div>

          {/* Card 2: Warning Signal */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 border-l-4 border-l-amber-500 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  🟠 Warning Signal
                </span>
                <span className="text-[10px] font-mono text-amber-600">18 Feb 2026</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 font-heading">
                Milestone Slippage Acceleration
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Trigger: Station MEP and signaling handover scheduled buffer dropped below 15 days threshold.
              </p>
            </div>

            <div className="pt-2 border-t border-amber-100 text-xs space-y-1">
              <p className="text-[11px] font-bold text-amber-800">
                Impact: Critical path downstream compression
              </p>
              <p className="text-[10px] text-slate-500">
                Action: Enact bi-weekly inter-agency project taskforce.
              </p>
            </div>
          </div>

          {/* Card 3: Watch Signal */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/90 border-l-4 border-l-[#0d52ce] flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#0d52ce] bg-blue-100 px-2 py-0.5 rounded">
                  🟡 Watch Signal
                </span>
                <span className="text-[10px] font-mono text-[#0d52ce]">05 Mar 2026</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 font-heading">
                Expenditure Velocity Divergence
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Trigger: Contractor billing velocity outpacing certified excavation volume by 11.2%.
              </p>
            </div>

            <div className="pt-2 border-t border-blue-100 text-xs space-y-1">
              <p className="text-[11px] font-bold text-blue-900">
                Impact: Potential unverified payment risk
              </p>
              <p className="text-[10px] text-slate-500">
                Action: Audit measurement book prior to Q2 payment release.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6 — RECOMMENDED INTERVENTION (CONTROLLED GOVERNMENT WORKFLOW)     */}
      {/* ========================================================================= */}
      <div className="command-panel p-6 bg-gradient-to-r from-slate-900 via-[#0b172a] to-slate-900 text-white rounded-2xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Decision Support Protocol
              </span>
              <span className="text-[10px] text-slate-400 font-mono">• Controlled Statutory Action</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight font-heading mt-1">
              Recommended Human Review: Ministerial Intervention #INT-001
            </h2>
            <p className="text-xs text-slate-400">
              Official recommendation based on multi-agency empirical evidence and causal graph modeling.
            </p>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
            interventionState === 'authorized' ? 'bg-emerald-900 text-emerald-300 border-emerald-700' :
            interventionState === 'reviewed' ? 'bg-blue-900 text-blue-300 border-blue-700' :
            interventionState === 'rejected' ? 'bg-red-900 text-red-300 border-red-700' :
            'bg-amber-900 text-amber-300 border-amber-700'
          }`}>
            Status: {interventionState.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Action & Evidence Details (8 cols) */}
          <div className="lg:col-span-8 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Recommended Action:
              </span>
              <p className="font-bold text-white text-sm">
                Expedite CSMIA Airport T2 Land Parcel & Right-of-Way Clearance Handover
              </p>
              <p className="text-slate-300 text-xs leading-relaxed">
                Direct joint site inspection with Ministry of Civil Aviation (MoCA) and Airports Authority of India (AAI) to formalize underground right-of-way license agreement.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Empirical Grounding Evidence:
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                Pending land parcel clearance has halted Package 1 TBM boring for 94 days. Historical ML analogs across urban transit corridors indicate an 83% probability of further 6-month delay if unaddressed this quarter.
              </p>
            </div>

            {/* Expected Impacts */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Risk Reduction</span>
                <span className="text-sm font-black text-emerald-400 font-mono">-14 Points</span>
                <span className="text-[9px] text-slate-400 block">(92 → 78)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Delay Mitigation</span>
                <span className="text-sm font-black text-blue-400 font-mono">+45 Days</span>
                <span className="text-[9px] text-slate-400 block">Recovered</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Avoided Claims</span>
                <span className="text-sm font-black text-amber-400 font-mono">₹140 Cr</span>
                <span className="text-[9px] text-slate-400 block">Est. Savings</span>
              </div>
            </div>
          </div>

          {/* Workflow Authorization Buttons (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
              Officer Action Dispatch
            </span>
            <p className="text-[11px] text-slate-400">
              Actions are recorded into the IPMD Ministerial Audit Trail with digital provenance.
            </p>

            <button
              onClick={() => handleInterventionAction('authorized')}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize Intervention</span>
            </button>

            <button
              onClick={() => handleInterventionAction('reviewed')}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Request Review</span>
            </button>

            <button
              onClick={() => handleInterventionAction('rejected')}
              className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject / Log Exception</span>
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
