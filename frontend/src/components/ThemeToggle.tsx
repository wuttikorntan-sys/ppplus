'use client';

import { useTheme } from '@/lib/theme';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, isTransitioning, startTransition } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={startTransition}
      disabled={isTransitioning}
      className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 disabled:pointer-events-none"
      title={isDark ? 'Light mode' : 'Dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait">
        {!isDark ? (
          <motion.div
            key="sun-btn"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.3 }}
            className="relative w-5 h-5"
          >
            <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#FDE68A] to-[#F5841F]" />
            <motion.svg viewBox="0 0 20 20" className="absolute inset-0 w-5 h-5" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line key={deg} x1="10" y1="0" x2="10" y2="3" stroke="#F5841F" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${deg} 10 10)`} opacity="0.7" />
              ))}
            </motion.svg>
          </motion.div>
        ) : (
          <motion.div
            key="moon-btn"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -90 }}
            transition={{ duration: 0.3 }}
            className="relative w-5 h-5"
          >
            <svg viewBox="0 0 20 20" className="w-5 h-5">
              <path d="M10 2a8 8 0 0 0 0 16 8 8 0 0 1 0-16z" fill="url(#moonGrad)" />
              <circle cx="8" cy="7" r="1" fill="#CBD5E1" opacity="0.4" />
              <circle cx="11" cy="11" r="0.7" fill="#CBD5E1" opacity="0.3" />
              <defs>
                <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FEF9C3" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-full bg-yellow-100/20 blur-sm scale-150" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
