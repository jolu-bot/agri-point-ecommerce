'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CarouselSlide {
  id: string;
  image: string;
  category: string;
  href: string;
  gradient: string;
}

// Toutes les images organisées par catégorie
const slides: CarouselSlide[] = [
  // Produire Plus - 7 images
  { id: 'pp-1', image: '/images/produire-plus/produire-plus-1.webp', category: 'PRODUIRE PLUS', href: '/produire-plus', gradient: 'from-green-900/80 via-green-800/60 to-transparent' },
  { id: 'pp-2', image: '/images/produire-plus/produire-plus-2.webp', category: 'PRODUIRE PLUS', href: '/produire-plus', gradient: 'from-green-900/80 via-green-800/60 to-transparent' },
  { id: 'pp-3', image: '/images/produire-plus/produire-plus-3.webp', category: 'PRODUIRE PLUS', href: '/produire-plus', gradient: 'from-green-900/80 via-green-800/60 to-transparent' },
  { id: 'pp-4', image: '/images/produire-plus/produire-plus-4.webp', category: 'PRODUIRE PLUS', href: '/produire-plus', gradient: 'from-green-900/80 via-green-800/60 to-transparent' },
  { id: 'pp-5', image: '/images/produire-plus/produire-plus-5.webp', category: 'PRODUIRE PLUS', href: '/produire-plus', gradient: 'from-green-900/80 via-green-800/60 to-transparent' },
  { id: 'pp-6', image: '/images/produire-plus/produire-plus-6.webp', category: 'PRODUIRE PLUS', href: '/produire-plus', gradient: 'from-green-900/80 via-green-800/60 to-transparent' },
  { id: 'pp-7', image: '/images/produire-plus/produire-plus-7.webp', category: 'PRODUIRE PLUS', href: '/produire-plus', gradient: 'from-green-900/80 via-green-800/60 to-transparent' },

  // Gagner Plus - 5 images
  { id: 'gp-1', image: '/images/gagner-plus/gagner-plus-1.webp', category: 'GAGNER PLUS', href: '/gagner-plus', gradient: 'from-yellow-900/80 via-yellow-800/60 to-transparent' },
  { id: 'gp-2', image: '/images/gagner-plus/gagner-plus-2.webp', category: 'GAGNER PLUS', href: '/gagner-plus', gradient: 'from-yellow-900/80 via-yellow-800/60 to-transparent' },
  { id: 'gp-3', image: '/images/gagner-plus/gagner-plus-3.webp', category: 'GAGNER PLUS', href: '/gagner-plus', gradient: 'from-yellow-900/80 via-yellow-800/60 to-transparent' },
  { id: 'gp-4', image: '/images/gagner-plus/gagner-plus-4.webp', category: 'GAGNER PLUS', href: '/gagner-plus', gradient: 'from-yellow-900/80 via-yellow-800/60 to-transparent' },
  { id: 'gp-5', image: '/images/gagner-plus/gagner-plus-5.webp', category: 'GAGNER PLUS', href: '/gagner-plus', gradient: 'from-yellow-900/80 via-yellow-800/60 to-transparent' },

  // Mieux Vivre - 2 images
  { id: 'mv-1', image: '/images/mieux-vivre/mieux-vivre-1.webp', category: 'MIEUX VIVRE', href: '/mieux-vivre', gradient: 'from-blue-900/80 via-blue-800/60 to-transparent' },
  { id: 'mv-2', image: '/images/mieux-vivre/mieux-vivre-2.webp', category: 'MIEUX VIVRE', href: '/mieux-vivre', gradient: 'from-blue-900/80 via-blue-800/60 to-transparent' },
];

export default function FeaturedProducts() {
  const { locale } = useLanguage();
  const en = locale === 'en';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-rotation toutes les 5 secondes
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const currentSlide = slides[currentIndex];

  return (
    <section className="section-premium">
      <div 
        className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] cursor-pointer overflow-hidden rounded-2xl group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Image de fond */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.category}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority={currentIndex === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${currentSlide.gradient}`} />

        {/* Contenu texte - centré en bas */}
        <Link
          href={currentSlide.href}
          className="absolute inset-0 flex flex-col items-center justify-end p-8 md:p-12 lg:p-16"
        >
          <motion.div
            key={`text-${currentSlide.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center"
          >
            {/* Badge catégorie */}
            <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/40 mb-6">
              <span className="text-white font-bold text-sm md:text-base tracking-widest">
                {currentSlide.category}
              </span>
            </div>

            {/* Titre avec bel effet */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 drop-shadow-2xl">
              {currentSlide.category.split(' ')[0]}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-emerald-300">
                {currentSlide.category.split(' ')[1]}
              </span>
            </h2>

            {/* CTA texte */}
            <div className="inline-flex items-center gap-2 text-white group/cta">
              <span className="text-lg font-semibold">{en ? 'Discover' : 'Découvrir'}</span>
              <ChevronRight className="w-6 h-6 group-hover/cta:translate-x-2 transition-transform" />
            </div>
          </motion.div>
        </Link>

        {/* Bouton flèche gauche */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white/40 dark:bg-black/30 dark:hover:bg-black/60 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          aria-label={en ? 'Previous image' : 'Image précédente'}
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
        </button>

        {/* Bouton flèche droite */}
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white/40 dark:bg-black/30 dark:hover:bg-black/60 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          aria-label={en ? 'Next image' : 'Image suivante'}
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
        </button>

        {/* Points de pagination */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={en ? `Go to image ${index + 1}` : `Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
