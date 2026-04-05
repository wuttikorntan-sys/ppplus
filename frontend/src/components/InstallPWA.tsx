'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useLocale } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const locale = useLocale();
  const th = locale === 'th';
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);
    setIsStandalone(!!standalone);
    if (standalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Don't show again for 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);
    if (isIOSDevice) {
      setShowBanner(true);
      return;
    }

    // Listen for beforeinstallprompt (Chrome/Edge/Samsung)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', String(Date.now()));
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-[#1C1C1E] text-white rounded-2xl shadow-2xl p-4 border border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5841F] flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">
              {th ? 'ติดตั้งแอป PP Plus' : 'Install PP Plus App'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isIOS
                ? (th ? 'แตะ "แชร์" แล้วเลือก "เพิ่มไปยังหน้าจอหลัก"' : 'Tap "Share" then "Add to Home Screen"')
                : (th ? 'ติดตั้งเพื่อเข้าถึงได้เร็วขึ้นและใช้งาน Offline' : 'Install for faster access and offline use')
              }
            </p>
          </div>
          <button onClick={handleDismiss} className="text-gray-500 hover:text-white transition p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="w-full mt-3 py-2.5 bg-[#F5841F] text-white text-sm font-semibold rounded-xl hover:bg-[#e0741a] transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {th ? 'ติดตั้งเลย' : 'Install Now'}
          </button>
        )}
      </div>
    </div>
  );
}
