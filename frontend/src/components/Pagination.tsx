import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalResults?: number;
  resultsPerPage?: number;
  hasMore?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  onPageChange,
  totalResults,
  resultsPerPage = 10,
  hasMore = true,
}) => {
  // 1. Calculate total pages
  let calculatedTotalPages = 1;
  if (typeof totalResults === 'number' && totalResults > 0) {
    calculatedTotalPages = Math.max(1, Math.ceil(totalResults / resultsPerPage));
  } else {
    calculatedTotalPages = hasMore ? currentPage + 4 : currentPage;
  }

  // If hasMore is false, total pages cannot exceed current page
  const totalPages = !hasMore ? Math.min(calculatedTotalPages, currentPage) : calculatedTotalPages;

  // If there's only 1 page (or 0) on page 1, do not render pagination
  if (totalPages <= 1 && currentPage === 1) {
    return null;
  }

  // 2. Generate smart page numbers with ellipses
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-8 pb-12 select-none">
      <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Pagination">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => {
            if (currentPage > 1) onPageChange(currentPage - 1);
          }}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Mobile Compact Page Indicator */}
        <div className="flex sm:hidden items-center px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zen-bg-darkCard border border-slate-200 dark:border-zen-bg-darkBorder text-xs font-semibold text-slate-700 dark:text-slate-200">
          Page {currentPage} of {totalPages.toLocaleString()}
        </div>

        {/* Desktop / Tablet Full Page Numbers */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 sm:w-10 text-center text-slate-400 dark:text-slate-500 font-bold"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-medium transition-all ${
                  isCurrent
                    ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/25 scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-zen-bg-darkSurface border border-transparent'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages || !hasMore}
          onClick={() => {
            if (currentPage < totalPages && hasMore) onPageChange(currentPage + 1);
          }}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Page Info Status Indicator */}
      <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
        Page <span className="text-cyan-500 font-semibold">{currentPage}</span> of{' '}
        <span className="font-semibold">{totalPages.toLocaleString()}</span>
        {typeof totalResults === 'number' && totalResults > 0 && (
          <span> • {totalResults.toLocaleString()} results found</span>
        )}
      </div>
    </div>
  );
};

