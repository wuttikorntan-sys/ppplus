'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Phone, Mail, Building2, Package, Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

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
  pending: { label: { th: 'รอเสนอราคา', en: 'Pending' }, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  quoted: { label: { th: 'เสนอราคาแล้ว', en: 'Quoted' }, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
  closed: { label: { th: 'ปิดแล้ว', en: 'Closed' }, color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle },
};

export default function AdminQuotesPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const fetchQuotes = () => {
    api.get<{ success: boolean; data: QuoteRequest[] }>('/admin/quotes')
      .then((r) => setQuotes(r.data))
      .catch(() => {});
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
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={th ? 'ค้นหาชื่อ, เบอร์, อีเมล, สินค้า...' : 'Search name, phone, email, product...'} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none transition text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none text-sm min-w-[160px]">
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
              {filtered.map((q) => {
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
                        <button onClick={() => setSelectedQuote(q)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Eye className="w-4 h-4 text-gray-400" /></button>
                        {q.status === 'pending' && (
                          <button onClick={() => updateStatus(q.id, 'quoted')} className="p-1.5 hover:bg-blue-50 rounded-lg transition" title={th ? 'เสนอราคาแล้ว' : 'Mark Quoted'}>
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                        {q.status !== 'closed' && (
                          <button onClick={() => updateStatus(q.id, 'closed')} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title={th ? 'ปิด' : 'Close'}>
                            <XCircle className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">{th ? 'ไม่พบใบขอเสนอราคา' : 'No quote requests'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedQuote(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {th ? 'รายละเอียดใบขอราคา' : 'Quote Details'}
              </h2>
              <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
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
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {selectedQuote.status === 'pending' && (
                  <button onClick={() => { updateStatus(selectedQuote.id, 'quoted'); setSelectedQuote(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    <CheckCircle className="w-4 h-4" /> {th ? 'เสนอราคาแล้ว' : 'Mark Quoted'}
                  </button>
                )}
                {selectedQuote.status !== 'closed' && (
                  <button onClick={() => { updateStatus(selectedQuote.id, 'closed'); setSelectedQuote(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                    <XCircle className="w-4 h-4" /> {th ? 'ปิด' : 'Close'}
                  </button>
                )}
                {selectedQuote.status === 'closed' && (
                  <button onClick={() => { updateStatus(selectedQuote.id, 'pending'); setSelectedQuote(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition">
                    <AlertCircle className="w-4 h-4" /> {th ? 'เปิดใหม่' : 'Reopen'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
