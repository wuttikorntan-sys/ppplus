'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
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

export default function BlogPostPage() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.get<{ success: boolean; data: BlogPost }>(`/blog/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (res.data) setPost(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const getTitle = (p: BlogPost) => locale === 'th' ? p.titleTh : p.titleEn;
  const getContent = (p: BlogPost) => locale === 'th' ? p.contentTh : p.contentEn;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-20">
        <div className="max-w-3xl mx-auto px-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="h-80 bg-gray-200 rounded-2xl mb-8" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">{t('no_posts')}</p>
          <button
            onClick={() => router.push(`/${locale}/blog`)}
            className="text-[#1E3A5F] font-medium hover:underline flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> {t('back_to_list')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => router.push(`/${locale}/blog`)}
          className="text-[#1E3A5F] font-medium hover:underline flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t('back_to_list')}
        </button>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Featured Image */}
          {post.image && (
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-sm">
              <Image
                src={post.image}
                alt={getTitle(post)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{t('published')}: {formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            {getTitle(post)}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Tag className="w-4 h-4 text-gray-400" />
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs rounded-full bg-[#2EC4B6]/10 text-[#2EC4B6] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none text-[#1E293B]/80 leading-relaxed whitespace-pre-line">
            {getContent(post)}
          </div>
        </motion.div>
      </article>
    </div>
  );
}
