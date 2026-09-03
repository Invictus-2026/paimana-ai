import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../ui/CommandPalette';

export const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Listen to open command palette custom events
  useEffect(() => {
    const handleOpenCommand = () => setCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpenCommand);
    return () => window.removeEventListener('open-command-palette', handleOpenCommand);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 antialiased font-sans selection:bg-[#0d52ce] selection:text-white">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Global Interactive Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-[#f8fafc]">
          <Outlet />
        </main>

        {/* Command Center Official Footer */}
        <footer className="bg-[#0b172a] text-slate-400 text-[11px] py-2.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800 shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              © 2026 PAIMANA PredictIQ | Infrastructure & Project Monitoring Division (IPMD), MoSPI, Government of India
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[10px]">
            <span className="text-slate-400 font-mono font-semibold">SECURITY: CONFIDENTIAL / RESTRICTED</span>
            <span>•</span>
            <span className="text-slate-300">Data Freshness: 100% Validated</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
