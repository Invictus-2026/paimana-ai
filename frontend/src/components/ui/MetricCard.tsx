import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type MetricAccentColor = 'navy' | 'blue' | 'orange' | 'red' | 'emerald' | 'amber' | 'purple';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    isIncreasePositive?: boolean;
    timeframe?: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  icon: React.ElementType;
  accentColor?: MetricAccentColor;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

const colorStyles: Record<MetricAccentColor, { bg: string; text: string; shadow: string; border: string }> = {
  navy: {
    bg: 'bg-[#0b172a]',
    text: 'text-white',
    shadow: 'shadow-slate-900/10',
    border: 'border-slate-800/20'
  },
  blue: {
    bg: 'bg-[#0d52ce]',
    text: 'text-white',
    shadow: 'shadow-[#0d52ce]/20',
    border: 'border-[#0d52ce]/20'
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-white',
    shadow: 'shadow-orange-500/20',
    border: 'border-orange-500/20'
  },
  red: {
    bg: 'bg-red-600',
    text: 'text-white',
    shadow: 'shadow-red-600/20',
    border: 'border-red-600/20'
  },
  emerald: {
    bg: 'bg-emerald-600',
    text: 'text-white',
    shadow: 'shadow-emerald-600/20',
    border: 'border-emerald-600/20'
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-white',
    shadow: 'shadow-amber-500/20',
    border: 'border-amber-500/20'
  },
  purple: {
    bg: 'bg-purple-600',
    text: 'text-white',
    shadow: 'shadow-purple-600/20',
    border: 'border-purple-600/20'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  accentColor = 'blue',
  badge,
  onClick,
  className = ''
}) => {
  const style = colorStyles[accentColor];

  return (
    <div
      onClick={onClick}
      className={`command-panel p-4.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#0d52ce] hover:shadow-md' : ''
      } ${className}`}
    >
      {/* Top row: Label & Icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            {badge && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          <div className="text-2xl lg:text-[1.65rem] font-black text-slate-900 tracking-tight font-heading tabular-nums">
            {value}
          </div>
        </div>

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${style.bg} ${style.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom row: Delta trend or Subtitle */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        {change ? (
          <div className="flex items-center space-x-1.5 font-semibold">
            {change.direction === 'down' ? (
              <span className={`inline-flex items-center gap-0.5 ${change.isIncreasePositive === false ? 'text-emerald-600' : 'text-red-600'} font-bold`}>
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{change.value}</span>
              </span>
            ) : change.direction === 'neutral' ? (
              <span className="inline-flex items-center gap-0.5 text-slate-500 font-bold">
                <Minus className="w-3.5 h-3.5" />
                <span>{change.value}</span>
              </span>
            ) : (
              <span className={`inline-flex items-center gap-0.5 ${change.isIncreasePositive ? 'text-emerald-600' : 'text-amber-600'} font-bold`}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{change.value}</span>
              </span>
            )}
            {change.timeframe && (
              <span className="text-slate-400 font-normal">{change.timeframe}</span>
            )}
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 font-medium truncate">{subtitle}</span>
        ) : (
          <span className="text-slate-400 text-[10px]">Verified MoSPI Feed</span>
        )}
      </div>
    </div>
  );
};
