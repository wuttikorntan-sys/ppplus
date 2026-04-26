'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, FileText, CreditCard, Truck, Store } from 'lucide-react';
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
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  notes: string | null;
  paymentMethod: string | null;
  createdAt: string;
  user?: { name: string; email: string } | null;
  items: OrderItem[];
  payment?: { method: string; status: string };
}

const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

const statusLabels: Record<string, { th: string; en: string; color: string }> = {
  PENDING:   { th: 'รอยืนยัน',     en: 'Pending',     color: 'bg-amber-50 text-amber-700' },
  CONFIRMED: { th: 'ยืนยันแล้ว',    en: 'Confirmed',   color: 'bg-blue-50 text-blue-700' },
  PREPARING: { th: 'กำลังจัดเตรียม', en: 'Packing',     color: 'bg-purple-50 text-purple-700' },
  READY:     { th: 'พร้อมจัดส่ง',   en: 'Ready',       color: 'bg-cyan-50 text-cyan-700' },
  DELIVERED: { th: 'จัดส่งแล้ว',    en: 'Delivered',   color: 'bg-green-50 text-green-700' },
  CANCELLED: { th: 'ยกเลิก',       en: 'Cancelled',   color: 'bg-red-50 text-red-700' },
};

const paymentLabels: Record<string, { th: string; en: string; icon: typeof CreditCard }> = {
  transfer: { th: 'โอนเงิน',         en: 'Bank Transfer',     icon: CreditCard },
  cod:      { th: 'เก็บเงินปลายทาง', en: 'Cash on Delivery',  icon: Truck },
  pickup:   { th: 'รับที่ร้าน',      en: 'Store Pickup',      icon: Store },
};

export default function AdminOrdersPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const q = filterStatus ? `?status=${filterStatus}` : '';
    api.get<{ success: boolean; data: Order[] }>(`/admin/orders${q}`)
      .then((r) => setOrders(r.data))
      .catch(() => toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/orders/${id}`, { status });
      toast.success(th ? 'อัปเดตสถานะเรียบร้อย' : 'Status updated');
      fetchOrders();
    } catch {
      toast.error(th ? 'อัปเดตไม่สำเร็จ' : 'Failed to update');
    }
  };

  const customerOf = (o: Order): { name: string; phone: string | null; email: string | null } => {
    if (o.customerName) {
      return { name: o.customerName, phone: o.customerPhone, email: o.customerEmail };
    }
    if (o.user) {
      return { name: o.user.name, phone: null, email: o.user.email };
    }
    return { name: th ? '(ไม่ระบุชื่อ)' : '(no name)', phone: null, email: null };
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
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#1C1C1E]">
          <option value="">{th ? 'ทุกสถานะ' : 'All Status'}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{th ? statusLabels[s]?.th : statusLabels[s]?.en}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && orders.map((order) => {
          const cust = customerOf(order);
          const status = statusLabels[order.status] || { th: order.status, en: order.status, color: 'bg-gray-100 text-gray-600' };
          const payKey = (order.paymentMethod || order.payment?.method || '').toLowerCase();
          const pay = paymentLabels[payKey];
          const PayIcon = pay?.icon;
          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">#{order.id}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                      {th ? status.th : status.en}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{order.orderType}</span>
                    {pay && PayIcon && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        <PayIcon className="w-3 h-3" />
                        {th ? pay.th : pay.en}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString(locale)}
                  </p>
                </div>
                <p className="text-lg font-bold text-[#1C1C1E] shrink-0">฿{Number(order.totalAmount).toLocaleString()}</p>
              </div>

              {/* Customer block */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                <p className="font-semibold text-gray-900 mb-1">{cust.name}</p>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                  {cust.phone && (
                    <a href={`tel:${cust.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#1C1C1E]">
                      <Phone className="w-3 h-3" /> {cust.phone}
                    </a>
                  )}
                  {cust.email && (
                    <a href={`mailto:${cust.email}`} className="inline-flex items-center gap-1.5 hover:text-[#1C1C1E] truncate">
                      <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{cust.email}</span>
                    </a>
                  )}
                  {order.customerAddress && (
                    <span className="inline-flex items-start gap-1.5 sm:col-span-2">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> <span className="whitespace-pre-wrap">{order.customerAddress}</span>
                    </span>
                  )}
                  {order.notes && (
                    <span className="inline-flex items-start gap-1.5 sm:col-span-2 text-gray-500">
                      <FileText className="w-3 h-3 mt-0.5 shrink-0" /> <span className="whitespace-pre-wrap italic">{order.notes}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{th ? item.menuItem.nameTh : item.menuItem.nameEn} × {item.quantity}</span>
                    <span className="text-gray-500">฿{(Number(item.price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="flex flex-wrap gap-2">
                  {order.status === 'PENDING' && (
                    <button onClick={() => updateStatus(order.id, 'CONFIRMED')} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                      {th ? 'ยืนยันออเดอร์' : 'Confirm'}
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button onClick={() => updateStatus(order.id, 'PREPARING')} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition">
                      {th ? 'กำลังจัดเตรียม' : 'Mark Packing'}
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button onClick={() => updateStatus(order.id, 'READY')} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-medium hover:bg-cyan-100 transition">
                      {th ? 'พร้อมจัดส่ง' : 'Mark Ready'}
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button onClick={() => updateStatus(order.id, 'DELIVERED')} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition">
                      {th ? 'จัดส่งแล้ว' : 'Mark Delivered'}
                    </button>
                  )}
                  <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition ml-auto">
                    {th ? 'ยกเลิก' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">{th ? 'ยังไม่มีออเดอร์' : 'No orders'}</div>
        )}
      </div>
    </div>
  );
}
