import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | AGRIPOINT SERVICES — Parlez-nous de votre projet agricole',
  description:
    'Contactez l\'équipe AGRIPOINT SERVICES pour vos commandes de biofertilisants, renseignements sur nos produits ou notre programme d\'accompagnement agricole au Cameroun.',
  keywords: [
    'contact AGRIPOINT SERVICES', 'biofertilisant Cameroun', 'commande engrais', 'support agricole',
    'téléphone Yaoundé', 'email agriculture', 'devis biofertilisant',
  ],
  openGraph: {
    title: 'Contactez AGRIPOINT SERVICES',
    description: 'Notre équipe est disponible pour répondre à toutes vos questions sur nos solutions agricoles.',
    url: '/contact',
    siteName: 'AGRIPOINT SERVICES',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact — AGRIPOINT SERVICES',
    description: 'Besoin d\'information sur nos biofertilisants ? Contactez-nous.',
  },
  alternates: { canonical: '/contact' },
};

const localBusinessLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'AGRIPOINT SERVICES SARL',
  url: 'https://agri-ps.com',
  telephone: '+237-xxx-xxx-xxx',
  email: 'contact@agri-ps.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Yaoundé',
    addressLocality: 'Yaoundé',
    addressRegion: 'Centre',
    addressCountry: 'CM',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 3.848,
    longitude: 11.502,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '08:00',
      closes: '13:00',
    },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      {children}
    </>
  );
}

