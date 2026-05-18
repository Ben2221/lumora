"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { MediaItem } from '@/lib/mockData';

export default function Hero({ movie }: { movie: MediaItem }) {
  return (
    <div className="relative w-full h-[85vh] sm:h-[95vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={movie.backdrop_path}
          alt={movie.title}
          fill
          priority
          className="object-cover object-top"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            {movie.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm sm:text-base font-medium text-gray-300 mb-6 drop-shadow-md">
            <span className="text-green-500 font-bold">{movie.vote_average * 10}% Match</span>
            <span>{movie.release_date.substring(0, 4)}</span>
            <span className="px-2 py-0.5 border border-gray-500 rounded text-xs text-gray-300">
              HD
            </span>
          </div>
          
          <p className="text-base sm:text-lg text-gray-200 mb-8 line-clamp-3 sm:line-clamp-4 drop-shadow-md max-w-xl">
            {movie.overview}
          </p>
          
          <div className="flex items-center gap-4">
            <Link 
              href={`/watch/${movie.type}/${movie.id}`}
              className="flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded font-bold text-base sm:text-lg hover:bg-gray-200 transition-colors"
            >
              <Play className="w-5 h-5 fill-black" />
              Play
            </Link>
            
            <button className="flex items-center gap-2 bg-gray-500/40 text-white px-6 sm:px-8 py-3 sm:py-4 rounded font-bold text-base sm:text-lg hover:bg-gray-500/60 transition-colors backdrop-blur-md">
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
