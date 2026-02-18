'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  ExternalLink,
  FileText,
  User,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CampostOrder {
  _id: string;
  orderNumber: string;
  total: number;
  createdAt: string;
  paymentStatus: string;
  status: string;
  shippingAddress: {
    name: string;
    phone: string;
    city: string;
  };
  campostPayment?: {
    receiptImage: string;
    receiptUploadedAt: Date;
    validatedAt?: Date;
    validatedBy?: string;
    validationNotes?: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function CampostPaymentsPage() {
  const [orders, setOrders] = useState<CampostOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'awaiting' | 'validated'>('awaiting');
  const [selectedOrder, setSelectedOrder] = useState<CampostOrder | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/campost-orders?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePayment = async (orderId: string, approved: boolean) => {
    if (!approved && !validationNotes.trim()) {
      toast.error('Veuillez indiquer la raison du refus');
      return;
    }

    setValidating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/validate-campost-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          approved,
          validationNotes,
        }),
      });

      if (!res.ok) throw new Error('Erreur validation');

      toast.success(approved ? 'Paiement validé!' : 'Paiement refusé');
      setSelectedOrder(null);
      setValidationNotes('');
      fetchOrders();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  const awaitingCount = orders.filter(o => 
    o.paymentStatus === 'awaiting_proof' && o.campostPayment?.receiptImage
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Paiements Campost
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez et validez les reçus de paiement Campost
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                En Attente
              </p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                {awaitingCount}
              </p>
            </div>
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                Validés
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {orders.filter(o => o.campostPayment?.validatedAt).length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Total Commandes
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {orders.length}
              </p>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          {[
            { value: 'awaiting', label: 'En Attente', count: awaitingCount },
            { value: 'validated', label: 'Validés', count: orders.filter(o => o.campostPayment?.validatedAt).length },
            { value: 'all', label: 'Tous', count: orders.length },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune commande Campost trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <span className="font-mono font-bold text-lg">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {order.total.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {order.campostPayment?.validatedAt ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Validé
                      </span>
                    ) : order.campostPayment?.receiptImage ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        À vérifier
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 rounded-full text-sm font-medium">
                        Sans reçu
                      </span>
                    )}
                  </div>
                </div>

                {/* Client Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{order.shippingAddress.name}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.phone}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Image */}
              {order.campostPayment?.receiptImage && (
                <div className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Image src="/images/icons/receipt.svg" alt="" width={20} height={20} className="w-5 h-5" />
                    Reçu Campost
                  </h3>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={order.campostPayment.receiptImage}
                      alt="Reçu Campost"
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <a
                      href={order.campostPayment.receiptImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ouvrir
                    </a>
                    <a
                      href={order.campostPayment.receiptImage}
                      download
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </a>
                  </div>

                  {!order.campostPayment.validatedAt && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={validationNotes}
                        onChange={(e) => setValidationNotes(e.target.value)}
                        placeholder="Notes de validation (optionnel pour validation, requis pour refus)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows={3}
                      />
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleValidatePayment(order._id, true)}
                          disabled={validating}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Valider
                        </button>
                        <button
                          onClick={() => handleValidatePayment(order._id, false)}
                          disabled={validating}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                          Refuser
                        </button>
                      </div>
                    </div>
                  )}

                  {order.campostPayment.validatedAt && (
                    <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm text-green-800 dark:text-green-400 font-medium">
                        ✅ Validé le {new Date(order.campostPayment.validatedAt).toLocaleString('fr-FR')}
                      </p>
                      {order.campostPayment.validationNotes && (
                        <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                          {order.campostPayment.validationNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
