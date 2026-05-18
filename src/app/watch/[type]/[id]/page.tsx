"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import VidKingPlayer from '@/components/player/VidKingPlayer';

function PlayerWithParams({ id, type }: { id: string; type: 'movie' | 'tv' }) {
  const searchParams = useSearchParams();
  const season = searchParams.get('season') || undefined;
  const episode = searchParams.get('episode') || undefined;

  return <VidKingPlayer id={id} type={type} season={season} episode={episode} />;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  
  const id = params.id as string;
  const type = params.type as 'movie' | 'tv';

  const [title, setTitle] = useState<string>('Loading...');

  useEffect(() => {
    if (!id || !type) return;
    fetch(`/api/media/${type}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.title) {
          setTitle(data.title);
          
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

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex items-center gap-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none transition-opacity duration-300 hover:opacity-100 opacity-0 group">
        <button 
          onClick={() => router.back()}
          className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all hover:scale-110"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-2xl font-bold tracking-wide pointer-events-auto">
          {title}
        </h1>
      </div>

      {/* Player Container */}
      <div className="flex-1 w-full relative group">
        <Suspense fallback={
          <div className="w-full h-full bg-black flex items-center justify-center">
            <p className="text-gray-400 font-medium">Initializing Player...</p>
          </div>
        }>
          <PlayerWithParams id={id} type={type} />
        </Suspense>
        
        {/* Helper overlay to make top header show on hover near top */}
        <div className="absolute top-0 left-0 w-full h-32 z-40 bg-transparent" />
      </div>
    </div>
  );
}
