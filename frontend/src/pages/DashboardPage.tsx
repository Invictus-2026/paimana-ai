import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Layers,
  IndianRupee,
  TrendingUp,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Calendar,
  Download,
  Plus,
  Bell,
  FileText,
  Sparkles,
  Upload,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Server
} from 'lucide-react';

// Sector Donut Chart Data with Google Palette + #f8880f + #1129a8
const sectorData = [
  { name: 'Transport & Logistics', value: 564, pct: '28.5%', color: '#4285f4' }, // Google Blue
  { name: 'Energy', value: 358, pct: '18.1%', color: '#f8880f' },               // Primary Warm Saffron
  { name: 'Water & Sanitation', value: 246, pct: '12.4%', color: '#34a853' },    // Google Green
  { name: 'Social Infrastructure', value: 204, pct: '10.3%', color: '#ea4335' }, // Google Red
  { name: 'Communication', value: 155, pct: '7.8%', color: '#fbbc05' },         // Google Yellow
  { name: 'Others', value: 454, pct: '22.9%', color: '#1129a8' },                // Deep Navy Blue
];

// Cost Overrun Risk Distribution Bar Chart Data
const riskDistributionData = [
  { name: 'Low', count: 422, pct: '21.3%', color: '#34a853' },       // Google Green
  { name: 'Moderate', count: 767, pct: '38.7%', color: '#fbbc05' },   // Google Yellow
  { name: 'High', count: 480, pct: '24.2%', color: '#f8880f' },       // Primary Warm Saffron
  { name: 'Very High', count: 312, pct: '15.8%', color: '#ea4335' },  // Google Red
];

// Top High Risk Projects
const topRiskProjects = [
  { name: 'Mumbai Metro Line 7A', ministry: 'Ministry of Housing & Urban Affairs', score: '0.92' },
  { name: 'Delhi-Meerut RRTS Corridor', ministry: 'Ministry of Railways', score: '0.89' },
  { name: 'Polavaram Irrigation Project', ministry: 'Ministry of Jal Shakti', score: '0.87' },
  { name: 'Kudankulam Nuclear Project', ministry: 'Department of Atomic Energy', score: '0.85' },
  { name: 'Chardham Highway Project', ministry: 'Ministry of Road Transport & Highways', score: '0.83' },
];

// Cost vs Time Overrun Trends Line Chart
const trendData = [
  { month: 'Nov 2025', costOverrun: 18, timeOverrun: 12 },
  { month: 'Dec 2025', costOverrun: 19, timeOverrun: 13 },
  { month: 'Jan 2026', costOverrun: 21, timeOverrun: 14 },
  { month: 'Feb 2026', costOverrun: 22, timeOverrun: 15 },
  { month: 'Mar 2026', costOverrun: 23, timeOverrun: 16 },
  { month: 'Apr 2026', costOverrun: 24, timeOverrun: 17 },
];

