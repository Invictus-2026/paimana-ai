import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
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
            © 2026 PAIMANA PredictIQ | Ministry of Statistics & Programme Implementation (MoSPI), Government of India
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:underline text-slate-300">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:underline text-slate-300">Terms of Use</a>
          </div>
        </footer>
      </div>
    </div>
  );
};
