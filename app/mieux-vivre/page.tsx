'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Heart,
  Shield,
  Home,
  GraduationCap,
  Smartphone,
  Users,
  PiggyBank,
  Heart as Health,
  ArrowRight,
  CheckCircle,
  Star,
  Award
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/models/Product';

// Contenu modifiable facilement
const pageContent = {
  hero: {
    badge: "❤️ Votre Bien-être, Notre Priorité",
    title: "MIEUX VIVRE",
    subtitle: "Transformez votre qualité de vie",
    description: "Accès aux services essentiels : santé, éducation, logement, épargne et technologies. Bâtissez un avenir prospère pour vous et votre famille.",
    cta: {
      primary: "Découvrir les services",
      secondary: "Calculer mon épargne"
    }
  },
  
  stats: [
    { value: "25K+", label: "Familles accompagnées", icon: Users },
    { value: "3M+", label: "FCFA épargnés/famille", icon: PiggyBank },
    { value: "98%", label: "Satisfaction clients", icon: Star },
    { value: "15 ans", label: "D'expertise", icon: Award }
  ],

  services: [
    {
      title: "Santé & Protection",
      description: "Micro-assurance santé accessible. Couverture décès et invalidité. Accès aux soins de qualité à prix réduits.",
      icon: Health,
      color: "red",
      benefits: [
        "Assurance santé familiale dès 5 000 FCFA/mois",
        "Couverture hospitalisation et chirurgie",
        "Assurance décès jusqu'à 2 millions FCFA",
        "Partenariat avec cliniques de qualité"
      ],
      image: "/products/icon-anti-stress.png"
    },
    {
      title: "Épargne & Micro-crédit",
      description: "Solutions d'épargne sécurisées. Crédits agricoles accessibles. Warrantage pour sécuriser vos récoltes.",
      icon: PiggyBank,
      color: "blue",
      benefits: [
        "Épargne avec intérêts de 6% par an",
        "Micro-crédit jusqu'à 5 millions FCFA",
        "Warrantage des stocks après récolte",
        "Accompagnement dans vos projets"
      ],
      image: "/products/icon-croissance-fruits.png"
    },
    {
      title: "Éducation",
      description: "Formation continue pour vous et vos enfants. Bourses d'études. Alphabétisation numérique.",
      icon: GraduationCap,
      color: "green",
      benefits: [
        "Formations agricoles gratuites mensuelles",
        "Bourses d'études pour enfants d'adhérents",
        "Cours d'alphabétisation et calcul",
        "Formation aux technologies modernes"
      ],
      image: "/products/icon-feuillage.png"
    },
    {
      title: "Logement",
      description: "Assistance construction de maisons améliorées. Crédit habitat. Électrification solaire.",
      icon: Home,
      color: "purple",
      benefits: [
        "Crédit habitat jusqu'à 10 millions FCFA",
        "Plans de maisons rurales optimisées",
        "Kits solaires avec paiement échelonné",
        "Matériaux de construction à prix réduits"
      ],
      image: "/products/icon-floraison.png"
    },
    {
      title: "Technologies",
      description: "Accès aux technologies agricoles modernes. Téléphones intelligents. Internet pour tous.",
      icon: Smartphone,
      color: "indigo",
      benefits: [
        "Smartphones pour agriculteurs à crédit",
        "Applications mobiles gratuites (météo, prix)",
        "Formation numérique et internet",
        "Drones et tech agricoles en location"
      ],
      image: "/products/product-naturcare-terra.png"
    },
    {
      title: "Protection Sociale",
      description: "Mutuelle communautaire. Aide d'urgence. Soutien aux personnes âgées.",
      icon: Shield,
      color: "amber",
      benefits: [
        "Fonds d'urgence pour imprévus",
        "Soutien financier funérailles",
        "Aide alimentaire en cas de crise",
        "Accompagnement des aînés"
      ],
      image: "/products/product-uree-46.png"
    }
  ],

  savingsPlans: {
    title: "Plans d'Épargne",
    subtitle: "Construisez votre avenir financier",
    plans: [
      {
        name: "Épargne Libre",
        description: "Versez quand vous voulez",
        minAmount: "5 000 FCFA",
        interest: "6%/an",
        features: [
          "Aucun montant minimum",
          "Retrait à tout moment",
          "Intérêts mensuels",
          "Carte d'épargne gratuite"
        ]
      },
      {
        name: "Épargne Programmée",
        description: "Cotisations régulières",
        minAmount: "10 000 FCFA/mois",
        interest: "8%/an",
        features: [
          "Prélèvement automatique",
          "Engagement 12 mois minimum",
          "Bonus fidélité",
          "Conseiller personnel"
        ],
        popular: true
      },
      {
        name: "Épargne Projet",
        description: "Pour réaliser vos rêves",
        minAmount: "20 000 FCFA/mois",
        interest: "10%/an",
        features: [
          "Objectif personnalisé",
          "Accompagnement projet",
          "Crédit complémentaire possible",
          "Assurance épargne incluse"
        ]
      }
    ]
  },

  testimonials: [
    {
      name: "Antoinette Njoya",
      location: "Bafoussam",
      service: "Assurance Santé",
      text: "Grâce à l'assurance santé, j'ai pu faire opérer mon enfant sans m'endetter. C'est un soulagement immense !",
      rating: 5,
      savings: "850 000 FCFA économisés"
    },
    {
      name: "Pierre Manga",
      location: "Yaoundé",
      service: "Épargne & Crédit",
      text: "J'ai épargné 3 millions en 2 ans. J'ai obtenu un crédit pour agrandir ma ferme. Ma vie a changé !",
      rating: 5,
      savings: "3 000 000 FCFA épargnés"
    },
    {
      name: "Halimatou Bouba",
      location: "Maroua",
      service: "Logement",
      text: "J'ai construit ma maison avec le crédit habitat. Mes enfants ont maintenant un toit sûr.",
      rating: 5,
      savings: "Maison de 8 millions"
    }
  ],

  faq: [
    {
      question: "Comment adhérer aux services AGRI POINT ?",
      answer: "L'adhésion est simple et gratuite. Remplissez le formulaire en ligne ou visitez notre agence la plus proche avec une pièce d'identité et une photo."
    },
    {
      question: "Quel est le montant minimum pour ouvrir une épargne ?",
      answer: "Vous pouvez commencer à épargner avec seulement 5 000 FCFA. Pas de frais d'ouverture ni de gestion de compte."
    },
    {
      question: "Comment fonctionne l'assurance santé ?",
      answer: "Cotisation mensuelle de 5 000 FCFA par personne ou 15 000 FCFA pour la famille (jusqu'à 5 personnes). Couverture immédiate après le premier paiement."
    },
    {
      question: "Puis-je obtenir un crédit agricole ?",
      answer: "Oui, après 6 mois d'épargne régulière, vous pouvez accéder à un crédit de 2 à 5 fois votre épargne, à un taux préférentiel de 1,5% par mois."
    }
  ]
};

