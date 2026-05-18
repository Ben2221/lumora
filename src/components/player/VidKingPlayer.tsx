"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface VidKingPlayerProps {
  id: string;
  type: 'movie' | 'tv';
  season?: string;
  episode?: string;
}

export default function VidKingPlayer({ id, type, season, episode }: VidKingPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Construct URL based on VidKing API docs
  let url = `https://www.vidking.net/embed/${type}/${id}?color=e50914&autoplay=true`;
  
  if (type === 'tv' && season && episode) {
    url += `&season=${season}&episode=${episode}`;
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <Loader2 className="w-12 h-12 text-[#e50914] animate-spin mb-4" />
          <p className="text-gray-400 font-medium">Loading Player...</p>
        </div>
      )}
      
      <iframe
        src={url}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media"
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}
