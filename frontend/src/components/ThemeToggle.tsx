'use client';

import { useTheme } from '@/lib/theme';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [animating, setAnimating] = useState(false);
  const [nextTheme, setNextTheme] = useState<'light' | 'dark'>('light');

  const handleToggle = () => {
    const next = isDark ? 'light' : 'dark';
    setNextTheme(next);
    setAnimating(true);

    // Apply theme change during animation peak
    setTimeout(() => {
      toggleTheme();
    }, 600);

    // End animation
    setTimeout(() => {
      setAnimating(false);
    }, 1400);
  };

  return (
    <>
      {/* Toggle Button — Sun icon (light) / Moon icon (dark) */}
      <button
        onClick={handleToggle}
        disabled={animating}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 disabled:pointer-events-none group"
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
              {/* Sun body */}
              <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#FDE68A] to-[#F5841F]" />
              {/* Sun rays */}
              <motion.svg
                viewBox="0 0 20 20"
                className="absolute inset-0 w-5 h-5"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <line
                    key={deg}
                    x1="10" y1="0" x2="10" y2="3"
                    stroke="#F5841F"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    transform={`rotate(${deg} 10 10)`}
                    opacity="0.7"
                  />
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
                <path
                  d="M10 2a8 8 0 0 0 0 16 8 8 0 0 1 0-16z"
                  fill="url(#moonGrad)"
                  stroke="none"
                />
                <circle cx="8" cy="7" r="1" fill="#CBD5E1" opacity="0.4" />
                <circle cx="11" cy="11" r="0.7" fill="#CBD5E1" opacity="0.3" />
                <defs>
                  <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FEF9C3" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Moon glow */}
              <div className="absolute inset-0 rounded-full bg-yellow-100/20 blur-sm scale-150" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Full-screen transition overlay */}
      <AnimatePresence>
        {animating && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Sky background */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.4, times: [0, 0.15, 0.7, 1] }}
              style={{
                background: nextTheme === 'dark'
                  ? 'radial-gradient(ellipse at 50% 120%, #1e1b4b 0%, #0f172a 40%, #020617 80%)'
                  : 'radial-gradient(ellipse at 50% 120%, #fef3c7 0%, #7dd3fc 40%, #38bdf8 80%)',
              }}
            />

            {/* Stars (going to dark mode) */}
            {nextTheme === 'dark' && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 1, 0] }}
                transition={{ duration: 1.4, times: [0, 0.2, 0.4, 0.7, 1] }}
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: Math.random() * 3 + 1,
                      height: Math.random() * 3 + 1,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 60}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0] }}
                    transition={{
                      duration: 1.4,
                      delay: Math.random() * 0.3 + 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Clouds (going to light mode) */}
            {nextTheme === 'light' && (
              <motion.div className="absolute inset-0">
                {[
                  { x: '15%', y: '30%', w: 120, delay: 0.3 },
                  { x: '70%', y: '25%', w: 100, delay: 0.5 },
                  { x: '40%', y: '20%', w: 80, delay: 0.4 },
                ].map((cloud, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/30 blur-sm"
                    style={{ left: cloud.x, top: cloud.y, width: cloud.w, height: cloud.w * 0.4 }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: [0, 0.6, 0], x: 0 }}
                    transition={{ duration: 1.2, delay: cloud.delay }}
                  />
                ))}
              </motion.div>
            )}

            {/* Rising Sun / Moon orb */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              initial={{ bottom: '-120px' }}
              animate={{ bottom: ['−120px', '35%', '35%', '-120px'] }}
              transition={{
                duration: 1.4,
                times: [0, 0.35, 0.65, 1],
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {nextTheme === 'light' ? (
                /* Rising Sun */
                <motion.div className="relative">
                  {/* Sun glow */}
                  <motion.div
                    className="absolute -inset-16 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(245,132,31,0.3) 0%, rgba(253,224,71,0.15) 40%, transparent 70%)',
                    }}
                    animate={{ scale: [0.8, 1.2, 1, 1.1] }}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                  />
                  {/* Sun rays */}
                  <motion.div
                    className="absolute -inset-10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute left-1/2 top-1/2 origin-bottom"
                        style={{
                          transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                        }}
                      >
                        <motion.div
                          className="w-1 rounded-full bg-gradient-to-t from-[#F5841F]/60 to-transparent"
                          style={{ height: 20 + Math.random() * 15, marginTop: -45 }}
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      </div>
                    ))}
                  </motion.div>
                  {/* Sun body */}
                  <motion.div
                    className="relative w-24 h-24 rounded-full shadow-2xl"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #FDE68A 0%, #F5841F 50%, #EA580C 100%)',
                      boxShadow: '0 0 60px rgba(245,132,31,0.6), 0 0 120px rgba(245,132,31,0.3)',
                    }}
                    animate={{ scale: [0.5, 1.1, 1] }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </motion.div>
              ) : (
                /* Rising Moon */
                <motion.div className="relative">
                  {/* Moon glow */}
                  <motion.div
                    className="absolute -inset-16 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(254,249,195,0.3) 0%, rgba(148,163,184,0.15) 40%, transparent 70%)',
                    }}
                    animate={{ scale: [0.8, 1.2, 1, 1.1] }}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                  />
                  {/* Moon body */}
                  <motion.div
                    className="relative w-24 h-24 rounded-full shadow-2xl overflow-hidden"
                    style={{
                      background: 'radial-gradient(circle at 40% 40%, #FEF9C3 0%, #E2E8F0 50%, #CBD5E1 100%)',
                      boxShadow: '0 0 60px rgba(254,249,195,0.5), 0 0 120px rgba(203,213,225,0.3)',
                    }}
                    animate={{ scale: [0.5, 1.1, 1] }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    {/* Moon craters */}
                    <div className="absolute w-5 h-5 rounded-full bg-[#CBD5E1]/40 top-4 left-6" />
                    <div className="absolute w-3 h-3 rounded-full bg-[#CBD5E1]/30 bottom-5 left-3" />
                    <div className="absolute w-2 h-2 rounded-full bg-[#CBD5E1]/25 top-8 right-4" />
                    {/* Shadow crescent */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 70% 30%, transparent 40%, rgba(15,23,42,0.15) 100%)',
                      }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>

            {/* Horizon glow */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.8, 0] }}
              transition={{ duration: 1.4, times: [0, 0.2, 0.7, 1] }}
              style={{
                background: nextTheme === 'light'
                  ? 'linear-gradient(to top, rgba(245,132,31,0.4), rgba(253,224,71,0.2), transparent)'
                  : 'linear-gradient(to top, rgba(30,27,75,0.5), rgba(99,102,241,0.15), transparent)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
