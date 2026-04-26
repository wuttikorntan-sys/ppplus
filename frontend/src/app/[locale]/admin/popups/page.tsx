'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Megaphone, X, Upload, Eye, EyeOff, Globe, Link as LinkIcon } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

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
  buttonUrl: string | null;
  targetPages: string;
  isActive: boolean;
  createdAt: string;
}

// Pages where a popup can appear. The `key` matches the first path segment
// (after the locale prefix). Keep in sync with Popup.tsx pageKeyFromPath().
const PAGE_OPTIONS = [
  { key: 'home',           labelTh: 'หน้าแรก',         labelEn: 'Home' },
  { key: 'menu',           labelTh: 'สินค้า',           labelEn: 'Products' },
  { key: 'color-matching', labelTh: 'จับคู่สี',         labelEn: 'Color Matching' },
  { key: 'gallery',        labelTh: 'แกลเลอรี่',        labelEn: 'Gallery' },
  { key: 'b2b',            labelTh: 'ตัวแทนจำหน่าย',    labelEn: 'Dealer (B2B)' },
  { key: 'blog',           labelTh: 'บทความ',           labelEn: 'Blog' },
  { key: 'about',           labelTh: 'เกี่ยวกับเรา',     labelEn: 'About' },
  { key: 'contact',        labelTh: 'ติดต่อ',           labelEn: 'Contact' },
];

const emptyForm = {
  title: '', titleTh: '', description: '', descriptionTh: '',
  badge: 'NEW', tags: '', tagsTh: '',
  features: '', featuresTh: '',
  buttonText: 'Explore Menu', buttonTextTh: 'ดูเมนู',
  buttonUrl: '',
  targetMode: 'all' as 'all' | 'select',
  targetPages: [] as string[],
  isActive: true,
};

