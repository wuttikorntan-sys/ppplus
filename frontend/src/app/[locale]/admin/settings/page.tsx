'use client';

import { useLocale } from 'next-intl';
import { Palette, MapPin, Share2, Save, ExternalLink, Mail, Eye, EyeOff, MessageCircle, Globe, Bell } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FaFacebookF, FaWhatsapp, FaLine, FaInstagram, FaTiktok, FaXTwitter } from 'react-icons/fa6';

interface ContentMap {
  [key: string]: { th: string; en: string };
}

const socialFields = [
  { key: 'social.facebook', label: 'Facebook', icon: FaFacebookF, color: '#1877F2', placeholder: 'https://facebook.com/yourpage' },
  { key: 'social.whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', placeholder: 'https://wa.me/66xxxxxxxxx' },
  { key: 'social.line', label: 'LINE', icon: FaLine, color: '#06C755', placeholder: 'https://line.me/R/ti/p/@yourlineid' },
  { key: 'social.instagram', label: 'Instagram', icon: FaInstagram, color: '#DD2A7B', placeholder: 'https://instagram.com/yourpage' },
  { key: 'social.tiktok', label: 'TikTok', icon: FaTiktok, color: '#000000', placeholder: 'https://tiktok.com/@yourpage' },
  { key: 'social.x', label: 'X (Twitter)', icon: FaXTwitter, color: '#000000', placeholder: 'https://x.com/yourpage' },
];

