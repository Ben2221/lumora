"use client";

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from '../cards/MediaCard';
import Top10MediaCard from '../cards/Top10MediaCard';
import { MediaItem } from '@/lib/mockData';

interface CarouselProps {
  title: string;
  items: MediaItem[];
  isTop10?: boolean;
}

export default function ContentCarousel({ title, items, isTop10 = false }: CarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full pl-4 sm:pl-6 lg:pl-8 mb-8 sm:mb-12">
      <h2 className="text-white text-xl sm:text-2xl font-bold mb-4 drop-shadow-sm">{title}</h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        <div 
          className={`absolute top-0 bottom-0 left-0 w-12 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer ${!isMoved && 'hidden'}`}
          onClick={() => handleClick('left')}
        >
          <ChevronLeft className="w-8 h-8 text-white transition-transform hover:scale-125" />
        </div>

        {/* Media Row */}
        <div 
          ref={rowRef} 
          className={`flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pr-4 sm:pr-6 lg:pr-8 pb-4 ${isTop10 ? 'pl-6 sm:pl-10' : ''}`}
        >
          {items.map((item, index) => (
            isTop10 
              ? <Top10MediaCard key={`${item.id}-${index}`} item={item} index={index} />
              : <MediaCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>

        {/* Right Arrow */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-12 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => handleClick('right')}
        >
          <ChevronRight className="w-8 h-8 text-white transition-transform hover:scale-125" />
        </div>
      </div>
    </div>
  );
}
