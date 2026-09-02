import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Bell, ShieldAlert, ChevronRight, Server } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: health } = useQuery({
    queryKey: ['backend-health'],
    queryFn: api.getHealth,
  });

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0 || parts[0] === 'dashboard') {
      return [{ label: 'National Overview', path: '/dashboard' }];
    }

    const items = [{ label: 'Overview', path: '/dashboard' }];
    if (parts[0] === 'projects') {
      items.push({ label: 'Project Explorer', path: '/projects' });
      if (parts[1]) {
        items.push({ label: `Project #${parts[1]} Intelligence`, path: `/projects/${parts[1]}` });
      }
    } else if (parts[0] === 'map') {
      items.push({ label: 'Risk Map (Choropleth)', path: '/map' });
    } else if (parts[0] === 'scenarios') {
      items.push({ label: 'Scenario Simulator', path: '/scenarios' });
    } else if (parts[0] === 'interventions' || parts[0] === 'alerts') {
      items.push({ label: 'Intervention Panel', path: '/interventions' });
    } else if (parts[0] === 'copilot') {
      items.push({ label: 'Copilot AI Engine', path: '/copilot' });
    }
    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-[#0e1526] border-b border-[#23304a] px-6 flex items-center justify-between sticky top-0 z-10 text-slate-100">
      {/* Left: Breadcrumbs or Title */}
      <div className="flex items-center space-x-2 text-xs font-semibold">
        {breadcrumbs.map((b, idx) => (
          <React.Fragment key={b.path}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            {idx === breadcrumbs.length - 1 ? (
              <span className="text-[#f8880f] font-bold">{b.label}</span>
            ) : (
              <Link to={b.path} className="text-slate-400 hover:text-slate-200 transition">
                {b.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right: Search, API Status, Notifications, Profile */}
      <div className="flex items-center space-x-4">
        {/* API Connection Badge */}
        {health && (
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#131c31] border border-[#23304a] text-[11px]">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">API Status: <strong className="text-emerald-400">{health.status}</strong></span>
          </div>
        )}

        {/* Global Search Input */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects (e.g. Metro)..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                navigate(`/projects?search=${encodeURIComponent(e.currentTarget.value)}`);
              }
            }}
            className="w-full bg-[#131c31] border border-[#23304a] text-xs text-slate-200 placeholder-slate-500 pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Alerts Badge */}
        <button
          onClick={() => navigate('/interventions')}
          className="relative text-slate-400 hover:text-white p-2 rounded-lg hover:bg-[#162035] transition"
          title="View Active Risk Alerts & Interventions"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-[#0e1526]">
            5
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2 pl-3 border-l border-[#23304a]">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-blue-400">
            GOI
          </div>
          <div className="hidden xl:block text-left text-xs">
            <p className="font-bold text-slate-200 leading-tight">MoSPI Monitoring Cell</p>
            <p className="text-[10px] text-slate-400">Government of India</p>
          </div>
        </div>
      </div>
    </header>
  );
};
