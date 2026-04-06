'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Paintbrush, Droplets, SprayCan, Car, Layers, Wrench, Factory, Beaker, Shield, Disc, HardHat, FileText, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

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
  mixingRatio: string | null;
  videoUrl: string | null;
  tdsFile: string | null;
  category: Category;
}

const defaultCategories: Category[] = [
  { id: 1, nameTh: '2K Topcoat', nameEn: '2K Topcoat', sortOrder: 1 },
  { id: 2, nameTh: 'Basecoat', nameEn: 'Basecoat', sortOrder: 2 },
  { id: 3, nameTh: 'Clear Coat', nameEn: 'Clear Coat', sortOrder: 3 },
  { id: 4, nameTh: 'Primer / Surfacer', nameEn: 'Primer / Surfacer', sortOrder: 4 },
  { id: 5, nameTh: 'Epoxy Primer', nameEn: 'Epoxy Primer', sortOrder: 5 },
  { id: 6, nameTh: 'ทินเนอร์', nameEn: 'Thinner', sortOrder: 6 },
  { id: 7, nameTh: 'ฮาร์ดเดนเนอร์', nameEn: 'Hardener', sortOrder: 7 },
  { id: 8, nameTh: 'สารเติมแต่ง', nameEn: 'Additives', sortOrder: 8 },
  { id: 9, nameTh: 'ปืนพ่นสี', nameEn: 'Spray Gun', sortOrder: 9 },
  { id: 10, nameTh: 'กระดาษทราย', nameEn: 'Sandpaper', sortOrder: 10 },
  { id: 11, nameTh: 'เครื่องขัด', nameEn: 'Polisher', sortOrder: 11 },
  { id: 12, nameTh: 'อุปกรณ์ป้องกัน (PPE)', nameEn: 'PPE', sortOrder: 12 },
];

