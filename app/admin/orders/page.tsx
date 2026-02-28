'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Search,
  Filter,
  Eye,
  Download,
  Truck
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
  };
  items: any[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: 'campost' | 'cash' | 'whatsapp';
  campostPayment?: {
    receiptImage?: string;
    validatedAt?: Date;
    validationNotes?: string;
  };
  whatsappPayment?: {
    mobileMoneyProvider?: 'orange' | 'mtn';
    screenshotUrl?: string;
    screenshotUploadedAt?: Date;
    validatedAt?: Date;
    validationNotes?: string;
  };
  createdAt: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses = [
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'En attente' },
    { value: 'awaiting_payment', label: '⏳ Attente paiement' },
    { value: 'confirmed', label: '✓ Confirmée' },
    { value: 'processing', label: 'En traitement' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' },
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Statut mis à jour');
        loadOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error('Erreur de mise à jour');
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur serveur');
    }
  };

  const handleValidatePayment = async (orderId: string, action: 'approve' | 'reject') => {
    const notesElement = document.getElementById('validation-notes') as HTMLTextAreaElement;
    const notes = notesElement?.value || '';

    const confirmMessage = action === 'approve' 
      ? 'Confirmer la validation du paiement ?'
      : 'Êtes-vous sûr de vouloir rejeter ce paiement ?';
    
    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/orders/validate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, action, notes }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || (action === 'approve' ? 'Paiement validé ✅' : 'Paiement rejeté'));
        loadOrders();
        setSelectedOrder(null); // Fermer le modal
      } else {
        toast.error(data.error || 'Erreur de validation');
      }
    } catch (error) {
      console.error('Erreur validation paiement:', error);
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      awaiting_payment: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return badges[status] || badges.pending;
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                       order.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Commandes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <label htmlFor="status-filter" className="sr-only">Filtrer par statut</label>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              aria-label="Filtrer les commandes par statut"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.user?.name || 'Client inconnu'}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {order.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.total.toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                          {statuses.find(s => s.value === order.status)?.label}
                        </span>
                        {/* Payment Method Badge */}
                        <div className="flex items-center space-x-1">
                          {order.paymentMethod === 'whatsapp' && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              📱 WhatsApp
                            </span>
                          )}
                          {order.paymentMethod === 'campost' && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              🏢 Campost
                            </span>
                          )}
                          {order.paymentMethod === 'cash' && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              💵 À livraison
                            </span>
                          )}
                          {/* Receipt/Screenshot indicator */}
                          {(order.whatsappPayment?.screenshotUrl || order.campostPayment?.receiptImage) && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              📄 Preuve
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        aria-label="Voir les détails de la commande"
                      >
                        <Eye className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Aucune commande trouvée
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Commande {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Client Info */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Informations client
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedOrder.shippingAddress?.fullName}<br />
                {selectedOrder.shippingAddress?.phone}<br />
                {selectedOrder.shippingAddress?.address}<br />
                {selectedOrder.shippingAddress?.city}
              </p>
            </div>

            {/* Payment Validation Section */}
            {(selectedOrder.paymentMethod === 'whatsapp' || selectedOrder.paymentMethod === 'campost') && 
             (selectedOrder.whatsappPayment?.screenshotUrl || selectedOrder.campostPayment?.receiptImage) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  {selectedOrder.paymentMethod === 'whatsapp' ? '📱 Paiement WhatsApp Mobile Money' : '🏢 Paiement Campost'}
                  {selectedOrder.whatsappPayment?.validatedAt || selectedOrder.campostPayment?.validatedAt ? (
                    <span className="ml-2 text-xs px-2 py-1 bg-green-500 text-white rounded-full">✓ Validé</span>
                  ) : (
                    <span className="ml-2 text-xs px-2 py-1 bg-amber-500 text-white rounded-full animate-pulse">⏳ En attente</span>
                  )}
                </h4>

                {/* Screenshot/Receipt Preview */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {selectedOrder.paymentMethod === 'whatsapp' ? 'Capture d\'écran Mobile Money' : 'Reçu de paiement'}
                  </label>
                  <div className="relative group">
                    <img
                      src={selectedOrder.whatsappPayment?.screenshotUrl || selectedOrder.campostPayment?.receiptImage}
                      alt="Preuve de paiement"
                      className="w-full max-h-64 object-contain border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        const url = selectedOrder.whatsappPayment?.screenshotUrl || selectedOrder.campostPayment?.receiptImage;
                        if (url) window.open(url, '_blank');
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white bg-black/50 px-3 py-1 rounded-lg text-sm">🔍 Cliquer pour agrandir</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Uploadé le {new Date(selectedOrder.whatsappPayment?.screenshotUploadedAt || selectedOrder.campostPayment?.receiptImage || '').toLocaleString('fr-FR')}
                  </p>
                </div>

                {/* Payment Details */}
                {selectedOrder.paymentMethod === 'whatsapp' && selectedOrder.whatsappPayment?.mobileMoneyProvider && (
                  <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Opérateur: </span>
                      {selectedOrder.whatsappPayment.mobileMoneyProvider === 'orange' ? (
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded text-xs font-semibold">
                          🟠 Orange Money
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs font-semibold">
                          🟡 MTN Mobile Money
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Validation Status */}
                {(selectedOrder.whatsappPayment?.validatedAt || selectedOrder.campostPayment?.validatedAt) ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ <strong>Validé</strong> le {new Date(selectedOrder.whatsappPayment?.validatedAt || selectedOrder.campostPayment?.validatedAt || '').toLocaleString('fr-FR')}
                    </p>
                    {(selectedOrder.whatsappPayment?.validationNotes || selectedOrder.campostPayment?.validationNotes) && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Note: {selectedOrder.whatsappPayment?.validationNotes || selectedOrder.campostPayment?.validationNotes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="validation-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes de validation (optionnel)
                      </label>
                      <textarea
                        id="validation-notes"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Ajouter des remarques..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleValidatePayment(selectedOrder._id, 'approve')}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
                      >
                        <span>✅</span>
                        <span>Approuver le paiement</span>
                      </button>
                      <button
                        onClick={() => handleValidatePayment(selectedOrder._id, 'reject')}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
                      >
                        <span>❌</span>
                        <span>Rejeter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Articles ({selectedOrder.items?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-gray-900 dark:text-white">
                      {item.productName} x{item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{selectedOrder.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-6">
              <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Changer le statut
              </label>
              <select
                id="order-status"
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                aria-label="Modifier le statut de la commande"
              >
                {statuses.filter(s => s.value !== 'all').map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Télécharger facture</span>
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Générer tracking</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
