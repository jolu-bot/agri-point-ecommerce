'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Layout,
  Calendar,
  TrendingUp,
  Lock,
  Globe,
} from 'lucide-react';

interface Page {
  _id: string;
  title: string;
  slug: string;
  path: string;
  description?: string;
  layout: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  isTemplate: boolean;
  publishedAt?: string;
  stats: {
    views: number;
    uniqueVisitors: number;
  };
  permissions: {
    visibility: 'public' | 'private' | 'protected';
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

interface Stats {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  templates: number;
  totalViews: number;
}

export default function PagesAdminPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [layoutFilter, setLayoutFilter] = useState('all');
  const [includeTemplates, setIncludeTemplates] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPages();
  }, [searchQuery, statusFilter, layoutFilter, includeTemplates, sortBy, sortOrder]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(layoutFilter !== 'all' && { layout: layoutFilter }),
        ...(includeTemplates && { includeTemplates: 'true' }),
        sortBy,
        sortOrder,
      });

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/pages?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data.pages);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la page "${title}" ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/pages?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPages();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (id: string, title: string) => {
    const newSlug = prompt('Entrez le slug pour la page dupliquée:', `${id.slice(-4)}-copy`);
    if (!newSlug) return;

    const newTitle = prompt('Entrez le titre (optionnel):', `${title} (copie)`);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/pages/duplicate?id=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newSlug, newTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Page dupliquée avec succès !');
        router.push(`/admin/pages/${data.page._id}/edit`);
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la duplication');
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
      alert('Erreur lors de la duplication');
    }
  };

  const getStatusBadge = (page: Page) => {
    if (page.status === 'published') {
      return { label: 'Publié', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    } else if (page.status === 'scheduled') {
      return { label: 'Programmé', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    } else if (page.status === 'archived') {
      return { label: 'Archivé', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    } else {
      return { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-500" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-500" />;
      case 'protected':
        return <Lock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pages
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Créez et gérez vos pages avec le Page Builder
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/pages/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Page
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm opacity-90">Total</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{stats.published}</div>
            <div className="text-sm opacity-90">Publiées</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Edit className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <div className="text-sm opacity-90">Brouillons</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <div className="text-sm opacity-90">Programmées</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Layout className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{stats.templates}</div>
            <div className="text-sm opacity-90">Templates</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
            <div className="text-sm opacity-90">Vues totales</div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiées</option>
          <option value="draft">Brouillons</option>
          <option value="scheduled">Programmées</option>
          <option value="archived">Archivées</option>
        </select>

        {/* Layout Filter */}
        <select
          value={layoutFilter}
          onChange={(e) => setLayoutFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les layouts</option>
          <option value="default">Default</option>
          <option value="full-width">Full Width</option>
          <option value="sidebar-left">Sidebar Left</option>
          <option value="sidebar-right">Sidebar Right</option>
          <option value="landing">Landing</option>
        </select>

        {/* Templates Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeTemplates}
            onChange={(e) => setIncludeTemplates(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Inclure templates
          </span>
        </label>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order as 'asc' | 'desc');
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt-desc">Plus récentes</option>
          <option value="createdAt-asc">Plus anciennes</option>
          <option value="title-asc">Titre A-Z</option>
          <option value="title-desc">Titre Z-A</option>
          <option value="stats.views-desc">Plus de vues</option>
          <option value="updatedAt-desc">Modifiées récemment</option>
        </select>
      </div>

      {/* Pages Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune page trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery ? 'Essayez de modifier votre recherche' : 'Commencez par créer votre première page'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/admin/pages/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Créer une page
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Layout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statistiques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pages.map((page, index) => (
                <motion.tr
                  key={page._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {getVisibilityIcon(page.permissions.visibility)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {page.title}
                          </div>
                          {page.isTemplate && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded">
                              Template
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {page.path}
                        </div>
                        {page.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                            {page.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                      <Layout className="w-3 h-3" />
                      {page.layout}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadge(page).color}`}>
                      {getStatusBadge(page).label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {formatNumber(page.stats.views)} vues
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(page.stats.uniqueVisitors)} visiteurs
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(page.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(page.path, '_blank')}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/pages/${page._id}/edit`)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(page._id, page.title)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page._id, page.title)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
