'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  Shield, 
  Zap,
  Save,
  RotateCcw,
  Eye,
  FileText,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  FileEdit,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HeaderConfig {
  logo: {
    url: string;
    sizes: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  };
  primaryText: {
    content: string;
    sizes: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
    fontWeight: string;
    color: string;
  };
  secondaryText: {
    content: string;
    sizes: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
    fontWeight: string;
    color: string;
  };
  height: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  spacing: string;
}

interface ModulesConfig {
  products: { enabled: boolean; allowReviews: boolean; showStock: boolean };
  orders: { enabled: boolean; autoConfirmation: boolean; requireEmailVerification: boolean };
  payments: {
    campost: boolean;
    mtnMomo: boolean;
    orangeMoney: boolean;
    notchPay: boolean;
    cineTPay: boolean;
    cash: boolean;
  };
  blog: { enabled: boolean; allowComments: boolean };
  campaigns: { enabled: boolean; showCountdown: boolean };
  urbanAgriculture: { enabled: boolean; showCourses: boolean };
}

interface SiteConfig {
  header: HeaderConfig;
  modules: ModulesConfig;
  advanced: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    enableAgriBot: boolean;
    enableNewsletter: boolean;
  };
}

export default function SiteConfigAdvancedPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'modules' | 'advanced'>('header');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    logo: true,
    primaryText: true,
    secondaryText: false,
    height: false,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/site-config');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      toast.error('Erreur lors du chargement de la configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      
      toast.success('Configuration enregistrée avec succès!');
      // Recharger pour voir les changements
      window.location.reload();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur: Configuration non disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-600" />
            Configuration Avancée du Site
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Contrôlez tous les aspects de votre site depuis ce tableau de bord unique
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'header'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Layout className="w-5 h-5" />
            Header & Branding
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'modules'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Zap className="w-5 h-5" />
            Modules & Fonctionnalités
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'advanced'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Shield className="w-5 h-5" />
            Paramètres Avancés
          </button>
        </div>

        <div className="p-6">
          {/* Header Tab */}
          {activeTab === 'header' && (
            <div className="space-y-6">
              {/* Logo Configuration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection('logo')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Logo
                    </h3>
                  </div>
                  {expandedSections.logo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.logo && (
                  <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL du Logo
                      </label>
                      <input
                        type="text"
                        value={config.header.logo.url}
                        onChange={(e) => setConfig({
                          ...config,
                          header: {
                            ...config.header,
                            logo: { ...config.header.logo, url: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mobile
                        </label>
                        <input
                          type="text"
                          value={config.header.logo.sizes.mobile}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              logo: {
                                ...config.header.logo,
                                sizes: { ...config.header.logo.sizes, mobile: e.target.value }
                              }
                            }
                          })}
                          placeholder="w-11 h-11"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tablet
                        </label>
                        <input
                          type="text"
                          value={config.header.logo.sizes.tablet}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              logo: {
                                ...config.header.logo,
                                sizes: { ...config.header.logo.sizes, tablet: e.target.value }
                              }
                            }
                          })}
                          placeholder="w-13 h-13"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Desktop
                        </label>
                        <input
                          type="text"
                          value={config.header.logo.sizes.desktop}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              logo: {
                                ...config.header.logo,
                                sizes: { ...config.header.logo.sizes, desktop: e.target.value }
                              }
                            }
                          })}
                          placeholder="w-15 h-15"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 Utilisez les classes Tailwind (ex: w-11 h-11 pour 44px)
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Primary Text Configuration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection('primaryText')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Texte Principal (AGRI POINT)
                    </h3>
                  </div>
                  {expandedSections.primaryText ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.primaryText && (
                  <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contenu
                      </label>
                      <input
                        type="text"
                        value={config.header.primaryText.content}
                        onChange={(e) => setConfig({
                          ...config,
                          header: {
                            ...config.header,
                            primaryText: { ...config.header.primaryText, content: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Taille Mobile
                        </label>
                        <select
                          value={config.header.primaryText.sizes.mobile}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              primaryText: {
                                ...config.header.primaryText,
                                sizes: { ...config.header.primaryText.sizes, mobile: e.target.value }
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="text-xs">text-xs (12px)</option>
                          <option value="text-sm">text-sm (14px)</option>
                          <option value="text-base">text-base (16px)</option>
                          <option value="text-lg">text-lg (18px)</option>
                          <option value="text-xl">text-xl (20px)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Taille Tablet
                        </label>
                        <select
                          value={config.header.primaryText.sizes.tablet}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              primaryText: {
                                ...config.header.primaryText,
                                sizes: { ...config.header.primaryText.sizes, tablet: e.target.value }
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="text-sm">text-sm (14px)</option>
                          <option value="text-base">text-base (16px)</option>
                          <option value="text-lg">text-lg (18px)</option>
                          <option value="text-xl">text-xl (20px)</option>
                          <option value="text-2xl">text-2xl (24px)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Taille Desktop
                        </label>
                        <select
                          value={config.header.primaryText.sizes.desktop}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              primaryText: {
                                ...config.header.primaryText,
                                sizes: { ...config.header.primaryText.sizes, desktop: e.target.value }
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="text-base">text-base (16px)</option>
                          <option value="text-lg">text-lg (18px)</option>
                          <option value="text-xl">text-xl (20px)</option>
                          <option value="text-2xl">text-2xl (24px)</option>
                          <option value="text-3xl">text-3xl (30px)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Secondary Text Configuration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection('secondaryText')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sous-titre (Service Agricole)
                    </h3>
                  </div>
                  {expandedSections.secondaryText ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.secondaryText && (
                  <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contenu
                      </label>
                      <input
                        type="text"
                        value={config.header.secondaryText.content}
                        onChange={(e) => setConfig({
                          ...config,
                          header: {
                            ...config.header,
                            secondaryText: { ...config.header.secondaryText, content: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Taille Mobile
                        </label>
                        <input
                          type="text"
                          value={config.header.secondaryText.sizes.mobile}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              secondaryText: {
                                ...config.header.secondaryText,
                                sizes: { ...config.header.secondaryText.sizes, mobile: e.target.value }
                              }
                            }
                          })}
                          placeholder="text-[10px]"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Taille Tablet
                        </label>
                        <input
                          type="text"
                          value={config.header.secondaryText.sizes.tablet}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              secondaryText: {
                                ...config.header.secondaryText,
                                sizes: { ...config.header.secondaryText.sizes, tablet: e.target.value }
                              }
                            }
                          })}
                          placeholder="text-xs"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Taille Desktop
                        </label>
                        <input
                          type="text"
                          value={config.header.secondaryText.sizes.desktop}
                          onChange={(e) => setConfig({
                            ...config,
                            header: {
                              ...config.header,
                              secondaryText: {
                                ...config.header.secondaryText,
                                sizes: { ...config.header.secondaryText.sizes, desktop: e.target.value }
                              }
                            }
                          })}
                          placeholder="text-xs"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Products Module */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Produits
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.modules.products.enabled}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            products: { ...config.modules.products, enabled: e.target.checked }
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.products.allowReviews}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            products: { ...config.modules.products, allowReviews: e.target.checked }
                          }
                        })}
                        className="rounded text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Avis clients</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.products.showStock}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            products: { ...config.modules.products, showStock: e.target.checked }
                          }
                        })}
                        className="rounded text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Afficher stock</span>
                    </label>
                  </div>
                </motion.div>

                {/* Orders Module */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Commandes
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.modules.orders.enabled}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            orders: { ...config.modules.orders, enabled: e.target.checked }
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.orders.autoConfirmation}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            orders: { ...config.modules.orders, autoConfirmation: e.target.checked }
                          }
                        })}
                        className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Confirmation auto</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.orders.requireEmailVerification}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            orders: { ...config.modules.orders, requireEmailVerification: e.target.checked }
                          }
                        })}
                        className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Vérif. email requise</span>
                    </label>
                  </div>
                </motion.div>

                {/* Payments Module */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Paiements
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.payments.campost}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            payments: { ...config.modules.payments, campost: e.target.checked }
                          }
                        })}
                        className="rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Campost</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.payments.mtnMomo}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            payments: { ...config.modules.payments, mtnMomo: e.target.checked }
                          }
                        })}
                        className="rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">MTN Mobile Money</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.payments.orangeMoney}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            payments: { ...config.modules.payments, orangeMoney: e.target.checked }
                          }
                        })}
                        className="rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Orange Money</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.payments.cash}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            payments: { ...config.modules.payments, cash: e.target.checked }
                          }
                        })}
                        className="rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Paiement à la livraison</span>
                    </label>
                  </div>
                </motion.div>

                {/* Campaigns Module */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Campagnes
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.modules.campaigns.enabled}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            campaigns: { ...config.modules.campaigns, enabled: e.target.checked }
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.modules.campaigns.showCountdown}
                        onChange={(e) => setConfig({
                          ...config,
                          modules: {
                            ...config.modules,
                            campaigns: { ...config.modules.campaigns, showCountdown: e.target.checked }
                          }
                        })}
                        className="rounded text-orange-600 focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Afficher compte à rebours</span>
                    </label>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Mode Maintenance</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Désactiver temporairement le site</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.advanced.maintenanceMode}
                        onChange={(e) => setConfig({
                          ...config,
                          advanced: { ...config.advanced, maintenanceMode: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-600"></div>
                    </label>
                  </label>
                </div>

                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Inscription ouverte</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.advanced.allowRegistration}
                        onChange={(e) => setConfig({
                          ...config,
                          advanced: { ...config.advanced, allowRegistration: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </label>
                </div>

                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">AgriBot activé</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Assistant IA pour conseils agricoles</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.advanced.enableAgriBot}
                        onChange={(e) => setConfig({
                          ...config,
                          advanced: { ...config.advanced, enableAgriBot: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </label>
                </div>

                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileEdit className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Newsletter activée</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Inscription à la newsletter sur le site</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.advanced.enableNewsletter}
                        onChange={(e) => setConfig({
                          ...config,
                          advanced: { ...config.advanced, enableNewsletter: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </label>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Save Bar (Sticky) */}
      <div className="sticky bottom-6 flex justify-center">
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Save className="w-5 h-5" />
          <span className="font-semibold">
            {saving ? 'Enregistrement en cours...' : 'Enregistrer toutes les modifications'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
