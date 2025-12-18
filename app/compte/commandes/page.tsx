'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderItem {
  product: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login?redirect=/compte/commandes');
        return;
      }

      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else if (response.status === 401) {
        router.push('/auth/login?redirect=/compte/commandes');
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; bg: string }> = {
      pending: { label: 'En attente', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
      confirmed: { label: 'Confirmée', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
      processing: { label: 'En préparation', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
      shipped: { label: 'Expédiée', color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
      delivered: { label: 'Livrée', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
      cancelled: { label: 'Annulée', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
    };
    return statuses[status] || statuses.pending;
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const filterOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiées' },
    { value: 'delivered', label: 'Livrées' },
    { value: 'cancelled', label: 'Annulées' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Mes commandes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez l&apos;état de vos commandes et consultez l&apos;historique
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
                {option.value === 'all' && ` (${orders.length})`}
                {option.value !== 'all' && ` (${orders.filter(o => o.status === option.value).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'Aucune commande' : `Aucune commande ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all'
                ? 'Vous n&apos;avez pas encore passé de commande'
                : 'Vous n&apos;avez aucune commande avec ce statut'}
            </p>
            {filter === 'all' && (
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
              >
                Découvrir nos produits
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Commande passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-semibold">{statusInfo.label}</span>
                        </div>

                        <Link
                          href={`/commande/${order._id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">Voir détails</span>
                        </Link>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                🌱
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantité: {item.quantity} × {item.price.toLocaleString()} FCFA
                            </p>
                          </div>

                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.total.toLocaleString()} FCFA
                          </div>
                        </div>
                      ))}

                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                          + {order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''} article{order.items.length - 2 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {order.total.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
