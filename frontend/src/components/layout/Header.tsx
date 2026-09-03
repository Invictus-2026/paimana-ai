import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  Shield,
  AlertTriangle,
  X,
  Info
} from 'lucide-react';
import { RECENT_ALERTS } from '../../data/mockData';

export interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenCommandPalette,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Notification center popover state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(RECENT_ALERTS);

  // Help / Methodology modal state
  const [helpOpen, setHelpOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnreadAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/projects/')) return { section: 'Deep Intelligence', title: 'Project Dossier' };
    if (path.startsWith('/projects')) return { section: 'National Directory', title: 'Project Explorer & Search Matrix' };
    if (path.startsWith('/map')) return { section: 'Spatial Analytics', title: 'National Infrastructure Risk Map' };
    if (path.startsWith('/scenarios')) return { section: 'Predictive Modeling', title: 'What-If Risk Scenario Simulator' };
    if (path.startsWith('/interventions')) return { section: 'Ministerial Governance', title: 'Risk & Alerts Action Panel' };
    if (path.startsWith('/benchmarks')) return { section: 'Comparative Analytics', title: 'Cross-Sector Benchmarks Matrix' };
    if (path.startsWith('/analytics')) return { section: 'Portfolio Intelligence', title: 'Infrastructure Portfolio Analytics' };
    if (path.startsWith('/copilot')) return { section: 'AI Assistant', title: 'Natural Language Decision Intelligence' };
    return { section: 'National Command Center', title: 'Executive Portfolio Dashboard' };
  };

  const { section, title } = getBreadcrumb();

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/90 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 select-none shadow-xs">
        {/* Left: Mobile menu toggle + Contextual title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d52ce] block leading-none">
              {section}
            </span>
            <h1 className="text-sm lg:text-base font-bold text-slate-900 tracking-tight font-heading truncate mt-0.5">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Interactive Global Command Search Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full bg-slate-50 hover:bg-slate-100/90 border border-slate-200 hover:border-slate-300 text-xs text-slate-500 pl-3.5 pr-2.5 py-2 rounded-xl flex items-center justify-between transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Search projects, ministries, or run command...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-white rounded-md border border-slate-200/90 shadow-2xs shrink-0">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Live Sync, Notifications, Methodology Help, Senior Officer Profile */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* Live Data Freshness Badge */}
          <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live Sync: Active</span>
          </div>

          {/* Notification Center with Dropdown Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-slate-900 font-heading">
                      Active Early Warning Alerts
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {unreadAlerts.length} Pending
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-1">
                  {unreadAlerts.length > 0 ? (
                    unreadAlerts.map((alert) => (
                      <div key={alert.id} className="py-2.5 px-1 space-y-1.5 hover:bg-slate-50/80 rounded-lg transition p-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {alert.title}
                          </p>
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase shrink-0 ${
                            alert.severity === 'critical' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-orange-50 text-orange-600 border border-orange-200'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{alert.time}</span>
                          <button
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                            className="text-[#0d52ce] hover:underline font-bold"
                          >
                            Acknowledge
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">
                      All active early warnings acknowledged.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/interventions');
                    }}
                    className="w-full py-1.5 rounded-lg bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-xs font-bold text-center transition"
                  >
                    View Risk & Alerts Governance Panel →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help / Methodology Button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            title="PAIMANA Predictive Methodology & Scoring Standards"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Senior Official User Profile Badge */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-[#003366] text-white font-extrabold text-xs flex items-center justify-center shadow-xs border border-blue-400/20">
              JS
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className="flex items-center space-x-1">
                <p className="font-bold text-slate-900 truncate">Joint Secretary (Infra)</p>
                <Shield className="w-3 h-3 text-[#0d52ce]" />
              </div>
              <p className="text-[10px] text-slate-500">MoSPI • Govt. of India</p>
            </div>
          </div>
        </div>
      </header>

      {/* Methodology & Analytical Governance Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0d52ce] flex items-center justify-center border border-blue-100">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-heading">
                    PAIMANA PredictIQ Analytical Framework
                  </h2>
                  <p className="text-xs text-slate-500">
                    Infrastructure & Project Monitoring Division (IPMD), MoSPI
                  </p>
                </div>
              </div>

              <button
                onClick={() => setHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                <span className="font-bold text-[#0d52ce] uppercase text-[10px] tracking-wider">
                  1. Predictive Risk Index (0 - 100 Scale)
                </span>
                <p>
                  Projects are evaluated across 4 risk vectors: Cost Overrun Risk (40%), Schedule Delay Risk (35%), Land & Right-of-Way Bottlenecks (15%), and Contractor Execution Variance (10%).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
                <span className="font-bold text-amber-800 uppercase text-[10px] tracking-wider">
                  2. Causal SHAP Explainability
                </span>
                <p>
                  Every risk prediction provides SHAP (Shapley Additive exPlanations) attribution, revealing the precise physical and economic drivers contributing to project slippage.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider">
                  3. Early Warning Lead Time
                </span>
                <p>
                  Machine learning models generate early warning flags 4.5 to 6.2 months before milestones appear on traditional manual monitoring reports, enabling preventive interventions.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setHelpOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0d52ce] hover:bg-[#0b45ad] text-white text-xs font-bold transition shadow-xs"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
