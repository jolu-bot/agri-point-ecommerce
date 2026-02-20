'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp,
  PiggyBank,
  Calculator,
  Target,
  ArrowRight,
  Percent,
  Clock,
  Users
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/models/Product';

// Contenu modifiable facilement
const pageContent = {
  hero: {
    badge: "💰 Rentabilité Maximale Garantie",
    title: "GAGNER PLUS",
    subtitle: "Triplez vos bénéfices agricoles",
    description: "Transformez votre activité agricole en entreprise rentable. Réduisez vos coûts de 60%, augmentez vos revenus de 200% et accédez à des marchés premium.",
    cta: {
      primary: "Calculer mon potentiel",
      secondary: "Voir les solutions"
    }
  },
  
  stats: [
    { value: "+200%", label: "Revenus moyens", icon: TrendingUp },
    { value: "-60%", label: "Coûts de production", icon: Percent },
    { value: "6 mois", label: "ROI moyen", icon: Clock },
    { value: "15K+", label: "Agriculteurs enrichis", icon: Users }
  ],

  benefits: [
    {
      title: "Réduction drastique des coûts",
      description: "Économisez 60% sur les engrais chimiques. Réduisez vos besoins en eau de 50%. Moins de traitements phytosanitaires nécessaires.",
      icon: PiggyBank,
      color: "blue",
      savings: "-60%",
      image: "/products/icon-anti-stress.png"
    },
    {
      title: "Revenus multipliés",
      description: "Prix de vente supérieurs grâce au label BIO. Rendements doublés ou triplés. Deux à trois récoltes par an au lieu d'une.",
      icon: DollarSign,
      color: "green",
      savings: "+200%",
      image: "/products/icon-croissance-fruits.png"
    },
    {
      title: "Accès aux marchés premium",
      description: "Certification bio facilitée. Contrats avec acheteurs internationaux. Exportation vers l'Europe et l'Amérique du Nord.",
      icon: Target,
      color: "purple",
      savings: "x3",
      image: "/products/icon-floraison.png"
    },
    {
      title: "ROI rapide",
      description: "Investissement rentabilisé en 6 mois. Bénéfices dès la première récolte. Accompagnement financier disponible.",
      icon: TrendingUp,
      color: "amber",
      savings: "6 mois",
      image: "/products/icon-feuillage.png"
    }
  ],

  calculator: {
    title: "Calculez Votre Potentiel de Gains",
    subtitle: "Simulation basée sur les résultats réels de nos clients",
    defaultValues: {
      surface: 1,
      culture: "maïs",
      rendementActuel: 2,
      prixVente: 150
    },
    cultures: [
      { value: "maïs", label: "Maïs", boost: 120 },
      { value: "tomate", label: "Tomate", boost: 150 },
      { value: "cacao", label: "Cacao", boost: 100 },
      { value: "haricot", label: "Haricot", boost: 140 },
      { value: "oignon", label: "Oignon", boost: 130 }
    ]
  },

  successStories: [
    {
      name: "Ibrahim Mahamat",
      location: "Garoua, Nord",
      culture: "Oignon",
      before: "500 000 FCFA/an",
      after: "1 800 000 FCFA/an",
      increase: "+260%",
      image: "/images/success-1.jpg",
      quote: "J'ai triplé mes revenus en une seule saison. Mes oignons sont vendus 50% plus cher grâce à leur qualité."
    },
    {
      name: "Célestine Mballa",
      location: "Yaoundé, Centre",
      culture: "Maraîchage",
      before: "300 000 FCFA/mois",
      after: "950 000 FCFA/mois",
      increase: "+217%",
      image: "/images/success-2.jpg",
      quote: "Je fournis maintenant les grands restaurants et hôtels. Ma production bio se vend comme des petits pains."
    },
    {
      name: "Joseph Talla",
      location: "Bafoussam, Ouest",
      culture: "Café Arabica",
      before: "2 000 000 FCFA/an",
      after: "6 500 000 FCFA/an",
      increase: "+225%",
      image: "/images/success-3.jpg",
      quote: "Mon café est exporté en Europe. Le label bio m'a ouvert les portes du marché international."
    }
  ],

  pricingStrategies: {
    title: "Stratégies de Monétisation",
    strategies: [
      {
        title: "Production BIO Premium",
        description: "Vendez 40-60% plus cher avec la certification biologique",
        features: [
          "Accompagnement certification",
          "Accès marchés premium",
          "Formation commerciale",
          "Mise en relation acheteurs"
        ]
      },
      {
        title: "Vente Directe",
        description: "Supprimez les intermédiaires et gardez 100% de la marge",
        features: [
          "Plateforme en ligne",
          "Réseau de clients directs",
          "Livraison organisée",
          "Paiement sécurisé"
        ]
      },
      {
        title: "Cultures à Haute Valeur",
        description: "Orientez-vous vers les cultures les plus rentables",
        features: [
          "Analyse de marché",
          "Conseil en diversification",
          "Accès semences premium",
          "Techniques spécialisées"
        ]
      }
    ]
  }
};

