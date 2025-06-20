import React from 'react';
import { BadgeVariant } from '@/types';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  type?: BadgeVariant | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeVariants: Record<BadgeVariant | 'default', string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

const badgeSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  type = 'default',
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        badgeVariants[type],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;