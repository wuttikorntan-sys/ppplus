'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

interface GalleryImage {
  id: number;
  image: string;
  category: string;
  labelTh: string | null;
  labelEn: string | null;
  sortOrder: number;
  isActive: boolean;
}

type Category = { value: string; labelTh: string; labelEn: string; sortOrder?: number };

// Seed for first-time visitors and as a fallback if site_contents has nothing.
// The full list is editable from /admin/gallery-categories.
const seedCategories: Category[] = [
  { value: 'projects',     labelTh: 'ผลงาน',         labelEn: 'Projects',         sortOrder: 1 },
  { value: 'before_after', labelTh: 'ก่อน & หลัง',   labelEn: 'Before & After',   sortOrder: 2 },
  { value: 'shop',         labelTh: 'ร้านของเรา',    labelEn: 'Our Shop',         sortOrder: 3 },
  { value: 'color_mixing', labelTh: 'ผสมสี',         labelEn: 'Color Mixing',     sortOrder: 4 },
  { value: 'events',       labelTh: 'กิจกรรม',       labelEn: 'Events',           sortOrder: 5 },
];

const LIST_KEY = 'gallery.categories.list';
const LEGACY_CUSTOM_KEY = 'gallery.categories.custom';
const LEGACY_HIDDEN_KEY = 'gallery.categories.hiddenDefaults';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '_').slice(0, 40) || `cat_${Date.now()}`;

const sortByOrder = (arr: Category[]) =>
  [...arr].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

