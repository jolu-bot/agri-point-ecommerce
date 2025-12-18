'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';

export default function FeaturedProducts() {
  // Produits exemple - en production, charger depuis l'API
  const products = [
    {
      _id: '1',
      name: 'HUMIFORTE',
      slug: 'humiforte',
      description: 'Fertilisant NPK avec L-aminoacides libres',
      category: 'biofertilisant' as const,
      images: ['/products/icon-feuillage.png'],
      price: 15000,
      stock: 50,
      isActive: true,
      isFeatured: true,
      isNew: false,
      features: {
        npk: '6-4-0.2',
        cultures: ['Agrumes', 'Fruits à noyaux', 'Horticulture'],
      },
      sku: 'HUM-001',
      views: 0,
      sales: 0,
      rating: 4.8,
      reviewsCount: 24,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '2',
      name: 'FOSNUTREN 20',
      slug: 'fosnutren-20',
      description: 'Biostimulant pour la floraison',
      category: 'biofertilisant' as const,
      images: ['/products/icon-floraison.png'],
      price: 18000,
      stock: 30,
      isActive: true,
      isFeatured: true,
      isNew: true,
      features: {
        npk: '4.2-6.5',
        cultures: ['Agrumes', 'Culture pour graines'],
      },
      sku: 'FOS-001',
      views: 0,
      sales: 0,
      rating: 4.9,
      reviewsCount: 18,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '3',
      name: 'KADOSTIM 20',
      slug: 'kadostim-20',
      description: 'Biostimulant pour maturation du fruit',
      category: 'biofertilisant' as const,
      images: ['/products/icon-croissance-fruits.png'],
      price: 16500,
      promoPrice: 14000,
      stock: 45,
      isActive: true,
      isFeatured: true,
      isNew: false,
      features: {
        cultures: ['Agrumes', 'Fruits à noyaux', 'Cultures horticoles'],
      },
      sku: 'KAD-001',
      views: 0,
      sales: 0,
      rating: 4.7,
      reviewsCount: 32,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '4',
      name: 'AMINOL 20',
      slug: 'aminol-20',
      description: 'Bio stimulant riche en aminoacides libres',
      category: 'biofertilisant' as const,
      images: ['/products/icon-anti-stress.png'],
      price: 17000,
      stock: 40,
      isActive: true,
      isFeatured: true,
      isNew: false,
      features: {
        cultures: ['Cacao', 'Café', 'Poivre'],
      },
      sku: 'AMI-001',
      views: 0,
      sales: 0,
      rating: 4.8,
      reviewsCount: 27,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Nos Produits Phares</h2>
          <p className="section-subtitle">
            Découvrez notre sélection de biofertilisants de qualité supérieure
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/boutique" className="btn-primary inline-flex items-center">
            Voir tous les produits
          </Link>
        </div>
      </div>
    </section>
  );
}
