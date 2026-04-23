'use client';

import { useLocale } from 'next-intl';
import { Globe, Save, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ContentMap {
  [key: string]: { th: string; en: string };
}

interface SitemapPage {
  path: string;
  priority: number;
  changeFrequency: string;
}

const defaultSitemapPages: SitemapPage[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/menu', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gallery', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/calculator', priority: 0.8, changeFrequency: 'monthly' },
];

export default function AdminSeoPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [seo, setSeo] = useState<ContentMap>({});
  const [sitemapPages, setSitemapPages] = useState<SitemapPage[]>(defaultSitemapPages);
  const [robotsDisallow, setRobotsDisallow] = useState<string[]>(['/api/', '/admin/']);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    api.get<{ success: boolean; data: ContentMap }>('/site-content')
      .then((res) => {
        const filteredSeo: ContentMap = {};
        Object.entries(res.data).forEach(([key, val]) => {
          if (key.startsWith('seo.')) filteredSeo[key] = val;
        });
        setSeo(filteredSeo);
        try {
          const sp = filteredSeo['seo.sitemap.pages'];
          if (sp?.th) {
            const parsed = JSON.parse(sp.th);
            if (Array.isArray(parsed) && parsed.length > 0) setSitemapPages(parsed);
          }
        } catch {}
        try {
          const rd = filteredSeo['seo.robots.disallow'];
          if (rd?.th) {
            const parsed = JSON.parse(rd.th);
            if (Array.isArray(parsed) && parsed.length > 0) setRobotsDisallow(parsed);
          }
        } catch {}
      })
      .catch(() => toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [th]);

  const updateSeoField = (key: string, value: string) => {
    setSeo((prev) => ({
      ...prev,
      [key]: { th: value, en: value },
    }));
  };

  const updateSeoLocalizedField = (key: string, lang: 'th' | 'en', value: string) => {
    setSeo((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { th: '', en: '' }), [lang]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const seoItems: Array<{ key: string; valueTh: string; valueEn: string; type: string }> = [];
      Object.entries(seo).forEach(([key, val]) => {
        if (key !== 'seo.sitemap.pages' && key !== 'seo.robots.disallow') {
          seoItems.push({ key, valueTh: val.th, valueEn: val.en, type: 'text' });
        }
      });
      const sitemapJson = JSON.stringify(sitemapPages);
      seoItems.push({ key: 'seo.sitemap.pages', valueTh: sitemapJson, valueEn: sitemapJson, type: 'text' });
      const robotsJson = JSON.stringify(robotsDisallow);
      seoItems.push({ key: 'seo.robots.disallow', valueTh: robotsJson, valueEn: robotsJson, type: 'text' });
      await api.put('/admin/site-content', seoItems);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            SEO &amp; Sitemap
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{th ? 'ตั้งค่า Meta Tags, Sitemap และ Robots.txt' : 'Manage Meta Tags, Sitemap and Robots.txt'}</p>
        </div>
        <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2 px-5 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
        </button>
      </div>

      {savedMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {th ? 'บันทึกเรียบร้อยแล้ว!' : 'Saved successfully!'}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {/* Global Meta Tags */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#F5841F]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{th ? 'Meta Tags ทั่วไป' : 'Global Meta Tags'}</h2>
                <p className="text-xs text-gray-400">{th ? 'ข้อมูลที่แสดงบน Google และโซเชียลมีเดีย' : 'Info displayed on Google and social media'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Site Title (TH)</label>
                  <input type="text" value={seo['seo.title']?.th || ''} onChange={(e) => updateSeoLocalizedField('seo.title', 'th', e.target.value)} placeholder="PP Plus - ร้านขายสีครบวงจร" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Site Title (EN)</label>
                  <input type="text" value={seo['seo.title']?.en || ''} onChange={(e) => updateSeoLocalizedField('seo.title', 'en', e.target.value)} placeholder="PP Plus - Complete Paint Solutions" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Description (TH)</label>
                  <textarea rows={2} value={seo['seo.description']?.th || ''} onChange={(e) => updateSeoLocalizedField('seo.description', 'th', e.target.value)} placeholder="PP Plus ร้านขายสีรถยนต์ สีอุตสาหกรรม อุปกรณ์ครบวงจร" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Description (EN)</label>
                  <textarea rows={2} value={seo['seo.description']?.en || ''} onChange={(e) => updateSeoLocalizedField('seo.description', 'en', e.target.value)} placeholder="PP Plus - Complete automotive and industrial paint solutions" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition resize-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Keywords (TH)</label>
                  <input type="text" value={seo['seo.keywords']?.th || ''} onChange={(e) => updateSeoLocalizedField('seo.keywords', 'th', e.target.value)} placeholder="สี, สีรถยนต์, สีพ่นรถ, PP Plus" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Keywords (EN)</label>
                  <input type="text" value={seo['seo.keywords']?.en || ''} onChange={(e) => updateSeoLocalizedField('seo.keywords', 'en', e.target.value)} placeholder="paint, automotive paint, PP Plus" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{th ? 'รหัสยืนยัน Google (Verification Code)' : 'Google Verification Code'}</label>
                <input type="text" value={seo['seo.google.verification']?.th || ''} onChange={(e) => updateSeoField('seo.google.verification', e.target.value)} placeholder="google65b33b3003929bf8" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
              </div>
            </div>
          </div>

          {/* Sitemap Pages */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{th ? 'หน้าใน Sitemap' : 'Sitemap Pages'}</h2>
              <button onClick={() => setSitemapPages([...sitemapPages, { path: '/', priority: 0.8, changeFrequency: 'monthly' }])} className="flex items-center gap-1 text-xs text-[#F5841F] hover:text-[#F5841F]/80 font-medium">
                <Plus className="w-3.5 h-3.5" /> {th ? 'เพิ่มหน้า' : 'Add Page'}
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_90px_120px_36px] gap-2 text-xs font-medium text-gray-400 px-1">
                <span>Path</span>
                <span>Priority</span>
                <span>Frequency</span>
                <span></span>
              </div>
              {sitemapPages.map((page, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_90px_120px_36px] gap-2 items-center">
                  <input type="text" value={page.path} onChange={(e) => { const u = [...sitemapPages]; u[idx] = { ...u[idx], path: e.target.value }; setSitemapPages(u); }} placeholder="/page-path" className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
                  <select value={page.priority} onChange={(e) => { const u = [...sitemapPages]; u[idx] = { ...u[idx], priority: parseFloat(e.target.value) }; setSitemapPages(u); }} className="px-2 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition bg-white">
                    {[1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select value={page.changeFrequency} onChange={(e) => { const u = [...sitemapPages]; u[idx] = { ...u[idx], changeFrequency: e.target.value }; setSitemapPages(u); }} className="px-2 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition bg-white">
                    {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <button onClick={() => setSitemapPages(sitemapPages.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">{th ? 'Path ต้องขึ้นต้นด้วย / (หน้าแรกใช้ค่าว่าง) — URL สำหรับทุกภาษาสร้างอัตโนมัติ' : 'Path must start with / (empty for homepage) — URLs for all locales are generated automatically'}</p>
          </div>

          {/* Robots.txt Disallow */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{th ? 'Robots.txt - เส้นทางที่ไม่อนุญาต' : 'Robots.txt - Disallowed Paths'}</h2>
              <button onClick={() => setRobotsDisallow([...robotsDisallow, '/'])} className="flex items-center gap-1 text-xs text-[#F5841F] hover:text-[#F5841F]/80 font-medium">
                <Plus className="w-3.5 h-3.5" /> {th ? 'เพิ่ม' : 'Add Path'}
              </button>
            </div>
            <div className="space-y-2">
              {robotsDisallow.map((path, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="text" value={path} onChange={(e) => { const u = [...robotsDisallow]; u[idx] = e.target.value; setRobotsDisallow(u); }} placeholder="/path/" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
                  <button onClick={() => setRobotsDisallow(robotsDisallow.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">{th ? 'เส้นทางที่ bot จะไม่สามารถเข้าถึงได้ (เช่น /api/ /admin/)' : 'Paths that bots cannot access (e.g. /api/ /admin/)'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
