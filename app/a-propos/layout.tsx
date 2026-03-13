import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À Propos | AGRIPOINT SERVICES — Distributeur de biofertilisants au Cameroun',
  description:
    'Découvrez AGRIPOINT SERVICES, acteur engagé de l\'agriculture camerounaise depuis 2010. Notre mission : rendre les intrants biologiques accessibles à tous les agriculteurs.',
  keywords: [
    'AGRIPOINT SERVICES', 'à propos', 'biofertilisant', 'agriculture Cameroun',
    'entreprise agricole', 'Yaoundé', 'mission', 'valeurs',
  ],
  openGraph: {
    title: 'À Propos — AGRIPOINT SERVICES',
    description: 'Acteur engagé de l\'agriculture camerounaise. Biofertilisants de qualité, mission durable.',
    url: '/a-propos',
    siteName: 'AGRIPOINT SERVICES',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'À Propos — AGRIPOINT SERVICES',
    description: 'Acteur engagé de l\'agriculture camerounaise depuis 2010.',
  },
  alternates: { canonical: '/a-propos' },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AGRIPOINT SERVICES SARL',
  url: 'https://agri-ps.com',
  logo: 'https://agri-ps.com/images/logo.png',
  foundingDate: '2010',
  description: 'Distributeur de biofertilisants et de solutions agricoles pour l\'agriculture périurbaine et urbaine au Cameroun.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Yaoundé',
    addressCountry: 'CM',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+237-xxx-xxx-xxx',
    contactType: 'customer service',
    availableLanguage: ['French'],
  },
};

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      {children}
    </>
  );
}

