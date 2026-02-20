import ProductsClient from './ProductsClient';

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
  searchParams?: { search?: string };
}) {
  const initialProducts = await getProducts();
  const initialSearch = searchParams?.search || '';
  
  return <ProductsClient initialProducts={initialProducts} initialSearch={initialSearch} />;
}
