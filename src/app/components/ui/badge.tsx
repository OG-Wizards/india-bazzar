// src/app/components/ui/badge.tsx
'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
<<<<<<< HEAD
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
=======
  variant?: 'default' | 'outline'; // NEW prop
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '', 
  variant = 'default' 
}) => {
  // Decide styles based on variant
  const variantClasses =
    variant === 'outline'
      ? 'bg-transparent border border-blue-500 text-blue-600'
      : 'bg-blue-100 text-blue-800';

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variantClasses} ${className}`}
    >
>>>>>>> 3c8752576aca0a492c0ab88f35e0a435764e0b1c
      {children}
    </span>
  );
}
