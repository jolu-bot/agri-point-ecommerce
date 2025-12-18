'use client';

import { ReactNode } from 'react';

type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
type TextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

interface ResponsiveTextProps {
  children: ReactNode;
  as?: TextTag;
  size?: TextSize;
  className?: string;
  fluid?: boolean;
}

/**
 * Composant de texte responsive avec typographie fluide
 * Utilise clamp() pour des tailles qui s'adaptent automatiquement à tous les écrans
 */
export default function ResponsiveText({
  children,
  as: Tag = 'p',
  size = 'base',
  className = '',
  fluid = true,
}: ResponsiveTextProps) {
  const fluidClass = fluid ? `text-fluid-${size}` : `text-${size}`;
  
  return (
    <Tag className={`${fluidClass} ${className}`}>
      {children}
    </Tag>
  );
}

/**
 * Composants pré-configurés pour usage courant
 */
export function FluidHeading1({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <ResponsiveText as="h1" size="5xl" className={`font-bold ${className}`}>{children}</ResponsiveText>;
}

export function FluidHeading2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <ResponsiveText as="h2" size="4xl" className={`font-bold ${className}`}>{children}</ResponsiveText>;
}

export function FluidHeading3({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <ResponsiveText as="h3" size="3xl" className={`font-semibold ${className}`}>{children}</ResponsiveText>;
}

export function FluidParagraph({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <ResponsiveText as="p" size="base" className={className}>{children}</ResponsiveText>;
}
