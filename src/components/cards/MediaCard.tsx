"use client";

import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/lib/mockData';
import { Play } from 'lucide-react';
import { useState } from 'react';

export default function MediaCard({ item }: { item: MediaItem }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group shrink-0 w-[140px] sm:w-[180px] md:w-[220px] aspect-[2/3] rounded-md overflow-hidden bg-gray-900 transition-transform duration-300 hover:scale-105 hover:z-30 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/watch/${item.type}/${item.id}`} className="relative block w-full h-full">
        <Image
          src={item.poster_path}
          alt={item.title}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 140px, (max-width: 1024px) 180px, 220px"
        />
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 flex flex-col justify-end p-4 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:bg-[#e50914] group-hover:border-[#e50914] transition-colors duration-300">
              <Play className="w-5 h-5 fill-white text-white ml-1" />
            </div>
          </div>
          <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white font-bold text-sm sm:text-base truncate">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-green-500 font-medium text-xs">{item.vote_average * 10}%</span>
              <span className="text-gray-300 text-xs">{item.release_date.substring(0, 4)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
