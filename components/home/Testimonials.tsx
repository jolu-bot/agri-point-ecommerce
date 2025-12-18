'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Jean-Pierre M.',
      role: 'Agriculteur - Yaoundé',
      content: 'Grâce aux biofertilisants AGRI POINT, ma production de tomates a doublé. Service excellent et conseils précieux !',
      rating: 5,
      image: '👨‍🌾',
    },
    {
      name: 'Marie K.',
      role: 'Agriculture urbaine - Douala',
      content: 'AgriBot m\'a aidée à démarrer mon potager urbain. Je cultive maintenant mes propres légumes sur mon balcon !',
      rating: 5,
      image: '👩‍🌾',
    },
    {
      name: 'Thomas B.',
      role: 'Producteur de cacao - Bafoussam',
      content: 'Les produits sont de qualité supérieure et les résultats sont visibles dès les premières semaines. Je recommande !',
      rating: 5,
      image: '🧑‍🌾',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Ce que disent nos clients</h2>
          <p className="section-subtitle">
            Des milliers d&apos;agriculteurs nous font confiance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-2xl">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
