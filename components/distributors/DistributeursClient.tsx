'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Phone, MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DistributorsMap = dynamic(() => import('./DistributorsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
    </div>
  ),
});

interface Distributor {
  _id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email?: string;
  coordinates: { lat: number; lng: number };
  businessHours?: string;
}

const REGIONS = ['Centre', 'Littoral', 'Ouest', 'Nord', 'Adamaoua', 'Sud', 'Est'];

export default function DistributeursClient() {
  const { locale } = useLanguage();
  const en = locale === 'en';
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const url = region ? `/api/distributors?region=${encodeURIComponent(region)}` : '/api/distributors';
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => setDistributors(d.distributors ?? []))
      .catch(() => setDistributors([]))
      .finally(() => setLoading(false));
  }, [region]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">
            {en ? 'Our Distributors' : 'Nos distributeurs'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {en ? 'Find AGRIPOINT products near you' : 'Trouvez nos produits près de chez vous'}
          </p>
        </div>

        {/* Region pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setRegion('')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${region === '' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:border-emerald-400'}`}
          >
            {en ? 'All' : 'Toutes'}
          </button>
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${region === r ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:border-emerald-400'}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Layout: list on mobile, side-by-side on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List (first on mobile) */}
          <div className="order-2 lg:order-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : distributors.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                {en ? 'No distributors found' : 'Aucun distributeur trouvé'}
              </p>
            ) : (
              <div className="space-y-3">
                {distributors.map(d => (
                  <div
                    key={d._id}
                    onClick={() => setSelected(d._id)}
                    className={`bg-white dark:bg-gray-900 rounded-xl border p-4 cursor-pointer transition-all ${selected === d._id ? 'border-emerald-500 shadow-sm' : 'border-gray-100 dark:border-white/[0.06] hover:border-emerald-300'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{d.name}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                          {d.category}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${d.coordinates.lat},${d.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {en ? 'Directions' : 'Itinéraire'}
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                      {d.address}, {d.city} — {d.region}
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${d.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {d.phone}
                      </a>
                      <a
                        href={`https://wa.me/237${d.phone.replace(/\D/g, '').replace(/^237/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </div>
                    {d.businessHours && (
                      <p className="text-[10px] text-gray-400 mt-1.5">{d.businessHours}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="order-1 lg:order-2 h-72 lg:h-auto lg:min-h-[500px] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06]">
            <DistributorsMap
              distributors={distributors}
              selectedId={selected}
              onSelect={setSelected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
