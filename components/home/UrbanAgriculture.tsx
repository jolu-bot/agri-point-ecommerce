'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Building2 } from 'lucide-react';

export default function UrbanAgriculture() {
  return (
    <section className="section-premium bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white">
      <div className="container-fluid">
        <div className="grid lg:grid-cols-2 gap-fluid-md items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/15 backdrop-blur-md text-sm font-semibold mb-6">
              <Building2 className="w-4 h-4" />
              Agriculture Urbaine
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Cultivez en Ville
            </h2>

            <p className="text-lg text-primary-50 mb-8">
              Découvrez nos solutions pour l&apos;agriculture urbaine : kits de démarrage, conseils personnalisés, et accompagnement complet pour cultiver vos propres aliments en ville.
            </p>

            <ul className="space-y-3.5 mb-8">
              {[
                'Kits complets pour balcons et terrasses',
                'Conseils IA personnalisés par AgriBot',
                'Formations vidéo et guides pratiques',
                "Communauté d'agriculteurs urbains",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" strokeWidth={2.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/agriculture-urbaine"
              className="inline-flex items-center gap-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 group"
            >
              Commencer maintenant
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28, delay: 0.1 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors">
                  <div className="text-4xl mb-3">🌿</div>
                  <div className="font-semibold mb-1">Potager Urbain</div>
                  <div className="text-sm text-primary-100">Cultivez vos légumes</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors">
                  <div className="text-4xl mb-3">🥬</div>
                  <div className="font-semibold mb-1">Herbes Aromatiques</div>
                  <div className="text-sm text-primary-100">Fraîches toute l&apos;année</div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors">
                  <div className="text-4xl mb-3">🍅</div>
                  <div className="font-semibold mb-1">Fruits & Légumes</div>
                  <div className="text-sm text-primary-100">Production locale</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors">
                  <div className="text-4xl mb-3">🌱</div>
                  <div className="font-semibold mb-1">Micro-Pousses</div>
                  <div className="text-sm text-primary-100">Récolte rapide</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
