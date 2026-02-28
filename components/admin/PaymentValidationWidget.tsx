'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Eye,
  RefreshCw
} from 'lucide-react';

interface ValidationStats {
  awaitingCount: number;
  overdueSLA: number;
  last24h: number;
  last7Days: {
    total: number;
    approved: number;
    rejected: number;
  };
  averageValidationTime: number;
  approvalRate: number;
  byMethod: {
    whatsapp: number;
    campost: number;
  };
}

interface AwaitingOrder {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentMethod: 'whatsapp' | 'campost';
  uploadedAt: Date;
  hoursAgo: number;
  isOverdue: boolean;
}

export default function PaymentValidationWidget() {
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [awaitingOrders, setAwaitingOrders] = useState<AwaitingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/validation-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setAwaitingOrders(data.awaitingOrders || []);
      }
    } catch (error) {
      console.error('Erreur chargement stats validation:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Rafraîchir toutes les 2 minutes
    const interval = setInterval(loadStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl shadow-lg p-6 border border-amber-200 dark:border-amber-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Validations de Paiement
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Suivi en temps réel
            </p>
          </div>
        </div>
        <button
          onClick={loadStats}
          disabled={refreshing}
          className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
          title="Actualiser"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alert si SLA dépassé */}
      {stats.overdueSLA > 0 && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start space-x-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">
              ⚠️ {stats.overdueSLA} commande{stats.overdueSLA > 1 ? 's' : ''} en retard
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              SLA de 2 heures dépassé - Action urgente requise
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* En attente */}
        <Link href="/admin/orders?status=awaiting_payment">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              {stats.awaitingCount > 0 && (
                <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {stats.awaitingCount}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {stats.awaitingCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
          </div>
        </Link>

        {/* Taux d'approbation */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.approvalRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Taux d'approbation</p>
        </div>

        {/* Délai moyen */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.averageValidationTime}h
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Délai moyen</p>
        </div>

        {/* Dernières 24h */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.last24h}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Dernières 24h</p>
        </div>
      </div>

      {/* Répartition par méthode */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Répartition des validations en attente
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📱</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">WhatsApp Mobile Money</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.byMethod.whatsapp}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏢</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Campost</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.byMethod.campost}</span>
          </div>
        </div>
      </div>

      {/* Commandes en attente (top 3) */}
      {awaitingOrders.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Prochaines validations {awaitingOrders.length > 3 && `(${awaitingOrders.length})`}
          </h4>
          <div className="space-y-2">
            {awaitingOrders.slice(0, 3).map((order) => (
              <Link
                key={order.orderId}
                href={`/admin/orders`}
                className="block p-3 bg-white dark dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      {order.isOverdue && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded">
                          RETARD
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>{order.total.toLocaleString('fr-FR')} FCFA</span>
                      <span>•</span>
                      <span className={order.isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                        Il y a {order.hoursAgo}h
                      </span>
                      <span>•</span>
                      <span>
                        {order.paymentMethod === 'whatsapp' ? '📱 WhatsApp' : '🏢 Campost'}
                      </span>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {awaitingOrders.length > 3 && (
            <Link
              href="/admin/orders?status=awaiting_payment"
              className="mt-3 block text-center py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              Voir toutes les validations ({awaitingOrders.length})
            </Link>
          )}
        </div>
      )}

      {/* Si aucune validation en attente */}
      {stats.awaitingCount === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            ✅ Aucune validation en attente
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Toutes les preuves de paiement ont été traitées
          </p>
        </div>
      )}

      {/* Stats 7 jours */}
      {stats.last7Days.total > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            7 derniers jours
          </p>
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.last7Days.total}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {stats.last7Days.approved}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Approuvés</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {stats.last7Days.rejected}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rejetés</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
