'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Upload, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ColorFormula {
  id: number;
  carBrand: string;
  colorCode: string;
  colorNameTh: string | null;
  colorNameEn: string | null;
  yearRange: string | null;
  formulaType: 'solid' | 'metallic' | 'pearl';
  deltaE: number | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
}

const emptyForm: {
  carBrand: string; colorCode: string; colorNameTh: string; colorNameEn: string; yearRange: string;
  formulaType: 'solid' | 'metallic' | 'pearl'; deltaE: string; isActive: boolean;
} = {
  carBrand: '', colorCode: '', colorNameTh: '', colorNameEn: '', yearRange: '', formulaType: 'solid', deltaE: '', isActive: true,
};

const formulaTypes = [
  { value: 'solid', labelTh: 'โซลิด', labelEn: 'Solid' },
  { value: 'metallic', labelTh: 'เมทัลลิก', labelEn: 'Metallic' },
  { value: 'pearl', labelTh: 'เพิร์ล', labelEn: 'Pearl' },
];

export default function AdminColorFormulasPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [formulas, setFormulas] = useState<ColorFormula[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    api.get<{ success: boolean; data: ColorFormula[]; brands: string[] }>('/admin/color-formulas')
      .then((r) => { setFormulas(r.data); setBrands(r.brands || []); })
      .catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = formulas.filter((f) => {
    const matchSearch = !search || f.carBrand.toLowerCase().includes(search.toLowerCase())
      || f.colorCode.toLowerCase().includes(search.toLowerCase())
      || (f.colorNameTh && f.colorNameTh.includes(search))
      || (f.colorNameEn && f.colorNameEn.toLowerCase().includes(search.toLowerCase()));
    const matchBrand = !filterBrand || f.carBrand === filterBrand;
    return matchSearch && matchBrand;
  });

  const openNew = () => {
    setEditingId(null); setForm(emptyForm); setImageFile(null); setImagePreview(null); setShowForm(true);
  };

  const openEdit = (f: ColorFormula) => {
    setEditingId(f.id);
    setForm({
      carBrand: f.carBrand, colorCode: f.colorCode, colorNameTh: f.colorNameTh || '', colorNameEn: f.colorNameEn || '',
      yearRange: f.yearRange || '', formulaType: f.formulaType, deltaE: f.deltaE?.toString() || '', isActive: f.isActive,
    });
    setImageFile(null); setImagePreview(f.image || null); setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); const r = new FileReader(); r.onloadend = () => setImagePreview(r.result as string); r.readAsDataURL(file); }
  };

  const handleSave = async () => {
    if (!form.carBrand || !form.colorCode) {
      toast.error(th ? 'กรุณากรอกยี่ห้อรถและรหัสสี' : 'Please fill brand and color code'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('carBrand', form.carBrand);
      fd.append('colorCode', form.colorCode);
      fd.append('colorNameTh', form.colorNameTh);
      fd.append('colorNameEn', form.colorNameEn);
      fd.append('yearRange', form.yearRange);
      fd.append('formulaType', form.formulaType);
      fd.append('deltaE', form.deltaE);
      fd.append('isActive', String(form.isActive));
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        await api.upload(`/admin/color-formulas/${editingId}`, fd, 'PUT');
        toast.success(th ? 'อัปเดตเรียบร้อย' : 'Updated');
      } else {
        await api.upload('/admin/color-formulas', fd);
        toast.success(th ? 'เพิ่มเรียบร้อย' : 'Added');
      }
      setShowForm(false); fetchData();
    } catch (err) { toast.error(err instanceof Error ? err.message : (th ? 'เกิดข้อผิดพลาด' : 'Error')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(th ? 'ลบสูตรสีนี้?' : 'Delete this color formula?')) return;
    try { await api.delete(`/admin/color-formulas/${id}`); toast.success(th ? 'ลบเรียบร้อย' : 'Deleted'); fetchData(); }
    catch { toast.error('Error'); }
  };

  const toggleActive = async (f: ColorFormula) => {
    try {
      const fd = new FormData(); fd.append('isActive', String(!f.isActive));
      await api.upload(`/admin/color-formulas/${f.id}`, fd, 'PUT'); fetchData();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'จัดการสูตรสี' : 'Color Formulas'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} {th ? 'สูตร' : 'formulas'}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg font-medium hover:bg-[#1C1C1E]/90 transition text-sm shadow-sm">
          <Plus className="w-4 h-4" /> {th ? 'เพิ่มสูตรสี' : 'Add Formula'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={th ? 'ค้นหายี่ห้อ, รหัสสี...' : 'Search brand, color code...'} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition text-sm" />
        </div>
        <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none text-sm min-w-[160px]">
          <option value="">{th ? 'ทุกยี่ห้อ' : 'All Brands'}</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'รูป' : 'Image'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ยี่ห้อ' : 'Brand'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'รหัสสี' : 'Code'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ชื่อสี' : 'Name'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ประเภท' : 'Type'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">ΔE</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'สถานะ' : 'Status'}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {f.image ? <img src={f.image} alt="" className="object-cover w-full h-full" /> : <div className="w-full h-full bg-gradient-to-br from-[#1C1C1E] to-[#F5841F]" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{f.carBrand}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">{f.colorCode}</span></td>
                  <td className="px-4 py-3 text-gray-600">{th ? f.colorNameTh : f.colorNameEn || f.colorNameTh || '-'}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{formulaTypes.find(t => t.value === f.formulaType)?.[th ? 'labelTh' : 'labelEn']}</span></td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{f.deltaE != null ? Number(f.deltaE).toFixed(2) : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(f)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${f.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {f.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {f.isActive ? (th ? 'เปิด' : 'Active') : (th ? 'ปิด' : 'Hidden')}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(f)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Edit className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={() => handleDelete(f.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">{th ? 'ไม่พบสูตรสี' : 'No formulas found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-[3vh] overflow-y-auto" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl w-full max-w-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingId ? (th ? 'แก้ไขสูตรสี' : 'Edit Formula') : (th ? 'เพิ่มสูตรสี' : 'New Formula')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{th ? 'รูปตัวอย่างสี' : 'Color Image'}</label>
                <div onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-center justify-center cursor-pointer hover:border-[#1C1C1E]/40 transition group overflow-hidden">
                  {imagePreview ? (
                    <><img src={imagePreview} alt="" className="object-cover w-full h-full" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><p className="text-white text-sm font-medium">{th ? 'เปลี่ยนรูป' : 'Change'}</p></div></>
                  ) : (
                    <div className="text-center"><Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">{th ? 'คลิกอัปโหลด' : 'Click to upload'}</p></div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ยี่ห้อรถ' : 'Car Brand'} *</label>
                  <input value={form.carBrand} onChange={(e) => setForm({ ...form, carBrand: e.target.value })} placeholder="Toyota, Honda..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'รหัสสี' : 'Color Code'} *</label>
                  <input value={form.colorCode} onChange={(e) => setForm({ ...form, colorCode: e.target.value })} placeholder="1G3, 070..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อสี (ไทย)' : 'Color Name (TH)'}</label>
                  <input value={form.colorNameTh} onChange={(e) => setForm({ ...form, colorNameTh: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อสี (อังกฤษ)' : 'Color Name (EN)'}</label>
                  <input value={form.colorNameEn} onChange={(e) => setForm({ ...form, colorNameEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ปีรุ่น' : 'Year Range'}</label>
                  <input value={form.yearRange} onChange={(e) => setForm({ ...form, yearRange: e.target.value })} placeholder="2020-2025"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ประเภทสี' : 'Type'}</label>
                  <select value={form.formulaType} onChange={(e) => setForm({ ...form, formulaType: e.target.value as 'solid' | 'metallic' | 'pearl' })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm">
                    {formulaTypes.map((t) => <option key={t.value} value={t.value}>{th ? t.labelTh : t.labelEn}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ΔE</label>
                  <input type="number" step="0.01" value={form.deltaE} onChange={(e) => setForm({ ...form, deltaE: e.target.value })} placeholder="0.50"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm font-mono" />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#1C1C1E] focus:ring-[#1C1C1E]" />
                <span className="text-sm font-medium text-gray-700">{th ? 'เปิดใช้งาน' : 'Active'}</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">{th ? 'ยกเลิก' : 'Cancel'}</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50">
                {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
