'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { usePreviewMode } from '@/contexts/PreviewModeContext';

interface DynamicHeaderBrandingProps {
  className?: string;
}

/**
 * Composant Header Branding Dynamique
 * Utilise la configuration du CMS (SiteConfig) pour afficher le logo et les textes
 * Tout est configurable depuis l'interface admin /admin/site-config-advanced
 * Supporte le mode prévisualisation pour tester les changements avant sauvegarde
 */
export default function DynamicHeaderBranding({ className = '' }: DynamicHeaderBrandingProps) {
  const { config, loading } = useSiteConfig();
  const { isPreviewMode, previewConfig } = usePreviewMode();

  // Configuration par défaut en cas de chargement ou d'erreur
  const defaultConfig = {
    logo: {
      url: '/images/logo.svg',
      sizes: {
        mobile: 'w-12 h-12',
        tablet: 'w-15 h-15',
        desktop: 'w-18 h-18',
      },
    },
    primaryText: {
      content: 'AGRI POINT',
      sizes: {
        mobile: 'text-sm',
        tablet: 'text-lg',
        desktop: 'text-xl',
      },
      fontWeight: 'font-extrabold',
      color: 'text-gradient-primary',
    },
    secondaryText: {
      content: 'Service Agricole',
      sizes: {
        mobile: 'text-[10px]',
        tablet: 'text-xs',
        desktop: 'text-xs',
      },
      fontWeight: 'font-semibold',
      color: 'text-emerald-600',
    },
    spacing: 'gap-2',
  };

  // Utiliser previewConfig si le mode preview est actif, sinon config normale
  const activeConfig = isPreviewMode && previewConfig ? previewConfig : config;
  const headerConfig = activeConfig?.header || defaultConfig;

  // Classes CSS pour les tailles (Tailwind)
  const logoSizeClasses = `${headerConfig.logo.sizes.mobile} sm:${headerConfig.logo.sizes.tablet} lg:${headerConfig.logo.sizes.desktop}`;
  const primaryTextSizeClasses = `${headerConfig.primaryText.sizes.mobile} xs:text-base sm:${headerConfig.primaryText.sizes.tablet} lg:${headerConfig.primaryText.sizes.desktop}`;
  const secondaryTextSizeClasses = `${headerConfig.secondaryText.sizes.mobile} sm:${headerConfig.secondaryText.sizes.tablet}`;

  if (loading) {
    return (
      <div className={`flex items-center animate-pulse ${className}`}>
        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-[4.5rem] lg:h-[4.5rem] bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
      </div>
    );
  }

  return (
    <Link href="/" className={`flex items-center group ${className}`}>
      {/* Logo agrandi — seul élément de marque visible */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-[4.5rem] lg:h-[4.5rem] flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md group-hover:drop-shadow-lg">
        <Image
          src={headerConfig.logo.url}
          alt={`${headerConfig.primaryText.content} Logo`}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 640px) 48px, (max-width: 1024px) 64px, 72px"
        />
      </div>
    </Link>
  );
}
