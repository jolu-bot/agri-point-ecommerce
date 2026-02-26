'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/models/Product';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      // Optimisation: charge seulement 4 produits au lieu de tous
      const response = await fetch('/api/products?limit=4&sort=isFeatured&order=desc');
      if (response.ok) {
        const data = await response.json();
        // Récupérer les 4 premiers produits en vedette
        const featured = (data.products || [])
          .filter((p: IProduct) => p.isFeatured && p.isActive)
          .slice(0, 4);
        setProducts(featured);
      }
    } catch (error) {
      console.error('Erreur chargement produits vedette:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section-brand-divider section-premium bg-white dark:bg-gray-950">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 font-bold mb-2">Nos produits phares</p>
            <h2 className="section-title">Sélection Premium</h2>
            <p className="section-subtitle">Découvrez notre sélection de biofertilisants de qualité supérieure</p>
          </div>
          <div className="product-grid-responsive">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 skeleton rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-brand-divider section-premium bg-white dark:bg-gray-950">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 font-bold mb-2">Notre sélection</p>
          <h2 className="section-title">Produits Phares</h2>
          <p className="section-subtitle">
            Découvrez notre sélection de biofertilisants de qualité supérieure
          </p>
          <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        </motion.div>

        <div className="product-grid-responsive mb-12">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/produits" className="btn-primary btn-glow inline-flex items-center gap-2 group">
            Voir tous les produits
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
