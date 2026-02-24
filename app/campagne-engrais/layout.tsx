import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campagne Engrais Subventionnés 2026 | AGRI POINT SERVICE — -22% sur vos intrants',
  description:
    'Programme exceptionnel de campagne engrais 2026 : engrais minéraux à 18 500 FCFA (-16%) et biofertilisants à 12 000 FCFA (-20%). Paiement 70/30, livraison gratuite. Valable jusqu\'au 31 mars 2026.',
  keywords: [
    'campagne engrais 2026', 'engrais subventionnés Cameroun', 'prix engrais réduit',
    'biofertilisant pas cher', 'programme agricole MINADER', 'engrais 18500 FCFA',
    'campagne agricole Cameroun', 'coopérative agricole',
  ],
  openGraph: {
    title: 'Campagne Engrais Subventionnés 2026 — AGRI POINT SERVICE',
    description: 'Profitez de prix réduits jusqu\'à -22% sur nos engrais. Paiement échelonné 70/30. Livraison gratuite. Jusqu\'au 31 mars 2026.',
    url: 'https://agri-point.cm/campagne-engrais',
    siteName: 'AGRI POINT SERVICE',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campagne Engrais 2026 — Jusqu\'à -22% sur vos intrants',
    description: 'Engrais minéraux 18 500 FCFA, biofertilisants 12 000 FCFA. Paiement 70/30. Offre limitée.',
  },
  alternates: { canonical: 'https://agri-point.cm/campagne-engrais' },
};

export default function CampagneEngraisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
