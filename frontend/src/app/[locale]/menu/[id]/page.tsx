'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  FileText,
  Play,
  AlertTriangle,
  ClipboardCheck,
  SprayCan,
  Layers,
} from 'lucide-react';
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
  unit: string | null;
  mixingRatio: string | null;
  applicationMethodTh: string | null;
  applicationMethodEn: string | null;
  featuresTh: string | null;
  featuresEn: string | null;
  videoUrl: string | null;
  tdsFile: string | null;
  sdsFile: string | null;
  specColor: string | null;
  specDensity: string | null;
  specFlashPoint: string | null;
  specPotLife: string | null;
  relatedProductIds: string | null;
  safetyNotesTh: string | null;
  safetyNotesEn: string | null;
  category: Category;
}

interface RelatedProduct {
  id: number;
  nameTh: string;
  nameEn: string;
  image: string | null;
}

type Step = { title: string; bullets: string[] };

/**
 * Parse application method text into ordered steps.
 * Expected shape (flexible): lines starting with "Step N:" become new steps;
 * lines starting with "- " or "• " become bullets of the current step.
 * Falls back to a single step if no markers are present.
 */
function parseSteps(text: string | null): Step[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const steps: Step[] = [];
  let current: Step | null = null;

  for (const line of lines) {
    const stepMatch = line.match(/^(?:Step\s*\d+\s*[:.\-]|ขั้นที่\s*\d+\s*[:.\-]|\d+\s*[.)])\s*(.+)$/i);
    if (stepMatch) {
      if (current) steps.push(current);
      current = { title: stepMatch[1], bullets: [] };
      continue;
    }
    const bulletMatch = line.match(/^[-•*]\s*(.+)$/);
    if (current) {
      current.bullets.push(bulletMatch ? bulletMatch[1] : line);
    } else {
      current = { title: '', bullets: [bulletMatch ? bulletMatch[1] : line] };
    }
  }
  if (current) steps.push(current);
  return steps;
}

