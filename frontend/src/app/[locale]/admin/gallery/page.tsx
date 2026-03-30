'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
  id: number;
  image: string;
  category: string;
  labelTh: string | null;
  labelEn: string | null;
  sortOrder: number;
  isActive: boolean;
}

const categories = [
  { value: 'restaurant', labelTh: 'บรรยากาศร้าน', labelEn: 'Restaurant' },
  { value: 'food', labelTh: 'อาหาร', labelEn: 'Food' },
  { value: 'events', labelTh: 'อีเวนท์', labelEn: 'Events' },
];

export default function AdminGalleryPage() {
  const locale = useLocale();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ category: 'food', labelTh: '', labelEn: '', sortOrder: 0, isActive: true });

  const fetchImages = async () => {
    try {
      const res = await api.get<{ success: boolean; data: GalleryImage[] }>('/admin/gallery');
      setImages(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ category: 'food', labelTh: '', labelEn: '', sortOrder: 0, isActive: true });
    setFile(null);
    setPreview(null);
    setShowModal(true);
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
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(locale === 'th' ? 'ต้องการลบรูปนี้?' : 'Delete this image?')) return;
    try {
      await api.delete(`/admin/gallery/${id}`);
      fetchImages();
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'var(--font-heading)' }}>
            {locale === 'th' ? 'จัดการแกลเลอรี่' : 'Gallery Management'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{locale === 'th' ? 'เพิ่ม แก้ไข ลบรูปภาพในแกลเลอรี่' : 'Add, edit, delete gallery images'}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#1E3A5F]/90 transition text-sm font-medium">
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
                  {categories.find(c => c.value === img.category)?.[locale === 'th' ? 'labelTh' : 'labelEn'] || img.category}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-[#1E293B] truncate">{locale === 'th' ? img.labelTh : img.labelEn || '-'}</p>
                <p className="text-xs text-gray-400">#{img.sortOrder}</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(img)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
                  <Pencil className="w-4 h-4 text-[#1E293B]" />
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
              <h2 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'var(--font-heading)' }}>
                {editing ? (locale === 'th' ? 'แก้ไขรูปภาพ' : 'Edit Image') : (locale === 'th' ? 'เพิ่มรูปภาพ' : 'Add Image')}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'th' ? 'รูปภาพ' : 'Image'} *</label>
                {preview && (
                  <div className="relative h-40 w-full mb-2 rounded-lg overflow-hidden">
                    <Image src={preview} alt="Preview" fill className="object-cover" sizes="400px" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFile} className="w-full text-sm border rounded-lg p-2" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'th' ? 'หมวดหมู่' : 'Category'}</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{locale === 'th' ? c.labelTh : c.labelEn}</option>
                  ))}
                </select>
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
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]" />
                <span className="text-sm text-gray-700">{locale === 'th' ? 'แสดงผล' : 'Visible'}</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  {locale === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button onClick={handleSave} disabled={!editing && !file} className="flex-1 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/90 transition disabled:opacity-50">
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
