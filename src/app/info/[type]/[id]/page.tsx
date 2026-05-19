import Navbar from '@/components/layout/Navbar';
import { getMediaDetails } from '@/lib/tmdb';
import EpisodeSelector from '@/components/info/EpisodeSelector';
import PromoBackground from '@/components/info/PromoBackground';
import MiniTrailerCard from '@/components/info/MiniTrailerCard';
import ContentCarousel from '@/components/home/ContentCarousel';
import MyListButton from '@/components/info/MyListButton';
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
    description: media ? media.overview.slice(0, 160) : 'Browse movies and TV shows streaming on Lumora.',
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
        <PromoBackground 
          backdropPath={media.backdrop_path} 
          title={media.title} 
        />

        {/* Details Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col justify-end min-h-[90%] md:min-h-[80%]">
          
          {/* Back Navigation Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-semibold group w-fit"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          {/* Grid Layout for Title-Details (Left) & Mini Video Preview (Right) */}
          <div className="flex flex-col lg:flex-row gap-10 items-end justify-between w-full">
            
            {/* Left: Poster + Title/Info */}
            <div className="flex flex-col md:flex-row gap-8 items-end flex-1 w-full">
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
              <div className="flex-1 space-y-4 w-full">
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
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pt-2">
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
                  <MyListButton item={media} />
                </div>
              </div>
            </div>

            {/* Right: Premium Inline Trailer Card */}
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 pb-2">
              <MiniTrailerCard 
                trailerKey={media.trailer_key} 
                backdropPath={media.backdrop_path} 
                title={media.title} 
              />
            </div>

          </div>

        </div>
      </div>

      {/* Season Episodes Content Component - TV Shows Only */}
      {type === 'tv' && media.seasons && media.seasons.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <EpisodeSelector tvId={id} seasons={media.seasons} />
        </div>
      )}

      {/* Extra Detail Sections (Cast, Similar, Reviews) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-16">
        
        {/* Cast & Crew Section */}
        {((media.cast && media.cast.length > 0) || media.director) && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                Cast & Crew
              </h2>
              {media.director && (
                <div className="mt-2 sm:mt-0 text-sm sm:text-base font-semibold text-gray-400">
                  Director / Creator: <span className="text-white">{media.director}</span>
                </div>
              )}
            </div>

            {media.cast && media.cast.length > 0 && (
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x">
                {media.cast.map((actor) => (
                  <div 
                    key={actor.id} 
                    className="flex flex-col items-center text-center shrink-0 w-28 sm:w-32 snap-start group"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-white/5 group-hover:border-[#e50914] transition-colors duration-300">
                      {actor.profile_path ? (
                        <Image
                          src={actor.profile_path}
                          alt={actor.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 80px, 96px"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500 font-bold text-xl uppercase">
                          {actor.name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#e50914] transition-colors">
                      {actor.name}
                    </div>
                    <div className="text-xs font-semibold text-gray-400 line-clamp-1 mt-0.5">
                      {actor.character}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Similar Titles Section */}
        {media.similar && media.similar.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white border-b border-white/10 pb-4">
              More Like This
            </h2>
            <div className="-mx-4 sm:-mx-6 lg:-mx-8">
              <ContentCarousel title="" items={media.similar} />
            </div>
          </section>
        )}

        {/* Reviews Section */}
        {media.reviews && media.reviews.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white border-b border-white/10 pb-4">
              User Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.reviews.map((review, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors duration-300 shadow-md backdrop-blur-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-base">
                        @{review.author}
                      </div>
                      {review.rating && (
                        <div className="flex items-center gap-1 text-[#e50914] font-bold bg-[#e50914]/10 px-2 py-0.5 rounded border border-[#e50914]/20 text-xs">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {review.rating}/10
                        </div>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">
                      &ldquo;{review.content}&rdquo;
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 font-semibold mt-4 font-mono">
                    {new Date(review.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
