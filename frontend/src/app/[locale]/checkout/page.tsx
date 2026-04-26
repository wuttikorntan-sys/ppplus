'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle, Phone, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Truck, Store } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

type PaymentMethod = 'transfer' | 'cod' | 'pickup';

const paymentOptions: {
  value: PaymentMethod;
  labelTh: string;
  labelEn: string;
  descTh: string;
  descEn: string;
  icon: typeof CreditCard;
}[] = [
  { value: 'transfer', labelTh: 'โอนเงินผ่านธนาคาร', labelEn: 'Bank Transfer', descTh: 'แอดมินจะส่งเลขบัญชีให้ทาง LINE/อีเมล', descEn: 'Admin will send bank details via LINE/email', icon: CreditCard },
  { value: 'cod',      labelTh: 'เก็บเงินปลายทาง',     labelEn: 'Cash on Delivery', descTh: 'ชำระเงินสดเมื่อรับสินค้า', descEn: 'Pay cash when you receive your order', icon: Truck },
  { value: 'pickup',   labelTh: 'รับที่ร้าน',          labelEn: 'Pickup at Store', descTh: 'มารับสินค้าด้วยตัวเองที่ร้าน', descEn: 'Pick up your order at our store', icon: Store },
];

export default function CheckoutPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: number; total: number } | null>(null);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error(th ? 'กรุณากรอกชื่อและเบอร์โทร' : 'Please fill in name and phone');
      return;
    }
    if (paymentMethod !== 'pickup' && !form.address.trim()) {
      toast.error(th ? 'กรุณากรอกที่อยู่จัดส่ง' : 'Please fill in delivery address');
      return;
    }
    if (items.length === 0) {
      toast.error(th ? 'ตะกร้าว่างเปล่า' : 'Cart is empty');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<{ success: boolean; data: { id: number; totalAmount: string } }>('/orders', {
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || null,
        customerAddress: form.address || null,
        notes: form.notes || null,
        paymentMethod,
        items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
      });
      setSubmitted({ id: res.data.id, total: Number(res.data.totalAmount) });
      clearCart();
      toast.success(th ? 'สั่งซื้อสำเร็จ' : 'Order placed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <div className="bg-[#1C1C1E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'ชำระเงิน' : 'Checkout'}
          </h1>
          <p className="text-white/70">{th ? 'กรอกข้อมูลเพื่อสั่งซื้อสินค้า' : 'Fill in your details to place an order'}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-lg mx-auto">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">{th ? 'สั่งซื้อสำเร็จ!' : 'Order Placed!'}</h2>
            <p className="text-gray-600 mb-1">
              {th ? 'หมายเลขออเดอร์: ' : 'Order #'}<span className="font-bold text-[#1C1C1E]">#{submitted.id}</span>
            </p>
            <p className="text-gray-600 mb-6">
              {th ? 'ยอดรวม: ' : 'Total: '}<span className="font-bold text-[#F5841F]">฿{submitted.total.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {th ? 'ทีมงานจะติดต่อกลับเพื่อยืนยันรายละเอียด' : 'Our team will contact you to confirm details.'}
            </p>
            <div className="flex items-center justify-center gap-2 text-[#1C1C1E] mb-6">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">{th ? 'หรือโทร: 02-XXX-XXXX' : 'Or call: 02-XXX-XXXX'}</span>
            </div>
            <Link href="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1C1E] text-white rounded-xl font-medium hover:bg-[#1C1C1E]/90 transition">
              <ArrowLeft className="w-4 h-4" /> {th ? 'เลือกสินค้าเพิ่ม' : 'Continue Shopping'}
            </Link>
          </motion.div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-lg mx-auto">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-6">{th ? 'ตะกร้าว่างเปล่า' : 'Your cart is empty'}</p>
            <Link href="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1C1E] text-white rounded-xl font-medium hover:bg-[#1C1C1E]/90 transition">
              <ArrowLeft className="w-4 h-4" /> {th ? 'ไปหน้าสินค้า' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-[#F5841F]" />
                <h2 className="text-lg font-bold text-[#1C1C1E]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {th ? 'รายการสินค้า' : 'Cart Items'}
                </h2>
                <span className="bg-[#F5841F]/10 text-[#F5841F] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {items.length} {th ? 'รายการ' : 'items'}
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&h=200&fit=crop'}
                        alt={th ? item.nameTh : item.nameEn}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1C1C1E] line-clamp-1">{th ? item.nameTh : item.nameEn}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                            {item.brand && <span>{item.brand}</span>}
                            {item.size && <span>· {item.size}</span>}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-gray-300 hover:text-red-500 transition shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-bold text-[#F5841F]">฿{Number(item.price).toLocaleString()}</p>
                        <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg border border-gray-200">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-100 rounded-l-lg transition">
                            <Minus className="w-3 h-3 text-gray-500" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 rounded-r-lg transition">
                            <Plus className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/menu" className="text-sm text-[#F5841F] font-medium hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> {th ? 'เพิ่มสินค้า' : 'Add more'}
              </Link>
            </div>

            {/* Customer Info + Payment + Total */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                <h2 className="text-base font-bold text-[#1C1C1E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {th ? 'ข้อมูลผู้สั่งซื้อ' : 'Customer Info'}
                </h2>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={th ? 'ชื่อ-นามสกุล *' : 'Full name *'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm"
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={th ? 'เบอร์โทรศัพท์ *' : 'Phone number *'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={th ? 'อีเมล (ไม่บังคับ)' : 'Email (optional)'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm"
                />
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder={
                    paymentMethod === 'pickup'
                      ? (th ? 'ที่อยู่ (ไม่บังคับ — รับที่ร้าน)' : 'Address (optional — store pickup)')
                      : (th ? 'ที่อยู่จัดส่ง *' : 'Delivery address *')
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none"
                />
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={th ? 'หมายเหตุ (ไม่บังคับ)' : 'Notes (optional)'}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm resize-none"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                <h2 className="text-base font-bold text-[#1C1C1E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {th ? 'วิธีการชำระเงิน' : 'Payment Method'}
                </h2>
                <div className="space-y-2">
                  {paymentOptions.map((opt) => {
                    const active = paymentMethod === opt.value;
                    const Icon = opt.icon;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          active
                            ? 'border-[#F5841F] bg-[#F5841F]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={opt.value}
                          checked={active}
                          onChange={() => setPaymentMethod(opt.value)}
                          className="mt-1 w-4 h-4 text-[#F5841F] focus:ring-[#F5841F]"
                        />
                        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${active ? 'text-[#F5841F]' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1C1C1E]">{th ? opt.labelTh : opt.labelEn}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{th ? opt.descTh : opt.descEn}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">{th ? 'ยอดรวม' : 'Total'}</span>
                  <span className="text-2xl font-bold text-[#1C1C1E]">฿{total.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-4">
                  {th ? '* ราคาอาจปรับตามโปรโมชั่นและค่าจัดส่ง' : '* Final price may vary with promotions and shipping'}
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-[#F5841F] text-white rounded-xl font-semibold hover:bg-[#F5841F]/90 active:scale-[0.98] transition disabled:opacity-50 text-sm shadow-lg shadow-[#F5841F]/20"
                >
                  {saving ? (th ? 'กำลังส่งคำสั่งซื้อ...' : 'Placing order...') : (th ? 'ยืนยันสั่งซื้อ' : 'Place Order')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
