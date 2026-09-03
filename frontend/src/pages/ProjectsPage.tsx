import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProjectData } from '../data/mockData';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  Search,
  ArrowUpDown,
  Layers,
  RefreshCw,
  Calendar
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  // Sorting state
  const [sortField, setSortField] = useState<keyof ProjectData>('overallRiskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
  }, [searchTerm, selectedMinistry, selectedSector, selectedState, selectedStatus, costImpactFilter, delayImpactFilter]);

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

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMinistry('ALL');
    setSelectedSector('ALL');
    setSelectedState('ALL');
    setSelectedStatus('ALL');
    setCostImpactFilter('ALL');
    setDelayImpactFilter('ALL');
    localStorage.removeItem('paimana_explorer_filters');
  };

  const getRiskBadge = (score: number) => {
    if (score >= 85 || score > 0.8) return <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold">High Risk ({score})</span>;
    if (score >= 50) return <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-[11px] font-bold">At Risk ({score})</span>;
    if (score >= 35) return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">Moderate ({score})</span>;
    return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-bold">Active ({score})</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans pb-6">
      {/* Header Banner */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#0d52ce]" />
            <h1 className="text-xl font-bold text-slate-900">Project Explorer & Search Matrix</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Searchable, multi-column filtered directory of national infrastructure projects. Click any row for Deep Intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            Showing <strong>{filteredProjects.length}</strong> of {projects.length} Projects
          </span>
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>
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
              placeholder="Search by project name or code..."
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
              <option value="ALL">All Ministries</option>
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
              <option value="ALL">All Sectors</option>
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
              <option value="ALL">All States</option>
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
              <option value="ALL">All Risk Tiers</option>
              <option value="High Risk">High Risk</option>
              <option value="At Risk">At Risk</option>
              <option value="Moderate">Moderate</option>
              <option value="Active">Active</option>
            </select>
          </div>

          <div>
            <select
              value={costImpactFilter}
              onChange={(e) => setCostImpactFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            >
              <option value="ALL">All Cost Variances</option>
              <option value="high">Cost Overrun &gt; 10%</option>
            </select>
          </div>

          <div>
            <select
              value={delayImpactFilter}
              onChange={(e) => setDelayImpactFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            >
              <option value="ALL">All Schedule Variances</option>
              <option value="90">Schedule Delay &gt; 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Data Table */}
      <div className="light-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider">
                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-slate-900 transition">
                  <div className="flex items-center space-x-1">
                    <span>Project Name & Code</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('overallRiskScore')} className="p-4 cursor-pointer hover:text-slate-900 transition">
                  <div className="flex items-center space-x-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-4">Ministry & Sector</th>
                <th className="p-4">State</th>
                <th className="p-4">Next Milestone</th>
                <th onClick={() => handleSort('costOverrunPct')} className="p-4 cursor-pointer hover:text-slate-900 transition">
                  <div className="flex items-center space-x-1">
                    <span>Cost Overrun</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('scheduleDelayDays')} className="p-4 cursor-pointer hover:text-slate-900 transition">
                  <div className="flex items-center space-x-1">
                    <span>Schedule Delay</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="p-4">
                      <p className="font-extrabold text-slate-900 text-xs">{p.name}</p>
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

                    <td className="p-4 max-w-xs">
                      <p className="text-slate-800 font-medium truncate">{p.nextMilestone}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Due: {p.nextMilestoneDate}</span>
                      </p>
                    </td>

                    <td className="p-4 font-bold">
                      <span className={p.costOverrunPct >= 15 ? 'text-red-600' : p.costOverrunPct >= 8 ? 'text-orange-600' : 'text-emerald-600'}>
                        +{p.costOverrunPct.toFixed(1)}%
                      </span>
                    </td>

                    <td className="p-4 font-bold">
                      <span className={p.scheduleDelayDays >= 180 ? 'text-red-600' : p.scheduleDelayDays >= 90 ? 'text-orange-600' : 'text-emerald-600'}>
                        +{p.scheduleDelayDays} Days
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button className="px-3 py-1.5 rounded-xl bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-xs font-bold shadow-sm transition">
                        Intelligence →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                    No projects match the active filter criteria. Click "Reset Filters" to clear.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
