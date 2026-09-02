import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  BarChart2,
  AlertTriangle,
  TrendingUp,
  Award,
  FileText,
  Bot,
  Settings,
  ChevronDown,
  Building2,
  Layers
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  hasDropdown?: boolean;
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Analytics', path: '/analytics', icon: BarChart2, hasDropdown: true },
  { name: 'Risk & Alerts', path: '/alerts', icon: AlertTriangle },
  { name: 'Forecasting', path: '/scenarios', icon: TrendingUp },
  { name: 'Benchmarks', path: '/benchmarks', icon: Award },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'AI Assistant', path: '/copilot', icon: Bot, badge: 'New' },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-20 shrink-0">
      <div>
        {/* Brand Header with Primary #f8880f and Deep Blue #1129a8 */}
        <div className="p-5 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-[#f8880f] flex items-center justify-center text-white shadow-md shadow-[#f8880f]/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#1129a8] tracking-tight leading-none font-outfit">
              PAIMANA <span className="text-[#f8880f]">PredictIQ</span>
            </h1>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5">AI for Infrastructure Monitoring</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="mt-4 px-3 space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            if (item.hasDropdown) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setAnalyticsOpen(!analyticsOpen)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-amber-50 text-[#f8880f] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#f8880f]' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${analyticsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {analyticsOpen && (
                    <div className="pl-10 pr-2 py-1 space-y-1">
                      <NavLink
                        to="/analytics"
                        className={({ isActive: subActive }) =>
                          `block px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            subActive ? 'text-[#f8880f] bg-amber-50/60 font-semibold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`
                        }
                      >
                        Sector Overview
                      </NavLink>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-md font-medium text-sm transition-all duration-150 ${
                    isActive
                    ? 'bg-amber-50/80 text-[#f8880f] font-semibold border-l-4 border-[#1129a8] pl-2.5 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f8880f]' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-[#4285f4] uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info Box */}
      <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-700">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Data as of April 2026</span>
        </div>
        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
          <Building2 className="w-3.5 h-3.5 text-[#1129a8]" />
          <span className="font-medium text-[#1129a8]">PAIMANA Portal <span className="text-slate-400 font-normal">(MoSPI, GoI)</span></span>
        </div>
      </div>
    </aside>
  );
};
