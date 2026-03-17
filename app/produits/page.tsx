import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bientôt Disponible | AGRIPOINT SERVICES',
  description: 'Nos offres de biofertilisants, engrais minéraux et kits agriculture urbaine arrivent bientôt. Revenez nous voir très prochainement.',
  robots: { index: false, follow: false },
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-950 dark:to-emerald-950/20 px-4">
      {/* Badge */}
      <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        En cours de préparation
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white text-center mb-4 tracking-tight">
        Bientôt Disponible
      </h1>
      <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 text-center max-w-lg mb-10">
        Nos offres de biofertilisants, engrais minéraux et kits d&apos;agriculture urbaine sont en cours de mise à jour.
        Revenez très prochainement&nbsp;!
      </p>

      {/* Decorative icon */}
      <div className="mb-10 w-24 h-24 rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center">
        <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.71.71m13.14 13.14.71.71M3 12H2m20 0h-1M4.22 19.78l.71-.71M18.36 5.64l.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-emerald-600/20 text-center"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center"
        >
          Nous contacter
        </Link>
      </div>

      {/* Brand */}
      <p className="mt-12 text-sm text-gray-400 dark:text-gray-600 font-medium tracking-wide uppercase">
        AGRIPOINT SERVICES SARL — Cameroun
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ORIGINAL PAGE — désactivée temporairement (ne pas supprimer)
   Pour réactiver : supprimer le composant Coming Soon ci-dessus et décommenter
   tout le bloc ci-dessous.
─────────────────────────────────────────────────────────────────────────────

import ProductsClient from './ProductsClient';

export const metadata_ORIGINAL: Metadata = {
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
    url: '/produits',
    siteName: 'AGRIPOINT SERVICES',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Offres Disponibles — AGRIPOINT SERVICES',
    description: 'Biofertilisants et engrais de qualité. Livraison partout au Cameroun.',
  },
  alternates: { canonical: '/produits' },
};

export const dynamic_ORIGINAL = 'force-dynamic';

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) { console.error('Erreur fetch produits:', res.status); return []; }
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Erreur chargement produits SSR:', error);
    return [];
  }
}

export default async function ProductsPage_ORIGINAL({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const initialProducts = await getProducts();
  const resolvedSearchParams = await searchParams;
  const initialSearch = resolvedSearchParams?.search || '';

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Offres Disponibles — AGRIPOINT SERVICES',
    description: 'Biofertilisants, engrais minéraux et kits agriculture urbaine. Livraison partout au Cameroun.',
    url: 'https://agri-ps.com/produits',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://agri-ps.com' },
        { '@type': 'ListItem', position: 2, name: 'Produits', item: 'https://agri-ps.com/produits' },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <ProductsClient initialProducts={initialProducts} initialSearch={initialSearch} />
    </>
  );
}
─────────────────────────────────────────────────────────────────────────────── */
