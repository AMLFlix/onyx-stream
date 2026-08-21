import Link from 'next/link';

async function getMatchDetail(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const secretKey = process.env.APP_SECRET_KEY;
  if (!baseUrl || !secretKey) return null;

  const headers = { 
    'X-App-Key': secretKey, 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)', 
    'Accept': 'application/json' 
  };

  try {
    const [liveRes, hlRes, upcomingRes] = await Promise.all([
      fetch(`${baseUrl}api/v1/matches?date=1`, { headers, next: { revalidate: 30 } }),
      fetch(`${baseUrl}api/v1/highlights`, { headers, next: { revalidate: 60 } }),
      fetch(`${baseUrl}api/v1/upcoming?page=1&limit=30`, { headers, next: { revalidate: 30 } })
    ]);

    const [liveJson, hlJson, upcomingJson] = await Promise.all([
      liveRes.ok ? liveRes.json() : { data: [] },
      hlRes.ok ? hlRes.json() : { data: [] },
      upcomingRes.ok ? upcomingRes.json() : { data: [] }
    ]);

    const allMatches = [
      ...(liveJson.data || []), 
      ...(hlJson.data || []), 
      ...(upcomingJson.data || [])
    ];
    
    return allMatches.find(m => String(m.match_id) === id) || null;
  } catch {
    return null;
  }
}

export default async function MatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const match = await getMatchDetail(resolvedParams.id);
  
  // 🟢 သင့်၏ Main Website URL အစစ်သို့ ပြောင်းလဲထားပါသည်
  const MAIN_SITE_URL = "https://onyxsports.space";

  if (!match) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center flex-col px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold mb-1 tracking-tight">Match Unavailable</h1>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-sm mb-6">The match you are looking for has ended or is currently unavailable.</p>
        <a href={MAIN_SITE_URL} className="px-5 py-2.5 bg-[#00E676] hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all active:scale-95 shadow-lg shadow-[#00E676]/20">
          Back to Schedule
        </a>
      </div>
    );
  }

  const isLive = match.live_status?.toLowerCase() === 'live';

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-[#00E676] selection:text-black antialiased flex flex-col">
      
      <header className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          <a href={MAIN_SITE_URL} className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800 active:scale-95 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Matches</span>
          </a>
          
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800/80 truncate">
              {match.league || 'Match Center'}
            </span>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 rounded-md shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-red-500 text-[10px] font-black tracking-widest">LIVE</span>
              </span>
            )}
          </div>

        </div>
      </header>

      <section className="w-full bg-gradient-to-b from-zinc-900/90 to-zinc-950 border-b border-zinc-800/60 py-4 sm:py-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-[#00E676]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-12 md:gap-20">
            
            <div className="flex items-center sm:flex-row-reverse gap-2.5 sm:gap-4 flex-1 sm:flex-initial justify-start sm:justify-end">
              <span className="text-xs sm:text-base md:text-lg font-bold text-white text-left sm:text-right line-clamp-1 max-w-[110px] sm:max-w-[200px] md:max-w-[260px]">
                {match.teams?.home?.name || 'Home'}
              </span>
              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800/80 p-1.5 flex items-center justify-center shadow-md">
                {match.teams?.home?.logo ? (
                  <img src={match.teams.home.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-bold text-zinc-500">HOM</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center shrink-0 px-2">
              <div className="bg-zinc-900/90 border border-zinc-800 px-3 sm:px-5 py-1 sm:py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
                <span className="text-xs sm:text-sm font-black text-zinc-400">VS</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <span className="text-xs sm:text-sm font-extrabold text-[#00E676] tracking-wider">
                  {match.time_info?.local_time || 'TBA'}
                </span>
              </div>
              <span className="text-[10px] font-medium text-zinc-500 mt-1">
                {match.time_info?.local_date || ''}
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4 flex-1 sm:flex-initial justify-end sm:justify-start">
              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800/80 p-1.5 flex items-center justify-center shadow-md">
                {match.teams?.away?.logo ? (
                  <img src={match.teams.away.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-bold text-zinc-500">AWY</span>
                )}
              </div>
              <span className="text-xs sm:text-base md:text-lg font-bold text-white text-right sm:text-left line-clamp-1 max-w-[110px] sm:max-w-[200px] md:max-w-[260px]">
                {match.teams?.away?.name || 'Away'}
              </span>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Information
              </h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50">
                  <span className="text-zinc-500 font-medium">Competition</span>
                  <span className="text-zinc-200 font-semibold">{match.league || 'Standard'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50">
                  <span className="text-zinc-500 font-medium">Match Date</span>
                  <span className="text-zinc-200 font-semibold">{match.time_info?.local_date || 'TBA'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-zinc-500 font-medium">Kick-off</span>
                  <span className="text-[#00E676] font-bold">{match.time_info?.local_time || 'TBA'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Select Live Stream Server
              </h3>
              <span className="text-[11px] font-medium text-zinc-500">
                {match.servers?.length || 0} Sources Available
              </span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 mb-4 text-xs text-zinc-300">
              <div className="w-2 h-2 rounded-full bg-[#00E676] shrink-0 animate-ping"></div>
              <p className="leading-tight">If one broadcast stream is buffering, please switch to another server source below.</p>
            </div>

            {!match.servers || match.servers.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800/60 border-dashed rounded-2xl p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-800/80 text-zinc-500 flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                </div>
                <p className="text-zinc-300 text-xs font-bold">Broadcast Links Pending</p>
                <p className="text-zinc-500 text-[11px] mt-1">Streaming sources will activate 15 minutes before kick-off.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {match.servers.map((server: any, idx: number) => {
                  const encodedUrl = Buffer.from(server.url || 'empty').toString('base64');
                  
                  const linkUrl = (server.isEmbed === 1 || server.url?.includes("youtu")) 
                    ? `/embed?data=${encodedUrl}` 
                    : `/player/${match.match_id}?data=${encodedUrl}`;

                  return (
                    <Link 
                      key={idx} 
                      href={linkUrl} 
                      className="group flex items-center justify-between p-3.5 bg-zinc-900/70 border border-zinc-800/80 hover:border-[#00E676]/50 rounded-xl transition-all duration-200 hover:bg-zinc-800/50 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-[#00E676] text-zinc-400 group-hover:text-black flex items-center justify-center transition-colors shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                            {server.name || `Server ${idx + 1}`}
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-medium block">
                            {server.isEmbed === 1 ? "Web Browser Player" : "Direct HD Stream"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-black bg-zinc-950 border border-zinc-800 group-hover:border-[#00E676]/40 group-hover:text-[#00E676] text-zinc-400 px-2 py-1 rounded-md shrink-0 transition-colors">
                        WATCH
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

    </main>
  );
}