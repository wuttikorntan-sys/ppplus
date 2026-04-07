import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pcolour.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['th', 'en'];
  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/menu', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/color-matching', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/gallery', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/calculator', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/quote', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/b2b', priority: 0.7, changeFrequency: 'monthly' },
  ];

  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
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

  // Dynamic: blog posts
  try {
    const posts = await db.blogPosts.findMany({ where: { isPublished: true } });
    for (const post of posts) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt || post.createdAt || now,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch {}

  // Dynamic: menu items
  try {
    const items = await db.menuItems.findMany({ where: { isAvailable: true } });
    for (const item of items) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/menu/${item.id}`,
          lastModified: item.updatedAt || now,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch {}

  return entries;
}
