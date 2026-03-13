import type { Metadata } from 'next';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailClient from '@/components/products/ProductDetailClient';

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

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
