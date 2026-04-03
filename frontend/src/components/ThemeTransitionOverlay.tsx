'use client';

import { useTheme } from '@/lib/theme';
import { motion, AnimatePresence } from 'framer-motion';

const STARS = Array.from({ length: 50 }, (_, i) => ({
  w: (i * 7 + 3) % 4 + 1,
  x: (i * 37 + 13) % 100,
  y: (i * 23 + 7) % 65,
  delay: (i * 11) % 5 / 10 + 0.15,
}));

export default function ThemeTransitionOverlay() {
  const { isTransitioning, transitionTarget } = useTheme();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ pointerEvents: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Full sky background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, times: [0, 0.15, 0.75, 1] }}
            style={{
              background: transitionTarget === 'dark'
                ? 'linear-gradient(to top, #0c0a3e 0%, #1a1050 20%, #1e1b4b 40%, #0f172a 70%, #020617 100%)'
                : 'linear-gradient(to top, #fef3c7 0%, #fdba74 15%, #fb923c 25%, #7dd3fc 55%, #38bdf8 80%, #0ea5e9 100%)',
            }}
          />

          {/* Stars (dark mode) */}
          {transitionTarget === 'dark' && STARS.map((star, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: star.w,
                height: star.w,
                left: `${star.x}%`,
                top: `${star.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.9, 0.9, 0], scale: [0, 1, 1, 0] }}
              transition={{ duration: 2, delay: star.delay, times: [0, 0.25, 0.7, 1] }}
            />
          ))}

          {/* Clouds (light mode) */}
          {transitionTarget === 'light' && [
            { x: '8%', y: '22%', w: 200, h: 50, delay: 0.3 },
            { x: '55%', y: '15%', w: 180, h: 45, delay: 0.5 },
            { x: '30%', y: '35%', w: 150, h: 40, delay: 0.4 },
            { x: '75%', y: '30%', w: 120, h: 35, delay: 0.6 },
            { x: '15%', y: '45%', w: 160, h: 40, delay: 0.7 },
          ].map((c, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute rounded-full bg-white/40 blur-md"
              style={{ left: c.x, top: c.y, width: c.w, height: c.h }}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: [0, 0.7, 0.7, 0], x: [-60, 0, 20, 40] }}
              transition={{ duration: 2, delay: c.delay, times: [0, 0.25, 0.7, 1] }}
            />
          ))}

          {/* ===== SUN / MOON — RISING FROM BOTTOM CENTER ===== */}
          <motion.div
            className="absolute left-1/2"
            style={{ translateX: '-50%' }}
            initial={{ bottom: -200 }}
            animate={{ bottom: [-200, 'calc(40vh)', 'calc(40vh)', -200] }}
            transition={{ duration: 2, times: [0, 0.35, 0.65, 1], ease: 'easeInOut' }}
          >
            {transitionTarget === 'light' ? (
              /* ☀ RISING SUN */
              <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                {/* Outer glow */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 400, height: 400,
                    background: 'radial-gradient(circle, rgba(245,132,31,0.35) 0%, rgba(253,224,71,0.2) 30%, rgba(251,146,60,0.1) 50%, transparent 70%)',
                  }}
                  animate={{ scale: [0.6, 1.3, 1.1, 1.2] }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
                {/* Sun rays */}
                <motion.div
                  className="absolute" style={{ width: 300, height: 300 }}
                  animate={{ rotate: [0, 180] }}
                  transition={{ duration: 2, ease: 'linear' }}
                >
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="absolute left-1/2 top-1/2 origin-center"
                      style={{ transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)` }}>
                      <motion.div
                        className="rounded-full bg-gradient-to-t from-[#F5841F]/50 to-[#FDE68A]/20"
                        style={{ width: i % 2 === 0 ? 4 : 3, height: i % 2 === 0 ? 60 : 40, marginTop: -140 }}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.06 }}
                      />
                    </div>
                  ))}
                </motion.div>
                {/* Sun body */}
                <motion.div
                  className="relative rounded-full"
                  style={{
                    width: 160, height: 160,
                    background: 'radial-gradient(circle at 40% 35%, #FEF3C7 0%, #FDE68A 20%, #F5841F 55%, #EA580C 85%, #C2410C 100%)',
                    boxShadow: '0 0 80px rgba(245,132,31,0.7), 0 0 160px rgba(245,132,31,0.4), 0 0 240px rgba(245,132,31,0.2)',
                  }}
                  animate={{ scale: [0.3, 1.15, 1] }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            ) : (
              /* 🌙 RISING MOON */
              <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                {/* Outer glow */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 380, height: 380,
                    background: 'radial-gradient(circle, rgba(254,249,195,0.25) 0%, rgba(148,163,184,0.15) 30%, rgba(99,102,241,0.08) 50%, transparent 70%)',
                  }}
                  animate={{ scale: [0.6, 1.3, 1.1, 1.2] }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
                {/* Moon body */}
                <motion.div
                  className="relative rounded-full overflow-hidden"
                  style={{
                    width: 150, height: 150,
                    background: 'radial-gradient(circle at 45% 40%, #FEFCE8 0%, #FEF9C3 20%, #E2E8F0 55%, #CBD5E1 85%, #94A3B8 100%)',
                    boxShadow: '0 0 60px rgba(254,249,195,0.5), 0 0 120px rgba(203,213,225,0.3), 0 0 200px rgba(148,163,184,0.2)',
                  }}
                  animate={{ scale: [0.3, 1.15, 1] }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <div className="absolute w-8 h-8 rounded-full bg-[#CBD5E1]/40 top-5 left-9" />
                  <div className="absolute w-5 h-5 rounded-full bg-[#CBD5E1]/30 bottom-7 left-4" />
                  <div className="absolute w-4 h-4 rounded-full bg-[#CBD5E1]/25 top-12 right-5" />
                  <div className="absolute w-3 h-3 rounded-full bg-[#CBD5E1]/20 bottom-10 right-8" />
                  <div className="absolute inset-0 rounded-full"
                    style={{ background: 'radial-gradient(circle at 75% 25%, transparent 35%, rgba(15,23,42,0.12) 100%)' }}
                  />
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Horizon glow */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: '35vh' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, times: [0, 0.2, 0.7, 1] }}
          >
            <div className="absolute inset-0" style={{
              background: transitionTarget === 'light'
                ? 'linear-gradient(to top, rgba(245,132,31,0.5) 0%, rgba(253,224,71,0.3) 30%, rgba(251,146,60,0.15) 60%, transparent 100%)'
                : 'linear-gradient(to top, rgba(30,27,75,0.6) 0%, rgba(99,102,241,0.2) 30%, rgba(15,23,42,0.1) 60%, transparent 100%)',
            }} />
          </motion.div>

          {/* Sparkle particles (light mode) */}
          {transitionTarget === 'light' && Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-1 h-1 rounded-full bg-[#FDE68A]"
              style={{ left: `${30 + (i * 41 % 40)}%`, bottom: '15%' }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: [0, -(100 + (i * 31 % 200))], x: [(i % 2 === 0 ? -1 : 1) * (i * 17 % 60)] }}
              transition={{ duration: 1.5, delay: 0.2 + (i * 7 % 8) / 10, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
