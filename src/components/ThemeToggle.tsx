'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('schoolrent_theme');
    const initial: Theme = saved === 'light' || saved === 'dark' ? saved : systemTheme();
    document.documentElement.dataset.theme = initial;
    setTheme(initial);
    setMounted(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = (event: MediaQueryListEvent) => {
      if (localStorage.getItem('schoolrent_theme')) return;
      const nextTheme: Theme = event.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = nextTheme;
      setTheme(nextTheme);
    };
    media.addEventListener('change', followSystem);
    return () => media.removeEventListener('change', followSystem);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('schoolrent_theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      aria-label={mounted && theme === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
      title={mounted && theme === 'dark' ? 'Tema terang' : 'Tema gelap'}
    >
      {mounted && theme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
