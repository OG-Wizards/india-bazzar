// src/app/components/ui/badge.tsx
'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const variantClasses =
    variant === 'outline'
      ? 'bg-transparent border border-blue-500 text-blue-600'
      : 'bg-blue-100 text-blue-800';

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};
