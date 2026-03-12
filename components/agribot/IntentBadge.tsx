'use client';

import { memo } from 'react';
import {
  Leaf, Package, ShoppingCart, UserCircle2, AlertTriangle,
  Sparkles, TrendingUp, Map,
} from 'lucide-react';
import { INTENT_LABELS } from '@/lib/agribot-i18n';

interface IntentConfig {
  icon: React.ReactNode;
  color: string;
}

const INTENT_CONFIG: Record<string, IntentConfig> = {
  conseil:    { icon: <Leaf className="w-2.5 h-2.5" />,         color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'   },
  produit:    { icon: <Package className="w-2.5 h-2.5" />,       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'       },
  commande:   { icon: <ShoppingCart className="w-2.5 h-2.5" />,  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'},
  compte:     { icon: <UserCircle2 className="w-2.5 h-2.5" />,   color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'},
  urgence:    { icon: <AlertTriangle className="w-2.5 h-2.5" />, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'           },
  culture:    { icon: <Sparkles className="w-2.5 h-2.5" />,      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'},
  campagne:   { icon: <Leaf className="w-2.5 h-2.5" />,          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'   },
  roi:        { icon: <TrendingUp className="w-2.5 h-2.5" />,    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'       },
  navigation: { icon: <Map className="w-2.5 h-2.5" />,           color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'},
};

interface Props {
  intent: string;
  locale?: string;
}

/**
 * Pill badge showing the intent classification of an AI message.
 * Memoised — intent and locale are stable once a message is finalised.
 */
export const IntentBadge = memo(function IntentBadge({ intent, locale = 'fr' }: Props) {
  const cfg   = INTENT_CONFIG[intent] ?? INTENT_CONFIG.conseil;
  const label = INTENT_LABELS[locale]?.[intent] ?? INTENT_LABELS.fr[intent] ?? intent;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}
    >
      {cfg.icon}{label}
    </span>
  );
});
