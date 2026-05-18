"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MediaItem } from '@/lib/mockData';
import { Play } from 'lucide-react';
import { useState } from 'react';

export default function Top10MediaCard({ item, index }: { item: MediaItem; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const watchUrl = item.type === 'tv'
      ? `/watch/tv/${item.id}?season=1&episode=1`
      : `/watch/movie/${item.id}`;
      
    router.push(watchUrl);
  };

  return (
    <div 
      className="relative group shrink-0 flex items-center justify-end w-[180px] sm:w-[240px] md:w-[290px] h-[210px] sm:h-[270px] md:h-[330px] transition-transform duration-300 hover:scale-105 hover:z-30 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Card */}
      <Link href={`/info/${item.type}/${item.id}`} className="relative block w-[140px] sm:w-[180px] md:w-[220px] h-full rounded-md overflow-hidden bg-gray-900 shadow-2xl z-20 border border-white/5">
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
            <button 
              onClick={handlePlayClick}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#e50914] hover:bg-[#f40612] border border-[#e50914] transition-all hover:scale-110 duration-300 shadow-lg shadow-[#e50914]/30 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white text-white ml-1 animate-pulse" />
            </button>
          </div>
          <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white font-bold text-xs sm:text-sm truncate">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-green-500 font-semibold text-[10px]">{item.vote_average ? `${(item.vote_average * 10).toFixed(0)}% Match` : '98% Match'}</span>
              </div>
          </div>
        </div>
      </Link>

      {/* The giant number behind the card on the left side */}
      <div 
        className="absolute left-[-2%] sm:left-[-6%] bottom-[-5%] sm:bottom-[-10%] text-[#0f0f0f] font-black tracking-tighter leading-none z-10 pointer-events-none select-none text-[130px] sm:text-[190px] md:text-[250px]"
        style={{
          WebkitTextStroke: '4px #333333',
          textShadow: '0 0 25px rgba(0,0,0,0.9)',
        }}
      >
        {index + 1}
      </div>
    </div>
  );
}
