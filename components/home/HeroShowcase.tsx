'use client';

import Link from 'next/link';
import HeroSlideshow from './HeroSlideshow';

// Images produits : sacs d'engrais + bidons de biofertilisants
const PRODUCT_IMAGES = [
  '/products/sarah-npk-20-10-10.webp',
  '/products/aminol-20.webp',
  '/products/sarah-npk-10-30-10.webp',
  '/products/fosnutren-20.webp',
  '/products/sarah-npk-12-14-10.webp',
  '/products/humiforte-20.webp',
  '/products/sarah-uree-46.webp',
  '/products/kadostim-20.webp',
  '/products/kit-naturcare-terra.webp',
  '/products/kit-urbain-debutant.webp',
];

export default function HeroShowcase() {
  return (
    <Link href="/produits" className="block w-full group">
      <div className="aspect-square bg-white border border-gray-200 overflow-hidden rounded-2xl w-full relative transition-all duration-300 group-hover:border-gray-300 group-hover:shadow-lg">
        <HeroSlideshow
          images={PRODUCT_IMAGES}
          alt="Produit Agri Point"
          objectFit="contain"
          variant="light"
          interval={3000}
        />
      </div>
    </Link>
  );
}
