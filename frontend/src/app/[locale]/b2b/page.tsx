'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Building2, FileDown, Users, ShieldCheck, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface B2bDocument {
  id: number;
  nameTh: string;
  nameEn: string;
  filePath: string;
  fileSize: string;
  fileType: string;
}

export default function B2BPage() {
  const t = useTranslations('b2b');
  const locale = useLocale();
  const th = locale === 'th';

  const [form, setForm] = useState({
    companyName: '', contactPerson: '', phone: '', email: '', businessType: '', province: '', message: '',
  });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [documents, setDocuments] = useState<B2bDocument[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactPerson || !form.phone || !form.email || !form.businessType) {
      toast.error(th ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/b2b', form);
      setSubmitted(true);
      toast.success(th ? 'ส่งใบสมัครเรียบร้อย' : 'Application submitted successfully');
    } catch {
      toast.error(th ? 'เกิดข้อผิดพลาด' : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    api.get('/b2b/documents').then((res) => {
      if (res.data) setDocuments(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <div className="relative bg-[#1E3A5F] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <Image src="https://images.unsplash.com/photo-1504222490345-c075b6008014?w=1600&h=400&fit=crop" alt="" fill className="object-cover" priority />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('title')}
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Building2, title: th ? 'ตัวแทนจำหน่าย' : 'Dealer Program', desc: th ? 'สมัครเป็นตัวแทนจำหน่ายสีรถยนต์ PP Plus ในพื้นที่ของคุณ' : 'Become a PP Plus automotive paint dealer in your area' },
            { icon: FileDown, title: th ? 'เอกสารดาวน์โหลด' : 'Documents', desc: th ? 'TDS, MSDS, และเอกสารเทคนิคสำหรับลูกค้า B2B' : 'TDS, MSDS, and technical documents for B2B customers' },
            { icon: Users, title: th ? 'ราคาพิเศษ' : 'Special Pricing', desc: th ? 'ราคาส่งพิเศษสำหรับอู่สี ร้านอะไหล่ และตัวแทน' : 'Wholesale pricing for body shops, parts stores, and dealers' },
          ].map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-14 h-14 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-[#1E3A5F]" />
              </div>
              <h3 className="font-semibold text-[#1E293B] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
              <p className="text-sm text-[#64748B]">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              {th ? 'สมัครเป็นตัวแทนจำหน่าย' : 'Apply to Become a Dealer'}
            </h2>
            {submitted ? (
              <div className="bg-green-50 rounded-2xl p-10 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">{th ? 'ส่งใบสมัครเรียบร้อย!' : 'Application Submitted!'}</h3>
                <p className="text-green-600">{th ? 'ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ' : 'Our team will contact you within 1-2 business days'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อบริษัท / อู่' : 'Company Name'} *</label>
                    <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อผู้ติดต่อ' : 'Contact Person'} *</label>
                    <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/10 transition text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'เบอร์โทร' : 'Phone'} *</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'อีเมล' : 'Email'} *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/10 transition text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ประเภทธุรกิจ' : 'Business Type'} *</label>
                    <select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/10 transition text-sm">
                      <option value="">{th ? 'เลือก...' : 'Select...'}</option>
                      <option value="body_shop">{th ? 'อู่สีรถยนต์' : 'Body Shop'}</option>
                      <option value="dealer">{th ? 'ตัวแทนจำหน่าย' : 'Dealer'}</option>
                      <option value="parts_store">{th ? 'ร้านอะไหล่/ร้านสี' : 'Parts / Paint Store'}</option>
                      <option value="fleet">{th ? 'ศูนย์ดูแลรถ/Fleet' : 'Fleet / Service Center'}</option>
                      <option value="other">{th ? 'อื่นๆ' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'จังหวัด' : 'Province'}</label>
                    <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/10 transition text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ข้อความเพิ่มเติม' : 'Message'}</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/10 transition text-sm resize-none" />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#1E3A5F]/90 transition disabled:opacity-50">
                  {saving ? (th ? 'กำลังส่ง...' : 'Submitting...') : (th ? 'ส่งใบสมัคร' : 'Submit Application')}
                </button>
              </form>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              {th ? 'ทำไมต้องเป็นพาร์ทเนอร์ PP Plus?' : 'Why Partner with PP Plus?'}
            </h2>
            <div className="space-y-4 mb-8">
              {[
                th ? 'สินค้าคุณภาพมาตรฐานโรงงาน' : 'Factory-standard quality products',
                th ? 'ราคาส่งพิเศษสำหรับ B2B' : 'Special wholesale B2B pricing',
                th ? 'ทีมเทคนิคพร้อมซัพพอร์ต' : 'Technical team support',
                th ? 'สูตรสีแม่นยำ ΔE < 0.5' : 'Accurate color formulas ΔE < 0.5',
                th ? 'จัดส่งทั่วประเทศ' : 'Nationwide delivery',
                th ? 'เทรนนิ่งและอบรม' : 'Training and workshops',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#2EC4B6] shrink-0" />
                  <span className="text-[#64748B]">{item}</span>
                </div>
              ))}
            </div>

            {/* Document Downloads */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-[#1E293B] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {th ? 'เอกสารดาวน์โหลด' : 'Download Documents'}
              </h3>
              {documents.length === 0 ? (
                <p className="text-sm text-[#64748B] text-center py-4">{th ? 'ยังไม่มีเอกสาร' : 'No documents available'}</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#1E293B]">{th ? doc.nameTh : doc.nameEn}</p>
                        <p className="text-xs text-[#64748B]">{doc.fileType} · {doc.fileSize}</p>
                      </div>
                      <a href={doc.filePath} download target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium text-[#1E3A5F] bg-[#1E3A5F]/10 rounded-lg hover:bg-[#1E3A5F]/20 transition">
                        <FileDown className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
