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
  scifi: MediaItem[];
  action: MediaItem[];
  mystery: MediaItem[];
  horror: MediaItem[];
  romance: MediaItem[];
  crime: MediaItem[];
  fantasy: MediaItem[];
  kids: MediaItem[];
  oscar: MediaItem[];
  // TV-specific
  tvPopular: MediaItem[];
  tvTopRated: MediaItem[];
  tvDrama: MediaItem[];
  tvAction: MediaItem[];
  tvCrime: MediaItem[];
  tvScifi: MediaItem[];
  tvComedy: MediaItem[];
  tvReality: MediaItem[];
  tvAnime: MediaItem[];
  tvDocumentary: MediaItem[];
  // New & Popular
  nowPlaying: MediaItem[];
  upcoming: MediaItem[];
  trendingToday: MediaItem[];
  newTv: MediaItem[];
}> {
  try {
    const [
      trendingData,
      originalsData,
      blockbustersData,
      comediesData,
      scifiData,
      actionData,
      mysteryData,
      horrorData,
      romanceData,
      crimeData,
      fantasyData,
      kidsData,
      oscarData,
      // TV
      tvPopularData,
      tvTopRatedData,
      tvDramaData,
      tvActionData,
      tvCrimeData,
      tvScifiData,
      tvComedyData,
      tvRealityData,
      tvAnimeData,
      tvDocData,
      // New
      nowPlayingData,
      upcomingData,
      trendingTodayData,
      newTvData,
    ] = await Promise.all([
      fetchFromTMDB('/trending/all/week'),
      fetchFromTMDB('/discover/tv?with_networks=213'),
      fetchFromTMDB('/movie/top_rated'),
      fetchFromTMDB('/discover/movie?with_genres=35'),
      fetchFromTMDB('/discover/movie?with_genres=878'),
      fetchFromTMDB('/discover/movie?with_genres=28'),
      fetchFromTMDB('/discover/movie?with_genres=9648,53'),
      fetchFromTMDB('/discover/movie?with_genres=27'),
      fetchFromTMDB('/discover/movie?with_genres=10749'),
      fetchFromTMDB('/discover/movie?with_genres=80'),
      fetchFromTMDB('/discover/movie?with_genres=14'),
      fetchFromTMDB('/discover/movie?with_genres=10751,16'),
      fetchFromTMDB('/discover/movie?sort_by=vote_average.desc&vote_count.gte=5000'),
      // TV-specific fetches
      fetchFromTMDB('/tv/popular'),
      fetchFromTMDB('/tv/top_rated'),
      fetchFromTMDB('/discover/tv?with_genres=18'),
      fetchFromTMDB('/discover/tv?with_genres=10759'),
      fetchFromTMDB('/discover/tv?with_genres=80'),
      fetchFromTMDB('/discover/tv?with_genres=10765'),
      fetchFromTMDB('/discover/tv?with_genres=35'),
      fetchFromTMDB('/discover/tv?with_genres=10764'),
      fetchFromTMDB('/discover/tv?with_genres=16&with_origin_country=JP'),
      fetchFromTMDB('/discover/tv?with_genres=99'),
      // New & Popular fetches
      fetchFromTMDB('/movie/now_playing'),
      fetchFromTMDB('/movie/upcoming'),
      fetchFromTMDB('/trending/all/day'),
      fetchFromTMDB('/tv/on_the_air'),
    ]);

    return {
      trending: mapTMDBResults(trendingData?.results || []),
      originals: mapTMDBResults(originalsData?.results || [], 'tv'),
      blockbusters: mapTMDBResults(blockbustersData?.results || [], 'movie'),
      comedies: mapTMDBResults(comediesData?.results || [], 'movie'),
      scifi: mapTMDBResults(scifiData?.results || [], 'movie'),
      action: mapTMDBResults(actionData?.results || [], 'movie'),
      mystery: mapTMDBResults(mysteryData?.results || [], 'movie'),
      horror: mapTMDBResults(horrorData?.results || [], 'movie'),
      romance: mapTMDBResults(romanceData?.results || [], 'movie'),
      crime: mapTMDBResults(crimeData?.results || [], 'movie'),
      fantasy: mapTMDBResults(fantasyData?.results || [], 'movie'),
      kids: mapTMDBResults(kidsData?.results || [], 'movie'),
      oscar: mapTMDBResults(oscarData?.results || [], 'movie'),
      tvPopular: mapTMDBResults(tvPopularData?.results || [], 'tv'),
      tvTopRated: mapTMDBResults(tvTopRatedData?.results || [], 'tv'),
      tvDrama: mapTMDBResults(tvDramaData?.results || [], 'tv'),
      tvAction: mapTMDBResults(tvActionData?.results || [], 'tv'),
      tvCrime: mapTMDBResults(tvCrimeData?.results || [], 'tv'),
      tvScifi: mapTMDBResults(tvScifiData?.results || [], 'tv'),
      tvComedy: mapTMDBResults(tvComedyData?.results || [], 'tv'),
      tvReality: mapTMDBResults(tvRealityData?.results || [], 'tv'),
      tvAnime: mapTMDBResults(tvAnimeData?.results || [], 'tv'),
      tvDocumentary: mapTMDBResults(tvDocData?.results || [], 'tv'),
      nowPlaying: mapTMDBResults(nowPlayingData?.results || [], 'movie'),
      upcoming: mapTMDBResults(upcomingData?.results || [], 'movie'),
      trendingToday: mapTMDBResults(trendingTodayData?.results || []),
      newTv: mapTMDBResults(newTvData?.results || [], 'tv'),
    };
  } catch (e) {
    console.warn('Failed to load home lists:', e);
    return {
      trending: [], originals: [], blockbusters: [], comedies: [],
      scifi: [], action: [], mystery: [], horror: [], romance: [],
      crime: [], fantasy: [], kids: [], oscar: [],
      tvPopular: [], tvTopRated: [], tvDrama: [], tvAction: [], tvCrime: [],
      tvScifi: [], tvComedy: [], tvReality: [], tvAnime: [], tvDocumentary: [],
      nowPlaying: [], upcoming: [], trendingToday: [], newTv: [],
    };
  }
}

// 2. Search Media
export async function searchMedia(query: string): Promise<MediaItem[]> {
  const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
  if (!data || !data.results) return [];
  const filtered = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  return mapTMDBResults(filtered);
}

// 3. Get Media Details
export async function getMediaDetails(id: string, type: 'movie' | 'tv'): Promise<any> {
  const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=credits,similar,videos,reviews`);
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
