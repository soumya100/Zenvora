import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useSettings();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl border border-zen-bg-lightBorder dark:border-zen-bg-darkBorder hover:bg-slate-200 dark:hover:bg-zen-bg-darkSurface text-slate-600 dark:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zen-accent-cyan/50 ${className}`}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label="Toggle dark/light theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
};
