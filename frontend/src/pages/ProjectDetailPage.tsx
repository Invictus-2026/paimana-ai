import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  ArrowLeft, ShieldAlert, Clock, IndianRupee, TrendingUp, Sliders,
  BarChart2, AlertTriangle, Activity
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { ExpandableChartCard } from '../components/common/ExpandableChartCard';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProjectById(id || ''),
    enabled: Boolean(id),
  });

  // Fetch full 1-year monthly trajectory using the external project ID
  const extId = project?.code?.replace(/^PRJ-/, '') || '';
  const { data: trajectoryRes, isLoading: trajLoading } = useQuery({
    queryKey: ['project-monthly-trajectory', extId],
    queryFn: () => api.getProjectMonthlyTrajectory(extId),
    enabled: Boolean(extId && !extId.startsWith('PRJ-')),
  });

  const trajectoryData: any[] = trajectoryRes?.data?.trajectory || [];
  const summary: any = trajectoryRes?.data?.summary || null;

  const isLoading = projLoading || trajLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-slate-500 font-medium">{t('projectDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!project) return <p role="alert">{t('projectDetail.unavailable')}</p>;
  const getRiskColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', fill: '#ef4444', label: t('common.riskTier.highRisk') };
    if (score >= 50) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', fill: '#f97316', label: t('common.riskTier.atRisk') };
    if (score >= 35) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', fill: '#eab308', label: t('common.riskTier.moderate') };
    return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', fill: '#10b981', label: t('common.riskTier.active') };
  };

  const overallColor = getRiskColor(project.overallRiskScore);

  // Build chart data from trajectory
  const riskTrendData = trajectoryData.map(t => ({
    label: t.label,
    risk: Math.round(t.risk_score * 100),
    overrun: t.cost_overrun_pct,
  }));

  const costTrendData = trajectoryData.map(t => ({
    label: t.label,
    original: Math.round(t.original_cost_cr),
    revised: Math.round(t.revised_cost_cr) || Math.round(t.original_cost_cr),
    expenditure: Math.round(t.expenditure_cr),
  }));

  const riskScores = riskTrendData.map(r => r.risk);
  const peakRisk = riskScores.length ? Math.max(...riskScores) : project.overallRiskScore;
  const minRisk = riskScores.length ? Math.min(...riskScores) : 0;
  const riskTrend = riskScores.length >= 2
    ? (riskScores[riskScores.length - 1] > riskScores[0] ? '↑ ' + t('projectDetail.trend.increasing') : '↓ ' + t('projectDetail.trend.decreasing'))
    : t('projectDetail.trend.insufficientData');

  const hasTrajectory = trajectoryData.length > 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-6 text-slate-800">
      <div className="flex flex-wrap gap-2">{[['satellite',t('projectDetail.tabs.satellite')],['uncertainty',t('projectDetail.tabs.uncertainty')],['documents',t('projectDetail.tabs.documents')],['field',t('projectDetail.tabs.field')],['reports',t('projectDetail.tabs.reports')]].map(([tab,label])=><button key={tab} className="rounded-xl border bg-white px-3 py-2 text-sm text-blue-700" onClick={()=>navigate('/intelligence?tab='+tab+'&project_id='+project.id)}>{label}</button>)}</div>
      {/* Header */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate('/projects')} className="flex items-center space-x-1.5 text-xs text-[#0d52ce] hover:underline font-bold mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /><span>{t('projectDetail.backToExplorer')}</span>
          </button>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-xl font-black text-slate-900">{project.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${overallColor.bg} ${overallColor.text} border ${overallColor.border}`}>
              {overallColor.label} ({project.overallRiskScore}/100)
            </span>
            {summary && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${summary.risk_trend === 'increasing' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                {t('projectDetail.trendLabel', { trend: riskTrend })}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {project.code} · {project.ministry} · {project.sector} · {project.state}
            {hasTrajectory && <span className="ml-2 text-blue-600 font-bold">· {t('projectDetail.monthTrajectoryLoaded', { count: trajectoryData.length })}</span>}
          </p>
        </div>
        <button onClick={() => navigate(`/scenarios?project_id=${project.id}`)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0d52ce] hover:bg-[#0b45ad] text-white rounded-xl text-xs font-bold shadow-md shrink-0">
          <Sliders className="w-4 h-4" /><span>{t('projectDetail.simulateDisruption')}</span>
        </button>
      </div>

      {/* Risk KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="light-card p-5 border-l-4 border-l-red-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('projectDetail.kpi.overallRiskIndex')}</span>
          <h2 className="text-3xl font-black text-red-600 mt-3">{project.overallRiskScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></h2>
          <p className="text-xs text-slate-500 mt-1">{t('projectDetail.kpi.peak12mo')} <strong className="text-slate-800">{peakRisk}</strong> · {t('projectDetail.kpi.min')} <strong>{minRisk}</strong></p>
        </div>
        <div className="light-card p-5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('projectDetail.kpi.costOverrun')}</span>
            <IndianRupee className="w-4 h-4 text-orange-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-3">+{summary?.latest_cost_overrun_pct?.toFixed(1) || project.costOverrunPct.toFixed(1)}%</h3>
          <p className="text-xs text-orange-600 font-bold mt-1">{t('projectDetail.kpi.peak')} +{summary?.peak_cost_overrun_pct?.toFixed(1) || '—'}%</p>
        </div>
        <div className="light-card p-5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('projectDetail.kpi.budget')}</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-3">₹{(summary?.latest_original_cost_cr || project.budgetCr).toLocaleString()} Cr</h3>
          <p className="text-xs text-slate-500 mt-1">{t('projectDetail.kpi.revised')} ₹{(summary?.latest_revised_cost_cr || project.revisedBudgetCr).toLocaleString()} Cr</p>
        </div>
        <div className="light-card p-5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('projectDetail.kpi.expenditure')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-3">₹{(summary?.total_expenditure_cr || project.cumulativeExpenditureCr).toLocaleString()} Cr</h3>
          <p className="text-xs text-slate-500 mt-1">{t('projectDetail.kpi.riskScoreMethod')} {project.overallRiskScore >= 50 ? t('projectDetail.kpi.ruleBasedCostGrowth') : t('projectDetail.kpi.lowRisk')}</p>
        </div>
      </div>

      {/* 1-Year Risk Score Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ExpandableChartCard
          className="light-card p-5 lg:col-span-8"
          chartHeight="h-64"
          title={
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0d52ce]" />
              {hasTrajectory ? t('projectDetail.charts.riskTrajectoryTitleReal', { count: trajectoryData.length }) : t('projectDetail.charts.riskTrajectoryTitle12mo')}
            </span>
          }
          subtitle={!hasTrajectory ? t('projectDetail.charts.riskTrajectoryFallbackSubtitle') : undefined}
          headerRight={
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              riskTrend.includes('↑') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>{riskTrend}</span>
          }
        >
          {(isFull) => (
            <ResponsiveContainer width="100%" height={isFull ? 550 : "100%"}>
              <AreaChart data={hasTrajectory ? riskTrendData : project.monthlyRiskHistory.map(h => ({ label: h.month, risk: h.score, overrun: 0 }))}
                margin={{ top: 10, right: isFull ? 30 : 10, left: isFull ? 10 : -20, bottom: isFull ? 20 : 0 }}>
                <defs>
                  <linearGradient id="gradRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: isFull ? 12 : 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: isFull ? 12 : 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: any, n: any) => [n === 'overrun' ? `${v}%` : `${v}/100`, n === 'overrun' ? t('projectDetail.legend.costOverrun') : t('projectDetail.legend.riskScore')]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: isFull ? 12 : 11 }} />
                <Area type="monotone" dataKey="risk" name={t('projectDetail.legend.riskScore')} stroke="#ef4444" strokeWidth={2.5} fill="url(#gradRisk)" dot={{ r: 3, fill: '#ef4444' }} />
                {hasTrajectory && <Line type="monotone" dataKey="overrun" name="overrun" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ExpandableChartCard>

        {/* Analysis summary */}
        <div className="light-card p-5 lg:col-span-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">{t('projectDetail.analysisSummary.title')}</h2>
          <div className="space-y-3">
            {[
              { label: t('projectDetail.analysisSummary.monthsTracked'), value: summary ? `${summary.months_found} / 13` : t('projectDetail.analysisSummary.dbSnapshotOnly'), icon: Clock, color: 'text-blue-500' },
              { label: t('projectDetail.analysisSummary.latestMonth'), value: summary?.latest_month || t('projectDetail.analysisSummary.notAvailable'), icon: Activity, color: 'text-slate-500' },
              { label: t('projectDetail.analysisSummary.peakRiskScore'), value: summary ? `${Math.round(summary.peak_risk_score * 100)} / 100` : `${peakRisk} / 100`, icon: AlertTriangle, color: 'text-red-500' },
              { label: t('projectDetail.analysisSummary.riskTrajectory'), value: riskTrend, icon: TrendingUp, color: riskTrend.includes('↑') ? 'text-red-500' : 'text-emerald-500' },
              { label: t('projectDetail.analysisSummary.peakOverrun'), value: summary ? `+${summary.peak_cost_overrun_pct?.toFixed(1)}%` : `+${project.costOverrunPct.toFixed(1)}%`, icon: IndianRupee, color: 'text-orange-500' },
              { label: t('projectDetail.analysisSummary.ministry'), value: project.ministry, icon: ShieldAlert, color: 'text-[#0d52ce]' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                </div>
                <span className="text-xs font-bold text-slate-800 text-right max-w-[140px] truncate" title={String(value)}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost & Expenditure Trend */}
      {hasTrajectory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpandableChartCard
            className="light-card p-5"
            chartHeight="h-60"
            title={
              <span className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#0d52ce]" />
                {t('projectDetail.charts.budgetVsExpenditure')}
              </span>
            }
          >
            {(isFull) => (
              <ResponsiveContainer width="100%" height={isFull ? 550 : "100%"}>
                <BarChart data={costTrendData} margin={{ top: 10, right: isFull ? 30 : 10, left: isFull ? 10 : -20, bottom: isFull ? 20 : 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: isFull ? 12 : 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: isFull ? 12 : 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()} Cr`]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: isFull ? 12 : 11 }} />
                  <Bar dataKey="original" name={t('projectDetail.legend.originalCost')} fill="#0d52ce" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="revised" name={t('projectDetail.legend.revisedCost')} fill="#f97316" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expenditure" name={t('dashboard.legend.expenditure')} fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ExpandableChartCard>

          {/* Cost overrun % line chart */}
          <ExpandableChartCard
            className="light-card p-5"
            chartHeight="h-60"
            title={
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                {t('projectDetail.charts.costOverrunMonthwise')}
              </span>
            }
          >
            {(isFull) => (
              <ResponsiveContainer width="100%" height={isFull ? 550 : "100%"}>
                <LineChart data={riskTrendData} margin={{ top: 10, right: isFull ? 30 : 10, left: isFull ? 10 : -20, bottom: isFull ? 20 : 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: isFull ? 12 : 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: isFull ? 12 : 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: any) => [`${v}%`]} />
                  <Line type="monotone" dataKey="overrun" name={t('dashboard.legend.costOverrunPct')} stroke="#f97316" strokeWidth={2.5} dot={{ r: 4, fill: '#f97316' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ExpandableChartCard>
        </div>
      )}

      {/* Risk Drivers */}
      <div className="light-card p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('projectDetail.riskAssessment.title')}</h2>
        {hasTrajectory ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">{t('projectDetail.riskAssessment.costRisk')}</span>
                <span className="text-xs font-mono font-bold text-red-600">+{summary?.latest_cost_overrun_pct?.toFixed(1) || '0'}%</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{t('projectDetail.riskAssessment.budgetOverrun')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('projectDetail.riskAssessment.budgetOverrunBody', { pct: summary?.latest_cost_overrun_pct?.toFixed(1) || '0', peak: summary?.peak_cost_overrun_pct?.toFixed(1) || '0' })}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">{t('projectDetail.riskAssessment.riskTrend')}</span>
                <span className="text-xs font-mono font-bold text-amber-600">{riskTrend}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{t('projectDetail.riskAssessment.trajectoryAnalysis')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('projectDetail.riskAssessment.trajectoryAnalysisBody', { from: riskScores[0] || 0, to: riskScores[riskScores.length - 1] || 0, months: trajectoryData.length })}</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">{t('dashboard.legend.expenditure')}</span>
                <span className="text-xs font-mono font-bold text-blue-600">₹{summary?.total_expenditure_cr?.toLocaleString() || '0'} Cr</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{t('projectDetail.riskAssessment.utilisationRate')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('projectDetail.riskAssessment.utilisationRateBody', { months: trajectoryData.length })}</p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-sm">
            <p className="font-bold text-slate-700 mb-2">{t('projectDetail.riskAssessment.notFound', { code: project.code })}</p>
            <p className="text-xs max-w-md mx-auto">{t('projectDetail.riskAssessment.notFoundBody')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
