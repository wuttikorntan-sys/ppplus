import { db } from '@/lib/db';

export const GOOGLE_API_KEY_KEY = 'secret.google.places_api_key';
export const GOOGLE_PLACE_ID_KEY = 'secret.google.place_id';

/**
 * Resolve Google Places config. Admin-managed values in site_contents
 * take precedence; if either is missing, we fall back to env vars so
 * the existing setup (set via .env) keeps working.
 */
export async function getGoogleConfig(): Promise<{ apiKey: string; placeId: string }> {
  const all = await db.siteContents.findMany();
  const map = new Map(all.map((c) => [c.key, c.valueTh || c.valueEn || '']));
  const apiKey = (map.get(GOOGLE_API_KEY_KEY) || process.env.GOOGLE_PLACES_API_KEY || '').trim();
  const placeId = (map.get(GOOGLE_PLACE_ID_KEY) || process.env.GOOGLE_PLACE_ID || '').trim();
  return { apiKey, placeId };
}
