import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { 
  MapPin, Activity, ChevronDown, Download, AlertTriangle, Lightbulb 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell
} from 'recharts';

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
  const [selectedMonth, setSelectedMonth] = useState('2026-07');

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
            <h1 className="text-xl font-bold text-slate-900">State & Physical Progress Intelligence</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Analyze geographical distribution and execution stage of infrastructure projects.
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
            <span>Export</span><Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d52ce]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="light-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900">Top 10 States by Project Count</h3>
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStates} layout="vertical" margin={{ left: 30, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Projects" radius={[0, 4, 4, 0]}>
                      {topStates.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#0d52ce' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="light-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900">Physical Progress Distribution</h3>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Projects" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="light-card p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">Geographic Concentration</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {topStates[0]?.name} leads with {topStates[0]?.count} projects, making up {((topStates[0]?.count / totalProjects) * 100).toFixed(1)}% of the national portfolio. Resource allocation algorithms suggest optimizing supply chains in this region.
                </p>
              </div>
            </div>

            <div className="light-card p-4 border-l-4 border-l-orange-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Execution Bottleneck</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">Stagnant Completion Phase</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {progressData.find((p: any) => p.name === '90-100')?.count || 0} projects are in the 90-100% completion bracket. Predictive models highlight a historically high stall rate in this final phase due to delayed clearances.
                </p>
              </div>
            </div>

            <div className="light-card p-4 border-l-4 border-l-blue-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Early Stage Monitor</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">Initial Mobilization</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {progressData.find((p: any) => p.name === '0-10')?.count || 0} projects are just starting (0-10%). Now is the critical window to enforce proactive cost-control measures to prevent long-term overruns.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
