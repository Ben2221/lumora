import { MediaItem, trendingMovies, newReleases, top10Movies, lumoraOriginals, topRatedMovies, comedyMovies } from './mockData';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// High-speed In-Memory cache for both Dev and Production environments
const memoryCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache life

async function fetchFromTMDB(endpoint: string) {
  if (!TMDB_API_KEY) {
    return null;
  }
  
  // Return cached result if still valid to avoid saturating TMDB or slowing down on slow networks
  const cached = memoryCache[endpoint];
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour in production
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      if (cached) {
        console.warn(`TMDB HTTP Error ${res.status} at ${endpoint}. Returning stale cache.`);
        return cached.data;
      }
      return null;
    }
    
    const json = await res.json();
    
    // Save to high-speed memory cache
    memoryCache[endpoint] = {
      data: json,
      timestamp: now
    };
    
    return json;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`TMDB Fetch Warning at ${endpoint}:`, error.message || error);
    
    // Fallback to expired cache on network failure or timeout/abort
    if (cached) {
      console.warn(`TMDB Request failed at ${endpoint}. Returning stale cache.`);
      return cached.data;
    }
    
    return null;
  }
}

function mapTMDBResults(results: any[], typeOverride?: 'movie' | 'tv'): MediaItem[] {
  if (!results) return [];
  return results.map((item: any) => ({
    id: item.id,
    title: item.title || item.name || 'Untitled',
    overview: item.overview || '',
    poster_path: item.poster_path ? `${IMAGE_BASE_URL}/w500${item.poster_path}` : 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: item.backdrop_path ? `${IMAGE_BASE_URL}/original${item.backdrop_path}` : 'https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    release_date: item.release_date || item.first_air_date || '',
    vote_average: item.vote_average || 0,
    type: typeOverride || item.media_type || (item.first_air_date ? 'tv' : 'movie')
  }));
}

export async function getTrending(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB('/trending/all/week');
  if (!data) return trendingMovies; // Fallback
  return mapTMDBResults(data.results);
}

