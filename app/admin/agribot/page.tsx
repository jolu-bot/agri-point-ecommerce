'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_SYSTEM_PROMPT = `Tu es AgriBot, l'assistant IA expert en agriculture d'AGRI POINT SERVICE au Cameroun.

CONTEXTE :
- AGRI POINT SERVICE est le distributeur exclusif au Cameroun des produits TIMAC AGRO (Groupe Roullier)
- Nous couvrons 20 000 hectares et touchons 10 000 personnes
- Notre mission : Produire plus • Gagner plus • Mieux vivre

EXPERTISE :
- Conseils agricoles personnalisés pour le Cameroun
- Recommandations de produits (engrais, biostimulants, amendements)
- Techniques d'agriculture urbaine
- Cultures principales : cacao, café, tomates, maïs, cultures maraîchères

TON RÔLE :
1. Écouter les besoins spécifiques de l'agriculteur
2. Poser des questions pertinentes sur ses cultures et défis
3. Recommander les produits adaptés de notre gamme
4. Donner des conseils pratiques et techniques
5. Être chaleureux, professionnel et pédagogue

GAMME DE PRODUITS :
- HUMIFORTE : Biostimulant racinaire
- FOSNUTREN 20 : Engrais starter NPK 20-20-0
- KADOSTIM 20 : Biostimulant végétal
- AMINOL 20 : Nutrition foliaire aux acides aminés
- NATUR CARE : Amendement organique
- SARAH NPK : Engrais complet
- URÉE 46% : Azote
- Kits agriculture urbaine

INSTRUCTIONS :
- Réponds TOUJOURS en français
- Sois concis mais complet (2-4 phrases)
- Utilise des émojis agricoles occasionnellement 🌱🌾🍅
- Propose toujours des solutions concrètes
- Invite à contacter l'équipe pour plus d'infos`;

interface AgribotStats {
  totalConversations: number;
  convsThisMonth: number;
  convsLast7days: number;
  resolutionRate: number;
}

export default function AgriBotSettingsPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
  });

  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [agribotStats, setAgribotStats] = useState<AgribotStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Charger les paramètres depuis l'API
  const loadSettings = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.agribot) {
          setSettings(prev => ({
            ...prev,
            enabled: data.agribot.enabled ?? prev.enabled,
            model: data.agribot.model ?? prev.model,
            temperature: data.agribot.temperature ?? prev.temperature,
            maxTokens: data.agribot.maxTokens ?? prev.maxTokens,
            systemPrompt: data.agribot.systemPrompt ?? prev.systemPrompt,
          }));
        }
      }
    } catch {
      // silencieux au chargement
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // Charger les statistiques agribot depuis l'API
  const loadStats = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/admin/agribot/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAgribotStats(data);
      }
    } catch {
      // silencieux
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, [loadSettings, loadStats]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agribot: {
            enabled: settings.enabled,
            model: settings.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            systemPrompt: settings.systemPrompt,
          },
        }),
      });
      if (res.ok) {
        toast.success('Paramètres sauvegardés avec succès');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser tous les paramètres ?')) {
      setSettings(prev => ({
        ...prev,
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
      }));
      toast.success('Paramètres réinitialisés');
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configuration AgriBot
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Paramétrer l&apos;assistant IA agricole
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-lg font-semibold text-gray-900 dark:text-white">
              Activer AgriBot
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Activer ou désactiver le chatbot sur le site
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="sr-only peer"
              aria-label="Activer AgriBot"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2" htmlFor="model-select">
            Modèle OpenAI
          </label>
          <select
            id="model-select"
            value={settings.model}
            onChange={(e) => setSettings({ ...settings, model: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Sélectionner le modèle OpenAI"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Rapide & Économique)</option>
            <option value="gpt-4">GPT-4 (Qualité optimale)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo (Équilibré)</option>
          </select>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2" htmlFor="temperature-range">
            Température : {settings.temperature}
          </label>
          <input
            id="temperature-range"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            aria-label="Ajuster la température du modèle"
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>Précis (0)</span>
            <span>Créatif (1)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2" htmlFor="max-tokens">
            Longueur max des réponses
          </label>
          <input
            id="max-tokens"
            type="number"
            min="100"
            max="2000"
            step="100"
            value={settings.maxTokens}
            onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Définir la longueur maximale des réponses"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Recommandé : 500 tokens (≈ 375 mots)
          </p>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2" htmlFor="system-prompt">
            Prompt système
          </label>
          <textarea
            id="system-prompt"
            value={settings.systemPrompt}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            aria-label="Modifier le prompt système d'AgriBot"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Instructions données à l&apos;IA pour définir son comportement
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Réinitialiser</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Enregistrement...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-primary-600">
            {statsLoading ? (
              <span className="inline-block w-16 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              (agribotStats?.totalConversations ?? 0).toLocaleString('fr-FR')
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Conversations totales
          </div>
          {!statsLoading && agribotStats && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {agribotStats.convsLast7days} cette semaine
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-primary-600">
            {statsLoading ? (
              <span className="inline-block w-16 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              (agribotStats?.convsThisMonth ?? 0).toLocaleString('fr-FR')
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ce mois-ci
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-primary-600">
            {statsLoading ? (
              <span className="inline-block w-16 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              `${agribotStats?.resolutionRate ?? 0}%`
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Taux de résolution
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Messages répondus / clôturés
          </div>
        </div>
      </div>
    </div>
  );
}
