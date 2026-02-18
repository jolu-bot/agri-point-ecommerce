'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Package, Truck, MapPin, CreditCard, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderItem {
  product: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  estimatedDelivery: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrder = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur chargement commande:', error);
    } finally {
      setLoading(false);
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

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Paiement à la livraison',
      campost: 'Campost',
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Commande introuvable
          </h2>
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Commande confirmée !
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Merci pour votre commande. Un email de confirmation a été envoyé.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Numéro de commande: <span className="font-mono font-semibold text-gray-900 dark:text-white">{order.orderNumber}</span>
          </p>
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Statut de la commande
            </h2>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Package className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Commande reçue</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Livraison estimée</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.estimatedDelivery || '3-5 jours ouvrables'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Paiement</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Détails de la commande
          </h2>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🌱
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quantité: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {item.total.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.price.toLocaleString()} FCFA / unité
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Sous-total</span>
              <span>{order.subtotal.toLocaleString()} FCFA</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Réduction</span>
                <span>-{order.discount.toLocaleString()} FCFA</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Livraison</span>
              <span>
                {order.shipping === 0 ? (
                  <span className="text-green-600 dark:text-green-400 font-semibold">GRATUITE</span>
                ) : (
                  `${order.shipping.toLocaleString()} FCFA`
                )}
              </span>
            </div>

            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span className="text-primary-600 dark:text-primary-400">
                {order.total.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex items-start gap-3">
            <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Adresse de livraison
              </h2>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.region}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.postalCode && <p>Code postal: {order.shippingAddress.postalCode}</p>}
                {order.shippingAddress.notes && (
                  <p className="mt-2 text-sm italic">Note: {order.shippingAddress.notes}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l&apos;accueil
          </Link>

          <Link
            href="/compte/commandes"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Package className="w-5 h-5" />
            Mes commandes
          </Link>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Imprimer
          </button>
        </motion.div>
      </div>
    </div>
  );
}
