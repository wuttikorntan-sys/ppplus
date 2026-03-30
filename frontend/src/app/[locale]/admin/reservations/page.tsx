'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Reservation {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function AdminReservationsPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchReservations = () => {
    const q = filterStatus ? `?status=${filterStatus}` : '';
    api.get<{ success: boolean; data: Reservation[] }>(`/admin/reservations${q}`)
      .then((r) => setReservations(r.data))
      .catch(() => {});
  };

  useEffect(() => { fetchReservations(); }, [filterStatus]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/reservations/${id}`, { status });
      toast.success(th ? 'อัปเดตสถานะเรียบร้อย' : 'Status updated');
      fetchReservations();
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'จัดการการจอง' : 'Reservation Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{reservations.length} {th ? 'รายการ' : 'reservations'}</p>
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#1E3A5F]">
          <option value="">{th ? 'ทุกสถานะ' : 'All Status'}</option>
          <option value="PENDING">{th ? 'รอยืนยัน' : 'Pending'}</option>
          <option value="CONFIRMED">{th ? 'ยืนยันแล้ว' : 'Confirmed'}</option>
          <option value="CANCELLED">{th ? 'ยกเลิก' : 'Cancelled'}</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ชื่อ' : 'Name'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'วันที่' : 'Date'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'เวลา' : 'Time'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จำนวน' : 'Guests'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'ติดต่อ' : 'Contact'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'สถานะ' : 'Status'}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 text-gray-400">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(r.date).toLocaleDateString(locale)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.time}</td>
                  <td className="px-4 py-3 text-gray-600">{r.guests} {th ? 'ท่าน' : ''}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-600 text-xs">{r.phone}</p>
                    <p className="text-gray-400 text-xs">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.status === 'PENDING' ? (th ? 'รอยืนยัน' : 'Pending') : r.status === 'CONFIRMED' ? (th ? 'ยืนยัน' : 'Confirmed') : (th ? 'ยกเลิก' : 'Cancelled')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => updateStatus(r.id, 'CONFIRMED')} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition">
                          {th ? 'ยืนยัน' : 'Confirm'}
                        </button>
                        <button onClick={() => updateStatus(r.id, 'CANCELLED')} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                          {th ? 'ยกเลิก' : 'Cancel'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">{th ? 'ยังไม่มีการจอง' : 'No reservations'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
