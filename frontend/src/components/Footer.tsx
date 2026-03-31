'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { MapPin, Phone, Mail, Car } from 'lucide-react';
import { FaFacebookF, FaWhatsapp, FaLine, FaInstagram, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
                <Car className="w-6 h-6 text-[#2EC4B6]" />
              </div>
              <div>
                <span className="text-xl font-bold text-[#2EC4B6] block" style={{ fontFamily: 'var(--font-heading)' }}>
                  PP+
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t('description')}
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {[
                { key: 'social.facebook', icon: FaFacebookF, title: 'Facebook', hoverBg: 'hover:bg-[#1877F2]', shadow: 'hover:shadow-[#1877F2]/30' },
                { key: 'social.whatsapp', icon: FaWhatsapp, title: 'WhatsApp', hoverBg: 'hover:bg-[#25D366]', shadow: 'hover:shadow-[#25D366]/30' },
                { key: 'social.line', icon: FaLine, title: 'LINE', hoverBg: 'hover:bg-[#06C755]', shadow: 'hover:shadow-[#06C755]/30' },
                { key: 'social.instagram', icon: FaInstagram, title: 'Instagram', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]', shadow: 'hover:shadow-[#DD2A7B]/30' },
                { key: 'social.tiktok', icon: FaTiktok, title: 'TikTok', hoverBg: 'hover:bg-[#000000]', shadow: 'hover:shadow-white/10' },
                { key: 'social.x', icon: FaXTwitter, title: 'X', hoverBg: 'hover:bg-[#000000]', shadow: 'hover:shadow-white/10' },
              ].filter((s) => socialUrl(s.key)).map((s) => {
                const Icon = s.icon;
                return (
                  <a key={s.key} href={socialUrl(s.key)} target="_blank" rel="noopener noreferrer" title={s.title}
                    className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-all duration-300 ${s.hoverBg} hover:scale-110 hover:shadow-lg ${s.shadow} text-gray-400 hover:text-white`}>
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#2EC4B6] font-semibold mb-4">{t('quick_links')}</h3>
            <ul className="space-y-2">
              {[
                { href: '/' as const, label: nav('home') },
                { href: '/menu' as const, label: nav('menu') },
                { href: '/color-matching' as const, label: nav('color_matching') },
                { href: '/b2b' as const, label: nav('b2b') },
                { href: '/blog' as const, label: nav('blog') },
                { href: '/about' as const, label: nav('about') },
                { href: '/contact' as const, label: nav('contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#2EC4B6] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#2EC4B6] font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#2EC4B6] shrink-0" />
                <span>{v('location.address') || contact('address')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2EC4B6] shrink-0" />
                <span>{v('location.phone') || contact('phone')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2EC4B6] shrink-0" />
                <span>{v('location.email') || contact('email')}</span>
              </li>
            </ul>
            <div className="mt-4 text-sm text-gray-400">
              <p className="text-[#2EC4B6] font-medium mb-1">{v('location.hours_title') || contact('hours_title')}</p>
              <p>{v('location.lunch') || contact('lunch')}</p>
              <p>{v('location.dinner') || contact('dinner')}</p>
              <p className="text-[#2EC4B6] font-medium mt-1">{v('location.closed') || contact('closed')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PP+. {t('rights')}.
        </div>
      </div>
    </footer>
  );
}
