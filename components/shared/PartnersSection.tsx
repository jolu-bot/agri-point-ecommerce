'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const partners = [
  {
    id: 'campost',
    name: 'CAMPOST',
    subtitle: 'La Poste du Cameroun',
    logo: '/images/partners/campost-real.png',
    color: 'from-red-900/20 to-yellow-900/10',
    border: 'border-red-500/20',
    glow: 'group-hover:shadow-red-500/20',
  },
  {
    id: 'minader',
    name: 'MINADER',
    subtitle: 'Ministère de l\'Agriculture',
    logo: '/images/partners/minader-real.jpg',
    color: 'from-green-900/20 to-emerald-900/10',
    border: 'border-green-500/20',
    glow: 'group-hover:shadow-green-500/20',
  },
  {
    id: 'emoh',
    name: 'EMOH',
    subtitle: 'Enterprise Market Opportunity Hub',
    logo: '/images/partners/emoh-real.png',
    color: 'from-blue-900/20 to-sky-900/10',
    border: 'border-blue-500/20',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    id: 'civia',
    name: 'CIVIA',
    subtitle: 'Coopérative Indépendante Vivrière',
    logo: '/images/partners/civia-real.jpeg',
    color: 'from-teal-900/20 to-green-900/10',
    border: 'border-teal-500/20',
    glow: 'group-hover:shadow-teal-500/20',
  },
];

// Double the list for seamless infinite loop
const loopPartners = [...partners, ...partners, ...partners];

interface PartnersSectionProps {
  variant?: 'dark' | 'light';
  showTitle?: boolean;
}

export default function PartnersSection({
  variant = 'dark',
  showTitle = true,
}: PartnersSectionProps) {
  const isDark = variant === 'dark';

  return (
    <section
      className={`relative overflow-hidden py-12 ${
        isDark
          ? 'bg-[#050a06] border-t border-white/5'
          : 'bg-white border-t border-gray-100'
      }`}
    >
      {/* Background grain texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0YWRlODAiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4
              border-green-500/30 bg-green-500/5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className={`text-xs font-semibold tracking-widest uppercase ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                Partenaires de Confiance
              </span>
            </div>

            <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Nos Partenaires{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                Institutionnels
              </span>{' '}
              &amp; Sponsors
            </h2>
            <p className={`mt-2 text-sm max-w-xl mx-auto ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              AGRI POINT bénéficie du soutien d&apos;acteurs clés du développement agricole camerounais.
            </p>
          </motion.div>
        )}

        {/* ── Static grid (md+) ── */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {partners.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative rounded-2xl p-1 bg-gradient-to-br ${p.color} border ${p.border}
                cursor-default select-none transition-all duration-300
                hover:scale-105 hover:shadow-xl ${p.glow}`}
            >
              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                transition-opacity duration-500 pointer-events-none overflow-hidden">
                <div className="absolute -inset-full top-0 h-full w-1/2 z-10
                  bg-gradient-to-r from-transparent via-white/5 to-transparent
                  skew-x-[-20deg] translate-x-[-200%] group-hover:translate-x-[400%]
                  transition-transform duration-1000 ease-in-out" />
              </div>

              <div className={`relative rounded-xl overflow-hidden px-4 py-5 flex flex-col items-center gap-3
                ${isDark ? 'bg-white/3' : 'bg-gray-50 border border-gray-100'} backdrop-blur-sm`}>
                {/* Logo */}
                <div className="relative w-full h-16">
                  <Image
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    fill
                    className="object-contain drop-shadow-lg"
                    unoptimized
                  />
                </div>
                {/* Name + subtitle */}
                <div className="text-center">
                  <div className={`text-xs font-bold tracking-wider uppercase mt-1 ${
                    isDark ? 'text-white/40' : 'text-gray-400'
                  }`}>{p.subtitle}</div>
                </div>

                {/* Verified badge */}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                  ${isDark
                    ? 'bg-green-900/40 text-green-400 border border-green-500/20'
                    : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Partenaire officiel
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Marquee ticker (mobile < md) ── */}
        <div className="md:hidden overflow-hidden -mx-4">
          <motion.div
            className="flex gap-4 w-max"
            animate={{ x: ['0%', '-33.333%'] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {loopPartners.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className={`flex-shrink-0 rounded-xl border ${p.border} bg-gradient-to-br ${p.color}
                  w-44 px-3 py-4 flex flex-col items-center gap-2`}
              >
                <div className="relative w-full h-12">
                  <Image
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className={`text-xs font-bold tracking-widest uppercase ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}>{p.name}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Subtle divider with tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 flex items-center gap-4"
        >
          <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-gray-200'}`} />
          <span className={`text-xs whitespace-nowrap ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
            Ensemble pour une agriculture durable au Cameroun
          </span>
          <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-gray-200'}`} />
        </motion.div>
      </div>
    </section>
  );
}
