'use client';

import Link from 'next/link';
import Image from 'next/image';
import HeroSlideshow from '@/components/home/HeroSlideshow';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Sprout, 
  Leaf, 
  ShoppingCart,
  ArrowRight,
  Zap,
  Target,
  Award,
  BarChart3,
  Banknote,
  Cog,
  Package,
  Smartphone,
  Store,
  ChevronRight
} from 'lucide-react';

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

const OFFRES_PRODUIRE = [
  {
    number: '01',
    icon: Banknote,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700',
    title: 'Micro-crédit agricole',
    description: 'Accès à des financements adaptés à votre projet agricole, en partenariat avec les institutions financières et mutuelles (CMA). Durée et taux adaptés aux cycles culturaux.',
    link: '/mieux-vivre',
  },
  {
    number: '02',
    icon: Cog,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-700',
    title: 'Mécanisation agricole',
    description: 'Location et vente de matériels agricoles : tracteurs, motopompes, égreneurs. Réduction de la pénibilité et augmentation de la productivité sur votre exploitation.',
    link: '/contact',
  },
  {
    number: '03',
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    title: 'Engrais minéraux',
    description: 'Gamme complète d\'engrais NPK (SARAH NPK, URÉE 46%) adaptés aux sols camerounais. Dosages recommandés par nos agronomes pour chaque culture.',
    link: '/fourniture-intrants',
  },
  {
    number: '04',
    icon: Leaf,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    title: 'Biofertilisants',
    description: 'Stimulants racinaires, biostimulants foliaires et protecteurs naturels certifiés : HUMIFORTE, FOSNUTREN, KADOSTIM, AMINOL FORTE, NATUR CARE.',
    link: '/fourniture-intrants',
  },
  {
    number: '05',
    icon: Smartphone,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    title: "Digitalisation de l'activité",
    description: "Accompagnement à la gestion numérique : suivi cultures, calendrier cultural, accès à AGRI SMART et conseils en temps réel via AgriBot.",
    link: '/gagner-plus',
  },
  {
    number: '06',
    icon: Store,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-700',
    title: 'Commercialisation',
    description: 'Identification des marchés, mise en relation avec les acheteurs, appui au warrantage (stockage différé) et recherche de débouchés nationaux et régionaux.',
    link: '/contact',
  },
];

export default function ProduirePlusPage() {

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
              className="lg:h-[500px] flex flex-col justify-center"
            >
              <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-5">
                {pageContent.hero.badge}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {pageContent.hero.title}
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-green-600 dark:text-green-400 mb-5 leading-snug">
                {pageContent.hero.subtitle}
              </p>

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

      {/* Offers Section */}
      <section id="produits" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4"><span className="text-green-600">Nos</span> Offres</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              6 domaines d&apos;intervention pour accompagner votre production
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFRES_PRODUIRE.map((offre, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={offre.link}
                  className={`block h-full rounded-2xl border ${offre.border} bg-white dark:bg-gray-700 p-6 hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${offre.bg} flex items-center justify-center`}>
                      <offre.icon className={`w-6 h-6 ${offre.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold ${offre.color} uppercase tracking-wider`}>{offre.number}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{offre.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{offre.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
            >
              Prendre contact avec un expert
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
