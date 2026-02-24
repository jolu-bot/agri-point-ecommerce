import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gagner Plus | AGRI POINT SERVICE — Augmentez vos revenus agricoles',
  description:
    'Découvrez comment AGRI POINT vous aide à maximiser vos revenus grâce à des intrants biologique de qualité, des techniques modernes et un accès facilité aux marchés.',
  keywords: [
    'revenus agricoles Cameroun', 'gagner plus agriculture', 'rentabilité fermière',
    'biofertilisant rendement', 'agriculture profitable', 'agribusiness Cameroun',
  ],
  openGraph: {
    title: 'Gagner Plus avec AGRI POINT SERVICE',
    description: 'Des solutions concrètes pour augmenter vos revenus agricoles au Cameroun.',
    url: 'https://agri-point.cm/gagner-plus',
    siteName: 'AGRI POINT SERVICE',
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: { canonical: 'https://agri-point.cm/gagner-plus' },
};

export default function GagnerPlusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
