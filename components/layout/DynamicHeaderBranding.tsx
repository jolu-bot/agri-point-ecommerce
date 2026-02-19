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
        mobile: 'w-11 h-11',
        tablet: 'w-13 h-13',
        desktop: 'w-15 h-15',
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
      <div className={`flex items-center ${headerConfig.spacing} animate-pulse ${className}`}>
        <div className={`${logoSizeClasses} bg-gray-200 dark:bg-gray-700 rounded-full`}></div>
        <div className="flex flex-col gap-1">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href="/" className={`flex items-center ${headerConfig.spacing} group ${className}`}>
      {/* Logo */}
      <div className={`relative ${logoSizeClasses} flex-shrink-0 transform group-hover:scale-105 transition-transform`}>
        <Image
          src={headerConfig.logo.url}
          alt={`${headerConfig.primaryText.content} Logo`}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 640px) 44px, (max-width: 1024px) 52px, 60px"
        />
      </div>

      {/* Textes */}
      <div className="flex flex-col min-w-0">
        {/* Texte principal */}
        <div 
          className={`font-display ${primaryTextSizeClasses} ${headerConfig.primaryText.fontWeight} ${headerConfig.primaryText.color} leading-tight whitespace-nowrap`}
        >
          {headerConfig.primaryText.content}
        </div>

        {/* Sous-titre */}
        <div 
          className={`${secondaryTextSizeClasses} ${headerConfig.secondaryText.color} dark:text-emerald-400 ${headerConfig.secondaryText.fontWeight} leading-tight whitespace-nowrap`}
        >
          {headerConfig.secondaryText.content}
        </div>
      </div>
    </Link>
  );
}
