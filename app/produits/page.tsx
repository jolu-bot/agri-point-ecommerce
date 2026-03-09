import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Offres Disponibles | AGRIPOINT SERVICES — Intrants & Solutions Agricoles au Cameroun',
  description:
    'Achetez en ligne nos biofertilisants, engrais minéraux et kits d\'agriculture urbaine. Livraison partout au Cameroun. Qualité certifiée MINADER.',
  keywords: [
    'acheter biofertilisant Cameroun', 'engrais en ligne', 'offres agricoles',
    'kits agriculture urbaine', 'biofertilisant prix', 'engrais minéral Cameroun',
  ],
  openGraph: {
    title: 'Offres Disponibles AGRIPOINT SERVICES — Intrants & Solutions',
    description: 'Des solutions biofertilisantes de qualité pour une agriculture performante. Livraison gratuite dès 6 sacs.',
    url: 'https://agri-point.cm/produits',
    siteName: 'AGRI POINT SERVICE',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Offres Disponibles — AGRIPOINT SERVICES',
    description: 'Biofertilisants et engrais de qualité. Livraison partout au Cameroun.',
  },
  alternates: { canonical: 'https://agri-point.cm/produits' },
};

// Server Component avec fetch côté serveur
export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('Erreur fetch produits:', res.status);
      return [];
    }
    
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Erreur chargement produits SSR:', error);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const initialProducts = await getProducts();
  const resolvedSearchParams = await searchParams;
  const initialSearch = resolvedSearchParams?.search || '';
  
  return <ProductsClient initialProducts={initialProducts} initialSearch={initialSearch} />;
}
