'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroSlideshow from '@/components/home/HeroSlideshow';
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
const PRODUIRE_PLUS_IMAGES = [
  '/images/produire-plus/produire-plus-1.webp',
  '/images/produire-plus/produire-plus-2.webp',
  '/images/produire-plus/produire-plus-3.webp',
  '/images/produire-plus/produire-plus-4.webp',
  '/images/produire-plus/produire-plus-5.webp',
  '/images/produire-plus/produire-plus-6.webp',
  '/images/produire-plus/produire-plus-7.webp',
];

const pageContent = {
  hero: {
    badge: "Programme Produire Plus",
    title: "Produire Plus",
    subtitle: "Conseil et accompagnement agricole — Fourniture d'intrants",
    description: "Information pour produire ce qui peut être vendu d'avance. Formation pour produire plus et à moindre coût. Mécanisation et fourniture d'intrants de qualité.",
    cta: {
      primary: "Découvrir nos offres",
      secondary: "Nous contacter"
    }
  },
  
  stats: [
    { value: "+150%", label: "Rendement potentiel", icon: TrendingUp },
    { value: "3 étapes", label: "D'accompagnement", icon: Zap },
    { value: "20K+", label: "Hectares cibles", icon: Target },
    { value: "6", label: "Types d'offres", icon: Award }
  ],

  benefits: [
    {
      title: "Identification des filières",
      description: "Identification des filières de croissance prioritaires avec forte valeur ajoutée, en phase avec la politique agricole nationale.",
      icon: Target,
      color: "green",
      image: "/products/icon-croissance-fruits.png"
    },
    {
      title: "Fourniture d'intrants",
      description: "Semences de qualités ; engrais minéraux ; biofertilisants ; produits phytosanitaires homologués ; pour une production optimale.",
      icon: ShoppingCart,
      color: "emerald",
      image: "/products/icon-floraison.png"
    },
    {
      title: "Renforcement des capacités",
      description: "Formation continue des producteurs : techniques culturales modernes, gestion des cultures, utilisation optimale des intrants.",
      icon: Award,
      color: "lime",
      image: "/products/icon-feuillage.png"
    },
    {
      title: "Mécanisation agricole des activités",
      description: "Modernisation et intensification des systèmes de production agricole ; réduction de la pénibilité.",
      icon: BarChart3,
      color: "amber",
      image: "/products/icon-anti-stress.png"
    }
  ],

  howItWorks: {
    title: "Comment ça marche ?",
    subtitle: "Notre approche scientifique en 3 étapes",
    steps: [
      {
        number: "01",
        title: "Pré-production",
        description: "Choix de la culture ; montage du business plan ; recherche des partenaires commerciaux ; mobilisation des ressources ; choix du site ; choix des intrants."
      },
      {
        number: "02",
        title: "Production",
        description: "Préparation du terrain ; plantation ; suivi et entretien des cultures."
      },
      {
        number: "03",
        title: "Post-récolte",
        description: "Stockage et conservation ; conditionnement ; transport."
      }
    ]
  },

  testimonials: [
    {
      name: "Pierre Ondoua",
      role: "Maraîcher, Région du Centre",
      text: "Avec l'accompagnement d'AGRIPOINT SERVICES SAS j'ai pu acquérir une motopompe pour accroître mes revenus. En l'utilisant je suis capable désormais de cultiver ma tomate en contre-saison.",
      rating: 5
    },
    {
      name: "Coopérative Agricole de l'Ouest",
      role: "Membres via CMA, Région de l'Ouest",
      text: "Grâce à la mutuelle assurance agricole CMA, les membres de notre coopérative peuvent désormais labourer leurs exploitations sans difficulté à l'aide d'un tracteur.",
      rating: 5
    },
    {
      name: "Famille Mbarga",
      role: "Producteurs de Maïs, via AP Agri Point Services",
      text: "Suite à l'usage de vos semences de qualité fournies par AP AGRI POINT SERVICES nous arrivons à produire 5 tonnes de maïs à l'hectare.",
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
                  <ArrowRight className="w-5 h-5" />
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
                <HeroSlideshow
                  images={PRODUIRE_PLUS_IMAGES}
                  alt="Produire Plus"
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
            <h2 className="text-4xl font-bold mb-4">Comment Produire Plus ?</h2>
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

          <div className="grid md:grid-cols-3 gap-8">
            {pageContent.howItWorks.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 h-full border border-green-100 dark:border-green-800/40 shadow-md">
                  <div className="text-7xl font-black text-green-500/50 dark:text-green-400/60 mb-4 leading-none">{step.number}</div>
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
            <h2 className="text-4xl font-bold mb-4"><span className="text-red-500">Nos</span> Offres</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Solutions sélectionnées pour accompagner votre production
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
            >
              Voir toutes nos offres
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à Transformer Votre Production ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les producteurs qui ont transformé leur activité avec AGRIPOINT SERVICES
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-semibold transition-all"
            >
              Nous contacter
            </Link>
            <Link
              href="/produits"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-green-600 rounded-lg font-semibold transition-all"
            >
              Voir nos offres
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
