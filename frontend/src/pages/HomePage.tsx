import React from 'react';
import { Logo } from '../components/Logo';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { SearchCategory } from '../types';
import { Shield, EyeOff, Cpu, Compass } from 'lucide-react';

interface HomePageProps {
  onSearch: (query: string, category: SearchCategory) => void;
  selectedCategory: SearchCategory;
  onSelectCategory: (category: SearchCategory) => void;
  onOpenPrivacy: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSearch,
  selectedCategory,
  onSelectCategory,
  onOpenPrivacy,
}) => {
  const trendingQueries = [
    'Linux server security',
    'Docker multi-stage build',
    'Self-hosted privacy cloud',
    'TypeScript strict mode patterns',
    'Zero knowledge encryption',
  ];

  const handleSearchSubmit = (query: string) => {
    onSearch(query, selectedCategory);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[32rem] h-72 sm:h-[32rem] bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-violet-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          <Logo size="lg" showWordmark={true} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 mb-2">
          Private. Open. Search.
        </h1>

        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          Aggregate search results from across the web without query logs, profiling, or tracking cookies.
        </p>

        <div className="w-full max-w-full px-1 sm:px-0 mb-6 flex justify-center">
          <div className="w-full max-w-2xl">
            <CategoryTabs
              activeCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              align="center"
            />
          </div>
        </div>

        <div className="w-full mb-6">
          <SearchBar
            onSearch={handleSearchSubmit}
            size="large"
            autoFocus={true}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-14 text-xs">
          <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-500" /> Explore:
          </span>
          {trendingQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSearch(item, selectedCategory)}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zen-bg-darkSurface hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-zen-bg-darkBorder text-slate-600 dark:text-slate-300 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zen-bg-darkSurface/50 border border-slate-200/80 dark:border-zen-bg-darkBorder/60 backdrop-blur-sm transition-all hover:border-cyan-500/30">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-3">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Zero Query History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Searches are never saved or tied to user identifiers. Your curiosity stays entirely private.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zen-bg-darkSurface/50 border border-slate-200/80 dark:border-zen-bg-darkBorder/60 backdrop-blur-sm transition-all hover:border-indigo-500/30">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              IP Shielding Proxy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upstream providers only see Zenvora&apos;s server IP. Your real client IP and browser fingerprint are masked.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zen-bg-darkSurface/50 border border-slate-200/80 dark:border-zen-bg-darkBorder/60 backdrop-blur-sm transition-all hover:border-purple-500/30">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Open Metasearch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Combines indexed results from Google, Brave, Wikipedia, and Reddit for balanced, unbiased discovery.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span>Learn more about how Zenvora protects your data</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
