'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function QuotePage() {
  const t = useTranslations('quote');
  const locale = useLocale();
  const th = locale === 'th';
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: '', phone: '', email: '', company: '',
    productId: null as number | null, productName: '', quantity: '', message: '',
  });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const pid = searchParams.get('productId');
    const pname = searchParams.get('productName');
    if (pid && !isNaN(parseInt(pid))) setForm((f) => ({ ...f, productId: parseInt(pid), productName: pname || '' }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error(th ? 'กรุณากรอกชื่อและเบอร์โทร' : 'Please fill in name and phone');
      return;
    }
    setSaving(true);
    try {
      await api.post('/quote', form);
      setSubmitted(true);
      toast.success(th ? 'ส่งคำขอเรียบร้อย' : 'Quote request sent');
    } catch {
      toast.error(th ? 'เกิดข้อผิดพลาด' : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <div className="relative bg-[#1C1C1E] py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <Image src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1600&h=400&fit=crop" alt="" fill className="object-cover" priority />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('title')}
            </h1>
            <p className="text-white/70 text-lg">{t('subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">{th ? 'ส่งคำขอเรียบร้อย!' : 'Request Sent!'}</h2>
            <p className="text-green-600 mb-6">{th ? 'ทีมงานจะติดต่อกลับเร็วที่สุด' : 'Our team will contact you shortly'}</p>
            <div className="flex items-center justify-center gap-2 text-[#1C1C1E]">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">{th ? 'หรือโทร: 02-XXX-XXXX' : 'Or call: 02-XXX-XXXX'}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#1C1C1E]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#1C1C1E]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>{t('title')}</h2>
                <p className="text-sm text-[#64748B]">{t('subtitle')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ-นามสกุล' : 'Full Name'} *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'เบอร์โทร' : 'Phone'} *</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'อีเมล' : 'Email'}</label>
                  <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'บริษัท/อู่' : 'Company'}</label>
                  <input value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
                </div>
              </div>
              {form.productName && (
                <div className="p-3 bg-[#1C1C1E]/5 rounded-xl">
                  <p className="text-sm text-[#64748B]">{th ? 'สินค้า:' : 'Product:'} <span className="font-medium text-[#2D2D2D]">{form.productName}</span></p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'สินค้าที่ต้องการ' : 'Products Needed'}</label>
                <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  placeholder={th ? 'เช่น 2K Clear Coat 4:1, Basecoat Toyota 040...' : 'e.g. 2K Clear Coat 4:1, Basecoat Toyota 040...'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'จำนวน' : 'Quantity'}</label>
                <input value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder={th ? 'เช่น 10 ลิตร, 5 กระป๋อง...' : 'e.g. 10 liters, 5 cans...'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'รายละเอียดเพิ่มเติม' : 'Additional Details'}</label>
                <textarea value={form.message || ''} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm resize-none" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-3.5 bg-[#1C1C1E] text-white rounded-xl font-semibold hover:bg-[#1C1C1E]/90 transition disabled:opacity-50">
                {saving ? (th ? 'กำลังส่ง...' : 'Sending...') : t('form.submit')}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
