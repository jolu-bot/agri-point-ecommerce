'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Sprout, 
  Leaf, 
  Droplets,
  Sun,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/models/Product';
import toast from 'react-hot-toast';

// Contenu modifiable facilement
const pageContent = {
  hero: {
    badge: "🌾 Solution N°1 pour l'Agriculture Performante",
    title: "PRODUIRE PLUS",
    subtitle: "Augmentez vos rendements de 40% à 150%",
    description: "Découvrez nos solutions biofertilisantes révolutionnaires qui transforment radicalement la productivité de vos cultures. Des résultats prouvés sur plus de 20 000 hectares au Cameroun.",
    cta: {
      primary: "Voir nos produits",
      secondary: "Demander un devis"
    }
  },
  
  stats: [
    { value: "+150%", label: "Rendement maximum", icon: TrendingUp },
    { value: "3 mois", label: "Premiers résultats", icon: Zap },
    { value: "20K+", label: "Hectares fertilisés", icon: Target },
    { value: "98%", label: "Taux de satisfaction", icon: Award }
  ],

  benefits: [
    {
      title: "Boostez vos rendements",
      description: "Augmentation de 40% à 150% de la production sur toutes cultures : maïs, tomate, cacao, café, cultures maraîchères.",
      icon: TrendingUp,
      color: "green",
      image: "/products/icon-croissance-fruits.png"
    },
    {
      title: "Qualité supérieure",
      description: "Produits 100% bio, certifiés, sans produits chimiques. Améliorez la qualité nutritive et marchande de vos récoltes.",
      icon: Leaf,
      color: "emerald",
      image: "/products/icon-floraison.png"
    },
    {
      title: "Sol régénéré",
      description: "Régénération complète de la fertilité du sol en 6 mois. Réduction de 60% des besoins en irrigation.",
      icon: Sprout,
      color: "lime",
      image: "/products/icon-feuillage.png"
    },
    {
      title: "Résultats rapides",
      description: "Premiers résultats visibles dès 3 mois. Croissance vigoureuse, feuillage dense, fruits plus gros et nombreux.",
      icon: Zap,
      color: "amber",
      image: "/products/icon-anti-stress.png"
    }
  ],

  howItWorks: {
    title: "Comment ça marche ?",
    subtitle: "Notre approche scientifique en 4 étapes",
    steps: [
      {
        number: "01",
        title: "Diagnostic de votre sol",
        description: "Analyse gratuite de votre terrain pour identifier les carences et besoins spécifiques."
      },
      {
        number: "02",
        title: "Plan de fertilisation personnalisé",
        description: "Notre équipe élabore une stratégie sur mesure adaptée à votre culture et budget."
      },
      {
        number: "03",
        title: "Application des biofertilisants",
        description: "Livraison et accompagnement pour l'application optimale de nos produits bio."
      },
      {
        number: "04",
        title: "Suivi et optimisation",
        description: "Accompagnement continu avec ajustements pour maximiser vos résultats."
      }
    ]
  },

  testimonials: [
    {
      name: "Jean-Paul Ntamack",
      role: "Producteur de Cacao, Région du Sud",
      text: "Mes rendements ont doublé en seulement 8 mois ! La qualité de mes cabosses s'est nettement améliorée. Je recommande vivement AGRI POINT.",
      rating: 5
    },
    {
      name: "Marie Fosso",
      role: "Maraîchère, Douala",
      text: "Mes tomates sont plus grosses, plus savoureuses. Je produis 3 fois plus qu'avant. Merci pour ces produits exceptionnels !",
      rating: 5
    },
    {
      name: "Amadou Bello",
      role: "Riziculteur, Extrême-Nord",
      text: "Le rendement de ma rizière a augmenté de 120%. Mon sol est redevenu fertile. C'est magique !",
      rating: 5
    }
  ]
};

export default function ProduirePlusPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products?category=biofertilisant');
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyYzU1ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-6">
                {pageContent.hero.badge}
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {pageContent.hero.title}
                <span className="block text-green-600 dark:text-green-400 mt-2">
                  {pageContent.hero.subtitle}
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {pageContent.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#produits" 
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {pageContent.hero.cta.primary}
                </a>
                <Link 
                  href="/contact" 
                  className="px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {pageContent.hero.cta.secondary}
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
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-600/20"></div>
                <Image
                  src="/images/produire-plus-hero.jpg"
                  alt="Cultures abondantes"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzIyYzU1ZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+MviDguLvguLfguLXguJ/guLnguLkgUFJPRFVJUkUgUExVUzwvdGV4dD48L3N2Zz4=';
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
                <stat.icon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-600 mb-1">{stat.value}</div>
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
            <h2 className="text-4xl font-bold mb-4">Pourquoi Produire Plus ?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Les avantages concrets de nos solutions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pageContent.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 hover:shadow-xl transition-shadow"
              >
                <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={benefit.image}
                    alt={benefit.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{pageContent.howItWorks.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{pageContent.howItWorks.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pageContent.howItWorks.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 h-full">
                  <div className="text-6xl font-bold text-green-100 dark:text-green-900/30 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
                {index < pageContent.howItWorks.steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-green-400 w-8 h-8" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ils Ont Transformé Leur Production</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Témoignages de nos agriculteurs partenaires</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pageContent.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-green-50 dark:bg-gray-800 rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produits" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nos Solutions Biofertilisantes</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Produits spécialement sélectionnés pour augmenter vos rendements
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
              href="/produits?category=biofertilisant"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
            >
              Voir tous les produits
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à Doubler Vos Rendements ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez plus de 10 000 agriculteurs qui ont transformé leur production avec AGRI POINT
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-semibold transition-all"
            >
              Demander un diagnostic gratuit
            </Link>
            <Link
              href="/produits"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-green-600 rounded-lg font-semibold transition-all"
            >
              Explorer la boutique
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