const chatFields = [
  { key: 'facebook', label: 'Facebook Messenger', icon: FaFacebookF, color: '#1877F2', placeholder: 'https://m.me/yourpage' },
  { key: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', placeholder: 'https://wa.me/66xxxxxxxxx' },
  { key: 'line', label: 'LINE', icon: FaLine, color: '#06C755', placeholder: 'https://line.me/R/ti/p/@yourlineid' },
];

export default function AdminSettingsPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [social, setSocial] = useState<ContentMap>({});
  const [smtp, setSmtp] = useState<ContentMap>({});
  const [chat, setChat] = useState<ContentMap>({});
  const [notify, setNotify] = useState<ContentMap>({});

  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    api.get<{ success: boolean; data: ContentMap }>('/site-content')
      .then((res) => {
        const filteredSocial: ContentMap = {};
        const filteredSmtp: ContentMap = {};
        const filteredChat: ContentMap = {};
        const filteredNotify: ContentMap = {};

        Object.entries(res.data).forEach(([key, val]) => {
          const safeVal = val && typeof val === 'object' && 'th' in val
            ? val
            : { th: typeof val === 'string' ? val : '', en: typeof val === 'string' ? val : '' };
          if (key.startsWith('social.')) filteredSocial[key] = safeVal;
          if (key.startsWith('smtp.')) filteredSmtp[key] = safeVal;
          if (key.startsWith('chat.')) filteredChat[key] = safeVal;
          if (key.startsWith('notify.')) filteredNotify[key] = safeVal;
        });
        // Ensure enabled keys exist with defaults
        for (const f of chatFields) {
          const ek = `chat.${f.key}.enabled`;
          const uk = `chat.${f.key}.url`;
          if (!filteredChat[ek]) filteredChat[ek] = { th: 'true', en: 'true' };
          if (!filteredChat[uk]) filteredChat[uk] = { th: '', en: '' };
        }
        setSocial(filteredSocial);
        setSmtp(filteredSmtp);
        setChat(filteredChat);
        setNotify(filteredNotify);

      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key: string, value: string) => {
    setSocial((prev) => ({
      ...prev,
      [key]: { th: value, en: value },
    }));
  };

  const updateSmtpField = (key: string, value: string) => {
    setSmtp((prev) => ({
      ...prev,
      [key]: { th: value, en: value },
    }));
  };

  const updateChatField = (key: string, value: string) => {
    setChat((prev) => ({
      ...prev,
      [key]: { th: value, en: value },
    }));
  };

  const updateNotifyField = (key: string, value: string) => {
    setNotify((prev) => ({
      ...prev,
      [key]: { th: value, en: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const socialItems = Object.entries(social).map(([key, val]) => ({
        key,
        valueTh: val?.th ?? '',
        valueEn: val?.en ?? '',
        type: 'text',
      }));
      const smtpItems = Object.entries(smtp).map(([key, val]) => ({
        key,
        valueTh: val?.th ?? '',
        valueEn: val?.en ?? '',
        type: 'text',
      }));
      const chatItems = Object.entries(chat).map(([key, val]) => ({
        key,
        valueTh: val?.th ?? '',
        valueEn: val?.en ?? '',
        type: 'text',
      }));
      const notifyItems = Object.entries(notify).map(([key, val]) => ({
        key,
        valueTh: val?.th ?? '',
        valueEn: val?.en ?? '',
        type: 'text',
      }));
      await api.put('/admin/site-content', [...socialItems, ...smtpItems, ...chatItems, ...notifyItems]);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
          {th ? 'ตั้งค่า' : 'Settings'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{th ? 'ตั้งค่าระบบของร้าน' : 'System settings'}</p>
      </div>

      {savedMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {th ? 'บันทึกเรียบร้อยแล้ว!' : 'Saved successfully!'}
        </div>
      )}

      <div className="space-y-4">
        {/* Location shortcut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1C1C1E]/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#1C1C1E]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{th ? 'ข้อมูลร้านและตำแหน่งที่ตั้ง' : 'Store Info & Location'}</h2>
                <p className="text-xs text-gray-400">{th ? 'ที่อยู่ เบอร์โทร อีเมล เวลาทำการ แผนที่' : 'Address, phone, email, hours, map'}</p>
              </div>
            </div>
            <Link href="/admin/location" className="px-4 py-2 bg-[#1C1C1E]/10 text-[#1C1C1E] rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/20 transition">
              {th ? 'จัดการ →' : 'Manage →'}
            </Link>
          </div>
        </div>

        {/* Chat Channels (Floating Reservation Button) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{th ? 'ช่องทางแชทจองโต๊ะ' : 'Chat / Reservation Channels'}</h2>
                <p className="text-xs text-gray-400">{th ? 'ตั้งค่าปุ่มลอยสำหรับจองโต๊ะผ่านแชท' : 'Configure floating chat buttons for table reservation'}</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-3 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              {chatFields.map((field) => {
                const Icon = field.icon;
                const enabledKey = `chat.${field.key}.enabled`;
                const urlKey = `chat.${field.key}.url`;
                const isEnabled = chat[enabledKey]?.th !== 'false';
                const url = chat[urlKey]?.th || '';
                return (
                  <div key={field.key} className={`rounded-xl border p-4 transition ${isEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: field.color + '15' }}>
                        <Icon className="w-4 h-4" style={{ color: field.color }} />
                      </div>
                      <span className="font-medium text-sm text-gray-900 flex-1">{field.label}</span>
                      <button
                        type="button"
                        onClick={() => updateChatField(enabledKey, isEnabled ? 'false' : 'true')}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          isEnabled ? 'bg-[#1C1C1E]' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    {isEnabled && (
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => updateChatField(urlKey, e.target.value)}
                          placeholder={field.placeholder}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition"
                        />
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1C1C1E] transition shrink-0">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 mt-1">{th ? 'เปิด/ปิด แต่ละช่องทาง และกรอก URL สำหรับลิงก์แชท' : 'Toggle each channel and enter the chat URL'}</p>
            </div>
          )}
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{th ? 'ลิงก์โซเชียลมีเดีย' : 'Social Media Links'}</h2>
                <p className="text-xs text-gray-400">{th ? 'จัดการลิงก์โซเชียลมีเดียที่แสดงใน Footer' : 'Manage social links shown in Footer'}</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-3 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              {socialFields.map((field) => {
                const Icon = field.icon;
                const url = social[field.key]?.th || '';
                return (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: field.color + '15' }}>
                      <Icon className="w-4 h-4" style={{ color: field.color }} />
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition"
                      />
                    </div>
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1C1C1E] transition shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 mt-2">{th ? 'เว้นว่างถ้าไม่ต้องการแสดงไอคอนนั้น' : 'Leave empty to hide that icon'}</p>
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{th ? 'ธีมและรูปลักษณ์' : 'Theme & Appearance'}</h2>
              <p className="text-xs text-gray-400">{th ? 'ปรับแต่งสีและรูปแบบ' : 'Customize colors and style'}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">{th ? 'ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้' : 'This feature is coming soon'}</p>
        </div>

        {/* Email / SMTP Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{th ? 'ตั้งค่าอีเมลรับข้อความ' : 'Contact Email Settings'}</h2>
              <p className="text-xs text-gray-400">{th ? 'SMTP สำหรับรับข้อความจากหน้าติดต่อ' : 'SMTP settings for receiving contact messages'}</p>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-3 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{th ? 'อีเมลรับข้อความ (ส่งถึง)' : 'Receiving Email (To)'}</label>
                <input type="email" value={smtp['smtp.to']?.th || ''} onChange={(e) => updateSmtpField('smtp.to', e.target.value)} placeholder="info@ppplus.co.th" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">SMTP Host</label>
                <input type="text" value={smtp['smtp.host']?.th || ''} onChange={(e) => updateSmtpField('smtp.host', e.target.value)} placeholder="smtp.gmail.com" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">SMTP Port</label>
                <input type="text" value={smtp['smtp.port']?.th || ''} onChange={(e) => updateSmtpField('smtp.port', e.target.value)} placeholder="587" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{th ? 'อีเมลผู้ส่ง (SMTP User)' : 'Sender Email (SMTP User)'}</label>
                <input type="email" value={smtp['smtp.user']?.th || ''} onChange={(e) => updateSmtpField('smtp.user', e.target.value)} placeholder="info@ppplus.co.th" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{th ? 'รหัสผ่านแอป (App Password)' : 'App Password'}</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={smtp['smtp.pass']?.th || ''} onChange={(e) => updateSmtpField('smtp.pass', e.target.value)} placeholder="xxxx xxxx xxxx xxxx" className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {th ? '* สำหรับ Gmail ให้ใช้ App Password (ไม่ใช่รหัสผ่านปกติ) — ไปที่ Google Account → Security → App passwords' : '* For Gmail, use App Password (not your regular password) — Go to Google Account → Security → App passwords'}
              </p>
            </div>
          )}
        </div>

        {/* LINE Notify */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{th ? 'การแจ้งเตือน LINE Notify' : 'LINE Notify Alerts'}</h2>
                <p className="text-xs text-gray-400">{th ? 'รับแจ้งเตือนใบเสนอราคาผ่าน LINE' : 'Receive quote alerts via LINE'}</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/90 transition disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-3 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">LINE Notify Token</label>
                <input type="text" value={notify['notify.line.token']?.th || ''} onChange={(e) => updateNotifyField('notify.line.token', e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxx" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1C1C1E] transition font-mono" />
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium mb-1">{th ? 'วิธีขอ Token:' : 'How to get a token:'}</p>
                <ol className="text-xs text-green-600 space-y-0.5 list-decimal list-inside">
                  <li>{th ? 'ไปที่ notify-bot.line.me' : 'Go to notify-bot.line.me'}</li>
                  <li>{th ? 'ล็อกอินด้วย LINE account' : 'Login with your LINE account'}</li>
                  <li>{th ? 'กด "Generate token" เลือกห้องแชทที่ต้องการรับแจ้งเตือน' : 'Click "Generate token" and select a chat room'}</li>
                  <li>{th ? 'คัดลอก Token มาวางที่นี่' : 'Copy the token and paste it here'}</li>
                </ol>
              </div>
              <p className="text-xs text-gray-400">{th ? '* เมื่อมีลูกค้าขอใบเสนอราคา ระบบจะส่งแจ้งเตือนไปยัง LINE ของคุณทันที' : '* When a customer requests a quote, you will receive an instant LINE notification'}</p>
            </div>
          )}
        </div>

        {/* SEO & Sitemap shortcut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#F5841F]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">SEO &amp; Sitemap</h2>
                <p className="text-xs text-gray-400">{th ? 'ตั้งค่า Meta Tags, Sitemap และ Robots.txt' : 'Manage Meta Tags, Sitemap and Robots.txt'}</p>
              </div>
            </div>
            <Link href="/admin/seo" className="px-4 py-2 bg-[#1C1C1E]/10 text-[#1C1C1E] rounded-lg text-sm font-medium hover:bg-[#1C1C1E]/20 transition">
              {th ? 'จัดการ →' : 'Manage →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
