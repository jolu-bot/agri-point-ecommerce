'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Minus, Plus, X, ArrowRight, Package, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

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
