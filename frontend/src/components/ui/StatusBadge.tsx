import React from 'react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm.includes('approved') || norm.includes('completed') || norm.includes('active')) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
  } else if (norm.includes('review') || norm.includes('moderate')) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200/90';
  } else if (norm.includes('proposed') || norm.includes('at risk')) {
    styles = 'bg-orange-50 text-orange-700 border-orange-200/90';
  } else if (norm.includes('critical') || norm.includes('high risk') || norm.includes('rejected')) {
    styles = 'bg-red-50 text-red-700 border-red-200/90';
  }

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-md border ${styles} ${sizeClass} ${className}`}
    >
      {status}
    </span>
  );
};
