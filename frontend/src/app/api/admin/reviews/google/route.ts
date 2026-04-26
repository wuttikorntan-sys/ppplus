import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';
import { getGoogleConfig, GOOGLE_API_KEY_KEY, GOOGLE_PLACE_ID_KEY } from '@/lib/google-config';

const settingsSchema = z.object({
  apiKey: z.string().optional(),
  placeId: z.string().optional(),
});

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••';
  return key.slice(0, 4) + '••••' + key.slice(-4);
}

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
    const { apiKey, placeId } = await getGoogleConfig();
    const cache = await readCache();
    // Detect whether values come from DB vs env, so admin knows the source
    const all = await db.siteContents.findMany();
    const dbApiKey = all.find((c) => c.key === GOOGLE_API_KEY_KEY)?.valueTh || '';
    const dbPlaceId = all.find((c) => c.key === GOOGLE_PLACE_ID_KEY)?.valueTh || '';
    return NextResponse.json({
      success: true,
      data: {
        configured: Boolean(apiKey && placeId),
        // Never return the raw key — admin only needs to know it's set
        apiKeyPreview: apiKey ? maskKey(apiKey) : null,
        placeIdPreview: placeId ? maskKey(placeId) : null,
        // Where each value came from
        apiKeySource: dbApiKey ? 'db' : (process.env.GOOGLE_PLACES_API_KEY ? 'env' : null),
        placeIdSource: dbPlaceId ? 'db' : (process.env.GOOGLE_PLACE_ID ? 'env' : null),
        // Show admin the full Place ID (less sensitive, useful for debugging)
        placeIdValue: placeId,
        cache,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

// PUT — save credentials to site_contents
export async function PUT(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const data = settingsSchema.parse(body);
    const updates: { key: string; valueTh: string; valueEn: string; type?: string }[] = [];
    if (typeof data.apiKey === 'string') {
      updates.push({ key: GOOGLE_API_KEY_KEY, valueTh: data.apiKey.trim(), valueEn: data.apiKey.trim(), type: 'secret' });
    }
    if (typeof data.placeId === 'string') {
      updates.push({ key: GOOGLE_PLACE_ID_KEY, valueTh: data.placeId.trim(), valueEn: data.placeId.trim(), type: 'secret' });
    }
    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }
    await Promise.all(updates.map((u) => db.siteContents.upsert(u)));
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  // Force refresh: re-fetch from Google and overwrite the on-disk cache
  try {
    requireAdmin(req);
    const { apiKey, placeId } = await getGoogleConfig();
    if (!apiKey || !placeId) {
      return NextResponse.json({ success: false, error: 'Google Places API not configured — set API Key and Place ID in admin settings' }, { status: 400 });
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
