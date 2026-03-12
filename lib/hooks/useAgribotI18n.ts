'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { AGRIBOT_UI, type AgribotUIStrings } from '@/lib/agribot-i18n';

/**
 * Returns the fully-typed UI strings for the current locale.
 * Falls back to French if the locale is not 'en'.
 *
 * Usage:
 *   const t = useAgribotI18n();
 *   <button aria-label={t.fab.ariaOpen}>
 */
export function useAgribotI18n(): AgribotUIStrings {
  const { locale } = useLanguage();
  return locale === 'en' ? AGRIBOT_UI.en : AGRIBOT_UI.fr;
}
