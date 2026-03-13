import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gagner Plus | AGRIPOINT SERVICES — Augmentez vos revenus agricoles',
  description:
    'Découvrez comment AGRIPOINT SERVICES vous aide à maximiser vos revenus grâce à des intrants biologique de qualité, des techniques modernes et un accès facilité aux marchés.',
  keywords: [
    'revenus agricoles Cameroun', 'gagner plus agriculture', 'rentabilité fermière',
    'biofertilisant rendement', 'agriculture profitable', 'agribusiness Cameroun',
  ],
  openGraph: {
    title: 'Gagner Plus avec AGRIPOINT SERVICES',
    description: 'Des solutions concrètes pour augmenter vos revenus agricoles au Cameroun.',
    url: '/gagner-plus',
    siteName: 'AGRIPOINT SERVICES',
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: { canonical: '/gagner-plus' },
};

export default function GagnerPlusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
