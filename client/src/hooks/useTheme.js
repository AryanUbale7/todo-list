import { useState, useEffect } from 'react';

/**
 * Custom hook for system-aware Dark/Light mode theme management
 * @returns {[boolean, (darkMode: boolean | ((prev: boolean) => boolean)) => void]}
 */
export function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('taskpulse_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('taskpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('taskpulse_theme', 'light');
    }
  }, [darkMode]);

  return [darkMode, setDarkMode];
}
