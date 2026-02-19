'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, Filter } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-screen bg-gray-100 animate-pulse" />,
});

interface Location {
  _id: string;
  name: string;
  type: 'farm' | 'market' | 'distribution' | 'event' | 'other';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    street?: string;
    city: string;
    zipCode?: string;
    region?: string;
    country: string;
  };
  description?: string;
  distance?: number;
}

const typeLabels: Record<string, string> = {
  farm: 'Ferme',
  market: 'Marché',
  distribution: 'Point de distribution',
  event: 'Événement',
  other: 'Autre',
};

const typeColors: Record<string, string> = {
  farm: 'text-green-600 bg-green-50',
  market: 'text-orange-600 bg-orange-50',
  distribution: 'text-blue-600 bg-blue-50',
  event: 'text-purple-600 bg-purple-50',
  other: 'text-gray-600 bg-gray-50',
};

export default function CartePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    let filtered = locations;

    if (search) {
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(search.toLowerCase()) ||
          loc.address.city.toLowerCase().includes(search.toLowerCase()) ||
          loc.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((loc) => loc.type === typeFilter);
    }

    setFilteredLocations(filtered);
  }, [search, typeFilter, locations]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/public/locations');
      const data = await res.json();
      setLocations(data.locations);
      setFilteredLocations(data.locations);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapMarkers = filteredLocations.map((loc) => ({
    id: loc._id,
    lat: loc.coordinates.latitude,
    lng: loc.coordinates.longitude,
    title: loc.name,
    description: `${loc.address.city} - ${typeLabels[loc.type]}`,
    type: loc.type,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="relative h-screen flex">
      {/* Carte */}
      <div className="flex-1">
        <MapComponent
          markers={mapMarkers}
          height="100vh"
          onMarkerClick={(marker) => {
            const loc = locations.find((l) => l._id === marker.id);
            if (loc) setSelectedLocation(loc);
          }}
        />
      </div>

      {/* Panneau latéral */}
      <div className="w-full md:w-96 bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-600" />
              Carte des Locations
            </h1>

            {/* Recherche */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>

              {typeFilter && (
                <button
                  onClick={() => setTypeFilter('')}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                >
                  {typeLabels[typeFilter]} ✕
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Type de location</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTypeFilter(key)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        typeFilter === key
                          ? 'bg-green-600 text-white'
                          : 'bg-white border hover:border-green-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="px-4 pb-3 flex gap-2 text-sm text-gray-600">
            <span className="font-medium">{filteredLocations.length}</span>
            {filteredLocations.length === 1 ? 'location' : 'locations'}
          </div>
        </div>

        {/* Liste des locations */}
        <div className="p-4 space-y-3">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune location trouvée</p>
            </div>
          ) : (
            filteredLocations.map((location) => (
              <div
                key={location._id}
                className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedLocation?._id === location._id ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      typeColors[location.type]
                    }`}
                  >
                    {typeLabels[location.type]}
                  </span>
                </div>

                {location.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {location.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {location.address.city}
                    {location.address.zipCode && ` (${location.address.zipCode})`}
                  </span>
                </div>

                {location.distance && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    À {location.distance.toFixed(1)} km
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Détails de la location sélectionnée (modal mobile) */}
      {selectedLocation && (
        <div className="md:hidden fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-6 z-50">
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedLocation.name}</h2>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
              typeColors[selectedLocation.type]
            }`}
          >
            {typeLabels[selectedLocation.type]}
          </span>

          {selectedLocation.description && (
            <p className="text-gray-600 mb-4">{selectedLocation.description}</p>
          )}

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                {selectedLocation.address.street && (
                  <div>{selectedLocation.address.street}</div>
                )}
                <div>
                  {selectedLocation.address.zipCode} {selectedLocation.address.city}
                </div>
                {selectedLocation.address.region && (
                  <div>{selectedLocation.address.region}</div>
                )}
              </div>
            </div>

            <div className="pt-2 text-xs text-gray-400">
              {selectedLocation.coordinates.latitude.toFixed(6)},{' '}
              {selectedLocation.coordinates.longitude.toFixed(6)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
