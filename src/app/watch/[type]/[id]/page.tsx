"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import VidKingPlayer from '@/components/player/VidKingPlayer';

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
        <VidKingPlayer id={id} type={type} />
        
        {/* Helper overlay to make top header show on hover near top */}
        <div className="absolute top-0 left-0 w-full h-32 z-40 bg-transparent" />
      </div>
    </div>
  );
}
