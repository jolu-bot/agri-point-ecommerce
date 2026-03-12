'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroSlideshow from '@/components/home/HeroSlideshow';
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
  Users,
  CheckCircle,
  Archive,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Contenu modifiable facilement
const GAGNER_PLUS_IMAGES = [
  '/images/gagner-plus/gagner-plus-1.webp',
  '/images/gagner-plus/gagner-plus-2.webp',
  '/images/gagner-plus/gagner-plus-3.webp',
  '/images/gagner-plus/gagner-plus-4.webp',
  '/images/gagner-plus/gagner-plus-5.webp',
];

const pageContent = {
  hero: {
    badge: "Programme Gagner Plus",
    title: "Gagner Plus",
    subtitle: "Maximisez vos revenus agricoles",
    description: "Les débouchés, les prix bien négociés et l'appui à la commercialisation de vos produits. Un accompagnement complet pour transformer votre activité.",
    cta: {
      primary: "Calculer mon potentiel",
      secondary: "Découvrir les services"
    }
  },
  
  stats: [
    { value: "6", label: "Services d'appui", icon: TrendingUp },
    { value: "-60%", label: "Coûts optimisés", icon: Percent },
    { value: "6 mois", label: "ROI moyen", icon: Clock },
    { value: "10K+", label: "Producteurs visés", icon: Users }
  ],

  services: [
    {
      title: "Recherche de partenaires commerciaux",
      description: "Mise en relation avec des acheteurs fiables, négociants et marchés locaux, régionaux et internationaux pour écouler votre production.",
      icon: Users,
    },
    {
      title: "Négociation des prix",
      description: "Accompagnement à la négociation pour obtenir les meilleurs prix de vente. Veille des marchés et stratégie de commercialisation.",
      icon: DollarSign,
    },
    {
      title: "Warrantage",
      description: "Stockage sécurisé des récoltes après production pour vendre au meilleur moment. Accès au crédit garanti par les stocks.",
      icon: PiggyBank,
    },
    {
      title: "Formation en gestion financière",
      description: "Maîtrisez la gestion de vos revenus, l'épargne et la planification financière de votre exploitation.",
      icon: Calculator,
    },
    {
      title: "Montage de plans d'affaires",
      description: "Accompagnement au montage de business plans solides pour structurer et développer votre activité.",
      icon: Target,
    },
    {
      title: "Appui à la recherche de financement",
      description: "Identification des sources de financement, aide à la constitution des dossiers et mise en relation avec les institutions financières.",
      icon: TrendingUp,
    },
  ],

  benefits: [
    {
      title: "Réduction des charges opérationnelles",
      description: "Coût de production allégé au lancement de votre activité avec la possibilité de payer des intrants en phases : 70% comptant et 30% après récolte (réservé aux membres des CMA).",
      icon: PiggyBank,
      color: "blue",
      savings: "-60%",
      image: "/products/icon-anti-stress.png"
    },
    {
      title: "Revenus multipliés",
      description: "Prix de vente supérieurs grâce à la négociation collective. Rendements améliorés et meilleure commercialisation.",
      icon: DollarSign,
      color: "green",
      savings: "+200%",
      image: "/products/icon-croissance-fruits.png"
    },
    {
      title: "Accès aux marchés",
      description: "Mise en relation avec des acheteurs fiables. Contrats sécurisés et accès à de nouveaux débouchés commerciaux.",
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
    },
    {
      title: "Réduction des pertes post-récolte",
      description: "Conseils en stockage, conservation et conditionnement pour limiter les pertes après récolte et valoriser au maximum votre production.",
      icon: Archive,
      color: "orange",
      savings: "-40%",
      image: "/products/icon-anti-stress.png"
    },
    {
      title: "Transformation primaire",
      description: "Appui à la transformation de vos produits agricoles (séchage, décorticage, broyage) pour augmenter leur valeur ajoutée avant la commercialisation.",
      icon: Zap,
      color: "teal",
      savings: "+80%",
      image: "/products/icon-croissance-fruits.png"
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
      quote: "Grâce à l'accompagnement à la commercialisation et la négociation des prix, mes revenus ont triplé en une saison."
    },
    {
      name: "Célestine Mballa",
      location: "Yaoundé, Centre",
      culture: "Maraîchage",
      before: "300 000 FCFA/mois",
      after: "950 000 FCFA/mois",
      increase: "+217%",
      image: "/images/success-2.jpg",
      quote: "Le warrantage m'a permis de vendre au bon moment. Je fournis maintenant les grands restaurants."
    },
    {
      name: "Joseph Talla",
      location: "Bafoussam, Ouest",
      culture: "Café Arabica",
      before: "2 000 000 FCFA/an",
      after: "6 500 000 FCFA/an",
      increase: "+225%",
      image: "/images/success-3.jpg",
      quote: "L'appui au montage de mon plan d'affaires m'a ouvert l'accès au financement. Mon activité s'est transformée."
    }
  ],

  pricingStrategies: {
    title: "Stratégies d'Accompagnement",
    strategies: [
      {
        title: "Commercialisation Groupée",
        description: "Vendez mieux en vous regroupant pour négocier des volumes",
        features: [
          "Négociation collective des prix",
          "Accès marchés de gros",
          "Logistique organisée",
          "Mise en relation acheteurs"
        ]
      },
      {
        title: "Warrantage & Stockage",
        description: "Stockez et vendez au meilleur moment pour optimiser vos marges",
        features: [
          "Stockage sécurisé",
          "Crédit garanti sur stock",
          "Veille des prix marchés",
          "Conseil en timing de vente"
        ]
      },
      {
        title: "Financement & Business Plan",
        description: "Structurez votre activité pour accéder aux financements",
        features: [
          "Montage plans d'affaires",
          "Recherche de financement",
          "Gestion financière",
          "Accompagnement bancaire"
        ]
      }
    ]
  }
};

