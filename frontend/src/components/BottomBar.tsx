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
    { href: '/color-matching' as const, label: 'Color', icon: Palette },
    { href: '/blog' as const, label: t('blog'), icon: Newspaper },
    { href: '/contact' as const, label: t('contact'), icon: User },
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind bottom bar on mobile */}
      <div className="h-20 lg:hidden" />

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Background with blur */}
        <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          {/* Safe area for iPhone notch/home bar */}
          <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center min-w-[4rem] py-1.5 px-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-[#F5841F]'
                      : 'text-gray-500 dark:text-gray-400 active:text-[#F5841F]'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-[11px] mt-1 leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Cart button */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center justify-center min-w-[4rem] py-1.5 px-2 rounded-xl transition-colors text-gray-500 dark:text-gray-400 active:text-[#F5841F] relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-[18px] h-[18px] bg-[#F5841F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
              <span className="text-[11px] mt-1 leading-tight font-medium">
                {t('quote')}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
