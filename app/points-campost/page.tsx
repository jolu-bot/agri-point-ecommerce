'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Search, Clock, Phone, ChevronDown, ArrowLeft, Building2, AlertCircle } from 'lucide-react';
import { CAMPOST_POINTS, CAMPOST_REGIONS, CAMPOST_ACCOUNT, getPointsByRegion, type CampostPoint } from '@/lib/campost-points';

const REGION_FLAGS: Record<string, string> = {
  'Adamaoua': '🏔️',
  'Centre': '🏛️',
  'Est': '🌿',
  'Extrême-Nord': '🏜️',
  'Littoral': '🌊',
  'Nord': '☀️',
  'Nord-Ouest': '⛰️',
  'Ouest': '🌄',
  'Sud': '🌳',
  'Sud-Ouest': '🌺',
};

export default function PointsCampostPage() {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(['Centre']));

  const isAccountReady = CAMPOST_ACCOUNT.accountNumber !== 'À COMPLÉTER';

  const filteredPoints = useMemo(() => {
    const query = search.toLowerCase().trim();
    return CAMPOST_POINTS.filter(p => {
      const matchRegion = !selectedRegion || p.region === selectedRegion;
      const matchSearch = !query ||
        p.ville.toLowerCase().includes(query) ||
        p.nom.toLowerCase().includes(query) ||
        p.adresse.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query);
      return matchRegion && matchSearch;
    });
  }, [search, selectedRegion]);

  const pointsByRegion = useMemo(() => {
    const grouped: Record<string, CampostPoint[]> = {};
    const regions = selectedRegion ? [selectedRegion] : CAMPOST_REGIONS;
    regions.forEach(r => {
      const pts = filteredPoints.filter(p => p.region === r);
      if (pts.length > 0) grouped[r] = pts;
    });
    return grouped;
  }, [filteredPoints, selectedRegion]);

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const totalPoints = CAMPOST_POINTS.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Building2 className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Points de dépôt Campost</h1>
              <p className="text-emerald-300 mt-1">{totalPoints} bureaux dans les 10 régions du Cameroun</p>
            </div>
          </div>

          {/* Compte cible */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6 border border-white/20">
            <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">Compte de versement AGRI POINT SERVICES SAS</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-emerald-300">Titulaire</p>
                <p className="text-white font-bold">{CAMPOST_ACCOUNT.accountName}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-300">N° de compte Campost</p>
                {isAccountReady ? (
                  <p className="text-white font-mono font-bold text-lg">{CAMPOST_ACCOUNT.accountNumber}</p>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-semibold text-sm">En cours de communication</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-emerald-200">
                <strong className="text-white">Important :</strong> Mentionnez toujours votre numéro de commande comme référence lors du versement.
              </p>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par ville, région..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white/15 transition-all text-sm backdrop-blur"
            />
          </div>
        </div>
      </div>

      {/* Filtres par région */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 items-center min-w-max">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">Filtrer :</span>
            <button
              onClick={() => setSelectedRegion('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
                !selectedRegion
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Toutes les régions
            </button>
            {CAMPOST_REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRegion(selectedRegion === r ? '' : r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 flex items-center gap-1 ${
                  selectedRegion === r
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span>{REGION_FLAGS[r] || '📍'}</span>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {Object.entries(pointsByRegion).length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun bureau trouvé pour &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(pointsByRegion).map(([region, points]) => {
              const isExpanded = expandedRegions.has(region) || !!search || !!selectedRegion;
              return (
                <div key={region} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  
                  {/* Header région */}
                  <button
                    onClick={() => toggleRegion(region)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{REGION_FLAGS[region] || '📍'}</span>
                      <div className="text-left">
                        <h2 className="font-bold text-gray-900 dark:text-white">Région {region}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{points.length} bureau{points.length > 1 ? 'x' : ''}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Points */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                      {points.map((point) => (
                        <div key={point.id} className="px-5 py-4 flex gap-4 items-start">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            point.type === 'bureau_principal'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Building2 className={`w-4 h-4 ${
                              point.type === 'bureau_principal'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{point.nom}</h3>
                              {point.type === 'bureau_principal' && (
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                  Bureau principal
                                </span>
                              )}
                            </div>
                            <div className="flex items-start gap-1.5 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{point.adresse}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{point.horaires}</span>
                              </div>
                              {point.telephone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                                  <a href={`tel:${point.telephone}`} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                                    {point.telephone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Résumé bas de page */}
        <div className="mt-10 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Votre bureau ne figure pas dans la liste ?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Contactez notre équipe — nous mettons à jour la liste régulièrement avec le réseau Campost national.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/237676026601"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              WhatsApp : +237 676 026 601
            </a>
            <a
              href="https://www.campost.cm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 rounded-xl font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              Site officiel Campost
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
