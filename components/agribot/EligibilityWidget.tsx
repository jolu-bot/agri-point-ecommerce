'use client';

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AGRIBOT_UI, ELIGIBILITY_QUESTIONS, type Language } from '@/lib/agribot-i18n';

interface Props {
  onComplete: (message: string) => void;
  locale?: string;
}

/**
 * 3-step YES/NO eligibility questionnaire for the fertilizer campaign.
 * Memoised — onComplete and locale are stable once the widget is mounted.
 */
export const EligibilityWidget = memo(function EligibilityWidget({ onComplete, locale = 'fr' }: Props) {
  const lang      = (locale === 'en' ? 'en' : 'fr') as Language;
  const t         = locale === 'en' ? AGRIBOT_UI.en.eligibility : AGRIBOT_UI.fr.eligibility;
  const questions = ELIGIBILITY_QUESTIONS[lang];

  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const answer = useCallback((yes: boolean) => {
    setAnswers(prev => {
      const newAns = [...prev, yes];
      if (step < questions.length - 1) {
        setStep(s => s + 1);
      } else {
        const eligible = newAns.every(Boolean);
        const summary  = questions.map((q, i) => `${newAns[i] ? '✅' : '❌'} ${q.text}`).join('\n');
        onComplete(eligible ? t.resultEligible(summary) : t.resultNotEligible(summary));
      }
      return newAns;
    });
  }, [step, questions, onComplete, t]);

  const q = questions[step];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
      role="form"
      aria-label={t.title}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">
          {t.title}
        </span>
        <span className="text-[11px] text-amber-500" aria-live="polite">
          {step + 1}/{questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="flex gap-1 mb-2.5"
        role="progressbar"
        aria-label={t.title}
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={questions.length}
      >
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step  ? 'bg-green-500'
            : i === step ? 'bg-amber-400 animate-pulse'
            : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <p className="text-[12px] text-amber-800 dark:text-amber-200 mb-3 font-medium">
        {q.icon} {q.text}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => answer(true)}
          className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[12px] font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
        >
          {t.yes}
        </button>
        <button
          onClick={() => answer(false)}
          className="flex-1 py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[12px] font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          {t.no}
        </button>
      </div>
    </motion.div>
  );
});
