'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const partners = [
  {
    id: 'campost',
    name: 'CAMPOST',
    subtitle: 'Cameroon Postal Services',
    logo: '/images/partners/campost-real.png',
    url: 'https://www.campost.cm',
    color: 'from-red-50 to-orange-50',
    colorDark: 'from-red-900/20 to-yellow-900/10',
    border: 'border-red-100',
    borderDark: 'border-red-500/20',
    accent: 'text-red-600',
    accentDark: 'text-red-400',
    badge: 'bg-red-50 text-red-600 border-red-100',
    badgeDark: 'bg-red-900/30 text-red-400 border-red-500/20',
  },
  {
    id: 'minader',
    name: 'MINADER',
    subtitle: "Ministère de l'Agriculture et du Développement Rural",
    logo: '/images/partners/minader-real.jpg',
    url: 'https://www.minader.cm',
    color: 'from-green-50 to-emerald-50',
    colorDark: 'from-green-900/20 to-emerald-900/10',
    border: 'border-green-100',
    borderDark: 'border-green-500/20',
    accent: 'text-green-700',
    accentDark: 'text-green-400',
    badge: 'bg-green-50 text-green-700 border-green-100',
    badgeDark: 'bg-green-900/30 text-green-400 border-green-500/20',
  },
  {
    id: 'bange-bank',
    name: 'BANGE BANK',
    subtitle: 'La Banque de tous',
    logo: '/images/partners/bange-bank.png',
    url: 'https://www.bangecmr.com/',
    color: 'from-green-50 to-teal-50',
    colorDark: 'from-green-900/20 to-teal-900/10',
    border: 'border-green-100',
    borderDark: 'border-green-500/20',
    accent: 'text-green-700',
    accentDark: 'text-green-400',
    badge: 'bg-green-50 text-green-700 border-green-100',
    badgeDark: 'bg-green-900/30 text-green-400 border-green-500/20',
    description: 'Partenaire financier d\'AGRIPOINT SERVICES, BANGE BANK accompagne les agriculteurs camerounais avec des solutions de financement adaptées. La banque propose des crédits agricoles, un accompagnement personnalisé et des services bancaires accessibles pour soutenir le développement du secteur agricole au Cameroun.',
  },
  {
    id: 'emoh',
    name: 'Société EMOH & CIE',
    subtitle: 'Import / Export',
    logo: '/images/partners/emoh-bleu.png',
    logoHeight: 'h-[108px]',
    url: 'https://www.emoh-compagnie.com',
    color: 'from-blue-50 to-sky-50',
    colorDark: 'from-blue-900/20 to-sky-900/10',
    border: 'border-blue-100',
    borderDark: 'border-blue-500/20',
    accent: 'text-blue-700',
    accentDark: 'text-blue-400',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    badgeDark: 'bg-blue-900/30 text-blue-400 border-blue-500/20',
  },
  {
    id: 'civia',
    name: 'CIVIA',
    subtitle: 'Coopérative Indépendante Vivrière',
    logo: '/images/partners/civia-real.jpeg',
    url: '#',
    color: 'from-teal-50 to-green-50',
    colorDark: 'from-teal-900/20 to-green-900/10',
    border: 'border-teal-100',
    borderDark: 'border-teal-500/20',
    accent: 'text-teal-700',
    accentDark: 'text-teal-400',
    badge: 'bg-teal-50 text-teal-700 border-teal-100',
    badgeDark: 'bg-teal-900/30 text-teal-400 border-teal-500/20',
  },
  {
    id: 'cma',
    name: 'CMA',
    subtitle: 'Caisses Mutuelles Agricoles Africaines',
    logo: '/images/partners/cma.svg',
    url: '#',
    color: 'from-purple-50 to-violet-50',
    colorDark: 'from-purple-900/20 to-violet-900/10',
    border: 'border-purple-100',
    borderDark: 'border-purple-500/20',
    accent: 'text-purple-700',
    accentDark: 'text-purple-400',
    badge: 'bg-purple-50 text-purple-700 border-purple-100',
    badgeDark: 'bg-purple-900/30 text-purple-400 border-purple-500/20',
  },
  {
    id: 'planopac',
    name: 'PLANOPAC',
    subtitle: 'Plateforme Nationale des Organisations Professionnelles Agro-sylvo-pastorales et Halieutiques du Cameroun',
    logo: '/images/partners/planopac.jpg',
    url: 'https://www.facebook.com/p/Planopac-Online-100064810566427',
    color: 'from-amber-50 to-orange-50',
    colorDark: 'from-amber-900/20 to-orange-900/10',
    border: 'border-amber-100',
    borderDark: 'border-amber-500/20',
    accent: 'text-amber-700',
    accentDark: 'text-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
    badgeDark: 'bg-amber-900/30 text-amber-400 border-amber-500/20',
    description: 'Partenaire semencier d\'AGRIPOINT SERVICES, PLANOPAC fournit des semences de qualité certifiée pour toutes les cultures. Un engagement pour des semences performantes et adaptées aux conditions agricoles du Cameroun.',
  },
  {
    id: 'ap-sarl',
    name: 'AP AGRIPOINT SERVICES',
    subtitle: 'SARL — Fournisseur d\'intrants agricoles',
    logo: '/images/logo.png',
    url: '#',
    color: 'from-emerald-50 to-green-50',
    colorDark: 'from-emerald-900/20 to-green-900/10',
    border: 'border-emerald-100',
    borderDark: 'border-emerald-500/20',
    accent: 'text-emerald-700',
    accentDark: 'text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    badgeDark: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20',
    description: 'Distributeur officiel de biofertilisants et engrais pour le Cameroun. AP AGRI POINT SERVICES SARL est le partenaire privilégié pour la fourniture d\'intrants de qualité.',
  },
];

