import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://PP+.co.th';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['th', 'en'];
  const pages = ['', '/menu', '/gallery', '/about', '/contact', '/blog', '/calculator'];
  const now = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: now,
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  return entries;
}
