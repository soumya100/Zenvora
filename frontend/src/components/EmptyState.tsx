import React from 'react';
import { SearchX, HelpCircle, Lightbulb } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface EmptyStateProps {
  query: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ query, onSuggestionClick }) => {
  const { t } = useTranslation();
  const suggestions = [
    'Linux server security',
    'Self-hosted privacy tools',
    'TypeScript best practices',
    'Docker Compose orchestration',
  ];

  return (
    <div className="py-12 px-4 text-center max-w-xl mx-auto animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 flex items-center justify-center text-cyan-500">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {t('noResultsTitle')}: &ldquo;{query}&rdquo;
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        {t('noResultsDesc')}
      </p>

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder text-left mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
          <HelpCircle className="w-4 h-4 text-cyan-500" />
          Search Recommendations
        </h4>
        <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
          <li>Check your spelling or try fewer, more specific keywords.</li>
          <li>Try broader search terms or synonyms.</li>
          <li>Switch search categories (e.g. from Science to General).</li>
          <li>Verify SafeSearch level in Settings if results might be filtered.</li>
        </ul>
      </div>

      {onSuggestionClick && (
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-3 flex items-center justify-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Or explore trending topics:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSuggestionClick(item)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-zen-bg-darkCard hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-zen-bg-darkBorder transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
