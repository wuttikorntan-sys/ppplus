'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';

interface GalleryItem {
  src: string;
  category: string;
  label: string;
}

interface GalleryImageData {
  id: number;
  image: string;
  category: string;
  labelTh: string | null;
  labelEn: string | null;
  sortOrder: number;
  isActive: boolean;
}

const fallbackItems: GalleryItem[] = [
  { src: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop', category: 'projects', label: 'Spray Booth' },
  { src: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=800&h=600&fit=crop', category: 'projects', label: 'Car Painting' },
  { src: 'https://images.unsplash.com/photo-1611288875785-d673e3e6547c?w=800&h=600&fit=crop', category: 'before_after', label: 'Paint Supplies' },
  { src: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop', category: 'projects', label: 'Color Mixing' },
  { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop', category: 'before_after', label: 'Finished Result' },
  { src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop', category: 'before_after', label: 'Polishing Work' },
  { src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop', category: 'shop', label: 'Our Team' },
  { src: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=800&h=600&fit=crop', category: 'shop', label: 'Equipment Display' },
  { src: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop', category: 'projects', label: 'Workshop Interior' },
  { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop', category: 'before_after', label: 'Premium Finish' },
];

type CategoryKey = 'all' | 'projects' | 'before_after' | 'shop';

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(fallbackItems);

  useEffect(() => {
    api.get<{ success: boolean; data: GalleryImageData[] }>('/gallery')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((img) => ({
            src: img.image,
            category: img.category,
            label: (locale === 'th' ? img.labelTh : img.labelEn) || img.labelEn || '',
          }));
          setGalleryItems(mapped);
        }
      })
      .catch(() => {});
  }, [locale]);

  const categories: CategoryKey[] = ['all', 'projects', 'before_after', 'shop'];

  const filtered = activeCategory === 'all' ? galleryItems : galleryItems.filter((g) => g.category === activeCategory);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => { if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length); };
  const nextImage = () => { if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % filtered.length); };

  return (
    <div className="min-h-screen">
      <section className="relative py-20 text-white overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&h=600&fit=crop" alt="Gallery" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1E]/85 to-[#F5841F]/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t('title')}</h1>
            <p className="text-gray-300 text-lg">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-[#1C1C1E] text-white shadow-md' : 'bg-white text-[#2D2D2D] hover:bg-[#1C1C1E]/5 border border-gray-200'}`}>
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>

          <motion.div layout className="columns-2 lg:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, idx) => (
                <motion.div key={item.src} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="break-inside-avoid cursor-pointer group" onClick={() => openLightbox(idx)}>
                  <div className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    <Image src={item.src} alt={item.label} width={800} height={600} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white font-medium text-sm">{item.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={closeLightbox}>
            <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/80 hover:text-white z-10"><X className="w-8 h-8" /></button>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 rounded-full p-2 backdrop-blur-sm z-10"><ChevronLeft className="w-8 h-8" /></button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 rounded-full p-2 backdrop-blur-sm z-10"><ChevronRight className="w-8 h-8" /></button>
            <motion.div key={lightboxIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative max-w-5xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
              <Image src={filtered[lightboxIndex].src} alt={filtered[lightboxIndex].label} width={1200} height={900} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" sizes="100vw" />
              <p className="text-center text-white/80 mt-3 text-sm">{filtered[lightboxIndex].label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
