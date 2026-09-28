import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import {
  Award,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ExpandableChartCard } from '../components/common/ExpandableChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface BenchmarkGroup {
  category: string;
  sample_size: number;
  meets_minimum_threshold: boolean;
  data_status: string;
  total_budget_cr: number | null;
  avg_risk_score: number | null;
  avg_cost_growth_pct: number | null;
  avg_delay_days: number | null;
  on_time_milestone_rate: number | null;
  critical_risk_count: number | null;
  high_risk_count: number | null;
}

interface BenchmarkData {
  dimension: string;
  transparency_metadata: {
    total_projects_analyzed: number;
    total_groups: number;
    valid_groups_count: number;
    minimum_sample_size_threshold: number;
    data_completeness_pct: number;
    time_period_covered: string;
    evaluation_type: string;
  };
  explanatory_annotations: {
    what_am_i_looking_at: string;
    why_might_pattern_exist: string;
    what_should_not_be_concluded: string;
  };
  benchmark_groups: BenchmarkGroup[];
}

export const BenchmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDimension, setSelectedDimension] = useState<string>('sector');
  const [selectedSectorFilter] = useState<string>('ALL');

  // Fetch benchmark analytics from FastAPI backend endpoint
  const { data } = useQuery<{ data: BenchmarkData }>({
    queryKey: ['benchmarks', selectedDimension, selectedSectorFilter],
    queryFn: () => api.getBenchmarks(selectedDimension, selectedSectorFilter),
  });

  const benchmarkData = data?.data;

  const dimensions = [
    { key: 'sector', label: t('benchmarks.dimensions.sector') },
    { key: 'ministry', label: t('benchmarks.dimensions.lineMinistry') },
    { key: 'geographic_region', label: t('benchmarks.dimensions.geographicRegion') },
    { key: 'implementation_stage', label: t('benchmarks.dimensions.implementationStage') },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans pb-6">
      {/* Header Banner */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#0d52ce]" />
            <h1 className="text-xl font-bold text-slate-900">{t('benchmarks.title')}</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {t('benchmarks.subtitle')}
          </p>
        </div>

        {/* Dimension Switchers */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          {dimensions.map((dim) => (
            <button
              key={dim.key}
              onClick={() => setSelectedDimension(dim.key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                selectedDimension === dim.key
                  ? 'bg-[#0d52ce] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {dim.label}
            </button>
          ))}
        </div>
      </div>

      <button className="rounded-xl border bg-white px-4 py-2 text-sm text-blue-700" onClick={()=>navigate('/intelligence?tab=contractors')}>{t('benchmarks.openInfraScore')}</button>
      {/* Prominent Data Transparency Indicators Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Projects Analyzed */}
        <div className="light-card p-4 flex items-center justify-between border-l-4 border-l-[#0d52ce]">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('benchmarks.metrics.sampleSize')}</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5 font-sans">
              {benchmarkData?.transparency_metadata.total_projects_analyzed ?? 0} <span className="text-xs font-normal text-slate-400">{t('analytics.totalProjects')}</span>
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0d52ce] text-[10px] font-bold border border-blue-200">
            {t('benchmarks.metrics.validGroups', { count: benchmarkData?.transparency_metadata.valid_groups_count ?? 0 })}
          </span>
        </div>

        {/* Metric 2: Time Window */}
        <div className="light-card p-4 flex items-center justify-between border-l-4 border-l-orange-500">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('benchmarks.metrics.timeWindow')}</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">
              {benchmarkData?.transparency_metadata.time_period_covered || t('benchmarks.metrics.unavailable')}
            </p>
          </div>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
            {t('benchmarks.metrics.twelveMonths')}
          </span>
        </div>

        {/* Metric 3: Data Completeness Score */}
        <div className="light-card p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('benchmarks.metrics.dataCompleteness')}</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5 font-sans">
              {benchmarkData?.transparency_metadata.data_completeness_pct ?? t('benchmarks.metrics.unavailable')}%
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        {/* Metric 4: Statistical Safeguard Minimum Threshold */}
        <div className="light-card p-4 flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('benchmarks.metrics.safeguardThreshold')}</span>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">
              {t('benchmarks.metrics.minProjects', { n: benchmarkData?.transparency_metadata.minimum_sample_size_threshold || 3 })}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
            {t('benchmarks.metrics.activeGuardrail')}
          </span>
        </div>
      </div>

      {/* Mandatory 3-Question Pedagogical Annotation Card */}
      <div className="light-card p-5 bg-gradient-to-r from-blue-50/60 via-slate-50 to-white border border-blue-200/80 space-y-3">
        <div className="flex items-center space-x-2 border-b border-blue-100 pb-2">
          <Info className="w-4 h-4 text-[#0d52ce]" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {t('benchmarks.annotation.heading')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Question 1: What am I looking at? */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
            <span className="font-extrabold text-[#0d52ce] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> {t('benchmarks.annotation.q1')}
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {benchmarkData?.explanatory_annotations.what_am_i_looking_at || t('benchmarks.annotation.q1Fallback')}
            </p>
          </div>

          {/* Question 2: Why might this pattern exist? */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
            <span className="font-extrabold text-orange-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> {t('benchmarks.annotation.q2')}
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {benchmarkData?.explanatory_annotations.why_might_pattern_exist || t('benchmarks.annotation.q2Fallback')}
            </p>
          </div>

          {/* Question 3: What should I NOT conclude? */}
          <div className="p-3.5 rounded-xl bg-white border border-red-200 bg-red-50/10 space-y-1 shadow-sm">
            <span className="font-extrabold text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> {t('benchmarks.annotation.q3')}
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {benchmarkData?.explanatory_annotations.what_should_not_be_concluded || t('benchmarks.annotation.q3Fallback')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Average Delay Days vs Cost Growth (%) Bar Chart (7 Cols) */}
        <ExpandableChartCard
          className="light-card p-5 lg:col-span-7 space-y-4"
          chartHeight="h-72"
          title={
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0d52ce]" />
              {t('benchmarks.charts.comparativeTitle', { dimension: selectedDimension })}
            </span>
          }
          subtitle={t('benchmarks.charts.aggregatedSummary')}
        >
          {(isFull) => (
            <div className="h-full pt-2">
              <ResponsiveContainer width="100%" height={isFull ? 550 : "100%"}>
                <BarChart
                  data={benchmarkData?.benchmark_groups || []}
                  margin={{ top: 10, right: isFull ? 30 : 10, left: isFull ? 10 : -20, bottom: isFull ? 40 : 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="category" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: isFull ? 12 : 11, fill: '#64748b' }} angle={isFull ? -15 : 0} textAnchor={isFull ? 'end' : 'middle'} height={isFull ? 60 : 30} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: isFull ? 12 : 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: isFull ? 12 : 11 }} />
                  <Bar dataKey="avg_delay_days" name={t('benchmarks.charts.avgScheduleDelay')} fill="#0d52ce" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_cost_growth_pct" name={t('analytics.legend.avgCostGrowth')} fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ExpandableChartCard>

        {/* Chart 2: Milestone Completion Rate (%) Gauge / Breakdown (5 Cols) */}
        <div className="light-card p-5 lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('benchmarks.milestoneRate.title')}</span>
              </h2>
            </div>

            <div className="space-y-3 mt-4">
              {benchmarkData?.benchmark_groups.map((grp: any) => (
                <div key={grp.category} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{grp.category}</span>
                    {grp.meets_minimum_threshold ? (
                      <span className="font-mono font-bold text-emerald-600">{t('benchmarks.milestoneRate.onTimePct', { pct: grp.on_time_milestone_rate })}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 font-bold text-[10px]">
                        {t('benchmarks.milestoneRate.insufficientData', { n: grp.sample_size })}
                      </span>
                    )}
                  </div>

                  {grp.meets_minimum_threshold && (
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${grp.on_time_milestone_rate}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium">
            {t('benchmarks.milestoneRate.note')}
          </div>
        </div>
      </div>

      {/* Group Detail Table with Statistical Guardrail Banners */}
      <div className="light-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {t('benchmarks.table.title')}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {t('benchmarks.table.minThresholdGuardrail')} <strong>N ≥ 3</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">{t('benchmarks.table.categoryGroup')}</th>
                <th className="p-3.5">{t('benchmarks.metrics.sampleSize')}</th>
                <th className="p-3.5">{t('benchmarks.table.thresholdStatus')}</th>
                <th className="p-3.5">{t('benchmarks.table.totalCapital')}</th>
                <th className="p-3.5">{t('benchmarks.table.avgRiskIndex')}</th>
                <th className="p-3.5">{t('benchmarks.table.costVariance')}</th>
                <th className="p-3.5">{t('benchmarks.table.avgDelayDays')}</th>
                <th className="p-3.5 text-right">{t('projects.table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {benchmarkData?.benchmark_groups.map((grp: any) => (
                <tr key={grp.category} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-900">{grp.category}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-700">{t('benchmarks.table.nEquals', { n: grp.sample_size })}</td>

                  <td className="p-3.5">
                    {grp.meets_minimum_threshold ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                        {t('benchmarks.table.validAggregation')}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" />
                        {t('benchmarks.table.insufficientDataShort')}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 font-bold text-slate-800">
                    {grp.meets_minimum_threshold ? `₹${grp.total_budget_cr?.toLocaleString()} Cr` : '—'}
                  </td>

                  <td className="p-3.5 font-bold">
                    {grp.meets_minimum_threshold ? (
                      <span className={grp.avg_risk_score! >= 75 ? 'text-red-600' : 'text-slate-800'}>
                        {grp.avg_risk_score} / 100
                      </span>
                    ) : '—'}
                  </td>

                  <td className="p-3.5 font-bold">
                    {grp.meets_minimum_threshold ? (
                      <span className="text-orange-600">+{grp.avg_cost_growth_pct}%</span>
                    ) : '—'}
                  </td>

                  <td className="p-3.5 font-bold">
                    {grp.meets_minimum_threshold ? (
                      <span className="text-red-600">{t('benchmarks.table.plusDays', { count: grp.avg_delay_days })}</span>
                    ) : '—'}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => navigate(`/projects?${selectedDimension==='ministry'?'ministry':selectedDimension==='geographic_region'?'state':selectedDimension==='sector'?'sector':'status'}=${encodeURIComponent(grp.category)}`)}
                      className="px-3 py-1.5 rounded-xl bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-xs font-bold shadow-sm transition flex items-center space-x-1 ml-auto"
                    >
                      <span>{t('benchmarks.table.filterProjects')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
