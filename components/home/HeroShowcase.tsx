'use client';

import { useState } from 'react';
import Link from 'next/link';
import HeroSlideshow from './HeroSlideshow';
import DynamicProductCard from './DynamicProductCard';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  
  return (
    <Link href="/produits" className="block w-full group">
      <div className="aspect-square bg-[#0d1a0e] border border-emerald-900/30 overflow-hidden rounded-2xl w-full relative transition-all duration-300 group-hover:border-emerald-700/50 group-hover:shadow-[0_0_40px_rgba(74,222,128,0.08)]">
        <HeroSlideshow
          images={PRODUCT_IMAGES}
          alt="Produit Agri Point"
          objectFit="contain"
          variant="dark"
          interval={3000}
          onIndexChange={setCurrentIndex}
        />
        <DynamicProductCard currentIndex={currentIndex} position="bottom-left" />
        <DynamicProductCard currentIndex={currentIndex} position="top-right" />
      </div>
    </Link>
  );
}
