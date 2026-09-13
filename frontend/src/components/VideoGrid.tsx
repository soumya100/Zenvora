import React from 'react';
import { SearchResultItem } from '../types';
import { Play, Clock, User } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface VideoGridProps {
  items: SearchResultItem[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({ items }) => {
  const { settings } = useSettings();
  const targetAttr = settings.openInNewTab ? '_blank' : '_self';
  const relAttr = settings.openInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target={targetAttr}
          rel={relAttr}
          className="group block rounded-2xl overflow-hidden bg-white/70 dark:bg-zen-bg-darkSurface/60 border border-slate-200 dark:border-zen-bg-darkBorder/70 hover:border-cyan-500/40 hover:shadow-xl transition-all duration-200"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
            <img
              src={(() => {
                const raw = item.thumbnail || item.imgSrc;
                if (!raw) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                return raw.startsWith('/i/') ? `https://duckduckgo.com${raw}` : raw;
              })()}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
              <div className="w-11 h-11 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {item.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono flex items-center gap-1 backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                {item.duration}
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
              {item.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
              {item.snippet}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-zen-bg-darkBorder/40">
              <div className="flex items-center gap-1.5 truncate">
                {item.author && (
                  <span className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3" />
                    {item.author}
                  </span>
                )}
                {!item.author && <span>{item.domain}</span>}
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-slate-100 dark:bg-zen-bg-darkCard text-cyan-600 dark:text-cyan-400">
                {item.engine}
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};
