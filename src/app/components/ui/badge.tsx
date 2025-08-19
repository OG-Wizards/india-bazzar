// src/app/components/ui/badge.tsx
'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'outline' | 'default'; // <- add this if needed
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const baseStyles = 'px-2 py-1 rounded-full text-sm font-medium';
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    outline: 'border border-blue-500 text-blue-600',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
