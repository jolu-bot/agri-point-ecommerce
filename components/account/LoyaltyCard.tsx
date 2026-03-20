'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface LoyaltyCardProps {
  points: number;
  tier: string;
  tierLabel: string;
  nextTierLabel: string | null;
  remaining: number;
  progress: number;
  en?: boolean;
}

const TIER_STYLES: Record<string, { gradient: string; text: string; bar: string; badge: string }> = {
  bronze:  {
    gradient: 'from-amber-700 via-amber-600 to-amber-500',
    text:     'text-amber-100',
    bar:      'bg-amber-300',
    badge:    'bg-amber-800/40 text-amber-200',
  },
  argent:  {
    gradient: 'from-gray-500 via-gray-400 to-gray-300',
    text:     'text-gray-50',
    bar:      'bg-white',
    badge:    'bg-gray-600/40 text-gray-100',
  },
  or:      {
    gradient: 'from-yellow-600 via-yellow-500 to-yellow-400',
    text:     'text-yellow-50',
    bar:      'bg-yellow-200',
    badge:    'bg-yellow-700/40 text-yellow-100',
  },
  platine: {
    gradient: 'from-purple-700 via-purple-500 to-indigo-500',
    text:     'text-purple-50',
    bar:      'bg-purple-200',
    badge:    'bg-purple-800/40 text-purple-100',
  },
};

export default function LoyaltyCard({
  points, tier, tierLabel, nextTierLabel, remaining, progress, en = false,
}: LoyaltyCardProps) {
  const styles = TIER_STYLES[tier] ?? TIER_STYLES.bronze;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-2xl bg-gradient-to-br ${styles.gradient} p-6 shadow-lg overflow-hidden`}
    >
      {/* Background glow */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className={`w-6 h-6 ${styles.text}`} />
            <span className={`font-black text-lg tracking-wide ${styles.text}`}>
              {en ? 'Loyalty Program' : 'Programme Fidélité'}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${styles.badge}`}>
            {tierLabel}
          </span>
        </div>

        {/* Points */}
        <div className={`text-4xl font-black mb-1 ${styles.text}`}>
          {points.toLocaleString('fr-FR')}
          <span className="text-sm font-semibold ml-1.5 opacity-80">pts</span>
        </div>

        {/* Progress bar */}
        {nextTierLabel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs opacity-70 mb-1.5">
              <span className={styles.text}>{tierLabel}</span>
              <span className={styles.text}>{nextTierLabel}</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${styles.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className={`text-xs mt-2 opacity-75 ${styles.text}`}>
              {remaining.toLocaleString('fr-FR')} pts {en ? 'until' : 'avant'} {nextTierLabel}
            </p>
          </div>
        )}

        {tier === 'platine' && (
          <p className={`text-xs mt-3 opacity-75 ${styles.text}`}>
            {en ? '🏆 Maximum tier reached!' : '🏆 Palier maximum atteint !'}
          </p>
        )}
      </div>
    </motion.div>
  );
}
