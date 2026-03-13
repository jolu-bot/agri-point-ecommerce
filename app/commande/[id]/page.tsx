'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle, Package, Truck, MapPin, CreditCard, Download, ArrowLeft,
  Sprout, Clock, XCircle, RefreshCw, ChevronDown, ChevronUp, AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { m } from 'framer-motion';
import Breadcrumb from '@/components/shared/Breadcrumb';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface StatusHistoryEntry {
  status: string;
  note?: string;
  timestamp: string;
  smsSent?: boolean;
  emailSent?: boolean;
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
  updatedAt: string;
  estimatedDelivery?: string;
  statusHistory?: StatusHistoryEntry[];
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
}

// ─── Timeline config ──────────────────────────────────────────────────────────

const TIMELINE_STEPS: {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}[] = [
  { key: 'pending',    label: 'Commande reçue',    sublabel: 'En attente de confirmation',    icon: Clock },
  { key: 'confirmed',  label: 'Confirmée',          sublabel: 'Commande validée',              icon: CheckCircle },
  { key: 'processing', label: 'En préparation',     sublabel: 'Colis en cours de préparation', icon: Package },
  { key: 'shipped',    label: 'Expédiée',            sublabel: 'En route vers vous',            icon: Truck },
  { key: 'delivered',  label: 'Livrée',              sublabel: 'Commande reçue',                icon: CheckCircle },
];

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  pending:          { text: 'text-yellow-700 dark:text-yellow-400',  bg: 'bg-yellow-50 dark:bg-yellow-900/20',  border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-400' },
  awaiting_payment: { text: 'text-orange-700 dark:text-orange-400',  bg: 'bg-orange-50 dark:bg-orange-900/20',  border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-400' },
  confirmed:        { text: 'text-blue-700 dark:text-blue-400',      bg: 'bg-blue-50 dark:bg-blue-900/20',      border: 'border-blue-200 dark:border-blue-800',     dot: 'bg-blue-500' },
  processing:       { text: 'text-purple-700 dark:text-purple-400',  bg: 'bg-purple-50 dark:bg-purple-900/20',  border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  shipped:          { text: 'text-indigo-700 dark:text-indigo-400',  bg: 'bg-indigo-50 dark:bg-indigo-900/20',  border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500' },
  delivered:        { text: 'text-green-700 dark:text-green-400',    bg: 'bg-green-50 dark:bg-green-900/20',    border: 'border-green-200 dark:border-green-800',   dot: 'bg-green-500' },
  cancelled:        { text: 'text-red-700 dark:text-red-400',        bg: 'bg-red-50 dark:bg-red-900/20',        border: 'border-red-200 dark:border-red-800',       dot: 'bg-red-500' },
};

const STATUS_LABELS: Record<string, string> = {
  pending:          'En attente',
  awaiting_payment: 'Paiement attendu',
  confirmed:        'Confirmée',
  processing:       'En préparation',
  shipped:          'Expédiée',
  delivered:        'Livrée',
  cancelled:        'Annulée',
};

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0, awaiting_payment: 0,
    confirmed: 1, processing: 2, shipped: 3, delivered: 4,
  };
  return map[status] ?? -1;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    cash: 'Paiement à la livraison',
    campost: 'Campost',
    whatsapp: 'Mobile Money (WhatsApp)',
  };
  return labels[method] || method;
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadOrder = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push(`/auth/login?redirect=/commande/${params.id}`);
        return;
      }
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setLastRefresh(new Date());
      } else if (!silent) {
        router.push('/');
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    loadOrder();
    // Polling toutes les 30s, arrêt si statut terminal
    pollingRef.current = setInterval(() => {
      setOrder(prev => {
        if (prev && (prev.status === 'delivered' || prev.status === 'cancelled')) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          return prev;
        }
        loadOrder(true);
        return prev;
      });
    }, 30_000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [loadOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Chargement de votre commande…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Commande introuvable</h2>
          <Link href="/" className="text-emerald-600 hover:underline">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const currentStepIdx = getStepIndex(order.status);
  const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <Breadcrumb
          items={[
            { label: 'Mes commandes', href: '/compte/commandes' },
            { label: order.orderNumber },
          ]}
          className="mb-6"
        />

        {/* ── Header ── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 ${
            isCancelled               ? 'bg-red-100 dark:bg-red-900/20' :
            order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/20' :
            'bg-emerald-100 dark:bg-emerald-900/20'
          }`}>
            {isCancelled
              ? <XCircle className="w-11 h-11 text-red-500" />
              : order.status === 'delivered'
              ? <CheckCircle className="w-11 h-11 text-green-600 dark:text-green-400" />
              : <Package className="w-11 h-11 text-emerald-600 dark:text-emerald-400" />
            }
          </div>

          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
            {isCancelled
              ? 'Commande annulée'
              : order.status === 'delivered'
              ? 'Commande livrée !'
              : 'Suivi de commande'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            N°{' '}
            <span className="font-mono font-semibold text-gray-900 dark:text-white">{order.orderNumber}</span>
            {' · '}passée le {formatDateShort(order.createdAt)}
          </p>

          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
            <button
              onClick={() => loadOrder(true)}
              disabled={refreshing}
              className="flex items-center gap-1 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <span>· {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </m.div>

        {/* ── Status Badge ── */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl border mb-6 ${statusColor.bg} ${statusColor.border}`}
        >
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColor.dot} ${
            !isCancelled && order.status !== 'delivered' ? 'animate-pulse' : ''
          }`} />
          <div>
            <div className={`text-base font-black ${statusColor.text}`}>{statusLabel}</div>
            {order.status === 'shipped' && order.tracking?.trackingNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                N° transporteur :{' '}
                <span className="font-mono font-semibold">{order.tracking.trackingNumber}</span>
                {order.tracking.carrier && (
                  <span className="text-gray-400"> · {order.tracking.carrier}</span>
                )}
              </p>
            )}
            {!isCancelled && order.status !== 'delivered' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Actualisé automatiquement toutes les 30 secondes
              </p>
            )}
          </div>
        </m.div>

        {/* ── Visual Timeline ── */}
        {!isCancelled && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6"
          >
            <h2 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wide">
              Progression
            </h2>

            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100 dark:bg-gray-700" />

              <div className="space-y-1">
                {TIMELINE_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = idx <= currentStepIdx;
                  const isActive = idx === currentStepIdx;

                  const histEntry = order.statusHistory?.find(h => h.status === step.key);
                  const entryDate = histEntry?.timestamp
                    ?? (step.key === 'pending' ? order.createdAt : undefined);

                  return (
                    <div
                      key={step.key}
                      className={`relative flex items-start gap-4 p-3 rounded-xl transition-colors ${
                        isActive ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''
                      }`}
                    >
                      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone
                          ? isActive
                            ? 'bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                      }`}>
                        <StepIcon className={`w-4 h-4 ${
                          isDone
                            ? isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`} />
                        {isActive && (
                          <span className="absolute -right-1 -top-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <p className={`text-sm font-bold leading-tight ${
                          isDone
                            ? isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>
                          {step.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          isDone ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-700'
                        }`}>
                          {entryDate ? formatDateShort(entryDate) : step.sublabel}
                        </p>
                        {isActive && histEntry?.note && (
                          <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-300 italic">
                            &ldquo;{histEntry.note}&rdquo;
                          </p>
                        )}
                      </div>

                      {isDone && !isActive && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {['pending', 'confirmed', 'processing', 'shipped'].includes(order.status) && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                Livraison estimée :{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {order.estimatedDelivery || '3–5 jours ouvrables'}
                </span>
              </div>
            )}
          </m.div>
        )}

        {/* ── Status History (toggle) ── */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 overflow-hidden"
          >
            <button
              onClick={() => setShowHistory(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Historique des mises à jour ({order.statusHistory.length})
              </span>
              {showHistory
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showHistory && (
              <div className="px-6 pb-5 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                {[...order.statusHistory].reverse().map((entry, i) => {
                  const ec = STATUS_COLORS[entry.status] ?? STATUS_COLORS.pending;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${ec.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ec.bg} ${ec.text} ${ec.border} border`}>
                            {STATUS_LABELS[entry.status] ?? entry.status}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(entry.timestamp)}</span>
                          {entry.smsSent && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> SMS
                            </span>
                          )}
                        </div>
                        {entry.note && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </m.div>
        )}

        {/* ── Order Items ── */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6"
        >
          <h2 className="text-sm font-black text-gray-900 dark:text-white mb-5 uppercase tracking-wide">
            Articles commandés
          </h2>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sprout className="w-7 h-7 text-emerald-300 dark:text-emerald-700" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Qté : {item.quantity} · {item.price.toLocaleString()} FCFA/unité
                  </p>
                </div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {item.total.toLocaleString()} FCFA
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Sous-total</span>
              <span>{order.subtotal.toLocaleString()} FCFA</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Réduction</span>
                <span>-{order.discount.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Livraison</span>
              <span>
                {order.shipping === 0
                  ? <span className="text-green-600 dark:text-green-400 font-semibold">GRATUITE</span>
                  : `${order.shipping.toLocaleString()} FCFA`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {order.total.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </m.div>

        {/* ── Shipping + Payment ── */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Livraison</h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
              <p className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.region}</p>
              {order.shippingAddress.notes && (
                <p className="text-xs italic text-gray-400 mt-1">Note : {order.shippingAddress.notes}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Paiement</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getPaymentMethodLabel(order.paymentMethod)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Statut :{' '}
              <span className={`font-semibold ${
                order.paymentStatus === 'paid'           ? 'text-green-600 dark:text-green-400' :
                order.paymentStatus === 'failed'         ? 'text-red-600' :
                order.paymentStatus === 'awaiting_proof' ? 'text-orange-600 dark:text-orange-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {order.paymentStatus === 'paid'           ? 'Payé' :
                 order.paymentStatus === 'failed'         ? 'Échoué' :
                 order.paymentStatus === 'awaiting_proof' ? 'Preuve attendue' : 'En attente'}
              </span>
            </p>
          </div>
        </m.div>

        {/* ── Actions ── */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>

          <Link
            href="/compte/commandes"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors text-sm"
          >
            <Package className="w-4 h-4" />
            Mes commandes
          </Link>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Imprimer
          </button>
        </m.div>

      </div>
    </div>
  );
}