export async function getTrendingMovies(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB('/trending/movie/week');
  if (!data) return trendingMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getTop10(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB('/trending/movie/day');
  if (!data) return top10Movies; // Fallback
  return mapTMDBResults(data.results.slice(0, 10), 'movie');
}

export async function getNetflixOriginals(): Promise<MediaItem[]> {
  // Network 213 is Netflix
  const data = await fetchFromTMDB('/discover/tv?with_networks=213');
  if (!data) return lumoraOriginals; // Fallback
  return mapTMDBResults(data.results, 'tv');
}

export async function getNewReleases(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB('/movie/now_playing');
  if (!data) return newReleases; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getTopRated(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB('/movie/top_rated');
  if (!data) return topRatedMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getComedyMovies(): Promise<MediaItem[]> {
  // Genre 35 is Comedy
  const data = await fetchFromTMDB('/discover/movie?with_genres=35');
  if (!data) return comedyMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getActionMovies(): Promise<MediaItem[]> {
  // Genre 28 is Action
  const data = await fetchFromTMDB('/discover/movie?with_genres=28');
  if (!data) return trendingMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getSciFiMovies(): Promise<MediaItem[]> {
  // Genre 878 is Sci-Fi
  const data = await fetchFromTMDB('/discover/movie?with_genres=878');
  if (!data) return newReleases; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getDramaMovies(): Promise<MediaItem[]> {
  // Genre 18 is Drama
  const data = await fetchFromTMDB('/discover/movie?with_genres=18');
  if (!data) return trendingMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  season_number: number;
}

export async function getTVSeasonEpisodes(tvId: string, seasonNumber: number): Promise<Episode[]> {
  const data = await fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
  if (!data) {
    // Generate beautiful mock episodes for offline/fallback mode
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Episode ${i + 1}`,
      overview: `A thrilling continuation of the series in Season ${seasonNumber}, Episode ${i + 1}. The team must face high stakes and unexpected conflicts.`,
      still_path: 'https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
      episode_number: i + 1,
      season_number: seasonNumber,
    }));
  }
  
  return data.episodes.map((ep: any) => ({
    id: ep.id,
    name: ep.name || `Episode ${ep.episode_number}`,
    overview: ep.overview || 'No overview available.',
    still_path: ep.still_path ? `${IMAGE_BASE_URL}/w500${ep.still_path}` : 'https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    episode_number: ep.episode_number,
    season_number: ep.season_number,
  }));
}

export async function getMediaDetails(id: string, type: 'movie' | 'tv'): Promise<MediaItem | null> {
  const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=videos,credits,similar,reviews`);
  if (!data) {
    // Attempt to search local mock data
    const mockMatch = [...trendingMovies, ...newReleases].find(m => m.id === parseInt(id));
    if (mockMatch) {
      return {
        ...mockMatch,
        genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Sci-Fi' }],
        runtime: 148,
        number_of_seasons: type === 'tv' ? 2 : undefined,
        number_of_episodes: type === 'tv' ? 16 : undefined,
        seasons: type === 'tv' ? [
          { id: 1, name: 'Season 1', episode_count: 8, season_number: 1, poster_path: mockMatch.poster_path },
          { id: 2, name: 'Season 2', episode_count: 8, season_number: 2, poster_path: mockMatch.poster_path }
        ] : undefined,
        trailer_key: 'zSWdZVtXT7E', // Premium Interstellar HD trailer fallback
        cast: [
          { id: 1, name: 'Matthew McConaughey', character: 'Cooper', profile_path: null },
          { id: 2, name: 'Anne Hathaway', character: 'Brand', profile_path: null },
          { id: 3, name: 'Jessica Chastain', character: 'Murph', profile_path: null },
          { id: 4, name: 'Michael Caine', character: 'Professor Brand', profile_path: null }
        ],
        director: type === 'movie' ? 'Christopher Nolan' : 'Jonathan Nolan',
        similar: [...trendingMovies, ...newReleases].filter(m => m.id !== parseInt(id)).slice(0, 12),
        reviews: [
          { author: 'CinemaCritic', content: 'An absolute masterpiece of modern sci-fi filmmaking. The visual effects and Hans Zimmer score are mind-blowing!', rating: 10, created_at: '2024-01-01' },
          { author: 'SciFiFan99', content: 'Emotional, scientifically grounded, and visually stunning. One of my favorite films of all time.', rating: 9, created_at: '2024-01-02' }
        ]
      };
    }
    return null;
  }
  
  // Find trailer key
  const trailerVideo = data.videos?.results?.find(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')
  );
  const trailerKey = trailerVideo ? trailerVideo.key : null;

  // Cast mapping (first 8 members)
  const cast = data.credits?.cast?.slice(0, 8).map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.character || '',
    profile_path: c.profile_path ? `${IMAGE_BASE_URL}/w185${c.profile_path}` : null
  })) || [];

  // Director mapping
  let director = undefined;
  if (type === 'movie') {
    const dirMember = data.credits?.crew?.find((c: any) => c.job === 'Director');
    if (dirMember) director = dirMember.name;
  } else if (type === 'tv') {
    if (data.created_by && data.created_by.length > 0) {
      director = data.created_by.map((c: any) => c.name).join(', ');
    }
  }

  // Similar movies/shows (first 18 results)
  const similarResults = data.similar?.results?.slice(0, 18) || [];
  const similar = mapTMDBResults(similarResults, type);

  // Reviews mapping (first 3 reviews)
  const reviews = data.reviews?.results?.slice(0, 3).map((r: any) => ({
    author: r.author || 'Anonymous',
    content: r.content || '',
    rating: r.author_details?.rating || undefined,
    created_at: r.created_at || new Date().toISOString()
  })) || [];

  return {
    id: data.id,
    title: data.title || data.name || 'Untitled',
    overview: data.overview || '',
    poster_path: data.poster_path ? `${IMAGE_BASE_URL}/w500${data.poster_path}` : 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: data.backdrop_path ? `${IMAGE_BASE_URL}/original${data.backdrop_path}` : 'https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    release_date: data.release_date || data.first_air_date || '',
    vote_average: data.vote_average || 0,
    type: type,
    genres: data.genres || [],
    runtime: data.runtime,
    number_of_seasons: data.number_of_seasons,
    number_of_episodes: data.number_of_episodes,
    seasons: data.seasons || [],
    trailer_key: trailerKey,
    cast,
    director,
    similar,
    reviews
  };
}

export async function getTrendingTV(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB('/trending/tv/week');
  if (!data) return lumoraOriginals; // Fallback
  return mapTMDBResults(data.results, 'tv');
}

export async function getPopularTV(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB('/tv/popular');
  if (!data) return lumoraOriginals; // Fallback
  return mapTMDBResults(data.results, 'tv');
}

export async function getComedyTV(): Promise<MediaItem[]> {
  // Genre 35 is Comedy
  const data = await fetchFromTMDB('/discover/tv?with_genres=35');
  if (!data) return lumoraOriginals; // Fallback
  return mapTMDBResults(data.results, 'tv');
}

export async function searchMedia(query: string): Promise<MediaItem[]> {
  const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
  if (!data) {
    // Basic local filter for search query
    const results = [...trendingMovies, ...newReleases].filter(
      item => item.title.toLowerCase().includes(query.toLowerCase())
    );
    return results;
  }
  
  // Filter out people, only return movies and tv
  const filtered = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  return mapTMDBResults(filtered);
}

export async function getMysteryAndThriller(): Promise<MediaItem[]> {
  // Genre 9648 is Mystery, 53 is Thriller
  const data = await fetchFromTMDB('/discover/movie?with_genres=9648,53');
  if (!data) return trendingMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getHorror(): Promise<MediaItem[]> {
  // Genre 27 is Horror
  const data = await fetchFromTMDB('/discover/movie?with_genres=27');
  if (!data) return newReleases; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getRomance(): Promise<MediaItem[]> {
  // Genre 10749 is Romance
  const data = await fetchFromTMDB('/discover/movie?with_genres=10749');
  if (!data) return trendingMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getCrime(): Promise<MediaItem[]> {
  // Genre 80 is Crime
  const data = await fetchFromTMDB('/discover/movie?with_genres=80');
  if (!data) return trendingMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getFantasy(): Promise<MediaItem[]> {
  // Genre 14 is Fantasy
  const data = await fetchFromTMDB('/discover/movie?with_genres=14');
  if (!data) return newReleases; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getKids(): Promise<MediaItem[]> {
  // Genre 10751 is Family, 16 is Animation
  const data = await fetchFromTMDB('/discover/movie?with_genres=10751,16');
  if (!data) return newReleases; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getOscarNominees(): Promise<MediaItem[]> {
  // Filter top rated movies released in award seasons with vote count > 2000
  const data = await fetchFromTMDB('/discover/movie?sort_by=vote_average.desc&vote_count.gte=5000');
  if (!data) return topRatedMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}

export async function getRecommendations(id: string, type: 'movie' | 'tv'): Promise<MediaItem[]> {
  const data = await fetchFromTMDB(`/${type}/${id}/recommendations`);
  if (!data || !data.results || data.results.length === 0) {
    const similarData = await fetchFromTMDB(`/${type}/${id}/similar`);
    if (!similarData || !similarData.results) return [];
    return mapTMDBResults(similarData.results, type);
  }
  return mapTMDBResults(data.results, type);
}

export async function getPopularRecommendations(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB('/movie/popular');
  if (!data) return topRatedMovies; // Fallback
  return mapTMDBResults(data.results, 'movie');
}


