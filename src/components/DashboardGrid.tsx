"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ApplicationInfo } from '@/types';
import ApplicationCard from './ApplicationCard';
import { RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardGrid({ cardsPerRow = 4, expandDetails = true, backgroundStyle = 'none', backgroundPhotosTags = '', cardTelemetry = 'true', containerControl = true }: { cardsPerRow?: number, expandDetails?: boolean, backgroundStyle?: 'none' | 'wave' | 'circle' | 'colors' | 'photos', backgroundPhotosTags?: string, cardTelemetry?: 'true' | 'expand' | 'none', containerControl?: boolean }) {
  const [apps, setApps] = useState<ApplicationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  // Progress and Toast state
  const prevAppsRef = useRef<ApplicationInfo[]>([]);
  const [progress, setProgress] = useState(0);
  const [lastFetch, setLastFetch] = useState<number>(Date.now());

  useEffect(() => {
    if (apps.length > 0 && prevAppsRef.current.length > 0) {
      apps.forEach(app => {
         const oldApp = prevAppsRef.current.find(o => o.id === app.id);
         if (oldApp) {
           if (oldApp.status === 'running' && app.status === 'stopped') {
              toast.error(`${app.name} has gone Offline`);
           } else if (oldApp.status === 'stopped' && app.status === 'running') {
              toast.success(`${app.name} is back Online!`);
           }
         }
      });
    }
    prevAppsRef.current = apps;
  }, [apps]);

  useEffect(() => {
    let animationFrameId: number;
    const updateProgress = () => {
      const elapsed = Date.now() - lastFetch;
      const pct = Math.min(100, (elapsed / 30000) * 100);
      setProgress(pct);
      if (pct < 100) animationFrameId = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    return () => cancelAnimationFrame(animationFrameId);
  }, [lastFetch]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/applications');
      if (!res.ok) throw new Error('Failed to fetch applications');
      
      const data = await res.json();
      setApps(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
      setLastFetch(Date.now());
    }
  };

  useEffect(() => {
    fetchApps();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchApps, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    apps.forEach(app => {
       if (app.category) cats.add(app.category);
    });
    return Array.from(cats).sort();
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
       if (selectedCategory) {
          if (selectedCategory === '_running' && app.status !== 'running') return false;
          if (selectedCategory === '_stopped' && app.status !== 'stopped') return false;
          if (selectedCategory === '_secure' && !app.url.startsWith('https')) return false;
          if (!selectedCategory.startsWith('_') && app.category !== selectedCategory) return false;
       }
       if (searchQuery) {
         const q = searchQuery.toLowerCase();
         return app.name.toLowerCase().includes(q) || app.domains.some(d => d.toLowerCase().includes(q));
       }
       return true;
    });
  }, [apps, searchQuery, selectedCategory]);

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  }[cardsPerRow] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className="w-full relative">
      {/* Absolute top progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
         <div 
           className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 origin-left ease-linear"
           style={{ width: `${progress}%` }}
         />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/50 dark:bg-white/5 p-2 pr-4 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm">
        
        <div className="flex items-center space-x-2 w-full md:w-full max-w-md relative">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 dark:bg-black/30 flex items-center justify-center">
             <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
           </div>
           <input 
             type="text" 
             placeholder="Search applications or domains..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-14 pr-10 py-3 rounded-full bg-transparent focus:outline-none focus:ring-0 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
           />
           {searchQuery && (
             <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors">
               <X className="w-3.5 h-3.5" />
             </button>
           )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
           <div className="hidden md:block text-xs font-mono text-slate-400 mr-2">
             Updated {Math.floor((Date.now() - lastFetch) / 1000)}s ago
           </div>
           <button 
             onClick={fetchApps} 
             disabled={loading}
             className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20"
             title="Refresh Applications"
           >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             <span>Refresh</span>
           </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`flex-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${selectedCategory === null ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 border border-transparent dark:border-white/5'}`}
          >
            All Apps
          </button>
          <button 
            onClick={() => setSelectedCategory('_running')}
            className={`flex-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${selectedCategory === '_running' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 border border-transparent dark:border-white/5'}`}
          >
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-current"></span>Online</span>
          </button>
          <button 
            onClick={() => setSelectedCategory('_stopped')}
            className={`flex-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${selectedCategory === '_stopped' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 border border-transparent dark:border-white/5'}`}
          >
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-current"></span>Offline</span>
          </button>
          <button 
            onClick={() => setSelectedCategory('_secure')}
            className={`flex-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all pr-5 border-r dark:border-white/10 border-slate-300 ${selectedCategory === '_secure' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 border border-transparent dark:border-white/5'}`}
          >
            Secured
          </button>
          
          {categories.length > 0 && <div className="w-px h-6 bg-slate-300 dark:bg-white/10 mx-2 self-center flex-none"></div>}

          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${selectedCategory === cat ? 'bg-slate-800 text-white dark:bg-white/20 dark:text-white border-none shadow-md' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 border border-transparent dark:border-white/5'}`}
            >
              {cat}
            </button>
          ))}

          {categories.length > 5 && (
            <div className="relative flex-none">
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${showMoreCategories || (selectedCategory && categories.slice(5).includes(selectedCategory)) ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 border border-transparent dark:border-white/5'}`}
              >
                {selectedCategory && categories.slice(5).includes(selectedCategory) ? selectedCategory : `+ ${categories.length - 5} More`}
              </button>
              
              {showMoreCategories && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setShowMoreCategories(false)}></div>
                   <div className="absolute top-full right-0 mt-2 p-2 bg-white dark:bg-[#111624] border border-slate-200 dark:border-white/10 rounded-[1.25rem] shadow-2xl z-50 flex flex-col gap-1 min-w-[160px] animate-in fade-in slide-in-from-top-2">
                      {categories.slice(5).map(cat => (
                         <button
                           key={cat}
                           onClick={() => { setSelectedCategory(cat); setShowMoreCategories(false); }}
                           className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${selectedCategory === cat ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'}`}
                         >
                           {cat}
                         </button>
                      ))}
                   </div>
                 </>
              )}
            </div>
          )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-8">
          {error}
        </div>
      )}

      {!loading && apps.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl">
          <div className="animate-pulse w-16 h-16 rounded-full bg-slate-200 dark:bg-white/5 mb-4 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 opacity-20" />
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No Applications Found</p>
          <p className="mt-2 opacity-70">Make sure Traefik is running and Docker is accessible.</p>
        </div>
      )}

      {filteredApps.length > 0 && (
        <div className={`grid gap-6 items-start ${gridColsClass}`}>
          {filteredApps.map(app => (
             <ApplicationCard key={app.id} app={app} expandDetails={expandDetails} backgroundStyle={backgroundStyle} backgroundPhotosTags={backgroundPhotosTags} cardTelemetry={cardTelemetry} containerControl={containerControl} />
          ))}
        </div>
      )}
      
      {!loading && filteredApps.length === 0 && apps.length > 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
           No applications match your search.
        </div>
      )}
      
      {loading && apps.length === 0 && (
        <div className={`grid gap-6 ${gridColsClass}`}>
          {[1,2,3,4].map(i => (
             <div key={i} className="h-48 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}
