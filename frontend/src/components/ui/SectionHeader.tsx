import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  badge?: string | number;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  category,
  icon: Icon,
  action,
  badge,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 ${className}`}>
      <div className="space-y-0.5">
        <div className="flex items-center space-x-2.5">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0d52ce] flex items-center justify-center shrink-0 border border-blue-100">
              <Icon className="w-4 h-4" />
            </div>
          )}
          {category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d52ce] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {category}
            </span>
          )}
          <h2 className="text-base lg:text-lg font-bold text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {badge !== undefined && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {badge}
              </span>
            )}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium pl-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center space-x-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
