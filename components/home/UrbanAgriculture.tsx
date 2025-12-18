'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function UrbanAgriculture() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold mb-6">
              🏙️ Agriculture Urbaine
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Cultivez en Ville
            </h2>

            <p className="text-lg text-primary-50 mb-8">
              Découvrez nos solutions pour l&apos;agriculture urbaine : kits de démarrage, conseils personnalisés, et accompagnement complet pour cultiver vos propres aliments en ville.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Kits complets pour balcons et terrasses',
                'Conseils IA personnalisés par AgriBot',
                'Formations vidéo et guides pratiques',
                'Communauté d\'agriculteurs urbains',
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm">✓</span>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/agriculture-urbaine"
              className="inline-flex items-center bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
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
