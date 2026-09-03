import React from 'react';
import { AlertTriangle, TrendingUp, CheckCircle2, ShieldAlert, ChevronRight } from 'lucide-react';

export type InsightType = 'warning' | 'analytics' | 'action' | 'critical';

export interface InsightCardProps {
  type?: InsightType;
  title?: string;
  text: string;
  metric?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const typeStyles: Record<InsightType, { border: string; bg: string; iconBg: string; iconColor: string; Icon: React.ElementType; label: string }> = {
  critical: {
    border: 'border-l-red-600',
    bg: 'bg-red-50/40 hover:bg-red-50/70',
    iconBg: 'bg-red-100 text-red-600',
    iconColor: 'text-red-600',
    Icon: ShieldAlert,
    label: 'Critical Alert',
  },
  warning: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50/40 hover:bg-orange-50/70',
    iconBg: 'bg-orange-100 text-orange-600',
    iconColor: 'text-orange-500',
    Icon: AlertTriangle,
    label: 'Risk Warning',
  },
  analytics: {
    border: 'border-l-[#0d52ce]',
    bg: 'bg-blue-50/40 hover:bg-blue-50/70',
    iconBg: 'bg-blue-100 text-[#0d52ce]',
    iconColor: 'text-[#0d52ce]',
    Icon: TrendingUp,
    label: 'Portfolio Trend',
  },
  action: {
    border: 'border-l-emerald-600',
    bg: 'bg-emerald-50/40 hover:bg-emerald-50/70',
    iconBg: 'bg-emerald-100 text-emerald-600',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
    label: 'Mitigation Opportunity',
  },
};

export const InsightCard: React.FC<InsightCardProps> = ({
  type = 'warning',
  title,
  text,
  metric,
  actionText,
  onAction,
  className = ''
}) => {
  const style = typeStyles[type];
  const Icon = style.Icon;

  return (
    <div
      onClick={onAction}
      className={`p-3.5 rounded-xl border border-slate-200/80 border-l-4 ${style.border} ${style.bg} transition-all duration-200 flex items-start justify-between gap-3 ${
        onAction ? 'cursor-pointer hover:shadow-xs' : ''
      } ${className}`}
    >
      <div className="flex items-start space-x-3 min-w-0">
        <div className={`w-7 h-7 rounded-lg ${style.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${style.iconColor}`}>
              {title || style.label}
            </span>
            {metric && (
              <span className="text-[11px] font-mono font-bold text-slate-800 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                {metric}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {text}
          </p>
          {actionText && (
            <p className="text-[11px] font-bold text-[#0d52ce] hover:underline pt-0.5">
              {actionText} →
            </p>
          )}
        </div>
      </div>

      {onAction && (
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
      )}
    </div>
  );
};
