'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useState } from 'react';
import { Menu, X, Globe, Sun, Moon, Car } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';

export default function Header() {
  const t = useTranslations('nav');
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const currentLocale = (params.locale as string) || 'th';
  const otherLocale = currentLocale === 'th' ? 'en' : 'th';
  const { theme, toggleTheme } = useTheme();

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
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <Car className="w-5 h-5 lg:w-6 lg:h-6 text-[#2EC4B6]" />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-heading)' }}>
              PP+
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
                    ? 'text-[#1E3A5F] bg-[#1E3A5F]/5'
                    : 'text-[#1E293B] hover:text-[#1E3A5F] hover:bg-[#1E3A5F]/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#2EC4B6]" />
              ) : (
                <Moon className="w-4 h-4 text-[#1E293B]" />
              )}
            </button>

            {/* Language switcher */}
            <button
              onClick={switchLocale}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              title={`Switch to ${otherLocale === 'th' ? 'ไทย' : 'English'}`}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium text-xs">{currentLocale.toUpperCase()}</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="lg:hidden border-t py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'text-[#1E3A5F] bg-[#1E3A5F]/5'
                    : 'text-[#1E293B] hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
