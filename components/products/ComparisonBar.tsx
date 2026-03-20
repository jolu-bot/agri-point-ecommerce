'use client';

import { useCompareStore } from '@/store/compareStore';
import { useRouter } from 'next/navigation';
import { X, BarChart2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ComparisonBar() {
  const { slugs, removeSlug, clearSlugs } = useCompareStore();
  const router = useRouter();
  const { locale } = useLanguage();
  const en = locale === 'en';

  const handleCompare = () => {
    const url = '/produits/comparer?' + slugs.map((s, i) => `p${i + 1}=${s}`).join('&');
    router.push(url);
  };

  return (
    <AnimatePresence>
      {slugs.length > 0 && (
        <motion.div
          key="comparison-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-0 inset-x-0 z-40 bg-white/96 dark:bg-gray-950/96 backdrop-blur-xl border-t border-emerald-200 dark:border-emerald-800/50 shadow-[0_-8px_24px_-4px_rgba(16,163,74,0.18)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 px-4"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Product pills */}
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap gap-y-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                {en ? 'Compare:' : 'Comparer :'}
              </span>
              {slugs.map(slug => (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-xs font-semibold text-emerald-800 dark:text-emerald-300 max-w-[140px] truncate"
                >
                  <span className="truncate">{slug.replace(/-/g, ' ')}</span>
                  <button
                    onClick={() => removeSlug(slug)}
                    aria-label={`Retirer ${slug}`}
                    className="flex-shrink-0 hover:text-red-500 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={clearSlugs}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors underline"
              >
                {en ? 'Clear' : 'Effacer'}
              </button>
              <button
                onClick={handleCompare}
                disabled={slugs.length < 2}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                <BarChart2 className="w-4 h-4" />
                {en ? `Compare (${slugs.length})` : `Comparer (${slugs.length})`}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
