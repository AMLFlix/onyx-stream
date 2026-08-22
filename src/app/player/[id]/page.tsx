"use client";

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Hls from 'hls.js';

export default function PlayerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 🟢 Base64 မှ မူလ URL သို့ ပြန်ပြောင်းခြင်း (Decoding)
  const encodedData = searchParams.get('data');
  let streamUrl = '';
  try {
    streamUrl = encodedData ? atob(encodedData) : '';
  } catch (e) {
    console.error("Invalid Stream Data");
  }

  const referer = searchParams.get('referer');
  const userAgent = searchParams.get('ua');

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Player States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Quality States
  const [qualities, setQualities] = useState<{ height: number; index: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 is Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  let controlsTimeout: NodeJS.Timeout;

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying && !showQualityMenu) setShowControls(false);
    }, 3500);
  };

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;
    const video = videoRef.current;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();

        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          liveSyncDurationCount: 3,
          enableWorker: true,
          xhrSetup: function(xhr, url) {
            try {
              // 🟢 Null နှင့် None များကို သေချာစစ်ထုတ်ထားပါသည်
              if (referer && referer !== 'none' && referer !== 'null') {
                xhr.setRequestHeader('X-Custom-Referer', referer);
              }
              if (userAgent && userAgent !== 'none' && userAgent !== 'null') {
                xhr.setRequestHeader('X-Custom-User-Agent', userAgent);
              }
            } catch (e) {
              console.warn("Browser blocked setting custom headers.", e);
            }
          }
        });

        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          const availableQualities = data.levels.map((level, index) => ({
            height: level.height,
            index: index,
          })).sort((a, b) => b.height - a.height);
          
          setQualities(availableQualities);
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setIsError(true);
                setTimeout(() => {
                  hls.startLoad();
                  setIsError(false);
                }, 3000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                initPlayer();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => setIsPlaying(false));
        });
      }
    };

    initPlayer();

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsError(false); setIsPlaying(true); };
    const onPause = () => setIsPlaying(false);

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      clearTimeout(controlsTimeout);
    };
  }, [streamUrl, referer, userAgent]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current?.pause();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled && videoRef.current) {
        if (videoRef.current.readyState >= 1) {
          await videoRef.current.requestPictureInPicture();
        } else {
          console.warn("Video is not ready for Picture-in-Picture yet.");
        }
      }
    } catch (error) {
      console.error("PiP Error:", error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  };

  const changeQuality = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentQuality(index);
      setShowQualityMenu(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#000000] flex flex-col items-center justify-center md:p-8">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { if(isPlaying && !showQualityMenu) setShowControls(false) }}
        className="relative w-full max-w-6xl aspect-video bg-black md:rounded-2xl overflow-hidden shadow-2xl border border-white/5"
      >
        <video
          ref={videoRef}
          className={`w-full h-full object-contain ${showQualityMenu ? 'blur-sm' : ''} transition-all`}
          playsInline
          onClick={togglePlay}
        />

        {(isBuffering || isError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10 pointer-events-none">
            <div className="w-10 h-10 border-4 border-[#00E676]/30 border-t-[#00E676] rounded-full animate-spin"></div>
            {isError && <span className="text-white text-xs mt-3 font-bold">Reconnecting...</span>}
          </div>
        )}

        <div 
          className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 z-20 ${showControls || !isPlaying || showQualityMenu ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="w-full p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
            <button onClick={() => router.back()} className="text-white p-2 hover:bg-white/10 rounded-full backdrop-blur-md transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#E53935] animate-pulse"></span>
              <span className="text-white text-[10px] font-black tracking-widest">LIVE STREAM</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center" onClick={togglePlay}>
              {!isPlaying && !isBuffering && (
                <div className="w-16 h-16 bg-[#00E676]/90 backdrop-blur-md rounded-full flex items-center justify-center pl-1 cursor-pointer hover:scale-110 transition-transform">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="black"><path d="M5 3l14 9-14 9V3z"/></svg>
                </div>
              )}
          </div>

          <div className="w-full p-4 bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white hover:text-[#00E676] transition-colors">
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                  )}
                </button>

                <div className="hidden md:flex items-center gap-2 group">
                  <button onClick={() => {
                    const newMuted = !isMuted;
                    setIsMuted(newMuted);
                    if(videoRef.current) {
                      videoRef.current.muted = newMuted;
                      if(!newMuted && volume === 0) setVolume(0.5);
                    }
                  }} className="text-white hover:text-[#00E676] transition-colors">
                    {isMuted || volume === 0 ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    )}
                  </button>
                  <input 
                    type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover:w-20 transition-all duration-300 opacity-0 group-hover:opacity-100 accent-[#00E676] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                
                <div className="relative">
                  <button 
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded backdrop-blur-md border border-white/10 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    {currentQuality === -1 ? 'AUTO' : `${qualities.find(q => q.index === currentQuality)?.height}p`}
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-3 w-32 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                      <div className="px-3 py-2 border-b border-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quality</div>
                      <button 
                        onClick={() => changeQuality(-1)}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${currentQuality === -1 ? 'text-[#00E676] bg-white/5' : 'text-white hover:bg-white/5'}`}
                      >
                        Auto {currentQuality === -1 && '✓'}
                      </button>
                      {qualities.map((q) => (
                        <button 
                          key={q.index}
                          onClick={() => changeQuality(q.index)}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${currentQuality === q.index ? 'text-[#00E676] bg-white/5' : 'text-white hover:bg-white/5'}`}
                        >
                          {q.height}p {currentQuality === q.index && '✓'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={togglePiP} className="text-white hover:text-[#00E676] transition-colors hidden sm:block">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="12" y="14" width="7" height="5" rx="1" ry="1"/></svg>
                </button>

                <button onClick={toggleFullscreen} className="text-white hover:text-[#00E676] transition-colors">
                  {isFullscreen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}