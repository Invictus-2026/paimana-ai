import React, { useEffect, useState } from 'react';
import { BarChart3, AlertCircle, IndianRupee, TrendingUp, Activity, Filter } from 'lucide-react';
import { api } from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [ministries, setMinistries] = useState<any>(null);
  const [geography, setGeography] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sector' | 'ministry' | 'geographic_region'>('sector');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewData, benchmarkData, ministryData, geographyData] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getBenchmarks(activeTab),
          api.getMinistryAnalytics(),
          api.getGeographyAnalytics()
        ]);
        
        setOverview(overviewData?.data);
        setBenchmarks(benchmarkData?.data);
        setMinistries(ministryData?.data);
        setGeography(geographyData?.data);
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-slate-500 font-medium">Aggregating national datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">Portfolio Analytics Engine</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">Data-driven performance benchmarking & risk aggregation across MoSPI datasets (2025-2026)</p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Projects</p>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{overview?.total_projects || 0}</p>
        </div>
        <div className="dashboard-card p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Capital Outlay</p>
            <IndianRupee className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ₹{((overview?.total_budget_cr || 0) / 1000).toFixed(1)}k Cr
          </p>
        </div>
        <div className="dashboard-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Average Risk Score</p>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {((overview?.average_risk_score || 0) * 100).toFixed(1)}
          </p>
        </div>
        <div className="dashboard-card p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Cost Overrun Exposure</p>
            <TrendingUp className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ₹{((overview?.total_cost_overrun_exposure_cr || 0) / 1000).toFixed(1)}k Cr
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Growth / Risk Benchmark Chart */}
        <div className="lg:col-span-2 dashboard-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 font-outfit">Performance Benchmarks</h2>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              {(['sector', 'ministry', 'geographic_region'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  By {tab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
          
          {benchmarks?.explanatory_annotations && (
             <div className="mb-4 text-xs p-3 rounded-lg bg-blue-50/50 border border-blue-100/50 text-blue-800">
               <span className="font-semibold block mb-1">Statistical Safeguard:</span>
               {benchmarks.explanatory_annotations.what_should_not_be_concluded}
             </div>
          )}

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarks?.benchmark_groups?.slice(0, 10) || []} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: string) => [
                    name === 'avg_cost_growth_pct' ? `${value.toFixed(1)}%` : value, 
                    name === 'avg_cost_growth_pct' ? 'Avg Cost Growth' : 'Avg Risk Score'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="avg_cost_growth_pct" name="Avg Cost Growth (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avg_risk_score" name="Avg Risk Score" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State/Geography Distribution Chart */}
        <div className="dashboard-card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 font-outfit mb-4">State/Region Distribution</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={geography?.geography?.slice(0, 7) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="project_count"
                  nameKey="category_name"
                >
                  {geography?.geography?.slice(0, 7).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [value, 'Projects']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {geography?.geography?.slice(0, 5).map((geo: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-600 font-medium truncate max-w-[120px]" title={geo.category_name}>{geo.category_name}</span>
                </div>
                <span className="font-bold text-slate-900">{geo.project_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card p-6">
          <h2 className="text-lg font-bold text-slate-900 font-outfit mb-6">Ministry Risk Profiles</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ministries?.ministries?.slice(0, 8) || []} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="category_name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <RechartsTooltip 
                  formatter={(value: any) => [(value * 100).toFixed(1), 'Avg Risk Score']}
                />
                <Area type="monotone" dataKey="average_risk_score" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card p-6">
          <h2 className="text-lg font-bold text-slate-900 font-outfit mb-6">Capital Outlay by Sector</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={benchmarks?.benchmark_groups?.slice(0, 8) || []} margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={100} />
                <RechartsTooltip 
                  formatter={(value: any) => [`₹${(value / 1000).toFixed(1)}k Cr`, 'Total Budget']}
                />
                <Bar dataKey="total_budget_cr" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
