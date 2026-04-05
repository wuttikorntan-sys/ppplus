'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { X, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ContentMap {
  [key: string]: { th: string; en: string };
}

export default function FloatingReservation() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const locale = (params.locale as string) || 'th';
  const [social, setSocial] = useState<ContentMap>({});

  useEffect(() => {
    api.get<{ success: boolean; data: ContentMap }>('/site-content')
      .then((res) => {
        const filtered: ContentMap = {};
        Object.entries(res.data).forEach(([key, val]) => {
          if (key.startsWith('chat.')) filtered[key] = val;
        });
        setSocial(filtered);
      })
      .catch(() => {});
  }, []);

  const channels = [
    {
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: 'bg-[#25D366] hover:bg-[#1da851]',
      urlKey: 'chat.whatsapp.url',
      enabledKey: 'chat.whatsapp.enabled',
    },
    {
      name: 'LINE',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
      color: 'bg-[#06C755] hover:bg-[#05a847]',
      urlKey: 'chat.line.url',
      enabledKey: 'chat.line.enabled',
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: 'bg-[#1877F2] hover:bg-[#0d65d9]',
      urlKey: 'chat.facebook.url',
      enabledKey: 'chat.facebook.enabled',
    },
  ];

  // Filter to only show enabled channels
  const activeChannels = channels.filter((ch) => {
    return social[ch.enabledKey]?.th !== 'false';
  });

  // Get URL for channel — convert Facebook to m.me/ deep link (opens Messenger app on mobile)
  const getChannelUrl = (ch: typeof channels[0]) => {
    const raw = social[ch.urlKey]?.th || social[ch.urlKey]?.en || '#';
    if (ch.urlKey === 'chat.facebook.url' && raw !== '#') {
      // If already an m.me link, use directly
      if (raw.includes('m.me/')) return raw;
      try {
        const url = new URL(raw);
        // Handle profile.php?id=XXXXX format
        if (url.pathname.includes('profile.php')) {
          const id = url.searchParams.get('id');
          if (id) return `https://m.me/${id}`;
        }
        // Handle facebook.com/messages/t/XXXX format
        const msgMatch = url.pathname.match(/\/messages\/t\/(.+)/);
        if (msgMatch) return `https://m.me/${msgMatch[1].replace(/\/+$/g, '')}`;
        // Handle facebook.com/pagename format
        const pageName = url.pathname.replace(/^\/+|\/+$/g, '');
        if (pageName) return `https://m.me/${pageName}`;
      } catch { /* fall through */ }
    }
    return raw;
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50">
      {/* Contact options popup */}
      {open && (
        <div className="absolute bottom-20 right-0 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-72">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#2D2D2D] text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                {locale === 'th' ? 'สอบถาม / ติดต่อ' : 'Contact Us'}
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-4">
              {locale === 'th'
                ? 'เลือกช่องทางที่สะดวกสำหรับคุณ'
                : 'Choose your preferred channel'}
            </p>
            <div className="space-y-2.5">
              {activeChannels.map((ch) => (
                <a
                  key={ch.name}
                  href={getChannelUrl(ch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium text-sm transition-all transform hover:scale-[1.02] ${ch.color}`}
                >
                  {ch.icon}
                  <span>{locale === 'th' ? `สอบถามผ่าน ${ch.name}` : `Contact via ${ch.name}`}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating logo button */}
      <button
        onClick={() => setOpen(!open)}
        className={`group relative w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-110 ${
          open ? 'bg-[#2D2D2D] rotate-0' : 'bg-[#1C1C1E]'
        }`}
        aria-label={locale === 'th' ? 'สอบถาม' : 'Contact Us'}
      >
        {open ? (
          <X className="w-7 h-7 text-white mx-auto" />
        ) : (
          <MessageCircle className="w-8 h-8 text-[#F5841F] mx-auto" />
        )}
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[#F5841F]/20" />
        )}
      </button>

      {/* Label below button */}
      {!open && (
        <p className="text-center text-[10px] font-semibold text-[#1C1C1E] mt-1.5 tracking-wide">
          {locale === 'th' ? 'สอบถาม' : 'CONTACT'}
        </p>
      )}
    </div>
  );
}
