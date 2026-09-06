import { useState, useEffect } from 'react';
import { UserSettings, ThemePreference } from '../types';

const SETTINGS_STORAGE_KEY = 'zenvora_user_settings';
const THEME_STORAGE_KEY = 'zenvora_theme';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  logoScheme: 'sunset',
  safeSearch: 1,
  language: 'auto',
  region: 'auto',
  resultsPerPage: 20,
  openInNewTab: true,
  defaultCategory: 'general',
  infiniteScroll: false,
  showSuggestions: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const applyTheme = (theme: ThemePreference) => {
      const root = document.documentElement;
      const systemDark =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? Boolean(window.matchMedia('(prefers-color-scheme: dark)')?.matches)
          : false;

      if (theme === 'dark' || (theme === 'system' && systemDark)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(settings.theme);
    localStorage.setItem(THEME_STORAGE_KEY, settings.theme);

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = () => {
        if (settings.theme === 'system') {
          applyTheme('system');
        }
      };

      mediaQuery?.addEventListener?.('change', handleSystemChange);
      return () => mediaQuery?.removeEventListener?.('change', handleSystemChange);
    }
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save settings to localStorage', err);
      }
      return updated;
    });
  };

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextTheme: ThemePreference = isCurrentlyDark ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return {
    settings,
    updateSettings,
    toggleTheme,
    isDark:
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        Boolean(window.matchMedia('(prefers-color-scheme: dark)')?.matches)),
  };
}
