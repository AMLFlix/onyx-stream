"use client";

export function UpcomingSection({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) return null;

  const chunked: any[][] = [];
  for (let i = 0; i < matches.length; i += 3) {
    chunked.push(matches.slice(i, i + 3));
  }

  return (
    <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-4 snap-x snap-mandatory scrollbar-none">
      {chunked.map((chunk, index) => (
        <div key={index} className="flex flex-col gap-2 w-[88vw] max-w-[340px] md:max-w-[400px] shrink-0 snap-center">
          {chunk.map((match: any) => (
            <a key={match.match_id} href={`https://stream.onyx.com/match/${match.match_id}`} target="_blank" rel="noopener noreferrer" className="block">
              <div className="p-3 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#1a1a1a]">
                
                <div className="flex flex-col min-w-[50px] items-start">
                  <span className="text-[#00E676] text-[8px] font-bold">{match.time_info?.local_date?.substring(0, 6) || 'TBA'}</span>
                  <span className="text-white text-xs font-bold mt-0.5">{match.time_info?.local_time?.substring(0, 5) || '00:00'}</span>
                </div>

                <div className="w-[1px] h-6 bg-gray-500/30 mx-3"></div>

                <div className="flex-1 flex flex-col items-center min-w-0">
                  <span className="text-[9px] text-gray-400 block truncate font-medium mb-1 w-full text-center">{match.league}</span>
                  <div className="flex items-center justify-center gap-1 w-full">
                    {match.teams?.home?.logo && <img src={match.teams.home.logo} className="w-5 h-5 object-contain" alt="" />}
                    <span className="text-[10px] font-bold text-white truncate max-w-[70px]">{match.teams?.home?.name?.substring(0,3).toUpperCase()}</span>
                    
                    <span className="text-[8px] text-gray-500 font-black mx-1">VS</span>
                    
                    <span className="text-[10px] font-bold text-white truncate max-w-[70px]">{match.teams?.away?.name?.substring(0,3).toUpperCase()}</span>
                    {match.teams?.away?.logo && <img src={match.teams.away.logo} className="w-5 h-5 object-contain" alt="" />}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}