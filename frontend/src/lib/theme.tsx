'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
  transitionTarget: Theme;
  startTransition: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isTransitioning: false,
  transitionTarget: 'dark',
  startTransition: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('ppplus-theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ppplus-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const startTransition = useCallback(() => {
    if (isTransitioning) return;
    const next = theme === 'light' ? 'dark' : 'light';
    setTransitionTarget(next);
    setIsTransitioning(true);

    // Apply theme at animation peak
    setTimeout(() => {
      setTheme(next);
    }, 800);

    // End animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000);
  }, [theme, isTransitioning]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning, transitionTarget, startTransition }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
