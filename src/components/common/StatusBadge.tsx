import React from 'react';
import { BookingStatus, RoomStatus } from '../../types';

interface StatusBadgeProps {
  status: BookingStatus | RoomStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Approved':
      case 'Available':
        return {
          container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: status,
        };
      case 'Pending':
        return {
          container: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: status,
        };
      case 'Rejected':
      case 'Booked':
        return {
          container: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: status,
        };
      case 'Cancelled':
      case 'Unavailable':
      case 'Maintenance':
      default:
        return {
          container: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const style = getBadgeStyle();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${style.container} ${sizeClasses}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
      )}
      {style.label}
    </span>
  );
};
