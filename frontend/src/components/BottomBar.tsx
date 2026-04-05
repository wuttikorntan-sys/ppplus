'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Home, ShoppingBag, Palette, Newspaper, User, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart';

export default function BottomBar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { totalItems, setIsOpen } = useCart();

  const navItems = [
    { href: '/' as const, label: t('home'), icon: Home },
    { href: '/menu' as const, label: t('menu'), icon: ShoppingBag },
    { href: '/color-matching' as const, label: t('color_matching'), icon: Palette },
    { href: '/blog' as const, label: t('blog'), icon: Newspaper },
    { href: '/contact' as const, label: t('contact'), icon: User },
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind bottom bar on mobile */}
      <div className="h-16 lg:hidden" />

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Background with blur */}
        <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          {/* Safe area for iPhone notch/home bar */}
          <div className="flex items-center justify-around px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center min-w-[3.5rem] py-1 px-1.5 rounded-xl transition-colors ${
                    isActive
                      ? 'text-[#F5841F]'
                      : 'text-gray-500 dark:text-gray-400 active:text-[#F5841F]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Cart button */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center justify-center min-w-[3.5rem] py-1 px-1.5 rounded-xl transition-colors text-gray-500 dark:text-gray-400 active:text-[#F5841F] relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 bg-[#F5841F] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
              <span className="text-[10px] mt-0.5 leading-tight font-medium">
                {t('quote')}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
