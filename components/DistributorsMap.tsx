/**
 * Distributors Map Component
 * Affiche les partenaires/distributeurs sur une carte Google Maps
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { MapPin, Phone, Mail, Globe, Building2, Store, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Distributor {
  id: string;
  name: string;
  category: 'wholesaler' | 'retailer' | 'partner';
  address: string;
  city: string;
  region: string;
  phone?: string;
  email?: string;
  website?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  productsCount?: number;
  businessHours?: string;
  image?: string;
}

interface GoogleMap {
  maps: any;
  mapInstance: any;
  markers: any[];
}

interface DistributorsMapProps {
  distributors: Distributor[];
  selectedDistributor?: Distributor | null;
  onSelectDistributor?: (distributor: Distributor) => void;
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showList?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function DistributorsMap({
  distributors,
  selectedDistributor,
  onSelectDistributor,
  initialCenter = { lat: 3.848, lng: 11.5021 }, // Yaoundé, Cameroun
  zoom = 13,
  height = '500px',
  showList = true,
}: DistributorsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMap | null>(null);
  const [filteredDistributors, setFilteredDistributors] = useState(distributors);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'wholesaler' | 'retailer' | 'partner'>('all');
  const [mapReady, setMapReady] = useState(false);

  // Charger Google Maps API
  useEffect(() => {
    if (window.google) {
      initializeMap();
    } else {
      loadGoogleMapsAPI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGoogleMapsAPI = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const googleMaps = window.google.maps;
    const mapInstance = new googleMaps.Map(mapRef.current, {
      center: initialCenter,
      zoom,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ saturation: -70 }],
        },
      ],
    });

    const markers: any[] = [];

    // Créer les marqueurs
    distributors.forEach((distributor) => {
      const markerIcon = getMarkerIcon(distributor.category);

      const marker = new googleMaps.Marker({
        position: distributor.coordinates,
        map: mapInstance,
        title: distributor.name,
        icon: markerIcon,
      });

      marker.addListener('click', () => {
        onSelectDistributor?.(distributor);
        mapInstance.panTo(distributor.coordinates);
        mapInstance.setZoom(15);
      });

      markers.push(marker);
    });

    setMap({ maps: googleMaps, mapInstance, markers });
    setMapReady(true);
  };

  const getMarkerIcon = (category: string) => {
    const colors: { [key: string]: string } = {
      wholesaler: '#EF4444', // Rouge
      retailer: '#3B82F6', // Bleu
      partner: '#10B981', // Vert
    };

    return {
      path: 'M 0 -28 C -15.464 -28 -28 -15.464 -28 0 C -28 15.464 0 40 0 40 C 0 40 28 15.464 28 0 C 28 -15.464 15.464 -28 0 -28 Z',
      fillColor: colors[category] || '#3B82F6',
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 2,
      scale: 1,
    };
  };

  // Filtrer par catégorie
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredDistributors(distributors);
    } else {
      setFilteredDistributors(
        distributors.filter((d) => d.category === selectedCategory)
      );
    }
  }, [selectedCategory, distributors]);

  // Mettre à jour les marqueurs visibles
  useEffect(() => {
    if (!map) return;

    map.markers.forEach((marker, index) => {
      const isVisible = filteredDistributors.some(
        (d) => d.id === distributors[index].id
      );
      marker.setVisible(isVisible);
    });
  }, [filteredDistributors, map, distributors]);

  const categoryLabels: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
    wholesaler: { label: 'Grossistes', Icon: Building2 },
    retailer: { label: 'Détaillants', Icon: Store },
    partner: { label: 'Partenaires', Icon: Handshake },
  };

  return (
    <div className="w-full">
      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
          }`}
        >
          Tous
        </button>
        {Object.entries(categoryLabels).map(([key, { label, Icon }]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as any)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedCategory === key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Conteneur principal */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Carte */}
        <div className="flex-1 min-w-0">
          <div
            ref={mapRef}
            className="rounded-lg shadow-md overflow-hidden h-[500px] lg:h-full"
          />
        </div>

        {/* Liste des distributeurs */}
        {showList && (
          <div className="lg:w-80 flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-y-auto max-h-[500px] flex-1">
              {filteredDistributors.length === 0 ? (
                <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Aucun distributeur trouvé
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDistributors.map((distributor) => (
                    <motion.button
                      key={distributor.id}
                      whileHover={{ backgroundColor: 'rgba(34, 134, 58, 0.05)' }}
                      onClick={() => onSelectDistributor?.(distributor)}
                      className={`w-full text-left p-4 transition ${
                        selectedDistributor?.id === distributor.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {distributor.name}
                      </h3>

                      <div className="flex items-start gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>
                          {distributor.address}, {distributor.city}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {distributor.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>{distributor.phone}</span>
                          </div>
                        )}
                        {distributor.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span className="text-blue-600 dark:text-blue-400">
                              {distributor.email}
                            </span>
                          </div>
                        )}
                        {distributor.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            <a
                              href={distributor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400"
                            >
                              Visiter
                            </a>
                          </div>
                        )}
                      </div>

                      {distributor.businessHours && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          ⏰ {distributor.businessHours}
                        </p>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="mt-4 flex gap-4 flex-wrap text-sm">
        {Object.entries(categoryLabels).map(([key, { label }]) => {
          const colorClass = key === 'wholesaler' ? 'bg-green-500' : key === 'retailer' ? 'bg-blue-500' : 'bg-purple-500';
          return (
            <div key={key} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex-shrink-0 ${colorClass}`}
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
