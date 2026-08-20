"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// useSearchParams သုံးမည့် အပိုင်းကို သီးသန့် Component ခွဲထုတ်ခြင်း
function EmbedPlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawUrl = searchParams.get('url');
  
  // URL ကို အသုံးပြုနိုင်ရန် ပြန်ဖြေခြင်း
  const embedUrl = rawUrl ? decodeURIComponent(rawUrl) : "";

  return (
    <main className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-3 md:p-5">
        
        {/* Header - Minimal Back Action */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button 
            onClick={() => router.back()} 
            className="text-gray-400 hover:text-white text-[11px] font-bold transition-colors"
          >
            ◀ BACK
          </button>
          <span className="text-blue-400 text-[10px] font-black tracking-widest flex items-center gap-1.5">
            WEB BROWSER PLAYER
          </span>
        </div>

        {/* Iframe Embed */}
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0 focus:outline-none"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-xs text-gray-500 font-bold">
              Invalid Embed Source
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

// Main Page တွင် Suspense ဖြင့် ပြန်လည်အုပ်ပေးခြင်း
export default function EmbedPlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white text-sm">
        Loading player...
      </div>
    }>
      <EmbedPlayerContent />
    </Suspense>
  );
}