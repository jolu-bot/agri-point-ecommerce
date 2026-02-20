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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agri-ps.com';
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
    <Link href={`/produits/${productSlug}`} className="block w-full h-full group">
      <div className="aspect-square bg-[#0d1a0e] border border-emerald-900/30 flex items-center justify-center overflow-hidden rounded-2xl w-full relative transition-all duration-300 group-hover:border-emerald-700/50 group-hover:shadow-[0_0_40px_rgba(74,222,128,0.08)]">
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
