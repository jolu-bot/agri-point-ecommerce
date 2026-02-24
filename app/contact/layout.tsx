import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | AGRI POINT SERVICE — Parlez-nous de votre projet agricole',
  description:
    'Contactez l\'équipe AGRI POINT SERVICE pour vos commandes de biofertilisants, renseignements sur nos produits ou notre programme d\'accompagnement agricole au Cameroun.',
  keywords: [
    'contact AGRI POINT', 'biofertilisant Cameroun', 'commande engrais', 'support agricole',
    'téléphone Yaoundé', 'email agriculture', 'devis biofertilisant',
  ],
  openGraph: {
    title: 'Contactez AGRI POINT SERVICE',
    description: 'Notre équipe est disponible pour répondre à toutes vos questions sur nos solutions agricoles.',
    url: 'https://agri-point.cm/contact',
    siteName: 'AGRI POINT SERVICE',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact — AGRI POINT SERVICE',
    description: 'Besoin d\'information sur nos biofertilisants ? Contactez-nous.',
  },
  alternates: { canonical: 'https://agri-point.cm/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
