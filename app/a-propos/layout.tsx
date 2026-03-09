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
    url: 'https://agri-point.cm/a-propos',
    siteName: 'AGRIPOINT SERVICES',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'À Propos — AGRIPOINT SERVICES',
    description: 'Acteur engagé de l\'agriculture camerounaise depuis 2010.',
  },
  alternates: { canonical: 'https://agri-point.cm/a-propos' },
};

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