export default function GagnerPlusPage() {
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
    calculatePotential();
  }, [calculatePotential]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
  };

  const { locale, T } = useLanguage();

  const statLabels = locale === 'en'
    ? ['Support services', 'Optimized costs', 'Average ROI', 'Target producers']
    : ["Services d'appui", 'Co\u00fbts optimis\u00e9s', 'ROI moyen', 'Producteurs vis\u00e9s'];

  const serviceTitles = locale === 'en'
    ? ['Commercial partner search', 'Price negotiation', 'Warehousing (Warrantage)', 'Financial management training', 'Business plan development', 'Financing support']
    : ['Recherche de partenaires commerciaux', 'N\u00e9gociation des prix', 'Warrantage', 'Formation en gestion financi\u00e8re', "Montage de plans d'affaires", 'Appui \u00e0 la recherche de financement'];

  const serviceDescs = locale === 'en'
    ? [
        'Connecting with reliable buyers, traders, and local, regional, and international markets to sell your production.',
        'Support for negotiation to obtain the best selling prices. Market monitoring and commercialization strategy.',
        'Secure post-harvest crop storage to sell at the right time. Access to credit backed by stock.',
        'Master the management of your income, savings, and financial planning for your farm.',
        'Support for developing solid business plans to structure and grow your activity.',
        'Identification of funding sources, assistance with applications and connections with financial institutions.',
      ]
    : [
        "Mise en relation avec des acheteurs fiables, n\u00e9gociants et march\u00e9s locaux, r\u00e9gionaux et internationaux pour \u00e9couler votre production.",
        "Accompagnement \u00e0 la n\u00e9gociation pour obtenir les meilleurs prix de vente. Veille des march\u00e9s et strat\u00e9gie de commercialisation.",
        "Stockage s\u00e9curis\u00e9 des r\u00e9coltes apr\u00e8s production pour vendre au meilleur moment. Acc\u00e8s au cr\u00e9dit garanti par les stocks.",
        "Ma\u00eetrisez la gestion de vos revenus, l'\u00e9pargne et la planification financi\u00e8re de votre exploitation.",
        "Accompagnement au montage de business plans solides pour structurer et d\u00e9velopper votre activit\u00e9.",
        "Identification des sources de financement, aide \u00e0 la constitution des dossiers et mise en relation avec les institutions financi\u00e8res.",
      ];

  const benefitTitles = locale === 'en'
    ? ['Reduction of operational costs', 'Multiplied income', 'Market access', 'Fast ROI', 'Reduction of post-harvest losses', 'Primary transformation']
    : ['R\u00e9duction des charges op\u00e9rationnelles', 'Revenus multipli\u00e9s', 'Acc\u00e8s aux march\u00e9s', 'ROI rapide', 'R\u00e9duction des pertes post-r\u00e9colte', 'Transformation primaire'];

  const benefitDescs = locale === 'en'
    ? [
        'Reduced production costs at launch with the option to pay for inputs in phases: 70% upfront and 30% after harvest (reserved for CMA members).',
        'Higher selling prices thanks to collective negotiation. Improved yields and better commercialization.',
        'Connecting with reliable buyers. Secured contracts and access to new commercial markets.',
        'Investment paid back within 6 months. Profits from the first harvest. Financial support available.',
        'Advice on storage, conservation, and packaging to minimize post-harvest losses.',
        'Support for the transformation of your agricultural products (drying, husking, grinding) to increase added value.',
      ]
    : pageContent.benefits.map(b => b.description);

  const strategyTitles = locale === 'en'
    ? ['Group Marketing', 'Warehousing & Storage', 'Financing & Business Plan']
    : ['Commercialisation Group\u00e9e', 'Warrantage & Stockage', 'Financement & Business Plan'];

  const strategyDescs = locale === 'en'
    ? ['Sell better by grouping together to negotiate volumes', 'Store and sell at the right time to optimize your margins', 'Structure your activity to access financing']
    : ['Vendez mieux en vous regroupant pour n\u00e9gocier des volumes', 'Stockez et vendez au meilleur moment pour optimiser vos marges', "Structurez votre activit\u00e9 pour acc\u00e9der aux financements"];

  const strategyFeaturesList = locale === 'en'
    ? [
        ['Collective price negotiation', 'Access to wholesale markets', 'Organized logistics', 'Buyer connections'],
        ['Secure storage', 'Credit backed by stock', 'Market price monitoring', 'Sale timing advice'],
        ['Business plan development', 'Financing search', 'Financial management', 'Banking support'],
      ]
    : [
        ['N\u00e9gociation collective des prix', 'Acc\u00e8s march\u00e9s de gros', 'Logistique organis\u00e9e', 'Mise en relation acheteurs'],
        ['Stockage s\u00e9curis\u00e9', 'Cr\u00e9dit garanti sur stock', 'Veille des prix march\u00e9s', 'Conseil en timing de vente'],
        ["Montage plans d'affaires", 'Recherche de financement', 'Gestion financi\u00e8re', 'Accompagnement bancaire'],
      ];

  const cultureLabels: Record<string, string> = locale === 'en'
    ? { 'maïs': 'Maize', 'tomate': 'Tomato', 'cacao': 'Cocoa', 'haricot': 'Bean', 'oignon': 'Onion' }
    : { 'maïs': 'Maïs', 'tomate': 'Tomate', 'cacao': 'Cacao', 'haricot': 'Haricot', 'oignon': 'Oignon' };

  const storiesDisplay = locale === 'en'
    ? [
        {
          ...pageContent.successStories[0],
          culture: 'Onion',
          quote: 'Thanks to support with marketing and price negotiation, my income tripled in one season.',
        },
        {
          ...pageContent.successStories[1],
          culture: 'Market gardening',
          quote: 'Warehousing allowed me to sell at the right time. I now supply the best restaurants.',
        },
        {
          ...pageContent.successStories[2],
          culture: 'Arabica Coffee',
          quote: 'The support in developing my business plan gave me access to financing. My business has transformed.',
        },
      ]
    : pageContent.successStories;

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
              className="lg:h-[500px] flex flex-col justify-center"
            >
              <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-5">
                {T.gagnerPlus.heroBadge}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {T.gagnerPlus.heroTitle}
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-5 leading-snug">
                {T.gagnerPlus.heroSubtitle}
              </p>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {T.gagnerPlus.heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#calculateur" 
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <Calculator className="w-5 h-5" />
                  {T.gagnerPlus.heroCta1}
                </a>
                <Link
                  href="/contact"
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {T.common.moreInfo}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <HeroSlideshow
                  images={GAGNER_PLUS_IMAGES}
                  alt="Gagner Plus"
                  objectFit="cover"
                  interval={4000}
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
                <div className="text-sm text-gray-600 dark:text-gray-400">{statLabels[index]}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Services d'appui */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4"><span className="text-red-500">{T.gagnerPlus.servicesTitle}</span> {T.gagnerPlus.servicesTitleHL}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.gagnerPlus.servicesSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageContent.services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{serviceTitles[index]}</h3>
                <p className="text-gray-600 dark:text-gray-300">{serviceDescs[index]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{T.gagnerPlus.benefitsTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.gagnerPlus.benefitsSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{benefitTitles[index]}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefitDescs[index]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculateur" className="py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{T.gagnerPlus.calcTitle}</h2>
            <p className="text-xl opacity-90">{T.gagnerPlus.calcSubtitle}</p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-2">{T.gagnerPlus.calcSurface}</label>
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
                <label className="block text-sm font-semibold mb-2">{T.gagnerPlus.calcCulture}</label>
                <select
                  value={calcValues.culture}
                  onChange={(e) => setCalcValues({...calcValues, culture: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                  aria-label="Type de culture"
                >
                  {pageContent.calculator.cultures.map(c => (
                    <option key={c.value} value={c.value}>{cultureLabels[c.value] ?? c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">{T.gagnerPlus.calcYield}</label>
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
                <label className="block text-sm font-semibold mb-2">{T.gagnerPlus.calcPrice}</label>
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
                <p className="text-sm text-gray-600 mb-2">{T.gagnerPlus.calcCurrent}</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(calcResults.current)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{T.gagnerPlus.calcPotential}</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(calcResults.potential)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{T.gagnerPlus.calcGain}</p>
                <p className="text-3xl font-bold text-blue-600">+{formatCurrency(calcResults.gain)}</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                {T.gagnerPlus.calcCta}
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
            <h2 className="text-4xl font-bold mb-4">{T.gagnerPlus.storiesTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.gagnerPlus.storiesSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {storiesDisplay.map((story, index) => (
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
                    <p className="text-xs text-gray-500 mb-1">{T.common.before}</p>
                      <p className="font-semibold text-red-600">{story.before}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{T.common.after}</p>
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
            <h2 className="text-4xl font-bold mb-4">{T.gagnerPlus.strategiesTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.gagnerPlus.strategiesSubtitle}</p>
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
                <h3 className="text-2xl font-bold mb-3">{strategyTitles[index]}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{strategyDescs[index]}</p>
                <ul className="space-y-3">
                  {strategyFeaturesList[index].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">{T.gagnerPlus.ctaTitle}</h2>
          <p className="text-xl mb-8 opacity-90">
            {T.gagnerPlus.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold transition-all"
            >
              {T.gagnerPlus.ctaContact}
            </Link>
            <Link
              href="/produits"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-lg font-semibold transition-all"
            >
              {T.gagnerPlus.ctaOffers}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
