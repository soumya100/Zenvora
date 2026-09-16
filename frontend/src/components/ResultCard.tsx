import React, { useState } from 'react';
import { SearchResultItem } from '../types';
import { ExternalLink, Copy, Check, Lock, Sparkles } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { getSafeUrl } from '../utils/security';

interface ResultCardProps {
  item: SearchResultItem;
  query?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ item, query }) => {
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetAttr = settings.openInNewTab ? '_blank' : '_self';
  const relAttr = 'noopener noreferrer';

  const engineLabel = item.engines && item.engines.length > 0 ? item.engines.join(', ') : item.engine;
  const safeHref = getSafeUrl(item.url);

  return (
    <article className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-200 ${
      item.isNavigational
        ? 'bg-emerald-500/[0.03] dark:bg-emerald-950/20 border-emerald-500/40 dark:border-emerald-500/40 shadow-sm'
        : 'bg-white/70 dark:bg-zen-bg-darkSurface/60 hover:bg-white dark:hover:bg-zen-bg-darkSurface border border-slate-200/80 dark:border-zen-bg-darkBorder/60 hover:border-cyan-500/30 dark:hover:border-cyan-500/30'
    } hover:shadow-lg dark:hover:shadow-glow-cyan/5`}>
      <div className="flex items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-2 truncate text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zen-bg-darkCard border border-slate-200 dark:border-zen-bg-darkBorder/80 text-slate-600 dark:text-slate-300 truncate">
            <Lock className="w-3 h-3 text-cyan-500 shrink-0" />
            {item.domain}
          </span>
          {item.isNavigational && (
            <span className="inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
              <Check className="w-3 h-3 text-emerald-500" />
              Official Website
            </span>
          )}
          {item.publishedDate && (
            <span className="shrink-0 text-slate-400 dark:text-slate-500">• {item.publishedDate}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {engineLabel && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zen-bg-darkCard text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-zen-bg-darkBorder">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              {engineLabel}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-zen-bg-darkCard transition-colors"
            title="Copy URL"
            aria-label="Copy result link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <h2 className="text-base sm:text-lg font-bold leading-snug mb-2 text-slate-900 dark:text-slate-100">
        <a
          href={safeHref}
          target={targetAttr}
          rel={relAttr}
          className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors inline-flex items-baseline gap-1.5 focus:outline-none focus:underline"
        >
          <span>{item.title}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 inline shrink-0" />
        </a>
      </h2>

      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
        {item.snippet}
      </p>

      {item.thumbnail && (
        <div className="mt-3 flex items-center">
          <img
            src={item.thumbnail.startsWith('/i/') ? `https://duckduckgo.com${item.thumbnail}` : item.thumbnail}
            alt=""
            loading="lazy"
            className="h-16 w-24 object-cover rounded-lg border border-slate-200 dark:border-zen-bg-darkBorder"
            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
          />
        </div>
      )}
    </article>
  );
};