export default function MieuxVivrePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products?category=service');
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
      <section className="relative bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2VmNDQ0NCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold mb-6">
                {pageContent.hero.badge}
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {pageContent.hero.title}
                <span className="block text-red-600 dark:text-red-400 mt-2">
                  {pageContent.hero.subtitle}
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {pageContent.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#services" 
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <Heart className="w-5 h-5" />
                  {pageContent.hero.cta.primary}
                </a>
                <a 
                  href="#epargne" 
                  className="px-8 py-4 border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
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
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-purple-600/20"></div>
                <Image
                  src="/images/mieux-vivre-hero.jpg"
                  alt="Famille heureuse"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+4p2k77iPIE1JRVVYIFZJVlJFPC90ZXh0Pjwvc3ZnPg==';
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
                <stat.icon className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-red-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nos Services Pour Mieux Vivre</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Un accompagnement complet pour votre épanouissement</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageContent.services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 hover:shadow-2xl transition-all group"
              >
                <div className={`w-14 h-14 rounded-lg bg-${service.color}-100 dark:bg-${service.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className={`w-7 h-7 text-${service.color}-600`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 text-${service.color}-600 flex-shrink-0 mt-0.5`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Savings Plans */}
      <section id="epargne" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{pageContent.savingsPlans.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{pageContent.savingsPlans.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pageContent.savingsPlans.plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-700 rounded-2xl p-8 ${plan.popular ? 'ring-4 ring-red-500 shadow-2xl scale-105' : 'shadow-lg'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    ⭐ Populaire
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">À partir de</p>
                  <p className="text-3xl font-bold text-red-600">{plan.minAmount}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Taux d&apos;intérêt</p>
                  <p className="text-2xl font-bold text-green-600">{plan.interest}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  Ouvrir une épargne
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ils Vivent Mieux Aujourd&apos;hui</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Témoignages qui changent des vies</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pageContent.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-red-50 dark:bg-gray-800 rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-semibold">
                    {testimonial.savings}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location} • {testimonial.service}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Questions Fréquentes</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Tout ce que vous devez savoir</p>
          </div>

          <div className="space-y-4">
            {pageContent.faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="font-semibold">{item.question}</span>
                  <span className="text-2xl">{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-600 border-t">
                    <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produits" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Produits & Services</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Solutions pratiques pour améliorer votre quotidien
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
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
              <p>Produits et services disponibles prochainement</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/produits?category=service"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
            >
              Voir tous les services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Commencez à Mieux Vivre Dès Maintenant</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez 25 000+ familles qui ont transformé leur qualité de vie avec nos services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-red-600 hover:bg-gray-100 rounded-lg font-semibold transition-all"
            >
              Adhérer maintenant
            </Link>
            <Link
              href="/a-propos"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-red-600 rounded-lg font-semibold transition-all"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
