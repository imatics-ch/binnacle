import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Activity, LayoutGrid, Terminal } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-[#070B14]/80 border-b border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
      <div className="max-w-[1600px] mx-auto flex h-[72px] items-center px-4 sm:px-6 lg:px-8 justify-between">
        
        {/* Left Section: Branding */}
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20 text-white font-black text-xl tracking-tighter transition-transform group-hover:scale-105 border border-white/20 dark:border-white/10">
            <Terminal className="w-5 h-5 text-emerald-950" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-[0.1em] text-slate-900 dark:text-slate-100 uppercase">
              Binnacle
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-tight">
              DOCKER & TRAEFIK
            </span>
          </div>
        </div>

        {/* Center: Maybe placeholder for future global search, currently empty or navigation */}
        <div className="hidden md:flex items-center gap-1 px-2 border border-transparent">
             {/* We can put global navigation here if needed */}
        </div>

        {/* Right Section: Status & Controls */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline-block font-semibold">SYSTEM ONLINE</span>
            <span className="sm:hidden font-semibold">OK</span>
          </div>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>
          
          <div className="bg-white dark:bg-black/20 p-1 rounded-full border border-slate-200 dark:border-white/10 shadow-sm flex items-center">
            <ThemeToggle />
          </div>
        </div>

      </div>
    </header>
  );
}
