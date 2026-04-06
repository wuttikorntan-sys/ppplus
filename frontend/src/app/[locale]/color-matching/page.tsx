'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Target, Zap, Award, Truck, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface ColorFormula {
  id: number;
  carBrand: string;
  colorCode: string;
  colorNameTh: string | null;
  colorNameEn: string | null;
  yearRange: string | null;
  formulaType: 'solid' | 'metallic' | 'pearl';
  deltaE: number | null;
  image: string | null;
}

export default function ColorMatchingPage() {
  const t = useTranslations('colorMatching');
  const locale = useLocale();
  const th = locale === 'th';

  const [formulas, setFormulas] = useState<ColorFormula[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedBrand]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrand) params.set('brand', selectedBrand);
      if (search) params.set('search', search);
      const res = await api.get<{ success: boolean; data: ColorFormula[]; brands: string[] }>(`/color-matching?${params}`);
      setFormulas(res.data);
      if (res.brands) setBrands(res.brands);
    } catch {
      setFormulas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const typeLabel = (type: string) => {
    const map: Record<string, { th: string; en: string }> = {
      solid: { th: 'สีพื้น', en: 'Solid' },
      metallic: { th: 'เมทัลลิก', en: 'Metallic' },
      pearl: { th: 'เพิร์ล', en: 'Pearl' },
    };
    return th ? map[type]?.th || type : map[type]?.en || type;
  };

  const typeColor = (type: string) => {
    const map: Record<string, string> = {
      solid: 'bg-blue-100 text-blue-700',
      metallic: 'bg-amber-100 text-amber-700',
      pearl: 'bg-purple-100 text-purple-700',
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <div className="relative bg-[#1C1C1E] pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <Image src="https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=1600&h=400&fit=crop" alt="" fill className="object-cover" priority />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-[#F5841F]/20 text-[#F5841F] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Target className="w-4 h-4" /> {th ? 'Color Matching System' : 'Color Matching System'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('title')}
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-2">{t('subtitle')}</p>
            <p className="text-white/50 text-sm max-w-xl mx-auto">{th ? 'เทคโนโลยี Spectrophotometer + CIEDE2000 สำหรับสูตรสีแม่นยำสูงสุด' : 'Spectrophotometer + CIEDE2000 technology for maximum color accuracy'}</p>
          </motion.div>
        </div>
      </div>

      {/* USP Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Target, title: th ? 'Spectrophotometer' : 'Spectrophotometer', desc: th ? 'ใช้เครื่อง X-Rite วัดค่าสีแม่นยำระดับ ΔE < 0.5' : 'X-Rite precision measurement with ΔE < 0.5' },
            { icon: Zap, title: th ? 'CIEDE2000' : 'CIEDE2000', desc: th ? 'มาตรฐานการคำนวณสีระดับสากลที่แม่นยำที่สุด' : 'International color calculation standard for highest accuracy' },
            { icon: Award, title: th ? 'สูตรสีครบทุกยี่ห้อ' : 'All Car Brands', desc: th ? 'รองรับ Toyota, Honda, Nissan, Mazda, Isuzu และอื่นๆ' : 'Toyota, Honda, Nissan, Mazda, Isuzu and more' },
            { icon: Truck, title: th ? 'จัดส่งทั่วประเทศ' : 'Nationwide Delivery', desc: th ? 'ผสมสีตามสูตรพร้อมจัดส่งถึงอู่สีทั่วไทย' : 'Custom mixed paint delivered to body shops nationwide' },
          ].map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-[#F5841F]/10 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-[#F5841F]" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D] mb-1">{item.title}</h3>
              <p className="text-sm text-[#64748B]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-[#2D2D2D] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'ค้นหาสูตรสี' : 'Search Color Formulas'}
          </h2>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="appearance-none w-24 sm:w-48 pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#F5841F]/20 focus:border-[#F5841F] outline-none transition text-xs sm:text-sm"
              >
                <option value="">{th ? 'ทุกยี่ห้อรถ' : 'All Car Brands'}</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={th ? 'ค้นหารหัสสี เช่น 040, NH-731P...' : 'Search color code e.g. 040, NH-731P...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#F5841F]/20 focus:border-[#F5841F] outline-none transition text-xs sm:text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#1C1C1E] text-white rounded-xl font-medium hover:bg-[#1C1C1E]/90 transition text-xs sm:text-sm whitespace-nowrap"
            >
              {th ? 'ค้นหา' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">{th ? 'กำลังโหลด...' : 'Loading...'}</div>
        ) : formulas.length === 0 ? (
          <div className="text-center py-20">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">{th ? 'ไม่พบสูตรสี — ลองค้นหาใหม่' : 'No color formulas found — try a different search'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {formulas.map((f, idx) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              >
                {f.image && (
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image src={f.image} alt={f.colorCode} fill className="object-cover group-hover:scale-105 transition-transform" sizes="400px" />
                  </div>
                )}
                <div className="p-3 lg:p-5">
                  <div className="flex items-start justify-between mb-2 lg:mb-3">
                    <div>
                      <p className="text-[10px] lg:text-xs text-[#F5841F] font-semibold uppercase tracking-wide">{f.carBrand}</p>
                      <h3 className="text-sm lg:text-lg font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>{f.colorCode}</h3>
                      <p className="text-xs lg:text-sm text-[#64748B]">{th ? f.colorNameTh : f.colorNameEn}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColor(f.formulaType)}`}>
                      {typeLabel(f.formulaType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-4 text-[10px] lg:text-xs text-[#64748B]">
                    {f.yearRange && <span>{th ? 'ปี' : 'Year'}: {f.yearRange}</span>}
                    {f.deltaE != null && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        ΔE: {f.deltaE}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Explanation Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'ทำไมสูตรสี PP Plus ถึงแม่นยำ?' : 'Why PP Plus Color Matching is Accurate?'}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">{th ? 'ΔE คืออะไร?' : 'What is ΔE?'}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                {th
                  ? 'ΔE (Delta E) คือค่าที่แสดงความแตกต่างของสี ยิ่งค่าน้อยยิ่งแม่นยำ ΔE < 1.0 คนทั่วไปแยกไม่ออก ΔE < 0.5 แม้ผู้เชี่ยวชาญก็แยกไม่ออก'
                  : 'ΔE (Delta E) represents color difference. Lower values mean more accuracy. ΔE < 1.0 is indistinguishable to most people. ΔE < 0.5 is indistinguishable even to experts.'
                }
              </p>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">{th ? 'CIEDE2000 คืออะไร?' : 'What is CIEDE2000?'}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {th
                  ? 'CIEDE2000 คือมาตรฐานสากลล่าสุดสำหรับวัดความแตกต่างของสี พัฒนาโดย CIE ให้แม่นยำตรงกับการรับรู้สีของมนุษย์มากที่สุด เราใช้มาตรฐานนี้ในทุกสูตรสี'
                  : 'CIEDE2000 is the latest international standard for measuring color difference, developed by CIE to match human color perception. We use this standard for all our formulas.'
                }
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">{th ? 'เครื่องมือที่เราใช้' : 'Our Equipment'}</h3>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F5841F]" /> X-Rite Spectrophotometer</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F5841F]" /> {th ? 'ซอฟต์แวร์ Color Matching ระดับโรงงาน' : 'Factory-grade Color Matching Software'}</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F5841F]" /> {th ? 'ห้องแล็บ QC ควบคุมคุณภาพ' : 'QC Lab for Quality Control'}</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F5841F]" /> {th ? 'ตู้ไฟเทียบสี (Light Booth)' : 'Color Matching Light Booth'}</li>
              </ul>
              <div className="mt-6 p-4 bg-[#1C1C1E]/5 rounded-xl">
                <p className="text-sm font-medium text-[#1C1C1E] mb-1">{th ? 'ต้องการสูตรสีพิเศษ?' : 'Need a custom formula?'}</p>
                <p className="text-xs text-[#64748B]">{th ? 'ส่งชิ้นส่วนมาให้เราวัดสีได้เลย ติดต่อทีม PP Plus' : 'Send us a sample for measurement. Contact PP Plus team.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
