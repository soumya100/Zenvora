import React from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import { Settings, Shield, Info, Github } from 'lucide-react';
import { ActivePage } from '../types';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onOpenSettings: () => void;
  showSearchBar?: boolean;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onOpenSettings,
  showSearchBar = false,
  searchQuery = '',
  onSearch,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zen-bg-dark/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zen-bg-darkBorder/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-xl"
            aria-label="Go to Zenvora home"
          >
            <Logo size={showSearchBar ? 'sm' : 'md'} showWordmark={true} />
          </button>
        </div>

        {showSearchBar && onSearch && (
          <div className="flex-1 max-w-2xl px-2">
            <SearchBar
              initialValue={searchQuery}
              onSearch={onSearch}
              size="normal"
            />
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              activePage === 'about'
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkSurface'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              activePage === 'privacy'
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkSurface'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy</span>
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-slate-200 dark:border-zen-bg-darkBorder text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkSurface transition-colors"
            title="Source Code on GitHub"
            aria-label="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>

          <ThemeToggle />

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl border border-slate-200 dark:border-zen-bg-darkBorder text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkSurface transition-colors"
            title="Search Settings"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
