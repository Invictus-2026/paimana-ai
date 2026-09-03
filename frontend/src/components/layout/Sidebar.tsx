import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  LineChart,
  Award,
  Bot,
  ChevronDown,
  Calendar,
  Building2,
  MapPin
} from 'lucide-react';

interface SubNavItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  subItems?: SubNavItem[];
}

const operationalNav: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
  { name: 'Projects Matrix', path: '/projects', icon: FolderKanban },
  { name: 'Risk & Alerts', path: '/interventions', icon: AlertTriangle, badge: '3 Act', badgeColor: 'bg-red-500 text-white' },
  { name: 'Forecasting', path: '/scenarios', icon: LineChart },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [analyticsOpen, setAnalyticsOpen] = useState(
    location.pathname.startsWith('/analytics') ||
    location.pathname === '/benchmarks' ||
    location.pathname === '/map'
  );

  useEffect(() => {
    if (
      location.pathname.startsWith('/analytics') ||
      location.pathname === '/benchmarks' ||
      location.pathname === '/map'
    ) {
      setAnalyticsOpen(true);
    }
  }, [location.pathname]);

  return (
    <aside className="w-68 bg-[#0b172a] text-slate-300 flex flex-col justify-between h-screen sticky top-0 z-30 shrink-0 select-none border-r border-slate-800 shadow-xl">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Government of India & MoSPI Crest Header */}
        <div className="p-4 border-b border-slate-800/90 bg-[#07101e]">
          <div className="flex items-center space-x-3">
            {/* National Insignia Emblem Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d52ce] via-[#1e40af] to-[#0a369d] flex items-center justify-center text-white shadow-lg shadow-blue-950/60 border border-blue-400/30 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-white tracking-tight font-heading">
                  PAIMANA
                </span>
                <span className="text-xs font-black text-[#38bdf8] tracking-tight font-heading">
                  PredictIQ
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 truncate tracking-tight">
                National Infrastructure Command
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase">
                  MoSPI
                </span>
                <span className="text-[9px] text-slate-500">•</span>
                <span className="text-[9px] text-slate-400 font-medium">Govt. of India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-5 flex-1 text-xs font-medium">
          {/* Section 1: Monitoring & Operations */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Operational Monitoring
            </div>
            <div className="space-y-1">
              {operationalNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0d52ce] text-white shadow-md shadow-blue-900/30 border border-blue-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                          item.badgeColor || 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Section 2: Analytics & Intelligence */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Decision Intelligence
            </div>
            <div className="space-y-1">
              {/* Expandable Analytics Section */}
              <div>
                <button
                  onClick={() => setAnalyticsOpen(!analyticsOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                    location.pathname.startsWith('/analytics')
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Analytics Hub</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      analyticsOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {analyticsOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l border-slate-700 space-y-1 py-1 animate-in fade-in duration-150">
                    <NavLink
                      to="/analytics"
                      end
                      className={({ isActive }) =>
                        `block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isActive ? 'text-[#38bdf8] bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`
                      }
                    >
                      Portfolio Overview
                    </NavLink>
                    <NavLink
                      to="/benchmarks"
                      className={({ isActive }) =>
                        `block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isActive ? 'text-[#38bdf8] bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`
                      }
                    >
                      Sector Benchmarks
                    </NavLink>
                    <NavLink
                      to="/map"
                      className={({ isActive }) =>
                        `block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isActive ? 'text-[#38bdf8] bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`
                      }
                    >
                      Spatial Risk Map
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Direct links to Benchmarks, Spatial Map, AI Copilot */}
              <NavLink
                to="/benchmarks"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#0d52ce] text-white shadow-md shadow-blue-900/30 border border-blue-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span>Benchmarks</span>
                </div>
              </NavLink>

              <NavLink
                to="/map"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#0d52ce] text-white shadow-md shadow-blue-900/30 border border-blue-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Spatial Risk Map</span>
                </div>
              </NavLink>

              <NavLink
                to="/copilot"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#0d52ce] text-white shadow-md shadow-blue-900/30 border border-blue-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Bot className="w-4 h-4 text-slate-400" />
                  <span>AI Copilot</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-purple-600 text-white uppercase tracking-wider">
                  AI
                </span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Footer Provenance & Live System Status */}
      <div className="p-3.5 border-t border-slate-800 bg-[#07101e] space-y-2 shrink-0 text-xs">
        {/* Live System Health */}
        <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800/80">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-slate-300">PAIMANA Engine</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-emerald-400">ONLINE</span>
        </div>

        {/* Data As Of Pill */}
        <div className="flex items-center space-x-2 px-2.5 py-1.5 text-[10px] text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Data As Of: <strong className="text-slate-200">April 2026</strong></span>
        </div>

        {/* Government Source Indicator */}
        <div className="px-2.5 pt-1 text-[9px] text-slate-500 border-t border-slate-800/60 leading-tight">
          Infrastructure & Project Monitoring Division (IPMD) • Ministry of Statistics & Programme Implementation
        </div>
      </div>
    </aside>
  );
};
