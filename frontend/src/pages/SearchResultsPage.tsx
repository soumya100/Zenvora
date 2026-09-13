import React from 'react';
import { CategoryTabs } from '../components/CategoryTabs';
import { ResultCard } from '../components/ResultCard';
import { ImageGrid } from '../components/ImageGrid';
import { VideoGrid } from '../components/VideoGrid';
import { NewsList } from '../components/NewsList';
import { InstantAnswer } from '../components/InstantAnswer';
import { Pagination } from '../components/Pagination';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { SearchCategory, SearchResponse, SearchResultItem } from '../types';
import { Zap, Clock, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface SearchResultsPageProps {
  query: string;
  category: SearchCategory;
  page: number;
  response: SearchResponse | null;
  results: SearchResultItem[];
  isLoading: boolean;
  error: string | null;
  onCategoryChange: (category: SearchCategory) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onNewSearch: (query: string) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  query,
  category,
  page,
  response,
  results,
  isLoading,
  error,
  onCategoryChange,
  onPageChange,
  onRetry,
  onNewSearch,
}) => {
  const { t } = useTranslation();

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <h1 className="sr-only">
        {t('searchLabel')}: &ldquo;{query}&rdquo;
      </h1>
      <div className="w-full max-w-full border-b border-slate-200 dark:border-zen-bg-darkBorder/80 pb-2 mb-4">
        <CategoryTabs
          activeCategory={category}
          onSelectCategory={onCategoryChange}
          align="start"
        />
      </div>

      {!isLoading && !error && response && results.length > 0 && response.category === category && (
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 px-1 select-none">
          <div className="flex items-center gap-2">
            <span>
              {t('resultsCount', {
                count: formatNumber(response.numberOfResults),
                duration: response.searchDuration,
              })}
            </span>
            {response.cached && (
              <span className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono">
                <Zap className="w-2.5 h-2.5" /> {t('cached')}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>Private Metasearch</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="max-w-3xl">
          <LoadingSkeleton category={category} />
        </div>
      )}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={onRetry} />
      )}

      {!isLoading && !error && results.length === 0 && (
        <EmptyState query={query} onSuggestionClick={onNewSearch} />
      )}

      {!isLoading && !error && results.length > 0 && (!response || response.category === category) && (
        <div className="max-w-4xl">
          {response?.infoboxes && response.infoboxes.length > 0 && category === 'general' && (
            <InstantAnswer infobox={response.infoboxes[0]} />
          )}

          {category === 'images' ? (
            <ImageGrid items={results} />
          ) : category === 'videos' ? (
            <VideoGrid items={results} />
          ) : category === 'news' ? (
            <NewsList items={results} />
          ) : (
            <div className="space-y-4">
              {results.map((item) => (
                <ResultCard key={item.id} item={item} query={query} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            onPageChange={onPageChange}
            totalResults={response?.numberOfResults}
            resultsPerPage={category === 'images' ? 16 : 10}
            hasMore={
              results.length > 0 &&
              (results.length >= (category === 'images' ? 16 : 10) ||
                (typeof response?.numberOfResults === 'number' &&
                  page * (category === 'images' ? 16 : 10) < response.numberOfResults))
            }
          />
        </div>
      )}
    </div>
  );
};
