import React from 'react';
import { format } from 'date-fns';

interface DateDisplayProps {
  date: Date | string;
  formatString?: string;
  className?: string;
}

export function DateDisplay({
  date,
  formatString = 'MMM dd, yyyy',
  className = '',
}: DateDisplayProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return (
    <time dateTime={dateObj.toISOString()} className={className}>
      {format(dateObj, formatString)}
    </time>
  );
}
