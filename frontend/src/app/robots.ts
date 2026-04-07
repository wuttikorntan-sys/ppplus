import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pcolour.com';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let disallow = ['/api/', '/admin/'];

  try {
    const row = await db.siteContents.findByKey('seo.robots.disallow');
    if (row) {
      const parsed = JSON.parse(row.valueTh);
      if (Array.isArray(parsed) && parsed.length > 0) disallow = parsed;
    }
  } catch {}

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
