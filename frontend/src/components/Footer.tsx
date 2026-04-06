'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FaFacebookF, FaWhatsapp, FaLine, FaInstagram, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import logoPng from '../../public/logo.png';

interface ContentMap {
  [key: string]: { th: string; en: string };
}

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const contact = useTranslations('contact.info');
  const locale = useLocale();
  const lang = locale === 'th' ? 'th' : 'en';
  const [loc, setLoc] = useState<ContentMap>({});

  const [sc, setSc] = useState<ContentMap>({});

  useEffect(() => {
    api.get<{ success: boolean; data: ContentMap }>('/site-content')
      .then((res) => {
        const filtered: ContentMap = {};
        Object.entries(res.data).forEach(([key, val]) => {
          if (key.startsWith('location.') || key.startsWith('social.')) filtered[key] = val;
        });
        setLoc(filtered);
        setSc(res.data);
      })
      .catch(() => {});
  }, []);

  const v = (key: string) => loc[key]?.[lang] || '';
  const socialUrl = (key: string) => sc[key]?.th || sc[key]?.en || '';

  return (
    <footer className="relative bg-[#111111] text-white overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-[#1C1C1E] via-[#F5841F] to-[#1C1C1E]" />

      {/* ===== MOBILE: Compact Footer ===== */}
      <div className="lg:hidden px-4 py-8">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-5">
          <img src={logoPng.src} alt="PP Plus" width={40} height={40} className="w-10 h-10 rounded-xl" />
          <div>
            <span className="text-lg font-bold text-white block" style={{ fontFamily: 'var(--font-heading)' }}>PP Plus</span>
            <span className="text-[10px] text-[#F5841F] font-medium tracking-widest uppercase">Automotive Paint</span>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white/5 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#F5841F]" />
            <span className="text-xs font-semibold uppercase tracking-wider">{lang === 'th' ? 'เวลาทำการ' : 'Hours'}</span>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>{v('location.lunch') || contact('lunch')}</p>
            <p>{v('location.dinner') || contact('dinner')}</p>
          </div>
        </div>

        {/* Contact row */}
        <div className="flex items-center gap-4 mb-5 text-xs text-gray-400">
          <a href={`tel:${v('location.phone') || contact('phone')}`} className="flex items-center gap-1.5 hover:text-[#F5841F]">
            <Phone className="w-3.5 h-3.5 text-[#F5841F]" />
            <span>{v('location.phone') || contact('phone')}</span>
          </a>
        </div>

        {/* Social */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: 'social.facebook', icon: FaFacebookF, title: 'Facebook' },
            { key: 'social.whatsapp', icon: FaWhatsapp, title: 'WhatsApp' },
            { key: 'social.line', icon: FaLine, title: 'LINE' },
            { key: 'social.instagram', icon: FaInstagram, title: 'Instagram' },
            { key: 'social.tiktok', icon: FaTiktok, title: 'TikTok' },
            { key: 'social.x', icon: FaXTwitter, title: 'X' },
          ].filter((s) => socialUrl(s.key)).map((s) => {
            const Icon = s.icon;
            return (
              <a key={s.key} href={socialUrl(s.key)} target="_blank" rel="noopener noreferrer" title={s.title}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </a>
            );
          })}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-[10px] text-gray-600 text-center">
            © {new Date().getFullYear()} PP Plus. {t('rights')}.
          </p>
        </div>
      </div>

      {/* ===== DESKTOP: Full Footer ===== */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Top Section - Brand */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-10 border-b border-white/10">
          <div className="flex items-center gap-4">
            <img src={logoPng.src} alt="PP Plus" width={48} height={48} className="w-12 h-12 rounded-2xl shadow-lg shadow-[#F5841F]/10" />
            <div>
              <span className="text-2xl font-bold text-white block" style={{ fontFamily: 'var(--font-heading)' }}>
                PP Plus
              </span>
              <span className="text-xs text-[#F5841F] font-medium tracking-widest uppercase">Automotive Paint</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-4 gap-12 py-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-[#F5841F]" />
              {t('quick_links')}
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/' as const, label: nav('home') },
                { href: '/menu' as const, label: nav('menu') },
                { href: '/color-matching' as const, label: nav('color_matching') },
                { href: '/b2b' as const, label: nav('b2b') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#F5841F] text-sm transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-[#F5841F] transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-[#F5841F]" />
              {lang === 'th' ? 'เพิ่มเติม' : 'More'}
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/blog' as const, label: nav('blog') },
                { href: '/gallery' as const, label: lang === 'th' ? 'แกลเลอรี่' : 'Gallery' },
                { href: '/about' as const, label: nav('about') },
                { href: '/contact' as const, label: nav('contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#F5841F] text-sm transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-[#F5841F] transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-[#F5841F]" />
              {t('contact')}
            </h3>
            <ul className="space-y-3.5 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#F5841F]" />
                </div>
                <span className="leading-relaxed">{v('location.address') || contact('address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#F5841F]" />
                </div>
                <span>{v('location.phone') || contact('phone')}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#F5841F]" />
                </div>
                <span>{v('location.email') || contact('email')}</span>
              </li>
            </ul>
          </div>

          {/* Hours & Social */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-[#F5841F]" />
              <Clock className="w-4 h-4" />
              {lang === 'th' ? 'เวลาทำการ' : 'Hours'}
            </h3>
            <div className="text-sm text-gray-400 space-y-1.5 mb-6">
              <p>{v('location.lunch') || contact('lunch')}</p>
              <p>{v('location.dinner') || contact('dinner')}</p>
              <p className="text-[#F5841F] font-medium text-xs mt-2">{v('location.closed') || contact('closed')}</p>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'social.facebook', icon: FaFacebookF, title: 'Facebook', color: '#1877F2' },
                { key: 'social.whatsapp', icon: FaWhatsapp, title: 'WhatsApp', color: '#25D366' },
                { key: 'social.line', icon: FaLine, title: 'LINE', color: '#06C755' },
                { key: 'social.instagram', icon: FaInstagram, title: 'Instagram', color: '#E1306C' },
                { key: 'social.tiktok', icon: FaTiktok, title: 'TikTok', color: '#FFFFFF' },
                { key: 'social.x', icon: FaXTwitter, title: 'X', color: '#FFFFFF' },
              ].filter((s) => socialUrl(s.key)).map((s) => {
                const Icon = s.icon;
                return (
                  <a key={s.key} href={socialUrl(s.key)} target="_blank" rel="noopener noreferrer" title={s.title}
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center transition-all duration-300 hover:scale-110 text-gray-500 hover:text-white"
                    style={{ ['--hover-bg' as string]: s.color }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = s.color + '20')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 flex flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} PP Plus. {t('rights')}.
          </p>
          <p className="text-xs text-gray-600">
            {lang === 'th' ? 'ร้านขายสีรถยนต์ครบวงจร' : 'Complete Automotive Paint Solutions'}
          </p>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-[#F5841F]/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1C1C1E]/20 rounded-full blur-[80px] pointer-events-none" />
    </footer>
  );
}
