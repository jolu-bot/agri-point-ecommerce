'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Minus, Plus, X, ArrowRight, Package, ChevronLeft, Tag, Truck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const FREE_SHIPPING_THRESHOLD = 50000;

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  const subtotal = items.reduce((sum, item) => {
    const price = item.promoPrice || item.price;
    return sum + price * item.quantity;
  }, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 2500;
  const promoDiscount = appliedPromo ? Math.round((subtotal * appliedPromo.discount) / 100) : 0;
  const total = subtotal + shippingCost - promoDiscount;
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleApplyPromo = () => {
    const codes: Record<string, number> = { AGRI10: 10, WELCOME: 5, SAVE20: 20 };
    const discount = codes[promoCode.toUpperCase()];
    if (discount) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount });
      toast.success(`Code ${promoCode.toUpperCase()} appliqué ! -${discount}%`);
    } else {
      toast.error('Code promo invalide');
    }
  };

  const handleUpdateQuantity = (id: string, qty: number, max: number) => {
    if (qty < 1) return;
    if (qty > max) { toast.error(`Seulement ${max} disponible(s)`); return; }
    updateQuantity(id, qty);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 max-w-sm"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Explorez nos produits et ajoutez vos favoris !</p>
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all hover:shadow-emerald-600/30 hover:shadow-lg"
          >
            <Package className="w-5 h-5" />
            Voir nos produits
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-5 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Continuer les achats
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Mon panier</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                {items.length} article{items.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => { if (confirm('Vider le panier ?')) { clearCart(); toast.success('Panier vidé'); } }}
              className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
            >
              Tout supprimer
            </button>
          </div>
        </div>

        {/* Shipping progress */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] p-4 mb-6">
          {subtotal >= FREE_SHIPPING_THRESHOLD ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
              <CheckCircle className="w-5 h-5" />
              🎉 Livraison offerte débloquée !
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Truck className="w-4 h-4" />
                  Livraison gratuite dès {FREE_SHIPPING_THRESHOLD.toLocaleString()} FCFA
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Plus que {remaining.toLocaleString()} FCFA
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Cart Items ─── */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 border-b border-gray-100 dark:border-white/[0.06] last:border-b-0"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link href={`/produits/${item.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-800 dark:to-emerald-950/20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/[0.06]">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🌱</div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Link href={`/produits/${item.slug}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm line-clamp-2">
                            {item.name}
                          </Link>
                          <button
                            onClick={() => { removeItem(item.id); toast.success('Article retiré'); }}
                            aria-label="Supprimer"
                            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {item.promoPrice && item.promoPrice < item.price && (
                          <span className="inline-block px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full mb-2">
                            PROMO
                          </span>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty */}
                          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.maxStock)}
                              aria-label="Diminuer"
                              className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 py-2 min-w-[2.5rem] text-center text-sm font-bold text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.maxStock)}
                              aria-label="Augmenter"
                              className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            {item.promoPrice && item.promoPrice < item.price ? (
                              <>
                                <div className="text-xs text-gray-400 line-through leading-none mb-0.5">
                                  {(item.price * item.quantity).toLocaleString()} FCFA
                                </div>
                                <div className="text-base font-black text-gradient-primary leading-none">
                                  {(item.promoPrice * item.quantity).toLocaleString()} <span className="text-xs">FCFA</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-base font-black text-gray-900 dark:text-white leading-none">
                                {(item.price * item.quantity).toLocaleString()} <span className="text-xs text-gray-500">FCFA</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Order Summary ─── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 sticky top-20">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Récapitulatif</h2>

              {/* Promo code */}
              <div className="mb-5">
                <label htmlFor="promo-code" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Code promo
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="promo-code"
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="AGRI10"
                      disabled={!!appliedPromo}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
                    />
                  </div>
                  {appliedPromo ? (
                    <button
                      onClick={() => { setAppliedPromo(null); setPromoCode(''); }}
                      className="px-3 py-2.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-950/60 transition-colors"
                    >
                      Retirer
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode}
                      className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
                    >
                      OK
                    </button>
                  )}
                </div>
                {appliedPromo && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Code {appliedPromo.code} · -{appliedPromo.discount}%
                  </p>
                )}
              </div>

              {/* Summary lines */}
              <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-white/[0.06] mb-5">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{subtotal.toLocaleString()} FCFA</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Réduction -{appliedPromo.discount}%</span>
                    <span className="font-semibold">-{promoDiscount.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Livraison</span>
                  <span className={`font-semibold ${shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {shippingCost === 0 ? 'GRATUITE 🎉' : `${shippingCost.toLocaleString()} FCFA`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-black text-gradient-primary">{total.toLocaleString()} <span className="text-sm text-emerald-700 dark:text-emerald-400">FCFA</span></span>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all hover:shadow-emerald-600/30 hover:shadow-lg text-sm"
              >
                Passer commande
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link href="/produits" className="block text-center mt-3 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                Continuer mes achats
              </Link>

              {/* Payment methods */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/[0.06]">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 text-center">Modes de paiement acceptés</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['🏢 Campost', '💵 Cash à la livraison'].map((m) => (
                    <span key={m} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
