'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Building2,
  Home,
  Leaf,
  Sprout,
  Droplets,
  Sun,
  Wind,
  Zap,
  Smartphone,
  Layers,
  TrendingUp,
  Heart,
  Users,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  TreePine,
  Lightbulb,
  Target
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/models/Product';

// Contenu modifiable facilement
const pageContent = {
  hero: {
    badge: "🌱 L'Agriculture du Futur",
    title: "AGRICULTURE URBAINE",
    subtitle: "Cultivez la ville, nourrissez l'avenir",
    description: "Transformez votre balcon, terrasse ou toit en jardin productif. Technologies modernes, espaces réduits, résultats exceptionnels.",
    cta: {
      primary: "Démarrer mon jardin",
      secondary: "Voir les kits"
    }
  },

  stats: [
    { value: "80%", label: "d'économies sur légumes", icon: TrendingUp },
    { value: "365j", label: "de récoltes annuelles", icon: Sun },
    { value: "0 pesticides", label: "100% bio", icon: Leaf },
    { value: "5K+", label: "jardins urbains actifs", icon: Building2 }
  ],

  solutions: [
    {
      title: "Balcon Productif",
      description: "Transformez 2m² en potager ultra-productif. Idéal pour appartements.",
      icon: Home,
      space: "2-5 m²",
      products: "15-20 légumes/mois",
      investment: "50 000 FCFA",
      color: "blue",
      features: [
        "Jardinières verticales optimisées",
        "Système d'irrigation goutte-à-goutte",
        "Substrat enrichi longue durée",
        "Guide culture balcon inclus",
        "Semences hybrides performantes"
      ],
      image: "/images/urban-balcon.jpg"
    },
    {
      title: "Terrasse Intelligente",
      description: "Potager semi-automatisé avec monitoring digital. Pour terrasses 10-30m².",
      icon: Smartphone,
      space: "10-30 m²",
      products: "50-80 kg/mois",
      investment: "250 000 FCFA",
      color: "green",
      features: [
        "Bacs de culture connectés",
        "App mobile de suivi",
        "Irrigation automatique programmable",
        "Capteurs humidité + température",
        "Formation technique incluse"
      ],
      image: "/images/urban-terrasse.jpg",
      popular: true
    },
    {
      title: "Toit Nourricier",
      description: "Ferme urbaine sur toit. Production commerciale possible. 50m² et plus.",
      icon: Building2,
      space: "50+ m²",
      products: "200-500 kg/mois",
      investment: "1 500 000 FCFA",
      color: "purple",
      features: [
        "Système hydroponique professionnel",
        "Serre démontable modulaire",
        "Éclairage LED d'appoint",
        "Pack irrigation pro",
        "Accompagnement business 1 an"
      ],
      image: "/images/urban-toit.jpg"
    }
  ],

  innovations: {
    title: "Technologies Vertes",
    subtitle: "L'innovation au service de votre jardin urbain",
    techs: [
      {
        name: "Hydroponie",
        description: "Culture hors-sol dans l'eau enrichie. Croissance 30% plus rapide, 90% moins d'eau.",
        icon: Droplets,
        advantages: ["Pas de terre nécessaire", "Contrôle nutrition optimal", "Production continue", "Zéro maladies du sol"],
        color: "cyan"
      },
      {
        name: "Aéroponie",
        description: "Racines dans l'air avec brumisation nutritive. Technologie NASA, résultats spectaculaires.",
        icon: Wind,
        advantages: ["Croissance ultra-rapide", "Économie d'eau maximale", "Oxygénation optimale", "Rendement x2"],
        color: "sky"
      },
      {
        name: "LED Horticole",
        description: "Éclairage intelligent adapté à chaque plante. Cultivez même sans fenêtre.",
        icon: Zap,
        advantages: ["Culture intérieure possible", "Spectre optimisé croissance", "Économie énergétique 70%", "Récoltes toute l'année"],
        color: "amber"
      },
      {
        name: "IoT Agricole",
        description: "Capteurs connectés + App mobile. Votre jardin se gère presque tout seul.",
        icon: Smartphone,
        advantages: ["Monitoring temps réel", "Alertes automatiques", "Automatisation irrigation", "Conseils personnalisés"],
        color: "indigo"
      },
      {
        name: "Aquaponie",
        description: "Symbiose poissons-plantes. Un écosystème productif et autonome.",
        icon: Layers,
        advantages: ["Double production", "Fertilisation naturelle", "Système auto-équilibré", "Zéro déchet"],
        color: "teal"
      },
      {
        name: "Compostage Bokashi",
        description: "Compost ultra-rapide en 15 jours. Parfait pour appartements, zéro odeur.",
        icon: Sparkles,
        advantages: ["Compost en 15 jours", "Accepte viandes/laitages", "Aucune odeur", "Engrais liquide bonus"],
        color: "green"
      }
    ]
  },

  benefits: {
    title: "Pourquoi Cultiver en Ville ?",
    items: [
      {
        icon: Heart,
        title: "Santé & Bien-être",
        description: "Aliments frais, bio et sans pesticides. Activité physique douce. Réduction du stress.",
        stat: "92% se sentent mieux"
      },
      {
        icon: TrendingUp,
        title: "Économies",
        description: "Réduisez vos dépenses alimentaires de 60-80%. ROI en 6-12 mois.",
        stat: "75 000 FCFA/an économisés"
      },
      {
        icon: Leaf,
        title: "Environnement",
        description: "Réduction empreinte carbone. Air purifié. Biodiversité urbaine.",
        stat: "-500 kg CO₂/an"
      },
      {
        icon: Users,
        title: "Lien Social",
        description: "Jardins communautaires. Partage de récoltes. Transmission aux enfants.",
        stat: "85% partagent leurs récoltes"
      }
    ]
  },

  steps: {
    title: "Démarrez Votre Jardin Urbain en 4 Étapes",
    steps: [
      {
        number: "01",
        title: "Évaluation Espace",
        description: "Diagnostic gratuit de votre balcon/terrasse/toit. On détermine le potentiel et la solution idéale.",
        icon: Target,
        duration: "30 min"
      },
      {
        number: "02",
        title: "Kit Personnalisé",
        description: "Nous composons votre kit sur mesure avec équipements, semences et substrats adaptés.",
        icon: ShoppingCart,
        duration: "2 jours"
      },
      {
        number: "03",
        title: "Installation & Formation",
        description: "Nos experts installent tout et vous forment. Vous repartez avec les compétences nécessaires.",
        icon: Lightbulb,
        duration: "1/2 journée"
      },
      {
        number: "04",
        title: "Accompagnement",
        description: "Support continu via app, WhatsApp et visites. Garantie de réussite de vos cultures.",
        icon: Users,
        duration: "Illimité"
      }
    ]
  },

  testimonials: [
    {
      name: "Sarah Mbida",
      location: "Yaoundé - Bastos",
      space: "Balcon 3m²",
      text: "Je ne pensais jamais pouvoir cultiver en appartement. Maintenant je récolte salades, tomates, herbes tous les jours. Mes enfants adorent !",
      rating: 5,
      harvest: "12 kg de légumes/mois",
      image: "/images/testimonial-sarah.jpg"
    },
    {
      name: "Marc Ngollo",
      location: "Douala - Bonapriso",
      space: "Terrasse 20m²",
      text: "Le système connecté est génial. L'app me dit quand arroser, fertiliser. Mes tomates cerises sont incroyables !",
      rating: 5,
      harvest: "45 kg de légumes/mois",
      image: "/images/testimonial-marc.jpg"
    },
    {
      name: "Fatou Karim",
      location: "Garoua - Centre",
      space: "Toit 80m²",
      text: "J'ai transformé mon toit en mini-ferme. Je vends le surplus au marché. C'est devenu une vraie source de revenus !",
      rating: 5,
      harvest: "180 000 FCFA/mois de ventes",
      image: "/images/testimonial-fatou.jpg"
    }
  ],

  crops: [
    { name: "Tomates", difficulty: "Facile", time: "60-80 jours", yield: "3-5 kg/plant" },
    { name: "Salades", difficulty: "Très facile", time: "30-40 jours", yield: "Continue" },
    { name: "Herbes aromatiques", difficulty: "Très facile", time: "20-30 jours", yield: "Continue" },
    { name: "Piments", difficulty: "Facile", time: "70-90 jours", yield: "2-4 kg/plant" },
    { name: "Concombres", difficulty: "Moyen", time: "50-70 jours", yield: "4-8 kg/plant" },
    { name: "Aubergines", difficulty: "Moyen", time: "80-100 jours", yield: "4-6 kg/plant" },
    { name: "Fraises", difficulty: "Facile", time: "90 jours", yield: "Continue 6 mois" },
    { name: "Épinards", difficulty: "Très facile", time: "40-50 jours", yield: "Continue" }
  ]
};

