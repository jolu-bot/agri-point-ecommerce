'use client';

import Link from 'next/link';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';

export default function HeroAnimated() {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col"
      >
        {/* Badge premium shimmer */}
        <m.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 self-start px-4 py-2 rounded-full border border-emerald-200/80 dark:border-emerald-700/35 bg-white/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[12.5px] font-semibold tracking-wide shadow-sm mb-6 hero-badge brand-shimmer"
        >
          <span className="brand-pulse-dot" />
          Le partenaire sûr de l&apos;entrepreneur agricole
          <Leaf className="w-3.5 h-3.5 opacity-60" />
        </m.div>

        {/* Titre — structure en blocs typographiques */}
        <m.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-black leading-[1.0] tracking-tight hero-title"
        >
          {/* Ligne 1 — AGRI blanc + POINT émeraude, même poids visuel */}
          <span className="block text-white">
            AGRI<span className="text-emerald-400"> POINT</span>
          </span>
          {/* Ligne 2 — SERVICES avec dégradé animé */}
          <span className="hero-animated-gradient">
            SERVICES
          </span>
          {/* Ligne 3 — tagline plus légère */}
          <span className="hero-tagline">Tout en Un</span>
        </m.h1>

        {/* Description */}
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg hero-description"
        >
          Gamme complète de{' '}
          <strong className="text-gray-800 dark:text-gray-200 font-semibold">biofertilisants de grande qualité</strong>{' '}
          pour augmenter la production de toutes les cultures au Cameroun.
        </m.p>

        {/* CTAs */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 hero-buttons"
        >
          <Link href="/produits" className="btn-primary btn-glow inline-flex items-center justify-center gap-2 group">
            Découvrir nos produits
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
          </Link>
          {/* CTA secondaire Campagne Engrais — accent rouge marque */}
          <Link href="/campagne-engrais" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-800/30 dark:border-red-700/25 bg-red-950/5 dark:bg-red-900/10 text-red-700 dark:text-red-400 hover:bg-red-950/10 dark:hover:bg-red-900/20 hover:border-red-700/50 dark:hover:border-red-600/40 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-pulse flex-shrink-0" />
            Campagne Engrais
          </Link>
        </m.div>

        {/* Stats — glass pill cards */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54, duration: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: '20K+', label: 'Hectares', type: 'primary' },
            { value: '10K+', label: 'Agriculteurs', type: 'primary' },
            { value: '100%', label: 'Bio Certifié', type: 'secondary' },
          ].map(({ value, label, type }, i) => (
            <m.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58 + i * 0.08, duration: 0.35 }}
              className="stat-pill-card"
            >
              <div className={`font-display font-black stat-value ${
                type === 'secondary'
                  ? 'text-gradient-secondary'
                  : 'text-gradient-primary'
              }`}>{value}</div>
              <div className="stat-label text-gray-500 dark:text-gray-400">{label}</div>
            </m.div>
          ))}
        </m.div>
      </m.div>
    </LazyMotion>
  );
}
