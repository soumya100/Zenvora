import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserSettings, ThemePreference } from '../types';

export const SETTINGS_STORAGE_KEY = 'zenvora_user_settings';
export const THEME_STORAGE_KEY = 'zenvora_theme';

export const DEFAULT_SETTINGS: UserSettings = {
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

export interface SettingsContextValue {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getInitialSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // Fallback
  }
  return DEFAULT_SETTINGS;
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(getInitialSettings);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return Boolean(window.matchMedia('(prefers-color-scheme: dark)')?.matches);
    }
    return false;
  });

  // Track system dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const isDark = useMemo(() => {
    return (
      settings.theme === 'dark' ||
      (settings.theme === 'system' && systemPrefersDark)
    );
  }, [settings.theme, systemPrefersDark]);

  // Synchronize DOM class with dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, settings.theme);
    } catch {
      // Ignore
    }
  }, [isDark, settings.theme]);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save settings to localStorage', err);
      }
      return updated;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextTheme: ThemePreference = isCurrentlyDark ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  }, [updateSettings]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      toggleTheme,
      isDark,
    }),
    [settings, updateSettings, toggleTheme, isDark]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    // Graceful fallback for components or tests rendered outside the Provider
    const fallbackSettings = getInitialSettings();
    const systemDark =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? Boolean(window.matchMedia('(prefers-color-scheme: dark)')?.matches)
        : false;
    const isDark =
      fallbackSettings.theme === 'dark' ||
      (fallbackSettings.theme === 'system' && systemDark);

    return {
      settings: fallbackSettings,
      updateSettings: () => {},
      toggleTheme: () => {},
      isDark,
    };
  }
  return context;
}