const sampleProducts: MenuItem[] = [
  {
    id: 101, categoryId: 1, nameTh: 'PP Plus 2K Topcoat สีพ่นรถยนต์', nameEn: 'PP Plus 2K Topcoat Automotive Paint',
    descriptionTh: 'สีพ่นรถยนต์ 2K คุณภาพสูง ทนทาน เงางาม', descriptionEn: 'High quality 2K automotive paint, durable and glossy finish',
    price: 1250, image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: '#C41E3A', colorName: 'Racing Red', finishType: 'Metallic', size: '1 Liter', mixingRatio: '2:1:10%', videoUrl: null, tdsFile: null,
    category: { id: 1, nameTh: '2K Topcoat', nameEn: '2K Topcoat', sortOrder: 1 },
  },
  {
    id: 102, categoryId: 1, nameTh: 'PP Plus 2K Topcoat สีขาวมุก', nameEn: 'PP Plus 2K Topcoat Pearl White',
    descriptionTh: 'สีขาวมุกสำหรับเคลือบรถยนต์ เนื้อสี Pearl แวววาว', descriptionEn: 'Pearl white topcoat for automotive, pearl finish with brilliant shine',
    price: 1450, image: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: '#F5F5F0', colorName: 'Pearl White', finishType: 'Pearl', size: '1 Liter', mixingRatio: '2:1:10%', videoUrl: null, tdsFile: null,
    category: { id: 1, nameTh: '2K Topcoat', nameEn: '2K Topcoat', sortOrder: 1 },
  },
  {
    id: 103, categoryId: 1, nameTh: '2K Topcoat สีน้ำเงินเข้ม', nameEn: '2K Topcoat Deep Blue',
    descriptionTh: 'สี 2K น้ำเงินเข้ม เมทัลลิก เงาลึก สวยหรู', descriptionEn: '2K topcoat deep blue metallic, deep gloss premium look',
    price: 1350, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: '#1C1C1E', colorName: 'Deep Blue', finishType: 'Metallic', size: '1 Liter', mixingRatio: '2:1:10%', videoUrl: null, tdsFile: null,
    category: { id: 1, nameTh: '2K Topcoat', nameEn: '2K Topcoat', sortOrder: 1 },
  },
  {
    id: 104, categoryId: 2, nameTh: 'Basecoat สีเมทัลลิก ซิลเวอร์', nameEn: 'Basecoat Metallic Silver',
    descriptionTh: 'สีเบสโค้ทเมทัลลิกซิลเวอร์ เนื้อละเอียด กลบมิด', descriptionEn: 'Metallic silver basecoat, fine particles, excellent coverage',
    price: 980, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: '#C0C0C0', colorName: 'Silver', finishType: 'Metallic', size: '1 Liter', mixingRatio: '1:1', videoUrl: null, tdsFile: null,
    category: { id: 2, nameTh: 'Basecoat', nameEn: 'Basecoat', sortOrder: 2 },
  },
  {
    id: 105, categoryId: 2, nameTh: 'Basecoat สีเมทัลลิก ดำ', nameEn: 'Basecoat Metallic Black',
    descriptionTh: 'สีเบสโค้ทดำเมทัลลิก เงาลึก คุณภาพสูง', descriptionEn: 'Metallic black basecoat, deep gloss, premium quality',
    price: 980, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: '#1A1A2E', colorName: 'Midnight Black', finishType: 'Metallic', size: '1 Liter', mixingRatio: '1:1', videoUrl: null, tdsFile: null,
    category: { id: 2, nameTh: 'Basecoat', nameEn: 'Basecoat', sortOrder: 2 },
  },
  {
    id: 106, categoryId: 3, nameTh: 'PP Plus Clear Coat 2K เคลียร์โค้ท', nameEn: 'PP Plus 2K Clear Coat',
    descriptionTh: 'เคลียร์โค้ท 2K เงาสูง ทนรอยขีดข่วน UV Protection', descriptionEn: '2K clear coat with high gloss, scratch resistant and UV protection',
    price: 1350, image: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: null, colorName: null, finishType: 'High Gloss', size: '1 Liter', mixingRatio: '2:1', videoUrl: null, tdsFile: null,
    category: { id: 3, nameTh: 'Clear Coat', nameEn: 'Clear Coat', sortOrder: 3 },
  },
  {
    id: 107, categoryId: 3, nameTh: 'Clear Coat Matte เคลียร์โค้ทด้าน', nameEn: 'Matte Clear Coat',
    descriptionTh: 'เคลียร์โค้ทด้าน สไตล์โมเดิร์น ไม่สะท้อนแสง', descriptionEn: 'Matte finish clear coat, modern style, non-reflective',
    price: 1500, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: null, colorName: null, finishType: 'Matte', size: '1 Liter', mixingRatio: '2:1', videoUrl: null, tdsFile: null,
    category: { id: 3, nameTh: 'Clear Coat', nameEn: 'Clear Coat', sortOrder: 3 },
  },
  {
    id: 108, categoryId: 4, nameTh: 'Primer Surfacer 2K สีรองพื้น', nameEn: '2K Primer Surfacer',
    descriptionTh: 'สีรองพื้น 2K แห้งเร็ว เติมรอยบุ๋มได้ดี ขัดง่าย', descriptionEn: '2K primer surfacer, fast dry, excellent filling and easy sanding',
    price: 850, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: '#808080', colorName: 'Gray', finishType: 'Matte', size: '1 Liter', mixingRatio: '4:1', videoUrl: null, tdsFile: null,
    category: { id: 4, nameTh: 'Primer / Surfacer', nameEn: 'Primer / Surfacer', sortOrder: 4 },
  },
  {
    id: 109, categoryId: 5, nameTh: 'Epoxy Primer 2K อีพ๊อกซี่ไพรเมอร์', nameEn: '2K Epoxy Primer',
    descriptionTh: 'อีพ๊อกซี่ไพรเมอร์ 2K ยึดเกาะดีเยี่ยม กันสนิม', descriptionEn: '2K Epoxy primer, excellent adhesion and corrosion protection',
    price: 950, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: '#4A5859', colorName: 'Epoxy Gray', finishType: 'Matte', size: '1 Liter', mixingRatio: '1:1', videoUrl: null, tdsFile: null,
    category: { id: 5, nameTh: 'Epoxy Primer', nameEn: 'Epoxy Primer', sortOrder: 5 },
  },
  {
    id: 110, categoryId: 6, nameTh: 'ทินเนอร์ PP Plus สำหรับสี 2K', nameEn: 'PP Plus 2K Thinner',
    descriptionTh: 'ทินเนอร์คุณภาพสูง สำหรับผสมสี 2K ระเหยสม่ำเสมอ', descriptionEn: 'Premium thinner for 2K paint mixing, even evaporation rate',
    price: 350, image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: null, colorName: null, finishType: null, size: '1 Liter', mixingRatio: null, videoUrl: null, tdsFile: null,
    category: { id: 6, nameTh: 'ทินเนอร์', nameEn: 'Thinner', sortOrder: 6 },
  },
  {
    id: 111, categoryId: 7, nameTh: 'ฮาร์ดเดนเนอร์ สำหรับ 2K', nameEn: '2K Hardener',
    descriptionTh: 'ฮาร์ดเดนเนอร์สำหรับสี 2K แห้งเร็ว ผิวเรียบ', descriptionEn: 'Hardener for 2K paint system, fast cure, smooth finish',
    price: 650, image: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'PP Plus', colorCode: null, colorName: null, finishType: null, size: '500 ml', mixingRatio: null, videoUrl: null, tdsFile: null,
    category: { id: 7, nameTh: 'ฮาร์ดเดนเนอร์', nameEn: 'Hardener', sortOrder: 7 },
  },
  {
    id: 112, categoryId: 9, nameTh: 'ปืนพ่นสี HVLP 1.3mm', nameEn: 'HVLP Spray Gun 1.3mm',
    descriptionTh: 'ปืนพ่นสี HVLP หัวฉีด 1.3mm พ่นละเอียด ประหยัดสี', descriptionEn: 'HVLP spray gun 1.3mm nozzle, fine atomization, paint saving',
    price: 3500, image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=450&fit=crop', isAvailable: true,
    brand: 'IWATA', colorCode: null, colorName: null, finishType: null, size: '1.3mm Nozzle', mixingRatio: null, videoUrl: null, tdsFile: null,
    category: { id: 9, nameTh: 'ปืนพ่นสี', nameEn: 'Spray Gun', sortOrder: 9 },
  },
];