export const DashboardPage: React.FC = () => {
  // Live backend health query
  const { data: health } = useQuery({
    queryKey: ['backend-health'],
    queryFn: api.getHealth,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Header Greeting & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1129a8] font-outfit tracking-tight flex items-center gap-2">
            Welcome back, Admin <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            AI-powered insights for smarter infrastructure monitoring
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live Backend Connection Badge */}
          {health && (
            <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
              <Server className="w-3.5 h-3.5 text-[#1129a8]" />
              <span>Backend API <strong className="text-[#34a853] font-semibold">{health.status}</strong></span>
            </div>
          )}

          {/* Month Filter Dropdown */}
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50 transition">
            <Calendar className="w-4 h-4 text-[#f8880f]" />
            <span>April 2026</span>
          </div>

          {/* Primary Action Button (#f8880f) */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#f8880f] hover:bg-[#e0770b] text-white rounded-xl text-xs font-bold shadow-md shadow-[#f8880f]/20 transition">
            <span>Export Report</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top 5 Key Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="dashboard-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Total Projects</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1129a8] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-[#1129a8] font-outfit">1,981</h2>
            <p className="text-xs font-medium text-[#34a853] flex items-center space-x-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>2.4% from Mar 2026</span>
            </p>
          </div>
        </div>

        {/* Original Cost */}
        <div className="dashboard-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Original Cost</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#34a853] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">₹37.13 Lakh Cr</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Across 22 Sectors</p>
          </div>
        </div>

        {/* Revised Cost */}
        <div className="dashboard-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Revised Cost</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#f8880f] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">₹42.78 Lakh Cr</h2>
            <p className="text-xs font-medium text-[#f8880f] flex items-center space-x-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>4.1% from Mar 2026</span>
            </p>
          </div>
        </div>

        {/* Cumulative Expenditure */}
        <div className="dashboard-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Cumulative Expenditure</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#4285f4] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">₹20.36 Lakh Cr</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">48% of Revised Cost</p>
          </div>
        </div>

        {/* High Risk Projects */}
        <div className="dashboard-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">High Risk Projects</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#ea4335] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-[#ea4335] font-outfit">312</h2>
            <p className="text-xs font-medium text-[#ea4335] mt-1">15.8% of total projects</p>
          </div>
        </div>
      </div>

      {/* 3. Middle Grid: Sector Donut + Risk Distribution + Top High Risk List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Projects by Sector (Donut) */}
        <div className="dashboard-card p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1129a8] font-outfit">Projects by Sector</h3>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-base font-extrabold text-[#1129a8] font-outfit leading-tight">1,981</span>
                  <span className="text-[11px] font-semibold text-slate-400">Total</span>
                </div>
              </div>

              <div className="space-y-1.5 w-full text-xs">
                {sectorData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 ml-2 shrink-0">{item.pct} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-start">
            <button className="text-xs font-bold text-[#f8880f] hover:text-[#e0770b] flex items-center space-x-1">
              <span>View all sectors</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cost Overrun Risk Distribution (Bar Chart) */}
        <div className="dashboard-card p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1129a8] font-outfit">Cost Overrun Risk Distribution</h3>
              <button className="text-xs font-bold text-[#f8880f] hover:text-[#e0770b] flex items-center space-x-0.5">
                <span>View details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(val: any) => [`${val} projects`, 'Count']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs mt-2 pt-2 border-t border-slate-100">
              {riskDistributionData.map((d) => (
                <div key={d.name}>
                  <p className="font-bold text-slate-800">{d.pct}</p>
                  <p className="text-[10px] text-slate-500">({d.count})</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top High Risk Projects (List) */}
        <div className="dashboard-card p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1129a8] font-outfit">Top High Risk Projects</h3>
              <button className="text-xs font-bold text-[#f8880f] hover:text-[#e0770b] flex items-center space-x-0.5">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {topRiskProjects.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{p.ministry}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-red-100 text-[#ea4335]">
                      High Risk
                    </span>
                    <span className="text-xs font-extrabold text-[#1129a8] font-outfit">{p.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lower Row: Cost vs Time Overrun Trends + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cost vs Time Overrun Trends */}
        <div className="dashboard-card p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1129a8] font-outfit">Cost vs Time Overrun Trends</h3>
              <button className="text-xs font-bold text-[#f8880f] hover:text-[#e0770b] flex items-center space-x-0.5">
                <span>View analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-6 mt-3 text-xs font-medium text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-1 bg-[#4285f4] rounded-full" />
                <span>Cost Overrun (%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-1 bg-[#f8880f] rounded-full" />
                <span>Time Overrun (%)</span>
              </div>
            </div>

            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip formatter={(val: any) => [`${val}%`, 'Overrun']} />
                  <Line type="monotone" dataKey="costOverrun" stroke="#4285f4" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="timeOverrun" stroke="#f8880f" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="dashboard-card p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#f8880f]" />
                <h3 className="font-bold text-base text-[#1129a8] font-outfit">AI Insights</h3>
              </div>
              <button className="text-xs font-bold text-[#f8880f] hover:text-[#e0770b] flex items-center space-x-0.5">
                <span>View all insights</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Insight 1 */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start justify-between cursor-pointer hover:bg-blue-50 transition">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#4285f4] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">312 projects are at very high risk of cost overrun.</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">Potential additional cost impact: <strong>₹2.41 Lakh Cr</strong></p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
              </div>

              {/* Insight 2 */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start justify-between cursor-pointer hover:bg-emerald-50 transition">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#34a853] flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Transport & Logistics sector shows highest time overrun risk.</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">Average delay: <strong>8.7 months</strong></p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
              </div>

              {/* Insight 3 */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start justify-between cursor-pointer hover:bg-amber-50 transition">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#f8880f] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Early intervention can save up to ₹1.18 Lakh Cr</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">if actioned in next 3 months</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Quick Actions + Recent Alerts + Data Quality Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions */}
        <div className="dashboard-card p-6 lg:col-span-5">
          <h3 className="font-bold text-base text-[#1129a8] font-outfit mb-4">Quick Actions</h3>
          <div className="grid grid-cols-5 gap-3 text-center">
            <button className="p-3 rounded-xl border border-slate-200 hover:border-[#f8880f] hover:bg-amber-50/50 transition group flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#f8880f] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Add Project</span>
            </button>

            <button className="p-3 rounded-xl border border-slate-200 hover:border-[#ea4335] hover:bg-red-50/50 transition group flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-[#ea4335] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Risk Alerts</span>
            </button>

            <button className="p-3 rounded-xl border border-slate-200 hover:border-[#34a853] hover:bg-emerald-50/50 transition group flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#34a853] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Generate Report</span>
            </button>

            <button className="p-3 rounded-xl border border-slate-200 hover:border-[#4285f4] hover:bg-blue-50/50 transition group flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#4285f4] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">AI Assistant</span>
            </button>

            <button className="p-3 rounded-xl border border-slate-200 hover:border-[#1129a8] hover:bg-slate-100 transition group flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#1129a8] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Data Upload</span>
            </button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="dashboard-card p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1129a8] font-outfit">Recent Alerts</h3>
              <button className="text-xs font-bold text-[#f8880f] hover:text-[#e0770b] flex items-center space-x-0.5">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-red-50/60 border border-red-100 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-[#ea4335] flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">High risk of cost overrun detected in 12 projects</h4>
                <p className="text-[10px] text-slate-500 mt-1">2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Score Gauge */}
        <div className="dashboard-card p-6 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1129a8] font-outfit">Data Quality Score</h3>
              <button className="text-xs font-bold text-[#f8880f] hover:text-[#e0770b] flex items-center space-x-0.5">
                <span>View details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#34a853]"
                    strokeDasharray="92, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900 font-outfit">92%</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">Excellent</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#34a853] inline shrink-0" />
                  <span>Data is updated and validated</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
