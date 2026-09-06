import React from 'react';
import { SearchInfobox } from '../types';
import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface InstantAnswerProps {
  infobox: SearchInfobox;
}

export const InstantAnswer: React.FC<InstantAnswerProps> = ({ infobox }) => {
  const { settings } = useSettings();
  const targetAttr = settings.openInNewTab ? '_blank' : '_self';
  const relAttr = settings.openInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-indigo-500/5 to-transparent dark:from-cyan-950/20 dark:via-indigo-950/20 dark:to-transparent border border-cyan-500/20 dark:border-cyan-500/30 shadow-md">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
        <Sparkles className="w-4 h-4" />
        <span>Instant Knowledge</span>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
            <span>{infobox.title}</span>
            {infobox.url && (
              <a
                href={infobox.url}
                target={targetAttr}
                rel={relAttr}
                className="text-xs text-slate-400 hover:text-cyan-500 inline-flex items-center gap-1 font-normal font-sans"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Wikipedia
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </h2>

          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
            {infobox.content}
          </p>

          {infobox.attributes && infobox.attributes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-cyan-500/10 dark:border-cyan-500/20">
              {infobox.attributes.slice(0, 4).map((attr, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-100/60 dark:bg-zen-bg-darkCard/60">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{attr.label}:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold truncate ml-2">
                    {attr.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {infobox.imgSrc && (
          <div className="shrink-0 self-center md:self-start">
            <img
              src={infobox.imgSrc}
              alt={infobox.title}
              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl border border-slate-200 dark:border-zen-bg-darkBorder shadow-sm"
              onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
            />
          </div>
        )}
      </div>
    </div>
  );
};
