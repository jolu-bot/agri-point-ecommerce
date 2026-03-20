import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import ProductComparerClient from '@/components/products/ProductComparerClient';

export const metadata: Metadata = {
  title: 'Comparateur de produits — AGRIPOINT SERVICES',
  description: 'Comparez les biofertilisants et engrais AGRIPOINT côte à côte pour choisir le produit adapté à vos cultures.',
  robots: { index: false },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ p1?: string; p2?: string; p3?: string }>;
}) {
  const sp = await searchParams;
  const slugs = [sp.p1, sp.p2, sp.p3].filter((s): s is string => Boolean(s && s.trim()));

  if (slugs.length < 2) redirect('/produits');

  await connectDB();

  const products = await Promise.all(
    slugs.map(slug => Product.findOne({ slug, isActive: true }).lean())
  );

  const validProducts = products.filter(Boolean);
  if (validProducts.length < 2) redirect('/produits');

  return <ProductComparerClient products={validProducts as any[]} />;
}
