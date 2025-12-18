'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Heart } from 'lucide-react';

export default function Sections() {
  const sections = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'PRODUIRE PLUS',
      subtitle: 'Better Production',
      description: 'Information pour produire ce qui peut être vendu d\'avance. Formation pour produire plus et à moindre coût.',
      features: [
        'Aménagement des espaces agricoles',
        'Formation optimisée',
        'Acquisition matériels compétitifs',
        'Location d\'équipements facilitant le travail',
      ],
      color: 'primary',
      link: '/produire-plus',
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'GAGNER PLUS',
      subtitle: 'Gain More',
      description: 'Les débouchés, les prix bien négociés et l\'appui à la commercialisation des produits.',
      features: [
        'Warrantage des stocks après récolte',
        'Appui à la transformation',
        'Assistance montage projets',
        'Recherche de financements',
      ],
      color: 'secondary',
      link: '/gagner-plus',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'MIEUX VIVRE',
      subtitle: 'Better Living',
      description: 'Accès aux services financiers de base, sécurisation de l\'épargne et micro assurance.',
      features: [
        'Services financiers de base',
        'Micro crédit et épargne',
        'Assurance santé et décès',
        'Accès technologies et transport',
      ],
      color: 'green',
      link: '/mieux-vivre',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Nos Objectifs</h2>
          <p className="section-subtitle">
            1 AGRI SERVICE POINT POUR : 20 000 HECTARES / 10 000 PERSONNES
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group"
            >
              <div className="card hover:scale-105 transition-transform duration-300 h-full">
                <div className={`w-16 h-16 bg-${section.color}-100 dark:bg-${section.color}-900/30 rounded-xl flex items-center justify-center text-${section.color}-600 dark:text-${section.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                  {section.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-4 font-semibold">
                  {section.subtitle}
                </p>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {section.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {section.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={section.link}
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  En savoir plus →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
