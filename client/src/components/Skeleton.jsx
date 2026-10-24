import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-4 space-y-4">
    <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-2 border-b border-slate-50 dark:border-slate-800/50">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
