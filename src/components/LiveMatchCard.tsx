export function LiveMatchCard({ match }: { match: any }) {
  const isLive = match.live_status?.toLowerCase() === 'live';
  const statusText = isLive ? "LIVE" : (match.time_info?.local_date?.substring(0, 6) || "TODAY");

  return (
    <div className="w-[240px] md:w-[280px] p-3 rounded-xl bg-[#121212] border border-white/5 flex flex-col justify-between shadow-lg cursor-pointer hover:bg-[#1a1a1a] transition-all h-full">
      
      {/* 🔴 Header Info */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-pulse mr-1"></span>}
          <span className={`text-[9px] font-bold ${isLive ? 'text-[#E53935]' : 'text-[#00E676]'}`}>
            {statusText.toUpperCase()}
          </span>
        </div>
        <span className="text-gray-400 text-[9px] truncate max-w-[100px] text-right">{match.league}</span>
      </div>

      {/* 🔴 Teams Display */}
      <div className="flex justify-between items-center my-2">
        <div className="flex flex-col items-center w-[45%]">
          {match.teams?.home?.logo ? (
            <img src={match.teams.home.logo} alt="" className="w-9 h-9 md:w-11 md:h-11 object-contain" />
          ) : <div className="w-9 h-9 bg-white/5 rounded-full"></div>}
          <span className="text-[11px] text-center font-semibold mt-1.5 truncate w-full text-gray-300">{match.teams?.home?.name || 'TBA'}</span>
        </div>
        
        <span className="text-gray-500/50 font-black text-[10px] px-1">VS</span>
        
        <div className="flex flex-col items-center w-[45%]">
          {match.teams?.away?.logo ? (
            <img src={match.teams.away.logo} alt="" className="w-9 h-9 md:w-11 md:h-11 object-contain" />
          ) : <div className="w-9 h-9 bg-white/5 rounded-full"></div>}
          <span className="text-[11px] text-center font-semibold mt-1.5 truncate w-full text-gray-300">{match.teams?.away?.name || 'TBA'}</span>
        </div>
      </div>

      {/* 🔴 Footer Actions */}
      <div className="flex justify-between items-center pt-3 mt-1">
        <span className="text-[10px] text-gray-400 font-medium">{match.time_info?.local_time || 'TBA'}</span>
        <div className={`px-2.5 py-1 rounded-md flex items-center justify-center ${isLive ? 'bg-[#E53935]' : 'bg-[#00E676]/15'}`}>
          <span className={`text-[9px] font-bold ${isLive ? 'text-white' : 'text-[#00E676]'}`}>
            {isLive ? 'Watch Live ▶' : 'Details'}
          </span>
        </div>
      </div>

    </div>
  );
}