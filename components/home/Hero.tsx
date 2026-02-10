'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Suspense, lazy } from 'react';
import HeroShowcase from './HeroShowcase';

// Lazy load Framer Motion animations to reduce initial JS
const AnimatedContent = lazy(() => import('./HeroAnimated'));

// Fallback for no-animation case
function HeroContent() {
  return (
    <div>
      <div className="inline-block px-fluid-sm py-fluid-xs gradient-primary text-white rounded-fluid-2xl shadow-lg hero-badge">
        🌱 Le partenaire sûr de l&apos;entrepreneur agricole
      </div>
      
      <h1 className="font-display font-black text-gray-900 dark:text-white leading-tight hero-title">
        AGRI POINT SERVICE
        <span className="block text-gradient-primary hero-subtitle">
          Tout en Un
        </span>
      </h1>

      <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl hero-description">
        Gamme complète de biofertilisants de grande qualité pour augmenter la production de toutes les cultures.
      </p>

      <div className="flex flex-col sm:flex-row gap-fluid-xs hero-buttons">
        <Link href="/boutique" className="btn-primary inline-flex items-center justify-center group">
          Découvrir nos produits
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="/agriculture-urbaine" className="btn-outline inline-flex items-center justify-center">
          Agriculture Urbaine
        </Link>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-fluid-sm">
        <div className="text-center">
          <div className="font-display font-bold text-gradient-primary stat-value">20K+</div>
          <div className="text-gray-600 dark:text-gray-400 font-medium stat-label">Hectares</div>
        </div>
        <div className="text-center">
          <div className="font-display font-bold text-gradient-primary stat-value">10K+</div>
          <div className="text-gray-600 dark:text-gray-400 font-medium stat-label">Agriculteurs</div>
        </div>
        <div className="text-center">
          <div className="font-display font-bold text-gradient-secondary stat-value">100%</div>
          <div className="text-gray-600 dark:text-gray-400 font-medium stat-label">Bio</div>
        </div>
      </div>
    </div>
  );
}

function FloatingCards() {
  return (
    <>
      <div className="hidden md:block absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white dark:bg-gray-800 rounded-fluid-xl shadow-lg p-fluid-xs max-w-[200px] lg:max-w-xs">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="relative w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
            <Image
              src="/products/icon-croissance-fruits.png"
              alt="Produire Plus"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <div className="font-semibold text-sm lg:text-base text-gray-900 dark:text-white">Produire Plus</div>
            <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Rendement optimisé</div>
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-white dark:bg-gray-800 rounded-fluid-xl shadow-lg p-fluid-xs max-w-[200px] lg:max-w-xs">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="relative w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
            <Image
              src="/products/icon-floraison.png"
              alt="Gagner Plus"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <div className="font-semibold text-sm lg:text-base text-gray-900 dark:text-white">Gagner Plus</div>
            <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Revenus augmentés</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg_width=%2760%27_height=%2760%27_viewBox=%270_0_60_60%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg_fill=%27none%27_fill-rule=%27evenodd%27%3E%3Cg_fill=%27%2316a34a%27_fill-opacity=%270.4%27%3E%3Cpath_d=%27M36_34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6_34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6_4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]">
      </div>

      <div className="container-fluid py-fluid-lg">
        <div className="grid lg:grid-cols-2 gap-fluid-md items-center">
          {/* Left Content with optional animations */}
          <Suspense fallback={<HeroContent />}>
            <AnimatedContent />
          </Suspense>

          {/* Right Image - Server Component for LCP optimization */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative rounded-fluid-2xl overflow-hidden shadow-2xl">
              <Suspense fallback={<div className="aspect-square bg-gradient-hero flex items-center justify-center animate-pulse" />}>
                <HeroShowcase />
              </Suspense>
            </div>

            {/* Floating Cards */}
            <FloatingCards />
          </div>
        </div>
      </div>
    </section>
  );
}
