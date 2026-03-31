'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, FileDown, GripVertical } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface B2bDocument {
  id: number;
  nameTh: string;
  nameEn: string;
  filePath: string;
  fileSize: string;
  fileType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const emptyForm: { nameTh: string; nameEn: string; sortOrder: string; isActive: boolean } = {
  nameTh: '', nameEn: '', sortOrder: '0', isActive: true,
};

export default function AdminB2bDocumentsPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [docs, setDocs] = useState<B2bDocument[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res: any = await api.get('/admin/b2b-documents');
      setDocs(res.data || []);
    } catch { toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setShowForm(true);
  };

  const openEdit = (doc: B2bDocument) => {
    setEditingId(doc.id);
    setForm({ nameTh: doc.nameTh, nameEn: doc.nameEn, sortOrder: doc.sortOrder.toString(), isActive: doc.isActive });
    setFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nameTh || !form.nameEn) {
      toast.error(th ? 'กรุณากรอกชื่อให้ครบ' : 'Please fill in both names');
      return;
    }
    if (!editingId && !file) {
      toast.error(th ? 'กรุณาเลือกไฟล์' : 'Please select a file');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nameTh', form.nameTh);
      fd.append('nameEn', form.nameEn);
      fd.append('sortOrder', form.sortOrder);
      if (form.isActive) fd.append('isActive', '1');
      if (file) fd.append('file', file);

      if (editingId) {
        await api.upload(`/admin/b2b-documents/${editingId}`, fd, 'PUT');
      } else {
        await api.upload('/admin/b2b-documents', fd);
      }
      toast.success(th ? 'บันทึกสำเร็จ' : 'Saved');
      setShowForm(false);
      load();
    } catch {
      toast.error(th ? 'บันทึกไม่สำเร็จ' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(th ? 'ต้องการลบเอกสารนี้?' : 'Delete this document?')) return;
    try {
      await api.delete(`/admin/b2b-documents/${id}`);
      toast.success(th ? 'ลบแล้ว' : 'Deleted');
      load();
    } catch {
      toast.error(th ? 'ลบไม่สำเร็จ' : 'Delete failed');
    }
  };

  const toggleActive = async (doc: B2bDocument) => {
    try {
      const fd = new FormData();
      fd.append('nameTh', doc.nameTh);
      fd.append('nameEn', doc.nameEn);
      fd.append('sortOrder', doc.sortOrder.toString());
      if (!doc.isActive) fd.append('isActive', '1');
      await api.upload(`/admin/b2b-documents/${doc.id}`, fd, 'PUT');
      load();
    } catch {
      toast.error(th ? 'อัปเดตไม่สำเร็จ' : 'Update failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'เอกสาร B2B' : 'B2B Documents'}
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {th ? 'จัดการเอกสารดาวน์โหลดสำหรับหน้า B2B' : 'Manage downloadable documents for the B2B page'}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-sm font-medium hover:bg-[#1E3A5F]/90 transition">
          <Plus className="w-4 h-4" />
          {th ? 'เพิ่มเอกสาร' : 'Add Document'}
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {docs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{th ? 'ยังไม่มีเอกสาร' : 'No documents yet'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">{th ? 'ชื่อ (ไทย)' : 'Name (TH)'}</th>
                <th className="px-4 py-3">{th ? 'ชื่อ (อังกฤษ)' : 'Name (EN)'}</th>
                <th className="px-4 py-3">{th ? 'ประเภท' : 'Type'}</th>
                <th className="px-4 py-3">{th ? 'ขนาด' : 'Size'}</th>
                <th className="px-4 py-3">{th ? 'สถานะ' : 'Status'}</th>
                <th className="px-4 py-3 text-right">{th ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map((doc, idx) => (
                <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-gray-400">{doc.sortOrder}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1E293B]">{doc.nameTh}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#64748B]">{doc.nameEn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">{doc.fileType}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{doc.fileSize}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(doc)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                        doc.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                      {doc.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {doc.isActive ? (th ? 'เปิด' : 'Active') : (th ? 'ปิด' : 'Hidden')}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a href={doc.filePath} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition" title={th ? 'ดูไฟล์' : 'View file'}>
                        <FileDown className="w-4 h-4" />
                      </a>
                      <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1E293B] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {editingId ? (th ? 'แก้ไขเอกสาร' : 'Edit Document') : (th ? 'เพิ่มเอกสาร' : 'Add Document')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ (ไทย)' : 'Name (Thai)'} *</label>
                <input value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                  placeholder={th ? 'แคตตาล็อกสินค้า 2026' : 'Product Catalog 2026'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ (อังกฤษ)' : 'Name (English)'} *</label>
                <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  placeholder="Product Catalog 2026"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ลำดับ' : 'Sort Order'}</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {th ? 'ไฟล์เอกสาร' : 'Document File'} {editingId ? '' : '*'}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#1E3A5F]/30 transition">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  {file ? (
                    <p className="text-sm text-[#1E293B] font-medium">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
                  ) : (
                    <p className="text-sm text-gray-400">{th ? 'คลิกเพื่อเลือกไฟล์ (PDF, Word, รูปภาพ)' : 'Click to select file (PDF, Word, Image)'}</p>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]" />
                <span className="text-sm font-medium text-gray-700">{th ? 'เปิดใช้งาน' : 'Active'}</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                {th ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/90 transition disabled:opacity-50">
                {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
