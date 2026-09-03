import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actionText?: string;
  onAction?: () => void;
  actionNode?: React.ReactNode;
  legend?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  actionText,
  onAction,
  actionNode,
  legend,
  footer,
  children,
  className = ''
}) => {
  return (
    <div className={`command-panel p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between transition-all duration-200 ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 font-heading tracking-tight">
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-[#0d52ce] border border-blue-100">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {actionNode}
            {actionText && onAction && (
              <button
                onClick={onAction}
                className="text-xs font-bold text-[#0d52ce] hover:text-[#0b45ad] hover:underline flex items-center space-x-0.5 transition"
              >
                <span>{actionText}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        {legend && (
          <div className="mt-3">
            {legend}
          </div>
        )}

        {/* Chart Canvas */}
        <div className="mt-4">
          {children}
        </div>
      </div>

      {/* Optional Footnote / Context */}
      {footer && (
        <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          {footer}
        </div>
      )}
    </div>
  );
};
