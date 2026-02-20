'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Leaf } from 'lucide-react';
import { Suspense, lazy } from 'react';
import HeroShowcase from './HeroShowcase';
import { HeroImageSkeleton } from './HeroImageSkeleton';

// Lazy load Framer Motion animations to reduce initial JS
const AnimatedContent = lazy(() => import('./HeroAnimated'));

// Fallback for no-animation case
function HeroContent() {
  return (
    <div className="flex flex-col">
      {/* Badge premium avec shimmer */}
      <div className="inline-flex items-center gap-2.5 self-start px-4 py-2 rounded-full border border-emerald-200/80 dark:border-emerald-700/35 bg-white/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[12.5px] font-semibold tracking-wide shadow-sm mb-6 hero-badge brand-shimmer">
        <span className="brand-pulse-dot" />
        Le partenaire sûr de l&apos;entrepreneur agricole
        <Leaf className="w-3.5 h-3.5 opacity-60" />
      </div>
      
      <h1 className="font-display font-black leading-[1.0] tracking-tight hero-title">
        <span className="block text-white">
          AGRI<span className="text-emerald-400"> POINT</span>
        </span>
        <span className="hero-animated-gradient">SERVICES</span>
        <span className="hero-tagline">Tout en Un</span>
      </h1>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg hero-description">
        Gamme complète de <strong className="text-gray-800 dark:text-gray-200 font-semibold">biofertilisants de grande qualité</strong> pour augmenter la production de toutes les cultures au Cameroun.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 hero-buttons">
        <Link href="/produits" className="btn-primary btn-glow inline-flex items-center justify-center gap-2 group">
          Découvrir nos produits
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
        </Link>
        <Link href="/campagne-engrais" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-800/30 dark:border-red-700/25 bg-red-950/5 dark:bg-red-900/10 text-red-700 dark:text-red-400 hover:bg-red-950/10 font-semibold text-sm transition-all duration-200">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-pulse flex-shrink-0" />
          Campagne Engrais
        </Link>
      </div>

      {/* Stats — glass pill cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: '20K+', label: 'Hectares', type: 'primary' },
          { value: '10K+', label: 'Agriculteurs', type: 'primary' },
          { value: '100%', label: 'Bio Certifié', type: 'secondary' },
        ].map(({ value, label, type }) => (
          <div key={label} className="stat-pill-card">
            <div className={`font-display font-black stat-value ${type === 'secondary' ? 'text-gradient-secondary' : 'text-gradient-primary'}`}>{value}</div>
            <div className="stat-label text-gray-500 dark:text-gray-400">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingCards() {
  return (
    <>
      <div className="hidden md:block absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white/90 dark:bg-gray-900/85 backdrop-blur-sm rounded-2xl shadow-xl border border-white/80 dark:border-white/[0.08] p-3 max-w-[180px] lg:max-w-[210px] hover-lift">
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
            <div className="font-semibold text-sm text-gray-900 dark:text-white">Produire Plus</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">Rendement optimisé</div>
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-white/90 dark:bg-gray-900/85 backdrop-blur-sm rounded-2xl shadow-xl border border-white/80 dark:border-white/[0.08] p-3 max-w-[180px] lg:max-w-[210px] hover-lift">
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
            <div className="font-semibold text-sm text-gray-900 dark:text-white">Gagner Plus</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">Revenus augmentés</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7fdf8] dark:bg-[#060d07]">
      {/* Grain texture (classe CSS ::after — pas d’inline style) */}
      <div aria-hidden="true" className="brand-grain pointer-events-none absolute inset-0 z-0" />

      {/* Lueur ambiance émeraude — top-right */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-32 w-[480px] h-[480px] rounded-full bg-emerald-100 dark:bg-emerald-900 opacity-30 dark:opacity-[0.13] blur-[80px]" />
      {/* Lueur ambiance émeraude — bottom-left */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-50 dark:bg-emerald-900 opacity-25 dark:opacity-[0.08] blur-[60px]" />

      {/* Cross pattern léger */}
      <div className="absolute inset-0 opacity-[0.022] dark:opacity-[0.04] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg_width=%2760%27_height=%2760%27_viewBox=%270_0_60_60%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg_fill=%27none%27_fill-rule=%27evenodd%27%3E%3Cg_fill=%27%2316a34a%27_fill-opacity=%270.5%27%3E%3Cpath_d=%27M36_34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6_34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6_4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      <div className="container-fluid py-fluid-lg relative z-10">
        <div className="grid lg:grid-cols-2 gap-fluid-md items-center">
          {/* Left Content with optional animations */}
          <Suspense fallback={<HeroContent />}>
            <AnimatedContent />
          </Suspense>

          {/* Right Image - Server Component for LCP optimization */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative rounded-fluid-2xl overflow-hidden shadow-2xl">
              <Suspense fallback={<HeroImageSkeleton />}>
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
