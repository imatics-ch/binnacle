"use client";

import React from 'react';

type GlobalStyle = 'none' | 'mesh' | 'grid' | 'beams' | 'blob';

export default function GlobalBackground({ style = 'none' }: { style?: GlobalStyle }) {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-slate-50 dark:bg-[#070B14]">
      
      {/* 1. None - Subtle radial gradient match for absolute cleanliness */}
      {style === 'none' && (
         <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-[#070B14] dark:to-black" />
      )}

      {/* 2. Mesh - Massive vibrant floating aurora orbs */}
      {style === 'mesh' && (
        <div className="absolute inset-0 opacity-60 dark:opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[140px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[5000ms]" />
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/20 rounded-full blur-[160px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[7000ms]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
        </div>
      )}

      {/* 3. Grid - Technical/SaaS blueprint dots with fade out masking */}
      {style === 'grid' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]" />
        </div>
      )}

      {/* 4. Beams - Angular light rays mapping dynamically from offscreen */}
      {style === 'beams' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Main spotlight */}
          <div className="absolute top-[-20%] left-[10%] w-[15%] h-[150%] bg-gradient-to-b from-slate-300 to-transparent dark:from-white/10 dark:to-transparent rotate-[35deg] blur-[60px] opacity-40 dark:opacity-20" />
          {/* Secondary counter-spotlight */}
          <div className="absolute top-[-10%] right-[20%] w-[15%] h-[120%] bg-gradient-to-b from-cyan-200 to-transparent dark:from-cyan-500/10 dark:to-transparent rotate-[-25deg] blur-[100px] opacity-30 dark:opacity-30" />
        </div>
      )}

      {/* 5. Blob - Organic, rotating fluid shapes moving across the screen */}
      {style === 'blob' && (
        <div className="absolute inset-0 overflow-hidden opacity-70 dark:opacity-30">
           <style>
             {`
                @keyframes float-blob-1 {
                   0%, 100% { transform: translate(0px, 0px) scale(1); }
                   33% { transform: translate(150px, -200px) scale(1.1); }
                   66% { transform: translate(-100px, 150px) scale(0.9); }
                }
                @keyframes float-blob-2 {
                   0%, 100% { transform: translate(0px, 0px) scale(1); }
                   33% { transform: translate(-200px, 150px) scale(0.95); }
                   66% { transform: translate(150px, -150px) scale(1.05); }
                }
                @keyframes float-blob-3 {
                   0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
                   50% { transform: translate(250px, 50px) scale(1.1) rotate(180deg); }
                }
             `}
           </style>
           {/* Blob 1 */}
           <div 
             className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-sky-300/40 dark:bg-sky-600/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
             style={{ animation: 'float-blob-1 18s ease-in-out infinite' }}
           />
           {/* Blob 2 */}
           <div 
             className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-rose-300/40 dark:bg-rose-600/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
             style={{ animation: 'float-blob-2 22s ease-in-out infinite' }}
           />
           {/* Blob 3 */}
           <div 
             className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] bg-violet-300/40 dark:bg-violet-600/30 rounded-[40%_60%_70%_30%] blur-[120px] mix-blend-multiply dark:mix-blend-screen"
             style={{ animation: 'float-blob-3 25s ease-in-out infinite' }}
           />
        </div>
      )}

      {/* Persistent Base Textures overlaying all styles */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  );
}
