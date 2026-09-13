import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SearchCategory } from '../types';
import { Globe, Newspaper, Image, Film, FlaskConical, Terminal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation, TranslationKey } from '../utils/i18n';

interface CategoryTabsProps {
  activeCategory: SearchCategory;
  onSelectCategory: (category: SearchCategory) => void;
  className?: string;
  align?: 'center' | 'start';
}

interface CategoryConfig {
  id: SearchCategory;
  translationKey: TranslationKey;
  icon: React.FC<{ className?: string }>;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'general', translationKey: 'catAll', icon: Globe },
  { id: 'news', translationKey: 'catNews', icon: Newspaper },
  { id: 'images', translationKey: 'catImages', icon: Image },
  { id: 'videos', translationKey: 'catVideos', icon: Film },
  { id: 'science', translationKey: 'catScience', icon: FlaskConical },
  { id: 'it', translationKey: 'catIt', icon: Terminal },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  className = '',
  align = 'center',
}) => {
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Partial<Record<SearchCategory, HTMLButtonElement | null>>>({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollState = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Tolerance of 3px to handle subpixel rounding
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 3);
  }, []);

  // Update scroll bounds on mount, resize, and category change
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    checkScrollState();

    const handleResize = () => checkScrollState();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => checkScrollState());
    observer.observe(el);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [checkScrollState]);

  // Smoothly scroll active category into view
  useEffect(() => {
    const activeBtn = buttonRefs.current[activeCategory];
    if (activeBtn && navRef.current) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    // Recheck scroll state after animation
    const timeout = setTimeout(checkScrollState, 350);
    return () => clearTimeout(timeout);
  }, [activeCategory, checkScrollState]);

  const scrollByOffset = (direction: 'left' | 'right') => {
    if (!navRef.current) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className={`relative w-full max-w-full group ${className}`}>
      {/* Left Edge Gradient Fade */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 sm:w-10 z-10 pointer-events-none bg-gradient-to-r from-zen-bg-light dark:from-zen-bg-dark to-transparent transition-opacity duration-200 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Left Scroll Button (Visible on hover on desktop when scrollable) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByOffset('left')}
          aria-label="Scroll tabs left"
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 items-center justify-center rounded-full bg-white/90 dark:bg-zen-bg-darkSurface/90 shadow-md border border-slate-200 dark:border-zen-bg-darkBorder text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Scrollable Tabs Track */}
      <nav
        ref={navRef}
        onScroll={checkScrollState}
        className={`w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth select-none touch-pan-x py-1 px-3 sm:px-1 ${
          align === 'center' ? 'justify-start sm:justify-center' : 'justify-start'
        }`}
        style={{
          justifyContent: align === 'center' ? 'safe center' : 'flex-start',
        }}
        aria-label="Search Categories"
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              ref={(el) => {
                buttonRefs.current[cat.id] = el;
              }}
              id={`tab-${cat.id}`}
              data-testid={`category-tab-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 min-h-[38px] rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                isActive
                  ? 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkSurface border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-500' : 'text-slate-400'}`} />
              <span>{t(cat.translationKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Edge Gradient Fade */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 sm:w-10 z-10 pointer-events-none bg-gradient-to-l from-zen-bg-light dark:from-zen-bg-dark to-transparent transition-opacity duration-200 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Right Scroll Button (Visible on hover on desktop when scrollable) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByOffset('right')}
          aria-label="Scroll tabs right"
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 items-center justify-center rounded-full bg-white/90 dark:bg-zen-bg-darkSurface/90 shadow-md border border-slate-200 dark:border-zen-bg-darkBorder text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
