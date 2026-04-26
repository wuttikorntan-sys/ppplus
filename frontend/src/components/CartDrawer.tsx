'use client';

import { useCart } from '@/lib/cart';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ShoppingCart, X, Plus, Minus, Trash2, FileText, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, isOpen, setIsOpen } = useCart();
  const locale = useLocale();
  const th = locale === 'th';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#23232a] z-[60] shadow-2xl flex flex-col"
          >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F5841F]/10 flex items-center justify-center">
                    <ShoppingCart className="w-[18px] h-[18px] text-[#F5841F]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1C1C1E] dark:text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                      {th ? 'ตะกร้าขอราคา' : 'Quote Cart'}
                    </h2>
                    {totalItems > 0 && (
                      <p className="text-xs text-[#F5841F] font-medium mt-0.5">
                        {totalItems} {th ? 'รายการ' : totalItems === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-400 font-medium">{th ? 'ยังไม่มีสินค้าในตะกร้า' : 'Your cart is empty'}</p>
                    <p className="text-gray-300 dark:text-gray-500 text-sm mt-1">{th ? 'เพิ่มสินค้าจากหน้าสินค้า' : 'Add products from the products page'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 bg-gray-50 dark:bg-white/5 rounded-xl p-3 group">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-white/10">
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
                              <p className="text-sm font-semibold text-[#1C1C1E] dark:text-white line-clamp-1 leading-snug">{th ? item.nameTh : item.nameEn}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                                {item.brand && <span>{item.brand}</span>}
                                {item.size && <span>· {item.size}</span>}
                              </div>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="p-1 text-gray-300 hover:text-red-500 transition shrink-0 opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm font-bold text-[#F5841F]">฿{Number(item.price).toLocaleString()}</p>
                            <div className="flex items-center gap-0.5 bg-white dark:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-l-lg transition">
                                <Minus className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold text-[#1C1C1E] dark:text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-r-lg transition">
                                <Plus className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-gray-100 dark:border-white/10 px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{th ? 'ราคารวมโดยประมาณ' : 'Estimated Total'}</span>
                    <span className="text-xl font-bold text-[#1C1C1E] dark:text-white">
                      ฿{items.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#F5841F] text-white rounded-xl font-semibold hover:bg-[#F5841F]/90 active:scale-[0.98] transition text-sm shadow-lg shadow-[#F5841F]/20"
                  >
                    <CreditCard className="w-4 h-4" />
                    {th ? 'สั่งซื้อสินค้า' : 'Place Order'}
                  </Link>
                  <Link
                    href="/quote"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-gray-200 dark:bg-white/5 dark:border-white/10 text-[#1C1C1E] dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.98] transition text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    {th ? 'ขอใบเสนอราคาแทน' : 'Request a Quote Instead'}
                  </Link>
                  <p className="text-[10px] text-gray-400 text-center">{th ? '* ราคาอาจเปลี่ยนแปลงตามปริมาณและโปรโมชั่น' : '* Prices may vary based on quantity and promotions'}</p>
                </div>
              )}
            </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
