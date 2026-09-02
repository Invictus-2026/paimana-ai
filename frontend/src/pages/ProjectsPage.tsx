import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS, ProjectData } from '../data/mockData';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Layers,
  ChevronRight,
  RefreshCw,
  Sliders,
  Calendar,
  AlertTriangle
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
  const ministries = useMemo(() => Array.from(new Set(MOCK_PROJECTS.map(p => p.ministry))), []);
  const sectors = useMemo(() => Array.from(new Set(MOCK_PROJECTS.map(p => p.sector))), []);
  const states = useMemo(() => Array.from(new Set(MOCK_PROJECTS.map(p => p.state))), []);

  // Filter & sort execution
  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => {
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
  }, [searchTerm, selectedMinistry, selectedSector, selectedState, selectedStatus, costImpactFilter, delayImpactFilter, sortField, sortOrder]);

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
    if (score >= 75) return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold">Critical ({score})</span>;
    if (score >= 50) return <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold">High ({score})</span>;
    if (score >= 35) return <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] font-bold">Moderate ({score})</span>;
    return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">Low ({score})</span>;
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131c31] border border-[#23304a] p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h1 className="text-xl font-extrabold text-white font-outfit">Project Explorer & Search Matrix</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Searchable, multi-column filtered directory of national infrastructure projects. Click any row for Deep Intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-300 bg-[#1b253b] px-3 py-1.5 rounded-lg border border-[#283654]">
            Showing <strong>{filteredProjects.length}</strong> of {MOCK_PROJECTS.length} Projects
          </span>
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1b253b] hover:bg-[#253350] text-slate-300 rounded-lg text-xs font-bold border border-[#283654] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="dark-dashboard-card p-4 space-y-3 bg-[#111827]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1b253b] border border-[#283654] text-xs text-white placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Ministry Filter */}
          <div>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full bg-[#1b253b] border border-[#283654] text-xs text-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500"
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
              className="w-full bg-[#1b253b] border border-[#283654] text-xs text-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500"
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
              className="w-full bg-[#1b253b] border border-[#283654] text-xs text-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All States</option>
              {states.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

        {/* Secondary Impact & Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#1e2b45]">
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#1b253b] border border-[#283654] text-xs text-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="Critical">Critical (Score ≥ 75)</option>
              <option value="At Risk">High / At Risk (50-74)</option>
              <option value="Moderate">Moderate (25-49)</option>
              <option value="Active">Low / Active (&lt;25)</option>
            </select>
          </div>

          <div>
            <select
              value={costImpactFilter}
              onChange={(e) => setCostImpactFilter(e.target.value)}
              className="w-full bg-[#1b253b] border border-[#283654] text-xs text-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Cost Variances</option>
              <option value="high">Cost Overrun &gt; 10%</option>
            </select>
          </div>

          <div>
            <select
              value={delayImpactFilter}
              onChange={(e) => setDelayImpactFilter(e.target.value)}
              className="w-full bg-[#1b253b] border border-[#283654] text-xs text-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Schedule Variances</option>
              <option value="90">Schedule Delay &gt; 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Data Table */}
      <div className="dark-dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#10172a] text-slate-400 border-b border-[#23304a] font-bold uppercase tracking-wider text-[10px]">
                <th onClick={() => handleSort('name')} className="p-3.5 cursor-pointer hover:text-white transition">
                  <div className="flex items-center space-x-1">
                    <span>Project Name & Code</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('overallRiskScore')} className="p-3.5 cursor-pointer hover:text-white transition">
                  <div className="flex items-center space-x-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5">Ministry & Sector</th>
                <th className="p-3.5">State</th>
                <th onClick={() => handleSort('nextMilestone')} className="p-3.5">Next Milestone</th>
                <th onClick={() => handleSort('costOverrunPct')} className="p-3.5 cursor-pointer hover:text-white transition">
                  <div className="flex items-center space-x-1">
                    <span>Cost Overrun</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('scheduleDelayDays')} className="p-3.5 cursor-pointer hover:text-white transition">
                  <div className="flex items-center space-x-1">
                    <span>Schedule Delay</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2b45] bg-[#131b2e]">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-[#1c2742] cursor-pointer transition"
                  >
                    <td className="p-3.5">
                      <p className="font-extrabold text-white text-xs">{p.name}</p>
                      <p className="text-[10px] text-blue-400 font-mono mt-0.5">{p.code} • ₹{p.budgetCr.toLocaleString()} Cr</p>
                    </td>

                    <td className="p-3.5">
                      {getRiskBadge(p.overallRiskScore)}
                    </td>

                    <td className="p-3.5">
                      <p className="font-medium text-slate-200">{p.ministry}</p>
                      <p className="text-[10px] text-slate-400">{p.sector}</p>
                    </td>

                    <td className="p-3.5 font-medium text-slate-300">
                      {p.state}
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <p className="text-slate-200 font-medium truncate">{p.nextMilestone}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Due: {p.nextMilestoneDate}</span>
                      </p>
                    </td>

                    <td className="p-3.5 font-bold">
                      <span className={p.costOverrunPct >= 15 ? 'text-red-400' : p.costOverrunPct >= 8 ? 'text-orange-400' : 'text-emerald-400'}>
                        +{p.costOverrunPct.toFixed(1)}%
                      </span>
                    </td>

                    <td className="p-3.5 font-bold">
                      <span className={p.scheduleDelayDays >= 180 ? 'text-red-400' : p.scheduleDelayDays >= 90 ? 'text-orange-400' : 'text-emerald-400'}>
                        +{p.scheduleDelayDays} Days
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-[11px] font-bold transition">
                        Intelligence →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    No projects match the current active filter criteria. Click "Reset Filters" to clear.
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
