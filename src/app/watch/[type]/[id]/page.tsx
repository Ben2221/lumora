"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import VidKingPlayer from '@/components/player/VidKingPlayer';

function PlayerWithParams({ 
  id, 
  type, 
  backdrop, 
  overview 
}: { 
  id: string; 
  type: 'movie' | 'tv'; 
  backdrop: string | null; 
  overview: string; 
}) {
  const searchParams = useSearchParams();
  const season = searchParams.get('season') || undefined;
  const episode = searchParams.get('episode') || undefined;

  return (
    <VidKingPlayer 
      id={id} 
      type={type} 
      season={season} 
      episode={episode} 
      backdrop={backdrop} 
      overview={overview} 
    />
  );
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  
  const id = params.id as string;
  const type = params.type as 'movie' | 'tv';

  const [title, setTitle] = useState<string>('Loading...');
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [overview, setOverview] = useState<string>('');
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!id || !type) return;
    fetch(`/api/media/${type}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.title) {
          setTitle(data.title);
          setBackdrop(data.backdrop_path || null);
          setOverview(data.overview || '');
          
          // Save to LocalStorage for Continue Watching feature
          try {
            const continueList = JSON.parse(localStorage.getItem('lumora_continue_watching') || '[]');
            const newItem = {
              id: data.id,
              title: data.title,
              type: type,
              poster_path: data.poster_path,
              backdrop_path: data.backdrop_path,
              vote_average: data.vote_average || 8,
              release_date: data.release_date || '2024'
            };
            const updated = [newItem, ...continueList.filter((item: any) => item.id !== data.id)].slice(0, 10);
            localStorage.setItem('lumora_continue_watching', JSON.stringify(updated));
          } catch (e) {
            console.error('Error writing continue watching list', e);
          }
        } else {
          setTitle('Watch Live');
        }
      })
      .catch(() => setTitle('Watch Live'));
  }, [id, type]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    // Keep controls visible initially, then hide after 3 seconds
    timeoutId = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col group select-none">
      {/* Header Overlay */}
      <div className={`absolute top-0 left-0 w-full p-6 z-50 flex items-center gap-6 bg-gradient-to-b from-black/90 via-black/45 to-transparent transition-all duration-500 pointer-events-none ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        <button 
          onClick={() => router.back()}
          className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-2xl font-bold tracking-wide pointer-events-auto drop-shadow-lg font-display">
          {title}
        </h1>
      </div>

      {/* Player Container */}
      <div className="flex-1 w-full relative">
        <Suspense fallback={
          <div className="w-full h-full bg-black flex items-center justify-center">
            <p className="text-gray-400 font-medium">Initializing Player...</p>
          </div>
        }>
          <PlayerWithParams id={id} type={type} backdrop={backdrop} overview={overview} />
        </Suspense>
      </div>
    </div>
  );
}
