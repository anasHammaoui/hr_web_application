import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const variants: Record<string, { text: string; color: string }> = {
    pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
    rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
    active: { text: 'Active', color: 'bg-blue-100 text-blue-800' },
    inactive: { text: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  };

  const variant = variants[status] || variants.pending;

  return (
    <Badge className={`${variant.color} ${className}`} variant="secondary">
      {variant.text}
    </Badge>
  );
}
