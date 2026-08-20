export function HighlightCard({ match }: { match: any }) {
  return (
    <div className="w-[180px] md:w-[220px] cursor-pointer group h-full flex flex-col">
      
      {/* 🔴 Thumbnail Area */}
      <div className="w-full h-[100px] md:h-[120px] rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center relative mb-2 group-hover:border-white/20 transition-all">
        <div className="flex items-center gap-2">
          {match.teams?.home?.logo && <img src={match.teams.home.logo} className="w-8 h-8 object-contain" alt="" />}
          <span className="text-[9px] font-black text-gray-500">VS</span>
          {match.teams?.away?.logo && <img src={match.teams.away.logo} className="w-8 h-8 object-contain" alt="" />}
        </div>
        
        {/* VOD Badge */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded shadow">
          <span className="text-[7px] text-white font-bold">VOD</span>
        </div>
      </div>
      
      {/* 🔴 Info Area */}
      <div className="text-[10px] font-bold text-white truncate w-full">
        {match.teams?.home?.name} vs {match.teams?.away?.name}
      </div>
      <div className="text-[8px] text-gray-400 truncate w-full mt-0.5">
        {match.league}
      </div>
      
    </div>
  );
}