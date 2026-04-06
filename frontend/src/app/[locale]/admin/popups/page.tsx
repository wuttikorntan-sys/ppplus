'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Megaphone, X, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PopupItem {
  id: number;
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  imageUrl: string | null;
  badge: string;
  tags: string;
  tagsTh: string;
  features: string;
  featuresTh: string;
  buttonText: string;
  buttonTextTh: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  title: '', titleTh: '', description: '', descriptionTh: '',
  badge: 'NEW', tags: 'Premium,Restaurant,Cafe & Bar', tagsTh: 'พรีเมียม,ร้านอาหาร,คาเฟ่ & บาร์',
  features: 'Premium Quality,Great Ambience,Excellent Service', featuresTh: 'คุณภาพสูง,บรรยากาศดี,บริการยอดเยี่ยม',
  buttonText: 'Explore Menu', buttonTextTh: 'ดูเมนู',
  isActive: true,
};

export default function AdminPopupsPage() {
  const t = useTranslations('admin.popup');
  const locale = useLocale();
  const th = locale === 'th';
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchPopups = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: PopupItem[] }>('/admin/popups');
      setPopups(res.data);
    } catch {
      setPopups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPopups(); }, [fetchPopups]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (p: PopupItem) => {
    setEditingId(p.id);
    setForm({
      title: p.title, titleTh: p.titleTh, description: p.description, descriptionTh: p.descriptionTh,
      badge: p.badge || 'NEW', tags: p.tags || '', tagsTh: p.tagsTh || '',
      features: p.features || '', featuresTh: p.featuresTh || '',
      buttonText: p.buttonText || 'Explore Menu', buttonTextTh: p.buttonTextTh || 'ดูเมนู',
      isActive: p.isActive,
    });
    setImageFile(null);
    setImagePreview(p.imageUrl || null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('titleTh', form.titleTh);
      formData.append('description', form.description);
      formData.append('descriptionTh', form.descriptionTh);
      formData.append('badge', form.badge);
      formData.append('tags', form.tags);
      formData.append('tagsTh', form.tagsTh);
      formData.append('features', form.features);
      formData.append('featuresTh', form.featuresTh);
      formData.append('buttonText', form.buttonText);
      formData.append('buttonTextTh', form.buttonTextTh);
      formData.append('isActive', String(form.isActive));
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await api.upload(`/admin/popups/${editingId}`, formData, 'PUT');
        toast.success(th ? 'อัปเดตแล้ว' : 'Updated');
      } else {
        await api.upload('/admin/popups', formData);
        toast.success(th ? 'สร้างแล้ว' : 'Created');
      }
      setShowForm(false);
      fetchPopups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (th ? 'เกิดข้อผิดพลาด' : 'Error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      await api.delete(`/admin/popups/${id}`);
      toast.success(locale === 'th' ? 'ลบแล้ว' : 'Deleted');
      fetchPopups();
    } catch {
      toast.error(locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error');
    }
  };

  const toggleActive = async (p: PopupItem) => {
    try {
      const formData = new FormData();
      formData.append('title', p.title);
      formData.append('titleTh', p.titleTh);
      formData.append('description', p.description);
      formData.append('descriptionTh', p.descriptionTh);
      formData.append('badge', p.badge || 'NEW');
      formData.append('tags', p.tags || '');
      formData.append('tagsTh', p.tagsTh || '');
      formData.append('features', p.features || '');
      formData.append('featuresTh', p.featuresTh || '');
      formData.append('buttonText', p.buttonText || 'Explore Menu');
      formData.append('buttonTextTh', p.buttonTextTh || 'ดูเมนู');
      formData.append('isActive', String(!p.isActive));
      await api.upload(`/admin/popups/${p.id}`, formData, 'PUT');
      fetchPopups();
    } catch {
      toast.error(locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-[#1C1C1E]" />
          <h1 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>{t('title')}</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-xl font-medium hover:bg-[#1C1C1E]-light transition-colors">
          <Plus className="w-4 h-4" /> {t('add')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">{locale === 'th' ? 'กำลังโหลด...' : 'Loading...'}</div>
      ) : popups.length === 0 ? (
        <div className="text-center py-20 text-gray-400">{t('no_popups')}</div>
      ) : (
        <div className="grid gap-4">
          {popups.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              {p.imageUrl && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#2D2D2D] truncate">{locale === 'th' ? p.titleTh || p.title : p.title}</h3>
                <p className="text-sm text-gray-400 truncate">{locale === 'th' ? p.descriptionTh || p.description : p.description}</p>
              </div>
              <button onClick={() => toggleActive(p)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.isActive ? (locale === 'th' ? 'เปิด' : 'Active') : (locale === 'th' ? 'ปิด' : 'Inactive')}
              </button>
              <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-lg transition"><Pencil className="w-4 h-4 text-gray-400" /></button>
              <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>{editingId ? t('edit') : t('add')}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{t('form.title')}</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{t('form.title_th')}</label>
                <input type="text" value={form.titleTh} onChange={(e) => setForm({ ...form, titleTh: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{t('form.description')}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{t('form.description_th')}</label>
                <textarea value={form.descriptionTh} onChange={(e) => setForm({ ...form, descriptionTh: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition resize-none" />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{th ? 'ตั้งค่า Popup' : 'Popup Settings'}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{th ? 'Badge' : 'Badge'}</label>
                    <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="NEW" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{th ? 'ปุ่ม CTA' : 'Button Text'}</label>
                    <input type="text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} placeholder="Explore Menu" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{th ? 'ปุ่ม CTA (ภาษาไทย)' : 'Button Text (Thai)'}</label>
                    <input type="text" value={form.buttonTextTh} onChange={(e) => setForm({ ...form, buttonTextTh: e.target.value })} placeholder="ดูเมนู" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{th ? 'แท็ก (คั่นด้วย ,)' : 'Tags (comma separated)'}</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{th ? 'แท็ก (อังกฤษ)' : 'Tags (EN)'}</label>
                    <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Premium,Restaurant,Cafe & Bar" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{th ? 'แท็ก (ไทย)' : 'Tags (TH)'}</label>
                    <input type="text" value={form.tagsTh} onChange={(e) => setForm({ ...form, tagsTh: e.target.value })} placeholder="พรีเมียม,ร้านอาหาร,คาเฟ่ & บาร์" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{th ? 'ฟีเจอร์ (คั่นด้วย ,)' : 'Features (comma separated)'}</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{th ? 'ฟีเจอร์ (อังกฤษ)' : 'Features (EN)'}</label>
                    <input type="text" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Premium Quality,Great Ambience,Excellent Service" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{th ? 'ฟีเจอร์ (ไทย)' : 'Features (TH)'}</label>
                    <input type="text" value={form.featuresTh} onChange={(e) => setForm({ ...form, featuresTh: e.target.value })} placeholder="คุณภาพสูง,บรรยากาศดี,บริการยอดเยี่ยม" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">{th ? 'รูปภาพ' : 'Image'}</label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 mb-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-sm">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400 hover:border-[#1C1C1E]/30 hover:text-[#1C1C1E] transition">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">{th ? 'คลิกเพื่ออัปโหลดรูป' : 'Click to upload image'}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="isActive" className="text-sm font-medium text-[#2D2D2D]">{t('form.active')}</label>
              </div>
              <button type="submit" className="w-full py-3 bg-[#1C1C1E] text-white rounded-xl font-medium hover:bg-[#1C1C1E]-light transition-colors">
                {editingId ? (locale === 'th' ? 'บันทึก' : 'Save') : (locale === 'th' ? 'สร้าง' : 'Create')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}