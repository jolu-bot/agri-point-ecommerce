import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailClient from '@/components/products/ProductDetailClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true }).select('slug').lean() as { slug: string }[];
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const product = await Product.findOne({ slug, isActive: true }).lean() as any;
    if (!product) return { title: 'Produit non trouvé — AGRIPOINT' };

    const title = product.metaTitle || `${product.name} — AGRIPOINT SERVICES`;
    const description =
      product.metaDescription ||
      (product.description as string)?.slice(0, 160) ||
      'Solutions agricoles de qualité au Cameroun.';
    const price = (product.promoPrice || product.price) as number;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/produits/${slug}`,
        images: [
          {
            url: `/api/og?title=${encodeURIComponent(product.name)}&subtitle=${encodeURIComponent(`${price.toLocaleString()} FCFA`)}`,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      alternates: { canonical: `/produits/${slug}` },
    };
  } catch {
    return { title: 'Produit — AGRIPOINT SERVICES' };
  }
}

export default async function ProductDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // ── JSON-LD structured data ────────────────────────────────────────────────
  let productLd: object | null = null;
  let productNotFound = false;
  try {
    await connectDB();
    const p = await Product.findOne({ slug, isActive: true })
      .select('name description price promoPrice stock images category')
      .lean() as any;

    if (!p) {
      productNotFound = true;
    } else {
      const price = (p.promoPrice || p.price) as number;
      productLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description: (p.description as string)?.slice(0, 500) || '',
        ...(p.images?.length && { image: (p.images as string[]).slice(0, 3) }),
        brand: { '@type': 'Brand', name: 'AGRIPOINT SERVICES' },
        offers: {
          '@type': 'Offer',
          url: `${BASE_URL}/produits/${slug}`,
          priceCurrency: 'XAF',
          price,
          availability:
            (p.stock as number) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'AGRIPOINT SERVICES', url: BASE_URL },
        },
      };
    }
  } catch {
    // DB unavailable at render time — JSON-LD skipped gracefully
  }
  if (productNotFound) notFound();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil',   item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Produits',  item: `${BASE_URL}/produits` },
      {
        '@type': 'ListItem',
        position: 3,
        name: productLd ? (productLd as any).name : slug,
        item: `${BASE_URL}/produits/${slug}`,
      },
    ],
  };

  return (
    <>
      {productLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailClient />
    </>
  );
}
