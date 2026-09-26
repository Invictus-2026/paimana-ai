import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/intelligence')) return 'Intelligence';
    if (path.startsWith('/projects/')) return 'Project Intelligence';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/map')) return 'Benchmarks & Risk Map';
    if (path.startsWith('/scenarios')) return 'Forecasting & Simulation';
    if (path.startsWith('/interventions')) return 'Risk & Alerts';
    if (path.startsWith('/copilot')) return 'AI Assistant';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-10 text-slate-800 font-sans">
      {/* Left: Menu toggle + Title */}
      <div className="flex items-center space-x-4">
        <button className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 font-sans">{getTitle()}</h1>
      </div>

      {/* Center: Search Box */}
      <div className="relative w-96 hidden md:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search projects, ministries, sectors..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              navigate(`/projects?search=${encodeURIComponent(e.currentTarget.value)}`);
            }
          }}
          className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 pl-10 pr-16 py-2 rounded-xl focus:outline-none focus:border-[#0d52ce] focus:bg-white transition"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-200/60 rounded border border-slate-300">
          Ctrl + K
        </kbd>
      </div>

      {/* Right: Notifications, Help, Admin User Profile */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/interventions')}
          className="relative text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-orange-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center border border-white">
            3
          </span>
        </button>

        {/* Help Question Icon */}
        <button className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Admin User Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#0d52ce] text-white font-bold text-xs flex items-center justify-center shadow-sm">
            AD
          </div>
          <div className="hidden lg:block text-left text-xs">
            <p className="font-bold text-slate-900 leading-tight">Admin User</p>
            <p className="text-[10px] text-slate-500">MoSPI</p>
          </div>
        </div>
      </div>
    </header>
  );
};
