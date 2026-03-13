import HeroNew from '@/components/home/HeroNew';
import Stats from '@/components/home/Stats';
import Sections from '@/components/home/Sections';
import SectorsGrid from '@/components/home/SectorsGrid';
import dynamic from 'next/dynamic';

// Lazy load UNIQUEMENT les composants non-critiques (sous le fold)
const Newsletter = dynamic(() => import('@/components/home/Newsletter'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
});

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AGRIPOINT SERVICES SARL',
  url: 'https://agri-ps.com',
  description: 'Solutions biofertilisantes pour l\'agriculture périurbaine et urbaine au Cameroun.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://agri-ps.com/produits?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AGRIPOINT SERVICES SARL',
  url: 'https://agri-ps.com',
  logo: 'https://agri-ps.com/images/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+237-xxx-xxx-xxx',
    contactType: 'customer service',
    availableLanguage: ['French'],
    areaServed: 'CM',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Yaoundé',
    addressCountry: 'CM',
  },
  sameAs: [
    'https://www.facebook.com/agripointservices',
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      <HeroNew />
      <Stats />
      <Sections />
      <SectorsGrid />
      <Newsletter />
    </>
  );
}
