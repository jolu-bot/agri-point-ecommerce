import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campagne Engrais Subventionnés 2026 | AGRIPOINT SERVICES — -22% sur vos intrants',
  description:
    'Programme exceptionnel de campagne engrais 2026 : engrais minéraux à 18 500 FCFA (-16%) et biofertilisants à 12 000 FCFA (-20%). Paiement 70/30, livraison gratuite. Valable jusqu\'au 31 mars 2026.',
  keywords: [
    'campagne engrais 2026', 'engrais subventionnés Cameroun', 'prix engrais réduit',
    'biofertilisant pas cher', 'programme agricole MINADER', 'engrais 18500 FCFA',
    'campagne agricole Cameroun', 'coopérative agricole',
  ],
  openGraph: {
    title: 'Campagne Engrais Subventionnés 2026 — AGRIPOINT SERVICES',
    description: 'Profitez de prix réduits jusqu\'à -22% sur nos engrais. Paiement échelonné 70/30. Livraison gratuite. Jusqu\'au 31 mars 2026.',
    url: '/campagne-engrais',
    siteName: 'AGRIPOINT SERVICES',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campagne Engrais 2026 — Jusqu\'à -22% sur vos intrants',
    description: 'Engrais minéraux 18 500 FCFA, biofertilisants 12 000 FCFA. Paiement 70/30. Offre limitée.',
  },
  alternates: { canonical: '/campagne-engrais' },
};

const siteUrl = 'https://agri-ps.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Campagne Engrais Subventionnés 2026',
  url: `${siteUrl}/campagne-engrais`,
  description: 'Programme de vente d\'engrais subventionnés pour coopératives agricoles au Cameroun — campagne 2026.',
  provider: {
    '@type': 'Organization',
    name: 'AGRIPOINT SERVICES SARL',
    url: siteUrl,
  },
  mainEntity: [
    {
      '@type': 'Offer',
      name: 'Engrais Minéraux Subventionnés',
      description: 'Engrais minéraux NPK 50 kg à 15 000 FCFA (prix normal 25 000 FCFA) — campagne 2026.',
      price: '15000',
      priceCurrency: 'XAF',
      priceValidUntil: '2026-03-31',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'AGRIPOINT SERVICES SARL' },
    },
    {
      '@type': 'Offer',
      name: 'Biofertilisants',
      description: 'Biofertilisants liquides à 10 000 FCFA/L (prix normal 16 000 FCFA) — campagne 2026.',
      price: '10000',
      priceCurrency: 'XAF',
      priceValidUntil: '2026-03-31',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'AGRIPOINT SERVICES SARL' },
    },
  ],
};

export default function CampagneEngraisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
