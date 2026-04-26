'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Phone, Mail, Building2, Package, Clock, FileText, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

interface QuoteRequest {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  productId: number | null;
  productName: string | null;
  quantity: string | null;
  message: string | null;
  status: 'pending' | 'quoted' | 'closed';
  createdAt: string;
}

const statusConfig: Record<string, { label: { th: string; en: string }; color: string; icon: typeof AlertCircle }> = {
  pending: { label: { th: 'รอเสนอราคา',  en: 'Pending' }, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  quoted:  { label: { th: 'เสนอราคาแล้ว', en: 'Quoted' },  color: 'bg-blue-50 text-blue-700 border-blue-200',   icon: CheckCircle },
  closed:  { label: { th: 'ปิดแล้ว',     en: 'Closed' },  color: 'bg-gray-100 text-gray-500 border-gray-200',   icon: XCircle },
};

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  company: '',
  productName: '',
  quantity: '',
  message: '',
  status: 'pending' as 'pending' | 'quoted' | 'closed',
};

export default function AdminQuotesPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const confirm = useConfirm();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchQuotes = () => {
    setLoading(true);
    api.get<{ success: boolean; data: QuoteRequest[] }>('/admin/quotes')
      .then((r) => setQuotes(r.data))
      .catch(() => toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuotes(); }, []);

  const filtered = quotes.filter((q) => {
    const matchSearch = !search || q.name.toLowerCase().includes(search.toLowerCase())
      || q.phone.includes(search)
      || (q.email && q.email.toLowerCase().includes(search.toLowerCase()))
      || (q.company && q.company.toLowerCase().includes(search.toLowerCase()))
      || (q.productName && q.productName.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !filterStatus || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/quotes/${id}`, { status });
      toast.success(th ? 'อัปเดตสถานะเรียบร้อย' : 'Status updated');
      fetchQuotes();
      if (selectedQuote?.id === id) setSelectedQuote((prev) => prev ? { ...prev, status: status as QuoteRequest['status'] } : null);
    } catch { toast.error(th ? 'เกิดข้อผิดพลาด' : 'Error'); }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (q: QuoteRequest) => {
    setEditingId(q.id);
    setForm({
      name: q.name,
      phone: q.phone,
      email: q.email || '',
      company: q.company || '',
      productName: q.productName || '',
      quantity: q.quantity || '',
      message: q.message || '',
      status: q.status,
    });
    setSelectedQuote(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error(th ? 'กรุณากรอกชื่อและเบอร์โทร' : 'Please fill name and phone');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        company: form.company.trim() || null,
        productName: form.productName.trim() || null,
        quantity: form.quantity.trim() || null,
        message: form.message.trim() || null,
        status: form.status,
      };
      if (editingId) {
        await api.put(`/admin/quotes/${editingId}`, payload);
        toast.success(th ? 'อัปเดตเรียบร้อย' : 'Updated');
      } else {
        await api.post('/admin/quotes', payload);
        toast.success(th ? 'เพิ่มเรียบร้อย' : 'Created');
      }
      setShowForm(false);
      fetchQuotes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (th ? 'บันทึกไม่สำเร็จ' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q: QuoteRequest) => {
    const ok = await confirm({
      title: th ? 'ยืนยันการลบ' : 'Confirm delete',
      message: th
        ? `ต้องการลบใบขอราคาของ "${q.name}" ใช่หรือไม่?`
        : `Delete quote request from "${q.name}"?`,
      confirmText: th ? 'ลบ' : 'Delete',
      cancelText: th ? 'ยกเลิก' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/quotes/${q.id}`);
      toast.success(th ? 'ลบเรียบร้อย' : 'Deleted');
      if (selectedQuote?.id === q.id) setSelectedQuote(null);
      fetchQuotes();
    } catch {
      toast.error(th ? 'ลบไม่สำเร็จ' : 'Failed to delete');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(th ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const pendingCount = quotes.filter((q) => q.status === 'pending').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'ใบขอเสนอราคา' : 'Quote Requests'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} {th ? 'รายการ' : 'requests'}
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {pendingCount} {th ? 'รอเสนอราคา' : 'pending'}
              </span>
            )}
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg font-medium hover:bg-[#1C1C1E]/90 transition text-sm shadow-sm">
          <Plus className="w-4 h-4" /> {th ? 'เพิ่มใบขอราคา' : 'Add Quote'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={th ? 'ค้นหาชื่อ, เบอร์, อีเมล, สินค้า...' : 'Search name, phone, email, product...'} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none transition text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none text-sm min-w-[160px]">
          <option value="">{th ? 'ทุกสถานะ' : 'All Status'}</option>
          <option value="pending">{th ? 'รอเสนอราคา' : 'Pending'}</option>
          <option value="quoted">{th ? 'เสนอราคาแล้ว' : 'Quoted'}</option>
          <option value="closed">{th ? 'ปิดแล้ว' : 'Closed'}</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ชื่อ' : 'Name'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ติดต่อ' : 'Contact'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'สินค้า' : 'Product'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จำนวน' : 'Qty'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'สถานะ' : 'Status'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'วันที่' : 'Date'}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <div className="w-6 h-6 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              )}
              {!loading && filtered.map((q) => {
                const sc = statusConfig[q.status];
                const StatusIcon = sc.icon;
                return (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{q.name}</p>
                      {q.company && <p className="text-xs text-gray-400">{q.company}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-xs">{q.phone}</p>
                      {q.email && <p className="text-xs text-gray-400">{q.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{q.productName || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{q.quantity || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" /> {th ? sc.label.th : sc.label.en}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(q.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedQuote(q)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title={th ? 'ดูรายละเอียด' : 'View'}>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => openEdit(q)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title={th ? 'แก้ไข' : 'Edit'}>
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(q)} className="p-1.5 hover:bg-red-50 rounded-lg transition" title={th ? 'ลบ' : 'Delete'}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">{th ? 'ไม่พบใบขอเสนอราคา' : 'No quote requests'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedQuote(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {th ? 'รายละเอียดใบขอราคา' : 'Quote Details'}
              </h2>
              <button onClick={() => setSelectedQuote(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {(() => { const sc = statusConfig[selectedQuote.status]; const SI = sc.icon; return (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${sc.color}`}><SI className="w-4 h-4" /> {th ? sc.label.th : sc.label.en}</div>
              ); })()}
              <div className="grid grid-cols-2 gap-4">
                <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Building2 className="w-3.5 h-3.5" /> {th ? 'ชื่อ' : 'Name'}</div><p className="text-sm font-medium text-gray-900">{selectedQuote.name}</p></div>
                <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Building2 className="w-3.5 h-3.5" /> {th ? 'บริษัท' : 'Company'}</div><p className="text-sm font-medium text-gray-900">{selectedQuote.company || '-'}</p></div>
                <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Phone className="w-3.5 h-3.5" /> {th ? 'เบอร์โทร' : 'Phone'}</div><p className="text-sm font-medium text-gray-900">{selectedQuote.phone}</p></div>
                <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Mail className="w-3.5 h-3.5" /> {th ? 'อีเมล' : 'Email'}</div><p className="text-sm font-medium text-gray-900">{selectedQuote.email || '-'}</p></div>
                <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Package className="w-3.5 h-3.5" /> {th ? 'สินค้า' : 'Product'}</div><p className="text-sm font-medium text-gray-900">{selectedQuote.productName || '-'}</p></div>
                <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><FileText className="w-3.5 h-3.5" /> {th ? 'จำนวน' : 'Quantity'}</div><p className="text-sm font-medium text-gray-900">{selectedQuote.quantity || '-'}</p></div>
              </div>
              {selectedQuote.message && (
                <div><p className="text-xs text-gray-400 mb-1">{th ? 'ข้อความ' : 'Message'}</p><p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-line">{selectedQuote.message}</p></div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400"><Clock className="w-3.5 h-3.5" /> {formatDate(selectedQuote.createdAt)}</div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => openEdit(selectedQuote)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                  <Edit className="w-4 h-4" /> {th ? 'แก้ไข' : 'Edit'}
                </button>
                <button onClick={() => handleDelete(selectedQuote)} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition">
                  <Trash2 className="w-4 h-4" /> {th ? 'ลบ' : 'Delete'}
                </button>
                <div className="ml-auto flex gap-2">
                  {selectedQuote.status === 'pending' && (
                    <button onClick={() => { updateStatus(selectedQuote.id, 'quoted'); setSelectedQuote(null); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                      <CheckCircle className="w-4 h-4" /> {th ? 'เสนอราคาแล้ว' : 'Mark Quoted'}
                    </button>
                  )}
                  {selectedQuote.status !== 'closed' && (
                    <button onClick={() => { updateStatus(selectedQuote.id, 'closed'); setSelectedQuote(null); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                      <XCircle className="w-4 h-4" /> {th ? 'ปิด' : 'Close'}
                    </button>
                  )}
                  {selectedQuote.status === 'closed' && (
                    <button onClick={() => { updateStatus(selectedQuote.id, 'pending'); setSelectedQuote(null); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition">
                      <AlertCircle className="w-4 h-4" /> {th ? 'เปิดใหม่' : 'Reopen'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Form Modal — Create / Edit */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingId ? (th ? 'แก้ไขใบขอราคา' : 'Edit Quote') : (th ? 'เพิ่มใบขอราคาใหม่' : 'New Quote')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ' : 'Name'} *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'บริษัท' : 'Company'}</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'เบอร์โทร' : 'Phone'} *</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'อีเมล' : 'Email'}</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อสินค้า' : 'Product Name'}</label>
                  <input type="text" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'จำนวน' : 'Quantity'}</label>
                  <input type="text" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder={th ? 'เช่น 4 ลิตร, 2 กระป๋อง' : 'e.g. 4L, 2 cans'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ข้อความ' : 'Message'}</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'สถานะ' : 'Status'}</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'pending' | 'quoted' | 'closed' })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm">
                  <option value="pending">{th ? 'รอเสนอราคา' : 'Pending'}</option>
                  <option value="quoted">{th ? 'เสนอราคาแล้ว' : 'Quoted'}</option>
                  <option value="closed">{th ? 'ปิดแล้ว' : 'Closed'}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">
                {th ? 'ยกเลิก' : 'Cancel'}
              </button>
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
