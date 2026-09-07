import React from 'react';
import { SearchCategory } from '../types';
import { Globe, Newspaper, Image, Film, FlaskConical, Terminal } from 'lucide-react';
import { useTranslation, TranslationKey } from '../utils/i18n';

interface CategoryTabsProps {
  activeCategory: SearchCategory;
  onSelectCategory: (category: SearchCategory) => void;
  className?: string;
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
}) => {
  const { t } = useTranslation();

  return (
    <nav className={`flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none select-none ${className}`} aria-label="Search Categories">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            id={`tab-${cat.id}`}
            data-testid={`category-tab-${cat.id}`}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkSurface border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-500' : 'text-slate-400'}`} />
            <span>{t(cat.translationKey)}</span>
          </button>
        );
      })}
    </nav>
  );
};
