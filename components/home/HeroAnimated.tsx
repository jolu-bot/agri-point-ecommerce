'use client';

import Link from 'next/link';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroAnimated() {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
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
      </m.div>
    </LazyMotion>
  );
}
