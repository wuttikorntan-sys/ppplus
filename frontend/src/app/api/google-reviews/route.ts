import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'data', 'google-reviews-cache.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  fetchedAt: number;
  rating: number;
  totalReviews: number;
  reviews: Review[];
}

interface Review {
  authorName: string;
  profilePhoto: string;
  rating: number;
  relativeTime: string;
  text: string;
  time: number;
}

async function readCache(): Promise<CachedData | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf-8');
    const data: CachedData = JSON.parse(raw);
    if (Date.now() - data.fetchedAt < CACHE_TTL) return data;
  } catch { /* no cache */ }
  return null;
}

async function writeCache(data: CachedData) {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(data), 'utf-8');
}

export async function GET() {
  // Read settings from DB
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  const placeId = process.env.GOOGLE_PLACE_ID || '';

  if (!apiKey || !placeId) {
    return NextResponse.json({ success: false, error: 'Google Places API not configured', useMock: true }, { status: 200 });
  }

  // Check cache first
  const cached = await readCache();
  if (cached) {
    return NextResponse.json({ success: true, data: cached, source: 'cache' });
  }

  // Fetch from Google Places API
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total,reviews&language=th&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();

    if (json.status !== 'OK' || !json.result) {
      return NextResponse.json({ success: false, error: `Google API: ${json.status}`, useMock: true }, { status: 200 });
    }

    const result = json.result;
    const reviews: Review[] = (result.reviews || []);

    // If Google returns no reviews, signal to use mock
    if (reviews.length === 0) {
      return NextResponse.json({ success: false, error: 'No reviews yet', useMock: true }, { status: 200 });
    }

    const mappedReviews: Review[] = reviews.map((r: {
      author_name?: string;
      profile_photo_url?: string;
      rating?: number;
      relative_time_description?: string;
      text?: string;
      time?: number;
    }) => ({
      authorName: r.author_name || '',
      profilePhoto: r.profile_photo_url || '',
      rating: r.rating || 0,
      relativeTime: r.relative_time_description || '',
      text: r.text || '',
      time: r.time || 0,
    }));

    const data: CachedData = {
      fetchedAt: Date.now(),
      rating: result.rating || 0,
      totalReviews: result.user_ratings_total || 0,
      reviews: mappedReviews,
    };

    await writeCache(data);

    return NextResponse.json({ success: true, data, source: 'api' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch Google reviews', useMock: true }, { status: 500 });
  }
}
