'use client';

import { useState, useEffect } from 'react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { usePreviewMode } from '@/contexts/PreviewModeContext';
import { 
  Save, 
  RefreshCw, 
  Palette, 
  Type, 
  Layout, 
  Mail, 
  Share2, 
  Search,
  Settings,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SiteConfigPage() {
  const { config, loading, updateConfig, refreshConfig } = useSiteConfig();
  const { enablePreview, disablePreview, isPreviewMode } = usePreviewMode();
  const [activeTab, setActiveTab] = useState('branding');
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateConfig(formData);
      toast.success('Configuration enregistrée avec succès !');
      // Désactiver le mode preview après sauvegarde
      if (isPreviewMode) {
        disablePreview();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    enablePreview(formData);
    toast.success('Mode prévisualisation activé ! Consultez le site pour voir les changements.');
    // Ouvrir la page d'accueil dans un nouvel onglet pour voir le preview
    window.open('/', '_blank');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `site-config-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setFormData(imported);
          toast.success('Configuration importée avec succès !');
        } catch (error) {
          toast.error('Fichier invalide');
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (path: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
          <p>Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'branding', label: 'Identité', icon: Layout },
    { id: 'colors', label: 'Couleurs', icon: Palette },
    { id: 'typography', label: 'Typographie', icon: Type },
    { id: 'content', label: 'Contenu', icon: FileText },
    { id: 'navigation', label: 'Navigation', icon: Layout },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'social', label: 'Réseaux Sociaux', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'advanced', label: 'Avancé', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuration du Site</h1>
              <p className="text-sm text-gray-600 mt-1">
                Personnalisez l'apparence et le contenu de votre site
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="btn-secondary cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Importer
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
              
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              
              <button
                onClick={refreshConfig}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>

              <button
                onClick={handlePreview}
                className="btn-secondary flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
              >
                <Eye className="w-4 h-4" />
                Prévisualiser
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Identité de Marque</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du site
                  </label>
                  <input
                    id="siteName"
                    type="text"
                    value={formData.branding?.siteName || ''}
                    onChange={(e) => updateField('branding.siteName', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
                    Slogan
                  </label>
                  <input
                    id="tagline"
                    type="text"
                    value={formData.branding?.tagline || ''}
                    onChange={(e) => updateField('branding.tagline', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL du logo
                  </label>
                  <input
                    id="logoUrl"
                    type="text"
                    value={formData.branding?.logoUrl || ''}
                    onChange={(e) => updateField('branding.logoUrl', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="/logo.png"
                  />
                </div>

                <div>
                  <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL du favicon
                  </label>
                  <input
                    id="faviconUrl"
                    type="text"
                    value={formData.branding?.faviconUrl || ''}
                    onChange={(e) => updateField('branding.faviconUrl', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COLORS */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Palette de Couleurs</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  { key: 'primary', label: 'Couleur Primaire' },
                  { key: 'primaryLight', label: 'Primaire Claire' },
                  { key: 'secondary', label: 'Couleur Secondaire' },
                  { key: 'secondaryLight', label: 'Secondaire Claire' },
                  { key: 'accent', label: 'Couleur d\'Accent' },
                  { key: 'background', label: 'Arrière-plan' },
                  { key: 'text', label: 'Texte' },
                ].map((color) => (
                  <div key={color.key}>
                    <label htmlFor={`color-${color.key}`} className="block text-sm font-medium text-gray-700 mb-2">
                      {color.label}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id={`color-${color.key}`}
                        type="color"
                        value={formData.colors?.[color.key] || '#000000'}
                        onChange={(e) => updateField(`colors.${color.key}`, e.target.value)}
                        className="w-12 h-12 rounded border cursor-pointer"
                        aria-label={`Sélecteur de couleur ${color.label}`}
                      />
                      <input
                        type="text"
                        value={formData.colors?.[color.key] || ''}
                        onChange={(e) => updateField(`colors.${color.key}`, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        placeholder="#000000"
                        aria-label={`Code hexadécimal ${color.label}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4">Aperçu</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(formData.colors || {}).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-full h-20 rounded-lg mb-2 border"
                        {...{ style: { backgroundColor: value as string } }}
                        role="presentation"
                        aria-label={`Aperçu couleur ${key}`}
                      />
                      <p className="text-xs text-gray-600">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TYPOGRAPHY */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Typographie</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fontHeading" className="block text-sm font-medium text-gray-700 mb-2">
                    Police pour les titres
                  </label>
                  <input
                    id="fontHeading"
                    type="text"
                    value={formData.typography?.fontFamily?.heading || ''}
                    onChange={(e) => updateField('typography.fontFamily.heading', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Montserrat"
                  />
                </div>

                <div>
                  <label htmlFor="fontBody" className="block text-sm font-medium text-gray-700 mb-2">
                    Police pour le corps
                  </label>
                  <input
                    id="fontBody"
                    type="text"
                    value={formData.typography?.fontFamily?.body || ''}
                    onChange={(e) => updateField('typography.fontFamily.body', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Inter"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Tailles de Police</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'].map((size) => (
                    <div key={size}>
                      <label htmlFor={`fontSize-${size}`} className="block text-xs font-medium text-gray-700 mb-2">
                        {size}
                      </label>
                      <input
                        id={`fontSize-${size}`}
                        type="text"
                        value={formData.typography?.fontSize?.[size] || ''}
                        onChange={(e) => updateField(`typography.fontSize.${size}`, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="1rem"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Poids de Police</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'].map((weight) => (
                    <div key={weight}>
                      <label htmlFor={`fontWeight-${weight}`} className="block text-xs font-medium text-gray-700 mb-2">
                        {weight}
                      </label>
                      <input
                        id={`fontWeight-${weight}`}
                        type="number"
                        value={formData.typography?.fontWeight?.[weight] || ''}
                        onChange={(e) => updateField(`typography.fontWeight.${weight}`, parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="400"
                        step="100"
                        min="100"
                        max="900"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Contenu des Pages</h2>
              
              {/* Hero Section */}
              <div className="border rounded-lg p-6">
                <button
                  onClick={() => toggleSection('hero')}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="font-semibold text-lg">Section Hero</h3>
                  {expandedSections['hero'] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {expandedSections['hero'] && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="heroBadge" className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                      <input
                        id="heroBadge"
                        type="text"
                        value={formData.homePage?.hero?.badge || ''}
                        onChange={(e) => updateField('homePage.hero.badge', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                      <input
                        id="heroTitle"
                        type="text"
                        value={formData.homePage?.hero?.title || ''}
                        onChange={(e) => updateField('homePage.hero.title', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
                      <input
                        id="heroSubtitle"
                        type="text"
                        value={formData.homePage?.hero?.subtitle || ''}
                        onChange={(e) => updateField('homePage.hero.subtitle', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="heroDescription" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        id="heroDescription"
                        value={formData.homePage?.hero?.description || ''}
                        onChange={(e) => updateField('homePage.hero.description', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ctaPrimaryText" className="block text-sm font-medium text-gray-700 mb-2">CTA Primaire - Texte</label>
                        <input
                          id="ctaPrimaryText"
                          type="text"
                          value={formData.homePage?.hero?.cta?.primary?.text || ''}
                          onChange={(e) => updateField('homePage.hero.cta.primary.text', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="ctaPrimaryLink" className="block text-sm font-medium text-gray-700 mb-2">CTA Primaire - Lien</label>
                        <input
                          id="ctaPrimaryLink"
                          type="text"
                          value={formData.homePage?.hero?.cta?.primary?.link || ''}
                          onChange={(e) => updateField('homePage.hero.cta.primary.link', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ctaSecondaryText" className="block text-sm font-medium text-gray-700 mb-2">CTA Secondaire - Texte</label>
                        <input
                          id="ctaSecondaryText"
                          type="text"
                          value={formData.homePage?.hero?.cta?.secondary?.text || ''}
                          onChange={(e) => updateField('homePage.hero.cta.secondary.text', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="ctaSecondaryLink" className="block text-sm font-medium text-gray-700 mb-2">CTA Secondaire - Lien</label>
                        <input
                          id="ctaSecondaryLink"
                          type="text"
                          value={formData.homePage?.hero?.cta?.secondary?.link || ''}
                          onChange={(e) => updateField('homePage.hero.cta.secondary.link', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Section */}
              <div className="border rounded-lg p-6">
                <button
                  onClick={() => toggleSection('stats')}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="font-semibold text-lg">Statistiques</h3>
                  {expandedSections['stats'] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {expandedSections['stats'] && (
                  <div className="space-y-4">
                    {formData.homePage?.stats?.map((stat: any, index: number) => (
                      <div key={index} className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label htmlFor={`statValue-${index}`} className="block text-sm font-medium text-gray-700 mb-2">Valeur</label>
                          <input
                            id={`statValue-${index}`}
                            type="text"
                            value={stat.value || ''}
                            onChange={(e) => {
                              const newStats = [...(formData.homePage?.stats || [])];
                              newStats[index] = { ...newStats[index], value: e.target.value };
                              updateField('homePage.stats', newStats);
                            }}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label htmlFor={`statLabel-${index}`} className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                          <input
                            id={`statLabel-${index}`}
                            type="text"
                            value={stat.label || ''}
                            onChange={(e) => {
                              const newStats = [...(formData.homePage?.stats || [])];
                              newStats[index] = { ...newStats[index], label: e.target.value };
                              updateField('homePage.stats', newStats);
                            }}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Informations de Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={formData.contact?.email || ''}
                    onChange={(e) => updateField('contact.email', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={formData.contact?.phone || ''}
                    onChange={(e) => updateField('contact.phone', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="contactWhatsapp" className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input
                    id="contactWhatsapp"
                    type="tel"
                    value={formData.contact?.whatsapp || ''}
                    onChange={(e) => updateField('contact.whatsapp', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <textarea
                    id="contactAddress"
                    value={formData.contact?.address || ''}
                    onChange={(e) => updateField('contact.address', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Réseaux Sociaux</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((platform) => (
                  <div key={platform}>
                    <label htmlFor={`social-${platform}`} className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {platform}
                    </label>
                    <input
                      id={`social-${platform}`}
                      type="url"
                      value={formData.socialMedia?.[platform] || ''}
                      onChange={(e) => updateField(`socialMedia.${platform}`, e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder={`https://${platform}.com/votre-page`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Référencement (SEO)</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="seoMetaTitle" className="block text-sm font-medium text-gray-700 mb-2">Meta Titre</label>
                  <input
                    id="seoMetaTitle"
                    type="text"
                    value={formData.seo?.metaTitle || ''}
                    onChange={(e) => updateField('seo.metaTitle', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.seo?.metaTitle || '').length}/60 caractères
                  </p>
                </div>

                <div>
                  <label htmlFor="seoMetaDescription" className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    id="seoMetaDescription"
                    value={formData.seo?.metaDescription || ''}
                    onChange={(e) => updateField('seo.metaDescription', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.seo?.metaDescription || '').length}/160 caractères
                  </p>
                </div>

                <div>
                  <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-2">Mots-clés (séparés par des virgules)</label>
                  <input
                    id="seoKeywords"
                    type="text"
                    value={formData.seo?.keywords?.join(', ') || ''}
                    onChange={(e) => updateField('seo.keywords', e.target.value.split(',').map((k: string) => k.trim()))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="seoOgImage" className="block text-sm font-medium text-gray-700 mb-2">Image Open Graph</label>
                  <input
                    id="seoOgImage"
                    type="url"
                    value={formData.seo?.ogImage || ''}
                    onChange={(e) => updateField('seo.ogImage', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="/og-image.jpg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ADVANCED */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Paramètres Avancés</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div id="maintenanceMode-label">
                    <h3 className="font-medium">Mode Maintenance</h3>
                    <p className="text-sm text-gray-600">Désactiver temporairement le site</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="maintenanceMode"
                      type="checkbox"
                      checked={formData.advanced?.maintenanceMode || false}
                      onChange={(e) => updateField('advanced.maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                      aria-labelledby="maintenanceMode-label"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div id="allowRegistration-label">
                    <h3 className="font-medium">Autoriser les Inscriptions</h3>
                    <p className="text-sm text-gray-600">Permettre aux utilisateurs de créer un compte</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="allowRegistration"
                      type="checkbox"
                      checked={formData.advanced?.allowRegistration || false}
                      onChange={(e) => updateField('advanced.allowRegistration', e.target.checked)}
                      className="sr-only peer"
                      aria-labelledby="allowRegistration-label"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div id="enableAgriBot-label">
                    <h3 className="font-medium">Activer AgriBot</h3>
                    <p className="text-sm text-gray-600">Chatbot d'assistance agricole</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="enableAgriBot"
                      type="checkbox"
                      checked={formData.advanced?.enableAgriBot || false}
                      onChange={(e) => updateField('advanced.enableAgriBot', e.target.checked)}
                      className="sr-only peer"
                      aria-labelledby="enableAgriBot-label"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div id="enableNewsletter-label">
                    <h3 className="font-medium">Activer Newsletter</h3>
                    <p className="text-sm text-gray-600">Formulaire d'inscription à la newsletter</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="enableNewsletter"
                      type="checkbox"
                      checked={formData.advanced?.enableNewsletter || false}
                      onChange={(e) => updateField('advanced.enableNewsletter', e.target.checked)}
                      className="sr-only peer"
                      aria-labelledby="enableNewsletter-label"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                    <input
                      id="googleAnalyticsId"
                      type="text"
                      value={formData.advanced?.googleAnalyticsId || ''}
                      onChange={(e) => updateField('advanced.googleAnalyticsId', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="facebookPixelId" className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                    <input
                      id="facebookPixelId"
                      type="text"
                      value={formData.advanced?.facebookPixelId || ''}
                      onChange={(e) => updateField('advanced.facebookPixelId', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="XXXXXXXXXXXXXXXX"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
