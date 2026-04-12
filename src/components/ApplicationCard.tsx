import React, { useState, useEffect } from 'react';
import { ApplicationInfo } from '@/types';
import { Globe, Lock, Activity, Cpu, Play, Square, RotateCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

function LiveSparkline({ baseString, colorClass, width = 48, height = 16 }: { baseString: string, colorClass: string, width?: number, height?: number }) {
  // Extract pure float from "2.5%" or "120MB"
  const baselineValue = parseFloat(baseString.replace(/[^0-9.]/g, '')) || 0;
  
  const [data, setData] = useState<number[]>(Array(15).fill(baselineValue));

  useEffect(() => {
    // If telemetry says 0 or is dead, just stay flat
    if (baselineValue === 0) return;

    // Simulate alive container micro-drifting anchored to the true baseline
    const interval = setInterval(() => {
      setData(prev => {
        // Drift +/- 10%
        const drift = (Math.random() - 0.5) * (baselineValue * 0.2); 
        const newValue = Math.max(0, baselineValue + drift);
        return [...prev.slice(1), newValue];
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [baselineValue]);

  // Calculate SVG Box
  const max = Math.max(...data, baselineValue * 1.5, 1);
  const min = Math.max(0, Math.min(...data) - (baselineValue * 0.5));
  const range = max - min;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' L ');

  const pathD = `M ${points}`;
  // Extract tailwind color (e.g. text-emerald-500 -> emerald-500)
  const strokeClass = colorClass.replace('text-', 'stroke-');
  const fillClass = colorClass.replace('text-', 'fill-');

  return (
    <div style={{ width, height }} className="ml-auto opacity-70 group-hover:opacity-100 transition-opacity">
      <svg width={width} height={height} className="overflow-visible">
        <path d={`${pathD} L ${width},${height} L 0,${height} Z`} className={fillClass} fillOpacity="0.15" />
        <path d={pathD} fill="none" className={strokeClass} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function ApplicationCard({ app, expandDetails = true, backgroundStyle = 'none', backgroundPhotosTags = '', cardTelemetry = 'true', containerControl = true }: { app: ApplicationInfo, expandDetails?: boolean, backgroundStyle?: 'none' | 'wave' | 'circle' | 'colors' | 'photos', backgroundPhotosTags?: string, cardTelemetry?: 'true' | 'expand' | 'none', containerControl?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const [unsplashUrl, setUnsplashUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const leaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setIsHovered(false), 300);
  };

  React.useEffect(() => {
     if (backgroundStyle === 'photos') {
        fetch(`/api/unsplash?tags=${encodeURIComponent(backgroundPhotosTags)}&app=${encodeURIComponent(app.name)}`)
           .then(res => res.json())
           .then(data => {
              if (data.url) setUnsplashUrl(data.url);
           })
           .catch(() => setUnsplashUrl(null));
     }
  }, [backgroundStyle, backgroundPhotosTags, app.name]);

  // Determine unique color palette based on name hash
  const hash = app.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes = [
    { bg: 'bg-teal-50 dark:bg-teal-900/30', blobs: ['#14b8a6', '#10b981', '#0891b2'], vibrantBase: 'bg-gradient-to-br from-teal-500 via-emerald-400 to-cyan-500 dark:from-teal-800 dark:via-emerald-700 dark:to-cyan-900' },
    { bg: 'bg-indigo-50 dark:bg-indigo-900/30', blobs: ['#2563eb', '#4f46e5', '#9333ea'], vibrantBase: 'bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-900 dark:via-indigo-800 dark:to-purple-900' },
    { bg: 'bg-rose-50 dark:bg-rose-900/30', blobs: ['#e11d48', '#db2777', '#c026d3'], vibrantBase: 'bg-gradient-to-br from-rose-500 via-pink-400 to-fuchsia-500 dark:from-rose-900 dark:via-pink-800 dark:to-fuchsia-900' },
    { bg: 'bg-sky-50 dark:bg-sky-900/30', blobs: ['#0ea5e9', '#2563eb', '#4f46e5'], vibrantBase: 'bg-gradient-to-br from-sky-500 via-blue-400 to-indigo-500 dark:from-sky-900 dark:via-blue-800 dark:to-indigo-900' },
    { bg: 'bg-amber-50 dark:bg-amber-900/30', blobs: ['#f59e0b', '#ea580c', '#e11d48'], vibrantBase: 'bg-gradient-to-br from-amber-500 via-orange-400 to-rose-500 dark:from-amber-900 dark:via-orange-800 dark:to-rose-900' },
  ];
  const uniquePalette = palettes[hash % palettes.length];

  // Determine gradient based on status
  const statusColor = app.status === 'running' ? 'bg-emerald-500' :
                      app.status === 'stopped' ? 'bg-red-500' :
                      app.status === 'unknown' ? 'bg-slate-400 dark:bg-slate-400' : 'bg-slate-500';

  const handleAction = async (e: React.MouseEvent, action: 'start' | 'stop' | 'restart') => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!app.containerIds || app.containerIds.length === 0) {
       toast.error(`No associated Docker containers found for ${app.name}.`);
       return;
    }
    
    const toastId = toast.loading(`Initiating ${action} on ${app.name}...`);
    try {
       for (const id of app.containerIds) {
          const res = await fetch('/api/containers/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action })
          });
          if (!res.ok) {
             const data = await res.json();
             throw new Error(data.error || 'Server error');
          }
       }
       toast.success(`Successfully executed ${action} on ${app.name}!`, { id: toastId });
    } catch(err: any) {
       toast.error(`Failed to ${action} ${app.name}: ${err.message}`, { id: toastId });
    }
  };

  const isWave = backgroundStyle === 'wave';
  const isCircle = backgroundStyle === 'circle';
  const isPhotos = backgroundStyle === 'photos';
  const isVibrant = isWave;

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative h-fit rounded-[1.5rem] border p-6 flex flex-col justify-between transition-all duration-500 shadow-sm hover:shadow-xl ${
        isVibrant ? 'border-transparent shadow-xl ring-1 ring-white/20 text-white' : 
        backgroundStyle === 'colors' ? `border-transparent dark:border-white/5 ${uniquePalette.bg}` : 
        ((isCircle || isPhotos) ? 'bg-white border-slate-200 dark:bg-[#111624] dark:border-transparent dark:shadow-xl dark:ring-1 dark:ring-white/5' : 'bg-white dark:bg-[#0f1523] border-slate-200 dark:border-white/10 dark:hover:border-white/20')
    }`}>

      {/* Background container — overflow-hidden stays here only to clip backgrounds to card bounds */}
      <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden pointer-events-none z-0">
      
      {/* Dynamic Background Styling */}
      {isPhotos && (
         <div className="absolute inset-0 z-0 overflow-hidden bg-slate-50 dark:bg-[#0f1523] group-hover:scale-105 transition-transform duration-1000 ease-out">
            {unsplashUrl && (
              <img 
                 src={unsplashUrl}
                 alt="Background"
                 className="w-full h-full object-cover opacity-[0.35] dark:opacity-40 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                 onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50/90 via-slate-50/50 to-transparent dark:from-[#0f1523]/90 dark:via-[#0f1523]/70 dark:to-transparent pointer-events-none"></div>
         </div>
      )}

      {isCircle && (
         <div 
           className="absolute inset-0 z-0 overflow-hidden opacity-90 pointer-events-none transition-all duration-[2000ms] group-hover:opacity-100 ease-out bg-slate-50 dark:bg-[#0a0a0e]"
           style={{
             backgroundImage: `
               radial-gradient(circle at 5% 5%, ${uniquePalette.blobs[0]}66 0%, transparent 45%),
               radial-gradient(ellipse at 90% 10%, ${uniquePalette.blobs[1]}55 0%, transparent 55%),
               radial-gradient(ellipse at 85% 90%, ${uniquePalette.blobs[2]}55 0%, transparent 60%),
               radial-gradient(circle at 10% 90%, ${uniquePalette.blobs[0]}44 0%, transparent 50%),
               radial-gradient(ellipse at 40% 40%, ${uniquePalette.blobs[1]}33 0%, transparent 60%),
               radial-gradient(ellipse at 60% 110%, ${uniquePalette.blobs[2]}55 0%, transparent 50%)
             `
           }}
         />
      )}

      {backgroundStyle === 'colors' && (
         <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 z-0 opacity-100 dark:opacity-60 mix-blend-multiply dark:mix-blend-screen ${uniquePalette.bg}`} />
      )}

      {isWave && (
         <div className={`absolute inset-0 z-0 overflow-hidden ${uniquePalette.vibrantBase}`}>
            {/* Sharp sweeping transparent waves */}
            <svg viewBox="0 0 1440 320" className="absolute top-0 left-0 w-[120%] h-full opacity-20 transition-transform duration-1000 group-hover:-translate-x-4 pointer-events-none" preserveAspectRatio="none">
               <path fill="currentColor" className="text-white" d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,181.3C960,171,1056,181,1152,197.3C1248,213,1344,235,1392,245.3L1440,256L1440,0L0,0Z"></path>
            </svg>
            <svg viewBox="0 0 1440 320" className="absolute bottom-0 right-0 w-[120%] h-full opacity-[0.15] transition-transform duration-1000 group-hover:translate-x-4 pointer-events-none flex items-end" preserveAspectRatio="none">
               <path fill="currentColor" className="text-black" d="M0,64L48,80C96,96,192,128,288,122.7C384,117,480,75,576,69.3C672,64,768,96,864,122.7C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"></path>
            </svg>
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
         </div>
      )}
      </div>{/* End background container */}

      {/* Absolute bounding box for the entire card link — z-[1] above backgrounds but below expand/controls */}
      <a href={app.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-[1] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 cursor-pointer rounded-[1.5rem]" title={`Open ${app.name}`}></a>
      
      {/* Top right status indicator (z-0 as link covers it) */}
      <div className="absolute top-0 right-0 p-4 z-0 transition-opacity duration-300 group-hover:opacity-0 hidden md:block">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3" title={`Status: ${app.status}`}>
              {app.status === 'running' && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isVibrant ? 'bg-white/60' : 'bg-emerald-400'} opacity-75`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isVibrant ? 'bg-white shadow-sm' : statusColor}`}></span>
            </span>
          </div>
      </div>

      {/* Hover action buttons (must be z-20 to sit ON TOP of the link block) */}
      {containerControl && app.containerIds && app.containerIds.length > 0 && (
         <div className="absolute top-0 right-0 p-3 z-20 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
            <button onClick={(e) => handleAction(e, 'start')} className={`p-1.5 rounded-full transition-colors cursor-pointer ${isVibrant ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/10 text-emerald-500'}`} title="Start Container">
               <Play className={`w-4 h-4 ${isVibrant ? 'fill-white' : 'fill-emerald-500/20'}`} />
            </button>
            <button onClick={(e) => handleAction(e, 'restart')} className={`p-1.5 rounded-full transition-colors cursor-pointer ${isVibrant ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/10 text-cyan-500'}`} title="Restart Container">
               <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={(e) => handleAction(e, 'stop')} className={`p-1.5 rounded-full transition-colors cursor-pointer ${isVibrant ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/10 text-red-500'}`} title="Stop Container">
               <Square className={`w-4 h-4 ${isVibrant ? 'fill-white' : 'fill-red-500/20'}`} />
            </button>
         </div>
      )}
      
      {/* Structural layout */}
      <div className="relative z-0 flex items-center space-x-4 mb-4">
        <div className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center shadow-inner overflow-hidden ${isVibrant ? 'bg-white/20 backdrop-blur-md border border-white/20' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
          {app.favicon && !imgError ? (
             <img src={app.favicon} alt={app.name} className={`w-8 h-8 object-contain rounded-md p-1 ${isVibrant ? 'bg-white/20' : 'bg-white/10'}`} onError={() => setImgError(true)} />
          ) : (
             <Globe className="text-white w-6 h-6 drop-shadow-md" />
          )}
        </div>
        <div className="flex-1 min-w-0 pointer-events-none drop-shadow-sm">
          <h2 className={`text-xl font-bold tracking-tight truncate flex items-center gap-2 ${isVibrant ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
            {app.name}
            <ExternalLink className={`w-3.5 h-3.5 transition-opacity opacity-0 group-hover:opacity-100 ${isVibrant ? 'text-white/60' : 'text-slate-400'}`} />
          </h2>
          <div className={`flex items-center space-x-1 text-xs mt-1 ${isVibrant ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
            {app.hasHttps ? <Lock className={`w-3 h-3 shrink-0 ${isVibrant ? 'text-white/90' : 'text-emerald-600 dark:text-emerald-400'}`} /> : <Activity className={`w-3 h-3 shrink-0 ${isVibrant ? 'text-white/60' : 'text-slate-400'}`} />}
            <span className="truncate">{app.domains[0]}</span>
          </div>
        </div>
      </div>
      
      {/* Inline telemetry: only when cardTelemetry is 'true' */}
      {cardTelemetry === 'true' && (
        app.telemetry ? (
          <div className={`relative z-0 flex items-center space-x-3 mb-4 text-[11px] font-mono ${isVibrant ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
             <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-md w-full border ${isVibrant ? 'bg-black/20 border-white/10 backdrop-blur-sm shadow-inner' : 'bg-slate-100/80 dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-sm'}`}>
                <Cpu className={`w-3.5 h-3.5 shrink-0 ${isVibrant ? 'text-white opacity-80' : 'text-emerald-500 dark:text-emerald-400'}`} />
                <span className="font-semibold tracking-wide">{app.telemetry.cpu}</span>
                <LiveSparkline baseString={app.telemetry.cpu} colorClass={isVibrant ? 'text-white' : 'text-emerald-500'} />
             </div>
             <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-md w-full border ${isVibrant ? 'bg-black/20 border-white/10 backdrop-blur-sm shadow-inner' : 'bg-slate-100/80 dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-sm'}`}>
                <span className={`font-bold shrink-0 tracking-wider ${isVibrant ? 'text-white/70' : 'text-sky-500/70 dark:text-cyan-500/70'}`}>RAM</span>
                <span className="font-semibold tracking-wide">{app.telemetry.memory}</span>
                <LiveSparkline baseString={app.telemetry.memory} colorClass={isVibrant ? 'text-white' : 'text-cyan-500'} />
             </div>
          </div>
        ) : (
          <div className={`relative z-0 flex items-center space-x-3 mb-4 text-[11px] font-mono ${isVibrant ? 'text-white/40' : 'text-slate-400 dark:text-slate-600'}`}>
             <div className={`flex items-center justify-center px-3 py-1.5 rounded-md w-full border ${isVibrant ? 'bg-black/10 border-white/5' : 'bg-slate-100/40 dark:bg-black/10 border-slate-200/50 dark:border-white/5'}`}>
                <span className="italic opacity-60">No telemetry</span>
             </div>
          </div>
        )
      )}

      <div className={`relative z-0 text-xs font-mono rounded px-3 py-2 flex items-center justify-between border mt-auto shadow-sm ${isVibrant ? 'bg-black/30 backdrop-blur-md border border-white/10 text-white/90' : 'bg-slate-100/80 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-500'}`}>
         <span className={app.hasHttps ? (isVibrant ? "text-white font-semibold flex items-center gap-1" : "text-emerald-700 dark:text-emerald-400/80") : (isVibrant ? "text-white/70" : "text-amber-600 dark:text-amber-400/80")}>
            {app.hasHttps ? 'HTTPS Secured' : 'HTTP'}
         </span>
         <span className="uppercase text-[10px] tracking-widest font-bold opacity-90">{app.status}</span>
      </div>

          {/* Expanded details on hover */}
          {expandDetails && (app.traefikDetails || cardTelemetry === 'expand') && (
            <div className={`relative z-[2] grid transition-[grid-template-rows,opacity] duration-300 ease-in-out mt-0 ${isHovered ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
               <div className="overflow-hidden">
                   <div className={`pt-3 mt-1 border-t ${isVibrant ? 'border-white/10' : 'border-slate-200 dark:border-white/10'}`}>

                       {/* Traefik Config Section */}
                       {app.traefikDetails && (
                         <>
                           <h4 className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-3 flex items-center gap-2 ${isVibrant ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                             <Globe className="w-3 h-3" /> Traefik Config 
                           </h4>
                           <div className={`text-[10px] font-mono space-y-2.5 pb-1 relative z-20 ${isVibrant ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}>
                             <div className="flex justify-between items-center">
                                <span className={`font-bold uppercase tracking-wider ${isVibrant ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>Router</span>
                                <span className={`truncate ml-2 ${isVibrant ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{app.traefikDetails.routerName}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className={`font-bold uppercase tracking-wider ${isVibrant ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>Service</span>
                                <span className={`truncate ml-2 ${isVibrant ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{app.traefikDetails.service}</span>
                             </div>
                             <div className={`flex justify-between items-center border-t pt-2 mt-1 ${isVibrant ? 'border-white/5' : 'border-slate-100 dark:border-white/5'}`}>
                                <span className={`font-bold uppercase tracking-wider ${isVibrant ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>Rule</span>
                                <span className={`truncate ml-2 text-right ${isVibrant ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`} title={app.traefikDetails.rule}>{app.traefikDetails.rule}</span>
                             </div>
                           </div>
                         </>
                       )}

                       {/* Telemetry in expand mode */}
                       {cardTelemetry === 'expand' && (
                          <div className={`${app.traefikDetails ? 'border-t pt-2.5 mt-2' : ''} text-[10px] font-mono relative z-20 ${isVibrant ? 'border-white/10 text-white/80' : 'border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}>
                             <h4 className={`font-bold tracking-[0.2em] uppercase mb-3 flex items-center gap-2 ${isVibrant ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                               <Cpu className="w-3 h-3" /> Telemetry
                             </h4>
                             {app.telemetry ? (
                               <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                     <span className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${isVibrant ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>CPU</span>
                                     <span className={`font-semibold ${isVibrant ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{app.telemetry.cpu}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                     <span className={`font-bold uppercase tracking-wider ${isVibrant ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>RAM</span>
                                     <span className={`font-semibold ${isVibrant ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{app.telemetry.memory}</span>
                                  </div>
                               </div>
                             ) : (
                               <span className={`italic opacity-50 ${isVibrant ? 'text-white/40' : 'text-slate-400 dark:text-slate-500'}`}>No telemetry available</span>
                             )}
                          </div>
                       )}

                   </div>
               </div>
            </div>
          )}
    </div>
  );
}
