'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface BlogPost {
  id: number;
  titleTh: string;
  titleEn: string;
  excerptTh: string;
  excerptEn: string;
  contentTh: string;
  contentEn: string;
  image: string | null;
  slug: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogPage() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ success: boolean; data: BlogPost[] }>('/blog')
      .then((res) => {
        if (res.data) setPosts(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getTitle = (p: BlogPost) => locale === 'th' ? p.titleTh : p.titleEn;
  const getExcerpt = (p: BlogPost) => locale === 'th' ? p.excerptTh : p.excerptEn;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#2EC4B6]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('title')}
            </h1>
            <p className="text-gray-200 text-lg">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">{t('no_posts')}</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/${locale}/blog/${post.slug}`)}
                >
                  <div className="relative h-48 overflow-hidden">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={getTitle(post)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1E3A5F] to-[#2EC4B6] flex items-center justify-center">
                        <Tag className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#1E293B] mb-2 group-hover:text-[#1E3A5F] transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      {getTitle(post)}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                      {getExcerpt(post)}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[#2EC4B6]/10 text-[#2EC4B6] font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[#1E3A5F] text-sm font-medium group-hover:gap-2 transition-all">
                      {t('read_more')} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
