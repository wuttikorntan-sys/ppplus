'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Star, Check, X as XIcon, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle2, ExternalLink, Save, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: { name: string; email: string };
}

interface GoogleReview {
  authorName: string;
  profilePhoto: string;
  rating: number;
  relativeTime: string;
  text: string;
  time: number;
}

interface GoogleConfig {
  configured: boolean;
  apiKeyPreview: string | null;
  placeIdPreview: string | null;
  apiKeySource: 'db' | 'env' | null;
  placeIdSource: 'db' | 'env' | null;
  placeIdValue: string;
  cache: {
    fetchedAt: number;
    rating: number;
    totalReviews: number;
    reviews: GoogleReview[];
  } | null;
}

const SECTION_ENABLED_KEY = 'reviews.section.enabled';

export default function AdminReviewsPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);
  const [google, setGoogle] = useState<GoogleConfig | null>(null);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCredsForm, setShowCredsForm] = useState(false);
  const [creds, setCreds] = useState({ apiKey: '', placeId: '' });
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);

  const fetchReviews = () => {
    api.get<{ success: boolean; data: Review[] }>('/admin/reviews')
      .then((r) => setReviews(r.data))
      .catch(() => toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  const fetchGoogleConfig = () => {
    setGoogleLoading(true);
    api.get<{ success: boolean; data: GoogleConfig }>('/admin/reviews/google')
      .then((r) => setGoogle(r.data))
      .catch(() => toast.error(th ? 'โหลด Google config ไม่สำเร็จ' : 'Failed to load Google config'))
      .finally(() => setGoogleLoading(false));
  };

  const fetchToggle = () => {
    api.get<{ success: boolean; data: Record<string, { th: string; en: string }> }>('/site-content')
      .then((r) => {
        const raw = r.data?.[SECTION_ENABLED_KEY]?.th ?? r.data?.[SECTION_ENABLED_KEY]?.en ?? '1';
        setEnabled(raw !== '0');
      })
      .catch(() => { /* default enabled */ });
  };

  useEffect(() => {
    fetchReviews();
    fetchGoogleConfig();
    fetchToggle();
  }, []);

  const toggleApproval = async (id: number, isApproved: boolean) => {
    try {
      await api.patch(`/admin/reviews/${id}`, { isApproved });
      toast.success(th ? 'อัปเดตเรียบร้อย' : 'Updated');
      fetchReviews();
    } catch {
      toast.error(th ? 'อัปเดตไม่สำเร็จ' : 'Failed to update');
    }
  };

  const toggleSectionVisibility = async () => {
    const next = !enabled;
    setSavingToggle(true);
    try {
      const value = next ? '1' : '0';
      await api.put('/admin/site-content', [{
        key: SECTION_ENABLED_KEY,
        valueTh: value,
        valueEn: value,
        type: 'flag',
      }]);
      setEnabled(next);
      toast.success(next
        ? (th ? 'เปิดแสดงรีวิวบนหน้าเว็บแล้ว' : 'Reviews section enabled')
        : (th ? 'ซ่อนรีวิวจากหน้าเว็บแล้ว' : 'Reviews section hidden'));
    } catch {
      toast.error(th ? 'บันทึกไม่สำเร็จ' : 'Failed to save');
    } finally {
      setSavingToggle(false);
    }
  };

  const saveCreds = async () => {
    if (!creds.apiKey.trim() && !creds.placeId.trim()) {
      toast.error(th ? 'กรุณากรอกอย่างน้อย 1 ช่อง' : 'Please fill at least one field');
      return;
    }
    setSavingCreds(true);
    try {
      const payload: { apiKey?: string; placeId?: string } = {};
      if (creds.apiKey.trim()) payload.apiKey = creds.apiKey.trim();
      if (creds.placeId.trim()) payload.placeId = creds.placeId.trim();
      await api.put('/admin/reviews/google', payload);
      toast.success(th ? 'บันทึกการตั้งค่าเรียบร้อย' : 'Settings saved');
      setCreds({ apiKey: '', placeId: '' });
      setShowCredsForm(false);
      fetchGoogleConfig();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (th ? 'บันทึกไม่สำเร็จ' : 'Failed to save'));
    } finally {
      setSavingCreds(false);
    }
  };

  const refreshGoogle = async () => {
    setRefreshing(true);
    try {
      const res = await api.post<{ success: boolean; data: GoogleConfig['cache'] }>('/admin/reviews/google', {});
      setGoogle((g) => g ? { ...g, cache: res.data } : g);
      toast.success(th ? 'ดึงข้อมูลใหม่จาก Google สำเร็จ' : 'Refreshed from Google');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (th ? 'ดึงไม่สำเร็จ' : 'Refresh failed'));
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (ms: number) => {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return th ? 'เมื่อสักครู่' : 'just now';
    if (mins < 60) return th ? `${mins} นาทีที่แล้ว` : `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return th ? `${hrs} ชั่วโมงที่แล้ว` : `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return th ? `${days} วันที่แล้ว` : `${days} day ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
          {th ? 'จัดการรีวิว' : 'Review Management'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {th ? 'ตั้งค่าการแสดงรีวิวบนหน้าเว็บและจัดการรีวิวลูกค้า' : 'Configure homepage reviews and manage customer reviews'}
        </p>
      </div>

      {/* Public visibility toggle */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${enabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{th ? 'แสดงรีวิวบนหน้าเว็บ' : 'Show Reviews on Homepage'}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {enabled
                  ? (th ? 'ส่วน "Customer Reviews" กำลังแสดงอยู่' : 'The "Customer Reviews" section is visible')
                  : (th ? 'ส่วน "Customer Reviews" ถูกซ่อนไว้' : 'The "Customer Reviews" section is hidden')}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSectionVisibility}
            disabled={savingToggle}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Google API status */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Reviews API
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {th ? 'ดึงรีวิวจาก Google Places API (อัปเดตอัตโนมัติทุก 24 ชม.)' : 'Pulled from Google Places API (auto-cached for 24 hours)'}
            </p>
          </div>
          <button
            onClick={refreshGoogle}
            disabled={refreshing || !google?.configured}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {th ? 'ดึงข้อมูลใหม่' : 'Refresh now'}
          </button>
        </div>

        {googleLoading ? (
          <div className="py-6 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status banner */}
            {!google?.configured ? (
              <div className="flex items-start gap-2.5 bg-amber-50 text-amber-700 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm flex-1">
                  <p className="font-medium">{th ? 'ยังไม่ได้ตั้งค่า Google API' : 'Google API not configured'}</p>
                  <p className="mt-1 text-amber-600 text-xs">
                    {th
                      ? 'กรอก API Key + Place ID ด้านล่างเพื่อดึงรีวิวจริง — ถ้ายังไม่กรอก หน้าเว็บจะใช้รีวิวตัวอย่าง (mock) แทน'
                      : 'Enter your API Key + Place ID below to pull live reviews. The homepage falls back to mock reviews until configured.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCredsForm(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition"
                >
                  <KeyRound className="w-3.5 h-3.5" /> {th ? 'ตั้งค่าเลย' : 'Configure'}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {th ? 'เชื่อมต่อแล้ว' : 'Connected'}
                </span>
                <button
                  type="button"
                  onClick={() => { setShowCredsForm((v) => !v); setCreds({ apiKey: '', placeId: '' }); }}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {showCredsForm ? (th ? 'ปิดฟอร์ม' : 'Hide form') : (th ? 'แก้ไขข้อมูล' : 'Edit credentials')}
                </button>
              </div>
            )}

            {/* Credentials form */}
            {(showCredsForm || !google?.configured) && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {th ? 'Google Places API Key' : 'Google Places API Key'}
                    {google?.apiKeyPreview && (
                      <span className="ml-2 text-[11px] text-gray-400 font-normal">
                        {th ? 'ตอนนี้:' : 'current:'} <code className="bg-gray-200 px-1.5 py-0.5 rounded">{google.apiKeyPreview}</code>
                        {google.apiKeySource === 'env' && <span className="ml-1 italic">(env)</span>}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={creds.apiKey}
                      onChange={(e) => setCreds({ ...creds, apiKey: e.target.value })}
                      placeholder={th ? 'AIzaSy... (ปล่อยว่าง = ไม่เปลี่ยน)' : 'AIzaSy... (leave blank to keep)'}
                      className="w-full pr-20 px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-800"
                    >
                      {showApiKey ? (th ? 'ซ่อน' : 'Hide') : (th ? 'แสดง' : 'Show')}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {th ? 'Google Place ID' : 'Google Place ID'}
                    {google?.placeIdValue && (
                      <span className="ml-2 text-[11px] text-gray-400 font-normal">
                        {th ? 'ตอนนี้:' : 'current:'} <code className="bg-gray-200 px-1.5 py-0.5 rounded">{google.placeIdValue}</code>
                        {google.placeIdSource === 'env' && <span className="ml-1 italic">(env)</span>}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={creds.placeId}
                    onChange={(e) => setCreds({ ...creds, placeId: e.target.value })}
                    placeholder={th ? 'ChIJ... (ปล่อยว่าง = ไม่เปลี่ยน)' : 'ChIJ... (leave blank to keep)'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1C1C1E] focus:ring-2 focus:ring-[#1C1C1E]/10 transition text-sm font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {th
                      ? 'หา Place ID ของร้านได้ที่ '
                      : 'Find your Place ID at '}
                    <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-[#F5841F] hover:underline">
                      Google Place ID Finder ↗
                    </a>
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  {google?.configured && (
                    <button
                      type="button"
                      onClick={() => { setShowCredsForm(false); setCreds({ apiKey: '', placeId: '' }); }}
                      className="px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                    >
                      {th ? 'ยกเลิก' : 'Cancel'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveCreds}
                    disabled={savingCreds}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {savingCreds ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึกการตั้งค่า' : 'Save settings')}
                  </button>
                </div>
              </div>
            )}

            {google?.configured && (google.cache ? (
              <>
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{google.cache.rating.toFixed(1)}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(google.cache!.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <p className="text-sm text-gray-500">{th ? 'จำนวนรีวิวทั้งหมด' : 'Total reviews'}</p>
                    <p className="text-xl font-bold text-gray-900">{google.cache.totalReviews.toLocaleString()}</p>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <p className="text-sm text-gray-500">{th ? 'อัปเดตล่าสุด' : 'Last fetched'}</p>
                    <p className="text-sm font-medium text-gray-900">{formatTimeAgo(google.cache.fetchedAt)}</p>
                  </div>
                </div>

                {google.cache.reviews.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {th ? 'รีวิวที่ดึงมาล่าสุด' : 'Cached reviews'}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {google.cache.reviews.slice(0, 6).map((r, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="font-medium text-gray-900 truncate">{r.authorName}</p>
                            <div className="flex gap-0.5 shrink-0">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{r.relativeTime}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">{th ? 'ยังไม่มี cache — กด "ดึงข้อมูลใหม่" เพื่อดึงครั้งแรก' : 'No cache yet — click "Refresh now" to fetch the first time'}</p>
            ))}
          </div>
        )}
      </div>

      {/* DB reviews */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">{th ? 'รีวิวจากผู้ใช้ในระบบ' : 'In-app User Reviews'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{reviews.length} {th ? 'รีวิว' : 'reviews'}</p>
          </div>
          <a href="https://g.page/r/CU2GmSihx5JtEBM/review" target="_blank" rel="noopener noreferrer" className="text-xs text-[#F5841F] hover:underline inline-flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {th ? 'รับรีวิวจาก Google' : 'Get more on Google'}
          </a>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{th ? 'ยังไม่มีรีวิวในระบบ' : 'No in-app reviews yet'}</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{review.user.name}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.isApproved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {review.isApproved ? (th ? 'อนุมัติ' : 'Approved') : (th ? 'รออนุมัติ' : 'Pending')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1 whitespace-pre-line">{review.comment}</p>
                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleString(locale)}</p>
                  </div>
                  <div className="flex gap-1 ml-4 shrink-0">
                    {!review.isApproved && (
                      <button onClick={() => toggleApproval(review.id, true)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition" title={th ? 'อนุมัติ' : 'Approve'}>
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {review.isApproved && (
                      <button onClick={() => toggleApproval(review.id, false)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title={th ? 'ไม่อนุมัติ' : 'Unapprove'}>
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
