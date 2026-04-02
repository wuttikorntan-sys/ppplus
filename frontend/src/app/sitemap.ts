import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ppplus.co.th';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['th', 'en'];
  let pages: Array<{ path: string; priority: number; changeFrequency: string }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/menu', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/gallery', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/calculator', priority: 0.8, changeFrequency: 'monthly' },
  ];

  try {
    const row = await db.siteContents.findByKey('seo.sitemap.pages');
    if (row) {
      const parsed = JSON.parse(row.valueTh);
      if (Array.isArray(parsed) && parsed.length > 0) pages = parsed;
    }
  } catch {}

  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: (page.changeFrequency || 'monthly') as 'weekly' | 'monthly' | 'daily' | 'yearly' | 'always' | 'hourly' | 'never',
        priority: page.priority ?? 0.8,
      });
    }
  }

  return entries;
}
