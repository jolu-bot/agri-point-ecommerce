/**
 * Générateur de métadonnées SEO et Open Graph
 * Centralise la création cohérente des métadonnées pour toutes les pages
 */

import type { Metadata } from 'next';

export interface SEOMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedDate?: Date;
  modifiedDate?: Date;
  canonicalUrl?: string;
  locale?: string;
  alternates?: { [key: string]: string };
}

const DEFAULT_IMAGE = `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;
const DEFAULT_LOCALE = 'fr_CM';

/**
 * Générer les métadonnées complètes avec Open Graph et Twitter Card
 */
export function generateSEOMetadata(params: SEOMetadataParams): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = DEFAULT_IMAGE,
    imageAlt = 'AGRIPOINT SERVICES',
    url = process.env.NEXT_PUBLIC_SITE_URL,
    type = 'website',
    author = 'AGRIPOINT SERVICES',
    publishedDate,
    modifiedDate,
    canonicalUrl = url,
    locale = DEFAULT_LOCALE,
    alternates = {},
  } = params;

  const openGraphType: 'website' | 'article' = type === 'article' ? 'article' : 'website';

  return {
    title: `${title} | AGRIPOINT SERVICES`,
    description,
    keywords: [
      ...keywords,
      'agriculture',
      'cameroon',
      'agribusiness',
      'produits agricoles',
      'engrais',
      'semences',
    ],
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    alternates: {
      canonical: canonicalUrl,
      ...alternates,
    },
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    openGraph: {
      title: `${title} | AGRIPOINT SERVICES`,
      description,
      url: canonicalUrl,
      type: openGraphType,
      siteName: 'AGRIPOINT SERVICES',
      locale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: 'image/png',
        },
        {
          url: image,
          width: 800,
          height: 600,
          alt: imageAlt,
          type: 'image/png',
        },
      ],
      ...(openGraphType === 'article' && {
        publishedTime: publishedDate?.toISOString(),
        modifiedTime: modifiedDate?.toISOString(),
        authors: [author],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | AGRIPOINT SERVICES`,
      description,
      images: [image],
      site: '@agripointcm',
      creator: '@agripointcm',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'AGRIPOINT SERVICES',
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
  };
}

/**
 * Générer les métadonnées pour les articles/blog
 */
export function generateArticleMetadata(
  title: string,
  description: string,
  options?: Partial<SEOMetadataParams> & {
    author?: string;
    publishedDate?: Date;
    modifiedDate?: Date;
  }
): Metadata {
  return generateSEOMetadata({
    ...options,
    title,
    description,
    type: 'article',
    author: options?.author || 'AGRIPOINT SERVICES',
    publishedDate: options?.publishedDate,
    modifiedDate: options?.modifiedDate,
  });
}

/**
 * Générer les métadonnées pour les produits
 */
export function generateProductMetadata(
  productName: string,
  description: string,
  image: string,
  price?: number,
  options?: Partial<SEOMetadataParams>
): Metadata {
  const metadata = generateSEOMetadata({
    ...options,
    title: productName,
    description,
    image,
    imageAlt: productName,
    type: 'product',
  });

  return {
    ...metadata,
    other: {
      'product:price:amount': price?.toString() || '',
      'product:price:currency': 'XAF',
      'product:category': 'Agriculture',
    },
  };
}

/**
 * Générer un JSON-LD structuré pour le SEO
 */
export function generateJsonLd(
  type: 'Organization' | 'LocalBusiness' | 'Article' | 'Product',
  data: Record<string, any>
) {
  const baseOrganization = {
    '@context': 'https://schema.org',
    '@type': type,
    name: 'AGRIPOINT SERVICES',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description:
      'Plateforme de commerce électronique pour les produits et services agricoles au Cameroun',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@agri-ps.com',
    telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+237657393939',
    sameAs: [
      'https://www.facebook.com/agripointservices',
      'https://twitter.com/agripointcm',
      'https://www.instagram.com/agripointcm',
    ],
  };

  if (type === 'LocalBusiness') {
    return {
      ...baseOrganization,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rue Cameroun, Zone administrative',
        addressLocality: 'Yaoundé',
        addressRegion: 'Centre',
        postalCode: '00237',
        addressCountry: 'CM',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '07:00',
          closes: '18:00',
        },
      ],
      ...data,
    };
  }

  return { ...baseOrganization, ...data };
}

/**
 * Composant pour injecter JSON-LD dans la page
 */
export function JsonLdScript({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
