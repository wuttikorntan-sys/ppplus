'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Users,
  Megaphone,
  TrendingUp,
  FolderOpen,
  ImageIcon,
  SlidersHorizontal,
  FileText,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Link } from '@/i18n/navigation';

interface DashboardData {
  totalMenuItems: number;
  totalCategories: number;
  totalUsers: number;
  totalBlogPosts: number;
}

export default function AdminDashboard() {
  const locale = useLocale();
  const [data, setData] = useState<DashboardData | null>(null);
  const th = locale === 'th';

  useEffect(() => {
    api.get<{ success: boolean; data: DashboardData }>('/admin/dashboard')
      .then((res) => setData(res.data))
      .catch(() => {
        setData({
          totalMenuItems: 0,
          totalCategories: 0,
          totalUsers: 0,
          totalBlogPosts: 0,
        });
      });
  }, []);

  const stats = data
    ? [
        {
          label: th ? 'สินค้า' : 'Products',
          value: data.totalMenuItems,
          icon: Package,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
        },
        {
          label: th ? 'หมวดหมู่' : 'Categories',
          value: data.totalCategories,
          icon: FolderOpen,
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600',
        },
        {
          label: th ? 'บทความ' : 'Blog Posts',
          value: data.totalBlogPosts,
          icon: BookOpen,
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-600',
        },
        {
          label: th ? 'ผู้ใช้งาน' : 'Users',
          value: data.totalUsers,
          icon: Users,
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
        },
      ]
    : [];

  const quickLinks = [
    { label: th ? 'จัดการสินค้า' : 'Products', href: '/admin/menu', icon: Package, desc: th ? 'เพิ่ม แก้ไข ลบสินค้า' : 'Add, edit, delete products' },
    { label: th ? 'หมวดหมู่' : 'Categories', href: '/admin/categories', icon: TrendingUp, desc: th ? 'จัดการหมวดหมู่สินค้า' : 'Organize product categories' },
    { label: th ? 'สไลด์หน้าแรก' : 'Hero Slides', href: '/admin/hero-slides', icon: SlidersHorizontal, desc: th ? 'จัดการสไลด์โชว์' : 'Manage slideshow' },
    { label: th ? 'แกลเลอรี่' : 'Gallery', href: '/admin/gallery', icon: ImageIcon, desc: th ? 'จัดการรูปภาพ' : 'Manage images' },
    { label: th ? 'บทความ' : 'Blog', href: '/admin/blog', icon: BookOpen, desc: th ? 'เขียนบทความ/ความรู้' : 'Write articles & tips' },
    { label: th ? 'ป๊อปอัพ' : 'Popups', href: '/admin/popups', icon: Megaphone, desc: th ? 'จัดการการแจ้งเตือน' : 'Manage announcements' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
          {th ? 'แดชบอร์ด' : 'Dashboard'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {th ? 'ภาพรวมของ PP Plus' : 'Overview of PP Plus'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${s.bgColor} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.textColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {th ? 'เข้าถึงด่วน' : 'Quick Access'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-[#1C1C1E]/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <link.icon className="w-5 h-5 text-[#1C1C1E]" />
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#1C1C1E] transition" />
              </div>
              <p className="font-medium text-gray-900 text-sm">{link.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}