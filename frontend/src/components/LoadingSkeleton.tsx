import React from 'react';
import { SearchCategory } from '../types';

interface LoadingSkeletonProps {
  category?: SearchCategory;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ category = 'general' }) => {
  if (category === 'images') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-xl bg-slate-200 dark:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder"
          />
        ))}
      </div>
    );
  }

  if (category === 'videos') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder"
          >
            <div className="aspect-video bg-slate-200 dark:bg-zen-bg-darkCard" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-zen-bg-darkCard rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-zen-bg-darkCard rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-zen-bg-darkCard rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white/50 dark:bg-zen-bg-darkSurface/50 border border-slate-200 dark:border-zen-bg-darkBorder space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-zen-bg-darkCard" />
            <div className="h-3 bg-slate-200 dark:bg-zen-bg-darkCard rounded w-28" />
          </div>
          <div className="h-5 bg-slate-200 dark:bg-zen-bg-darkCard rounded w-2/3" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-slate-200 dark:bg-zen-bg-darkCard rounded w-full" />
            <div className="h-3.5 bg-slate-200 dark:bg-zen-bg-darkCard rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
};
