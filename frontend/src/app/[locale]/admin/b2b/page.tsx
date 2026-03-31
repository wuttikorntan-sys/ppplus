'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Building2, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface B2bApplication {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: string;
  province: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: { th: string; en: string }; color: string; icon: typeof AlertCircle }> = {
  pending: { label: { th: 'รอตรวจสอบ', en: 'Pending' }, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  approved: { label: { th: 'อนุมัติ', en: 'Approved' }, color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  rejected: { label: { th: 'ปฏิเสธ', en: 'Rejected' }, color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

const businessTypeLabels: Record<string, { th: string; en: string }> = {
  body_shop: { th: 'อู่สีรถยนต์', en: 'Body Shop' },
  dealer: { th: 'ตัวแทนจำหน่าย', en: 'Dealer' },
  parts_store: { th: 'ร้านอะไหล่/ร้านสี', en: 'Parts / Paint Store' },
  fleet: { th: 'ศูนย์ดูแลรถ/Fleet', en: 'Fleet / Service Center' },
  other: { th: 'อื่นๆ', en: 'Other' },
};

export default function AdminB2BPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [applications, setApplications] = useState<B2bApplication[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedApp, setSelectedApp] = useState<B2bApplication | null>(null);

  const fetchApplications = () => {
    api.get<{ success: boolean; data: B2bApplication[] }>('/admin/b2b')
      .then((r) => setApplications(r.data))
      .catch(() => {});
  };

  useEffect(() => { fetchApplications(); }, []);

  const filtered = applications.filter((app) => {
    const matchSearch = !search || app.companyName.toLowerCase().includes(search.toLowerCase())
      || app.contactPerson.toLowerCase().includes(search.toLowerCase())
      || app.email.toLowerCase().includes(search.toLowerCase())
      || app.phone.includes(search);
    const matchStatus = !filterStatus || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/b2b/${id}`, { status });
      toast.success(th ? 'อัปเดตสถานะเรียบร้อย' : 'Status updated');
      fetchApplications();
      if (selectedApp?.id === id) {
        setSelectedApp((prev) => prev ? { ...prev, status: status as B2bApplication['status'] } : null);
      }
    } catch {
      toast.error(th ? 'เกิดข้อผิดพลาด' : 'Error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(th ? 'th-TH' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getBusinessTypeLabel = (type: string) => {
    const bt = businessTypeLabels[type];
    return bt ? (th ? bt.th : bt.en) : type;
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'จัดการตัวแทนจำหน่าย' : 'B2B Applications'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} {th ? 'ใบสมัคร' : 'applications'}
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {pendingCount} {th ? 'รอตรวจสอบ' : 'pending'}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={th ? 'ค้นหาบริษัท, ชื่อ, อีเมล, เบอร์โทร...' : 'Search company, name, email, phone...'}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none transition text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none text-sm min-w-[160px]">
          <option value="">{th ? 'ทุกสถานะ' : 'All Status'}</option>
          <option value="pending">{th ? 'รอตรวจสอบ' : 'Pending'}</option>
          <option value="approved">{th ? 'อนุมัติ' : 'Approved'}</option>
          <option value="rejected">{th ? 'ปฏิเสธ' : 'Rejected'}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'บริษัท' : 'Company'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ผู้ติดต่อ' : 'Contact'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ประเภท' : 'Type'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จังหวัด' : 'Province'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'สถานะ' : 'Status'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'วันที่' : 'Date'}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((app) => {
                const sc = statusConfig[app.status];
                const StatusIcon = sc.icon;
                return (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{app.companyName}</p>
                      <p className="text-xs text-gray-400">{app.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{app.contactPerson}</p>
                      <p className="text-xs text-gray-400">{app.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{getBusinessTypeLabel(app.businessType)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{app.province || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {th ? sc.label.th : sc.label.en}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(app.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedApp(app)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title={th ? 'ดูรายละเอียด' : 'View Details'}>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'approved')}
                              className="p-1.5 hover:bg-green-50 rounded-lg transition" title={th ? 'อนุมัติ' : 'Approve'}>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </button>
                            <button onClick={() => updateStatus(app.id, 'rejected')}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition" title={th ? 'ปฏิเสธ' : 'Reject'}>
                              <XCircle className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">{th ? 'ไม่พบใบสมัคร' : 'No applications found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {th ? 'รายละเอียดใบสมัคร' : 'Application Details'}
              </h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Status */}
              {(() => {
                const sc = statusConfig[selectedApp.status];
                const StatusIcon = sc.icon;
                return (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${sc.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {th ? sc.label.th : sc.label.en}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Building2 className="w-3.5 h-3.5" /> {th ? 'บริษัท / อู่' : 'Company'}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedApp.companyName}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Building2 className="w-3.5 h-3.5" /> {th ? 'ประเภทธุรกิจ' : 'Business Type'}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{getBusinessTypeLabel(selectedApp.businessType)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Building2 className="w-3.5 h-3.5" /> {th ? 'ผู้ติดต่อ' : 'Contact Person'}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedApp.contactPerson}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Phone className="w-3.5 h-3.5" /> {th ? 'เบอร์โทร' : 'Phone'}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedApp.phone}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Mail className="w-3.5 h-3.5" /> {th ? 'อีเมล' : 'Email'}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedApp.email}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> {th ? 'จังหวัด' : 'Province'}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedApp.province || '-'}</p>
                </div>
              </div>

              {selectedApp.message && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">{th ? 'ข้อความเพิ่มเติม' : 'Message'}</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-line">{selectedApp.message}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" /> {th ? 'สมัครเมื่อ' : 'Applied'}: {formatDate(selectedApp.createdAt)}
              </div>

              {/* Action Buttons */}
              {selectedApp.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => { updateStatus(selectedApp.id, 'approved'); setSelectedApp(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                    <CheckCircle className="w-4 h-4" /> {th ? 'อนุมัติ' : 'Approve'}
                  </button>
                  <button onClick={() => { updateStatus(selectedApp.id, 'rejected'); setSelectedApp(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition">
                    <XCircle className="w-4 h-4" /> {th ? 'ปฏิเสธ' : 'Reject'}
                  </button>
                </div>
              )}
              {selectedApp.status !== 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => { updateStatus(selectedApp.id, 'pending'); setSelectedApp(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition">
                    <AlertCircle className="w-4 h-4" /> {th ? 'กลับเป็นรอตรวจสอบ' : 'Set Pending'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
