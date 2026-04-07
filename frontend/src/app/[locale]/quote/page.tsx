'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Phone, ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

export default function QuotePage() {
  const t = useTranslations('quote');
  const locale = useLocale();
  const th = locale === 'th';
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const [form, setForm] = useState({
    name: '', phone: '', email: '', company: '', message: '',
  });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [headerImg, setHeaderImg] = useState('https://images.unsplash.com/photo-1611288875785-d673e3e6547c?w=1600&h=400&fit=crop');

  useEffect(() => {
    api.get<{ success: boolean; data: Record<string, { th: string; en: string }> }>('/site-content')
      .then((r) => { if (r.data?.['header.quote']?.th) setHeaderImg(r.data['header.quote'].th); })
      .catch(() => {});
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error(th ? 'กรุณากรอกชื่อและเบอร์โทร' : 'Please fill in name and phone');
      return;
    }
    if (items.length === 0) {
      toast.error(th ? 'ตะกร้าว่างเปล่า' : 'Cart is empty');
      return;
    }
    setSaving(true);
    try {
      await api.post('/quote', {
        ...form,
        email: form.email || null,
        company: form.company || null,
        message: form.message || null,
        cartItems: items.map((i) => ({
          id: i.id,
          nameTh: i.nameTh,
          nameEn: i.nameEn,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          brand: i.brand,
        })),
      });
      setSubmitted(true);
      clearCart();
      toast.success(th ? 'ส่งคำขอเรียบร้อย' : 'Quote request sent');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <div className="relative bg-[#1C1C1E] py-14 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src={headerImg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {th ? 'ขอใบเสนอราคา' : 'Request a Quote'}
            </h1>
            <p className="text-white/70">{th ? 'กรอกข้อมูลเพื่อรับใบเสนอราคาจากทีมงาน' : 'Fill in your details to receive a quote from our team'}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-lg mx-auto">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">{th ? 'ส่งคำขอเรียบร้อย!' : 'Request Sent!'}</h2>
            <p className="text-green-600 mb-6">{th ? 'ทีมงานจะติดต่อกลับเร็วที่สุด' : 'Our team will contact you shortly'}</p>
            <div className="flex items-center justify-center gap-2 text-[#1C1C1E] mb-6">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">{th ? 'หรือโทร: 02-XXX-XXXX' : 'Or call: 02-XXX-XXXX'}</span>
            </div>
            <Link href="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1C1E] text-white rounded-xl font-medium hover:bg-[#1C1C1E]/90 transition">
              <ArrowLeft className="w-4 h-4" /> {th ? 'เลือกสินค้าเพิ่ม' : 'Continue Shopping'}
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Cart Items - Left Side */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-5 h-5 text-[#F5841F]" />
                  <h2 className="text-lg font-bold text-[#1C1C1E]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {th ? 'รายการสินค้า' : 'Cart Items'}
                  </h2>
                  <span className="bg-[#F5841F]/10 text-[#F5841F] text-xs font-semibold px-2 py-0.5 rounded-full">
                    {items.length} {th ? 'รายการ' : 'items'}
                  </span>
                </div>
                <Link href="/menu" className="text-sm text-[#F5841F] font-medium hover:underline flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> {th ? 'เพิ่มสินค้า' : 'Add More'}
                </Link>
              </div>

              {items.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                  <ShoppingCart className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium mb-1">{th ? 'ยังไม่มีสินค้าในตะกร้า' : 'Your cart is empty'}</p>
                  <p className="text-gray-300 text-sm mb-4">{th ? 'เลือกสินค้าจากหน้าสินค้าก่อน' : 'Browse products first'}</p>
                  <Link href="/menu" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1C1E] text-white rounded-xl text-sm font-medium hover:bg-[#1C1C1E]/90 transition">
                    <ArrowLeft className="w-4 h-4" /> {th ? 'ไปหน้าสินค้า' : 'Go to Products'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-xl p-4 border border-gray-100 flex gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <Image
                          src={item.image || 'https://images.unsplash.com/photo-1611288875785-d673e3e6547c?w=200&h=200&fit=crop'}
                          alt={th ? item.nameTh : item.nameEn}
                          fill className="object-cover" sizes="96px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1C1C1E] text-sm line-clamp-2">{th ? item.nameTh : item.nameEn}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          {item.brand && <span>{item.brand}</span>}
                          {item.size && <span>· {item.size}</span>}
                        </div>
                        <p className="text-[#F5841F] font-bold text-sm mt-1">฿{Number(item.price).toLocaleString()}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-100 rounded-l-lg transition">
                              <Minus className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 rounded-r-lg transition">
                              <Plus className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-[#1C1C1E]">฿{(item.price * item.quantity).toLocaleString()}</span>
                            <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Summary */}
                  <div className="bg-[#FFF5EB] rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-[#64748B]">{th ? 'ราคารวมโดยประมาณ' : 'Estimated Total'}</span>
                    <span className="text-xl font-bold text-[#F5841F]">฿{total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Form - Right Side */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[#1C1C1E]/10 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-[#1C1C1E]" />
                  </div>
                  <h2 className="font-bold text-[#1C1C1E]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {th ? 'ข้อมูลผู้ขอ' : 'Your Details'}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{th ? 'ชื่อ-นามสกุล' : 'Full Name'} *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{th ? 'เบอร์โทร' : 'Phone'} *</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{th ? 'อีเมล' : 'Email'}</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{th ? 'บริษัท/อู่' : 'Company'}</label>
                    <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{th ? 'ข้อความเพิ่มเติม' : 'Message'}</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F5841F] focus:ring-2 focus:ring-[#F5841F]/10 transition text-sm resize-none" />
                  </div>
                  <button type="submit" disabled={saving || items.length === 0}
                    className="w-full py-3 bg-[#F5841F] text-white rounded-xl font-semibold hover:bg-[#F5841F]/90 transition disabled:opacity-50 mt-2">
                    {saving ? (th ? 'กำลังส่ง...' : 'Sending...') : (th ? 'ส่งขอใบเสนอราคา' : 'Submit Quote Request')}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    {th ? '* ทีมงานจะติดต่อกลับภายใน 1-2 ชั่วโมง ในเวลาทำการ' : '* Our team will respond within 1-2 hours during business hours'}
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
