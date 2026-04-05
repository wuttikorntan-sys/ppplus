'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Play, Beaker, ShieldCheck, Layers } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface Category {
  id: number;
  nameTh: string;
  nameEn: string;
}

interface ProductDetail {
  id: number;
  categoryId: number;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  price: number;
  image: string | null;
  isAvailable: boolean;
  brand: string | null;
  colorCode: string | null;
  colorName: string | null;
  finishType: string | null;
  size: string | null;
  mixingRatio: string | null;
  applicationMethodTh: string | null;
  applicationMethodEn: string | null;
  featuresTh: string | null;
  featuresEn: string | null;
  videoUrl: string | null;
  tdsFile: string | null;
  category: Category;
}

export default function ProductDetailPage() {
  const t = useTranslations('menu');
  const locale = useLocale();
  const params = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get<{ success: boolean; data: ProductDetail }>(`/menu/${params.id}`);
        setProduct(res.data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        {locale === 'th' ? 'กำลังโหลด...' : 'Loading...'}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{locale === 'th' ? 'ไม่พบสินค้า' : 'Product not found'}</p>
        <Link href="/menu" className="text-[#F5841F] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {locale === 'th' ? 'กลับหน้าสินค้า' : 'Back to Products'}
        </Link>
      </div>
    );
  }

  const name = locale === 'th' ? product.nameTh : product.nameEn;
  const description = locale === 'th' ? product.descriptionTh : product.descriptionEn;
  const applicationMethod = locale === 'th' ? product.applicationMethodTh : product.applicationMethodEn;
  const features = locale === 'th' ? product.featuresTh : product.featuresEn;
  const categoryName = locale === 'th' ? product.category?.nameTh : product.category?.nameEn;

  // Parse video embed URL
  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/menu" className="text-sm text-[#F5841F] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {locale === 'th' ? 'กลับหน้าสินค้า' : 'Back to Products'}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
            <Image
              src={product.image || 'https://images.unsplash.com/photo-1611288875785-d673e3e6547c?w=800&h=800&fit=crop'}
              alt={name}
              fill
              className="object-cover"
              priority
            />
            {product.brand && (
              <div className="absolute top-4 left-4 bg-[#F5841F] text-white text-sm font-semibold px-3 py-1 rounded-full">
                {product.brand}
              </div>
            )}
            {product.colorCode && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div className="w-5 h-5 rounded-full border-2 border-white/30" style={{ backgroundColor: product.colorCode }} />
                <span className="text-white text-sm font-medium">{product.colorName || product.colorCode}</span>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <span className="text-sm text-[#F5841F] font-semibold uppercase">{categoryName}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-[#2D2D2D] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>{name}</h1>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-[#1C1C1E]">฿{Number(product.price).toLocaleString()}</span>
                {product.size && <span className="text-[#64748B] bg-gray-100 px-3 py-1 rounded-full text-sm">{product.size}</span>}
              </div>
              {product.finishType && (
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Layers className="w-4 h-4" />
                  <span>{locale === 'th' ? 'เนื้อสี: ' : 'Finish: '}{product.finishType}</span>
                </div>
              )}
              {product.mixingRatio && (
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Beaker className="w-4 h-4" />
                  <span>{locale === 'th' ? 'สัดส่วนผสม: ' : 'Mix Ratio: '}{product.mixingRatio}</span>
                </div>
              )}
            </div>

            <p className="text-[#64748B] leading-relaxed">{description}</p>

            {features && (
              <div>
                <h3 className="font-semibold text-[#2D2D2D] mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#F5841F]" />
                  {locale === 'th' ? 'คุณสมบัติเด่น' : 'Key Features'}
                </h3>
                <ul className="space-y-1.5">
                  {features.split('\n').filter(Boolean).map((f, i) => (
                    <li key={i} className="text-[#64748B] text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5841F] mt-1.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {applicationMethod && (
              <div>
                <h3 className="font-semibold text-[#2D2D2D] mb-2">
                  {locale === 'th' ? 'วิธีใช้งาน' : 'Application Method'}
                </h3>
                <p className="text-[#64748B] text-sm whitespace-pre-line">{applicationMethod}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/quote?productId=${product.id}&productName=${encodeURIComponent(name)}`}
                className="flex-1 text-center font-semibold py-3 rounded-xl bg-[#1C1C1E] text-white hover:bg-[#1C1C1E]/90 transition text-base"
              >
                {locale === 'th' ? 'ขอใบเสนอราคา' : 'Request Quote'}
              </Link>
              {product.tdsFile && (
                <a
                  href={product.tdsFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#1C1C1E] text-[#1C1C1E] hover:bg-[#1C1C1E]/5 transition font-medium"
                >
                  <FileText className="w-5 h-5" />
                  {locale === 'th' ? 'ดาวน์โหลด TDS' : 'Download TDS'}
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Video section */}
        {product.videoUrl && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Play className="w-6 h-6 text-[#F5841F]" /> {locale === 'th' ? 'วิดีโอสาธิต' : 'Demo Video'}
            </h2>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
              <iframe
                src={getEmbedUrl(product.videoUrl)}
                title={name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
