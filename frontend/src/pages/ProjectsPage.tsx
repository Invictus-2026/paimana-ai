import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS, ProjectData } from '../data/mockData';
import {
  Search,
  ArrowUpDown,
  RefreshCw,
  Download,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  MapPin,
  AlertTriangle,
  Sparkles,
  SlidersHorizontal,
  X,
  ExternalLink
} from 'lucide-react';
import {
  PageContainer,
  RiskBadge,
  EmptyState
} from '../components/ui';

export const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load active filters from URL search parameters or fallback
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

  // Interactive UI state
  const [selectedRowId, setSelectedRowId] = useState<number | null>(101); // Default preview to first project
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedMinistry !== 'ALL') count++;
    if (selectedSector !== 'ALL') count++;
    if (selectedState !== 'ALL') count++;
    if (selectedStatus !== 'ALL') count++;
    if (costImpactFilter !== 'ALL') count++;
    if (delayImpactFilter !== 'ALL') count++;
    return count;
  }, [searchTerm, selectedMinistry, selectedSector, selectedState, selectedStatus, costImpactFilter, delayImpactFilter]);

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

  // Dropdown options
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
      if (selectedStatus !== 'ALL') {
        const normStatus = selectedStatus.toLowerCase();
        if (normStatus === 'low' && p.overallRiskScore >= 40) return false;
        if (normStatus === 'moderate' && (p.overallRiskScore < 40 || p.overallRiskScore >= 70)) return false;
        if (normStatus === 'high' && (p.overallRiskScore < 70 || p.overallRiskScore >= 85)) return false;
        if (normStatus === 'very high' && p.overallRiskScore < 85) return false;
        if (normStatus === 'high risk' && p.overallRiskScore < 70) return false;
      }
      if (costImpactFilter === 'gt0' && p.costOverrunPct <= 0) return false;
      if (costImpactFilter === 'gt10' && p.costOverrunPct < 10) return false;
      if (costImpactFilter === 'gt20' && p.costOverrunPct < 20) return false;
      if (delayImpactFilter === 'gt0' && p.scheduleDelayDays <= 0) return false;
      if (delayImpactFilter === 'gt90' && p.scheduleDelayDays < 90) return false;
      if (delayImpactFilter === 'gt180' && p.scheduleDelayDays < 180) return false;
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMinistry('ALL');
    setSelectedSector('ALL');
    setSelectedState('ALL');
    setSelectedStatus('ALL');
    setCostImpactFilter('ALL');
    setDelayImpactFilter('ALL');
    setToastMessage('Filters reset to national baseline');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveView = () => {
    setToastMessage('Custom workspace view saved to your officer profile');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCSV = () => {
    const headers = ['Code', 'Project Name', 'Ministry', 'Sector', 'State', 'Risk Score', 'Cost Overrun %', 'Delay Days', 'Status'];
    const rows = filteredProjects.map(p => [
      p.code,
      `"${p.name}"`,
      `"${p.ministry}"`,
      `"${p.sector}"`,
      `"${p.state}"`,
      p.overallRiskScore,
      p.costOverrunPct,
      p.scheduleDelayDays,
      p.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoSPI_Infrastructure_Projects_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Exported ${filteredProjects.length} projects to CSV`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Currently previewed project for the intelligence preview panel
  const previewProject = useMemo(() => {
    return MOCK_PROJECTS.find(p => p.id === selectedRowId) || filteredProjects[0] || MOCK_PROJECTS[0];
  }, [selectedRowId, filteredProjects]);

  return (
    <PageContainer breadcrumb="PROJECT INTELLIGENCE WORKSPACE">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-8 z-50 bg-[#0b172a] text-white px-4 py-2.5 rounded-xl shadow-xl border border-blue-500/40 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER: PROJECT INTELLIGENCE WORKSPACE                                */}
      {/* ========================================================================= */}
      <div className="command-panel p-5 bg-gradient-to-r from-white via-slate-50 to-blue-50/25 border border-slate-200/90 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
              National Directory & Investigation
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Central Sector Projects (≥ ₹150 Cr)
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight font-heading mt-1">
            Project Intelligence
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Explore, compare and investigate monitored infrastructure projects across 22 Central Line Ministries.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeFilterCount > 0 && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0d52ce] border border-blue-200 text-xs font-bold">
              <span>{activeFilterCount} active filters</span>
            </div>
          )}

          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveView}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Bookmark className="w-3 h-3 text-slate-500" />
            <span>Save View</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPACT COMMAND & FILTER BAR                                              */}
      {/* ========================================================================= */}
      <div className="command-panel p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box (4 cols) */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects, project codes, contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Ministry Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-[#0d52ce] transition cursor-pointer"
            >
              <option value="ALL">All Ministries (National)</option>
              {ministries.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Sector Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-[#0d52ce] transition cursor-pointer"
            >
              <option value="ALL">All Infrastructure Sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* State Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-[#0d52ce] transition cursor-pointer"
            >
              <option value="ALL">All States / UTs</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Parameter Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Refine Criteria:</span>
          </span>

          {/* Risk Tier */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#0d52ce] cursor-pointer"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="Low">Low Risk (0–39)</option>
            <option value="Moderate">Moderate Risk (40–69)</option>
            <option value="High">High Risk (70–84)</option>
            <option value="Very High">Very High Risk (85–100)</option>
          </select>

          {/* Cost Variance */}
          <select
            value={costImpactFilter}
            onChange={(e) => setCostImpactFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#0d52ce] cursor-pointer"
          >
            <option value="ALL">Cost Variance: Any</option>
            <option value="gt0">Cost Overrun &gt; 0%</option>
            <option value="gt10">Cost Overrun &gt; 10%</option>
            <option value="gt20">Severe Overrun &gt; 20%</option>
          </select>

          {/* Schedule Variance */}
          <select
            value={delayImpactFilter}
            onChange={(e) => setDelayImpactFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#0d52ce] cursor-pointer"
          >
            <option value="ALL">Schedule Delay: Any</option>
            <option value="gt0">Delay &gt; 0 Days</option>
            <option value="gt90">Delay &gt; 90 Days (3 Mo)</option>
            <option value="gt180">Severe Delay &gt; 180 Days (6 Mo)</option>
          </select>

          <div className="ml-auto text-xs font-bold text-slate-600 font-mono">
            Showing <strong className="text-slate-900">{filteredProjects.length}</strong> of {MOCK_PROJECTS.length} Projects
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROFESSIONAL DATA TABLE WITH STICKY HEADER & INTELLIGENCE PREVIEW         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Table Container (8 cols on large screens, or full width if no preview) */}
        <div className="lg:col-span-8 command-panel bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs text-slate-700 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="p-3 cursor-pointer hover:bg-slate-200/70 transition w-[24%]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Project</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('overallRiskScore')}
                    className="p-3 cursor-pointer hover:bg-slate-200/70 transition w-[14%]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Risk</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3 w-[16%]">Ministry / Sector</th>
                  <th className="p-3 w-[10%]">State</th>
                  <th
                    onClick={() => handleSort('costOverrunPct')}
                    className="p-3 cursor-pointer hover:bg-slate-200/70 transition w-[12%]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Cost Var.</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('scheduleDelayDays')}
                    className="p-3 cursor-pointer hover:bg-slate-200/70 transition w-[12%]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Delay</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3 w-[12%] text-right">Action</th>
                </tr>
              </thead>

              {/* Table Rows */}
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400">
                      <EmptyState
                        title="No matching infrastructure projects"
                        description="Try resetting your criteria or clearing search parameters."
                        onAction={handleResetFilters}
                        actionLabel="Reset All Filters"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    const isSelected = p.id === selectedRowId;
                    const completionPct = Math.min(100, Math.round((p.cumulativeExpenditureCr / p.revisedBudgetCr) * 100));

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedRowId(p.id)}
                        className={`transition cursor-pointer group ${
                          isSelected
                            ? 'bg-blue-50/70 border-l-4 border-l-[#0d52ce]'
                            : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                        }`}
                      >
                        {/* 1. Project Info */}
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 group-hover:text-[#0d52ce] transition flex items-center gap-1.5">
                              <span>{p.name}</span>
                            </p>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                              <span className="font-bold text-[#0d52ce] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                {p.code}
                              </span>
                              <span>•</span>
                              <span className="text-slate-600 font-semibold">
                                ₹{p.budgetCr.toLocaleString('en-IN')} Cr
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Risk Score & Heat Indicator */}
                        <td className="p-3">
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              p.overallRiskScore >= 85 ? 'bg-red-600 animate-pulse' :
                              p.overallRiskScore >= 70 ? 'bg-orange-500' :
                              p.overallRiskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            <RiskBadge score={p.overallRiskScore} size="sm" />
                          </div>
                        </td>

                        {/* 3. Ministry & Sector */}
                        <td className="p-3">
                          <p className="font-semibold text-slate-800 truncate max-w-[150px]" title={p.ministry}>
                            {p.ministry}
                          </p>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                            {p.sector}
                          </span>
                        </td>

                        {/* 4. State */}
                        <td className="p-3 font-medium text-slate-700">
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[90px]">{p.state}</span>
                          </span>
                        </td>

                        {/* 5. Cost Variance */}
                        <td className="p-3 font-mono">
                          <span className={`font-bold ${
                            p.costOverrunPct >= 15 ? 'text-red-600' :
                            p.costOverrunPct > 0 ? 'text-orange-600' : 'text-emerald-600'
                          }`}>
                            +{p.costOverrunPct.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            ₹{p.revisedBudgetCr.toLocaleString('en-IN')} Cr
                          </span>
                        </td>

                        {/* 6. Schedule Delay & Progress */}
                        <td className="p-3 font-mono">
                          <span className={`font-bold ${p.scheduleDelayDays >= 180 ? 'text-red-600' : 'text-slate-800'}`}>
                            +{p.scheduleDelayDays}d
                          </span>
                          {/* Mini Progress Bar */}
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                            <div
                              className="bg-[#0d52ce] h-full rounded-full"
                              style={{ width: `${completionPct}%` }}
                            />
                          </div>
                        </td>

                        {/* 7. Action */}
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projects/${p.id}`);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
                          >
                            <span>Dossier</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>
              Click any project row to preview causal drivers on the right intelligence console.
            </span>
            <span className="font-mono font-bold text-slate-700">
              Total Monitored: 1,981 Projects
            </span>
          </div>
        </div>

        {/* Intelligence Preview Console (4 cols) */}
        <div className="lg:col-span-4 command-panel p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Live Intelligence Preview</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[#0d52ce]">
                {previewProject.code}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                {previewProject.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {previewProject.ministry} • {previewProject.state}
              </p>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Composite Risk</span>
                <div className="flex items-center space-x-1.5">
                  <RiskBadge score={previewProject.overallRiskScore} size="sm" />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Schedule Slippage</span>
                <p className="text-sm font-black text-slate-900 font-mono">
                  +{previewProject.scheduleDelayDays} Days
                </p>
              </div>
            </div>
          </div>

          {/* Causal SHAP Drivers Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Top Root Cause Drivers (SHAP)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Attribution Engine
              </span>
            </div>

            <div className="space-y-2">
              {previewProject.topRiskDrivers.map((driver, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800">
                      {driver.driver}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
                      +{driver.shapContribution.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {driver.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Critical Milestone Alert */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-[10px] uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Next Critical Milestone</span>
            </div>
            <p className="font-bold text-slate-900">
              {previewProject.nextMilestone}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Due: {previewProject.nextMilestoneDate}
            </p>
          </div>

          {/* Action Launchpad */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => navigate(`/projects/${previewProject.id}`)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <span>Open Project Briefing Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigate(`/scenarios?project_id=${previewProject.id}`)}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Run Disruption Scenario</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