export default function MenuPage() {
  const t = useTranslations('menu');
  const locale = useLocale();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const th = locale === 'th';

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      nameTh: item.nameTh,
      nameEn: item.nameEn,
      price: item.price,
      image: item.image,
      size: item.size,
      brand: item.brand,
    });
    toast.success(th ? 'เพิ่มลงตะกร้าแล้ว' : 'Added to cart');
  };

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [menuRes, catRes] = await Promise.all([
          api.get<{ success: boolean; data: MenuItem[] }>('/menu'),
          api.get<{ success: boolean; data: Category[] }>('/menu/categories'),
        ]);
        setCategories(catRes.data?.length ? catRes.data : defaultCategories);
        setItems(menuRes.data?.length ? menuRes.data : sampleProducts);
      } catch {
        setCategories(defaultCategories);
        setItems(sampleProducts);
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
    1: <Car className="w-4 h-4" />,
    2: <Paintbrush className="w-4 h-4" />,
    3: <SprayCan className="w-4 h-4" />,
    4: <Layers className="w-4 h-4" />,
    5: <Shield className="w-4 h-4" />,
    6: <Droplets className="w-4 h-4" />,
    7: <Beaker className="w-4 h-4" />,
    8: <Factory className="w-4 h-4" />,
    9: <Wrench className="w-4 h-4" />,
    10: <Disc className="w-4 h-4" />,
    11: <Wrench className="w-4 h-4" />,
    12: <HardHat className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Header */}
      <div className="relative bg-[#1C1C1E] py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="https://images.unsplash.com/photo-1611288875785-d673e3e6547c?w=1600&h=400&fit=crop" alt="" fill className="object-cover" priority />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t('title')}</h1>
          <p className="text-white/70 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10 md:mb-14">
          <h2 className="text-xl font-bold text-[#2D2D2D] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'ค้นหาสินค้า' : 'Search Products'}
          </h2>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative">
              <select
                value={selectedCategory === null ? '' : String(selectedCategory)}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="appearance-none w-24 sm:w-56 pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#F5841F]/20 focus:border-[#F5841F] outline-none transition text-xs sm:text-sm"
              >
                <option value="">{t('all')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{locale === 'th' ? cat.nameTh : cat.nameEn}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#F5841F]/20 focus:border-[#F5841F] outline-none transition text-xs sm:text-sm"
              />
            </div>
            <button
              onClick={() => setSearch(search)}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#1C1C1E] text-white rounded-xl font-medium hover:bg-[#1C1C1E]/90 transition text-xs sm:text-sm whitespace-nowrap"
            >
              {th ? 'ค้นหา' : 'Search'}
            </button>
          </div>
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
                <Link href={`/menu/${item.id}` as '/menu/[id]'} className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden block cursor-pointer">
                  <Image
                    src={item.image || 'https://images.unsplash.com/photo-1611288875785-d673e3e6547c?w=600&h=450&fit=crop'}
                    alt={locale === 'th' ? item.nameTh : item.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 md:px-3.5 md:py-1.5 shadow-lg">
                    <span className="text-[#1C1C1E] font-bold text-sm md:text-base">฿{Number(item.price).toLocaleString()}</span>
                  </div>
                  {item.brand && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#F5841F] text-white text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full">
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
                </Link>
                <div className="p-3 md:p-5">
                  <span className="hidden md:inline-block text-xs text-[#F5841F] font-semibold tracking-wide uppercase mb-1">
                    {locale === 'th' ? item.category?.nameTh : item.category?.nameEn}
                  </span>
                  <Link href={`/menu/${item.id}` as '/menu/[id]'} className="block">
                    <h3 className="font-semibold text-[#2D2D2D] text-sm md:text-lg leading-snug mb-0.5 md:mb-1.5 line-clamp-2 hover:text-[#F5841F] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                      {locale === 'th' ? item.nameTh : item.nameEn}
                    </h3>
                  </Link>
                  {item.size && (
                    <p className="text-[#64748B] text-xs md:text-sm">{item.size}</p>
                  )}
                  {item.mixingRatio && (
                    <p className="text-[#64748B] text-xs hidden md:block">{locale === 'th' ? 'สัดส่วนผสม: ' : 'Mix Ratio: '}{item.mixingRatio}</p>
                  )}
                  {item.finishType && (
                    <p className="text-[#64748B] text-xs hidden md:block">{locale === 'th' ? 'เนื้อสี: ' : 'Finish: '}{item.finishType}</p>
                  )}
                  <div className="mt-2 md:mt-3 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium py-1.5 md:py-2 rounded-lg bg-[#F5841F] text-white hover:bg-[#F5841F]/90 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {th ? 'เพิ่มลงตะกร้า' : 'Add to Cart'}
                    </button>
                    {item.tdsFile && (
                      <a href={item.tdsFile} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-[#1C1C1E] hover:border-[#1C1C1E] transition">
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                  </div>
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
