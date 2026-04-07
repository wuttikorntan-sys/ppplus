'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, MessageCircle, Clock, Navigation } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface ContentMap {
  [key: string]: { th: string; en: string };
}

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const lang = locale === 'th' ? 'th' : 'en';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loc, setLoc] = useState<ContentMap>({});
  const [headerImg, setHeaderImg] = useState('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&h=600&fit=crop');

  useEffect(() => {
    api.get<{ success: boolean; data: ContentMap }>('/site-content')
      .then((res) => {
        const filtered: ContentMap = {};
        Object.entries(res.data).forEach(([key, val]) => {
          if (key.startsWith('location.') && (val.th || val.en)) filtered[key] = val;
        });
        setLoc(filtered);
        if (res.data['header.contact']?.th) setHeaderImg(res.data['header.contact'].th);
      })
      .catch(() => {});
  }, []);

  const v = (key: string) => loc[key]?.[lang] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api.post<{ success: boolean; error?: string }>('/contact', form);
      if (res.success) {
        toast.success(t('form.success'));
        setForm({ name: '', email: '', phone: '', message: '' });
        setSent(true);
      } else {
        toast.error(res.error || (lang === 'th' ? 'ส่งไม่สำเร็จ' : 'Failed to send'));
      }
    } catch {
      toast.error(lang === 'th' ? 'ส่งไม่สำเร็จ กรุณาลองใหม่' : 'Failed to send. Please try again.');
    }
    setSending(false);
  };

  const mapUrl = loc['location.map_embed']?.[lang] || 'https://maps.google.com/maps?q=13.7563,100.5018&z=15&output=embed';
  const lat = loc['location.lat']?.[lang] || '13.7563';
  const lng = loc['location.lng']?.[lang] || '100.5018';

  return (
    <div className="min-h-screen">
      <section className="relative py-20 text-white overflow-hidden">
        <img src={headerImg} alt="PP Plus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1E]/85 to-[#F5841F]/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t('title')}</h1>
            <p className="text-gray-300 text-lg">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-6">
                <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm flex items-start gap-3 lg:gap-4">
                  <div className="bg-[#1C1C1E]/10 p-2.5 lg:p-3 rounded-xl"><MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-[#1C1C1E]" /></div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D] mb-0.5 lg:mb-1 text-sm lg:text-base">{lang === 'th' ? 'ที่อยู่' : 'Address'}</h3>
                    <p className="text-[#64748B] text-xs lg:text-sm">{v('location.address') || t('info.address')}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm flex items-start gap-3 lg:gap-4">
                  <div className="bg-[#F5841F]/10 p-2.5 lg:p-3 rounded-xl"><Phone className="w-5 h-5 lg:w-6 lg:h-6 text-[#F5841F]" /></div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D] mb-0.5 lg:mb-1 text-sm lg:text-base">{lang === 'th' ? 'โทรศัพท์' : 'Phone'}</h3>
                    <p className="text-[#64748B] text-xs lg:text-sm">{v('location.phone') || t('info.phone')}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm flex items-start gap-3 lg:gap-4">
                  <div className="bg-[#F5841F]/10 p-2.5 lg:p-3 rounded-xl"><Mail className="w-5 h-5 lg:w-6 lg:h-6 text-[#F5841F]" /></div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D] mb-0.5 lg:mb-1 text-sm lg:text-base">{lang === 'th' ? 'อีเมล' : 'Email'}</h3>
                    <p className="text-[#64748B] text-xs lg:text-sm">{v('location.email') || t('info.email')}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm flex items-start gap-3 lg:gap-4">
                  <div className="bg-[#1C1C1E]/10 p-2.5 lg:p-3 rounded-xl"><MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-[#1C1C1E]" /></div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D] mb-0.5 lg:mb-1 text-sm lg:text-base">LINE</h3>
                    <p className="text-[#64748B] text-xs lg:text-sm">{v('location.line') || t('info.line')}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm flex items-start gap-3 lg:gap-4 col-span-2 lg:col-span-1">
                  <div className="bg-[#1C1C1E]/10 p-2.5 lg:p-3 rounded-xl"><Clock className="w-5 h-5 lg:w-6 lg:h-6 text-[#1C1C1E]" /></div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D] mb-0.5 lg:mb-1 text-sm lg:text-base">{v('location.hours_title') || t('info.hours_title')}</h3>
                    <p className="text-[#64748B] text-xs lg:text-sm">{v('location.hours1') || t('info.hours1')}</p>
                    <p className="text-[#64748B] text-xs lg:text-sm">{v('location.hours2') || t('info.hours2')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-64">
                  <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="PP Plus Paint Shop" />
                </div>
                <div className="p-3 border-t border-gray-100 flex justify-end">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1C1E] text-white font-medium rounded-lg hover:bg-[#2a4d75] transition-all text-sm">
                    <Navigation className="w-4 h-4" />{lang === 'th' ? 'นำทางไปร้าน' : 'Get Directions'}
                  </a>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
                <h3 className="text-lg font-semibold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {lang === 'th' ? 'ส่งข้อความถึงเรา' : 'Send us a message'}
                </h3>
                {sent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-green-700 font-medium text-lg">{t('form.success')}</p>
                    <button type="button" onClick={() => setSent(false)} className="mt-2 text-[#1C1C1E] text-sm font-medium hover:underline">
                      {lang === 'th' ? 'ส่งข้อความอีกครั้ง' : 'Send another message'}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.name')} <span className="text-red-500">*</span></label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F5841F]/20 focus:border-[#F5841F] outline-none transition text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.email')} <span className="text-red-500">*</span></label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F5841F]/20 focus:border-[#F5841F] outline-none transition text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{lang === 'th' ? 'เบอร์โทร' : 'Phone'}</label>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F5841F]/20 focus:border-[#F5841F] outline-none transition text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.message')} <span className="text-red-500">*</span></label>
                      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F5841F]/20 focus:border-[#F5841F] outline-none transition resize-none text-sm" />
                    </div>
                    <button type="submit" disabled={sending} className="w-full py-3.5 bg-[#1C1C1E] text-white rounded-xl font-semibold hover:bg-[#2a4d75] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {sending ? (lang === 'th' ? 'กำลังส่ง...' : 'Sending...') : (<><Mail className="w-5 h-5" />{t('form.submit')}</>)}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
