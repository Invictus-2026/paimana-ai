import React from 'react';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical' | 'very high';

export interface RiskBadgeProps {
  score?: number;
  level?: RiskLevel | string;
  showScore?: boolean;
  showDot?: boolean;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const getRiskTierFromScore = (score: number): { level: RiskLevel; label: string } => {
  const normalized = score <= 1 && score > 0 ? Math.round(score * 100) : score;
  if (normalized >= 85) return { level: 'critical', label: 'Critical Risk' };
  if (normalized >= 60) return { level: 'high', label: 'High Risk' };
  if (normalized >= 35) return { level: 'moderate', label: 'Moderate' };
  return { level: 'low', label: 'Low Risk' };
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  level: rawLevel,
  showScore = true,
  showDot = true,
  pulse = false,
  size = 'md',
  className = ''
}) => {
  let level: RiskLevel = 'low';
  let label = 'Low Risk';

  if (typeof score === 'number') {
    const tier = getRiskTierFromScore(score);
    level = tier.level;
    label = tier.label;
  } else if (rawLevel) {
    const l = rawLevel.toLowerCase();
    if (l.includes('crit') || l.includes('very high')) {
      level = 'critical';
      label = 'Critical Risk';
    } else if (l.includes('high') || l.includes('at risk')) {
      level = 'high';
      label = 'High Risk';
    } else if (l.includes('mod') || l.includes('medium')) {
      level = 'moderate';
      label = 'Moderate';
    } else {
      level = 'low';
      label = 'Low Risk';
    }
  }

  const styles = {
    low: {
      container: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
      dot: 'bg-emerald-500',
    },
    moderate: {
      container: 'bg-amber-50 text-amber-800 border-amber-200/90',
      dot: 'bg-amber-500',
    },
    high: {
      container: 'bg-orange-50 text-orange-700 border-orange-200/90',
      dot: 'bg-orange-500',
    },
    critical: {
      container: 'bg-red-50 text-red-700 border-red-200/90',
      dot: 'bg-red-600',
    },
    'very high': {
      container: 'bg-red-50 text-red-700 border-red-200/90',
      dot: 'bg-red-600',
    },
  }[level];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2',
  }[size];

  const formattedScore = typeof score === 'number' 
    ? (score <= 1 && score > 0 ? (score * 100).toFixed(0) : Math.round(score)) 
    : null;

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-md border ${styles.container} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {(pulse || level === 'critical') && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${styles.dot}`} />
        </span>
      )}
      <span>{label}</span>
      {showScore && formattedScore !== null && (
        <span className="font-mono font-bold opacity-80">({formattedScore})</span>
      )}
    </span>
  );
};
