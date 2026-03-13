import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Événements | AGRIPOINT SERVICES — Formation & Rencontres Agricoles au Cameroun',
  description:
    'Participez aux événements, ateliers et formations organisés par AGRIPOINT SERVICES. Rencontrez des experts en agriculture périurbaine et biofertilisants.',
  keywords: [
    'événements agricoles Cameroun', 'formation agriculture', 'atelier biofertilisant',
    'rencontre agriculteurs Yaoundé', 'symposium agriculture urbaine',
  ],
  openGraph: {
    title: 'Événements — AGRIPOINT SERVICES',
    description: 'Formations, ateliers et rencontres agricoles au Cameroun.',
    url: '/evenements',
    siteName: 'AGRIPOINT SERVICES',
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: { canonical: '/evenements' },
};

const eventSeriesLd = {
  '@context': 'https://schema.org',
  '@type': 'EventSeries',
  name: 'Événements AGRIPOINT SERVICES',
  description: 'Formations, ateliers et rencontres agricoles organisés par AGRIPOINT SERVICES au Cameroun.',
  url: 'https://agri-ps.com/evenements',
  organizer: {
    '@type': 'Organization',
    name: 'AGRIPOINT SERVICES SARL',
    url: 'https://agri-ps.com',
  },
  location: {
    '@type': 'Place',
    name: 'Yaoundé, Cameroun',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Yaoundé',
      addressCountry: 'CM',
    },
  },
};

export default function EvenementsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSeriesLd) }} />
      {children}
    </>
  );
}
