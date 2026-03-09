'use client';

import { motion } from 'framer-motion';
import { Leaf, Users2, BadgeCheck, Star } from 'lucide-react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const stats = [
  {
    Icon: Leaf,
    iconClass: 'text-emerald-600 dark:text-emerald-300',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    glowClass: 'icon-glow-emerald',
    color: 'from-emerald-500 to-green-600',
    value: 20000,
    label: 'Hectares cibles',
    suffix: '+',
    format: (v: number) => (Math.round(v) / 1000).toString() + '\u202f000',
    note: 'par site',
  },
  {
    Icon: Users2,
    iconClass: 'text-teal-600 dark:text-teal-300',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    glowClass: 'icon-glow-teal',
    color: 'from-teal-500 to-emerald-600',
    value: 10000,
    label: 'Producteurs',
    suffix: '+',
    format: (v: number) => (Math.round(v) / 1000).toString() + '\u202f000',
    note: 'visés par site',
  },
  {
    Icon: BadgeCheck,
    iconClass: 'text-green-700 dark:text-green-300',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    glowClass: 'icon-glow-green',
    color: 'from-green-500 to-teal-600',
    value: 5,
    label: 'Zones agroécologiques',
    suffix: '',
    format: (v: number) => Math.round(v).toString(),
    note: 'du Cameroun',
  },
  {
    Icon: Star,
    iconClass: 'text-amber-600 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    glowClass: 'icon-glow-amber',
    color: 'from-amber-500 to-orange-500',
    value: 3,
    label: 'Programmes phares',
    suffix: '',
    format: (v: number) => Math.round(v).toString(),
    note: 'de facilitation',
  },
];

export default function Stats() {
  return (
    <section className="py-fluid-lg relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
      {/* Decorative bg blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-100/40 dark:bg-teal-900/10 rounded-full blur-3xl" />
      </div>

      <div className="container-fluid relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          className="text-center mb-12"
        >
          <span className="section-tag">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En chiffres
          </span>
          <h2 className="section-title">Notre <span className="text-accent-green">vision</span></h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-fluid-sm">
          {stats.map((stat, index) => {
            const Icon = stat.Icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.08 }}
                className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-fluid-sm text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Gradient top accent */}
                <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${stat.color} opacity-90`} />

                {/* Icon circle */}
                <div
                  className={`mx-auto mb-4 mt-2 w-12 h-12 rounded-2xl flex items-center justify-center ${stat.iconBg} ${stat.glowClass} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconClass}`} strokeWidth={2.2} />
                </div>

                {/* Value */}
                <div className="text-3xl lg:text-4xl font-black text-gradient-primary leading-none mb-1">
                  <AnimatedCounter
                    to={stat.value}
                    duration={2.5}
                    suffix={stat.suffix}
                    format={stat.format}
                    decimals={stat.value < 10 ? 1 : 0}
                  />
                </div>

                {/* Label */}
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold leading-tight mt-1">{stat.label}</p>

                {/* Note subtile */}
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600 font-medium mt-1">{stat.note}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
