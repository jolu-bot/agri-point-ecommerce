'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, ChevronRight, AlertTriangle, CreditCard, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderItem {
  product: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface InstallmentPayment {
  enabled: boolean;
  firstAmount: number;
  secondAmount: number;
  firstPaymentStatus: 'pending' | 'paid';
  secondPaymentStatus: 'pending' | 'paid' | 'overdue';
  secondDueDate?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  isCampaignOrder?: boolean;
  installmentPayment?: InstallmentPayment;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const en = locale === 'en';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const STATUS_LABELS: Record<string, string> = {
    pending: en ? 'Pending' : 'En attente',
    confirmed: en ? 'Confirmed' : 'Confirmée',
    preparing: en ? 'In preparation' : 'En préparation',
    shipped: en ? 'Shipped' : 'Expédiée',
    delivered: en ? 'Delivered' : 'Livrée',
    cancelled: en ? 'Cancelled' : 'Annulée',
  };

  const filterOptions = [
    { label: en ? 'All' : 'Toutes', value: 'all' },
    { label: en ? 'Pending' : 'En attente', value: 'pending' },
    { label: en ? 'In preparation' : 'En préparation', value: 'preparing' },
    { label: en ? 'Shipped' : 'Expédiées', value: 'shipped' },
    { label: en ? 'Delivered' : 'Livrées', value: 'delivered' },
    { label: en ? 'Cancelled' : 'Annulées', value: 'cancelled' },
  ];

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
      pending: { label: STATUS_LABELS.pending, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
      confirmed: { label: STATUS_LABELS.confirmed, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
      processing: { label: STATUS_LABELS.preparing, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
      shipped: { label: STATUS_LABELS.shipped, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
      delivered: { label: STATUS_LABELS.delivered, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
      cancelled: { label: STATUS_LABELS.cancelled, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
    };
    return statuses[status] || statuses.pending;
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{en ? 'Loading your orders...' : 'Chargement de vos commandes...'}</p>
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
            {en ? 'My Orders' : 'Mes commandes'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {en ? 'Track the status of your orders and view history' : "Suivez l'état de vos commandes et consultez l'historique"}
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
              {filter === 'all'
                ? (en ? 'No orders' : 'Aucune commande')
                : (en
                  ? `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} orders`
                  : `Aucune commande ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all'
                ? (en ? "You haven't placed any orders yet" : "Vous n'avez pas encore passé de commande")
                : (en ? 'You have no orders with this status' : "Vous n'avez aucune commande avec ce statut")}
            </p>
            {filter === 'all' && (
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
              >
                {en ? 'Discover our products' : 'Découvrir nos produits'}
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
                          {en ? 'Order placed on' : 'Commande passée le'} {new Date(order.createdAt).toLocaleDateString('fr-FR', {
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
                          <span className="text-sm font-medium">{en ? 'View details' : 'Voir détails'}</span>
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
                              <div className="w-full h-full flex items-center justify-center">
                                <Sprout className="w-7 h-7 text-emerald-300 dark:text-emerald-700" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {en ? 'Quantity:' : 'Quantité:'} {item.quantity} × {item.price.toLocaleString()} FCFA
                            </p>
                          </div>

                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.total.toLocaleString()} FCFA
                          </div>
                        </div>
                      ))}

                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                          {(() => {
                            const n = order.items.length - 2;
                            return en
                              ? `+ ${n} more item${n > 1 ? 's' : ''}`
                              : `+ ${n} autre${n > 1 ? 's' : ''} article${n > 1 ? 's' : ''}`;
                          })()}
                        </p>
                      )}
                    </div>

                    {/* Suivi tranche Campost (campagne uniquement) */}
                    {order.installmentPayment?.enabled && (
                      <div className="mt-4 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            {en ? 'Installment payment 70/30 — Fertilizer Campaign 2026' : 'Paiement échelonné 70/30 — Campagne engrais 2026'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {/* 1ère tranche */}
                          <div className={`p-3 rounded-lg border ${
                            order.installmentPayment.firstPaymentStatus === 'paid'
                              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/40'
                              : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/40'
                          }`}>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              {en ? '1st installment (70%)' : '1ère tranche (70%)'}
                            </p>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {order.installmentPayment.firstAmount.toLocaleString()} FCFA
                            </p>
                            <div className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                              order.installmentPayment.firstPaymentStatus === 'paid'
                                ? 'text-green-600'
                                : 'text-yellow-600'
                            }`}>
                              {order.installmentPayment.firstPaymentStatus === 'paid'
                                ? <><CheckCircle className="w-3.5 h-3.5" /> {en ? 'Paid' : 'Payée'}</>
                                : <><Clock className="w-3.5 h-3.5" /> {en ? 'Pending' : 'En attente'}</>}
                            </div>
                          </div>

                          {/* 2ème tranche */}
                          <div className={`p-3 rounded-lg border ${
                            order.installmentPayment.secondPaymentStatus === 'paid'
                              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/40'
                              : order.installmentPayment.secondPaymentStatus === 'overdue'
                                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40'
                                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                          }`}>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              {en ? '2nd installment (30%)' : '2ème tranche (30%)'}
                            </p>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {order.installmentPayment.secondAmount.toLocaleString()} FCFA
                            </p>
                            <div className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                              order.installmentPayment.secondPaymentStatus === 'paid'
                                ? 'text-green-600'
                                : order.installmentPayment.secondPaymentStatus === 'overdue'
                                  ? 'text-red-600'
                                  : 'text-amber-600'
                            }`}>
                              {order.installmentPayment.secondPaymentStatus === 'paid'
                                ? <><CheckCircle className="w-3.5 h-3.5" /> {en ? 'Paid' : 'Payée'}</>
                                : order.installmentPayment.secondPaymentStatus === 'overdue'
                                  ? <><AlertTriangle className="w-3.5 h-3.5" /> {en ? 'Overdue' : 'En retard'}</>
                                  : <><Clock className="w-3.5 h-3.5" /> {en ? 'Due before April 30' : 'Dû avant le 30 avril'}</>}
                            </div>
                          </div>
                        </div>

                        {order.installmentPayment.secondPaymentStatus !== 'paid' && (
                          <p className="mt-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-lg">
                            {en
                              ? <>⚠️ Deadline for 2nd payment: <strong>April 30, 2026</strong> at the nearest Campost office.</>
                              : <>⚠️ Date limite du 2ème versement : <strong>30 avril 2026</strong> au bureau Campost le plus proche.</>}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {en ? 'Total' : 'Total'}
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
