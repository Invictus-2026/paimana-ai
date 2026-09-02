import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  Bot,
  Layers,
  FileText,
  Building2,
  Sliders,
  Sparkles
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { name: 'National Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Risk Map', path: '/map', icon: MapPin },
  { name: 'Project Explorer', path: '/projects', icon: FolderKanban },
  { name: 'Scenario Simulator', path: '/scenarios', icon: Sliders },
  { name: 'Intervention Panel', path: '/interventions', icon: AlertTriangle, badge: '5 Active' },
  { name: 'Copilot AI Engine', path: '/copilot', icon: Bot, badge: 'v2.4' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#0e1526] border-r border-[#23304a] flex flex-col justify-between h-screen sticky top-0 z-20 shrink-0 text-slate-200">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center space-x-3 border-b border-[#23304a]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f8880f] to-[#fb923c] flex items-center justify-center text-white shadow-lg shadow-[#f8880f]/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight leading-none font-outfit">
              PAIMANA <span className="text-[#f8880f]">PredictIQ</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">MoSPI Decision Support</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="mt-4 px-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Core Monitoring
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg font-semibold text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 pl-2.5 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#162035]'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-[#f8880f]/20 text-[#f8880f] border border-[#f8880f]/30 uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Governance Card */}
      <div className="p-3 m-3 rounded-xl bg-[#131c31] border border-[#23304a]">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-[#f8880f]" />
          <span>Human-in-the-Loop</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-snug">
          Decision Support System — All interventions require explicit ministerial authorization.
        </p>
        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-[#23304a] text-[10px] text-slate-400">
          <Building2 className="w-3 h-3 text-blue-400" />
          <span>Govt of India Infrastructure Portal</span>
        </div>
      </div>
    </aside>
  );
};