export default function AgricultureUrbainePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products?category=kit');
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
      {/* Hero Section - Ultra Modern */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/10 dark:to-gray-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold mb-8 shadow-lg"
            >
              {pageContent.hero.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white mb-6 leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600">
                {pageContent.hero.title}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4"
            >
              {pageContent.hero.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto"
            >
              {pageContent.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a 
                href="#solutions" 
                className="group px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-2xl"
              >
                <Sprout className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                {pageContent.hero.cta.primary}
              </a>
              <a 
                href="#produits" 
                className="px-10 py-5 border-3 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
              >
                {pageContent.hero.cta.secondary}
                <ArrowRight className="w-6 h-6" />
              </a>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {pageContent.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                    <stat.icon className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <div className="text-4xl font-black text-green-600 mb-1">{stat.value}</div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                Choisissez Votre Solution
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">De l&apos;appartement à la ferme urbaine</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pageContent.solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group ${solution.popular ? 'lg:-mt-8 lg:mb-8' : ''}`}
              >
                {solution.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Le Plus Populaire
                    </div>
                  </div>
                )}

                <div className={`relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all ${
                  solution.popular ? 'ring-4 ring-green-500' : ''
                }`}>
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-${solution.color}-400 to-${solution.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <solution.icon className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-2xl font-black mb-3">{solution.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{solution.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-100 dark:bg-gray-600 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Espace</p>
                      <p className="font-bold text-green-600">{solution.space}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Production</p>
                      <p className="font-bold text-green-600">{solution.products}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Investissement départ</p>
                    <p className="text-3xl font-black text-green-600">{solution.investment}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {solution.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact"
                    className={`block text-center px-6 py-4 rounded-xl font-bold transition-all ${
                      solution.popular
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                        : 'border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    Démarrer maintenant
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovations */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                {pageContent.innovations.title}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{pageContent.innovations.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageContent.innovations.techs.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-${tech.color}-400 to-${tech.color}-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                  <div className={`w-16 h-16 rounded-xl bg-${tech.color}-100 dark:bg-${tech.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tech.icon className={`w-8 h-8 text-${tech.color}-600`} />
                  </div>
                  <h3 className="text-xl font-black mb-3">{tech.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{tech.description}</p>
                  <ul className="space-y-2">
                    {tech.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 text-${tech.color}-600 flex-shrink-0 mt-0.5`} />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">{pageContent.benefits.title}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pageContent.benefits.items.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <benefit.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{benefit.description}</p>
                <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">
                  {benefit.stat}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">{pageContent.steps.title}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pageContent.steps.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all h-full">
                  <div className="text-6xl font-black text-green-200 dark:text-green-900/50 mb-4">
                    {step.number}
                  </div>
                  <div className="w-14 h-14 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <step.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{step.description}</p>
                  <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                    ⏱️ {step.duration}
                  </div>
                </div>
                {index < pageContent.steps.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-green-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Crops Table */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Cultures Recommandées</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Les légumes stars pour jardin urbain</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-2xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-green-600">
                  <th className="text-left py-4 px-4 font-bold">Culture</th>
                  <th className="text-left py-4 px-4 font-bold">Difficulté</th>
                  <th className="text-left py-4 px-4 font-bold">Temps</th>
                  <th className="text-left py-4 px-4 font-bold">Rendement</th>
                </tr>
              </thead>
              <tbody>
                {pageContent.crops.map((crop, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-green-200 dark:border-gray-600 hover:bg-green-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold">{crop.name}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        crop.difficulty === 'Très facile' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : crop.difficulty === 'Facile'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {crop.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4">{crop.time}</td>
                    <td className="py-4 px-4 font-semibold text-green-600">{crop.yield}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Ils Cultivent en Ville</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Success stories de nos jardiniers urbains</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pageContent.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold">
                    🌱 {testimonial.harvest}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-lg leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                    <p className="text-xs text-green-600 font-semibold">{testimonial.space}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produits" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                Kits & Équipements
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tout le nécessaire pour démarrer votre jardin urbain
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <TreePine className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Kits disponibles prochainement</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/produits?category=kit"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg transition-all shadow-2xl transform hover:scale-105"
            >
              Voir tous les kits
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Prêt à Cultiver Votre Ville ?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            Rejoignez 5 000+ jardiniers urbains et transformez votre espace en oasis productive
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group px-10 py-5 bg-white text-green-600 hover:bg-gray-100 rounded-2xl font-bold text-lg transition-all shadow-2xl flex items-center justify-center gap-3"
            >
              <Sprout className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Démarrer maintenant
            </Link>
            <Link
              href="/produits"
              className="px-10 py-5 border-3 border-white text-white hover:bg-white hover:text-green-600 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3"
            >
              Explorer la boutique
              <ShoppingCart className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Custom CSS for blob animation (add to globals.css)
/*
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -50px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 50px) scale(1.05); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
*/
