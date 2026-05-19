import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations, getPopularRecommendations } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (id && type && (type === 'movie' || type === 'tv')) {
      const recommendations = await getRecommendations(id, type);
      return NextResponse.json(recommendations);
    }

    // Fallback: fetch general popular recommendations
    const popular = await getPopularRecommendations();
    return NextResponse.json(popular);
  } catch (error) {
    console.error('API Error in recommendations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
