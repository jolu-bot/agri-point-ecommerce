'use client';

import { memo } from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AGRIBOT_UI } from '@/lib/agribot-i18n';

interface Props {
  context: string;
  locale?: string;
}

/**
 * Card shown when intent = 'urgence' or the API signals escalation.
 * Memoised — context and locale are stable once the message is finalised.
 */
export const EscalationCard = memo(function EscalationCard({ context, locale = 'fr' }: Props) {
  const t       = locale === 'en' ? AGRIBOT_UI.en.escalation : AGRIBOT_UI.fr.escalation;
  const summary = encodeURIComponent(
    t.waPrefix + context.replace(/<[^>]+>/g, '').slice(0, 200)
  );
  const waUrl = `https://wa.me/237657393939?text=${summary}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mt-2 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-3"
      role="complementary"
      aria-label={t.title}
    >
      <p className="text-[12px] font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-1.5 mb-1.5">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />
        {t.title}
      </p>
      <p className="text-[11px] text-orange-700 dark:text-orange-400 mb-2.5 leading-relaxed">
        {t.desc}
      </p>
      <div className="flex flex-col gap-1.5">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-[12px] font-medium rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.528 5.855L.057 23.882l6.147-1.613A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.027-1.381l-.36-.214-3.728.978.994-3.634-.234-.373A9.775 9.775 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
          </svg>
          {t.whatsapp}
        </a>
        <a
          href="tel:+237657393939"
          className="flex items-center justify-center gap-2 px-3 py-2 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 text-[12px] font-medium rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" aria-hidden />
          {t.call}
        </a>
      </div>
    </motion.div>
  );
});
