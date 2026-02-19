'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { MapPin, Plus, Search, Edit, Trash2, Check, X } from 'lucide-react';

// Import dynamique du composant Map (côté client uniquement)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
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
  isPublic: boolean;
  isActive: boolean;
  verified: boolean;
}

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    type: 'farm' as Location['type'],
    coordinates: { latitude: 46.603354, longitude: 1.888334 },
    address: { city: '', zipCode: '', street: '', region: '', country: 'France' },
    description: '',
    phone: '',
    email: '',
    website: '',
    isPublic: true,
    isActive: true,
    verified: false,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    let filtered = locations;

    if (search) {
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(search.toLowerCase()) ||
          loc.address.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((loc) => loc.type === typeFilter);
    }

    setFilteredLocations(filtered);
  }, [search, typeFilter, locations]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/admin/locations');
      const data = await res.json();
      setLocations(data.locations);
      setFilteredLocations(data.locations);
      setStats(data.stats);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingLocation
        ? `/api/admin/locations?id=${editingLocation._id}`
        : '/api/admin/locations';

      const res = await fetch(url, {
        method: editingLocation ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchLocations();
        setShowForm(false);
        setEditingLocation(null);
        resetForm();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette location ?')) return;

    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      coordinates: location.coordinates,
      address: location.address,
      description: location.description || '',
      phone: '',
      email: '',
      website: '',
      isPublic: location.isPublic,
      isActive: location.isActive,
      verified: location.verified,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'farm',
      coordinates: { latitude: 46.603354, longitude: 1.888334 },
      address: { city: '', zipCode: '', street: '', region: '', country: 'France' },
      description: '',
      phone: '',
      email: '',
      website: '',
      isPublic: true,
      isActive: true,
      verified: false,
    });
  };

  const mapMarkers = filteredLocations.map((loc) => ({
    id: loc._id,
    lat: loc.coordinates.latitude,
    lng: loc.coordinates.longitude,
    title: loc.name,
    description: loc.address.city,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Locations</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingLocation(null);
            resetForm();
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Location
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 p-4 rounded-lg"
          >
            <MapPin className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            <p className="text-sm text-blue-700">Total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 p-4 rounded-lg"
          >
            <Check className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-900">{stats.verified}</p>
            <p className="text-sm text-green-700">Vérifiées</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-50 p-4 rounded-lg"
          >
            <MapPin className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-900">{stats.public}</p>
            <p className="text-sm text-purple-700">Publiques</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-orange-50 p-4 rounded-lg"
          >
            <MapPin className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-900">{stats.byType.farm}</p>
            <p className="text-sm text-orange-700">Fermes</p>
          </motion.div>
        </div>
      )}

      {/* Carte */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4">Carte des Locations</h2>
        <MapComponent markers={mapMarkers} height="400px" />
      </div>

      {/* Formulaire */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">
            {editingLocation ? 'Modifier la Location' : 'Nouvelle Location'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Location['type'] })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="farm">Ferme</option>
                <option value="market">Marché</option>
                <option value="distribution">Point de distribution</option>
                <option value="event">Événement</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Latitude *</label>
              <input
                type="number"
                step="any"
                value={formData.coordinates.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coordinates: { ...formData.coordinates, latitude: parseFloat(e.target.value) },
                  })
                }
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Longitude *</label>
              <input
                type="number"
                step="any"
                value={formData.coordinates.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coordinates: { ...formData.coordinates, longitude: parseFloat(e.target.value) },
                  })
                }
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ville *</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Code Postal</label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, zipCode: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Public</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Actif</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Vérifié</span>
              </label>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                {editingLocation ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLocation(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Tous les types</option>
          <option value="farm">Fermes</option>
          <option value="market">Marchés</option>
          <option value="distribution">Distribution</option>
          <option value="event">Événements</option>
          <option value="other">Autres</option>
        </select>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coordonnées</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLocations.map((location) => (
                <tr key={location._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{location.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {location.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{location.address.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {location.isPublic && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Public</span>
                      )}
                      {location.verified && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(location._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
