import { NextRequest, NextResponse } from 'next/server';
import {
  getTrending,
  getNetflixOriginals,
  getNewReleases,
  getTopRated,
  getComedyMovies,
  getTrendingMovies,
  getTrendingTV
} from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    if (category) {
      let data;
      switch (category) {
        case 'trending':
          data = await getTrending();
          break;
        case 'trending_movies':
          data = await getTrendingMovies();
          break;
        case 'trending_tv':
          data = await getTrendingTV();
          break;
        case 'originals':
          data = await getNetflixOriginals();
          break;
        case 'blockbusters':
          data = await getNewReleases();
          break;
        case 'toprated':
          data = await getTopRated();
          break;
        case 'comedy':
          data = await getComedyMovies();
          break;
        default:
          return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
      return NextResponse.json(data || []);
    }

    // Default: fetch main lists in parallel
    const [trending, originals, blockbusters, comedies] = await Promise.all([
      getTrending(),
      getNetflixOriginals(),
      getNewReleases(),
      getComedyMovies(),
    ]);

    return NextResponse.json({
      trending: trending || [],
      originals: originals || [],
      blockbusters: blockbusters || [],
      comedies: comedies || [],
    });
  } catch (error) {
    console.error('API Error fetching media lists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