export default function GagnerPlusPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [calcValues, setCalcValues] = useState(pageContent.calculator.defaultValues);
  const [calcResults, setCalcResults] = useState({ current: 0, potential: 0, gain: 0 });

  const calculatePotential = useCallback(() => {
    const culture = pageContent.calculator.cultures.find(c => c.value === calcValues.culture);
    const boost = culture?.boost || 100;
    
    const currentRevenue = calcValues.surface * calcValues.rendementActuel * calcValues.prixVente * 1000;
    const potentialRevenue = currentRevenue * (1 + boost / 100);
    const gain = potentialRevenue - currentRevenue;

    setCalcResults({
      current: currentRevenue,
      potential: potentialRevenue,
      gain: gain
    });
  }, [calcValues]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    calculatePotential();
  }, [calculatePotential]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products?.slice(0, 6) || []);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-6">
                {pageContent.hero.badge}
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {pageContent.hero.title}
                <span className="block text-blue-600 dark:text-blue-400 mt-2">
                  {pageContent.hero.subtitle}
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {pageContent.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#calculateur" 
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <Calculator className="w-5 h-5" />
                  {pageContent.hero.cta.primary}
                </a>
                <a 
                  href="#produits" 
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {pageContent.hero.cta.secondary}
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-green-600/20"></div>
                <Image
                  src="/images/gagner-plus-hero.jpg"
                  alt="Agriculteur prospère"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+SsiBHQUdORVIgUExVUzwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {pageContent.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center"
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment Gagner Plus ?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">4 leviers pour multiplier vos revenus</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pageContent.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 hover:shadow-xl transition-all group"
              >
                {/* Badge saving — positionné pour ne pas chevaucher le contenu */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-600 shadow-sm flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-8 h-8 text-green-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-2xl font-black text-green-700 dark:text-emerald-400 ml-2">
                    {benefit.savings}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculateur" className="py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{pageContent.calculator.title}</h2>
            <p className="text-xl opacity-90">{pageContent.calculator.subtitle}</p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-2">Surface cultivée (hectares)</label>
                <input
                  type="number"
                  value={calcValues.surface}
                  onChange={(e) => setCalcValues({...calcValues, surface: Number(e.target.value)})}
                  className="w-full px-4 py-3 border rounded-lg"
                  min="0.1"
                  step="0.1"
                  aria-label="Surface cultivée en hectares"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Type de culture</label>
                <select
                  value={calcValues.culture}
                  onChange={(e) => setCalcValues({...calcValues, culture: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                  aria-label="Type de culture"
                >
                  {pageContent.calculator.cultures.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Rendement actuel (tonnes/ha)</label>
                <input
                  type="number"
                  value={calcValues.rendementActuel}
                  onChange={(e) => setCalcValues({...calcValues, rendementActuel: Number(e.target.value)})}
                  className="w-full px-4 py-3 border rounded-lg"
                  min="0.1"
                  step="0.1"
                  aria-label="Rendement actuel en tonnes par hectare"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Prix de vente (FCFA/kg)</label>
                <input
                  type="number"
                  value={calcValues.prixVente}
                  onChange={(e) => setCalcValues({...calcValues, prixVente: Number(e.target.value)})}
                  className="w-full px-4 py-3 border rounded-lg"
                  min="1"
                  aria-label="Prix de vente en FCFA par kilogramme"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8 pt-8 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Revenu Actuel</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(calcResults.current)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Revenu Potentiel</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(calcResults.potential)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Gain Annuel</p>
                <p className="text-3xl font-bold text-blue-600">+{formatCurrency(calcResults.gain)}</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Histoires de Réussite</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Ils ont transformé leurs revenus avec AGRI POINT</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pageContent.successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative h-48">
                  <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0ODFkZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+JiMxMjgxNjg7ICR7c3RvcnkubmFtZX08L3RleHQ+PC9zdmc+`;
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {story.increase}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{story.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{story.location} • {story.culture}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Avant</p>
                      <p className="font-semibold text-red-600">{story.before}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Après</p>
                      <p className="font-semibold text-green-600">{story.after}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 italic text-sm">&ldquo;{story.quote}&rdquo;</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Strategies */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{pageContent.pricingStrategies.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Maximisez vos marges avec nos accompagnements</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pageContent.pricingStrategies.strategies.map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8"
              >
                <h3 className="text-2xl font-bold mb-3">{strategy.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{strategy.description}</p>
                <ul className="space-y-3">
                  {strategy.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produits" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Solutions Pour Gagner Plus</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Produits rentables sélectionnés pour optimiser vos bénéfices
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              Voir tous les produits
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Commencez à Gagner Plus Dès Aujourd&apos;hui</h2>
          <p className="text-xl mb-8 opacity-90">
            Plus de 15 000 agriculteurs ont déjà multiplié leurs revenus. Rejoignez-les !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold transition-all"
            >
              Consultation gratuite
            </Link>
            <Link
              href="/produits"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-lg font-semibold transition-all"
            >
              Explorer la boutique
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
