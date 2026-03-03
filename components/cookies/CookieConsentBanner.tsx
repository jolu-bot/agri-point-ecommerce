'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, CheckCircle2, XCircle, Settings } from 'lucide-react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Charger préférences existantes au montage
  useEffect(() => {
    const consentGiven = localStorage.getItem('cookie_consent_given');
    
    if (!consentGiven) {
      setShowBanner(true);
    } else {
      const saved = localStorage.getItem('cookie_preferences');
      if (saved) {
        try {
          setPreferences(JSON.parse(saved));
        } catch (e) {
          // Reset if corrupted
          localStorage.removeItem('cookie_preferences');
        }
      }
      // Initialiser cookies selon préférences sauvegardées
      initializeCookies(preferences);
    }
  }, []);

  const saveCookies = (prefs: CookiePreferences) => {
    // Sauvegarder dans localStorage (exempt RGPD comme "strictly necessary")
    localStorage.setItem('cookie_preferences', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_given', new Date().toISOString());
    localStorage.setItem('cookie_consent_version', '1.0');

    // Sauvegarder aussi en cookie pour server-side detection
    document.cookie = `cookie_preferences=${encodeURIComponent(JSON.stringify(prefs))}; max-age=31536000; path=/; secure; samesite=lax`;

    // Initialiser les cookies dynamiquement
    initializeCookies(prefs);

    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const initializeCookies = (prefs: CookiePreferences) => {
    // Analytics
    if (prefs.analytics && process.env.NEXT_PUBLIC_GA_ID) {
      loadGoogleAnalytics(process.env.NEXT_PUBLIC_GA_ID);
    }

    // Marketing (Facebook Pixel, etc)
    if (prefs.marketing) {
      loadFacebookPixel();
    }

    // Preferences
    if (prefs.preferences) {
      loadPreferencesTracking();
    }

    // 📊 Log pour vérification
    console.log('🍪 Cookies initialized:', prefs);
  };

  const loadGoogleAnalytics = (gaId: string) => {
    // Script Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      // @ts-ignore
      window.dataLayer.push(arguments);
    }
    // @ts-ignore
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  };

  const loadFacebookPixel = () => {
    if (!process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  };

  const loadPreferencesTracking = () => {
    // Hotjar ou autre
    console.log('Preferences tracking loaded');
  };

  const handleAcceptAll = () => {
    saveCookies({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const handleRejectAll = () => {
    saveCookies({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const handleSavePreferences = () => {
    saveCookies(preferences);
  };

  return (
    <AnimatePresence>
      {showBanner && !showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-lg border-t border-gray-700 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <Cookie className="w-8 h-8 text-emerald-400" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  🍪 Nous respections votre vie privée
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  AGRI POINT SERVICE utilise des cookies pour améliorer votre expérience.
                  Vous avez le contrôle total sur vos préférences.{' '}
                  <Link href="/cookies" className="text-emerald-400 underline hover:text-emerald-300">
                    En savoir plus
                  </Link>
                </p>

                <div className="space-y-3">
                  {/* Cookie Categories Summary */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-300">Cookies Nécessaires (obligatoires)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Analytics & Marketing (optionnels)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col gap-3 ml-4">
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  Tout Accepter
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Personnaliser
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  Tout Refuser
                </button>
              </div>
            </div>

            {/* Accessibility info */}
            <div className="mt-4 text-xs text-gray-500 border-t border-gray-700 pt-4">
              <p>
                En poursuivant votre navigation, vous acceptez notre{' '}
                <Link href="/cgu" className="text-emerald-400 underline">
                  CGU
                </Link>{' '}
                et notre{' '}
                <Link href="/confidentialite" className="text-emerald-400 underline">
                  Politique de Confidentialité
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <CookieSettingsPanel
          preferences={preferences}
          setPreferences={setPreferences}
          onSave={handleSavePreferences}
          onCancel={() => setShowSettings(false)}
        />
      )}
    </AnimatePresence>
  );
}

// Panneau de paramétrage
function CookieSettingsPanel({
  preferences,
  setPreferences,
  onSave,
  onCancel,
}: {
  preferences: CookiePreferences;
  setPreferences: (p: CookiePreferences) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const categories = [
    {
      id: 'necessary',
      name: 'Cookies Nécessaires',
      description: 'Essentiels pour le fonctionnement (authentification, panier, sécurité)',
      required: true,
      icon: '🔒',
    },
    {
      id: 'analytics',
      name: 'Cookies Analytiques',
      description: 'Nous aident à comprendre comment vous utilisez notre site (Google Analytics)',
      required: false,
      icon: '📊',
    },
    {
      id: 'marketing',
      name: 'Cookies Marketing',
      description: 'Personnalisent votre expérience et les publicités (Facebook Pixel)',
      required: false,
      icon: '🎯',
    },
    {
      id: 'preferences',
      name: 'Cookies de Préférences',
      description: 'Mémorisent vos choix (langue, thème, région)',
      required: false,
      icon: '⚙️',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🍪 Gérer vos Préférences de Cookies
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Contrôlez précisément quels cookies vous souhaitez autoriser
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    {category.required && (
                      <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded">
                        Obligatoire
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>

                {/* Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[category.id as keyof CookiePreferences]}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        [category.id]: e.target.checked,
                      })
                    }
                    disabled={category.required}
                    className="sr-only peer"
                    title={`Toggle ${category.name} cookies`}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* Cookie Details */}
              {category.id === 'necessary' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Cookies utilisés:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">accessToken</code> (15 min) - Authentification</li>
                    <li>• <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">refreshToken</code> (7 jours) - Session</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-800 px-8 py-6 border-t border-gray-200 dark:border-gray-700 flex gap-4 justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Annuler
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSave}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Sauvegarder & Fermer
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
