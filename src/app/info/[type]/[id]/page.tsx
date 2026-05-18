import Navbar from '@/components/layout/Navbar';
import { getMediaDetails } from '@/lib/tmdb';
import EpisodeSelector from '@/components/info/EpisodeSelector';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Calendar, Star, Clock, ListPlus, ArrowLeft, Layers } from 'lucide-react';
import { Metadata } from 'next';

interface InfoPageProps {
  params: Promise<{
    type: 'movie' | 'tv';
    id: string;
  }>;
}

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const { type, id } = await params;
  const media = await getMediaDetails(id, type);
  return {
    title: media ? `${media.title} - Lumora` : 'Details - Lumora',
  };
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { type, id } = await params;
  const media = await getMediaDetails(id, type);

  if (!media) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Media details not found</h2>
        <Link href="/" className="px-6 py-2.5 bg-[#e50914] text-white rounded hover:bg-[#b80710] transition-colors text-sm font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  // Play URL definition
  const playUrl = type === 'tv' 
    ? `/watch/tv/${id}?season=1&episode=1` 
    : `/watch/movie/${id}`;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden pb-20">
      <Navbar />

      {/* Backdrop Hero Section */}
      <div className="relative w-full h-[65vh] sm:h-[80vh] md:h-[85vh] overflow-hidden">
        {/* Background Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={media.backdrop_path}
            alt={media.title}
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          {/* Gradients to fade to black */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
        </div>

        {/* Details Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col justify-end h-full">
          
          {/* Back Navigation Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-semibold group w-fit"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-end">
            
            {/* Poster thumbnail - visible on larger screens */}
            <div className="hidden md:block w-52 shrink-0 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
              <Image
                src={media.poster_path}
                alt={media.title}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>

            {/* Title & Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {media.title}
              </h1>

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold tracking-wide">
                <span className="text-green-500 font-bold bg-green-500/10 px-2.5 py-0.5 rounded border border-green-500/20">
                  {media.vote_average ? `${(media.vote_average * 10).toFixed(0)}% Match` : '98% Match'}
                </span>
                
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {media.release_date ? media.release_date.substring(0, 4) : '2024'}
                </div>

                {type === 'tv' ? (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Layers className="w-4 h-4 text-gray-400" />
                    {media.number_of_seasons || media.seasons?.length || 1} Seasons
                  </div>
                ) : (
                  media.runtime && (
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                    </div>
                  )
                )}

                <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 bg-white/10 rounded font-black text-white border border-white/10">
                  {type}
                </span>
              </div>

              {/* Genres list */}
              {media.genres && media.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {media.genres.map((genre) => (
                    <span 
                      key={genre.id} 
                      className="text-xs font-bold text-gray-400 bg-white/5 border border-white/5 px-3 py-1 rounded-full shadow"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pt-2">
                {media.overview || "No description currently available for this title."}
              </p>

              {/* Play Buttons Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href={playUrl}
                  className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#e50914] hover:bg-[#f40612] text-white text-sm font-extrabold rounded-md shadow-lg shadow-[#e50914]/25 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  Play Now
                </Link>
                <button
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 hover:border-white/30 text-sm font-bold rounded-md hover:scale-105 active:scale-95 transition-all shadow-md backdrop-blur-md"
                >
                  <ListPlus className="w-4 h-4" />
                  My List
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Season Episodes Content Component - TV Shows Only */}
      {type === 'tv' && media.seasons && media.seasons.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <EpisodeSelector tvId={id} seasons={media.seasons} />
        </div>
      )}

    </main>
  );
}
