'use client';

import { motion } from 'framer-motion';

const stats = [
  { icon: '🌱', value: '20 000', label: 'Hectares cultivés', suffix: '+', color: 'from-emerald-500 to-green-600' },
  { icon: '👥', value: '10 000', label: 'Agriculteurs satisfaits', suffix: '+', color: 'from-teal-500 to-emerald-600' },
  { icon: '🎯', value: '100', label: 'Produits biologiques', suffix: '%', color: 'from-green-500 to-teal-600' },
  { icon: '⭐', value: '4.9', label: 'Note moyenne', suffix: '/5', color: 'from-amber-500 to-orange-500' },
];

export default function Stats() {
  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
      {/* Decorative bg blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-100/40 dark:bg-teal-900/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 font-bold mb-1">En chiffres</p>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Notre impact</h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Gradient top accent */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.color} opacity-80`} />

              <div className="text-4xl mb-3 filter drop-shadow-sm">{stat.icon}</div>
              <div className="text-3xl lg:text-4xl font-black text-gradient-primary leading-none mb-1">
                {stat.value}<span className="text-xl">{stat.suffix}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
