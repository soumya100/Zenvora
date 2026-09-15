import React, { useState } from 'react';
import { SearchResultItem } from '../types';
import { ExternalLink, X, Download } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { getSafeUrl } from '../utils/security';

interface ImageGridProps {
  items: SearchResultItem[];
}

export const ImageGrid: React.FC<ImageGridProps> = ({ items }) => {
  const { settings } = useSettings();
  const [selectedImage, setSelectedImage] = useState<SearchResultItem | null>(null);

  const targetAttr = settings.openInNewTab ? '_blank' : '_self';
  const relAttr = settings.openInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item) => {
          const rawSrc = item.imgSrc || item.thumbnail || item.url;
          const imageSrc = rawSrc?.startsWith('/i/') ? `https://duckduckgo.com${rawSrc}` : rawSrc;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-cyan-500/40"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-zen-bg-darkCard">
                <img
                  src={imageSrc}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                <p className="text-xs font-semibold truncate drop-shadow">{item.title}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
                  <span className="truncate">{item.domain}</span>
                  {item.resolution && <span className="font-mono text-[10px]">{item.resolution}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-zen-bg-darkSurface rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zen-bg-darkBorder flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-zen-bg-darkBorder shrink-0">
              <div className="truncate pr-4">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                  {selectedImage.title}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {selectedImage.domain}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkCard transition-colors shrink-0"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 flex items-center justify-center flex-1 min-h-0 bg-slate-950/20 dark:bg-black/40 overflow-hidden">
              <img
                src={(() => {
                  const modalRaw = selectedImage.imgSrc || selectedImage.thumbnail || selectedImage.url;
                  return modalRaw?.startsWith('/i/') ? `https://duckduckgo.com${modalRaw}` : modalRaw;
                })()}
                alt={selectedImage.title}
                className="max-h-[55vh] sm:max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-zen-bg-darkCard flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {selectedImage.resolution && (
                  <span className="font-mono mr-3">Resolution: {selectedImage.resolution}</span>
                )}
                <span>Source: {selectedImage.engine}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={getSafeUrl(selectedImage.imgSrc || selectedImage.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zen-bg-darkBorder text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkSurface transition-colors text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  View Original
                </a>
                <a
                  href={getSafeUrl(selectedImage.url)}
                  target={targetAttr}
                  rel={relAttr}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-colors text-xs font-medium shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
