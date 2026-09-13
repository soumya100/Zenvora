import React, { useState } from 'react';
import { SearchResultItem } from '../types';
import { Images, ArrowRight, ExternalLink, X } from 'lucide-react';

interface VisualHighlightsProps {
  items: SearchResultItem[];
  subject: string;
  onViewAllImages: () => void;
}

export const VisualHighlights: React.FC<VisualHighlightsProps> = ({
  items,
  subject,
  onViewAllImages,
}) => {
  const [selectedImage, setSelectedImage] = useState<SearchResultItem | null>(null);

  if (!items || items.length === 0) {
    return null;
  }

  const displayItems = items.slice(0, 8);

  return (
    <section className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-blue-500/[0.04] dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-500/20 dark:border-cyan-500/25 shadow-sm">
      {/* Header with Title & "View all" action */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Images className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
            Images & Wallpapers for &ldquo;<span className="text-cyan-600 dark:text-cyan-400">{subject}</span>&rdquo;
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewAllImages}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline px-2.5 py-1 rounded-lg hover:bg-cyan-500/10 transition-colors"
        >
          <span>View all in Images</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Scrollable Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zen-bg-darkBorder no-scrollbar sm:scroll-auto">
        {displayItems.map((item) => {
          const rawSrc = item.imgSrc || item.thumbnail || item.url;
          const imageSrc = rawSrc?.startsWith('/i/') ? `https://duckduckgo.com${rawSrc}` : rawSrc;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative flex-shrink-0 w-36 sm:w-44 aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-zen-bg-darkSurface border border-slate-200/80 dark:border-zen-bg-darkBorder cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-cyan-500/50 hover:scale-[1.02]"
            >
              <img
                src={imageSrc}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <span className="text-[11px] font-medium text-white truncate drop-shadow-sm">
                  {item.title}
                </span>
                {item.resolution && (
                  <span className="text-[10px] font-mono text-cyan-300 drop-shadow-sm">
                    {item.resolution}
                  </span>
                )}
              </div>

              {item.resolution && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white/90 shadow-xs">
                  {item.resolution.includes('3840') || item.title.includes('4K') || item.title.includes('4k') ? '4K' : item.resolution}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Lightbox Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-zen-bg-darkSurface rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zen-bg-darkBorder flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-zen-bg-darkBorder flex items-center justify-between gap-3 shrink-0">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                {selectedImage.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-zen-bg-darkCard transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 sm:p-4 flex items-center justify-center flex-1 min-h-0 bg-slate-950/20 dark:bg-black/40 overflow-hidden">
              <img
                src={(() => {
                  const raw = selectedImage.imgSrc || selectedImage.thumbnail || selectedImage.url;
                  return raw?.startsWith('/i/') ? `https://duckduckgo.com${raw}` : raw;
                })()}
                alt={selectedImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-zen-bg-darkCard flex items-center justify-between gap-3 text-xs sm:text-sm shrink-0">
              <div className="text-slate-500 dark:text-slate-400 truncate">
                {selectedImage.domain && <span>Source: {selectedImage.domain}</span>}
                {selectedImage.resolution && <span className="ml-3 font-mono">({selectedImage.resolution})</span>}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedImage.imgSrc || selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-medium text-xs hover:bg-cyan-500 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
