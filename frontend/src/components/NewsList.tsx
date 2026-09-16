import React from 'react';
import { SearchResultItem } from '../types';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { getSafeUrl } from '../utils/security';

interface NewsListProps {
  items: SearchResultItem[];
}

export const NewsList: React.FC<NewsListProps> = ({ items }) => {
  const { settings } = useSettings();
  const targetAttr = settings.openInNewTab ? '_blank' : '_self';
  const relAttr = 'noopener noreferrer';

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-zen-bg-darkSurface/60 hover:bg-white dark:hover:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder/60 hover:border-cyan-500/30 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <Newspaper className="w-3.5 h-3.5" />
              {item.domain}
            </span>
            {item.publishedDate && (
              <span className="flex items-center gap-1">
                • <Calendar className="w-3 h-3" /> {item.publishedDate}
              </span>
            )}
            {item.author && <span className="hidden sm:inline">• By {item.author}</span>}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            <a
              href={getSafeUrl(item.url)}
              target={targetAttr}
              rel={relAttr}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors inline-flex items-baseline gap-1"
            >
              <span>{item.title}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 hover:opacity-100 transition-opacity text-slate-400 shrink-0" />
            </a>
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
            {item.snippet}
          </p>
        </article>
      ))}
    </div>
  );
};
