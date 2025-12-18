'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Check, CreditCard, Truck, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Informations client
    name: '',
    email: '',
    phone: '',
    
    // Adresse de livraison
    street: '',
    city: '',
    region: '',
    postalCode: '',
    notes: '',
    
    // Paiement
    paymentMethod: 'cash' as 'cash' | 'mtn' | 'orange' | 'stripe',
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

    // Charger les infos utilisateur si connecté
    const token = localStorage.getItem('accessToken');
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
  const total = subtotal + shipping;

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
        toast.error('Veuillez vous connecter pour passer commande');
        router.push('/auth/login?redirect=/checkout');
        return;
      }

      // Créer la commande
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
        shipping,
        total,
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
        toast.success('Commande passée avec succès !');
        router.push(`/commande/${data.order._id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la commande');
      }
    } catch (error) {
      console.error('Erreur commande:', error);
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Informations', icon: User },
    { number: 2, title: 'Livraison', icon: Truck },
    { number: 3, title: 'Paiement', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour au panier</span>
        </button>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Finaliser la commande
        </h1>

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
              {/* Step 1: Informations personnelles */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Vos informations
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom complet *
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
                        Téléphone *
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

              {/* Step 2: Adresse de livraison */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Adresse de livraison
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Adresse complète *
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
                          Ville *
                        </label>
                        <select
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Sélectionnez une ville</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Région *
                        </label>
                        <select
                          id="region"
                          required
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Sélectionnez une région</option>
                          {regions.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code postal (optionnel)
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
                        Instructions de livraison (optionnel)
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Point de repère, code d'accès, etc."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Paiement */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Mode de paiement
                  </h2>

                  <div className="space-y-4">
                    {[
                      { value: 'cash', label: 'Paiement à la livraison', description: 'Payez en espèces à la réception' },
                      { value: 'mtn', label: 'MTN Mobile Money', description: 'Paiement mobile avec MTN' },
                      { value: 'orange', label: 'Orange Money', description: 'Paiement mobile avec Orange' },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.paymentMethod === method.value
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                        }`}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'mtn' | 'orange' | 'stripe' })}
                            className="mt-1"
                          />
                          <div className="ml-3">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {method.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
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
                    Précédent
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
                      Traitement...
                    </span>
                  ) : currentStep === 3 ? (
                    'Confirmer la commande'
                  ) : (
                    'Continuer'
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Récapitulatif
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
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🌱
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Qté: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {((item.promoPrice || item.price) * item.quantity).toLocaleString()} FCFA
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sous-total</span>
                    <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Livraison</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400">GRATUITE</span>
                      ) : (
                        `${shipping.toLocaleString()} FCFA`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
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
