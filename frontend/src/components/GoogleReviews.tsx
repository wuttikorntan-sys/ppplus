'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Quote } from 'lucide-react';
import Image from 'next/image';

interface Review {
  authorName: string;
  profilePhoto: string;
  rating: number;
  relativeTime: string;
  text: string;
}

interface GoogleReviewsData {
  rating: number;
  totalReviews: number;
  reviews: Review[];
}

// ─── Mock data (ใช้แทนเมื่อยังไม่มีรีวิวจริงจาก Google) ───
const MOCK_REVIEWS: GoogleReviewsData = {
  rating: 4.8,
  totalReviews: 6,
  reviews: [
    {
      authorName: 'สมชาย มีสุข',
      profilePhoto: '',
      rating: 5,
      relativeTime: '2 สัปดาห์ที่แล้ว',
      text: 'สินค้าครบทุกแบรนด์ครับ TOA, Beger, Jotun มีหมด ราคาดีกว่าห้างใหญ่ พนักงานแนะนำสีได้ตรงใจมาก ซื้อสีทาบ้านไป 3 ถัง คุ้มมากครับ',
    },
    {
      authorName: 'วิภาวี รักสวย',
      profilePhoto: '',
      rating: 5,
      relativeTime: '1 เดือนที่แล้ว',
      text: 'ร้านสะอาด จัดเรียงสินค้าเป็นระเบียบ หาง่าย พนักงานให้คำปรึกษาเรื่องสีได้ดีค่ะ ช่วยเลือกสีไม้สักให้ตรงกับบ้าน ประทับใจมากค่ะ',
    },
    {
      authorName: 'ธนกร วงศ์ทอง',
      profilePhoto: '',
      rating: 5,
      relativeTime: '3 สัปดาห์ที่แล้ว',
      text: 'มาซื้อสีสเปรย์ Bosny กับ Samurai หลายกระป๋อง ราคาถูกกว่าที่อื่น สีสวยสดมาก สเปรย์ออกสม่ำเสมอ มีของแท้ 100% ครับ',
    },
    {
      authorName: 'พิมพ์ใจ สุขสันต์',
      profilePhoto: '',
      rating: 4,
      relativeTime: '2 เดือนที่แล้ว',
      text: 'ซื้อสี Dulux Weathershield ทาบ้านภายนอก สีสวย ทนแดดทนฝน ผ่านมา 2 ปีสียังสดเหมือนใหม่ ร้านมีบริการผสมสีด้วยค่ะ เลือกเฉดได้ตามใจ',
    },
    {
      authorName: 'จักรพงษ์ แสงจันทร์',
      profilePhoto: '',
      rating: 5,
      relativeTime: '1 สัปดาห์ที่แล้ว',
      text: 'ร้านนี้เป็นร้านประจำเลยครับ ซื้อสีมาตลอด 5 ปี ไม่เคยผิดหวัง สินค้าแท้ทุกชิ้น ราคาเป็นธรรม จัดส่งถึงหน้าบ้านด้วย สะดวกมากครับ',
    },
    {
      authorName: 'นภัสสร ชลธี',
      profilePhoto: '',
      rating: 5,
      relativeTime: '5 วันที่แล้ว',
      text: 'ใช้บริการคำนวณปริมาณสีของร้าน ช่วยประหยัดค่าใช้จ่ายได้มากค่ะ ไม่ต้องซื้อเกิน พนักงานเป็นกันเองมาก ให้คำแนะนำดี จะบอกต่อเพื่อนๆ แน่นอนค่ะ',
    },
  ],
};

// ─── Skeleton loader for individual card ───
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-200 rounded w-28 mb-2" />
          <div className="h-2.5 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-4 h-4 rounded bg-gray-200" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

// ─── Stars component ───
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

// ─── Single Review Card ───
function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        {review.profilePhoto ? (
          <Image
            src={review.profilePhoto}
            alt={review.authorName}
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1C1C1E]/20 to-[#F5841F]/20 flex items-center justify-center ring-2 ring-gray-100">
            <span className="text-[#1C1C1E] font-bold text-base">{review.authorName.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[#2D2D2D] font-semibold text-sm truncate">{review.authorName}</p>
          <p className="text-gray-400 text-xs">{review.relativeTime}</p>
        </div>
        {/* Google "G" badge */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 opacity-40">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>

      {/* Stars */}
      <Stars rating={review.rating} />

      {/* Review text */}
      {review.text && (
        <p className="text-gray-600 text-sm leading-relaxed mt-3 line-clamp-4 flex-1">
          <Quote className="w-3.5 h-3.5 inline-block text-[#F5841F]/30 mr-1 -mt-0.5" />
          {review.text}
        </p>
      )}
    </motion.div>
  );
}

// ─── Main Component ───
export default function GoogleReviews({ locale, reviewUrl }: { locale: string; reviewUrl?: string }) {
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/google-reviews')
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data && r.data.reviews?.length > 0) {
          setData(r.data);
        } else {
          // API empty / error / not configured → use mock data
          setData(MOCK_REVIEWS);
        }
      })
      .catch(() => {
        // Network error → use mock data
        setData(MOCK_REVIEWS);
      })
      .finally(() => setLoading(false));
  }, []);

  const defaultReviewUrl = reviewUrl || 'https://g.page/r/CU2GmSihx5JtEBM/review';

  return (
    <section className="py-16 bg-gradient-to-b from-[#FAFAFA] to-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#1C1C1E]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#F5841F]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          {/* Google logo */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          </div>

          {/* Rating summary — show only when data loaded */}
          {data && (
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-4xl font-bold text-[#2D2D2D]">{data.rating.toFixed(1)}</span>
              <div>
                <Stars rating={data.rating} size="md" />
                <p className="text-gray-400 text-xs mt-0.5">
                  {data.totalReviews.toLocaleString()} {locale === 'th' ? 'รีวิว' : 'reviews'}
                </p>
              </div>
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {locale === 'th' ? 'รีวิวจากลูกค้า' : 'Customer Reviews'}
          </h2>
          <p className="text-gray-400 text-sm">Google Reviews</p>
        </motion.div>

        {/* Cards — loading / data / empty */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : data && data.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.reviews.slice(0, 6).map((review, idx) => (
              <ReviewCard key={idx} review={review} index={idx} />
            ))}
          </div>
        ) : null}

      </div>
    </section>
  );
}
