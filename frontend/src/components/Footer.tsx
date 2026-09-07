import React from 'react';
import { ShieldCheck, Keyboard } from 'lucide-react';
import { ActivePage } from '../types';
import { useTranslation } from '../utils/i18n';

interface FooterProps {
  onNavigate: (page: ActivePage) => void;
  onOpenShortcuts: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenShortcuts }) => {
  const { t } = useTranslation();

  return (
    <footer className="w-full mt-auto border-t border-slate-200/80 dark:border-zen-bg-darkBorder/60 bg-slate-50/50 dark:bg-zen-bg-darkSurface/30 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            Zero query tracking or IP profiling
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
          <span>
            Powered by open-source{' '}
            <a
              href="https://searxng.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              SearXNG
            </a>
          </span>
        </div>

        <div className="flex items-center gap-4 select-none">
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            {t('about')}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            {t('privacyPolicy')}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/70 dark:bg-zen-bg-darkCard hover:bg-slate-300 dark:hover:bg-zen-bg-darkBorder transition-colors text-slate-600 dark:text-slate-300 font-mono text-[11px]"
            title={t('shortcutsTitle')}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>?</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
