'use client';

import { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, Clock, AlertCircle, DownloadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ShipmentItem {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  region: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  total: number;
  shippedDate?: string;
  deliveredDate?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: {
    label: '⏳ En attente',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  processing: {
    label: '📦 En préparation',
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  shipped: {
    label: '🚚 Expédiée',
    icon: Truck,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  delivered: {
    label: '✅ Livrée',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  returned: {
    label: '↩️ Retournée',
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
};

export default function ShippingDashboardPage() {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ShipmentItem['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/shipments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setShipments(data.shipments || []);
      } else {
        toast.error('Erreur chargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      s.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalOrders: shipments.length,
    pending: shipments.filter((s) => s.status === 'pending').length,
    processing: shipments.filter((s) => s.status === 'processing').length,
    shipped: shipments.filter((s) => s.status === 'shipped').length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
  };

  const downloadCSV = () => {
    const headers = [
      'Numéro Commande',
      'Client',
      'Téléphone',
      'Adresse',
      'Ville',
      'Montant',
      'Statut',
      'Date de commande',
    ];
    const rows = filteredShipments.map((s) => [
      s.orderNumber,
      s.customerName,
      s.customerPhone,
      s.address,
      s.city,
      s.total.toLocaleString('fr-FR'),
      statusConfig[s.status].label,
      new Date(s.createdAt).toLocaleDateString('fr-FR'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livraisons-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV téléchargé');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🚚 Dashboard Livraisons
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Suivi en temps réel de toutes les commandes
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
            onClick={() => setStatusFilter('all')}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalOrders}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Total commandes</p>
          </motion.div>

          {(['pending', 'processing', 'shipped', 'delivered'] as const).map((status) => (
            <motion.div
              key={status}
              className={`${statusConfig[status].bg} p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition`}
              onClick={() => setStatusFilter(status)}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`text-3xl font-bold ${statusConfig[status].color}`}>
                {stats[status]}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {statusConfig[status].label.split(' ')[1]}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Chercher par commande, client ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg"
          />
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DownloadCloud className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>

        {/* Liste des livraisons */}
        <div className="space-y-4">
          {filteredShipments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Aucune livraison trouvée</p>
            </div>
          ) : (
            filteredShipments.map((shipment) => {
              const config = statusConfig[shipment.status];
              const Icon = config.icon;

              return (
                <motion.div
                  key={shipment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${config.bg}`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {shipment.orderNumber}
                        </h3>
                        <p className={`text-sm font-semibold ${config.color}`}>
                          {config.label}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {shipment.total.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Client</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {shipment.customerName}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Téléphone</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {shipment.customerPhone}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Adresse</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {shipment.city}, {shipment.region}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Produits</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {shipment.items.reduce((sum, i) => sum + i.quantity, 0)} articles
                      </p>
                    </div>
                  </div>

                  {shipment.trackingNumber && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm mb-4">
                      <span className="text-gray-600 dark:text-gray-400">Suivi:</span>
                      <code className="ml-2 font-mono text-gray-900 dark:text-white">
                        {shipment.trackingNumber}
                      </code>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold">
                      Voir détails
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 text-sm font-semibold">
                      Mettre à jour
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
