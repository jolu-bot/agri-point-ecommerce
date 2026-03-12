'use client';

import { memo, useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { AGRIBOT_UI } from '@/lib/agribot-i18n';

interface Props {
  text:    string;
  locale?: string;
}

/**
 * Copy-to-clipboard button with 2-second visual feedback.
 * Memoised — locale and text are stable per message.
 */
export const CopyButton = memo(function CopyButton({ text, locale = 'fr' }: Props) {
  const [copied, setCopied] = useState(false);
  const t = locale === 'en' ? AGRIBOT_UI.en.copy : AGRIBOT_UI.fr.copy;

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text.replace(/<[^>]+>/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={copy}
      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
      title={t.title}
      aria-label={t.label}
    >
      {copied
        ? <Check className="w-3 h-3 text-green-500" aria-hidden />
        : <Copy  className="w-3 h-3"                aria-hidden />
      }
    </button>
  );
});
