'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  menuItem: { nameTh: string; nameEn: string };
}

interface Order {
  id: number;
  status: string;
  totalAmount: string;
  orderType: string;
  createdAt: string;
  user?: { name: string; email: string };
  items: OrderItem[];
  payment?: { method: string; status: string };
}

const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PREPARING: 'bg-purple-50 text-purple-700',
  READY: 'bg-cyan-50 text-cyan-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function AdminOrdersPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = () => {
    const q = filterStatus ? `?status=${filterStatus}` : '';
    api.get<{ success: boolean; data: Order[] }>(`/admin/orders${q}`)
      .then((r) => setOrders(r.data))
      .catch(() => {});
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/orders/${id}`, { status });
      toast.success(th ? 'อัปเดตสถานะเรียบร้อย' : 'Status updated');
      fetchOrders();
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'จัดการออเดอร์' : 'Order Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} {th ? 'รายการ' : 'orders'}</p>
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#1E3A5F]">
          <option value="">{th ? 'ทุกสถานะ' : 'All Status'}</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">#{order.id}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{order.orderType}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {order.user?.name} • {new Date(order.createdAt).toLocaleString(locale)}
                </p>
              </div>
              <p className="text-lg font-bold text-[#1E3A5F]">฿{Number(order.totalAmount).toLocaleString()}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">{th ? item.menuItem.nameTh : item.menuItem.nameEn} x{item.quantity}</span>
                  <span className="text-gray-500">฿{Number(item.price).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <div className="flex gap-2">
                {order.status === 'PENDING' && (
                  <button onClick={() => updateStatus(order.id, 'CONFIRMED')} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                    {th ? 'ยืนยัน' : 'Confirm'}
                  </button>
                )}
                {order.status === 'CONFIRMED' && (
                  <button onClick={() => updateStatus(order.id, 'PREPARING')} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition">
                    {th ? 'กำลังเตรียม' : 'Preparing'}
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button onClick={() => updateStatus(order.id, 'READY')} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-medium hover:bg-cyan-100 transition">
                    {th ? 'พร้อมส่ง' : 'Ready'}
                  </button>
                )}
                {order.status === 'READY' && (
                  <button onClick={() => updateStatus(order.id, 'DELIVERED')} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition">
                    {th ? 'ส่งแล้ว' : 'Delivered'}
                  </button>
                )}
                <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                  {th ? 'ยกเลิก' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">{th ? 'ยังไม่มีออเดอร์' : 'No orders'}</div>
        )}
      </div>
    </div>
  );
}
