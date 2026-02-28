/**
 * Optimisation des images Next.js
 * Utilities pour l'utilisation cohérente de next/image et l'optimisation
 */

import Image from 'next/image';
import { CSSProperties } from 'react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  /** Largeur de l'image */
  width?: number;
  /** Hauteur de l'image */
  height?: number;
  /** Mode de remplissage: cover, contain, fill, etc. */
  fill?: boolean;
  /** Classe Tailwind */
  className?: string;
  /** Priorité de chargement */
  priority?: boolean;
  /** Taille responsives */
  sizes?: string;
  /** Qualité de l'image (1-100) */
  quality?: number;
  /** Format souhaité */
  format?: 'webp' | 'avif' | string;
  /** Style CSS */
  style?: CSSProperties;
  /** Callback onLoadingComplete */
  onLoadingComplete?: () => void;
  /** Placeholder */
  placeholder?: 'blur' | 'empty';
  /** BlurDataURL pour placeholder */
  blurDataURL?: string;
}

/**
 * Wrapper optimisé pour les images produits
 */
export function OptimizedProductImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  priority = false,
  quality = 80,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      quality={quality}
      sizes={sizes}
      fill
      {...props}
    />
  );
}

/**
 * Wrapper optimisé pour les images d'article
 */
export function OptimizedArticleImage({
  src,
  alt,
  width = 800,
  height = 400,
  className = 'rounded-lg',
  quality = 75,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px',
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      quality={quality}
      priority={priority}
      sizes={sizes}
      {...props}
    />
  );
}

/**
 * Wrapper optimisé pour les images hero/bannières
 */
export function OptimizedHeroImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  quality = 75,
  priority = true,
  sizes = '100vw',
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      quality={quality}
      priority={priority}
      sizes={sizes}
      fill
      {...props}
    />
  );
}

/**
 * Wrapper optimisé pour les thumbnails/avatars
 */
export function OptimizedThumbnail({
  src,
  alt,
  width = 100,
  height = 100,
  className = 'rounded-full',
  quality = 60,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      quality={quality}
      {...props}
    />
  );
}

/**
 * Genere un BlurDataURL basé sur la couleur dominante
 * Utiliser avec: <Image placeholder="blur" blurDataURL={blurDataURL} />
 */
export function generateBlurDataURL(
  dominantColor: string = '#A3E635' // Couleur primaire par défaut
): string {
  // SVG blurred placeholder
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'>
      <filter id='blur'>
        <feGaussianBlur in='SourceGraphic' stdDeviation='5' />
      </filter>
      <rect width='10' height='10' fill='${dominantColor}' filter='url(#blur)' />
    </svg>
  `;

  // Encoder en base64
  return (
    'data:image/svg+xml;base64,' +
    Buffer.from(svg).toString('base64')
  );
}

/**
 * Configuration recommandée pour next/image
 * À utiliser dans next.config.js
 */
export const nextImageConfig = {
  // Domaines autorisés
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: '*.cloudinary.com' },
    { protocol: 'https', hostname: '*.amazonaws.com' },
    { protocol: 'http', hostname: 'localhost' },
  ],
  // Formats supportés par ordre de préférence
  formats: ['image/avif', 'image/webp'],
  // Tailles préférées
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
};

/**
 * Singletons pour les images statiques optimisées
 * À importer et réutiliser dans les layout
 */
export const StaticImages = {
  logo: '/logo.png',
  logoWhite: '/logo-white.png',
  favicon: '/favicon.ico',
  ogImage: '/og-image.png',
  heroPlaceholder: '/images/hero-placeholder.png',
} as const;

/**
 * Génère les sources srcset optimisées pour ResponsiveImage
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 960, 1280, 1920]
): string {
  return sizes
    .map((size) => {
      const scaledUrl = baseUrl.includes('?')
        ? `${baseUrl}&w=${size}`
        : `${baseUrl}?w=${size}`;
      return `${scaledUrl} ${size}w`;
    })
    .join(', ');
}

/**
 * Hook personnalisé pour l'optimisation d'images avec fallback
 */
export function useOptimizedImage(src: string | null, fallback = '/images/placeholder.png') {
  return src && src.trim() ? src : fallback;
}
