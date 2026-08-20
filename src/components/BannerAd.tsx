export function BannerAd({ ad, heightClass }: { ad: any, heightClass: string }) {
  if (!ad) return null;
  
  return (
    <a 
      href={ad.target_url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`block w-full ${heightClass} overflow-hidden rounded-xl border border-white/5 relative cursor-pointer`}
    >
      <img 
        src={ad.media_url} 
        alt={ad.title} 
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="absolute bottom-0 left-0 p-3 flex flex-col justify-end w-full h-full">
        <span className="text-white text-sm md:text-base font-black truncate">{ad.title}</span>
        <div className="mt-1.5">
          <span className="bg-[#00E676] text-black text-[9px] font-bold px-2.5 py-1 rounded">
            Learn More
          </span>
        </div>
      </div>
    </a>
  );
}