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
      <div className="w-full bg-white border border-gray-200 overflow-hidden rounded-2xl relative transition-all duration-300 group-hover:border-emerald-300 group-hover:shadow-[0_8px_32px_rgba(22,163,74,0.12)] aspect-square sm:aspect-[4/3] lg:aspect-square xl:aspect-[5/4]">
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
