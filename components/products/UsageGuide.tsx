'use client';

import React from 'react';
import { AlertTriangle, Droplets, Sprout, Info } from 'lucide-react';
import DoseCalculator from './DoseCalculator';

interface ProductFeatures {
  npk?: string;
  composition?: string;
  applications?: string[];
  dosage?: string;
  cultures?: string[];
  benefits?: string[];
  precautions?: string[];
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  promoPrice?: number;
  weight?: number;
  features?: ProductFeatures;
}

const CROP_ICONS: Record<string, string> = {
  'maïs': '🌽', 'mais': '🌽',
  'cacao': '🍫',
  'manioc': '🌿', 'cassava': '🌿',
  'tomate': '🍅', 'tomates': '🍅',
  'banane': '🍌', 'bananier': '🍌', 'plantain': '🍌',
  'café': '☕', 'cafier': '☕',
  'riz': '🌾',
  'arachide': '🥜', 'arachides': '🥜',
  'oignon': '🧅', 'oignons': '🧅',
  'haricot': '🫘', 'haricots': '🫘',
  'poivron': '🫑', 'poivrons': '🫑',
  'palmier': '🌴', 'palmier à huile': '🌴',
  'agrumes': '🍊',
  'papaye': '🍈', 'papain': '🍈', 'papains': '🍈',
  'fleurs': '🌸', 'ornement': '🌸',
  'maraîchère': '🥬', 'maraîcher': '🥬', 'légumes': '🥬', 'légumes-feuilles': '🥬',
  'horticulture': '🌱',
  'coton': '🪴',
  'tubercules': '🟤',
  'légumineuses': '🫛',
  'cultures fruitières': '🍎',
  'légumes-fruits': '🥕',
  'toutes cultures': '🌍',
};

function getCropIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CROP_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🌱';
}

interface UsageGuideProps {
  product: Product;
  en?: boolean;
}

export default function UsageGuide({ product, en = false }: UsageGuideProps) {
  const { features, category } = product;
  const isBio     = category === 'biofertilisant';
  const isMineral = category === 'engrais_mineral';

  return (
    <div className="space-y-8">
      {/* Crops grid */}
      {features?.cultures && features.cultures.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
            <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {en ? 'Suitable Crops' : 'Cultures adaptées'}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {features.cultures.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-center">
                <span className="text-2xl" aria-hidden="true">{getCropIcon(c)}</span>
                <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 leading-tight">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dosage callout */}
      {features?.dosage && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {en ? 'Recommended Dosage' : 'Dosage recommandé'}
          </h3>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-3">
            <span className="text-amber-500 text-xl flex-shrink-0" aria-hidden="true">⚗️</span>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{features.dosage}</p>
          </div>
        </div>
      )}

      {/* Numbered applications */}
      {features?.applications && features.applications.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {en ? 'Application Method' : "Mode d'application"}
          </h3>
          <ol className="space-y-3">
            {features.applications.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{a}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Biofertilisant tips */}
      {isBio && (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 rounded-xl">
          <div className="flex items-start gap-3">
            <Droplets className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-teal-800 dark:text-teal-300 text-sm mb-2">
                {en ? 'Application Tips' : 'Conseils d\'application'}
              </p>
              <ul className="space-y-1.5 text-sm text-teal-700 dark:text-teal-300">
                <li>• {en ? 'Foliar spray: dilute 2–5 mL per litre of water' : 'Pulvérisation foliaire : diluer 2–5 mL par litre d\'eau'}</li>
                <li>• {en ? 'Root drench: apply at plant base, prefer early morning' : 'Trempage racinaire : appliquer en pied de plant, de préférence le matin'}</li>
                <li>• {en ? 'Avoid application in direct sunlight or before heavy rain' : 'Éviter d\'appliquer en plein soleil ou avant une forte pluie'}</li>
                <li>• {en ? 'Repeat every 15–21 days for best results' : 'Renouveler tous les 15–21 jours pour de meilleurs résultats'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mineral fertilizer tips */}
      {isMineral && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">
                {en ? 'Application Methods' : 'Méthodes d\'épandage'}
              </p>
              <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
                <li>• {en ? 'Broadcasting: spread evenly and incorporate into the soil' : 'Épandage en surface : répandre uniformément et incorporer dans le sol'}</li>
                <li>• {en ? 'Band placement: apply in furrows near rows at sowing' : 'Placement en bande : appliquer dans les sillons au semis'}</li>
                <li>• {en ? 'Topdressing: apply around plants during vegetative growth' : 'Fertilisation de couverture : appliquer autour des plants en végétation'}</li>
                <li>• {en ? 'Apply before rain or irrigate after for better uptake' : 'Épandre avant la pluie ou irriguer après pour favoriser l\'absorption'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Precautions */}
      {features?.precautions && features.precautions.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            {en ? 'Precautions' : "Précautions d'emploi"}
          </h3>
          <ul className="space-y-2">
            {features.precautions.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Inline dose calculator */}
      {(features?.dosage || (features?.cultures && features.cultures.length > 0)) && (
        <DoseCalculator product={product} en={en} />
      )}
    </div>
  );
}
