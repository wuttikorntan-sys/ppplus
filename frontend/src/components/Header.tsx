'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Globe, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useCart } from '@/lib/cart';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const currentLocale = (params.locale as string) || 'th';
  const otherLocale = currentLocale === 'th' ? 'en' : 'th';
  const { theme } = useTheme();
  const { totalItems, setIsOpen } = useCart();

  const navLinks = [
    { href: '/' as const, label: t('home') },
    { href: '/menu' as const, label: t('menu') },
    { href: '/color-matching' as const, label: t('color_matching') },
    { href: '/b2b' as const, label: t('b2b') },
    { href: '/blog' as const, label: t('blog') },
    { href: '/about' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ];

  const switchLocale = () => {
    const newPath = `/${otherLocale}${pathname}`;
    router.push(newPath);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/LOGO1.svg" alt="PP Plus" width={44} height={44} className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl" />
            <span className="text-xl lg:text-2xl font-bold text-[#1C1C1E]" style={{ fontFamily: 'var(--font-heading)' }}>
              PP Plus
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-[#1C1C1E] bg-[#1C1C1E]/5'
                    : 'text-[#2D2D2D] hover:text-[#1C1C1E] hover:bg-[#1C1C1E]/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Dark mode toggle */}
            <ThemeToggle />

            {/* Language switcher */}
            <button
              onClick={switchLocale}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              title={`Switch to ${otherLocale === 'th' ? 'ไทย' : 'English'}`}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium text-xs">{currentLocale.toUpperCase()}</span>
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-4.5 h-4.5 text-[#2D2D2D]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#F5841F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>


          </div>
        </div>


      </div>
    </header>
  );
}
