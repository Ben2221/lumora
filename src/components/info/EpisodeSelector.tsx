"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Loader2, Disc } from 'lucide-react';
import { Episode } from '@/lib/tmdb';

interface SeasonItem {
  id: number;
  name: string;
  episode_count: number;
  season_number: number;
  poster_path: string | null;
}

interface EpisodeSelectorProps {
  tvId: string;
  seasons: SeasonItem[];
}

export default function EpisodeSelector({ tvId, seasons }: EpisodeSelectorProps) {
  // Filter seasons to only include actual seasons
  const validSeasons = seasons.filter(s => s.season_number > 0);
  
  const [activeSeason, setActiveSeason] = useState<number>(
    validSeasons.length > 0 ? validSeasons[0].season_number : 1
  );
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    fetch(`/api/tv/${tvId}/season/${activeSeason}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setEpisodes(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching episodes:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [tvId, activeSeason]);

  if (validSeasons.length === 0) return null;

  const currentSeason = validSeasons.find(s => s.season_number === activeSeason) || validSeasons[0];

  return (
    <div className="w-full mt-12 border-t border-white/10 pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Disc className="w-6 h-6 text-[#e50914]" /> Episodes
        </h3>
        
        {/* Custom Season Selector Dropdown */}
        <div className="relative inline-block text-left z-40">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 w-full sm:w-56 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-md text-white text-sm font-bold py-2.5 px-4 focus:outline-none focus:border-[#e50914] backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <span>{currentSeason.name || `Season ${currentSeason.season_number}`}</span>
            <span className="text-[10px] text-gray-400">({currentSeason.episode_count} Episodes)</span>
            <span className={`text-[10px] text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {isDropdownOpen && (
            <>
              {/* Click outside target */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-black/95 border border-white/10 shadow-2xl z-50 backdrop-blur-xl overflow-hidden max-h-60 overflow-y-auto">
                <div className="py-1">
                  {validSeasons.map((season) => (
                    <button
                      key={season.id}
                      type="button"
                      onClick={() => {
                        setIsLoading(true); // Safe state update before season triggers fetch
                        setActiveSeason(season.season_number);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                        activeSeason === season.season_number
                          ? 'bg-[#e50914] text-white font-bold'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{season.name || `Season ${season.season_number}`}</span>
                      <span className={`text-[10px] ${activeSeason === season.season_number ? 'text-white' : 'text-gray-500'}`}>
                        {season.episode_count} Ep
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Episodes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-[#e50914] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/tv/${tvId}?season=${activeSeason}&episode=${ep.episode_number}`}
              className="group bg-white/5 border border-white/5 hover:border-white/20 rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-black/50"
            >
              {/* Still Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
                <Image
                  src={ep.still_path}
                  alt={ep.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 350px"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-[#e50914] flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wide">
                  EPISODE {ep.episode_number}
                </span>
              </div>
              
              {/* Episode Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide group-hover:text-[#e50914] transition-colors line-clamp-1">
                    {ep.name}
                  </h4>
                  <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {ep.overview}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
