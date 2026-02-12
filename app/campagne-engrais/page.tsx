'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FileText, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface CampaignData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  startDate: string;
  endDate: string;
  specialPricing: {
    mineralFertilizer: number;
    biofertilizer: number;
  };
  eligibility: {
    requireCooperativeMembership: boolean;
    minQuantity: number;
    requireMutualInsurance: boolean;
    acceptedCooperatives?: string[];
  };
  paymentScheme: {
    enabled: boolean;
    firstPercentage: number;
    secondPercentage: number;
  };
  terms: {
    paymentTerms: string;
    refundPolicy: string;
    contactInfo: string;
    additionalInfo?: string;
  };
}

interface EligibilityForm {
  fullName: string;
  email: string;
  phone: string;
  cooperativeName: string;
  cooperativeEmail: string;
  isMember: boolean;
  hasInsurance: boolean;
  insuranceProvider: string;
  quantity: number;
  productType: 'mineral' | 'bio'; // Type d'engrais
}

export default function CampagnePage() {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<EligibilityForm>({
    fullName: '',
    email: '',
    phone: '',
    cooperativeName: '',
    cooperativeEmail: '',
    isMember: false,
    hasInsurance: false,
    insuranceProvider: '',
    quantity: 6,
    productType: 'mineral',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState<{
    eligible: boolean;
    message: string;
    issues: string[];
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch('/api/campaigns/march-2026');
        if (response.ok) {
          const data = await response.json();
          setCampaign(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la campagne:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : fieldValue,
    }));
  };

  const validateEligibility = () => {
    const issues: string[] = [];

    if (!formData.isMember) {
      issues.push('Vous devez être membre d\'une coopérative agréée');
    }

    if (!formData.hasInsurance) {
      issues.push('Vous devez adhérer à une caisse mutuelle agricole');
    }

    if (campaign && formData.quantity < (campaign.eligibility.minQuantity || 6)) {
      issues.push(`Quantité minimale: ${campaign.eligibility.minQuantity} sacs/litres`);
    }

    const eligible = issues.length === 0;

    setEligibilityStatus({
      eligible,
      message: eligible
        ? '✅ Vous êtes éligible! Proceedez à la commande.'
        : '❌ Vous ne satisfaites pas toutes les conditions.',
      issues,
    });

    return eligible;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEligibility()) {
      return;
    }

    try {
      const response = await fetch('/api/campaigns/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign?._id,
          ...formData,
        }),
      });

      if (response.ok) {
        setFormSubmitted(true);
        setTimeout(() => {
          // Rediriger vers le checkout avec la campagne
          router.push(`/checkout?campaign=${campaign?.slug}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la campagne...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Campagne non trouvée</h1>
          <p className="text-gray-600 mt-2">La campagne engrais Mars 2026 n'est pas disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
        <Image
          src={campaign.heroImage}
          alt={campaign.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 md:px-8 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{campaign.name}</h1>
            <p className="text-green-100 text-lg">{campaign.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        {/* Dates et status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Période</span>
            </div>
            <p className="text-sm">
              {new Date(campaign.startDate).toLocaleDateString('fr-CM')} → {new Date(campaign.endDate).toLocaleDateString('fr-CM')}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold">70 / 30</span>
            </div>
            <p className="text-sm">Paiement échelonné disponible</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold">Mini. {campaign.eligibility.minQuantity} sacs</span>
            </div>
            <p className="text-sm">Quantité minimale requise</p>
          </div>
        </div>

        {/* Tarifs spéciaux */}
        <div className="bg-white rounded-lg border-2 border-green-300 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">💰 Tarifs Spéciaux Campagne</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Engrais Minéraux</h3>
              <p className="text-4xl font-bold text-green-600">{campaign.specialPricing.mineralFertilizer.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-gray-600 mt-2">Par sac de 50kg</p>
              <ul className="mt-4 space-y-1 text-sm text-gray-600">
                <li>✓ Paiement 70/30 disponible</li>
                <li>✓ Livraison gratuite (min. 6 sacs)</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Biofertilisants</h3>
              <p className="text-4xl font-bold text-blue-600">{campaign.specialPricing.biofertilizer.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-gray-600 mt-2">Paiement intégral</p>
              <ul className="mt-4 space-y-1 text-sm text-gray-600">
                <li>✓ Minimum 5 litres</li>
                <li>✓ Livraison comprise</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Conditions d'éligibilité */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Conditions d'Éligibilité</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Être membre d'une coopérative agréée</p>
                <p className="text-sm text-gray-600 mt-1">
                  Justifier votre adhésion à une coopérative de producteurs agraires
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Adhérer à une caisse mutuelle agricole</p>
                <p className="text-sm text-gray-600 mt-1">
                  Assurance (Cican, Camao ou autre organisme agrée)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Commander au minimum {campaign.eligibility.minQuantity} sacs/litres</p>
                <p className="text-sm text-gray-600 mt-1">
                  Quantité minimale pour bénéficier du programme
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'éligibilité */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">✅ Vérifier Votre Éligibilité</h2>

          {formSubmitted ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-green-700">Inscription confirmée!</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Vous allez être redirigé vers le panier pour passer votre commande.
              </p>
              <div className="animate-pulse text-green-600 text-sm">
                Redirection en cours...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Infos Personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom Complet</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john@exemple.cm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
                <div>
                  <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-2">Type d'Engrais</label>
                  <select
                    id="productType"
                    name="productType"
                    value={formData.productType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="mineral">Engrais Minéraux</option>
                    <option value="bio">Biofertilisants</option>
                  </select>
                </div>
              </div>

              {/* Infos Coopérative */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Coopérative</h3>
                
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isMember"
                      checked={formData.isMember}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Je suis membre d'une coopérative agréée</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la Coopérative</label>
                    <input
                      type="text"
                      name="cooperativeName"
                      value={formData.cooperativeName}
                      onChange={handleInputChange}
                      required={formData.isMember}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="COOP Agritech"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Coopérative</label>
                    <input
                      type="email"
                      name="cooperativeEmail"
                      value={formData.cooperativeEmail}
                      onChange={handleInputChange}
                      required={formData.isMember}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="contact@coop.cm"
                    />
                  </div>
                </div>
              </div>

              {/* Assurance */}
              <div className="border-t pt-6">
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasInsurance"
                      checked={formData.hasInsurance}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-700">J'adhère à une caisse mutuelle agricole</span>
                  </label>
                </div>

                {formData.hasInsurance && (
                  <div>
                    <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-2">Organisme d'Assurance</label>
                    <select
                      id="insuranceProvider"
                      name="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="CICAN">CICAN</option>
                      <option value="CAMAO">CAMAO</option>
                      <option value="AUTRE">Autre organisme agrée</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Quantité */}
              <div className="border-t pt-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité ({formData.productType === 'mineral' ? 'sacs' : 'litres'})
                </label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min={campaign.eligibility.minQuantity}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-label="Quantité de produit en sacs ou litres"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: {campaign.eligibility.minQuantity}</p>
              </div>

              {/* Statut d'éligibilité */}
              {eligibilityStatus && (
                <div className={`rounded-lg p-4 ${
                  eligibilityStatus.eligible
                    ? 'bg-green-50 border border-green-500'
                    : 'bg-red-50 border border-red-500'
                }`}>
                  <p className={`font-semibold mb-2 ${eligibilityStatus.eligible ? 'text-green-700' : 'text-red-700'}`}>
                    {eligibilityStatus.message}
                  </p>
                  {eligibilityStatus.issues.length > 0 && (
                    <ul className="space-y-1 text-sm">
                      {eligibilityStatus.issues.map((issue, idx) => (
                        <li key={idx} className={eligibilityStatus.eligible ? 'text-green-600' : 'text-red-600'}>
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Bouton Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Vérifier l'Éligibilité et Passer la Commande
              </button>
            </form>
          )}
        </div>

        {/* Conditions générales */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 Conditions du Programme</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">💳 Modalités de Paiement</h3>
              <p className="text-gray-700">{campaign.terms.paymentTerms}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🔄 Politique de Remboursement</h3>
              <p className="text-gray-700">{campaign.terms.refundPolicy}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">📞 Contact & Support</h3>
              <p className="text-gray-700">{campaign.terms.contactInfo}</p>
            </div>

            {campaign.terms.additionalInfo && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📌 Informations Supplémentaires</h3>
                <p className="text-gray-700">{campaign.terms.additionalInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Bottom */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à Participer?</h2>
          <p className="text-lg mb-6 text-green-100">
            Remplissez le formulaire ci-dessus et commencez à acheter des engrais subventionnés dès aujourd'hui.
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-green-700 font-bold py-3 px-8 rounded-lg hover:bg-green-50 transition-colors"
          >
            S'Inscrire Maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
