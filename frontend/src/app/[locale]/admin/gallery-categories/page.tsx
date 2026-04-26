'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

// Seed values used the very first time someone opens this page
// (or after migrating from the older split storage).
const seedCategories: Category[] = [
  { value: 'projects',     labelTh: 'ผลงาน',         labelEn: 'Projects',         sortOrder: 1 },
  { value: 'before_after', labelTh: 'ก่อน & หลัง',   labelEn: 'Before & After',   sortOrder: 2 },
  { value: 'shop',         labelTh: 'ร้านของเรา',    labelEn: 'Our Shop',         sortOrder: 3 },
  { value: 'color_mixing', labelTh: 'ผสมสี',         labelEn: 'Color Mixing',     sortOrder: 4 },
  { value: 'events',       labelTh: 'กิจกรรม',       labelEn: 'Events',           sortOrder: 5 },
];

const LIST_KEY = 'gallery.categories.list';
// Legacy keys — read once during migration, then ignored.
const LEGACY_CUSTOM_KEY = 'gallery.categories.custom';
const LEGACY_HIDDEN_KEY = 'gallery.categories.hiddenDefaults';

type Category = { value: string; labelTh: string; labelEn: string; sortOrder?: number };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '_').slice(0, 40) || `cat_${Date.now()}`;

const sortByOrder = (arr: Category[]) =>
  [...arr].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

const emptyForm = { labelTh: '', labelEn: '', sortOrder: '0' };

export default function AdminGalleryCategoriesPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const confirm = useConfirm();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const persist = async (next: Category[]) => {
    await api.put('/admin/site-content', [{
      key: LIST_KEY,
      valueTh: JSON.stringify(next),
      valueEn: JSON.stringify(next),
      type: 'json',
    }]);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Record<string, { th: string; en: string }> }>('/site-content');
      const raw = res.data?.[LIST_KEY]?.th || res.data?.[LIST_KEY]?.en || '';
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCategories(sortByOrder(parsed));
          setLoading(false);
          return;
        }
      }

      // First run / no data — try migrating from the old split storage
      const rawCustom = res.data?.[LEGACY_CUSTOM_KEY]?.th || res.data?.[LEGACY_CUSTOM_KEY]?.en || '';
      const rawHidden = res.data?.[LEGACY_HIDDEN_KEY]?.th || res.data?.[LEGACY_HIDDEN_KEY]?.en || '';
      const oldCustom: Category[] = rawCustom ? (JSON.parse(rawCustom) as Category[]).filter((c) => c && c.value) : [];
      const oldHidden: string[] = rawHidden
        ? (JSON.parse(rawHidden) as unknown[]).filter((v): v is string => typeof v === 'string')
        : [];
      const survivingDefaults = seedCategories.filter((c) => !oldHidden.includes(c.value));
      const startNextOrder = survivingDefaults.length;
      const customWithOrder: Category[] = oldCustom.map((c, i) => ({
        ...c,
        sortOrder: c.sortOrder ?? startNextOrder + i + 1,
      }));
      const merged = sortByOrder([...survivingDefaults, ...customWithOrder]);

      if (merged.length > 0) {
        await persist(merged);
      }
      setCategories(merged);
    } catch {
      toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openNew = () => {
    setEditingValue(null);
    setForm({
      labelTh: '',
      labelEn: '',
      sortOrder: String((categories[categories.length - 1]?.sortOrder ?? 0) + 1),
    });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
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
      let next: Category[];
      if (editingValue) {
        next = categories.map((c) =>
          c.value === editingValue ? { ...c, labelTh, labelEn, sortOrder } : c
        );
      } else {
        const value = slugify(labelEn);
        if (categories.some((c) => c.value === value)) {
          toast.error(th ? 'มีหมวดนี้อยู่แล้ว' : 'Category already exists');
          setSaving(false);
          return;
        }
        next = [...categories, { value, labelTh, labelEn, sortOrder }];
      }
      next = sortByOrder(next);
      await persist(next);
      setCategories(next);
      setShowForm(false);
      toast.success(editingValue ? (th ? 'อัปเดตเรียบร้อย' : 'Updated') : (th ? 'เพิ่มเรียบร้อย' : 'Created'));
    } catch {
      toast.error(th ? 'บันทึกไม่สำเร็จ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
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
      const next = categories.filter((c) => c.value !== cat.value);
      await persist(next);
      setCategories(next);
      toast.success(th ? 'ลบเรียบร้อย' : 'Deleted');
    } catch {
      toast.error(th ? 'ลบไม่สำเร็จ' : 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'หมวดหมู่แกลเลอรี่' : 'Gallery Categories'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {categories.length} {th ? 'หมวดหมู่' : 'categories'}
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
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ชื่อ (ไทย)' : 'Name (Thai)'}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ชื่อ (อังกฤษ)' : 'Name (English)'}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide w-24">{th ? 'ลำดับ' : 'Order'}</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide w-32">{th ? 'จัดการ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan={4} className="px-4 py-12 text-center">
                <div className="w-6 h-6 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            )}

            {!loading && categories.map((cat) => (
              <tr key={cat.value} className="hover:bg-gray-50/50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{cat.labelTh}</td>
                <td className="px-4 py-3 text-gray-600">{cat.labelEn}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{cat.sortOrder ?? 0}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="p-1.5 hover:bg-red-50 rounded-lg transition ml-1">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && categories.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm">
                {th ? 'ยังไม่มีหมวดหมู่ — กดปุ่ม "เพิ่มหมวดหมู่"' : 'No categories — click "Add Category"'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

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
