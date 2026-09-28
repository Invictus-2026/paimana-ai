import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProjectData } from '../data/mockData';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  Search,
  ArrowUpDown,
  Layers,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Load active filters from URL query parameters or localStorage fallback
  const initialSearch = searchParams.get('search') || '';
  const initialMinistry = searchParams.get('ministry') || 'ALL';
  const initialSector = searchParams.get('sector') || 'ALL';
  const initialState = searchParams.get('state') || 'ALL';
  const initialStatus = searchParams.get('status') || searchParams.get('risk_tier') || 'ALL';
  const initialCostImpact = searchParams.get('costOverrun') || 'ALL';
  const initialDelayImpact = searchParams.get('delayDays') || 'ALL';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedMinistry, setSelectedMinistry] = useState(initialMinistry);
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [costImpactFilter, setCostImpactFilter] = useState(initialCostImpact);
  const [delayImpactFilter, setDelayImpactFilter] = useState(initialDelayImpact);
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', selectedMonth],
    queryFn: () => api.getProjects(selectedMonth),
  });

  const { data: availableMonthsRes } = useQuery({
    queryKey: ['available-months'],
    queryFn: api.getMonthlyAvailableMonths,
  });
  const availableMonths: Array<{month: string; label: string}> = availableMonthsRes?.data?.months || [];

  // Sorting state
  const [sortField, setSortField] = useState<keyof ProjectData>('overallRiskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Sync active filter state to URL search parameters & localStorage
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedMinistry !== 'ALL') params.ministry = selectedMinistry;
    if (selectedSector !== 'ALL') params.sector = selectedSector;
    if (selectedState !== 'ALL') params.state = selectedState;
    if (selectedStatus !== 'ALL') params.status = selectedStatus;
    if (costImpactFilter !== 'ALL') params.costOverrun = costImpactFilter;
    if (delayImpactFilter !== 'ALL') params.delayDays = delayImpactFilter;

    setSearchParams(params, { replace: true });
    localStorage.setItem('paimana_explorer_filters', JSON.stringify(params));
  }, [searchTerm, selectedMinistry, selectedSector, selectedState, selectedStatus, costImpactFilter, delayImpactFilter, setSearchParams]);

  // Unique dropdown option sets
  const ministries = useMemo(() => Array.from(new Set(projects.map(p => p.ministry))), [projects]);
  const sectors = useMemo(() => Array.from(new Set(projects.map(p => p.sector))), [projects]);
  const states = useMemo(() => Array.from(new Set(projects.map(p => p.state))), [projects]);

  // Filter & sort execution
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.code.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedMinistry !== 'ALL' && p.ministry !== selectedMinistry) return false;
      if (selectedSector !== 'ALL' && p.sector !== selectedSector) return false;
      if (selectedState !== 'ALL' && p.state !== selectedState) return false;
      if (selectedStatus !== 'ALL' && p.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      if (costImpactFilter === 'high' && p.costOverrunPct < 10) return false;
      if (delayImpactFilter === '90' && p.scheduleDelayDays < 90) return false;
      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchTerm, selectedMinistry, selectedSector, selectedState, selectedStatus, costImpactFilter, delayImpactFilter, sortField, sortOrder, projects]);

  const handleSort = (field: keyof ProjectData) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMinistry, selectedSector, selectedState, selectedStatus, costImpactFilter, delayImpactFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMinistry('ALL');
    setSelectedSector('ALL');
    setSelectedState('ALL');
    setSelectedStatus('ALL');
    setCostImpactFilter('ALL');
    setDelayImpactFilter('ALL');
    setSelectedMonth('ALL');
    localStorage.removeItem('paimana_explorer_filters');
  };

  const getRiskBadge = (score: number) => {
    if (score >= 85 || score > 0.8) return <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold whitespace-nowrap">{t('common.riskTier.highRisk')} ({score})</span>;
    if (score >= 50) return <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-[11px] font-bold whitespace-nowrap">{t('common.riskTier.atRisk')} ({score})</span>;
    if (score >= 35) return <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold whitespace-nowrap">{t('common.riskTier.moderate')} ({score})</span>;
    return <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-bold whitespace-nowrap">{t('common.riskTier.active')} ({score})</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans pb-6">
      {/* Header Banner */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#0d52ce]" />
            <h1 className="text-xl font-bold text-slate-900">{t('projects.title')}</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {t('projects.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            {t('projects.showingCount', { shown: filteredProjects.length, total: projects.length })}
          </span>
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('projects.resetFilters')}</span>
          </button>
        </div>
      </div>

      {/* Month Selector Strip */}
      <div className="light-card p-3 bg-white">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>{t('projects.snapshotMonth')}</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setSelectedMonth('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                selectedMonth === 'ALL' ? 'bg-[#0d52ce] text-white border-[#0d52ce]' : 'text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >{t('common.all')}</button>
            {availableMonths.map(m => (
              <button
                key={m.month}
                onClick={() => setSelectedMonth(m.month)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  selectedMonth === m.month ? 'bg-[#0d52ce] text-white border-[#0d52ce]' : 'text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="light-card p-4 space-y-3 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('projects.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition"
            />
          </div>

          {/* Ministry Filter */}
          <div>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            >
              <option value="ALL">{t('projects.filters.allMinistries')}</option>
              {ministries.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            >
              <option value="ALL">{t('projects.filters.allSectors')}</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            >
              <option value="ALL">{t('projects.filters.allStates')}</option>
              {states.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            >
              <option value="ALL">{t('projects.filters.allRiskTiers')}</option>
              <option value="High Risk">{t('common.riskTier.highRisk')}</option>
              <option value="At Risk">{t('common.riskTier.atRisk')}</option>
              <option value="Moderate">{t('common.riskTier.moderate')}</option>
              <option value="Active">{t('common.riskTier.active')}</option>
            </select>
          </div>

          <div>
            <select
              value={costImpactFilter}
              onChange={(e) => setCostImpactFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            >
              <option value="ALL">{t('projects.filters.allCostVariances')}</option>
              <option value="high">{t('projects.filters.costOverrunOver10')}</option>
            </select>
          </div>

          <div>
            <select
              value={delayImpactFilter}
              onChange={(e) => setDelayImpactFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            >
              <option value="ALL">{t('projects.filters.allScheduleVariances')}</option>
              <option value="90">{t('projects.filters.scheduleDelayOver90')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Data Table */}
      <div className="light-card overflow-hidden">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-xs border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider">
                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-slate-900 transition min-w-[320px]">
                  <div className="flex items-center space-x-1">
                    <span>{t('projects.table.nameCode')}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('overallRiskScore')} className="p-4 cursor-pointer hover:text-slate-900 transition min-w-[120px]">
                  <div className="flex items-center space-x-1">
                    <span>{t('projects.table.riskScore')}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 min-w-[220px]">{t('projects.table.ministrySector')}</th>
                <th className="p-4 min-w-[120px]">{t('projects.table.state')}</th>
                <th onClick={() => handleSort('budgetCr')} className="p-4 cursor-pointer hover:text-slate-900 transition min-w-[120px]">
                  <div className="flex items-center space-x-1">
                    <span>{t('projects.table.budget')}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 min-w-[200px]">{t('projects.table.nextMilestone')}</th>
                <th onClick={() => handleSort('costOverrunPct')} className="p-4 cursor-pointer hover:text-slate-900 transition min-w-[140px]">
                  <div className="flex items-center space-x-1">
                    <span>{t('projects.table.costOverrun')}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('scheduleDelayDays')} className="p-4 cursor-pointer hover:text-slate-900 transition min-w-[140px]">
                  <div className="flex items-center space-x-1">
                    <span>{t('projects.table.scheduleDelay')}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 text-right min-w-[120px]">{t('projects.table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedProjects.length > 0 ? (
                paginatedProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="p-4">
                      <p className="font-extrabold text-slate-900 text-xs pr-4">{p.name}</p>
                      <p className="text-[11px] text-[#0d52ce] font-mono font-semibold mt-0.5">{p.code} • ₹{p.budgetCr.toLocaleString()} Cr</p>
                    </td>

                    <td className="p-4">
                      {getRiskBadge(p.overallRiskScore)}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-xs">{p.ministry}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{p.sector}</p>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {p.state}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-xs">₹{p.budgetCr.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t('projects.table.exp', { amount: p.cumulativeExpenditureCr.toLocaleString() })}</p>
                    </td>

                    <td className="p-4 pr-4">
                      <p className="text-slate-800 font-medium line-clamp-2">{p.nextMilestone}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{t('projects.table.due', { date: p.nextMilestoneDate })}</span>
                      </p>
                    </td>

                    <td className="p-4 font-bold">
                      <span className={p.costOverrunPct >= 15 ? 'text-red-600' : p.costOverrunPct >= 8 ? 'text-orange-600' : 'text-emerald-600'}>
                        +{p.costOverrunPct.toFixed(1)}%
                      </span>
                    </td>

                    <td className="p-4 font-bold">
                      <span className={p.scheduleDelayDays >= 180 ? 'text-red-600' : p.scheduleDelayDays >= 90 ? 'text-orange-600' : 'text-emerald-600'}>
                        {t('projects.table.daysSuffix', { count: p.scheduleDelayDays })}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button className="px-3 py-1.5 rounded-xl bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-xs font-bold shadow-sm transition">
                        {t('projects.table.intelligence')}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                    {t('projects.table.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border-t border-slate-100 gap-4">
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              {t('projects.pagination.showingRange', { from: (currentPage - 1) * itemsPerPage + 1, to: Math.min(currentPage * itemsPerPage, filteredProjects.length), total: filteredProjects.length })}
            </div>
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center px-1 space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        currentPage === pageNum
                          ? 'bg-[#0d52ce] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
