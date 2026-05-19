"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero({ movies, movie }: { movies?: MediaItem[]; movie?: MediaItem }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeMovies = movies || (movie ? [movie] : []);

  const startTimer = () => {
    if (activeMovies.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % activeMovies.length);
    }, 8000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeMovies.length, currentIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeMovies.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + activeMovies.length) % activeMovies.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeMovies.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % activeMovies.length);
  };

  const handleDotClick = (index: number) => {
    if (activeMovies.length <= 1) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  if (!activeMovies || activeMovies.length === 0) return null;
  const activeMovie = activeMovies[currentIndex];
  const watchUrl = activeMovie
    ? (activeMovie.type === 'tv'
      ? `/watch/tv/${activeMovie.id}?season=1&episode=1`
      : `/watch/movie/${activeMovie.id}`)
    : '';

  // Cinematic backdrop cross-fade zoom variants
  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 1.05,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="relative w-full h-[85vh] sm:h-[95vh] flex items-center overflow-hidden bg-[#070707] group">
      {/* Background Slider with Parallax Zoom */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeMovie.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              opacity: { duration: 0.8, ease: "easeInOut" },
              scale: { duration: 1.2, ease: "easeOut" }
            }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={activeMovie.backdrop_path}
              alt={activeMovie.title}
              fill
              priority
              className="object-cover object-top"
            />
          </motion.div>
        </AnimatePresence>
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
      </div>

      {/* Manual Sliding Chevrons (only if multiple movies are present) */}
      {activeMovies.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-6 z-30 p-3 rounded-full bg-black/40 text-white hover:bg-[#e50914] hover:scale-110 transition-all duration-300 backdrop-blur-md cursor-pointer select-none opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-white/10"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-6 z-30 p-3 rounded-full bg-black/40 text-white hover:bg-[#e50914] hover:scale-110 transition-all duration-300 backdrop-blur-md cursor-pointer select-none opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-white/10"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dynamic Content */}
      <div className="relative z-20 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-20">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMovie.id}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <h1 className="text-5xl sm:text-7xl font-bold text-white mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-tight font-display leading-tight">
                {activeMovie.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm sm:text-base font-semibold text-gray-300 mb-6 drop-shadow-md">
                <span className="text-green-500 font-bold">{(activeMovie.vote_average * 10).toFixed(0)}% Match</span>
                <span>{activeMovie.release_date.substring(0, 4)}</span>
                <span className="px-2 py-0.5 border border-white/30 rounded text-xs text-white/90 bg-white/5 font-mono">
                  HD
                </span>
                <span className="px-2 py-0.5 border border-[#e50914] rounded text-xs text-[#e50914] bg-[#e50914]/5 uppercase tracking-wider font-bold">
                  {activeMovie.type === 'tv' ? 'Series' : 'Movie'}
                </span>
              </div>
              
              <p className="text-base sm:text-lg text-gray-200 mb-8 line-clamp-3 sm:line-clamp-4 drop-shadow-md max-w-xl leading-relaxed">
                {activeMovie.overview}
              </p>
              
              <div className="flex items-center gap-4">
                <Link 
                  href={watchUrl}
                  className="flex items-center gap-3 bg-white text-black px-6 sm:px-8 py-3.5 sm:py-4 rounded font-bold text-base sm:text-lg hover:bg-[#e50914] hover:text-white hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Play
                </Link>
                
                <Link 
                  href={`/info/${activeMovie.type}/${activeMovie.id}`}
                  className="flex items-center gap-3 bg-gray-500/30 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded font-bold text-base sm:text-lg hover:bg-gray-500/50 hover:scale-105 transition-all duration-300 backdrop-blur-md border border-white/10"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress indicators / Dots (only if multiple movies are present) */}
      {activeMovies.length > 1 && (
        <div className="absolute bottom-28 left-0 right-0 z-30 flex justify-center gap-3">
          {activeMovies.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => handleDotClick(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${idx === currentIndex ? 'w-8 bg-[#e50914]' : 'w-2.5 bg-white/30 hover:bg-white/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
