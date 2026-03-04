'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

// Images des 3 programmes phares pour le slideshow
const HERO_IMAGES = [
  '/images/produire-plus/produire-plus-1.webp',
  '/images/gagner-plus/gagner-plus-1.webp',
  '/images/mieux-vivre/mieux-vivre-1.webp',
  '/images/produire-plus/produire-plus-2.webp',
  '/images/gagner-plus/gagner-plus-2.webp',
  '/images/mieux-vivre/mieux-vivre-2.webp',
  '/images/produire-plus/produire-plus-3.webp',
  '/images/gagner-plus/gagner-plus-3.webp',
  '/images/produire-plus/produire-plus-4.webp',
  '/images/gagner-plus/gagner-plus-4.webp',
  '/images/produire-plus/produire-plus-5.webp',
  '/images/gagner-plus/gagner-plus-5.webp',
  '/images/produire-plus/produire-plus-6.webp',
  '/images/produire-plus/produire-plus-7.webp',
];

// Fonction pour obtenir un ordre aléatoire
export default function HeroNew() {
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Changer d'image toutes les 4 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Full-width slideshow background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={imageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={HERO_IMAGES[imageIndex]}
            alt={`Agri Point Services - Produire plus, Gagner plus, Mieux vivre`}
            fill
            className="object-cover object-center"
            priority={imageIndex === 0}
            quality={85}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark gradient overlay - meilleure lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      {/* Content overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center"
          variants={containerVariants}
          initial="hidden"
          animate={!isLoading ? 'visible' : 'hidden'}
        >
          {/* Badge premium */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-emerald-400/50 bg-emerald-500/15 text-emerald-200 text-sm font-bold tracking-wide shadow-lg backdrop-blur-md mb-6 sm:mb-8"
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Le partenaire sûr de l&apos;entrepreneur agricole
            <Leaf className="w-4 h-4 opacity-80" />
          </motion.div>

          {/* Title principal */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tighter mb-4 sm:mb-6 text-white drop-shadow-2xl"
          >
            <span className="block">
              <span className="text-red-500">AGRI</span>
              <span className="text-emerald-300"> POINT</span>
            </span>
            <span className="block bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-xl">SERVICES</span>
            <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-300 mt-2 sm:mt-4">Tout en Un</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-white/95 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed drop-shadow-lg"
          >
            <strong className="text-white font-bold block mb-2">Nos objectifs :</strong>
            Un Agripoint Services s&apos;installe partout où il y a un potentiel de 20 000 ha et 10 000 producteurs.
          </motion.p>

          {/* Stats - Animated Counters */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mb-8 sm:mb-10"
          >
            {[
              { to: 20000, label: 'Hectares', suffix: 'K+' },
              { to: 10000, label: 'Agriculteurs', suffix: 'K+' },
              { to: 100, label: 'Bio Certifié', suffix: '%' },
            ].map(({ to, label, suffix }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.05 }}
                className="backdrop-blur-xl bg-white/[0.08] border border-white/20 hover:border-emerald-400/40 rounded-2xl px-3 py-4 sm:px-5 sm:py-6 transition-all duration-300 shadow-xl"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-300 mb-1 sm:mb-2">
                  {to === 100 ? (
                    <AnimatedCounter to={to} duration={2} suffix={suffix} format={(v) => Math.round(v).toString()} />
                  ) : (
                    <AnimatedCounter to={to} duration={2.5} prefix="" suffix={suffix} format={(v) => (Math.round(v) / 1000).toString()} />
                  )}
                </div>
                <div className="text-xs sm:text-sm text-white/70 font-semibold uppercase tracking-wider">{label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <Link
              href="/produire-plus"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-300 transform hover:scale-105 group shadow-2xl hover:shadow-emerald-500/50"
            >
              Découvrir nos services
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/campagne-engrais"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/40 hover:border-emerald-400/60 text-white font-bold text-base sm:text-lg rounded-xl backdrop-blur-md bg-white/[0.05] hover:bg-white/10 transition-all duration-300 shadow-xl"
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Campagne Engrais
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator avec animation */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2 backdrop-blur-sm">
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-1 h-2 bg-emerald-400 rounded-full"
          />
        </div>
      </motion.div>

      {/* Progress dots indicator — bottom right */}
      <div className="absolute bottom-7 right-6 sm:right-8 z-20 flex items-center gap-1.5 backdrop-blur-sm bg-black/30 px-3 py-2 rounded-full border border-white/10">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setImageIndex(i)}
            aria-label={`Image ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === imageIndex
                ? 'w-5 h-1.5 bg-emerald-400'
                : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
