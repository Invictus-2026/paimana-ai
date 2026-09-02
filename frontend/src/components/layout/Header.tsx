import React from 'react';
import { Menu, Search, Bell, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left Title & Menu Toggle */}
      <div className="flex items-center space-x-4">
        <button className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-[#1129a8] font-outfit">Dashboard</h2>
      </div>

      {/* Middle & Right Search & User Bar */}
      <div className="flex items-center space-x-4 flex-1 justify-end max-w-3xl">
        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="w-4 h-4 text-[#f8880f] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, ministries, sectors..."
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 pl-10 pr-16 py-2 rounded-xl focus:outline-none focus:border-[#f8880f] focus:bg-white transition"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            <span>Ctrl</span>
            <span>+</span>
            <span>K</span>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <button className="relative text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#ea4335] text-white font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>

          <button className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center space-x-2.5 pl-3">
          <div className="w-8 h-8 rounded-full bg-[#1129a8] text-white font-bold text-xs flex items-center justify-center shadow-xs border-2 border-[#f8880f]">
            A
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-[#1129a8] leading-tight">Admin User</p>
            <p className="text-[10px] font-medium text-slate-500">MoSPI</p>
          </div>
        </div>
      </div>
    </header>
  );
};
