// Server Component - Fetch products server-side for LCP optimization
import Link from 'next/link';

interface IProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
}

export default async function HeroShowcase() {
  let product: IProduct | null = null;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blue-goose-561723.hostingersite.com';
    const response = await fetch(`${baseUrl}/api/products?limit=1`, {
      next: { revalidate: false } // Static generation (no revalidation)
    });
    
    if (response.ok) {
      const data = await response.json();
      product = data.products?.[0] || null;
    }
  } catch (err) {
    console.warn('Failed to fetch product for hero:', err);
  }

  const imageUrl = product?.images?.[0] || '/images/fallback-product.svg';
  const productSlug = product?.slug || '#';
  const productName = product?.name || 'Produit phare';

  return (
    <Link href={`/produits/${productSlug}`} className="block w-full h-full">
      <div className="aspect-square bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden rounded-2xl w-full relative">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-contain"
          loading="eager"
          decoding="async"
          width={400}
          height={400}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/fallback-product.svg';
          }}
        />
      </div>
    </Link>
  );
}
