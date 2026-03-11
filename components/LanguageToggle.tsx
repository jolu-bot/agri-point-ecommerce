'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
      aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en Français'}
      className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg
        bg-emerald-50 dark:bg-emerald-900/20
        border border-emerald-200 dark:border-emerald-700/40
        hover:bg-emerald-100 dark:hover:bg-emerald-800/30
        hover:border-emerald-300 dark:hover:border-emerald-600/60
        transition-all duration-200 group cursor-pointer"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
      <div className="relative overflow-hidden h-4 w-5 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={locale}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="absolute text-[11px] font-bold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase leading-none"
          >
            {locale}
          </motion.span>
        </AnimatePresence>
      </div>
    </button>
  );
}
