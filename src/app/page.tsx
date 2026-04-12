import DashboardGrid from '@/components/DashboardGrid';
import Header from '@/components/Header';
import GlobalBackground from '@/components/GlobalBackground';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  const cardsPerRow = parseInt(process.env.CARDS_PER_ROW || '4', 10);
  const expandDetails = process.env.EXPAND_DETAILS?.toLowerCase() !== 'false'; // true by default unless exactly 'false'
  const backgroundStyle = (process.env.CARDS_BACKGROUND_STYLE || 'wave').toLowerCase() as 'none' | 'wave' | 'circle' | 'colors' | 'photos';
  const backgroundPhotosTags = process.env.CARDS_BACKGROUND_PHOTOS_TAGS || 'nature,technology,architecture';
  const pageBackgroundStyle = (process.env.PAGE_BACKGROUND_STYLE || 'none').toLowerCase() as 'none' | 'mesh' | 'grid' | 'beams' | 'blob';
  const cardTelemetry = (process.env.CARD_TELEMETRY || 'true').toLowerCase() as 'true' | 'expand' | 'none';
  const containerControl = process.env.CONTAINER_CONTROL?.toLowerCase() !== 'false'; // true by default

  const headerLine1 = process.env.HEADER_LINE_1 || 'Binnacle';
  const headerLine2 = process.env.HEADER_LINE_2 || 'Navigate your homelab.';
  const headerDescription = process.env.HEADER_DESCRIPTION; // explicitly allow undefined


  return (
    <div className="min-h-screen text-slate-900 dark:text-white selection:bg-emerald-500/30">
      <GlobalBackground style={pageBackgroundStyle} />
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Massive, Premium Hero Section */}
        <div className="mt-4 mb-14 md:mt-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-6xl">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white mb-4 leading-[1.1]">
                {headerLine1} <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
                  {headerLine2}
                </span>
              </h1>

              {headerDescription && headerDescription.trim() !== '' && (
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed whitespace-pre-wrap">
                  {headerDescription}
                </p>
              )}
            </div>

            {/* Optional Stats overlay next to hero */}
            <div className="hidden lg:flex gap-4">
              {/* I'm holding off on connecting this to the live stat count yet, but it fills out the premium look. */}
            </div>
          </div>
        </div>

        <DashboardGrid cardsPerRow={cardsPerRow} expandDetails={expandDetails} backgroundStyle={backgroundStyle} backgroundPhotosTags={backgroundPhotosTags} cardTelemetry={cardTelemetry} containerControl={containerControl} />

        <footer className="mt-20 pt-8 border-t border-black/5 dark:border-white/5 text-center text-xs text-slate-500 dark:text-slate-600 font-mono">
          Made with ❤️ in Winterthur, Switzerland by <a href="https://www.imatics.ch" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">imatics</a> - <a href="https://www.imatics.ch" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">www.imatics.ch</a>
        </footer>
      </main>
    </div>
  );
}
