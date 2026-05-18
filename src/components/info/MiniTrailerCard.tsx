"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MiniTrailerCardProps {
  trailerKey?: string | null;
  backdropPath: string;
  title: string;
}

export default function MiniTrailerCard({ trailerKey, backdropPath, title }: MiniTrailerCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Automatically trigger autoplay after a brief delay for a premium fluid feel
    if (trailerKey) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trailerKey]);

  if (!trailerKey) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center shadow-2xl">
        <Image
          src={backdropPath}
          alt={title}
          fill
          className="object-cover opacity-40 blur-sm"
        />
        <div className="absolute inset-0 bg-black/40" />
        <span className="relative z-10 text-sm font-bold text-gray-400">Preview Trailer Unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-[#0d0d0d] shadow-[0_0_30px_rgba(229,9,20,0.15)] group transition-all duration-300 hover:border-white/30">
      
      {/* Red Brand Badge Overlay */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e50914] text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Official Trailer
      </div>

      <AnimatePresence mode="wait">
        {!isPlaying ? (
          /* Thumbnail Preview Cover with Play Icon */
          <motion.div
            key="thumbnail"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full cursor-pointer z-10"
            onClick={() => setIsPlaying(true)}
          >
            <Image
              src={backdropPath}
              alt={title}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Play Button Indicator Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/25 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg group-hover:scale-115 active:scale-95 transition-all duration-300">
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              </div>
            </div>
          </motion.div>
        ) : (
          /* Embedded Frameless YouTube Mini Player */
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full z-0"
          >
            <iframe
              className="w-full h-full border-0"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&iv_load_policy=3&playsinline=1&modestbranding=1`}
              title={`${title} Official Trailer`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />

            {/* Quick Hover Audio Toggle Buttons */}
            <div className="absolute bottom-3 right-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMuted(prev => !prev);
                }}
                className="p-2 rounded-lg bg-black/70 hover:bg-[#e50914] text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer flex items-center justify-center"
                title={isMuted ? "Unmute Trailer" : "Mute Trailer"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
