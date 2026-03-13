"use client";

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface IProductMini {
  _id: string;
  name: string;
  slug: string;
  images: string[];
}

export default function ProductShowcase() {
  const [products, setProducts] = useState<IProductMini[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetch('/api/products?limit=5')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setProducts(data.products || []);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!products || products.length === 0) {
    return (
      <div className="aspect-square bg-gradient-hero flex items-center justify-center p-8">
        <div className="text-center">
          <div className="font-bold text-lg">Nos produits phares</div>
          <div className="text-sm text-gray-600 mt-2">Chargement...</div>
        </div>
      </div>
    );
  }

  const current = products[index % products.length];

  return (
    <div className="p-4">
      <div className="relative aspect-square bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden rounded-2xl w-full">
        <Link href={`/produits/${current.slug}`} className="relative w-full h-full block">
          <Image
            src={current.images?.[0] || '/images/fallback-product.svg'}
            alt={current.name}
            fill
            sizes="(max-width:768px) 100vw, 400px"
            className="object-contain"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          aria-label="Précédent"
          onClick={() => setIndex((i) => (i - 1 + products.length) % products.length)}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow"
        >
          ◀
        </button>
        {products.slice(0, 5).map((p, i) => (
          <button
            key={p._id}
            onClick={() => setIndex(i)}
            className={`relative w-12 h-12 rounded-md overflow-hidden border ${i === index ? 'ring-2 ring-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <Image src={p.images?.[0] || '/images/fallback-product.svg'} alt={p.name} fill sizes="48px" className="object-cover" loading="lazy" />
          </button>
        ))}
        <button
          aria-label="Suivant"
          onClick={() => setIndex((i) => (i + 1) % products.length)}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
