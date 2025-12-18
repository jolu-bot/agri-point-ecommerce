'use client';

import { motion } from 'framer-motion';

export default function Stats() {
  const stats = [
    {
      icon: '🌱',
      value: '20,000',
      label: 'Hectares cultivés',
      suffix: '+',
    },
    {
      icon: '👥',
      value: '10,000',
      label: 'Agriculteurs satisfaits',
      suffix: '+',
    },
    {
      icon: '🎯',
      value: '100',
      label: 'Produits biologiques',
      suffix: '%',
    },
    {
      icon: '⭐',
      value: '4.9',
      label: 'Note moyenne',
      suffix: '/5',
    },
  ];

  return (
    <section className="py-fluid-lg bg-gradient-to-b from-white to-primary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container-fluid">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-fluid-sm">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-fluid-sm rounded-fluid-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="font-display font-bold text-gradient-primary stat-value stat-mb">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium stat-label">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
