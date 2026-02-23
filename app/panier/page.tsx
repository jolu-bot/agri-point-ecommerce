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
          {/* ── Cart Items ── */}
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

          {/* ── Order Summary ── */}
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
                  {['MTN Money', 'Orange Money', 'Cash'].map((m) => (
                    <span key={m} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700">
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

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  const subtotal = items.reduce((sum, item) => {
    const price = item.promoPrice || item.price;
    return sum + (price * item.quantity);
  }, 0);

  const shippingCost = subtotal > 50000 ? 0 : 2500;
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const total = subtotal + shippingCost - promoDiscount;

  const handleApplyPromo = () => {
    // Codes promo de démonstration
    const promoCodes: { [key: string]: number } = {
      'AGRI10': 10,
      'WELCOME': 5,
      'SAVE20': 20,
    };

    const discount = promoCodes[promoCode.toUpperCase()];
    
    if (discount) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount });
      toast.success(`Code promo ${promoCode.toUpperCase()} appliqué ! -${discount}%`);
    } else {
      toast.error('Code promo invalide');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast.success('Code promo retiré');
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) {
      return;
    }
    
    if (newQuantity > maxStock) {
      toast.error(`Seulement ${maxStock} disponible(s)`);
      return;
    }

    updateQuantity(itemId, newQuantity);
  };

  const handleClearCart = () => {
    if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
      clearCart();
      toast.success('Panier vidé');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>Voir nos produits</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Continuer les achats</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Panier
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {items.length} article{items.length > 1 ? 's' : ''} dans votre panier
              </p>
            </div>

            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
            >
              Vider le panier
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <Link
                      href={`/produits/${item.slug}`}
                      className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🌱
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/produits/${item.slug}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Stock: {item.maxStock} disponible{item.maxStock > 1 ? 's' : ''}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-4"
                          aria-label="Supprimer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.maxStock)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.maxStock)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          {item.promoPrice && item.promoPrice < item.price ? (
                            <>
                              <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                {(item.price * item.quantity).toLocaleString()} FCFA
                              </div>
                              <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                {(item.promoPrice * item.quantity).toLocaleString()} FCFA
                              </div>
                            </>
                          ) : (
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {(item.price * item.quantity).toLocaleString()} FCFA
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Récapitulatif
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code promo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="AGRI10"
                    disabled={!!appliedPromo}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                  {appliedPromo ? (
                    <button
                      onClick={handleRemovePromo}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Retirer
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Appliquer
                    </button>
                  )}
                </div>
                {appliedPromo && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    ✓ Code {appliedPromo.code} appliqué (-{appliedPromo.discount}%)
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Codes: AGRI10, WELCOME, SAVE20
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Réduction ({appliedPromo.discount}%)</span>
                    <span className="font-semibold">-{promoDiscount.toLocaleString()} FCFA</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Livraison</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400">GRATUITE</span>
                    ) : (
                      `${shippingCost.toLocaleString()} FCFA`
                    )}
                  </span>
                </div>

                {subtotal < 50000 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Plus que {(50000 - subtotal).toLocaleString()} FCFA pour la livraison gratuite
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {total.toLocaleString()} FCFA
                </span>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors text-lg"
              >
                <span>Passer commande</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/produits"
                className="block text-center mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Continuer mes achats
              </Link>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Paiement sécurisé
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                    MTN Mobile Money
                  </div>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                    Orange Money
                  </div>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                    Cash
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