export default function ProductDetailPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const params = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<RelatedProduct[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get<{ success: boolean; data: ProductDetail }>(`/menu/${params.id}`);
        setProduct(res.data);

        const ids = (res.data.relatedProductIds || '')
          .split(/[,\s]+/)
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => Number.isFinite(n) && n > 0);

        if (ids.length > 0) {
          const all = await api.get<{ success: boolean; data: RelatedProduct[] }>(`/menu`);
          setRelated(all.data.filter((p) => ids.includes(p.id)));
        } else {
          setRelated([]);
        }
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
        {th ? 'กำลังโหลด...' : 'Loading...'}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{th ? 'ไม่พบสินค้า' : 'Product not found'}</p>
        <Link href="/menu" className="text-[#F5841F] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {th ? 'กลับหน้าสินค้า' : 'Back to Products'}
        </Link>
      </div>
    );
  }

  const name = th ? product.nameTh : product.nameEn;
  const description = th ? product.descriptionTh : product.descriptionEn;
  const applicationMethod = th ? product.applicationMethodTh : product.applicationMethodEn;
  const features = th ? product.featuresTh : product.featuresEn;
  const categoryName = th ? product.category?.nameTh : product.category?.nameEn;
  const steps = parseSteps(applicationMethod);
  const featureList = (features || '').split(/\r?\n/).map((f) => f.trim()).filter(Boolean);

  const stepIcons = [ClipboardCheck, Layers, SprayCan];

  // Technical Specifications — prefer dedicated spec fields; fall back to derived ones
  const specs: { label: string; value: string }[] = [];
  const colorVal = product.specColor || product.colorName || product.colorCode;
  if (colorVal) specs.push({ label: th ? 'สี' : 'Color', value: colorVal });
  if (product.specDensity) specs.push({ label: th ? 'ความหนาแน่น' : 'Density', value: product.specDensity });
  if (product.specFlashPoint) specs.push({ label: th ? 'จุดวาบไฟ' : 'Flash Point', value: product.specFlashPoint });
  if (product.specPotLife) specs.push({ label: th ? 'อายุใช้งาน' : 'Pot Life', value: product.specPotLife });
  if (product.brand && specs.length < 4) specs.push({ label: th ? 'แบรนด์' : 'Brand', value: product.brand });
  if (product.finishType && specs.length < 4) specs.push({ label: th ? 'ประเภทผิว' : 'Finish', value: product.finishType });
  if (product.size && specs.length < 5) specs.push({ label: th ? 'ขนาด' : 'Size', value: `${product.size}${product.unit ? ' ' + product.unit : ''}` });
  if (product.mixingRatio && specs.length < 5) specs.push({ label: th ? 'สัดส่วนผสม' : 'Mixing Ratio', value: product.mixingRatio });

  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  const handleAddToCart = () => {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* LEFT — image + downloads (2/5) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Image card */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#2D2D2D] dark:to-[#1C1C1E] shadow-sm">
              {product.image ? (
                <Image src={product.image} alt={name} fill className="object-contain p-6" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Layers className="w-24 h-24" />
                </div>
              )}

              {/* PP PLUS brand badge */}
              {product.brand && (
                <div className="absolute top-4 left-4 bg-[#F5841F] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                  {product.brand}
                </div>
              )}

              {/* QC badge */}
              <div className="absolute top-4 right-4 flex items-start gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 mt-0.5" />
                <div className="text-[10px] leading-tight font-semibold text-gray-700 dark:text-gray-200">
                  <div>{th ? 'ตรวจสอบ' : 'Batch Quality'}</div>
                  <div>{th ? 'คุณภาพทุกล็อต' : 'Control'}</div>
                </div>
              </div>

              {/* Color swatch pill (light grey like reference) */}
              {(product.colorCode || product.colorName) && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-gray-200/90 dark:bg-white/10 backdrop-blur-sm rounded-full pl-1.5 pr-3 py-1">
                  <div
                    className="w-4 h-4 rounded-full border border-white/60 shrink-0 shadow-sm"
                    style={{ backgroundColor: product.colorCode || '#D4D4D8' }}
                  />
                  <span className="text-gray-700 dark:text-gray-200 text-xs font-medium">{product.colorName || product.colorCode}</span>
                </div>
              )}
            </div>

            {/* Watch Application Video */}
            {product.videoUrl && (
              <a
                href={product.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block rounded-xl overflow-hidden bg-[#1C1C1E] text-white h-16 group"
              >
                <div className="absolute inset-0 flex items-center gap-3 px-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#F5841F] transition">
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                  </div>
                  <span className="font-semibold text-sm">
                    {th ? 'ดูวิดีโอการใช้งาน' : 'Watch Application Video'}
                  </span>
                </div>
              </a>
            )}

            {/* Downloads */}
            {(product.tdsFile || product.sdsFile) && (
              <div>
                <h3 className="text-lg font-bold text-[#2D2D2D] dark:text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {th ? 'ดาวน์โหลด' : 'Downloads'}
                </h3>
                <div className="space-y-2">
                  {product.sdsFile && (
                    <a
                      href={product.sdsFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-[#1e3a5f] hover:bg-[#254a7a] text-white rounded-xl px-4 py-3 font-semibold text-sm transition shadow-sm"
                    >
                      <FileText className="w-5 h-5 text-red-400 shrink-0" />
                      <span>SDS (Safety Data Sheet)</span>
                    </a>
                  )}
                  {product.tdsFile && (
                    <a
                      href={product.tdsFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-[#1e3a5f] hover:bg-[#254a7a] text-white rounded-xl px-4 py-3 font-semibold text-sm transition shadow-sm"
                    >
                      <FileText className="w-5 h-5 text-red-400 shrink-0" />
                      <span>TDS (Technical Data Sheet)</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Used With */}
            {related.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  {th ? 'ใช้คู่กับ' : 'Used With'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/menu/${r.id}` as '/menu'}
                      className="group block"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#2D2D2D] dark:to-[#1C1C1E] mb-2 group-hover:shadow-md transition">
                        {r.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.image} alt={th ? r.nameTh : r.nameEn} className="w-full h-full object-contain p-3" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Layers className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-center text-[#2D2D2D] dark:text-gray-200 line-clamp-2 group-hover:text-[#F5841F] transition">
                        {th ? r.nameTh : r.nameEn}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* RIGHT — info (3/5) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-5"
          >
            {/* Title block */}
            <div>
              {categoryName && (
                <span className="text-xs text-[#F5841F] font-bold uppercase tracking-wider">{categoryName}</span>
              )}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2D2D2D] dark:text-white mt-1 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                {name}
              </h1>
            </div>

            {/* Price + CTA card */}
            <div className="bg-white dark:bg-[#2D2D2D] rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#2D2D2D] dark:text-white">
                      ฿{Number(product.price).toLocaleString()}
                    </span>
                    {product.finishType && (
                      <span className="text-[#64748B] dark:text-gray-400 text-2xl font-medium">({product.finishType})</span>
                    )}
                  </div>
                  {product.finishType && (
                    <p className="flex items-center gap-1.5 text-sm text-[#64748B] dark:text-gray-400 mt-2">
                      <Layers className="w-4 h-4" />
                      {th ? 'เนื้อสี: ' : 'Finish: '}{product.finishType}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl bg-[#F5841F] text-white hover:bg-[#e0741a] transition shadow-md whitespace-nowrap text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {th ? 'เพิ่มลงตะกร้า' : 'Add to Cart'}
                </button>
              </div>
            </div>

            {/* Description (if present) */}
            {description && (
              <p className="text-[#64748B] dark:text-gray-300 leading-relaxed text-sm">{description}</p>
            )}

            {/* Key Features — own section; shown only when admin provided content */}
            {featureList.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  {th ? 'คุณสมบัติเด่น' : 'Key Features'}
                </h3>
                <ul className="space-y-1.5">
                  {featureList.map((f, i) => (
                    <li key={i} className="text-sm text-[#64748B] dark:text-gray-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5841F] mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guide + Specs grid (flat sections, no card wrap) */}
            <div className="grid md:grid-cols-2 gap-8 pt-2">
              {/* Application Guide — only steps */}
              {steps.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                    {th ? 'วิธีใช้งาน' : 'Application Guide'}
                  </h3>
                  <div className="space-y-5">
                    {steps
                      .filter((s) => s.title.trim() !== '' || s.bullets.length > 0)
                      .map((step, idx) => {
                        const Icon = stepIcons[idx] || ClipboardCheck;
                        return (
                          <div key={idx}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-bold text-[#2D2D2D] dark:text-white text-[15px] leading-snug">
                                {th ? `ขั้นที่ ${idx + 1}` : `Step ${idx + 1}`}
                                {step.title.trim() ? `: ${step.title}` : ''}
                              </h4>
                              <Icon className="w-6 h-6 text-[#F5841F] shrink-0 mt-0.5" />
                            </div>
                            {step.bullets.length > 0 && (
                              <ul className="space-y-1.5 pl-1">
                                {step.bullets.map((b, i) => (
                                  <li key={i} className="text-sm text-[#64748B] dark:text-gray-400 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#64748B] mt-2 shrink-0" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Technical Specifications + Safety */}
              <div className="space-y-6">
                {specs.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                      {th ? 'ข้อมูลทางเทคนิค' : 'Technical Specifications'}
                    </h3>
                    <dl className="space-y-3">
                      {specs.map((s) => (
                        <div key={s.label} className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                          <dt className="text-[#64748B] dark:text-gray-400 text-sm font-medium">{s.label}</dt>
                          <dd className="text-[#2D2D2D] dark:text-white font-semibold text-right">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {/* Safety & Storage – show only when admin has provided notes for this product */}
                {(() => {
                  const rawNotes = th ? product.safetyNotesTh : product.safetyNotesEn;
                  const bullets = (rawNotes || '')
                    .split(/\r?\n/)
                    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
                    .filter(Boolean);
                  if (bullets.length === 0) return null;
                  return (
                    <div>
                      <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        {th ? 'การจัดเก็บและความปลอดภัย' : 'Safety & Storage'}
                      </h3>
                      <ul className="space-y-2">
                        {bullets.map((b, i) => (
                          <li key={i} className="text-sm text-[#64748B] dark:text-gray-400 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B] mt-2 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Video embed (below the fold) */}
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
