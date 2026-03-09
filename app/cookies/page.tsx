'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCookiePreferences } from '@/lib/hooks/useCookiePreferences';
import { ChevronDown } from 'lucide-react';

export default function CookiesPage() {
  const { preferences, setPreferences, resetConsent } = useCookiePreferences();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updatePreference = (type: keyof typeof preferences, value: boolean) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    setPreferences({
      ...preferences,
      [type]: value
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Politique de Cookies 🍪
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            AGRIPOINT SERVICES utilise des cookies pour améliorer votre expérience, analyser le trafic
            et personnaliser le contenu. Vous contrôlez entièrement vos préférences.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>RGPD Compliant:</strong> Tous les cookies non-essentiels nécessitent votre consentement explicite.
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Section: Cookies Nécessaires */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('necessary')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition"
              >
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    🔒 Cookies Nécessaires (Obligatoires)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Essentiels pour le fonctionnement du site
                  </p>
                </div>
                <ChevronDown 
                  size={24} 
                  className={`text-gray-500 dark:text-gray-400 transition ${expandedSections.necessary ? 'rotate-180' : ''}`}
                />
              </button>
              
              {expandedSections.necessary && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  <div className="mb-4 flex items-center">
                    <label className="flex items-center cursor-not-allowed">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-5 h-5 text-green-600 dark:text-green-400 cursor-not-allowed rounded"
                        title="Cookies nécessaires toujours activés"
                      />
                      <span className="ml-3 text-sm">
                        <span className="font-semibold">Toujours activé</span> - Ces cookies ne peuvent pas être désactivés
                      </span>
                    </label>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">🔐 Session & Authentification</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Maintient votre session connectée, authentification utilisateur
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">🛡️ Sécurité</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Prévention des attaques CSRF, protection contre les fraudes
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">🎨 Préférences Fonctionnelles</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Mode sombre/clair, langue, paramètres d'accessibilité
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">🔍 Panier & Navigation</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Contenu du panier, historique de navigation, préférences produits
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Cookies Analytiques */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('analytics')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition"
              >
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    📊 Cookies Analytiques (Optionnel)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Nous aider à améliorer le site
                  </p>
                </div>
                <ChevronDown 
                  size={24} 
                  className={`text-gray-500 dark:text-gray-400 transition ${expandedSections.analytics ? 'rotate-180' : ''}`}
                />
              </button>
              
              {expandedSections.analytics && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => updatePreference('analytics', e.target.checked)}
                        className="w-5 h-5 text-blue-600 dark:text-blue-400 rounded"
                      />
                      <span className="ml-3 font-semibold text-sm">
                        {preferences.analytics ? '✅ Activé' : '❌ Désactivé'}
                      </span>
                    </label>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">📈 Google Analytics</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Analyse du trafic, des pages visitées, du comportement utilisateur.
                        Données anonymisées et pseudonymisées.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">🔍 Performance Monitoring</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Vitesse de chargement, erreurs, performances web
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Durée:</strong> 2 ans | 
                      <strong className="ml-2">Fournisseur:</strong> Google LLC
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Cookies Marketing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('marketing')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition"
              >
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    🎯 Cookies Marketing (Optionnel)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Publicités pertinentes et ciblées
                  </p>
                </div>
                <ChevronDown 
                  size={24} 
                  className={`text-gray-500 dark:text-gray-400 transition ${expandedSections.marketing ? 'rotate-180' : ''}`}
                />
              </button>
              
              {expandedSections.marketing && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => updatePreference('marketing', e.target.checked)}
                        className="w-5 h-5 text-purple-600 dark:text-purple-400 rounded"
                      />
                      <span className="ml-3 font-semibold text-sm">
                        {preferences.marketing ? '✅ Activé' : '❌ Désactivé'}
                      </span>
                    </label>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">👤 Retargeting d'Audience</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Vous montrer des publicités basées sur vos visites précédentes sur notre site
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">📱 Facebook Pixel</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Tracking des conversions, optimisation des campagnes publicitaires
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">🔄 Pixels Tiers</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Partenaires publicitaires pour optimisation du ROI
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Durée:</strong> Jusqu'à 2 ans | 
                      <strong className="ml-2">Fournisseurs:</strong> Meta, Google, partenaires tiers
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Cookies de Préférences */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('preferences')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/30 dark:hover:to-blue-900/30 transition"
              >
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    ⚙️ Cookies de Préférences (Optionnel)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Personnalisation de l'expérience
                  </p>
                </div>
                <ChevronDown 
                  size={24} 
                  className={`text-gray-500 dark:text-gray-400 transition ${expandedSections.preferences ? 'rotate-180' : ''}`}
                />
              </button>
              
              {expandedSections.preferences && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.preferences}
                        onChange={(e) => updatePreference('preferences', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 dark:text-indigo-400 rounded"
                      />
                      <span className="ml-3 font-semibold text-sm">
                        {preferences.preferences ? '✅ Activé' : '❌ Désactivé'}
                      </span>
                    </label>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">🌙 Thème & Affichage</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Mémoriser votre préférence de thème clair/sombre
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">🗣️ Langue</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Mémoriser la langue préférée
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="font-semibold text-sm">👀 Accessibilité</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Paramètres d'accessibilité et de confort visuel
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Actions & Info */}
          <div className="lg:col-span-1">
            {/* Résumé Actuel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📋 Vos Préférences
              </h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nécessaires</span>
                  <span className="text-2xl">🔒</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Analytiques</span>
                  <span className="text-xl">{preferences.analytics ? '✅' : '❌'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Marketing</span>
                  <span className="text-xl">{preferences.marketing ? '✅' : '❌'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Préférences</span>
                  <span className="text-xl">{preferences.preferences ? '✅' : '❌'}</span>
                </div>
              </div>

              <button
                onClick={resetConsent}
                className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm"
              >
                🔄 Réinitialiser Consentement
              </button>
            </div>

            {/* Liens Utiles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📚 Liens Utiles
              </h3>
              
              <div className="space-y-2">
                <Link
                  href="/confidentialite"
                  className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Politique de Confidentialité
                </Link>
                
                <Link
                  href="/mentions-legales"
                  className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mentions Légales
                </Link>
                
                <Link
                  href="/contact"
                  className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Nous Contacter
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ❓ Questions Fréquentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Puis-je changer mes préférences après?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Oui! Revenez sur cette page anytime ou cliquez sur l'icône 🍪 en bas du site.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                RGPD - Suis-je protégé?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ✅ Oui! Nous respectons tous les réglementations RGPD et CCPA.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Durée de conservation?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Les cookies analytiques durent 2 ans. Marketing jusqu'à 2 ans.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Comment supprimer les cookies?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paramètres du navigateur → Cookies → Effacer. Ou cliquez sur "Réinitialiser".
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