export default function AdminGalleryPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const confirm = useConfirm();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ category: 'projects', labelTh: '', labelEn: '', sortOrder: 0, isActive: true });

  const [allCategories, setAllCategories] = useState<Category[]>(seedCategories);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState({ labelTh: '', labelEn: '' });
  const [savingCat, setSavingCat] = useState(false);

  const fetchImages = async () => {
    try {
      const res = await api.get<{ success: boolean; data: GalleryImage[] }>('/admin/gallery');
      setImages(res.data);
    } catch {
      toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load');
    }
    setLoading(false);
  };

  const fetchCategoriesConfig = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Record<string, { th: string; en: string }> }>('/site-content');
      const raw = res.data?.[LIST_KEY]?.th || res.data?.[LIST_KEY]?.en || '';
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllCategories(sortByOrder(parsed));
          return;
        }
      }
      // Migrate from legacy keys if present
      const rawCustom = res.data?.[LEGACY_CUSTOM_KEY]?.th || res.data?.[LEGACY_CUSTOM_KEY]?.en || '';
      const rawHidden = res.data?.[LEGACY_HIDDEN_KEY]?.th || res.data?.[LEGACY_HIDDEN_KEY]?.en || '';
      const oldCustom: Category[] = rawCustom ? (JSON.parse(rawCustom) as Category[]).filter((c) => c && c.value) : [];
      const oldHidden: string[] = rawHidden
        ? (JSON.parse(rawHidden) as unknown[]).filter((v): v is string => typeof v === 'string')
        : [];
      const survivingDefaults = seedCategories.filter((c) => !oldHidden.includes(c.value));
      const baseOrder = survivingDefaults.length;
      const merged = sortByOrder([
        ...survivingDefaults,
        ...oldCustom.map((c, i) => ({ ...c, sortOrder: c.sortOrder ?? baseOrder + i + 1 })),
      ]);
      if (merged.length > 0) setAllCategories(merged);
    } catch { /* ignore — falls back to seedCategories */ }
  };

  useEffect(() => { fetchImages(); fetchCategoriesConfig(); }, []);

  const handleAddCategory = async () => {
    const labelTh = newCat.labelTh.trim();
    const labelEn = newCat.labelEn.trim();
    if (!labelTh || !labelEn) {
      toast.error(th ? 'กรุณากรอกทั้งภาษาไทยและอังกฤษ' : 'Please fill both Thai and English');
      return;
    }
    const value = slugify(labelEn);
    if (allCategories.some((c) => c.value === value)) {
      toast.error(th ? 'มีหมวดนี้อยู่แล้ว' : 'Category already exists');
      return;
    }
    const sortOrder = (allCategories[allCategories.length - 1]?.sortOrder ?? 0) + 1;
    const next = sortByOrder([...allCategories, { value, labelTh, labelEn, sortOrder }]);
    setSavingCat(true);
    try {
      await api.put('/admin/site-content', [{
        key: LIST_KEY,
        valueTh: JSON.stringify(next),
        valueEn: JSON.stringify(next),
        type: 'json',
      }]);
      setAllCategories(next);
      setForm((f) => ({ ...f, category: value }));
      setNewCat({ labelTh: '', labelEn: '' });
      setShowAddCat(false);
      toast.success(th ? 'เพิ่มหมวดเรียบร้อย' : 'Category added');
    } catch {
      toast.error(th ? 'เพิ่มไม่สำเร็จ' : 'Failed to add');
    } finally {
      setSavingCat(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ category: 'projects', labelTh: '', labelEn: '', sortOrder: 0, isActive: true });
    setFile(null);
    setPreview(null);
    setShowModal(true);
  };

  const handleClearImage = () => {
    setFile(null);
    setPreview(null);
  };

  const openEdit = (img: GalleryImage) => {
    setEditing(img);
    setForm({ category: img.category, labelTh: img.labelTh || '', labelEn: img.labelEn || '', sortOrder: img.sortOrder, isActive: img.isActive });
    setFile(null);
    setPreview(img.image || null);
    setShowModal(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async () => {
    const fd = new FormData();
    if (file) fd.append('image', file);
    fd.append('category', form.category);
    fd.append('labelTh', form.labelTh);
    fd.append('labelEn', form.labelEn);
    fd.append('sortOrder', String(form.sortOrder));
    fd.append('isActive', String(form.isActive));

    try {
      if (editing) {
        await api.upload(`/admin/gallery/${editing.id}`, fd, 'PUT');
      } else {
        await api.upload('/admin/gallery', fd, 'POST');
      }
      setShowModal(false);
      fetchImages();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Error'); }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: th ? 'ยืนยันการลบ' : 'Confirm delete',
      message: th ? 'ต้องการลบรูปนี้ใช่หรือไม่?' : 'Delete this image?',
      confirmText: th ? 'ลบ' : 'Delete',
      cancelText: th ? 'ยกเลิก' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/gallery/${id}`);
      toast.success(th ? 'ลบเรียบร้อย' : 'Deleted');
      fetchImages();
    } catch {
      toast.error(th ? 'ลบไม่สำเร็จ' : 'Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>
            {locale === 'th' ? 'จัดการแกลเลอรี่' : 'Gallery Management'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{locale === 'th' ? 'เพิ่ม แก้ไข ลบรูปภาพในแกลเลอรี่' : 'Add, edit, delete gallery images'}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] text-white rounded-lg hover:bg-[#1C1C1E]/90 transition text-sm font-medium">
          <Plus className="w-4 h-4" /> {locale === 'th' ? 'เพิ่มรูปภาพ' : 'Add Image'}
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{locale === 'th' ? 'ยังไม่มีรูปภาพ' : 'No images yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl overflow-hidden shadow-sm group relative">
              <div className="relative h-48 w-full">
                <Image src={img.image} alt={img.labelEn || ''} fill className="object-cover" sizes="300px" />
                {!img.isActive && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {locale === 'th' ? 'ซ่อน' : 'Hidden'}
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {allCategories.find(c => c.value === img.category)?.[locale === 'th' ? 'labelTh' : 'labelEn'] || img.category}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-[#2D2D2D] truncate">{locale === 'th' ? img.labelTh : img.labelEn || '-'}</p>
                <p className="text-xs text-gray-400">#{img.sortOrder}</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(img)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
                  <Pencil className="w-4 h-4 text-[#2D2D2D]" />
                </button>
                <button onClick={() => handleDelete(img.id)} className="p-2 bg-white rounded-full shadow hover:bg-red-50 transition">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>
                {editing ? (locale === 'th' ? 'แก้ไขรูปภาพ' : 'Edit Image') : (locale === 'th' ? 'เพิ่มรูปภาพ' : 'Add Image')}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'th' ? 'รูปภาพ' : 'Image'} *</label>
                {preview ? (
                  <div className="relative h-40 w-full mb-2 rounded-lg overflow-hidden bg-gray-50">
                    <Image src={preview} alt="Preview" fill className="object-cover" sizes="400px" />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      title={th ? 'ลบรูป' : 'Remove image'}
                      aria-label={th ? 'ลบรูป' : 'Remove image'}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 shadow-md flex items-center justify-center transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-2">
                    {th ? 'ยังไม่มีรูป — เลือกไฟล์ด้านล่าง' : 'No image — pick a file below'}
                  </p>
                )}
                <input type="file" accept="image/*" onChange={handleFile} className="w-full text-sm border rounded-lg p-2" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'th' ? 'หมวดหมู่' : 'Category'}</label>
                <div className="flex gap-2">
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="flex-1 border rounded-lg px-3 py-2 text-sm">
                    {allCategories.map(c => (
                      <option key={c.value} value={c.value}>{locale === 'th' ? c.labelTh : c.labelEn}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCat((v) => !v)}
                    title={th ? 'เพิ่มหมวดใหม่' : 'Add category'}
                    className="shrink-0 px-3 rounded-lg border border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-[#F5841F] hover:text-[#F5841F] hover:bg-[#F5841F]/5 transition flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {th ? 'หมวดใหม่' : 'New'}
                  </button>
                </div>

                {showAddCat && (
                  <div className="mt-2 p-3 rounded-lg border border-[#F5841F]/30 bg-[#F5841F]/5 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newCat.labelTh}
                        onChange={(e) => setNewCat({ ...newCat, labelTh: e.target.value })}
                        placeholder={th ? 'ชื่อหมวด (ไทย)' : 'Name (Thai)'}
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={newCat.labelEn}
                        onChange={(e) => setNewCat({ ...newCat, labelEn: e.target.value })}
                        placeholder="Name (English)"
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowAddCat(false); setNewCat({ labelTh: '', labelEn: '' }); }}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                      >
                        {th ? 'ยกเลิก' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={savingCat}
                        className="flex-1 px-3 py-1.5 bg-[#F5841F] text-white rounded-lg text-xs font-medium hover:bg-[#F5841F]/90 transition disabled:opacity-50"
                      >
                        {savingCat ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Add')}
                      </button>
                    </div>
                  </div>
                )}

                <p className="mt-2 text-[11px] text-gray-400">
                  {th ? 'แก้ไข/ลบหมวดหมู่ทั้งหมดได้ที่ ' : 'Manage all categories at '}
                  <a href={`/${locale}/admin/gallery-categories`} className="text-[#F5841F] hover:underline">
                    /admin/gallery-categories
                  </a>
                </p>
              </div>

              {/* Labels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'th' ? 'คำอธิบาย (ไทย)' : 'Label (Thai)'}</label>
                <input type="text" value={form.labelTh} onChange={e => setForm({ ...form, labelTh: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'th' ? 'คำอธิบาย (อังกฤษ)' : 'Label (English)'}</label>
                <input type="text" value={form.labelEn} onChange={e => setForm({ ...form, labelEn: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'th' ? 'ลำดับ' : 'Sort Order'}</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>

              {/* Active */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#1C1C1E] focus:ring-[#1C1C1E]" />
                <span className="text-sm text-gray-700">{locale === 'th' ? 'แสดงผล' : 'Visible'}</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  {locale === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button onClick={handleSave} disabled={!preview} className="flex-1 px-4 py-2 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50">
                  {locale === 'th' ? 'บันทึก' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
