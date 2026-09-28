import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  LineChart,
  Award,
  FileText,
  Bot,
  Settings,
  ChevronDown,
  Calendar
} from 'lucide-react';

interface NavItem {
  key: string;
  labelKey: string;
  path: string;
  icon: React.ElementType;
  badge?: boolean;
  hasDropdown?: boolean;
}

const mainNavItems: NavItem[] = [
  { key: 'intelligence', labelKey: 'sidebar.nav.intelligence', path: '/intelligence', icon: Bot },
  { key: 'dashboard', labelKey: 'sidebar.nav.dashboard', path: '/dashboard', icon: LayoutGrid },
  { key: 'projects', labelKey: 'sidebar.nav.projects', path: '/projects', icon: FolderKanban },
  { key: 'progress', labelKey: 'sidebar.nav.stateProgress', path: '/progress', icon: LayoutGrid, badge: true },
  { key: 'analytics', labelKey: 'sidebar.nav.analytics', path: '/analytics', icon: TrendingUp, hasDropdown: true },
  { key: 'interventions', labelKey: 'sidebar.nav.riskAlerts', path: '/interventions', icon: AlertTriangle },
  { key: 'scenarios', labelKey: 'sidebar.nav.forecasting', path: '/scenarios', icon: LineChart },
  { key: 'benchmarks', labelKey: 'sidebar.nav.benchmarks', path: '/benchmarks', icon: Award },
  { key: 'reports', labelKey: 'sidebar.nav.reports', path: '/reports', icon: FileText },
  { key: 'copilot', labelKey: 'sidebar.nav.aiAssistant', path: '/copilot', icon: Bot, badge: true },
  { key: 'settings', labelKey: 'sidebar.nav.settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  // Removed analyticsOpen state

  return (
    <aside className="w-64 max-md:w-48 max-sm:w-16 max-sm:overflow-hidden bg-white border-r border-slate-200 flex flex-col justify-between h-screen overflow-y-auto sticky top-0 z-20 shrink-0 text-slate-700 font-sans">
      <div>
        {/* Brand Header */}
        <div className="p-5 max-sm:p-3 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-[#0d52ce] flex items-center justify-center text-white shadow-md shadow-[#0d52ce]/20 shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div className="max-sm:hidden">
            <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
              PAIMANA <span className="text-[#0d52ce]">PredictIQ</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500">{t('sidebar.brand.tagline')}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="mt-4 px-3 space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const isAnalytics = item.path === '/analytics';

            return (
              <div key={item.key} className="space-y-1">
                <NavLink
                  to={item.path}
                  title={t(item.labelKey)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 max-sm:px-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0d52ce] text-white shadow-md shadow-[#0d52ce]/20'
                        : isItemActive && isAnalytics
                        ? 'bg-blue-50 text-[#0d52ce] font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isItemActive && !isAnalytics ? 'text-white' : isItemActive && isAnalytics ? 'text-[#0d52ce]' : 'text-slate-500'}`} />
                    <span className="max-sm:hidden">{t(item.labelKey)}</span>
                  </div>

                  <div className="flex items-center space-x-1 max-sm:hidden">
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-600 border border-orange-200 uppercase tracking-wide">
                        {t('sidebar.badge.new')}
                      </span>
                    )}
                    {item.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isItemActive ? 'rotate-180 text-[#0d52ce]' : 'text-slate-400'}`} />
                    )}
                  </div>
                </NavLink>

                {/* Sub-links for Analytics */}
                {isAnalytics && isItemActive && (
                  <div className="ml-5 pl-4 border-l-2 border-blue-200/80 space-y-1 py-1">
                    <NavLink
                      to="/analytics"
                      end
                      className={({ isActive }) =>
                        `block px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#0d52ce] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`
                      }
                    >
                      {t('sidebar.sub.benchmarksTrends')}
                    </NavLink>
                    <NavLink
                      to="/analytics/cost-overrun"
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#0d52ce] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`
                      }
                    >
                      <span>{t('sidebar.sub.costOverrun')}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">{t('sidebar.sub.aiBadge')}</span>
                    </NavLink>
                    <NavLink
                      to="/analytics/time-overrun"
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#0d52ce] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`
                      }
                    >
                      <span>{t('sidebar.sub.timeOverrun')}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-bold">{t('sidebar.sub.aiBadge')}</span>
                    </NavLink>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Widgets */}
      <div className="p-4 max-sm:hidden border-t border-slate-100 space-y-2.5">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
          <span>{t('sidebar.footer.dataAsOf')} <strong>{t('sidebar.footer.dataDate')}</strong></span>
        </div>

        <div className="flex items-center space-x-2.5 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <div className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
            🇮🇳
          </div>
          <div>
            <p className="font-bold text-slate-800 text-[11px] leading-tight">{t('sidebar.footer.portal')}</p>
            <p className="text-[10px] text-slate-500">{t('sidebar.footer.ministryShort')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
