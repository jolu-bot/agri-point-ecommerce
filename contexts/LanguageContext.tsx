'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Locale, TranslationData } from '@/lib/translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  T: TranslationData;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr',
  setLocale: () => {},
  T: translations.fr,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('agripoint-lang') as Locale | null;
      if (saved === 'fr' || saved === 'en') {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // localStorage may be unavailable in some contexts
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('agripoint-lang', l);
    } catch {}
    document.documentElement.lang = l;
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, T: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}
