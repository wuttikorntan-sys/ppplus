'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Paintbrush, Droplets, SprayCan, Car, Layers, Wrench, Factory } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Category {
  id: number;
  nameTh: string;
  nameEn: string;
  sortOrder: number;
}

interface MenuItem {
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
  category: Category;
}

export default function MenuPage() {
  const t = useTranslations('menu');
  const locale = useLocale();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [menuRes, catRes] = await Promise.all([
          api.get<{ success: boolean; data: MenuItem[] }>('/menu'),
          api.get<{ success: boolean; data: Category[] }>('/menu/categories'),
        ]);
        setItems(menuRes.data);
        setCategories(catRes.data);
      } catch {
        setCategories([
          { id: 1, nameTh: 'สีภายใน', nameEn: 'Interior Paint', sortOrder: 1 },
          { id: 2, nameTh: 'สีภายนอก', nameEn: 'Exterior Paint', sortOrder: 2 },
          { id: 3, nameTh: 'สเปรย์', nameEn: 'Spray Paint', sortOrder: 3 },
          { id: 4, nameTh: 'สีรถยนต์', nameEn: 'Automotive Paint', sortOrder: 4 },
          { id: 5, nameTh: 'รองพื้น/ไพรเมอร์', nameEn: 'Primers & Undercoats', sortOrder: 5 },
          { id: 6, nameTh: 'อุปกรณ์ทาสี', nameEn: 'Painting Tools', sortOrder: 6 },
          { id: 7, nameTh: 'สีอุตสาหกรรม', nameEn: 'Industrial Paint', sortOrder: 7 },
        ]);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchCategory = selectedCategory === null || item.categoryId === selectedCategory;
    const name = locale === 'th' ? item.nameTh : item.nameEn;
    const desc = locale === 'th' ? item.descriptionTh : item.descriptionEn;
    const brand = item.brand || '';
    const matchSearch = search === '' || name.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase()) || brand.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categoryIcons: Record<number, React.ReactNode> = {
    1: <Paintbrush className="w-4 h-4" />,
    2: <Droplets className="w-4 h-4" />,
    3: <SprayCan className="w-4 h-4" />,
    4: <Car className="w-4 h-4" />,
    5: <Layers className="w-4 h-4" />,
    6: <Wrench className="w-4 h-4" />,
    7: <Factory className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Header */}
      <div className="relative bg-[#1E3A5F] py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1600&h=400&fit=crop" alt="" fill className="object-cover" priority />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t('title')}</h1>
          <p className="text-white/70 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2EC4B6]/20 focus:border-[#2EC4B6] outline-none transition text-base"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 md:mb-12 px-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all ${
              selectedCategory === null ? 'bg-[#1E3A5F] text-white shadow-md' : 'bg-white text-[#1E293B] hover:bg-[#1E3A5F]/5 border border-gray-200'
            }`}
          >
            {t('all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                selectedCategory === cat.id ? 'bg-[#1E3A5F] text-white shadow-md' : 'bg-white text-[#1E293B] hover:bg-[#1E3A5F]/5 border border-gray-200'
              }`}
            >
              {categoryIcons[cat.id]} {locale === 'th' ? cat.nameTh : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">{locale === 'th' ? 'กำลังโหลด...' : 'Loading...'}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.4 }}
                className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={item.image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=450&fit=crop'}
                    alt={locale === 'th' ? item.nameTh : item.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 md:px-3.5 md:py-1.5 shadow-lg">
                    <span className="text-[#1E3A5F] font-bold text-sm md:text-base">฿{Number(item.price).toLocaleString()}</span>
                  </div>
                  {item.brand && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#2EC4B6] text-white text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.brand}
                    </div>
                  )}
                  {item.colorCode && (
                    <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                      <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: item.colorCode }} />
                      <span className="text-white text-[10px] font-medium">{item.colorName || item.colorCode}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-3 md:p-5">
                  <span className="hidden md:inline-block text-xs text-[#2EC4B6] font-semibold tracking-wide uppercase mb-1">
                    {locale === 'th' ? item.category?.nameTh : item.category?.nameEn}
                  </span>
                  <h3 className="font-semibold text-[#1E293B] text-sm md:text-lg leading-snug mb-0.5 md:mb-1.5 line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {locale === 'th' ? item.nameTh : item.nameEn}
                  </h3>
                  {item.size && (
                    <p className="text-[#64748B] text-xs md:text-sm">{item.size}</p>
                  )}
                  {item.finishType && (
                    <p className="text-[#64748B] text-xs hidden md:block">{locale === 'th' ? 'เนื้อสี: ' : 'Finish: '}{item.finishType}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            {locale === 'th' ? 'ไม่พบสินค้าที่ค้นหา' : 'No products found'}
          </div>
        )}
      </div>
    </div>
  );
}
