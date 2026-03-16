'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Testimonials() {
  const { locale } = useLanguage();
  const en = locale === 'en';
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      name: 'Jean-Pierre M.',
      role: en ? 'Farmer' : 'Agriculteur',
      location: 'Yaoundé',
      content: en
        ? 'Thanks to AGRIPOINT SERVICES biofertilizers, my tomato production has doubled. Excellent service and valuable advice!'
        : 'Grâce aux biofertilisants AGRIPOINT SERVICES, ma production de tomates a doublé. Service excellent et conseils précieux !',
      rating: 5,
      color: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20',
      border: 'border-emerald-100 dark:border-emerald-800/30',
    },
    {
      name: 'Marie K.',
      role: en ? 'Urban farming' : 'Agriculture urbaine',
      location: 'Douala',
      content: en
        ? 'AgriBot helped me start my urban vegetable garden. I now grow my own vegetables on my balcony!'
        : "AgriBot m'a aidée à démarrer mon potager urbain. Je cultive maintenant mes propres légumes sur mon balcon !",
      rating: 5,
      color: 'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20',
      border: 'border-teal-100 dark:border-teal-800/30',
    },
    {
      name: 'Thomas B.',
      role: en ? 'Cocoa producer' : 'Producteur de cacao',
      location: 'Bafoussam',
      content: en
        ? 'The products are of superior quality and the results are visible from the first few weeks. I highly recommend!'
        : 'Les produits sont de qualité supérieure et les résultats sont visibles dés les premières semaines. Je recommande !',
      rating: 5,
      color: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20',
      border: 'border-green-100 dark:border-green-800/30',
    },
  ];

  /* ── Mobile scroll tracking for dots ── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / testimonials.length));
    setActiveIdx(Math.min(Math.max(idx, 0), testimonials.length - 1));
  }, [testimonials.length]);

  const scrollToCard = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / testimonials.length) * idx, behavior: 'smooth' });
    setActiveIdx(idx);
  };

  /* ── Shared card JSX ── */
  const Card = ({ t, index }: { t: typeof testimonials[0]; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12 }}
      className={`relative h-full rounded-2xl border bg-gradient-to-br ${t.color} ${t.border} p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
    >
      {/* Quote */}
      <div className="absolute top-4 right-4 opacity-10" aria-hidden>
        <Quote className="w-9 h-9 sm:w-10 sm:h-10 text-emerald-700 dark:text-emerald-400 fill-emerald-700 dark:fill-emerald-400" />
      </div>
      {/* Stars */}
      <div className="flex gap-0.5 mb-3 sm:mb-4">
        {[...Array(t.rating)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 italic text-[14px] sm:text-[15px]">
        &ldquo;{t.content}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-500 to-green-700 dark:from-emerald-600 dark:to-green-800 rounded-xl shadow-sm flex items-center justify-center text-white font-black text-sm sm:text-base flex-shrink-0 select-none">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{t.role} · {t.location}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="py-10 md:py-20 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Subtle dot bg */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03] [background-image:radial-gradient(circle,#16a34a_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-14"
        >
          <span className="section-tag">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {en ? 'Customer Testimonials' : 'Témoignages clients'}
          </span>
          <h2 className="section-title">
            {en ? <>What our <span className="text-accent-green">clients</span> say</> : <>Ce que disent nos <span className="text-accent-green">clients</span></>}
          </h2>
          <p className="section-subtitle">
            {en ? 'Thousands of farmers trust us in Cameroon' : "Des milliers d'agriculteurs nous font confiance au Cameroun"}
          </p>
        </motion.div>

        {/* ── Mobile : horizontal scroll carousel ── */}
        <div
          ref={scrollRef}
          className="md:hidden flex overflow-x-auto scroll-snap-x gap-4 pb-3 -mx-4 px-4"
          onScroll={handleScroll}
          aria-label={en ? 'Customer testimonials' : 'Témoignages clients'}
        >
          {testimonials.map((t, index) => (
            <div key={index} className="scroll-snap-item flex-shrink-0 w-[82vw]">
              <Card t={t} index={index} />
            </div>
          ))}
        </div>

        {/* ── Mobile dots ── */}
        <div className="flex justify-center gap-2 mt-3 mb-1 md:hidden" role="tablist" aria-label={en ? 'Page indicators' : 'Indicateurs de page'}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              role="tab"
              aria-selected={i === activeIdx ? 'true' : 'false'}
              aria-label={`${en ? 'Testimonial' : 'Témoignage'} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'w-6 bg-emerald-500'
                  : 'w-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-emerald-300'
              }`}
            />
          ))}
        </div>

        {/* ── Desktop : grid ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <Card key={index} t={t} index={index} />
          ))}
        </div>

        {/* ── Social proof bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-center"
        >
          <div>
            <div className="flex justify-center gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">4.9/5</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{en ? 'Average rating' : 'Note moyenne'}</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-2xl font-black text-gradient-primary">
              <AnimatedCounter
                to={10000}
                duration={2.5}
                prefix=""
                suffix="+"
                format={(v) => (Math.round(v) / 1000).toString() + ' 000'}
              />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{en ? 'Satisfied clients' : 'Clients satisfaits'}</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-2xl font-black text-gradient-primary">
              <AnimatedCounter
                to={24}
                duration={2}
                suffix={en ? ' reviews' : ' avis'}
                format={(v) => Math.round(v).toString()}
              />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{en ? 'Verified' : 'Vérifiés'}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
