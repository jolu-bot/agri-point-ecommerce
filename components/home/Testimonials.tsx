'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const testimonials = [
  {
    name: 'Jean-Pierre M.',
    role: 'Agriculteur',
    location: 'Yaoundé',
    content: 'Grâce aux biofertilisants AGRI POINT, ma production de tomates a doublé. Service excellent et conseils précieux !',
    rating: 5,
    avatar: '👨‍🌾',
    color: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20',
    border: 'border-emerald-100 dark:border-emerald-800/30',
  },
  {
    name: 'Marie K.',
    role: 'Agriculture urbaine',
    location: 'Douala',
    content: 'AgriBot m\'a aidée à démarrer mon potager urbain. Je cultive maintenant mes propres légumes sur mon balcon !',
    rating: 5,
    avatar: '👨‍🌾',
    color: 'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20',
    border: 'border-teal-100 dark:border-teal-800/30',
  },
  {
    name: 'Thomas B.',
    role: 'Producteur de cacao',
    location: 'Bafoussam',
    content: 'Les produits sont de qualité supérieure et les résultats sont visibles dés les premières semaines. Je recommande !',
    rating: 5,
    avatar: '👨‍🌾',
    color: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20',
    border: 'border-green-100 dark:border-green-800/30',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Subtle dot bg via CSS */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03] [background-image:radial-gradient(circle,#16a34a_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="section-tag">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Témoignages clients
          </span>
          <h2 className="section-title">
            Ce que disent nos <span className="text-accent-green">clients</span>
          </h2>
          <p className="section-subtitle">
            Des milliers d&apos;agriculteurs nous font confiance au Cameroun
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className={`relative rounded-2xl border bg-gradient-to-br ${t.color} ${t.border} p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="w-10 h-10 text-emerald-700 dark:text-emerald-400 fill-emerald-700 dark:fill-emerald-400" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic text-[15px]">
                &ldquo;{t.content}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-green-700 dark:from-emerald-600 dark:to-green-800 rounded-xl shadow-sm flex items-center justify-center text-white font-black text-base flex-shrink-0 select-none">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{t.role} · {t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          <div>
            <div className="flex justify-center gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">4.9/5</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Note moyenne</p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Clients satisfaits</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-2xl font-black text-gradient-primary">
              <AnimatedCounter 
                to={24} 
                duration={2} 
                suffix=" avis" 
                format={(v) => Math.round(v).toString()}
              />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Vérifiés</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
