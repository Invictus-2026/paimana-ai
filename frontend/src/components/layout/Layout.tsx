import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 antialiased font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-5 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
        {/* Footer matching screenshot bottom bar */}
        <footer className="bg-[#0b1a3a] text-slate-300 text-[11px] py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
          <div>
            {t('layout.footer.copyright')}
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:underline text-slate-300">{t('layout.footer.privacyPolicy')}</a>
            <span>|</span>
            <a href="#" className="hover:underline text-slate-300">{t('layout.footer.termsOfUse')}</a>
          </div>
        </footer>
      </div>
    </div>
  );
};
