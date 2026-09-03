import React from 'react';
import { Layers, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Layers,
  title = 'No Data Available',
  description = 'No matching infrastructure records found. Try modifying your filters or search query.',
  actionText,
  actionLabel,
  onAction,
  className = ''
}) => {
  const buttonLabel = actionLabel || actionText;

  return (
    <div className={`p-12 text-center command-panel bg-white border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800 font-heading">
        {title}
      </h3>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {buttonLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>{buttonLabel}</span>
        </button>
      )}
    </div>
  );
};
