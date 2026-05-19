"use client";

import { useEffect, useState, useRef } from 'react';
import { Loader2, Play } from 'lucide-react';

interface VidKingPlayerProps {
  id: string;
  type: 'movie' | 'tv';
  season?: string;
  episode?: string;
  backdrop: string | null;
  overview: string;
}

export default function VidKingPlayer({ id, type, season, episode, backdrop, overview }: VidKingPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Construct URL based on VidKing API docs
  let url = `https://www.vidking.net/embed/${type}/${id}`;

  const queryParams = new URLSearchParams({
    color: 'e50914',
    autoPlay: 'true'
  });

  if (type === 'tv') {
    const activeSeason = season || '1';
    const activeEpisode = episode || '1';
    url += `/${activeSeason}/${activeEpisode}`;
    
    queryParams.append('nextEpisode', 'true');
    queryParams.append('episodeSelector', 'true');
  }

  // Auto-enable subtitles by appending standard subtitles trigger parameters
  queryParams.append('sub', 'en');
  queryParams.append('subtitles', 'en');
  queryParams.append('subtitle', 'en');
  queryParams.append('cc_load_policy', '1');
  queryParams.append('cc_lang_pref', 'en');
  queryParams.append('hl', 'en');
  queryParams.append('lang', 'en');

  url += `?${queryParams.toString()}`;

  const [prevUrl, setPrevUrl] = useState(url);

  // If URL changes, immediately reset loading state during render
  if (url !== prevUrl) {
    setPrevUrl(url);
    setIsLoading(true);
    setIsPaused(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [url]);

  // Listen to pause/play states from VidKing player via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow messages from vidking.net
      if (!event.origin.includes('vidking.net')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && typeof data === 'object') {
          // Listen to status or event payload keys
          const status = data.event || data.status;
          if (status === 'pause' || status === 'paused') {
            setIsPaused(true);
          } else if (status === 'play' || status === 'playing') {
            setIsPaused(false);
          }
        }
      } catch (e) {
        // Safe to ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePlayClick = () => {
    setIsPaused(false);
    if (iframeRef.current?.contentWindow) {
      // Send postMessage play command to standard embedded HTML5 players
      try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'play' }), '*');
        iframeRef.current.contentWindow.postMessage({ event: 'play' }, '*');
      } catch (e) {
        console.error('Failed to postMessage play command', e);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <Loader2 className="w-12 h-12 text-[#e50914] animate-spin mb-4" />
          <p className="text-gray-400 font-medium">Loading Player...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={url}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media"
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Premium Dark Glassmorphic Pause Overlay with Promo Image */}
      {isPaused && !isLoading && (
        <div 
          onClick={handlePlayClick}
          className="absolute inset-0 z-40 flex items-center justify-start bg-black/60 backdrop-blur-[6px] transition-all duration-300 animate-in fade-in cursor-pointer select-none p-8 sm:p-16 md:p-24 text-left"
        >
          {/* Promo Background image covering the pause screen */}
          {backdrop && (
            <div 
              className="absolute inset-0 -z-10 bg-cover bg-center opacity-30 transition-opacity duration-500"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
          )}
          
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-transparent" />

          {/* Pause Info Details (Netflix-Style) */}
          <div className="max-w-2xl flex flex-col items-start space-y-6 animate-in slide-in-from-left-6 duration-300">
            {/* Play trigger button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayClick();
              }}
              className="flex items-center justify-center gap-3 bg-[#e50914] hover:bg-[#b80710] text-white text-base font-bold py-3 px-6 rounded-full shadow-lg shadow-[#e50914]/20 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Resume Playback</span>
            </button>

            <div className="space-y-3">
              <span className="inline-block text-xs uppercase tracking-wider text-gray-400 font-bold bg-white/10 px-2.5 py-1 rounded">
                Paused
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white font-display leading-tight drop-shadow-md">
                {type === 'tv' && season && episode ? `S${season}:E${episode}` : 'Now Playing'}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium line-clamp-4 max-w-xl drop-shadow">
                {overview || 'Enjoy your viewing session. Lumora automatically manages English subtitles.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400 pt-2">
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Auto-Subtitles: English
              </span>
              <span>Click anywhere on screen to resume</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
