import { MediaItem, trendingMovies, newReleases, top10Movies, lumoraOriginals, topRatedMovies, comedyMovies } from './mockData';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

async function fetchFromTMDB(endpoint: string) {
  if (!TMDB_API_KEY) {
    return null;
  }
  
  try {
    const res = await fetch(`${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`TMDB Fetch Error at ${endpoint}:`, error);
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

export async function getMediaDetails(id: string, type: 'movie' | 'tv'): Promise<MediaItem | null> {
  const data = await fetchFromTMDB(`/${type}/${id}`);
  if (!data) {
    // Attempt to search local mock data
    const mockMatch = [...trendingMovies, ...newReleases].find(m => m.id === parseInt(id));
    return mockMatch || null;
  }
  
  return {
    id: data.id,
    title: data.title || data.name || 'Untitled',
    overview: data.overview || '',
    poster_path: data.poster_path ? `${IMAGE_BASE_URL}/w500${data.poster_path}` : 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: data.backdrop_path ? `${IMAGE_BASE_URL}/original${data.backdrop_path}` : 'https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    release_date: data.release_date || data.first_air_date || '',
    vote_average: data.vote_average || 0,
    type: type
  };
}
