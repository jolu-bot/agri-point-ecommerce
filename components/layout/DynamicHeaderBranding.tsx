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
      url: '/images/logo.png',
      sizes: {
        mobile: 'w-12 h-12',
        tablet: 'w-15 h-15',
        desktop: 'w-18 h-18',
      },
    },
    primaryText: {
      content: 'AGRIPOINT SERVICES',
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
        <div className="w-[80px] h-[63px] sm:w-[96px] sm:h-[76px] lg:w-[110px] lg:h-[87px] bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
      </div>
    );
  }

  return (
    <Link href="/" className={`flex items-center group ${className}`}>
      {/* Logo icône */}
      <div className="flex-shrink-0 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-md group-hover:drop-shadow-lg">
        <Image
          src={headerConfig.logo.url}
          alt="AGRIPOINT SERVICES SAS — Logo officiel"
          width={1280}
          height={1012}
          className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
          priority
        />
      </div>
      {/* Texte AGRIPOINT collé + Services SAS */}
      <div className="flex flex-col ml-1.5 leading-none">
        <span className="text-sm sm:text-base lg:text-lg font-extrabold tracking-tight">
          <span className="text-red-500">AGRI</span><span className="text-emerald-600 dark:text-emerald-400">POINT</span>
        </span>
        <span className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
          Services <span className="text-gray-700 dark:text-gray-300 font-bold">SAS</span>
        </span>
      </div>
    </Link>
  );
}
