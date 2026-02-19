'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Search, Filter, Calendar, TrendingUp, DollarSign,
  ShoppingCart, Edit, Trash2, Copy, Eye, EyeOff, Percent, Gift,
  Zap, Clock, Users, MapPin, Package, X
} from 'lucide-react';

interface Promotion {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'bundle' | 'buy_x_get_y' | 'free_shipping';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  code?: string;
  display: {
    badge: string;
    color: string;
    priority: number;
  };
  conditions: {
    minPurchase?: number;
    usageLimit?: number;
    currentUsage: number;
  };
  stats: {
    views: number;
    conversions: number;
    revenue: number;
  };
  targeting: {
    appliesTo: string;
  };
}

interface Stats {
  active: number;
  scheduled: number;
  expired: number;
  totalRevenue: number;
  totalConversions: number;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPromotions();
  }, [statusFilter, typeFilter, searchQuery]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/promotions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPromotions(data.promotions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur chargement promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette promotion ?')) return;

    try {
      const response = await fetch(`/api/admin/promotions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPromotions();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      const response = await fetch(`/api/admin/promotions?id=${promotion._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promotion.isActive }),
      });

      if (response.ok) {
        fetchPromotions();
      }
    } catch (error) {
      console.error('Erreur toggle:', error);
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return { label: 'Désactivée', color: 'bg-gray-500' };
    } else if (now < start) {
      return { label: 'Programmée', color: 'bg-blue-500' };
    } else if (now > end) {
      return { label: 'Expirée', color: 'bg-gray-500' };
    } else {
      return { label: 'Active', color: 'bg-green-500' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      case 'fixed':
        return <DollarSign className="w-5 h-5" />;
      case 'bundle':
        return <Package className="w-5 h-5" />;
      case 'buy_x_get_y':
        return <Gift className="w-5 h-5" />;
      case 'free_shipping':
        return <Zap className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Tag className="w-8 h-8 text-purple-600" />
            Gestion des Promotions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Créez et gérez vos campagnes promotionnelles
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingPromotion(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Promotion
        </motion.button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Actives</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <TrendingUp className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Programmées</p>
                <p className="text-3xl font-bold mt-1">{stats.scheduled}</p>
              </div>
              <Clock className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Expirées</p>
                <p className="text-3xl font-bold mt-1">{stats.expired}</p>
              </div>
              <Calendar className="w-10 h-10 opacity-80" />
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
                <p className="text-orange-100 text-sm">Conversions</p>
                <p className="text-3xl font-bold mt-1">{stats.totalConversions}</p>
              </div>
              <ShoppingCart className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Revenu Généré</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          {/* Recherche */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une promotion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filtre Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrer par statut"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="scheduled">Programmées</option>
            <option value="expired">Expirées</option>
          </select>

          {/* Filtre Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filtrer par type"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les types</option>
            <option value="percentage">Pourcentage</option>
            <option value="fixed">Montant fixe</option>
            <option value="bundle">Bundle</option>
            <option value="buy_x_get_y">Achetez X, Recevez Y</option>
            <option value="free_shipping">Livraison gratuite</option>
          </select>
        </div>
      </div>

      {/* Liste des promotions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucune promotion trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Promotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {promotions.map((promo, index) => {
                  const status = getStatusBadge(promo);
                  return (
                    <motion.tr
                      key={promo._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${promo.display.color} bg-opacity-10 rounded-lg`}>
                            {getTypeIcon(promo.type)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {promo.name}
                            </p>
                            {promo.code && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                Code: {promo.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${promo.display.color} bg-opacity-10`}>
                          {promo.display.badge}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(promo.startDate)} → {formatDate(promo.endDate)}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {promo.stats.views} vues
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {promo.stats.conversions} conversions
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-600 dark:text-gray-400 font-semibold">
                              {formatCurrency(promo.stats.revenue)}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleActive(promo)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title={promo.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {promo.isActive ? (
                              <Eye className="w-5 h-5 text-green-600" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditingPromotion(promo);
                              setShowModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5 text-blue-600" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(promo._id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création/édition (à implémenter) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  aria-label="Fermer le modal"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Formulaire de création/édition à implémenter
                </p>
                {/* Formulaire complet à implémenter dans la prochaine itération */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
