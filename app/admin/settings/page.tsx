'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsApp: string;
  address: string;
  city: string;
  postalCode: string;
  agribot: {
    enabled: boolean;
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
  };
  email: {
    enabled: boolean;
    provider: string;
    fromName: string;
    fromEmail: string;
  };
  payment: {
    campost: {
      enabled: boolean;
      accountNumber: string;
      accountName: string;
    };
    cashOnDelivery: {
      enabled: boolean;
    };
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    expressShippingCost: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'AGRI POINT SERVICE',
    siteDescription: 'Votre partenaire pour une agriculture performante',
    contactEmail: 'infos@agri-ps.com',
    contactPhone: '+237 657 39 39 39',
    contactWhatsApp: '+237 676 02 66 01',
    address: 'B.P. 5111 Yaoundé',
    city: 'Yaoundé',
    postalCode: '5111',
    agribot: {
      enabled: true,
      model: 'gpt-4',
      systemPrompt: 'Vous êtes un expert agricole...',
      temperature: 0.7,
      maxTokens: 1000,
    },
    email: {
      enabled: false,
      provider: 'smtp',
      fromName: 'AGRI POINT SERVICE',
      fromEmail: 'noreply@agri-ps.com',
    },
    payment: {
      campost: {
        enabled: true,
        accountNumber: '',
        accountName: 'Agri Point Services',
      },
      cashOnDelivery: {
        enabled: true,
      },
    },
    shipping: {
      freeShippingThreshold: 50000,
      standardShippingCost: 2000,
      expressShippingCost: 5000,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Paramètres sauvegardés');
      } else {
        toast.error('Erreur de sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Paramètres
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configuration du site et des services
          </p>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Sauvegarder</span>
            </>
          )}
        </button>
      </div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informations Générales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="site-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du site
            </label>
            <input
              id="site-name"
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Nom du site"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email de contact
            </label>
            <input
              id="contact-email"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Email de contact"
            />
          </div>

          <div>
            <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Téléphone
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Numéro de téléphone"
            />
          </div>

          <div>
            <label htmlFor="contact-whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp
            </label>
            <input
              id="contact-whatsapp"
              type="tel"
              value={settings.contactWhatsApp}
              onChange={(e) => setSettings({ ...settings, contactWhatsApp: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Numéro WhatsApp"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="site-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description du site
            </label>
            <textarea
              id="site-description"
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Description du site"
            />
          </div>
        </div>
      </motion.div>

      {/* AgriBot Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuration AgriBot
          </h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.agribot.enabled}
              onChange={(e) => setSettings({
                ...settings,
                agribot: { ...settings.agribot, enabled: e.target.checked }
              })}
              className="sr-only peer"
              aria-label="Activer AgriBot"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="agribot-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Modèle
            </label>
            <select
              id="agribot-model"
              value={settings.agribot.model}
              onChange={(e) => setSettings({
                ...settings,
                agribot: { ...settings.agribot, model: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Sélectionner le modèle AgriBot"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div>
            <label htmlFor="agribot-temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Température ({settings.agribot.temperature})
            </label>
            <input
              id="agribot-temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.agribot.temperature}
              onChange={(e) => setSettings({
                ...settings,
                agribot: { ...settings.agribot, temperature: parseFloat(e.target.value) }
              })}
              className="w-full"
              aria-label="Ajuster la température d'AgriBot"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="agribot-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt système
            </label>
            <textarea
              id="agribot-prompt"
              value={settings.agribot.systemPrompt}
              onChange={(e) => setSettings({
                ...settings,
                agribot: { ...settings.agribot, systemPrompt: e.target.value }
              })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              aria-label="Modifier le prompt système d'AgriBot"
            />
          </div>
        </div>
      </motion.div>

      {/* Payment Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Méthodes de Paiement
        </h2>

        <div className="space-y-4">
          {/* Campost */}
          <div className="p-4 border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  🏢 Campost
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Principal</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Paiement via versement au bureau Campost
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment.campost.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: {
                      ...settings.payment,
                      campost: { ...settings.payment.campost, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                  aria-label="Activer Campost"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            {settings.payment.campost.enabled && (
              <div className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Numéro de Compte Campost
                  </label>
                  <input
                    type="text"
                    placeholder="1234-5678-9012-3456"
                    value={settings.payment.campost.accountNumber}
                    onChange={(e) => setSettings({
                      ...settings,
                      payment: {
                        ...settings.payment,
                        campost: { ...settings.payment.campost, accountNumber: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du Bénéficiaire
                  </label>
                  <input
                    type="text"
                    placeholder="Agri Point Services SARL"
                    value={settings.payment.campost.accountName}
                    onChange={(e) => setSettings({
                      ...settings,
                      payment: {
                        ...settings.payment,
                        campost: { ...settings.payment.campost, accountName: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    💡 <strong>Note:</strong> Ces informations seront affichées aux clients après leur commande pour effectuer le paiement Campost.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Paiement à la livraison */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">💵 Paiement à la Livraison</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Le client paie en espèces lors de la réception
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment.cashOnDelivery.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: {
                      ...settings.payment,
                      cashOnDelivery: { ...settings.payment.cashOnDelivery, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                  aria-label="Activer Paiement à la livraison"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