// Triple the list for seamless mobile marquee
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
      className={`relative overflow-hidden py-14 ${
        isDark
          ? 'bg-[#050a06] border-t border-white/5'
          : 'bg-white dark:bg-[#050a06] border-t border-gray-100 dark:border-white/5'
      }`}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* â”€â”€ Header â”€â”€ */}
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className={`section-tag ${
              isDark ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'dark:border-green-500/30 dark:bg-green-500/5 dark:text-green-400'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Partenaires de Confiance
            </span>
            <h2 className={`section-title ${
              isDark ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              <span className="text-red-500">Nos</span> Partenaires{' '}
              <span className={isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400' : 'text-red-500 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-green-500 dark:to-emerald-400'}>
                Institutionnels &amp; Stratégiques
              </span>
            </h2>
            <p className={`section-subtitle ${
              isDark ? 'text-white/45' : 'text-gray-500 dark:text-white/45'
            }`}>
              AGRIPOINT SERVICES bénéficie du soutien d&apos;acteurs clés du développement agricole camerounais.
              Cliquez sur un logo pour visiter leur site officiel.
            </p>
          </motion.div>
        )}

        {/* â”€â”€ Desktop grid (md+) â”€â”€ */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          {partners.map((p, i) => (
            <motion.a
              key={p.id}
              href={p.url}
              target={p.url !== '#' ? '_blank' : undefined}
              rel={p.url !== '#' ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300
                hover:scale-[1.03] hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-green-500 outline-none
                ${isDark
                  ? `bg-gradient-to-br ${p.colorDark} ${p.borderDark}`
                  : `bg-gradient-to-br ${p.color} ${p.border} dark:bg-none dark:bg-gray-800/40 dark:border-gray-700/40`
                }`}
              aria-label={`Visiter le site officiel de ${p.name}`}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute -inset-full h-full w-1/2 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out" />
              </div>

              <div className="relative px-5 py-6 flex flex-col items-center gap-4">
                {/* Logo */}
                <div className={`relative w-full ${ (p as { logoHeight?: string }).logoHeight ?? 'h-[72px]' }`}>
                  <Image
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    fill
                    className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>

                {/* Subtitle */}
                <p className={`text-[11px] font-semibold tracking-wider uppercase leading-tight text-center ${
                  isDark ? 'text-white/40' : 'text-gray-500 dark:text-white/40'
                }`}>{p.subtitle}</p>

                {/* CTA â€” apparaÃ®t au hover */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                  border transition-all duration-300
                  opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                  ${isDark ? p.badgeDark : `${p.badge} dark:bg-gray-700/30 dark:text-green-400 dark:border-green-500/20`}`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Visiter le site
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* â”€â”€ Mobile marquee (< md) â”€â”€ */}
        <div className="md:hidden overflow-hidden -mx-4 px-4">
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ['0%', '-33.333%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {loopPartners.map((p, i) => (
              <a
                key={`${p.id}-${i}`}
                href={p.url}
                target={p.url !== '#' ? '_blank' : undefined}
                rel={p.url !== '#' ? 'noopener noreferrer' : undefined}
                aria-label={`Site officiel ${p.name}`}
                className={`flex-shrink-0 w-36 rounded-xl border overflow-hidden p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform ${
                  isDark
                    ? `bg-gradient-to-br ${p.colorDark} ${p.borderDark}`
                    : `bg-gradient-to-br ${p.color} ${p.border} shadow-sm dark:bg-none dark:bg-gray-800/40 dark:border-gray-700/40`
                }`}
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
                <span className={`text-[10px] font-bold tracking-widest uppercase text-center leading-tight ${
                  isDark ? 'text-white/50' : 'text-gray-500 dark:text-white/50'
                }`}>{p.name}</span>
                <div className={`flex items-center gap-1 text-[10px] font-semibold ${
                  isDark ? p.accentDark : p.accent
                }`}>
                  <ExternalLink className="w-2.5 h-2.5" />
                  Site officiel
                </div>
              </a>
            ))}
          </motion.div>
        </div>

        {/* Divider tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex items-center gap-4"
        >
          <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-gray-200 dark:bg-white/10'}`} />
          <span className={`text-[11px] whitespace-nowrap ${isDark ? 'text-white/20' : 'text-gray-400 dark:text-white/20'}`}>
            Ensemble pour une agriculture durable au Cameroun
          </span>
          <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-gray-200 dark:bg-white/10'}`} />
        </motion.div>
      </div>
    </section>
  );
}
