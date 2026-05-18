import { NextRequest, NextResponse } from 'next/server';
import { getMediaDetails } from '@/lib/tmdb';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    if (type !== 'movie' && type !== 'tv') {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }
    const details = await getMediaDetails(id, type);
    
    if (!details) {
      return NextResponse.json({ error: 'Media details not found' }, { status: 404 });
    }
    
    return NextResponse.json(details);
  } catch (error) {
    console.error('API Error fetching media details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
