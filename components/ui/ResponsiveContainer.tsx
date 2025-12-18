'use client';

import { ReactNode } from 'react';

type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

interface ResponsiveContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  padding?: boolean;
  className?: string;
}

/**
 * Container responsive avec padding fluide
 * S'adapte automatiquement à toutes les tailles d'écran
 */
export default function ResponsiveContainer({
  children,
  size = '2xl',
  padding = true,
  className = '',
}: ResponsiveContainerProps) {
  const maxWidthClass = size === 'full' ? 'w-full' : `max-w-container-${size}`;
  const paddingClass = padding ? 'px-4 sm:px-6 lg:px-8' : '';
  
  return (
    <div className={`${maxWidthClass} mx-auto ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Container avec padding fluide utilisant les variables CSS
 */
export function FluidContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`container-fluid ${className}`}>
      {children}
    </div>
  );
}
