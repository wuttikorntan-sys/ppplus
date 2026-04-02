'use client';

import { useCart } from '@/lib/cart';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ShoppingCart, X, Plus, Minus, Trash2, FileText } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, isOpen, setIsOpen } = useCart();
  const locale = useLocale();
  const th = locale === 'th';

  return (
    <>
      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-5 h-5 text-[#F5841F]" />
                  <h2 className="text-lg font-bold text-[#1C1C1E]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {th ? 'ตะกร้าขอราคา' : 'Quote Cart'}
                  </h2>
                  {totalItems > 0 && (
                    <span className="bg-[#F5841F]/10 text-[#F5841F] text-xs font-semibold px-2 py-0.5 rounded-full">
                      {totalItems} {th ? 'รายการ' : 'items'}
                    </span>
                  )}
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium">{th ? 'ยังไม่มีสินค้าในตะกร้า' : 'Your cart is empty'}</p>
                    <p className="text-gray-300 text-sm mt-1">{th ? 'เพิ่มสินค้าจากหน้าสินค้า' : 'Add products from the products page'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                          <Image
                            src={item.image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&h=200&fit=crop'}
                            alt={th ? item.nameTh : item.nameEn}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1C1C1E] line-clamp-2 leading-snug">{th ? item.nameTh : item.nameEn}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                            {item.brand && <span>{item.brand}</span>}
                            {item.size && <span>· {item.size}</span>}
                          </div>
                          <p className="text-sm font-bold text-[#F5841F] mt-1">฿{Number(item.price).toLocaleString()}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50 rounded-l-lg transition">
                                <Minus className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-[#1C1C1E]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50 rounded-r-lg transition">
                                <Plus className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{th ? 'ราคารวมโดยประมาณ' : 'Estimated Total'}</span>
                    <span className="text-lg font-bold text-[#1C1C1E]">
                      ฿{items.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href="/quote"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#F5841F] text-white rounded-xl font-semibold hover:bg-[#F5841F]/90 transition text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    {th ? 'ขอใบเสนอราคา' : 'Request a Quote'}
                  </Link>
                  <p className="text-[10px] text-gray-400 text-center">{th ? '* ราคาอาจเปลี่ยนแปลงตามปริมาณและโปรโมชั่น' : '* Prices may vary based on quantity and promotions'}</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
