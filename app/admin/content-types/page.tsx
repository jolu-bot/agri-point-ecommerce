'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Edit, Trash2, Eye, Settings,
  Database, Calendar, Users, CheckCircle, XCircle, Grid,
  List, Package, MessageSquare, Image, MapPin, Tag, Link2,
  Hash, Mail, Clock, ToggleLeft, Box
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContentType {
  _id: string;
  name: string;
  slug: string;
  pluralName: string;
  description?: string;
  icon: string;
  fields: any[];
  settings: any;
  permissions: any;
  display: any;
  isActive: boolean;
  isSystem: boolean;
  entriesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  system: number;
  totalEntries: number;
}

// Map des icônes
const iconMap: Record<string, any> = {
  FileText, Package, MessageSquare, Image, MapPin, Tag, Calendar,
  Users, Database, Link2, Hash, Mail, Clock, ToggleLeft, Box,
  Grid, List, Settings, Eye
};

export default function ContentTypesPage() {
  const router = useRouter();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchContentTypes();
  }, []);

  const fetchContentTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content-types');
      const data = await response.json();

      if (response.ok) {
        setContentTypes(data.contentTypes);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur chargement content types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer le content type "${name}" ?\n\nToutes les entrées associées seront également supprimées.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content-types?id=${id}&force=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchContentTypes();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const toggleActive = async (ct: ContentType) => {
    try {
      const response = await fetch(`/api/admin/content-types?id=${ct._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ct.isActive }),
      });

      if (response.ok) {
        fetchContentTypes();
      }
    } catch (error) {
      console.error('Erreur toggle:', error);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || FileText;
    return <Icon className="w-6 h-6" />;
  };

  const filteredContentTypes = contentTypes.filter(ct =>
    ct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Content Types
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Créez et gérez vos types de contenu personnalisés
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/admin/content-types/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          Nouveau Content Type
        </motion.button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Database className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Actifs</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Système</p>
                <p className="text-3xl font-bold mt-1">{stats.system}</p>
              </div>
              <Settings className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Entrées</p>
                <p className="text-3xl font-bold mt-1">{stats.totalEntries}</p>
              </div>
              <FileText className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between gap-4">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un content type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              } transition-colors`}
              aria-label="Affichage en grille"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              } transition-colors`}
              aria-label="Affichage en liste"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Types Display */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      ) : filteredContentTypes.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg">
          <Database className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'Aucun content type trouvé' : 'Aucun content type créé'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push('/admin/content-types/create')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Créer votre premier content type
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredContentTypes.map((ct, index) => (
            <motion.div
              key={ct._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden ${
                viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-6'
              }`}
            >
              {/* Icon */}
              <div className={`${ct.isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'} ${viewMode === 'list' ? 'p-3' : 'p-4 mb-4'} rounded-lg inline-flex`}>
                {getIcon(ct.icon)}
              </div>

              {/* Content */}
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {ct.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ct.slug}
                    </p>
                  </div>
                  {ct.isSystem && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full font-medium">
                      Système
                    </span>
                  )}
                </div>

                {ct.description && viewMode === 'grid' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {ct.description}
                  </p>
                )}

                {/* Stats */}
                <div className={`flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ${viewMode === 'list' ? '' : 'mb-4'}`}>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {ct.fields.length} champs
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="w-4 h-4" />
                    {ct.entriesCount} entrées
                  </span>
                </div>

                {/* Status Badge */}
                <div className={viewMode === 'list' ? 'ml-auto flex items-center gap-2' : 'flex items-center gap-2 mb-4'}>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    ct.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {ct.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/content-types/${ct.slug}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Gérer
                  </button>
                  
                  <button
                    onClick={() => router.push(`/admin/content-types/${ct.slug}/edit`)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  <button
                    onClick={() => toggleActive(ct)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={ct.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {ct.isActive ? (
                      <XCircle className="w-5 h-5 text-orange-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                  
                  {!ct.isSystem && (
                    <button
                      onClick={() => handleDelete(ct._id, ct.name)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
