'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, GripVertical } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

interface Category {
  id: number;
  nameTh: string;
  nameEn: string;
  sortOrder: number;
  _count?: { items: number };
}

const emptyForm = { nameTh: '', nameEn: '', sortOrder: '0' };

export default function AdminCategoriesPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const confirm = useConfirm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    api.get<{ success: boolean; data: Category[] }>('/admin/categories')
      .then((r) => setCategories(r.data))
      .catch(() => toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ nameTh: cat.nameTh, nameEn: cat.nameEn, sortOrder: cat.sortOrder.toString() });
    setShowForm(true);
  };

  const handleDelete = async (cat: Category) => {
    const confirmed = await confirm({
      title: th ? 'ยืนยันการลบ' : 'Confirm delete',
      message: th
        ? `ต้องการลบหมวดหมู่ "${cat.nameTh}" ใช่หรือไม่?`
        : `Delete category "${cat.nameEn}"?`,
      confirmText: th ? 'ลบ' : 'Delete',
      cancelText: th ? 'ยกเลิก' : 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/admin/categories/${cat.id}`);
      toast.success(th ? 'ลบเรียบร้อย' : 'Deleted');
      fetchCategories();
    } catch {
      toast.error(th ? 'ไม่สามารถลบได้' : 'Failed to delete');
    }
  };

  const handleSave = async () => {
    if (!form.nameTh || !form.nameEn) {
      toast.error(th ? 'กรุณากรอกชื่อ' : 'Please fill name');
      return;
    }
    setSaving(true);
    try {
      const body = { nameTh: form.nameTh, nameEn: form.nameEn, sortOrder: parseInt(form.sortOrder) || 0 };
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, body);
        toast.success(th ? 'อัปเดตเรียบร้อย' : 'Updated');
      } else {
        await api.post('/admin/categories', body);
        toast.success(th ? 'เพิ่มเรียบร้อย' : 'Created');
      }
      setShowForm(false);
      fetchCategories();
    } catch {
      toast.error(th ? 'เกิดข้อผิดพลาด' : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'จัดการหมวดหมู่' : 'Category Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} {th ? 'หมวดหมู่' : 'categories'}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg font-medium hover:bg-[#1C1C1E]-light transition text-sm shadow-sm">
          <Plus className="w-4 h-4" /> {th ? 'เพิ่มหมวดหมู่' : 'Add Category'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide w-10">#</th>
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
            {!loading && categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition">
                <td className="px-4 py-3 text-gray-400">{cat.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{cat.nameTh}</td>
                <td className="px-4 py-3 text-gray-600">{cat.nameEn}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{cat.sortOrder}</span>
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
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">{th ? 'ยังไม่มีหมวดหมู่' : 'No categories'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingId ? (th ? 'แก้ไขหมวดหมู่' : 'Edit Category') : (th ? 'เพิ่มหมวดหมู่ใหม่' : 'New Category')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ (ไทย)' : 'Name (Thai)'} *</label>
                <input value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ (อังกฤษ)' : 'Name (English)'} *</label>
                <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ลำดับ' : 'Sort Order'}</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">{th ? 'ยกเลิก' : 'Cancel'}</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]-light transition disabled:opacity-50">
                {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
