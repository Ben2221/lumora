import { NextRequest, NextResponse } from 'next/server';
import { getTVSeasonEpisodes } from '@/lib/tmdb';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; season: string }> }
) {
  try {
    const { id, season } = await params;
    const seasonNumber = parseInt(season);
    
    if (isNaN(seasonNumber)) {
      return NextResponse.json({ error: 'Invalid season number' }, { status: 400 });
    }
    
    const episodes = await getTVSeasonEpisodes(id, seasonNumber);
    return NextResponse.json(episodes);
  } catch (error) {
    console.error('API Error fetching season episodes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
