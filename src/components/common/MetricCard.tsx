import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  colorScheme?: 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  colorScheme = 'blue',
}) => {
  const schemeClasses = {
    blue: {
      bg: 'bg-blue-50/70 text-blue-600 border-blue-100',
      accent: 'border-l-blue-600',
    },
    amber: {
      bg: 'bg-amber-50/70 text-amber-600 border-amber-100',
      accent: 'border-l-amber-500',
    },
    emerald: {
      bg: 'bg-emerald-50/70 text-emerald-600 border-emerald-100',
      accent: 'border-l-emerald-500',
    },
    rose: {
      bg: 'bg-rose-50/70 text-rose-600 border-rose-100',
      accent: 'border-l-rose-500',
    },
    indigo: {
      bg: 'bg-indigo-50/70 text-indigo-600 border-indigo-100',
      accent: 'border-l-indigo-600',
    },
  }[colorScheme];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <p
              className={`mt-1 text-xs font-medium flex items-center gap-1 ${
                trend.positive ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              <span>{trend.value}</span>
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${schemeClasses.bg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
