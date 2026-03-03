'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import HeroSlideshow from './HeroSlideshow';

interface HeroLandingProps {
  badge: string;
  badgeIcon?: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary?: { text: string; href: string };
  images: string[];
  colorScheme: 'green' | 'blue' | 'amber' | 'emerald';
  stats?: Array<{
    value: string;
    label: string;
    icon: LucideIcon;
  }>;
}

const colorClasses = {
  green: {
    badge: 'bg-green-50/80 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/30',
    title: 'text-green-600 dark:text-green-400',
    ctaPrimary: 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20',
    ctaSecondary: 'border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10',
    glow: 'bg-green-500/10',
  },
  blue: {
    badge: 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/30',
    title: 'text-blue-600 dark:text-blue-400',
    ctaPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
    ctaSecondary: 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10',
    glow: 'bg-blue-500/10',
  },
  amber: {
    badge: 'bg-amber-50/80 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/30',
    title: 'text-amber-600 dark:text-amber-400',
    ctaPrimary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
    ctaSecondary: 'border-amber-600 dark:border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10',
    glow: 'bg-amber-500/10',
  },
  emerald: {
    badge: 'bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/30',
    title: 'text-emerald-600 dark:text-emerald-400',
    ctaPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
    ctaSecondary: 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10',
    glow: 'bg-emerald-500/10',
  },
};

export default function HeroLanding({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  images,
  colorScheme,
  stats,
}: HeroLandingProps) {
  const colors = colorClasses[colorScheme];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 sm:py-16 lg:py-20">
      {/* Subtle glow effect */}
      <div className={`absolute -top-40 -right-40 w-80 h-80 ${colors.glow} rounded-full blur-3xl opacity-20`} />
      <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${colors.glow} rounded-full blur-3xl opacity-20`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm mb-4 sm:mb-6 text-xs sm:text-sm font-medium shadow-sm"
                 className={colors.badge}>
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span>{badge}</span>
            </div>

            {/* Title - Mobile-friendly sizes */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 sm:mb-4">
              <span className="block text-gray-900 dark:text-white">{title}</span>
            </h1>

            {/* Subtitle */}
            <p className={`text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 ${colors.title}`}>
              {subtitle}
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6 sm:mb-8">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-10">
              <Link
                href={ctaPrimary.href}
                className={`inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${colors.ctaPrimary}`}
              >
                {ctaPrimary.text}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              {ctaSecondary && (
                <Link
                  href={ctaSecondary.href}
                  className={`inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 font-semibold text-sm sm:text-base transition-all duration-200 backdrop-blur-sm ${colors.ctaSecondary}`}
                >
                  {ctaSecondary.text}
                </Link>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center lg:text-left"
                  >
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                      <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.title}`} />
                      <div className={`text-xl sm:text-2xl font-bold ${colors.title}`}>
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] sm:aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <HeroSlideshow
                images={images}
                alt={title}
                objectFit="cover"
                interval={3500}
              />
            </div>
            {/* Decorative element */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 ${colors.glow} rounded-full blur-2xl opacity-30 pointer-events-none`} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
