import { MediaItem } from '@/constants/mockData';

const TMDB_API_KEY = 'f8e3024c329d66dc6210e08ca901e88b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

async function fetchFromTMDB(endpoint: string) {
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`TMDB API Error: ${res.status} for ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(`TMDB API network error:`, error);
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

// 1. Get Home Lists
export async function getHomeLists(): Promise<{
  trending: MediaItem[];
  originals: MediaItem[];
  blockbusters: MediaItem[];
  comedies: MediaItem[];
}> {
  try {
    const [trendingData, originalsData, blockbustersData, comediesData] = await Promise.all([
      fetchFromTMDB('/trending/all/week'),
      fetchFromTMDB('/discover/tv?with_networks=213'),
      fetchFromTMDB('/movie/top_rated'),
      fetchFromTMDB('/discover/movie?with_genres=35')
    ]);

    return {
      trending: mapTMDBResults(trendingData?.results || []),
      originals: mapTMDBResults(originalsData?.results || [], 'tv'),
      blockbusters: mapTMDBResults(blockbustersData?.results || [], 'movie'),
      comedies: mapTMDBResults(comediesData?.results || [], 'movie')
    };
  } catch (e) {
    console.warn('Failed to load standalone lists, returning fallback empty lists', e);
    return { trending: [], originals: [], blockbusters: [], comedies: [] };
  }
}

// 2. Search Media
export async function searchMedia(query: string): Promise<MediaItem[]> {
  const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
  if (!data || !data.results) return [];
  // Filter only movies & tv shows
  const filtered = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  return mapTMDBResults(filtered);
}

// 3. Get Media Details
export async function getMediaDetails(id: string, type: 'movie' | 'tv'): Promise<any> {
  const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=credits,similar,videos`);
  if (!data) return null;

  const trailerVideo = data.videos?.results?.find(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')
  );
  const trailerKey = trailerVideo ? trailerVideo.key : null;

  const cast = data.credits?.cast?.slice(0, 8).map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.character || '',
    profile_path: c.profile_path ? `${IMAGE_BASE_URL}/w185${c.profile_path}` : null
  })) || [];

  let director = undefined;
  if (type === 'movie') {
    const dirMember = data.credits?.crew?.find((c: any) => c.job === 'Director');
    if (dirMember) director = dirMember.name;
  } else if (type === 'tv') {
    if (data.created_by && data.created_by.length > 0) {
      director = data.created_by.map((c: any) => c.name).join(', ');
    }
  }

  const similarResults = data.similar?.results?.slice(0, 18) || [];
  const similar = mapTMDBResults(similarResults, type);

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
    similar
  };
}

// 4. Get Season Episodes
export async function getSeasonEpisodes(tvId: string, seasonNumber: number): Promise<any[]> {
  const data = await fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
  if (!data || !data.episodes) return [];
  return data.episodes.map((ep: any) => ({
    id: ep.id,
    name: ep.name || `Episode ${ep.episode_number}`,
    overview: ep.overview || '',
    episode_number: ep.episode_number,
    season_number: ep.season_number,
    still_path: ep.still_path ? `${IMAGE_BASE_URL}/w300${ep.still_path}` : null
  }));
}
