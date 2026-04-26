'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, EyeOff, RotateCcw, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

// Keep in sync with frontend/src/app/[locale]/admin/gallery/page.tsx
const defaultCategories: { value: string; labelTh: string; labelEn: string }[] = [
  { value: 'projects',     labelTh: 'ผลงาน',         labelEn: 'Projects' },
  { value: 'before_after', labelTh: 'ก่อน & หลัง',   labelEn: 'Before & After' },
  { value: 'shop',         labelTh: 'ร้านของเรา',    labelEn: 'Our Shop' },
  { value: 'color_mixing', labelTh: 'ผสมสี',         labelEn: 'Color Mixing' },
  { value: 'events',       labelTh: 'กิจกรรม',       labelEn: 'Events' },
];

const CATEGORIES_KEY = 'gallery.categories.custom';
const HIDDEN_DEFAULTS_KEY = 'gallery.categories.hiddenDefaults';

type CustomCategory = { value: string; labelTh: string; labelEn: string; sortOrder?: number };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '_').slice(0, 40) || `cat_${Date.now()}`;

const emptyForm = { labelTh: '', labelEn: '', sortOrder: '0' };

export default function AdminGalleryCategoriesPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const confirm = useConfirm();

  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [hiddenDefaults, setHiddenDefaults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Record<string, { th: string; en: string }> }>('/site-content');
      const rawCustom = res.data?.[CATEGORIES_KEY]?.th || res.data?.[CATEGORIES_KEY]?.en || '';
      if (rawCustom) {
        const parsed = JSON.parse(rawCustom);
        if (Array.isArray(parsed)) setCustomCategories(parsed);
      } else {
        setCustomCategories([]);
      }
      const rawHidden = res.data?.[HIDDEN_DEFAULTS_KEY]?.th || res.data?.[HIDDEN_DEFAULTS_KEY]?.en || '';
      if (rawHidden) {
        const parsed = JSON.parse(rawHidden);
        if (Array.isArray(parsed)) setHiddenDefaults(parsed.filter((v): v is string => typeof v === 'string'));
      } else {
        setHiddenDefaults([]);
      }
    } catch {
      toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const persistCustom = async (next: CustomCategory[]) => {
    await api.put('/admin/site-content', [{
      key: CATEGORIES_KEY,
      valueTh: JSON.stringify(next),
      valueEn: JSON.stringify(next),
      type: 'json',
    }]);
  };

  const persistHidden = async (next: string[]) => {
    await api.put('/admin/site-content', [{
      key: HIDDEN_DEFAULTS_KEY,
      valueTh: JSON.stringify(next),
      valueEn: JSON.stringify(next),
      type: 'json',
    }]);
  };

  const openNew = () => {
    setEditingValue(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cat: CustomCategory) => {
    setEditingValue(cat.value);
    setForm({ labelTh: cat.labelTh, labelEn: cat.labelEn, sortOrder: String(cat.sortOrder ?? 0) });
    setShowForm(true);
  };

  const handleSave = async () => {
    const labelTh = form.labelTh.trim();
    const labelEn = form.labelEn.trim();
    if (!labelTh || !labelEn) {
      toast.error(th ? 'กรุณากรอกทั้งภาษาไทยและอังกฤษ' : 'Please fill both Thai and English');
      return;
    }
    const sortOrder = parseInt(form.sortOrder) || 0;
    setSaving(true);
    try {
      if (editingValue) {
        const next = customCategories.map((c) =>
          c.value === editingValue ? { ...c, labelTh, labelEn, sortOrder } : c
        );
        await persistCustom(next);
        setCustomCategories(next);
        toast.success(th ? 'อัปเดตเรียบร้อย' : 'Updated');
      } else {
        const value = slugify(labelEn);
        const exists = defaultCategories.some((c) => c.value === value)
          || customCategories.some((c) => c.value === value);
        if (exists) {
          toast.error(th ? 'มีหมวดนี้อยู่แล้ว' : 'Category already exists');
          setSaving(false);
          return;
        }
        const next = [...customCategories, { value, labelTh, labelEn, sortOrder }];
        await persistCustom(next);
        setCustomCategories(next);
        toast.success(th ? 'เพิ่มเรียบร้อย' : 'Created');
      }
      setShowForm(false);
    } catch {
      toast.error(th ? 'บันทึกไม่สำเร็จ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustom = async (cat: CustomCategory) => {
    const ok = await confirm({
      title: th ? 'ยืนยันการลบ' : 'Confirm delete',
      message: th
        ? `ต้องการลบหมวด "${cat.labelTh}" ใช่หรือไม่? รูปที่อยู่ในหมวดนี้จะยังอยู่ในฐานข้อมูล`
        : `Delete "${cat.labelEn}"? Existing images stay in the database.`,
      confirmText: th ? 'ลบ' : 'Delete',
      cancelText: th ? 'ยกเลิก' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const next = customCategories.filter((c) => c.value !== cat.value);
      await persistCustom(next);
      setCustomCategories(next);
      toast.success(th ? 'ลบเรียบร้อย' : 'Deleted');
    } catch {
      toast.error(th ? 'ลบไม่สำเร็จ' : 'Failed to delete');
    }
  };

  const handleHideDefault = async (value: string) => {
    const def = defaultCategories.find((c) => c.value === value);
    if (!def) return;
    const ok = await confirm({
      title: th ? 'ยืนยันการซ่อน' : 'Confirm hide',
      message: th
        ? `ซ่อนหมวด "${def.labelTh}"? สามารถกู้คืนภายหลังได้`
        : `Hide "${def.labelEn}"? You can restore it later.`,
      confirmText: th ? 'ซ่อน' : 'Hide',
      cancelText: th ? 'ยกเลิก' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const next = [...hiddenDefaults, value];
      await persistHidden(next);
      setHiddenDefaults(next);
      toast.success(th ? 'ซ่อนเรียบร้อย' : 'Hidden');
    } catch {
      toast.error(th ? 'ซ่อนไม่สำเร็จ' : 'Failed to hide');
    }
  };

  const handleRestoreDefault = async (value: string) => {
    try {
      const next = hiddenDefaults.filter((v) => v !== value);
      await persistHidden(next);
      setHiddenDefaults(next);
      toast.success(th ? 'กู้คืนเรียบร้อย' : 'Restored');
    } catch {
      toast.error(th ? 'กู้คืนไม่สำเร็จ' : 'Failed to restore');
    }
  };

  const visibleDefaults = defaultCategories.filter((c) => !hiddenDefaults.includes(c.value));
  const totalCount = visibleDefaults.length + customCategories.length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'หมวดหมู่แกลเลอรี่' : 'Gallery Categories'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCount} {th ? 'หมวดหมู่ที่ใช้งาน' : 'active categories'}
            {hiddenDefaults.length > 0 && ` · ${hiddenDefaults.length} ${th ? 'ซ่อนไว้' : 'hidden'}`}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg font-medium hover:bg-[#1C1C1E]/90 transition text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> {th ? 'เพิ่มหมวดหมู่' : 'Add Category'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide w-12">{th ? 'ประเภท' : 'Type'}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ชื่อ (ไทย)' : 'Name (Thai)'}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ชื่อ (อังกฤษ)' : 'Name (English)'}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ลำดับ' : 'Order'}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จัดการ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan={5} className="px-4 py-12 text-center">
                <div className="w-6 h-6 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            )}

            {!loading && visibleDefaults.map((cat) => (
              <tr key={`def-${cat.value}`} className="hover:bg-gray-50/50 transition">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold uppercase tracking-wide">
                    <Lock className="w-3 h-3" /> {th ? 'มาตรฐาน' : 'Built-in'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{cat.labelTh}</td>
                <td className="px-4 py-3 text-gray-600">{cat.labelEn}</td>
                <td className="px-4 py-3 text-gray-300">—</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleHideDefault(cat.value)}
                    title={th ? 'ซ่อนหมวด (กู้คืนได้)' : 'Hide category (restorable)'}
                    className="p-1.5 hover:bg-amber-50 rounded-lg transition"
                  >
                    <EyeOff className="w-4 h-4 text-amber-500" />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && customCategories.map((cat) => (
              <tr key={`custom-${cat.value}`} className="hover:bg-gray-50/50 transition">
                <td className="px-4 py-3">
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-semibold uppercase tracking-wide">
                    {th ? 'กำหนดเอง' : 'Custom'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{cat.labelTh}</td>
                <td className="px-4 py-3 text-gray-600">{cat.labelEn}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{cat.sortOrder ?? 0}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteCustom(cat)} className="p-1.5 hover:bg-red-50 rounded-lg transition ml-1">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && totalCount === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                {th ? 'ยังไม่มีหมวดหมู่' : 'No categories'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Hidden defaults section */}
      {!loading && hiddenDefaults.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {th ? 'หมวดมาตรฐานที่ซ่อนไว้' : 'Hidden Built-in Categories'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {defaultCategories
              .filter((c) => hiddenDefaults.includes(c.value))
              .map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleRestoreDefault(c.value)}
                  className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="line-through">{th ? c.labelTh : c.labelEn}</span>
                  <span className="text-gray-400">— {th ? 'กู้คืน' : 'restore'}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingValue ? (th ? 'แก้ไขหมวดหมู่' : 'Edit Category') : (th ? 'เพิ่มหมวดหมู่ใหม่' : 'New Category')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ (ไทย)' : 'Name (Thai)'} *</label>
                <input
                  value={form.labelTh}
                  onChange={(e) => setForm({ ...form, labelTh: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ (อังกฤษ)' : 'Name (English)'} *</label>
                <input
                  value={form.labelEn}
                  onChange={(e) => setForm({ ...form, labelEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm"
                />
                {!editingValue && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {th ? 'ใช้สร้าง slug อัตโนมัติ — แก้ภายหลังไม่ได้' : 'Used to generate the slug — cannot be changed later'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ลำดับ' : 'Sort Order'}</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">
                {th ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50"
              >
                {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
