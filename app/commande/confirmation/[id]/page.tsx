'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle, Package, Home, ArrowRight, Loader2,
  Sprout, Calendar, CreditCard,
} from 'lucide-react';
import { m } from 'framer-motion';
import CampostPaymentInfo from '@/components/shared/CampostPaymentInfo';
import WhatsAppPaymentInfo from '@/components/shared/WhatsAppPaymentInfo';
import Breadcrumb from '@/components/shared/Breadcrumb';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push(`/auth/login?redirect=/commande/confirmation/${params.id}`);
      return;
    }
    fetch(`/api/orders/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.order) setOrder(data.order);
        else router.push('/');
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) return null;

  const isCampost = order.paymentMethod === 'campost';
  const isWhatsapp = order.paymentMethod === 'whatsapp';
  const amount70 = isCampost ? Math.round(order.total * 0.7) : undefined;
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <Breadcrumb
          items={[
            { label: 'Panier', href: '/panier' },
            { label: 'Confirmation' },
          ]}
          className="mb-6"
        />

        {/* ── Success header ── */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-5 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
            <CheckCircle className="w-14 h-14 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Commande enregistrée !
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            N° <span className="font-mono font-bold text-gray-900 dark:text-white">{order.orderNumber}</span>
            {' · '}{orderDate}
          </p>
        </m.div>

        {/* ── Order summary ── */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.06] p-6 mb-6"
        >
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide mb-5 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            Articles commandés
          </h2>

          <div className="space-y-3 mb-5">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sprout className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qté {item.quantity} · {item.price.toLocaleString()} FCFA/u</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{item.total.toLocaleString()} FCFA</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-white/[0.06] pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Sous-total</span><span>{order.subtotal.toLocaleString()} FCFA</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Réduction</span><span>-{order.discount.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Livraison</span>
              <span>{order.shipping === 0
                ? <span className="text-emerald-600 font-semibold">Gratuite</span>
                : `${order.shipping.toLocaleString()} FCFA`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-emerald-600 dark:text-emerald-400 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <span>Total</span><span>{order.total.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Delivery address */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06] flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
            <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
            <div>
              <span className="block font-semibold text-gray-900 dark:text-white">{order.shippingAddress?.name}</span>
              <span>{order.shippingAddress?.street}, {order.shippingAddress?.city}</span>
              <span className="block mt-0.5 text-xs">
                Mode de règlement :{' '}
                <strong className="text-gray-800 dark:text-gray-200">
                  {isCampost ? 'Campost' : isWhatsapp ? 'Mobile Money' : 'Paiement à la livraison'}
                </strong>
              </span>
            </div>
          </div>
        </m.div>

        {/* ── Payment instructions ── */}
        {(isCampost || isWhatsapp) && (
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {isCampost ? 'Instructions de paiement Campost' : 'Instructions de paiement Mobile Money'}
            </h2>

            {isCampost && (
              <CampostPaymentInfo
                orderNumber={order.orderNumber}
                amount70={amount70}
                variant="full"
              />
            )}
            {isWhatsapp && (
              <WhatsAppPaymentInfo
                orderNumber={order.orderNumber}
                amount={order.total}
                variant="full"
              />
            )}
          </m.div>
        )}

        {/* ── Actions ── */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href={`/commande/${order._id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm shadow-sm hover:shadow-emerald-600/30"
          >
            <Package className="w-4 h-4" />
            Suivre ma commande
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3.5 px-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-xl transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </m.div>

      </div>
    </div>
  );
}
