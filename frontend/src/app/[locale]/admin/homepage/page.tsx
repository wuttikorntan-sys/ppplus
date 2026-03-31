'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { Save, RotateCcw, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface ContentMap {
  [key: string]: { th: string; en: string };
}

const sections = [
  {
    id: 'hero',
    titleTh: 'ส่วน Hero (แบนเนอร์หลัก)',
    titleEn: 'Hero Section (Main Banner)',
    fields: [
      { key: 'hero.title', labelTh: 'หัวข้อหลัก', labelEn: 'Main Title' },
      { key: 'hero.subtitle', labelTh: 'หัวข้อรอง', labelEn: 'Subtitle' },
      { key: 'hero.description', labelTh: 'คำอธิบาย', labelEn: 'Description', multiline: true },
      { key: 'hero.cta_menu', labelTh: 'ปุ่มดูสินค้า', labelEn: 'Products Button Text' },
      { key: 'hero.cta_contact', labelTh: 'ปุ่มติดต่อ', labelEn: 'Contact Button Text' },
    ],
  },
  {
    id: 'featured',
    titleTh: 'ส่วนสินค้าแนะนำ',
    titleEn: 'Featured Products Section',
    fields: [
      { key: 'featured.title', labelTh: 'หัวข้อ', labelEn: 'Title' },
      { key: 'featured.subtitle', labelTh: 'คำอธิบาย', labelEn: 'Subtitle' },
    ],
  },
  {
    id: 'welcome',
    titleTh: 'ส่วนแนะนำร้าน',
    titleEn: 'About Store Section',
    fields: [
      { key: 'welcome.tagline', labelTh: 'แท็กไลน์', labelEn: 'Tagline' },
      { key: 'welcome.title', labelTh: 'หัวข้อ', labelEn: 'Title' },
      { key: 'welcome.text', labelTh: 'เนื้อหา', labelEn: 'Text', multiline: true },
      { key: 'welcome.cta', labelTh: 'ปุ่ม CTA', labelEn: 'CTA Button Text' },
      { key: 'welcome.years', labelTh: 'จำนวนปี (ในกรอบ)', labelEn: 'Years (badge)' },
      { key: 'welcome.years_label', labelTh: 'คำใต้กรอบ', labelEn: 'Years Label' },
    ],
  },
  {
    id: 'brands',
    titleTh: 'ส่วนแบรนด์สินค้า',
    titleEn: 'Brands Section',
    fields: [
      { key: 'brands.tagline', labelTh: 'แท็กไลน์', labelEn: 'Tagline' },
      { key: 'brands.title', labelTh: 'หัวข้อ', labelEn: 'Title' },
      { key: 'brands.text1', labelTh: 'เนื้อหาย่อหน้า 1', labelEn: 'Paragraph 1', multiline: true },
      { key: 'brands.text2', labelTh: 'เนื้อหาย่อหน้า 2', labelEn: 'Paragraph 2', multiline: true },
      { key: 'brands.cta', labelTh: 'ปุ่ม CTA', labelEn: 'CTA Button Text' },
      { key: 'brands.badge', labelTh: 'ตัวเลขในกรอบ', labelEn: 'Badge Number' },
      { key: 'brands.badge_label', labelTh: 'คำใต้กรอบ', labelEn: 'Badge Label' },
    ],
  },
  {
    id: 'services',
    titleTh: 'ส่วนบริการ',
    titleEn: 'Services Section',
    fields: [
      { key: 'services.tagline', labelTh: 'แท็กไลน์', labelEn: 'Tagline' },
      { key: 'services.title', labelTh: 'หัวข้อ', labelEn: 'Title' },
      { key: 'services.text1', labelTh: 'เนื้อหาย่อหน้า 1', labelEn: 'Paragraph 1', multiline: true },
      { key: 'services.text2', labelTh: 'เนื้อหาย่อหน้า 2', labelEn: 'Paragraph 2', multiline: true },
      { key: 'services.cta', labelTh: 'ปุ่ม CTA', labelEn: 'CTA Button Text' },
      { key: 'services.badge', labelTh: 'ตัวเลขในกรอบ', labelEn: 'Badge Number' },
      { key: 'services.badge_label', labelTh: 'คำใต้กรอบ', labelEn: 'Badge Label' },
    ],
  },
  {
    id: 'experience',
    titleTh: 'ส่วนทำไมต้อง PP Plus',
    titleEn: 'Why PP Plus Section',
    fields: [
      { key: 'experience.tagline', labelTh: 'แท็กไลน์', labelEn: 'Tagline' },
      { key: 'experience.title', labelTh: 'หัวข้อ', labelEn: 'Title' },
      { key: 'experience.card1_title', labelTh: 'การ์ด 1 - หัวข้อ', labelEn: 'Card 1 - Title' },
      { key: 'experience.card1_desc', labelTh: 'การ์ด 1 - คำอธิบาย', labelEn: 'Card 1 - Description' },
      { key: 'experience.card2_title', labelTh: 'การ์ด 2 - หัวข้อ', labelEn: 'Card 2 - Title' },
      { key: 'experience.card2_desc', labelTh: 'การ์ด 2 - คำอธิบาย', labelEn: 'Card 2 - Description' },
      { key: 'experience.card3_title', labelTh: 'การ์ด 3 - หัวข้อ', labelEn: 'Card 3 - Title' },
      { key: 'experience.card3_desc', labelTh: 'การ์ด 3 - คำอธิบาย', labelEn: 'Card 3 - Description' },
      { key: 'experience.card4_title', labelTh: 'การ์ด 4 - หัวข้อ', labelEn: 'Card 4 - Title' },
      { key: 'experience.card4_desc', labelTh: 'การ์ด 4 - คำอธิบาย', labelEn: 'Card 4 - Description' },
    ],
  },
  {
    id: 'contact',
    titleTh: 'ส่วนติดต่อ (หน้าแรก)',
    titleEn: 'Contact Section (Homepage)',
    fields: [
      { key: 'contact.title', labelTh: 'หัวข้อ', labelEn: 'Title' },
      { key: 'contact.subtitle', labelTh: 'คำอธิบาย', labelEn: 'Subtitle' },
    ],
  },
];

