'use client';

import { useTheme } from '@/lib/theme';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full overflow-hidden transition-all duration-500 focus:outline-none"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)',
      }}
      title={isDark ? 'Light mode' : 'Dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Stars (dark mode) */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-1.5 left-2 animate-pulse" />
            <div className="absolute w-[3px] h-[3px] bg-white/80 rounded-full top-3 left-5" />
            <div className="absolute w-0.5 h-0.5 bg-white/60 rounded-full top-1 left-8 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute w-[3px] h-[3px] bg-white/70 rounded-full top-4 left-3.5 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute w-0.5 h-0.5 bg-white rounded-full bottom-1.5 right-3 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clouds (light mode) */}
      <AnimatePresence>
        {!isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <div className="absolute w-3 h-1.5 bg-white/40 rounded-full top-1 right-2" />
            <div className="absolute w-4 h-1.5 bg-white/30 rounded-full bottom-1.5 right-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sun / Moon orb */}
      <motion.div
        className="absolute top-0.5 flex items-center justify-center w-6 h-6 rounded-full shadow-md"
        layout
        animate={{
          left: isDark ? 'calc(100% - 26px)' : '2px',
          y: [8, 0],
        }}
        transition={{
          left: { type: 'spring', stiffness: 300, damping: 25 },
          y: { type: 'spring', stiffness: 200, damping: 15 },
        }}
      >
        {/* Sun */}
        <AnimatePresence mode="wait">
          {!isDark ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative w-6 h-6"
            >
              {/* Sun body */}
              <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#FDE68A] via-[#F5841F] to-[#EA580C] shadow-lg shadow-orange-300/50" />
              {/* Sun rays */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <div
                    key={deg}
                    className="absolute left-1/2 top-1/2 w-[2px] h-1 bg-[#F5841F]/60 rounded-full origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-10px)`,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative w-6 h-6"
            >
              {/* Moon body */}
              <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#FEF9C3] via-[#E2E8F0] to-[#CBD5E1] shadow-lg shadow-blue-200/30" />
              {/* Moon craters */}
              <div className="absolute w-1.5 h-1.5 bg-[#CBD5E1] rounded-full top-1.5 left-2.5 opacity-50" />
              <div className="absolute w-1 h-1 bg-[#CBD5E1] rounded-full bottom-2 left-1.5 opacity-40" />
              {/* Moon glow */}
              <div className="absolute -inset-0.5 rounded-full bg-yellow-100/20 blur-sm" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Horizon glow effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1.5"
        animate={{
          background: isDark
            ? 'linear-gradient(to top, rgba(30, 41, 59, 0.5), transparent)'
            : 'linear-gradient(to top, rgba(251, 191, 36, 0.3), transparent)',
        }}
        transition={{ duration: 0.5 }}
      />
    </button>
  );
}
