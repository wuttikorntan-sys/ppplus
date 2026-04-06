'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  LayoutDashboard,
  Package,
  Megaphone,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  FolderOpen,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  SlidersHorizontal,
  ImageIcon,
  FileText,
  MapPin,
  BookOpen,
  Database,
  Handshake,
  Palette,
  Star,
  MessageSquareQuote,
  FileDown,
  Globe,
  ShoppingCart,
  CalendarDays,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import logoPng from '../../../../public/logo.png';

const navSections = [
  {
    titleTh: 'หลัก',
    titleEn: 'Main',
    items: [
      { key: 'dashboard', icon: LayoutDashboard, href: '/admin' },
    ],
  },
  {
    titleTh: 'จัดการร้าน',
    titleEn: 'Store Management',
    items: [
      { key: 'menu', icon: Package, href: '/admin/menu' },
      { key: 'categories', icon: FolderOpen, href: '/admin/categories' },
      { key: 'color-formulas', icon: Palette, href: '/admin/color-formulas' },
      { key: 'location', icon: MapPin, href: '/admin/location' },
    ],
  },
  {
    titleTh: 'เนื้อหา',
    titleEn: 'Content',
    items: [
      { key: 'homepage', icon: FileText, href: '/admin/homepage' },
      { key: 'hero-slides', icon: SlidersHorizontal, href: '/admin/hero-slides' },
      { key: 'gallery', icon: ImageIcon, href: '/admin/gallery' },
      { key: 'blog', icon: BookOpen, href: '/admin/blog' },
      { key: 'popups', icon: Megaphone, href: '/admin/popups' },
    ],
  },
  {
    titleTh: 'ธุรกิจ',
    titleEn: 'Business',
    items: [
      { key: 'orders', icon: ShoppingCart, href: '/admin/orders' },
      { key: 'reservations', icon: CalendarDays, href: '/admin/reservations' },
      { key: 'b2b', icon: Handshake, href: '/admin/b2b' },
      { key: 'b2b-documents', icon: FileDown, href: '/admin/b2b-documents' },
      { key: 'quotes', icon: MessageSquareQuote, href: '/admin/quotes' },
      { key: 'reviews', icon: Star, href: '/admin/reviews' },
    ],
  },
  {
    titleTh: 'ระบบ',
    titleEn: 'System',
    items: [
      { key: 'users', icon: Users, href: '/admin/users' },
      { key: 'backup', icon: Database, href: '/admin/backup' },
      { key: 'seo', icon: Globe, href: '/admin/seo' },
      { key: 'settings', icon: Settings, href: '/admin/settings' },
    ],
  },
];

const labels: Record<string, Record<string, string>> = {
  th: {
    dashboard: 'แดชบอร์ด',
    menu: 'จัดการสินค้า',
    categories: 'หมวดหมู่',
    'color-formulas': 'สูตรสี',
    location: 'ตำแหน่งที่ตั้ง',

    homepage: 'เนื้อหาหน้าแรก',
    'hero-slides': 'สไลด์หน้าแรก',
    gallery: 'แกลเลอรี่',
    blog: 'บทความ',
    popups: 'ป๊อปอัพ',
    orders: 'ออเดอร์',
    reservations: 'การจอง',
    b2b: 'ตัวแทนจำหน่าย',
    'b2b-documents': 'เอกสาร B2B',
    quotes: 'ใบเสนอราคา',
    reviews: 'รีวิว',
    users: 'ผู้ใช้งาน',
    backup: 'สำรองข้อมูล',
    seo: 'SEO & Sitemap',
    settings: 'ตั้งค่า',
  },
  en: {
    dashboard: 'Dashboard',
    menu: 'Products',
    categories: 'Categories',
    'color-formulas': 'Color Formulas',
    location: 'Location',

    homepage: 'Homepage Content',
    'hero-slides': 'Hero Slides',
    gallery: 'Gallery',
    blog: 'Blog',
    popups: 'Popups',
    orders: 'Orders',
    reservations: 'Reservations',
    b2b: 'B2B Applications',
    'b2b-documents': 'B2B Documents',
    quotes: 'Quote Requests',
    reviews: 'Reviews',
    users: 'Users',
    backup: 'Backup & Import',
    seo: 'SEO & Sitemap',
    settings: 'Settings',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.replace('/auth/login');
      } else {
        setAuthChecked(true);
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !authChecked || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const l = labels[locale] || labels.en;

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/admin') return pathname === '/admin' || pathname === `/${locale}/admin`;
    return pathname.includes(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logoPng.src} alt="PP Plus" width={36} height={36} className="w-9 h-9 rounded-xl shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                PP Plus
              </h2>
              <p className="text-[10px] text-gray-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {locale === 'th' ? section.titleTh : section.titleEn}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                      active
                        ? 'bg-[#1C1C1E] text-white shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                    title={l[item.key]}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && <span className="font-medium truncate">{l[item.key]}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User & Actions */}
      <div className="p-2 border-t border-white/10 space-y-0.5">
        {!collapsed && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition text-sm"
        >
          <Home className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="font-medium">{locale === 'th' ? 'กลับหน้าเว็บ' : 'Back to Site'}</span>}
        </Link>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition text-sm"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="font-medium">{locale === 'th' ? 'ออกจากระบบ' : 'Logout'}</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-[#1a1a2e] fixed h-screen z-30 transition-all duration-300 ${
          collapsed ? 'w-[60px]' : 'w-60'
        }`}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 w-6 h-6 bg-[#1a1a2e] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden flex flex-col bg-[#1a1a2e] fixed h-screen z-50 w-60 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-[60px]' : 'lg:ml-60'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={locale === 'th' ? 'ค้นหา...' : 'Search...'}
                className="bg-transparent outline-none text-sm text-gray-600 w-48 placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-[#1C1C1E] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
