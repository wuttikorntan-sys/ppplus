'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Upload, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface MenuItem {
  id: number;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  price: string;
  image: string | null;
  isAvailable: boolean;
  sortOrder: number;
  category?: { id: number; nameTh: string; nameEn: string };
  categoryId: number;
  brand: string | null;
  colorCode: string | null;
  colorName: string | null;
  finishType: string | null;
  coverageArea: number | null;
  size: string | null;
  unit: string | null;
  mixingRatio: string | null;
  featuresTh: string | null;
  featuresEn: string | null;
  applicationMethodTh: string | null;
  applicationMethodEn: string | null;
  videoUrl: string | null;
  tdsFile: string | null;
}

interface Category {
  id: number;
  nameTh: string;
  nameEn: string;
}

const emptyForm = {
  nameTh: '', nameEn: '', descriptionTh: '', descriptionEn: '', price: '', categoryId: '', isAvailable: true, sortOrder: '0',
  brand: '', colorCode: '', colorName: '', finishType: '', coverageArea: '', size: '', unit: 'L',
  mixingRatio: '', featuresTh: '', featuresEn: '', applicationMethodTh: '', applicationMethodEn: '', videoUrl: '',
};

export default function AdminMenuPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tdsFile, setTdsFile] = useState<File | null>(null);
  const [tdsPreview, setTdsPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tdsInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = () => {
    api.get<{ success: boolean; data: MenuItem[] }>('/admin/menu')
      .then((r) => setItems(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchItems();
    api.get<{ success: boolean; data: Category[] }>('/admin/categories')
      .then((r) => setCategories(r.data))
      .catch(() => {});
  }, []);

  const filtered = items.filter((i) => {
    const matchSearch = search === '' || i.nameTh.includes(search) || i.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === '' || i.categoryId === parseInt(filterCat);
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setTdsFile(null);
    setTdsPreview(null);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      nameTh: item.nameTh,
      nameEn: item.nameEn,
      descriptionTh: item.descriptionTh || '',
      descriptionEn: item.descriptionEn || '',
      price: item.price.toString(),
      categoryId: item.categoryId?.toString() || '',
      isAvailable: item.isAvailable,
      sortOrder: item.sortOrder?.toString() || '0',
      brand: item.brand || '',
      colorCode: item.colorCode || '',
      colorName: item.colorName || '',
      finishType: item.finishType || '',
      coverageArea: item.coverageArea?.toString() || '',
      size: item.size?.toString() || '',
      unit: item.unit || 'L',
      mixingRatio: item.mixingRatio || '',
      featuresTh: item.featuresTh || '',
      featuresEn: item.featuresEn || '',
      applicationMethodTh: item.applicationMethodTh || '',
      applicationMethodEn: item.applicationMethodEn || '',
      videoUrl: item.videoUrl || '',
    });
    setImageFile(null);
    setImagePreview(item.image || null);
    setTdsFile(null);
    setTdsPreview(item.tdsFile || null);
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

  const handleSave = async () => {
    if (!form.nameTh || !form.nameEn || !form.price || !form.categoryId) {
      toast.error(th ? '?????????????????????' : 'Please fill required fields');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nameTh', form.nameTh);
      formData.append('nameEn', form.nameEn);
      formData.append('descriptionTh', form.descriptionTh);
      formData.append('descriptionEn', form.descriptionEn);
      formData.append('price', form.price);
      formData.append('categoryId', form.categoryId);
      formData.append('isAvailable', String(form.isAvailable));
      formData.append('sortOrder', form.sortOrder || '0');
      if (form.brand) formData.append('brand', form.brand);
      if (form.colorCode) formData.append('colorCode', form.colorCode);
      if (form.colorName) formData.append('colorName', form.colorName);
      if (form.finishType) formData.append('finishType', form.finishType);
      if (form.coverageArea) formData.append('coverageArea', form.coverageArea);
      if (form.size) formData.append('size', form.size);
      if (form.unit) formData.append('unit', form.unit);
      if (form.mixingRatio) formData.append('mixingRatio', form.mixingRatio);
      if (form.featuresTh) formData.append('featuresTh', form.featuresTh);
      if (form.featuresEn) formData.append('featuresEn', form.featuresEn);
      if (form.applicationMethodTh) formData.append('applicationMethodTh', form.applicationMethodTh);
      if (form.applicationMethodEn) formData.append('applicationMethodEn', form.applicationMethodEn);
      if (form.videoUrl) formData.append('videoUrl', form.videoUrl);
      if (imageFile) formData.append('image', imageFile);
      if (tdsFile) formData.append('tdsFile', tdsFile);

      if (editingId) {
        await api.upload(`/admin/menu/${editingId}`, formData, 'PUT');
        toast.success(th ? '???????????????' : 'Updated');
      } else {
        await api.upload('/admin/menu', formData);
        toast.success(th ? '??????????????' : 'Added');
      }
      setShowForm(false);
      fetchItems();
    } catch {
      toast.error(th ? '??????????????' : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(th ? '????????????' : 'Delete this item?')) return;
    try {
      await api.delete(`/admin/menu/${id}`);
      toast.success(th ? '???????????' : 'Deleted');
      fetchItems();
    } catch {
      toast.error('Error');
    }
  };

  const toggleAvailable = async (item: MenuItem) => {
    try {
      const formData = new FormData();
      formData.append('isAvailable', String(!item.isAvailable));
      await api.upload(`/admin/menu/${item.id}`, formData, 'PUT');
      fetchItems();
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? '????????????' : 'Product Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} {th ? '??????' : 'items'}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg font-medium hover:bg-[#1C1C1E]/90 transition text-sm shadow-sm">
          <Plus className="w-4 h-4" /> {th ? '???????????' : 'Add Product'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={th ? '???????????...' : 'Search products...'} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition text-sm" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition text-sm">
          <option value="">{th ? '???????????' : 'All Categories'}</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{th ? c.nameTh : c.nameEn}</option>))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? '???' : 'Image'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? '????' : 'Name'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? '????????' : 'Category'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? '????' : 'Price'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? '?????' : 'Status'}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? '??????' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt="" width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-300" /></div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{th ? item.nameTh : item.nameEn}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{th ? item.descriptionTh : item.descriptionEn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{th ? item.category?.nameTh : item.category?.nameEn}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#1C1C1E]">?{Number(item.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvailable(item)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${item.isAvailable ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                      {item.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {item.isAvailable ? (th ? '????????' : 'Active') : (th ? '???' : 'Hidden')}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Edit className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">{th ? '???????????' : 'No items found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingId ? (th ? '???????????' : 'Edit Product') : (th ? '???????????????' : 'New Product')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{th ? '??????' : 'Image'}</label>
                <div onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-200 rounded-xl h-48 flex items-center justify-center cursor-pointer hover:border-[#1C1C1E]/40 transition group overflow-hidden">
                  {imagePreview ? (
                    <>
                      <Image src={imagePreview} alt="" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <p className="text-white text-sm font-medium">{th ? '??????????' : 'Change Image'}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">{th ? '???????????????????' : 'Click to upload image'}</p>
                      <p className="text-xs text-gray-300 mt-1">JPEG, PNG, WebP (max 5MB)</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '???? (???)' : 'Name (Thai)'} *</label>
                  <input value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '???? (??????)' : 'Name (English)'} *</label>
                  <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '?????????? (???)' : 'Description (Thai)'}</label>
                  <textarea value={form.descriptionTh} onChange={(e) => setForm({ ...form, descriptionTh: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '?????????? (??????)' : 'Description (English)'}</label>
                  <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none" rows={3} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '???? (?)' : 'Price (?)'} *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '????????' : 'Category'} *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm">
                    <option value="">{th ? '?????' : 'Select'}</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{th ? c.nameTh : c.nameEn}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '?????' : 'Sort Order'}</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#1C1C1E] focus:ring-[#1C1C1E]" />
                <span className="text-sm font-medium text-gray-700">{th ? '????????' : 'Available for sale'}</span>
              </label>
              {/* Paint-specific fields */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-sm font-semibold text-gray-600 mb-3">{th ? '???????????????????' : 'Paint Product Details'}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '??????' : 'Brand'}</label>
                    <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="TOA, Beger, Jotun..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '?????????' : 'Finish Type'}</label>
                    <select value={form.finishType} onChange={(e) => setForm({ ...form, finishType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm">
                      <option value="">{th ? '?????' : 'Select'}</option>
                      <option value="Matte">Matte</option>
                      <option value="Satin">Satin</option>
                      <option value="Semi-gloss">Semi-gloss</option>
                      <option value="Gloss">Gloss</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '??????' : 'Color Code'}</label>
                    <div className="flex gap-2">
                      <input type="color" value={form.colorCode || '#ffffff'} onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                      <input value={form.colorCode} onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                        placeholder="#FFFFFF"
                        className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '??????' : 'Color Name'}</label>
                    <input value={form.colorName} onChange={(e) => setForm({ ...form, colorName: e.target.value })}
                      placeholder={th ? '??????, ???????...' : 'Pearl White, Ocean Blue...'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'พื้นที่ครอบคลุม (m²/L)' : 'Coverage (m²/L)'}</label>
                    <input type="number" value={form.coverageArea} onChange={(e) => setForm({ ...form, coverageArea: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? '????' : 'Size'}</label>
                    <div className="flex gap-2">
                      <input type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
                        className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                      <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        className="w-20 px-2 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm">
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="gal">gal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-sm font-semibold text-gray-600 mb-3">{th ? 'ข้อมูลทางเทคนิค' : 'Technical Details'}</p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'สัดส่วนผสม' : 'Mixing Ratio'}</label>
                    <input value={form.mixingRatio} onChange={(e) => setForm({ ...form, mixingRatio: e.target.value })}
                      placeholder={th ? 'เช่น 2:1:10%' : 'e.g. 2:1:10%'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'คุณสมบัติเด่น (ไทย)' : 'Key Features (Thai)'}</label>
                      <textarea value={form.featuresTh} onChange={(e) => setForm({ ...form, featuresTh: e.target.value })}
                        placeholder={th ? 'แต่ละข้อขึ้นบรรทัดใหม่' : 'Each feature on a new line'}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none" rows={4} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'คุณสมบัติเด่น (อังกฤษ)' : 'Key Features (English)'}</label>
                      <textarea value={form.featuresEn} onChange={(e) => setForm({ ...form, featuresEn: e.target.value })}
                        placeholder={th ? 'แต่ละข้อขึ้นบรรทัดใหม่' : 'Each feature on a new line'}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none" rows={4} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'วิธีใช้งาน (ไทย)' : 'Application Method (Thai)'}</label>
                      <textarea value={form.applicationMethodTh} onChange={(e) => setForm({ ...form, applicationMethodTh: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none" rows={4} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'วิธีใช้งาน (อังกฤษ)' : 'Application Method (English)'}</label>
                      <textarea value={form.applicationMethodEn} onChange={(e) => setForm({ ...form, applicationMethodEn: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none" rows={4} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ลิงก์วิดีโอ YouTube' : 'YouTube Video URL'}</label>
                    <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'เอกสาร TDS (PDF)' : 'TDS Document (PDF)'}</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => tdsInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {th ? 'เลือกไฟล์ TDS' : 'Choose TDS File'}
                      </button>
                      {(tdsFile || tdsPreview) && (
                        <span className="text-xs text-green-600 font-medium">
                          {tdsFile ? tdsFile.name : (th ? 'มีไฟล์ TDS แล้ว' : 'TDS file uploaded')}
                        </span>
                      )}
                    </div>
                    <input ref={tdsInputRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) setTdsFile(f); }} className="hidden" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">{th ? '??????' : 'Cancel'}</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50">
                {saving ? (th ? '???????????...' : 'Saving...') : (th ? '??????' : 'Save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
