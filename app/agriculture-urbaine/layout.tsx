import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agriculture Urbaine | AGRIPOINT SERVICES — Cultivez en ville au Cameroun',
  description:
    'Découvrez nos solutions d\'agriculture urbaine : kits de culture sur balcon, biofertilisants adaptés aux petits espaces, jardins verticaux et potagers en appartement au Cameroun.',
  keywords: [
    'agriculture urbaine Cameroun', 'jardinage urbain', 'potager balcon', 'culture appartement',
    'biofertilisant urbain', 'kit jardinage', 'jardin vertical', 'Yaoundé Douala',
  ],
  openGraph: {
    title: 'Agriculture Urbaine — AGRIPOINT SERVICES',
    description: 'Cultivez fruits et légumes depuis votre balcon ou terrasse avec nos kits urbains et biofertilisants adaptés.',
    url: '/agriculture-urbaine',
    siteName: 'AGRIPOINT SERVICES',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Agriculture Urbaine — AGRIPOINT SERVICES',
    description: 'Kits de jardinage urbain et biofertilisants pour cultiver en ville au Cameroun.',
  },
  alternates: { canonical: '/agriculture-urbaine' },
};

export default function AgricultureUrbaineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
