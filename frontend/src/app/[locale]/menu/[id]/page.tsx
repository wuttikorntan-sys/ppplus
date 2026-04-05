'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Play, Beaker, ShieldCheck, Layers, ShoppingCart, Download, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

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
  const { addItem } = useCart();
  const th = locale === 'th';

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

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      nameTh: product.nameTh,
      nameEn: product.nameEn,
      price: product.price,
      image: product.image,
      size: product.size,
      brand: product.brand,
    });
    toast.success(th ? 'เพิ่มลงตะกร้าแล้ว' : 'Added to cart');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#1C1C1E]">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#2D2D2D] border-b dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/menu" className="text-sm text-[#F5841F] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {th ? 'กลับหน้าสินค้า' : 'Back to Products'}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-[#2D2D2D] shadow-lg">
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
              <h1 className="text-3xl md:text-4xl font-bold text-[#2D2D2D] dark:text-white mt-1" style={{ fontFamily: 'var(--font-heading)' }}>{name}</h1>
            </div>

            <div className="bg-white dark:bg-[#2D2D2D] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-[#1C1C1E] dark:text-white">฿{Number(product.price).toLocaleString()}</span>
                {product.size && <span className="text-[#64748B] dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-sm">{product.size}</span>}
              </div>
              {product.finishType && (
                <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-gray-400">
                  <Layers className="w-4 h-4" />
                  <span>{th ? 'เนื้อสี: ' : 'Finish: '}{product.finishType}</span>
                </div>
              )}
              {product.mixingRatio && (
                <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-gray-400">
                  <Beaker className="w-4 h-4" />
                  <span>{th ? 'สัดส่วนผสม: ' : 'Mix Ratio: '}{product.mixingRatio}</span>
                </div>
              )}
            </div>

            <p className="text-[#64748B] dark:text-gray-300 leading-relaxed">{description}</p>

            {features && (
              <div>
                <h3 className="font-semibold text-[#2D2D2D] dark:text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#F5841F]" />
                  {th ? 'คุณสมบัติเด่น' : 'Key Features'}
                </h3>
                <ul className="space-y-1.5">
                  {features.split('\n').filter(Boolean).map((f, i) => (
                    <li key={i} className="text-[#64748B] dark:text-gray-400 text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5841F] mt-1.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {applicationMethod && (
              <div>
                <h3 className="font-semibold text-[#2D2D2D] dark:text-white mb-2">
                  {th ? 'วิธีใช้งาน' : 'Application Method'}
                </h3>
                <p className="text-[#64748B] dark:text-gray-400 text-sm whitespace-pre-line">{applicationMethod}</p>
              </div>
            )}

            {/* Video / TDS buttons */}
            {(product.videoUrl || product.tdsFile) && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {product.videoUrl && (
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#1C1C1E] dark:border-white/20 text-[#1C1C1E] dark:text-white hover:bg-[#1C1C1E]/5 dark:hover:bg-white/10 transition font-medium"
                  >
                    <Play className="w-5 h-5 text-[#F5841F]" />
                    {th ? 'ดูวิดีโอสาธิต' : 'Watch Demo Video'}
                    <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                  </a>
                )}
                {product.tdsFile && (
                  <a
                    href={product.tdsFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#1C1C1E] dark:border-white/20 text-[#1C1C1E] dark:text-white hover:bg-[#1C1C1E]/5 dark:hover:bg-white/10 transition font-medium"
                  >
                    <FileText className="w-5 h-5 text-[#F5841F]" />
                    {th ? 'ดาวน์โหลด TDS' : 'Download TDS'}
                    <Download className="w-3.5 h-3.5 opacity-50" />
                  </a>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl bg-[#F5841F] text-white hover:bg-[#e0741a] transition text-lg shadow-md cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              {th ? 'เพิ่มลงตะกร้า' : 'Add to Cart'}
            </button>
          </motion.div>
        </div>

        {/* Video section */}
        {product.videoUrl && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
            <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-white mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Play className="w-6 h-6 text-[#F5841F]" /> {th ? 'วิดีโอสาธิต' : 'Demo Video'}
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
