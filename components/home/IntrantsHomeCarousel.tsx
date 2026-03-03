'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
  color: string;
}

const products: Product[] = [
  {
    id: 'npk-1',
    name: 'SARAH NPK 20-10-10',
    image: '/products/sarah-npk-20-10-10.webp',
    description: 'Croissance végétative optimale',
    category: 'NPK Minéral',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'npk-2',
    name: 'SARAH NPK 12-14-10',
    image: '/products/sarah-npk-12-14-10.webp',
    description: 'Floraison et fructification',
    category: 'NPK Minéral',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'npk-3',
    name: 'SARAH NPK 10-30-10',
    image: '/products/sarah-npk-10-30-10.webp',
    description: 'Rendement supérieur',
    category: 'NPK Minéral',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'urea',
    name: 'SARAH URÉE 46%',
    image: '/products/sarah-uree-46.webp',
    description: 'Apport azoté concentré',
    category: 'Azote',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'bio-1',
    name: 'HUMIFORTE 20L',
    image: '/products/humiforte-20.webp',
    description: 'Acides humiques naturels',
    category: 'Bio-fertilisant',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'bio-2',
    name: 'KADOSTIM 20L',
    image: '/products/kadostim-20.webp',
    description: 'Stimulateur de croissance',
    category: 'Bio-fertilisant',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'foliaire',
    name: 'FOSNUTREN 20L',
    image: '/products/fosnutren-20.webp',
    description: 'Fertilisant foliaire premium',
    category: 'Foliaire',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'amino',
    name: 'AMINOL 20L',
    image: '/products/aminol-20.webp',
    description: 'Résistance au stress',
    category: 'Bio-fertilisant',
    color: 'from-green-500 to-green-600',
  },
];

export default function IntrantsHomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, []);

  // Auto-rotation toutes les 5 secondes
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Responsive: 1 mobile, 2 tablet, 3-4 desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setVisibleCount(4);
      } else if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getVisibleProducts = () => {
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      result.push(products[(currentIndex + i) % products.length]);
    }
    return result;
  };

  const visibleProducts = getVisibleProducts();

  return (
    <section 
      className="section-premium bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container-fluid">
        {/* Header avec animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Gamme Complète d'Intrants
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 dark:text-white mb-4">
            Engrais & Bio-fertilisants
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Sélection premium de produits certifiés pour augmenter vos rendements et respecter l'environnement
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent dark:via-emerald-700" />
            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
              <AnimatedCounter 
                to={30} 
                duration={2.5} 
                prefix="+" 
                suffix="% rendement moyen" 
                format={(v) => Math.round(v).toString()}
              />
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent dark:via-emerald-700" />
          </div>
        </motion.div>

        {/* Carousel Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={`${product.id}-${currentIndex}-${index}`}
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -30 }}
                  transition={{
                    delay: index * 0.08,
                    type: 'spring',
                    stiffness: 320,
                    damping: 28,
                  }}
                  className="group h-full"
                >
                  {/* Product Card */}
                  <div className="h-full relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-xl">
                    {/* Image Container */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />

                      {/* Badge Overlay */}
                      <div className="absolute top-0 right-0 m-3 px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 dark:border-gray-700/20">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {product.category}
                        </span>
                      </div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col h-40">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-4" />

                      {/* CTA */}
                      <Link
                        href="/fourniture-intrants"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group/btn"
                      >
                        <span>Détails</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          {visibleCount < products.length && (
            <>
              <button
                onClick={prevSlide}
                className="absolute -left-6 lg:-left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:scale-110 z-10"
                aria-label="Produit précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute -right-6 lg:-right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:scale-110 z-10"
                aria-label="Produit suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-10">
            {products.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.2 }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 h-2.5 bg-emerald-600 dark:bg-emerald-500'
                    : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Aller au produit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="mt-14 text-center"
        >
          <Link
            href="/fourniture-intrants"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
          >
            Voir la gamme complète
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Découvrez nos 10+ produits certifiés et conseils agronomes gratuits
          </p>
        </motion.div>
      </div>
    </section>
  );
}
