'use client';

import { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface PopupData {
  id: number;
  title: string;
  titleTh?: string;
  description?: string;
  descriptionTh?: string;
  imageUrl?: string;
  badge?: string;
  tags?: string;
  tagsTh?: string;
  features?: string;
  featuresTh?: string;
  buttonText?: string;
  buttonTextTh?: string;
  active: boolean;
}

export default function Popup({ locale }: { locale: string }) {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [visible, setVisible] = useState(false);
  const [googleRating, setGoogleRating] = useState<number | null>(null);
  const th = locale === 'th';

  useEffect(() => {
    const dismissed = sessionStorage.getItem('popup_dismissed');
    if (dismissed) return;

    api.get<{ success: boolean; data: PopupData[] }>('/popups?active=true')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setPopup(res.data[0]);
          setVisible(true);
        }
      })
      .catch(() => {});

    // Fetch Google rating
    fetch('/api/google-reviews')
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data?.rating) setGoogleRating(r.data.rating);
      })
      .catch(() => {});
  }, []);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem('popup_dismissed', '1');
  };

  const title = th && popup?.titleTh ? popup.titleTh : popup?.title;
  const description = th && popup?.descriptionTh ? popup.descriptionTh : popup?.description;
  const imageUrl = popup?.imageUrl || null;
  const badge = popup?.badge || 'NEW';
  const buttonLabel = th && popup?.buttonTextTh ? popup.buttonTextTh : (popup?.buttonText || (th ? 'ดูสินค้า' : 'Browse Products'));

  const tagsRaw = th && popup?.tagsTh ? popup.tagsTh : (popup?.tags || '');
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
  const featuresRaw = th && popup?.featuresTh ? popup.featuresTh : (popup?.features || '');
  const features = featuresRaw.split(',').map((f) => f.trim()).filter(Boolean);

  const tagColors = [
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  ];

  return (
    <AnimatePresence>
      {visible && popup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl overflow-hidden bg-[#0d0d0d] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-gray-300 hover:bg-white/20 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            {imageUrl && (
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={title || 'PP Plus'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-6 -mt-4 relative z-10">
              {/* Title row with badge */}
              <div className="flex items-center gap-3 mb-3">
                <Image src="/LOGO1.svg" alt="PP Plus" width={40} height={40} className="w-10 h-10 rounded-xl shadow-lg shadow-[#F5841F]/20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                      {title || 'PP Plus'}
                    </h3>
                    <span className="shrink-0 px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wide">
                      {badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#F5841F] fill-[#F5841F]" />
                  <span className="text-white font-semibold">{googleRating ? googleRating.toFixed(1) : '5.0'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{th ? 'กรุงเทพฯ' : 'Bangkok'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{th ? 'เปิดอยู่' : 'Open Now'}</span>
                </div>
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {th ? 'ยืนยัน' : 'Verified'}
                </span>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, i) => (
                  <span key={i} className={`px-3 py-1 text-xs font-semibold rounded-lg border ${tagColors[i % tagColors.length]}`}>
                    {tag}
                  </span>
                ))}
              </div>
              )}

              {/* Description */}
              {description && (
                <p className="text-gray-300 text-sm leading-relaxed mb-5">
                  {description}
                </p>
              )}

              {/* Key Features */}
              {features.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#F5841F] rounded-full" />
                  <h4 className="text-white font-bold text-sm">{th ? 'จุดเด่น' : 'Key Features'}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-gray-300 text-xs font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* CTA Button */}
              <button
                onClick={close}
                className="w-full py-3 bg-gradient-to-r from-[#1C1C1E] to-[#F5841F] hover:from-[#F5841F] hover:to-[#1C1C1E] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#1C1C1E]/25 text-sm"
              >
                {buttonLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
