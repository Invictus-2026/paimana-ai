import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { 
  MapPin, Activity, ChevronDown, Download, AlertTriangle, Lightbulb 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell
} from 'recharts';
import { IndiaMap } from '../components/IndiaMap';
import { ExpandableChartCard } from '../components/common/ExpandableChartCard';

const MONTHS_LIST = [
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"
];

const MONTH_LABELS: Record<string, string> = {
  "2025-07":"Jul '25","2025-08":"Aug '25","2025-09":"Sep '25","2025-10":"Oct '25",
  "2025-11":"Nov '25","2025-12":"Dec '25","2026-01":"Jan '26","2026-02":"Feb '26",
  "2026-03":"Mar '26","2026-04":"Apr '26","2026-05":"May '26","2026-06":"Jun '26",
  "2026-07":"Jul '26",
};

export const StateProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [activeState, setActiveState] = useState<any>(null);

  const { data: stateDataRes, isLoading: statesLoading } = useQuery({
    queryKey: ['monthly-state', selectedMonth],
    queryFn: () => api.getMonthlyState(selectedMonth),
  });

  const { data: progressDataRes, isLoading: progressLoading } = useQuery({
    queryKey: ['monthly-progress', selectedMonth],
    queryFn: () => api.getMonthlyPhysicalProgress(selectedMonth),
  });

  const stateData = stateDataRes?.data?.states || [];
  const progressData = progressDataRes?.data?.progress || [];

  const isLoading = statesLoading || progressLoading;

  const topStates = [...stateData].sort((a: any, b: any) => b.count - a.count).slice(0, 10);
  const totalProjects = stateData.reduce((acc: number, curr: any) => acc + curr.count, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans pb-6">
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#0d52ce]" />
            <h1 className="text-xl font-bold text-slate-900">{t('stateProgress.title')}</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {t('stateProgress.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-4 py-2.5 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0d52ce] cursor-pointer"
            >
              {MONTHS_LIST.map(m => (
                <option key={m} value={m}>{MONTH_LABELS[m]}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="flex items-center space-x-2 bg-[#0d52ce] hover:bg-[#0b45ad] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition">
            <span>{t('dashboard.export')}</span><Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d52ce]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* India Map */}
            <div className="light-card p-0 lg:col-span-7 flex flex-col h-[500px] relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
               <div className="absolute top-4 left-4 z-10 flex items-center flex-wrap gap-2 max-w-[80%] bg-white/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                   <span className="w-2.5 h-2.5 bg-[#f8fafc] border border-slate-200 block rounded-[2px]"></span> 0
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                   <span className="w-2.5 h-2.5 bg-[#bfdbfe] block rounded-[2px]"></span> 1-20
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                   <span className="w-2.5 h-2.5 bg-[#60a5fa] block rounded-[2px]"></span> 21-50
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                   <span className="w-2.5 h-2.5 bg-[#3b82f6] block rounded-[2px]"></span> 51-100
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                   <span className="w-2.5 h-2.5 bg-[#1d4ed8] block rounded-[2px]"></span> 101-200
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                   <span className="w-2.5 h-2.5 bg-[#1e3a8a] block rounded-[2px]"></span> 200+
                 </div>
               </div>
               
               <div className="w-full h-full p-4 pt-16">
                 <IndiaMap 
                   stateData={stateData}
                   activeState={activeState} 
                   onStateClick={setActiveState} 
                 />
               </div>
            </div>
            
            {/* Click Details Card */}
            <div className="light-card p-6 lg:col-span-5 flex flex-col relative overflow-hidden">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">{t('stateProgress.regionalIntelligence')}</h3>

              {activeState ? (
                <div className="animate-in fade-in zoom-in-95 duration-200 space-y-5 mt-2">
                  <h2 className="text-3xl font-black text-[#0d52ce] leading-none">{activeState.name}</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                       <span className="block text-[10px] font-bold text-slate-500 uppercase">{t('stateProgress.activeProjects')}</span>
                       <span className="block text-2xl font-black text-slate-900 mt-1">{activeState.count}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                       <span className="block text-[10px] font-bold text-emerald-600 uppercase">{t('dashboard.kpi.originalBudget')}</span>
                       <span className="block text-lg font-black text-emerald-900 mt-1">₹{Math.round(activeState.orig_cost_cr).toLocaleString()}Cr</span>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                     <span className="block text-[10px] font-bold text-orange-600 uppercase">{t('dashboard.kpi.cumulativeExpenditure')}</span>
                     <span className="block text-xl font-black text-orange-900 mt-1">₹{Math.round(activeState.expenditure_cr).toLocaleString()}Cr</span>
                     <div className="w-full bg-orange-200 h-1.5 mt-3 rounded-full overflow-hidden">
                       <div className="bg-orange-500 h-full" style={{ width: `${Math.min(100, (activeState.expenditure_cr / activeState.orig_cost_cr) * 100)}%` }}></div>
                     </div>
                     <span className="block text-[10px] text-orange-600/80 font-bold mt-1 text-right">
                       {t('stateProgress.pctSpent', { pct: ((activeState.expenditure_cr / activeState.orig_cost_cr) * 100).toFixed(1) })}
                     </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                     <span className="block text-xs font-bold text-slate-500">{t('stateProgress.revisedCostEstimate')}</span>
                     <span className="block text-sm font-black text-slate-900">₹{Math.round(activeState.revised_cost_cr).toLocaleString()}Cr</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <MapPin className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-sm font-medium text-slate-500">{t('stateProgress.clickStateHint')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpandableChartCard
              className="light-card p-5"
              chartHeight="h-72"
              title={t('stateProgress.charts.topStatesTitle')}
              headerRight={<MapPin className="w-4 h-4 text-slate-400" />}
            >
              {(isFull) => (
                <ResponsiveContainer width="100%" height={isFull ? 550 : "100%"}>
                  <BarChart data={topStates} layout="vertical" margin={{ left: isFull ? 10 : 30, right: isFull ? 40 : 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: isFull ? 12 : 11, fill: '#64748b' }} width={isFull ? 150 : 90} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="count" name={t('dashboard.legend.projects')} radius={[0, 4, 4, 0]} barSize={isFull ? 24 : undefined}>
                      {topStates.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#0d52ce' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ExpandableChartCard>

            <ExpandableChartCard
              className="light-card p-5"
              chartHeight="h-72"
              title={t('stateProgress.charts.physicalProgressTitle')}
              headerRight={<Activity className="w-4 h-4 text-slate-400" />}
            >
              {(isFull) => (
                <ResponsiveContainer width="100%" height={isFull ? 550 : "100%"}>
                  <BarChart data={progressData} margin={{ top: 10, right: isFull ? 30 : 10, left: isFull ? 10 : -20, bottom: isFull ? 20 : 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: isFull ? 12 : 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: isFull ? 12 : 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="count" name={t('dashboard.legend.projects')} fill="#f97316" radius={[4, 4, 0, 0]} barSize={isFull ? 45 : undefined} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ExpandableChartCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="light-card p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t('stateProgress.insights.aiInsight')}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{t('stateProgress.insights.geoConcentrationTitle')}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('stateProgress.insights.geoConcentrationBody', { name: topStates[0]?.name, count: topStates[0]?.count, pct: ((topStates[0]?.count / totalProjects) * 100).toFixed(1) })}
                </p>
              </div>
            </div>

            <div className="light-card p-4 border-l-4 border-l-orange-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t('stateProgress.insights.executionBottleneck')}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{t('stateProgress.insights.stagnantPhaseTitle')}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('stateProgress.insights.stagnantPhaseBody', { count: progressData.find((p: any) => p.name === '90-100')?.count || 0 })}
                </p>
              </div>
            </div>

            <div className="light-card p-4 border-l-4 border-l-blue-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t('stateProgress.insights.earlyStageMonitor')}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{t('stateProgress.insights.initialMobilizationTitle')}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('stateProgress.insights.initialMobilizationBody', { count: progressData.find((p: any) => p.name === '0-10')?.count || 0 })}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
