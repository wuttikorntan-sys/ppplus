import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAdmin, handleError } from '@/lib/api-server';

const CACHE_FILE = path.join(process.cwd(), 'data', 'google-reviews-cache.json');

interface CachedData {
  fetchedAt: number;
  rating: number;
  totalReviews: number;
  reviews: Array<{
    authorName: string;
    profilePhoto: string;
    rating: number;
    relativeTime: string;
    text: string;
    time: number;
  }>;
}

async function readCache(): Promise<CachedData | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(raw) as CachedData;
  } catch {
    return null;
  }
}

async function fetchFromGoogle(apiKey: string, placeId: string): Promise<{ ok: true; data: CachedData } | { ok: false; error: string }> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total,reviews&language=th&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    if (json.status !== 'OK' || !json.result) {
      return { ok: false, error: `Google API status: ${json.status}` };
    }
    const result = json.result;
    const reviews = (result.reviews || []).map((r: {
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
    return {
      ok: true,
      data: {
        fetchedAt: Date.now(),
        rating: result.rating || 0,
        totalReviews: result.user_ratings_total || 0,
        reviews,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    const placeId = process.env.GOOGLE_PLACE_ID || '';
    const cache = await readCache();
    return NextResponse.json({
      success: true,
      data: {
        configured: Boolean(apiKey && placeId),
        placeIdPreview: placeId ? placeId.slice(0, 6) + '...' + placeId.slice(-4) : null,
        cache,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  // Force refresh: re-fetch from Google and overwrite the on-disk cache
  try {
    requireAdmin(req);
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    const placeId = process.env.GOOGLE_PLACE_ID || '';
    if (!apiKey || !placeId) {
      return NextResponse.json({ success: false, error: 'Google Places API not configured (env: GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID)' }, { status: 400 });
    }
    const result = await fetchFromGoogle(apiKey, placeId);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(result.data), 'utf-8');
    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return handleError(err);
  }
}
