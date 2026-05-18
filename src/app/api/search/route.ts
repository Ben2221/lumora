import { NextRequest, NextResponse } from 'next/server';
import { searchMedia } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json([]);
    }
    
    const results = await searchMedia(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error searching media:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
