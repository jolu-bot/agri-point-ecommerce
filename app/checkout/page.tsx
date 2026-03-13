'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Check, CreditCard, Truck, User, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import CampostPaymentInfo from '@/components/shared/CampostPaymentInfo';
import WhatsAppPaymentInfo from '@/components/shared/WhatsAppPaymentInfo';
import { useLanguage } from '@/contexts/LanguageContext';
import Breadcrumb from '@/components/shared/Breadcrumb';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { locale, T } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Promo code
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoCode, setPromoCode] = useState<any>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'campost' as 'campost' | 'cash' | 'whatsapp',
  });

  const cities = [
    'Yaoundé',
    'Douala',
    'Bafoussam',
    'Garoua',
    'Bamenda',
    'Maroua',
    'Ngaoundéré',
    'Bertoua',
    'Buea',
    'Limbe',
  ];

  const regions = [
    'Centre',
    'Littoral',
    'Ouest',
    'Nord',
    'Nord-Ouest',
    'Extrême-Nord',
    'Adamaoua',
    'Est',
    'Sud-Ouest',
    'Sud',
  ];

  useEffect(() => {
    if (items.length === 0) {
      router.push('/panier');
    }

    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    if (token) {
      loadUserInfo(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserInfo = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        }));
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.promoPrice || item.price;
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 50000 ? 0 : 2500;
  const discountedSubtotal = subtotal - promoDiscount;
  const total = discountedSubtotal + shipping;

  const validatePromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError(locale === 'en' ? 'Enter a promo code' : 'Entrez un code promo');
      return;
    }

    setValidatingPromo(true);
    setPromoError('');

    try {
      const response = await fetch(`/api/promo-codes?code=${promoCodeInput}&orderTotal=${subtotal}`);
      const data = await response.json();

      if (data.valid) {
        setPromoCode(data.promo);
        setPromoDiscount(data.discount);
        toast.success(
          locale === 'en'
            ? `Code "${promoCodeInput}" applied! -${data.discount.toLocaleString()} FCFA`
            : `Code "${promoCodeInput}" appliqué ! -${data.discount.toLocaleString()} FCFA`
        );
        setPromoCodeInput('');
      } else {
        const msg = data.message || (locale === 'en' ? 'Invalid promo code' : 'Code promo invalide');
        setPromoError(msg);
        toast.error(msg);
      }
    } catch (error) {
      console.error('Erreur validation promo:', error);
      const msg = locale === 'en' ? 'Validation error' : 'Erreur lors de la validation';
      setPromoError(msg);
      toast.error(msg);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        toast.error(
          locale === 'en'
            ? 'Please log in to place an order'
            : 'Veuillez vous connecter pour passer commande'
        );
        router.push('/auth/login?redirect=/checkout');
        return;
      }

      const orderData = {
        items: items.map(item => ({
          product: item.id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          price: item.promoPrice || item.price,
          total: (item.promoPrice || item.price) * item.quantity,
        })),
        subtotal,
        discount: promoDiscount,
        shipping,
        total,
        promoCode: promoCode?.code || null,
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          region: formData.region,
          country: 'Cameroun',
          postalCode: formData.postalCode || '',
          notes: formData.notes || '',
        },
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        clearCart();
        toast.success(
          locale === 'en' ? 'Order placed successfully!' : 'Commande passée avec succès !'
        );

        if (formData.paymentMethod === 'campost' || formData.paymentMethod === 'whatsapp') {
          router.push(`/commande/confirmation/${data.order._id}`);
        } else {
          router.push(`/commande/${data.order._id}`);
        }
      } else {
        const error = await response.json();
        toast.error(
          error.error || (locale === 'en' ? 'Order error' : 'Erreur lors de la commande')
        );
      }
    } catch (error) {
      console.error('Erreur commande:', error);
      toast.error(locale === 'en' ? 'Server error' : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: locale === 'en' ? 'Information' : 'Informations', icon: User },
    { number: 2, title: locale === 'en' ? 'Delivery' : 'Livraison', icon: Truck },
    { number: 3, title: locale === 'en' ? 'Payment' : 'Paiement', icon: CreditCard },
  ];

  const paymentMethods = [
    {
      value: 'campost',
      label: locale === 'en' ? '🏢 Campost (Recommended)' : '🏢 Campost (Recommandé)',
      description:
        locale === 'en'
          ? 'Transfer to the nearest Campost office – AGRIPOINT SERVICES account'
          : 'Versement au bureau Campost le plus proche - Compte AGRIPOINT SERVICES',
      recommended: true,
    },
    {
      value: 'whatsapp',
      label: '📱 Mobile Money + WhatsApp',
      description:
        locale === 'en'
          ? 'Orange/MTN payment with quick confirmation (2h)'
          : 'Paiement Orange/MTN avec confirmation rapide (2h)',
      badge: locale === 'en' ? 'Fast' : 'Rapide',
    },
    {
      value: 'cash',
      label: locale === 'en' ? '💵 Cash on delivery' : '💵 Paiement à la livraison',
      description:
        locale === 'en' ? 'Pay in cash on receipt' : 'Payez en espèces à la réception',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: locale === 'en' ? 'Cart' : 'Panier', href: '/panier' },
            { label: locale === 'en' ? 'Order' : 'Commande' },
          ]}
          className="mb-6"
        />

        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{locale === 'en' ? 'Back to cart' : 'Retour au panier'}</span>
        </button>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {locale === 'en' ? 'Place your order' : 'Finaliser la commande'}
        </h1>

        {/* Auth warning */}
        {!isAuthenticated && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <User className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">
              {locale === 'en'
                ? 'You need to be logged in to confirm your order.'
                : 'Vous devez être connecté pour valider votre commande.'}
            </p>
            <a
              href={`/auth/login?redirect=/checkout`}
              className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {locale === 'en' ? 'Log in' : 'Se connecter'}
            </a>
          </div>
        )}

        {/* Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive || isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 transition-colors ${
                        currentStep > step.number
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              {/* Step 1: Personal information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {locale === 'en' ? 'Your information' : 'Vos informations'}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {locale === 'en' ? 'Full name *' : 'Nom complet *'}
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Jean Dupont"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="jean@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {locale === 'en' ? 'Phone *' : 'Téléphone *'}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="+237 6XX XX XX XX"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Delivery address */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {locale === 'en' ? 'Delivery address' : 'Adresse de livraison'}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {locale === 'en' ? 'Full address *' : 'Adresse complète *'}
                      </label>
                      <input
                        type="text"
                        id="street"
                        required
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="123 Avenue de la Réunification"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {locale === 'en' ? 'City *' : 'Ville *'}
                        </label>
                        <select
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">
                            {locale === 'en' ? 'Select a city' : 'Sélectionnez une ville'}
                          </option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {locale === 'en' ? 'Region *' : 'Région *'}
                        </label>
                        <select
                          id="region"
                          required
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">
                            {locale === 'en' ? 'Select a region' : 'Sélectionnez une région'}
                          </option>
                          {regions.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {locale === 'en' ? 'Postal code (optional)' : 'Code postal (optionnel)'}
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="00000"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {locale === 'en' ? 'Delivery instructions (optional)' : 'Instructions de livraison (optionnel)'}
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={
                          locale === 'en'
                            ? 'Landmark, access code, etc.'
                            : "Point de repère, code d'accès, etc."
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {locale === 'en' ? 'Payment method' : 'Mode de paiement'}
                  </h2>

                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.value}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                          formData.paymentMethod === method.value
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : method.recommended
                            ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 hover:border-emerald-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                        }`}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'campost' | 'cash' | 'whatsapp' })}
                            className="mt-1"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {method.label}
                              </div>
                              {method.recommended && (
                                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
                                  {locale === 'en' ? 'Recommended' : 'Recommandé'}
                                </span>
                              )}
                              {(method as any).badge && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                                  {(method as any).badge}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {formData.paymentMethod === 'campost' && (
                    <div className="mt-4">
                      <CampostPaymentInfo variant="compact" />
                    </div>
                  )}

                  {formData.paymentMethod === 'whatsapp' && (
                    <div className="mt-4">
                      <WhatsAppPaymentInfo variant="compact" />
                    </div>
                  )}
                </motion.div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {locale === 'en' ? 'Previous' : 'Précédent'}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {locale === 'en' ? 'Processing...' : 'Traitement...'}
                    </span>
                  ) : currentStep === 3 ? (
                    locale === 'en' ? 'Confirm order' : 'Confirmer la commande'
                  ) : (
                    locale === 'en' ? 'Continue' : 'Continuer'
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {locale === 'en' ? 'Order summary' : 'Récapitulatif'}
                </h3>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {locale === 'en' ? 'Qty: ' : 'Qté: '}{item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {((item.promoPrice || item.price) * item.quantity).toLocaleString()} FCFA
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {/* Promo Code */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder={locale === 'en' ? 'Promo code (optional)' : 'Code promo (optionnel)'}
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && validatePromoCode()}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={validatePromoCode}
                        disabled={validatingPromo || !promoCodeInput.trim()}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        {validatingPromo ? '...' : (locale === 'en' ? 'Apply' : 'Appliquer')}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-red-600 dark:text-red-400 text-xs">{promoError}</p>
                    )}
                    {promoCode && (
                      <p className="text-green-600 dark:text-green-400 text-xs">
                        ✓ Code &ldquo;{promoCode.code}&rdquo; {locale === 'en' ? 'applied!' : 'appliqué !'}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{T.cart.subtotal}</span>
                    <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                      <span>{locale === 'en' ? 'Discount' : 'Réduction'}</span>
                      <span>-{promoDiscount.toLocaleString()} FCFA</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{T.cart.shipping}</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          {locale === 'en' ? 'FREE' : 'GRATUITE'}
                        </span>
                      ) : (
                        `${shipping.toLocaleString()} FCFA`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span>{T.cart.total}</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      {total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
