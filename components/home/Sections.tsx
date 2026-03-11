'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sprout, Banknote, HeartHandshake, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SECTIONS_STYLE = [
  {
    Icon: Sprout,
    link: '/produire-plus',
    accentTop: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    glowClass: 'icon-glow-emerald-lg',
    tagClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/40',
    checkColor: 'text-emerald-600 dark:text-emerald-400',
    btnClass: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-600/25',
  },
  {
    Icon: Banknote,
    link: '/gagner-plus',
    accentTop: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-700 dark:text-amber-300',
    glowClass: 'icon-glow-amber-lg',
    tagClass: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/40',
    checkColor: 'text-amber-600 dark:text-amber-400',
    btnClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/25',
  },
  {
    Icon: HeartHandshake,
    link: '/mieux-vivre',
    accentTop: 'from-teal-500 to-cyan-500',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconColor: 'text-teal-700 dark:text-teal-300',
    glowClass: 'icon-glow-teal-lg',
    tagClass: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/40',
    checkColor: 'text-teal-600 dark:text-teal-400',
    btnClass: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-teal-600/25',
  },
];

export default function Sections() {
  const { T } = useLanguage();
  const sections = [
    {
      ...SECTIONS_STYLE[0],
      title: T.sections.p1Title,
      subtitle: T.sections.p1Subtitle,
      description: T.sections.p1Desc,
      features: [T.sections.p1F1, T.sections.p1F2, T.sections.p1F3, T.sections.p1F4, T.sections.p1F5],
    },
    {
      ...SECTIONS_STYLE[1],
      title: T.sections.p2Title,
      subtitle: T.sections.p2Subtitle,
      description: T.sections.p2Desc,
      features: [T.sections.p2F1, T.sections.p2F2, T.sections.p2F3, T.sections.p2F4],
    },
    {
      ...SECTIONS_STYLE[2],
      title: T.sections.p3Title,
      subtitle: T.sections.p3Subtitle,
      description: T.sections.p3Desc,
      features: [T.sections.p3F1, T.sections.p3F2, T.sections.p3F3, T.sections.p3F4],
    },
  ];

  return (
    <section className="section-premium bg-gradient-to-b from-gray-50/60 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container-fluid">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-16"
        >
          <span className="section-tag">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {T.sections.tag}
          </span>
          <h2 className="section-title"><span className="text-red-500">{T.sections.title}</span> {T.sections.titleHighlight}</h2>
          <p className="section-subtitle" dangerouslySetInnerHTML={{ __html: T.sections.subtitle }} />
        </motion.div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
          {sections.map((section, index) => {
            const Icon = section.Icon;
            return (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.14, type: 'spring', stiffness: 240, damping: 24 }}
                className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.07] rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Gradient accent top bar */}
                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${section.accentTop}`} />

                <div className="p-7 flex flex-col flex-1">
                  {/* Icon + tag row */}
                  <div className="flex items-start justify-between mb-6">
                    {/* Icon circle */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${section.iconBg} ${section.glowClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2`}
                    >
                      <Icon className={`w-6 h-6 ${section.iconColor}`} strokeWidth={2} />
                    </div>

                    {/* Tag pill */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${section.tagClass}`}
                    >
                      {T.sections.program}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                    {section.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                    {section.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                    {section.description}
                  </p>

                  {/* Feature list */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {section.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${section.checkColor}`}
                          strokeWidth={2.5}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <Link
                    href={section.link}
                    className={`group/btn mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] ${section.btnClass}`}
                  >
                    {T.sections.learnMore}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