// Default values matching current hardcoded text
const defaults: ContentMap = {
  'hero.title': { th: 'PP Plus', en: 'PP Plus' },
  'hero.subtitle': { th: 'ร้านขายสีครบวงจร', en: 'Complete Paint Solutions' },
  'hero.description': { th: 'จำหน่ายสีทาบ้านทุกประเภท จากแบรนด์ชั้นนำ TOA, Beger, Jotun, Dulux, Nippon พร้อมบริการผสมสี ให้คำปรึกษา และจัดส่งถึงหน้างาน', en: 'Premium house paints from leading brands TOA, Beger, Jotun, Dulux, Nippon with color mixing service, expert advice, and delivery' },
  'hero.cta_menu': { th: 'ดูสินค้า', en: 'View Products' },
  'hero.cta_contact': { th: 'ติดต่อเรา', en: 'Contact Us' },
  'featured.title': { th: 'สินค้าแนะนำ', en: 'Featured Products' },
  'featured.subtitle': { th: 'สินค้าขายดีที่ลูกค้าเลือกใช้มากที่สุด', en: 'Best-selling products chosen by our customers' },
  'welcome.tagline': { th: 'ยินดีต้อนรับสู่ PP Plus', en: 'Welcome to PP Plus' },
  'welcome.title': { th: 'ร้านขายสีครบวงจรในกรุงเทพฯ', en: 'Your Complete Paint Shop in Bangkok' },
  'welcome.text': { th: 'PP Plus เป็นร้านขายสีครบวงจรที่คัดสรรสีคุณภาพจากแบรนด์ชั้นนำ พร้อมทีมงานผู้เชี่ยวชาญที่พร้อมให้คำปรึกษาเรื่องสีและการทาสี ไม่ว่าจะเป็นงานบ้าน คอนโด หรือโปรเจกต์ขนาดใหญ่', en: 'PP Plus is a complete paint shop offering quality paints from leading brands. Our expert team is ready to advise on colors and painting for homes, condos, or large projects.' },
  'welcome.cta': { th: 'เกี่ยวกับเรา', en: 'About Us' },
  'welcome.years': { th: '10+', en: '10+' },
  'welcome.years_label': { th: 'Years', en: 'Years' },
  'brands.tagline': { th: 'แบรนด์ชั้นนำ', en: 'Leading Brands' },
  'brands.title': { th: 'สีคุณภาพจากแบรนด์ระดับโลก', en: 'Quality Paints from World-Class Brands' },
  'brands.text1': { th: 'เราเป็นตัวแทนจำหน่ายสีจากแบรนด์ชั้นนำระดับโลก ไม่ว่าจะเป็น TOA, Beger, Jotun, Dulux, Nippon Paint ครบทุกประเภท ทั้งสีภายใน สีภายนอก สีรองพื้น และสีพิเศษ', en: 'We are an authorized dealer for world-class paint brands including TOA, Beger, Jotun, Dulux, and Nippon Paint — covering interior, exterior, primer, and specialty paints.' },
  'brands.text2': { th: 'ทุกสีผ่านการรับรองมาตรฐานคุณภาพ มั่นใจได้ในเรื่องความทนทาน สีสันสดใส และปลอดภัยต่อสุขภาพ', en: 'All paints are quality certified for durability, vivid colors, and health safety.' },
  'brands.cta': { th: 'ดูสินค้าทั้งหมด', en: 'View All Products' },
  'brands.badge': { th: '5+', en: '5+' },
  'brands.badge_label': { th: 'Brands', en: 'Brands' },
  'services.tagline': { th: 'บริการของเรา', en: 'Our Services' },
  'services.title': { th: 'บริการครบวงจรเรื่องสี', en: 'Complete Paint Services' },
  'services.text1': { th: 'นอกจากจำหน่ายสีแล้ว เรายังมีบริการผสมสีตามสั่ง ให้คำปรึกษาการเลือกสี จัดส่งถึงหน้างาน และบริการหลังการขาย', en: 'Beyond selling paint, we offer custom color mixing, color consultation, job-site delivery, and after-sales service.' },
  'services.text2': { th: 'พร้อมเครื่องคิดคำนวณปริมาณสีที่ต้องใช้ ช่วยให้คุณประหยัดงบประมาณและเวลา', en: 'Plus our paint calculator helps you estimate exactly how much paint you need, saving both budget and time.' },
  'services.cta': { th: 'คำนวณสี', en: 'Paint Calculator' },
  'services.badge': { th: '1000+', en: '1000+' },
  'services.badge_label': { th: 'เฉดสี', en: 'Colors' },
  'experience.tagline': { th: 'ทำไมต้อง PP Plus', en: 'Why PP Plus' },
  'experience.title': { th: 'สิ่งที่ทำให้เราแตกต่าง', en: 'What Makes Us Different' },
  'experience.card1_title': { th: 'แบรนด์ชั้นนำ', en: 'Premium Brands' },
  'experience.card1_desc': { th: 'จำหน่ายสีจากแบรนด์ชั้นนำ TOA, Beger, Jotun, Dulux, Nippon', en: 'Authorized dealer for TOA, Beger, Jotun, Dulux, Nippon' },
  'experience.card2_title': { th: 'ผสมสีตามสั่ง', en: 'Custom Color Mixing' },
  'experience.card2_desc': { th: 'บริการผสมสีกว่า 1,000 เฉดสี ตรงตามความต้องการ', en: 'Over 1,000 color shades mixed to your exact specifications' },
  'experience.card3_title': { th: 'ให้คำปรึกษา', en: 'Expert Advice' },
  'experience.card3_desc': { th: 'ทีมงานผู้เชี่ยวชาญพร้อมให้คำแนะนำเรื่องสีและการทาสี', en: 'Expert team ready to advise on colors and painting techniques' },
  'experience.card4_title': { th: 'จัดส่งถึงที่', en: 'Delivery Service' },
  'experience.card4_desc': { th: 'จัดส่งถึงหน้างานทั่วกรุงเทพฯ และปริมณฑล', en: 'Delivery to job sites throughout Bangkok and suburbs' },
  'contact.title': { th: 'ติดต่อเรา', en: 'Contact Us' },
  'contact.subtitle': { th: 'พร้อมให้บริการและคำปรึกษา', en: 'Ready to serve and advise' },
};