export default function AdminPopupsPage() {
  const t = useTranslations('admin.popup');
  const locale = useLocale();
  const th = locale === 'th';
  const confirm = useConfirm();
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPopups = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: PopupItem[] }>('/admin/popups');
      setPopups(res.data);
    } catch {
      setPopups([]);
      toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [th]);

  useEffect(() => { fetchPopups(); }, [fetchPopups]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setShowForm(true);
  };

  const parseTargetPages = (raw: string): { mode: 'all' | 'select'; pages: string[] } => {
    const trimmed = (raw || '*').trim();
    if (!trimmed || trimmed === '*') return { mode: 'all', pages: [] };
    return { mode: 'select', pages: trimmed.split(',').map((s) => s.trim()).filter(Boolean) };
  };

  const openEdit = (p: PopupItem) => {
    setEditingId(p.id);
    const { mode, pages } = parseTargetPages(p.targetPages);
    setForm({
      title: p.title, titleTh: p.titleTh, description: p.description, descriptionTh: p.descriptionTh,
      badge: p.badge || 'NEW', tags: p.tags || '', tagsTh: p.tagsTh || '',
      features: p.features || '', featuresTh: p.featuresTh || '',
      buttonText: p.buttonText || 'Explore Menu', buttonTextTh: p.buttonTextTh || 'ดูเมนู',
      buttonUrl: p.buttonUrl || '',
      targetMode: mode,
      targetPages: pages,
      isActive: p.isActive,
    });
    setImageFile(null);
    setImagePreview(p.imageUrl || null);
    setRemoveImage(false);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePage = (key: string) => {
    setForm((f) => ({
      ...f,
      targetPages: f.targetPages.includes(key)
        ? f.targetPages.filter((k) => k !== key)
        : [...f.targetPages, key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.targetMode === 'select' && form.targetPages.length === 0) {
      toast.error(th ? 'กรุณาเลือกอย่างน้อย 1 หน้า' : 'Please select at least one page');
      return;
    }
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
      formData.append('buttonUrl', form.buttonUrl.trim());
      formData.append('targetPages', form.targetMode === 'all' ? '*' : form.targetPages.join(','));
      formData.append('isActive', String(form.isActive));
      if (imageFile) formData.append('image', imageFile);
      else if (removeImage && editingId) formData.append('removeImage', '1');

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
    const ok = await confirm({
      title: th ? 'ยืนยันการลบ' : 'Confirm delete',
      message: t('confirm_delete'),
      confirmText: th ? 'ลบ' : 'Delete',
      cancelText: th ? 'ยกเลิก' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/popups/${id}`);
      toast.success(th ? 'ลบแล้ว' : 'Deleted');
      fetchPopups();
    } catch {
      toast.error(th ? 'ลบไม่สำเร็จ' : 'Failed to delete');
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
      formData.append('buttonUrl', p.buttonUrl || '');
      formData.append('targetPages', p.targetPages || '*');
      formData.append('isActive', String(!p.isActive));
      await api.upload(`/admin/popups/${p.id}`, formData, 'PUT');
      fetchPopups();
    } catch {
      toast.error(th ? 'เกิดข้อผิดพลาด' : 'Error');
    }
  };

  const renderTargetSummary = (p: PopupItem) => {
    const raw = (p.targetPages || '*').trim();
    if (!raw || raw === '*') return th ? 'ทุกหน้า' : 'All pages';
    const pages = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const labels = pages.map((k) => {
      const opt = PAGE_OPTIONS.find((o) => o.key === k);
      return opt ? (th ? opt.labelTh : opt.labelEn) : k;
    });
    if (labels.length <= 2) return labels.join(', ');
    return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-[#1C1C1E]" />
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{popups.length} {th ? 'รายการ' : 'popups'}</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-xl font-medium hover:bg-[#1C1C1E]/90 transition-colors text-sm">
          <Plus className="w-4 h-4" /> {t('add')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : popups.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl">{t('no_popups')}</div>
      ) : (
        <div className="grid gap-3">
          {popups.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-stretch gap-4 p-4">
                {p.imageUrl ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                    <Megaphone className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {p.badge && (
                        <span className="shrink-0 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                          {p.badge}
                        </span>
                      )}
                      <h3 className="font-semibold text-[#2D2D2D] truncate">{th ? (p.titleTh || p.title) : p.title}</h3>
                    </div>
                    <button
                      onClick={() => toggleActive(p)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                        p.isActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.isActive ? (th ? 'เปิดใช้' : 'Active') : (th ? 'ปิด' : 'Inactive')}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">{th ? (p.descriptionTh || p.description) : p.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      <Globe className="w-3 h-3" />
                      {renderTargetSummary(p)}
                    </span>
                    {p.buttonUrl ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md max-w-[280px]">
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{p.buttonUrl}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                        <LinkIcon className="w-3 h-3" />
                        {th ? 'ปุ่มไม่มีลิงก์ (กดเพื่อปิด)' : 'No link (closes popup)'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 self-center">
                  <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-lg transition" title={th ? 'แก้ไข' : 'Edit'}>
                    <Pencil className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg transition" title={th ? 'ลบ' : 'Delete'}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
              <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingId ? t('edit') : t('add')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{th ? 'รูปภาพ' : 'Image'}</label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      title={th ? 'ลบรูป' : 'Remove image'}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 shadow-md flex items-center justify-center transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400 hover:border-[#1C1C1E]/30 hover:text-[#1C1C1E] transition">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">{th ? 'คลิกเพื่ออัปโหลดรูป' : 'Click to upload image'}</span>
                  </button>
                )}
                {removeImage && editingId && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {th ? 'รูปจะถูกลบเมื่อกด "บันทึก"' : 'Image will be removed on save'}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.title')} *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.title_th')}</label>
                  <input type="text" value={form.titleTh} onChange={(e) => setForm({ ...form, titleTh: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.description')}</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition resize-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.description_th')}</label>
                  <textarea value={form.descriptionTh} onChange={(e) => setForm({ ...form, descriptionTh: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition resize-none text-sm" />
                </div>
              </div>

              {/* CTA section */}
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{th ? 'ปุ่ม Call-to-Action' : 'Call-to-Action Button'}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'Badge' : 'Badge'}</label>
                    <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="NEW" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ข้อความปุ่ม (อังกฤษ)' : 'Button Text (EN)'}</label>
                      <input type="text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} placeholder="Explore Menu" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ข้อความปุ่ม (ไทย)' : 'Button Text (TH)'}</label>
                      <input type="text" value={form.buttonTextTh} onChange={(e) => setForm({ ...form, buttonTextTh: e.target.value })} placeholder="ดูเมนู" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-[#F5841F]" />
                      {th ? 'ลิงก์เมื่อกดปุ่ม' : 'Button URL'}
                    </label>
                    <input
                      type="text"
                      value={form.buttonUrl}
                      onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })}
                      placeholder={th ? 'เช่น /menu, /quote, https://line.me/...' : 'e.g. /menu, /quote, https://line.me/...'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      {th
                        ? 'ปล่อยว่างไว้ = ปุ่มแค่ปิด popup • ใส่ URL เริ่มด้วย / สำหรับลิงก์ภายใน หรือ http(s):// สำหรับลิงก์ภายนอก'
                        : 'Leave empty to just close the popup. Use / for internal links or http(s):// for external.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target pages */}
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {th ? 'แสดงในหน้า' : 'Show on pages'}
                </p>
                <div className="space-y-2 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      checked={form.targetMode === 'all'}
                      onChange={() => setForm({ ...form, targetMode: 'all' })}
                      className="w-4 h-4 text-[#F5841F] focus:ring-[#F5841F]"
                    />
                    <span className="text-sm font-medium text-gray-700">{th ? 'ทุกหน้า' : 'All pages'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      checked={form.targetMode === 'select'}
                      onChange={() => setForm({ ...form, targetMode: 'select' })}
                      className="w-4 h-4 text-[#F5841F] focus:ring-[#F5841F]"
                    />
                    <span className="text-sm font-medium text-gray-700">{th ? 'เลือกหน้าเฉพาะ' : 'Selected pages only'}</span>
                  </label>
                </div>
                {form.targetMode === 'select' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    {PAGE_OPTIONS.map((opt) => {
                      const checked = form.targetPages.includes(opt.key);
                      return (
                        <label
                          key={opt.key}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                            checked
                              ? 'border-[#F5841F] bg-[#F5841F]/5 text-[#1C1C1E]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePage(opt.key)}
                            className="w-4 h-4 rounded text-[#F5841F] focus:ring-[#F5841F]"
                          />
                          <span className="text-sm font-medium">{th ? opt.labelTh : opt.labelEn}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tags + Features */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'แท็ก (อังกฤษ)' : 'Tags (EN)'}</label>
                  <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Premium,Pro,Sale" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'แท็ก (ไทย)' : 'Tags (TH)'}</label>
                  <input type="text" value={form.tagsTh} onChange={(e) => setForm({ ...form, tagsTh: e.target.value })} placeholder="พรีเมียม,โปร,ลด" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'จุดเด่น (อังกฤษ)' : 'Features (EN)'}</label>
                  <input type="text" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Quality,Service,Fast" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'จุดเด่น (ไทย)' : 'Features (TH)'}</label>
                  <input type="text" value={form.featuresTh} onChange={(e) => setForm({ ...form, featuresTh: e.target.value })} placeholder="คุณภาพ,บริการ,รวดเร็ว" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-[#1C1C1E] outline-none transition text-sm" />
                </div>
              </div>

              {/* Active */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded text-[#1C1C1E] focus:ring-[#1C1C1E]" />
                <span className="text-sm font-medium text-gray-700">{t('form.active')}</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">
                  {th ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition">
                  {editingId ? (th ? 'บันทึก' : 'Save') : (th ? 'สร้าง' : 'Create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
