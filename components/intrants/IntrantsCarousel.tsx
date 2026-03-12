'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface IntrantProduct {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
}

export default function IntrantsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const { locale } = useLanguage();
  const en = locale === 'en';

  const products: IntrantProduct[] = [
    {
      id: 'sarah-npk-20-10-10',
      name: 'SARAH NPK 20-10-10',
      image: '/products/sarah-npk-20-10-10.webp',
      description: en
        ? 'Balanced fertilizer ideal for vegetative growth and general development'
        : 'Engrais équilibré idéal pour la croissance végétative et le développement général',
      category: 'NPK Minéral',
    },
    {
      id: 'sarah-npk-12-14-10',
      name: 'SARAH NPK 12-14-10',
      image: '/products/sarah-npk-12-14-10.webp',
      description: en
        ? 'Phosphorus-rich, perfect for flowering and fruiting'
        : 'Riche en phosphore, parfait pour la floraison et la fructification',
      category: 'NPK Minéral',
    },
    {
      id: 'sarah-npk-10-30-10',
      name: 'SARAH NPK 10-30-10',
      image: '/products/sarah-npk-10-30-10.webp',
      description: en
        ? 'High phosphorus content to strengthen fruiting and quality'
        : 'Haute teneur en phosphore pour renforcer la fructification et la qualité',
      category: 'NPK Minéral',
    },
    {
      id: 'sarah-uree-46',
      name: 'SARAH URÉE 46%',
      image: '/products/sarah-uree-46.webp',
      description: en
        ? 'Highly concentrated nitrogen supply for rapid, vigorous growth'
        : 'Apport azoté très concentré pour une croissance rapide et vigoureuse',
      category: 'Azote',
    },
    {
      id: 'humiforte-20',
      name: 'HUMIFORTE 20L',
      image: '/products/humiforte-20.webp',
      description: en
        ? 'Bio-stimulant based on humic acids to improve soil structure'
        : "Bio-stimulant à base d'acides humiques pour améliorer la structure du sol",
      category: 'Bio-fertilisant',
    },
    {
      id: 'kadostim-20',
      name: 'KADOSTIM 20L',
      image: '/products/kadostim-20.webp',
      description: en
        ? 'Natural growth and rooting stimulator for all crops'
        : "Stimulateur naturel de croissance et d'enracinement pour toutes cultures",
      category: 'Bio-fertilisant',
    },
    {
      id: 'fosnutren-20',
      name: 'FOSNUTREN 20L',
      image: '/products/fosnutren-20.webp',
      description: en
        ? 'Phosphorus-rich foliar fertilizer, rapidly absorbed by leaves'
        : 'Fertilisant foliaire riche en phosphore, absorption rapide par les feuilles',
      category: 'Foliaire',
    },
    {
      id: 'aminol-20',
      name: 'AMINOL 20L',
      image: '/products/aminol-20.webp',
      description: en
        ? 'Natural amino acids to increase resistance to climate stress'
        : 'Acides aminés naturels pour augmenter la résistance au stress climatique',
      category: 'Bio-fertilisant',
    },
    {
      id: 'kit-naturcare-terra',
      name: 'KIT NATURCARE TERRA',
      image: '/products/kit-naturcare-terra.webp',
      description: en
        ? 'Complete certified organic fertilization kit'
        : 'Kit complet de fertilisation organique certifiée bio',
      category: 'Kit Bio',
    },
    {
      id: 'kit-urbain-debutant',
      name: 'KIT PRODUCTEUR DÉBUTANT',
      image: '/products/kit-urbain-debutant.webp',
      description: en
        ? 'Ideal kit to start a productive farming activity'
        : 'Kit idéal pour débuter une activité agricole productive',
      category: 'Kit Producteur',
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  // Auto-rotation toutes les 4 secondes
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Responsive: 1 mobile, 2 tablet, 4 desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(4);
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
      className="section-premium bg-gray-50 dark:bg-gray-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {en ? 'Our Fertilizers & Bio-fertilizers' : 'Nos Engrais & Bio-fertilisants'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {en
              ? 'Premium selection of certified products to increase your yields'
              : 'Sélection premium de produits certifiés pour augmenter vos rendements'}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={`${product.id}-${currentIndex}-${index}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                  className="group h-full"
                >
                  <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                        {product.description}
                      </p>

                      {/* CTA Button */}
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {en ? 'Order' : 'Commander'}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-10 border border-gray-200 dark:border-gray-700"
            aria-label={en ? 'Previous product' : 'Produit précédent'}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-10 border border-gray-200 dark:border-gray-700"
            aria-label={en ? 'Next product' : 'Produit suivant'}
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-emerald-600 dark:bg-emerald-500'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={en ? `Go to product ${index + 1}` : `Aller au produit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Info de produits */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {en
              ? `Showing: ${currentIndex + 1} to ${currentIndex + visibleCount} of ${products.length} products`
              : `Affiché: ${currentIndex + 1} à ${currentIndex + visibleCount} sur ${products.length} produits`}
          </p>
        </div>
      </div>
    </section>
  );
}
