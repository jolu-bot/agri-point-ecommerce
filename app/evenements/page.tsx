import type { Metadata } from 'next';
import EventsClient from './EventsClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';

export const metadata: Metadata = {
  title: 'Événements — AGRIPOINT SERVICES',
  description:
    'Formations agricoles, journées de démonstration et conférences AGRIPOINT SERVICES au Cameroun. Inscrivez-vous à nos prochains événements.',
  openGraph: {
    title: 'Événements — AGRIPOINT SERVICES',
    description: 'Découvrez et inscrivez-vous aux événements agricoles AGRIPOINT SERVICES.',
    url: '/evenements',
  },
  alternates: { canonical: '/evenements' },
};

export default function EventsPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Événements', item: `${BASE_URL}/evenements` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <EventsClient />
    </>
  );
}