export default function AdminHomepageContentPage() {
  const locale = useLocale();
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['hero']));

  useEffect(() => {
    api.get<{ success: boolean; data: ContentMap }>('/site-content')
      .then((res) => {
        // Merge fetched data with defaults
        const merged = { ...defaults };
        Object.entries(res.data).forEach(([key, val]) => {
          merged[key] = val;
        });
        setContent(merged);
      })
      .catch(() => {
        setContent({ ...defaults });
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateField = (key: string, lang: 'th' | 'en', value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: { ...prev[key], [lang]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.entries(content).map(([key, val]) => ({
        key,
        valueTh: val.th,
        valueEn: val.en,
        type: 'text',
      }));
      await api.put('/admin/site-content', items);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleReset = () => {
    if (confirm(locale === 'th' ? 'รีเซ็ตเป็นค่าเริ่มต้น?' : 'Reset to defaults?')) {
      setContent({ ...defaults });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'var(--font-heading)' }}>
            {locale === 'th' ? 'จัดการเนื้อหาหน้าแรก' : 'Homepage Content'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {locale === 'th' ? 'แก้ไขข้อความทั้งหมดที่แสดงบนหน้าแรก' : 'Edit all text displayed on the homepage'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            <RotateCcw className="w-4 h-4" /> {locale === 'th' ? 'รีเซ็ต' : 'Reset'}
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/90 transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? (locale === 'th' ? 'กำลังบันทึก...' : 'Saving...') : (locale === 'th' ? 'บันทึกทั้งหมด' : 'Save All')}
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {locale === 'th' ? 'บันทึกเรียบร้อยแล้ว!' : 'Saved successfully!'}
        </div>
      )}

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <div key={section.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#1E3A5F]" />
                  <span className="font-semibold text-[#1E293B]">
                    {locale === 'th' ? section.titleTh : section.titleEn}
                  </span>
                  <span className="text-xs text-gray-400">{section.fields.length} {locale === 'th' ? 'ฟิลด์' : 'fields'}</span>
                </div>
                {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t">
                  {section.fields.map((field) => (
                    <div key={field.key} className="grid md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {locale === 'th' ? field.labelTh : field.labelEn} — <span className="text-[#1E3A5F]">TH</span>
                        </label>
                        {field.multiline ? (
                          <textarea
                            value={content[field.key]?.th || ''}
                            onChange={(e) => updateField(field.key, 'th', e.target.value)}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-y"
                          />
                        ) : (
                          <input
                            type="text"
                            value={content[field.key]?.th || ''}
                            onChange={(e) => updateField(field.key, 'th', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {locale === 'th' ? field.labelTh : field.labelEn} — <span className="text-blue-600">EN</span>
                        </label>
                        {field.multiline ? (
                          <textarea
                            value={content[field.key]?.en || ''}
                            onChange={(e) => updateField(field.key, 'en', e.target.value)}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-y"
                          />
                        ) : (
                          <input
                            type="text"
                            value={content[field.key]?.en || ''}
                            onChange={(e) => updateField(field.key, 'en', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
