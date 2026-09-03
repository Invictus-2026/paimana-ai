import React from 'react';

export interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'chart' | 'line';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = ''
}) => {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="command-panel p-4.5 bg-white border border-slate-200/90 rounded-2xl animate-pulse space-y-3">
            <div className="flex justify-between items-start">
              <div className="h-3 bg-slate-200 rounded w-24" />
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 bg-slate-200 rounded w-32" />
            <div className="h-3 bg-slate-100 rounded w-20 pt-2 border-t border-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`command-panel p-5 bg-white border border-slate-200/90 rounded-2xl animate-pulse space-y-4 ${className}`}>
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-4 bg-slate-200 rounded w-36" />
            <div className="h-3 bg-slate-100 rounded w-48" />
          </div>
          <div className="h-4 bg-slate-100 rounded w-20" />
        </div>
        <div className="h-56 bg-slate-100 rounded-xl w-full" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded w-full" />
      ))}
    </div>
  );
};
