'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroSlideshow from '@/components/home/HeroSlideshow';
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
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/models/Product';

// Contenu modifiable facilement
const MIEUX_VIVRE_IMAGES = [
  '/images/mieux-vivre/mieux-vivre-1.webp',
  '/images/mieux-vivre/mieux-vivre-2.webp',
];

const pageContent = {
  hero: {
    badge: "Programme Mieux Vivre",
    title: "Mieux Vivre",
    subtitle: "Caisses Mutuelles Agricoles Africaines",
    slogan: "La force de l'union avec vous et pour vous",
    description: "Accédez aux services essentiels : santé, logement, épargne et technologies pour un avenir prospère.",
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
      title: "Assurances",
      description: "Assurances agricoles (exploitation agricole et élevage), assurances scolaires, assurances maladies, assurances décès et bien d'autres couvertures.",
      icon: Health,
      color: "green",
      benefits: [
        "Assurances agricoles exploitation et élevage",
        "Assurances scolaires pour enfants",
        "Assurances maladies et couverture hospitalière",
        "Assurances décès jusqu'à 2 millions FCFA"
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
        "Sécurisation de l'épargne à partir de 500 milles FCFA",
        "Micro-crédit jusqu'à 5 millions FCFA",
        "Warrantage des stocks après récolte"
      ],
      image: "/products/icon-croissance-fruits.png"
    },
    {
      title: "Logement",
      description: "Assistance construction de maisons améliorées. Crédit habitat. Électrification solaire.",
      icon: Home,
      color: "purple",
      benefits: [
        "Crédit habitat à partir de 3 millions FCFA",
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
        "Applications mobiles (météo, prix)",
        "Formation numérique et internet",
        "Drones et tech agricoles en location"
      ],
      image: "/products/product-naturcare-terra.png"
    },
    {
      title: "Protection Sociale",
      description: "Mutuelle communautaire. Aide d'urgence. Soutien aux personnes âgées. Fonds de solidarité et caution mutuelle des producteurs.",
      icon: Shield,
      color: "amber",
      benefits: [
        "Fonds de solidarité pour imprévus",
        "Caution mutuelle des producteurs",
        "Soutien financier funérailles",
        "Aide alimentaire en cas de crise et accompagnement des aînés"
      ],
      image: "/products/product-uree-46.png"
    }
  ],

  savingsPlans: {
    title: "Plans d'épargne",
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
          "Carte d'épargne"
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
      question: "Comment adhérer aux Caisses Mutuelles Agricoles Africaines ?",
      answer: "L'adhésion est simple. Remplissez le formulaire en ligne ou visitez notre agence la plus proche avec une pièce d'identité et une photo."
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

  const { locale, T } = useLanguage();

  const statLabels = locale === 'en'
    ? ['Families supported', 'FCFA saved/family', 'Customer satisfaction', 'Of expertise']
    : ['Familles accompagn\u00e9es', 'FCFA \u00e9pargn\u00e9s/famille', 'Satisfaction clients', "D'expertise"];

  const serviceTitles = locale === 'en'
    ? ['Insurance', 'Savings & Micro-credit', 'Housing', 'Technologies', 'Social Protection']
    : ['Assurances', '\u00c9pargne & Micro-cr\u00e9dit', 'Logement', 'Technologies', 'Protection Sociale'];

  const serviceDescs = locale === 'en'
    ? [
        'Agricultural insurance (farming and livestock), school insurance, health insurance, death insurance, and many other coverages.',
        'Secure savings solutions. Accessible agricultural loans. Warehousing to secure your harvests.',
        'Assistance building improved homes. Housing credit. Solar electrification.',
        'Access to modern agricultural technologies. Smartphones. Internet for all.',
        'Community mutual. Emergency assistance. Support for the elderly. Solidarity fund and mutual guarantee for producers.',
      ]
    : pageContent.services.map(s => s.description);

  const savingsPlanNames = locale === 'en'
    ? ['Free Savings', 'Scheduled Savings', 'Project Savings']
    : ['\u00c9pargne Libre', '\u00c9pargne Programm\u00e9e', '\u00c9pargne Projet'];

  const savingsPlanDescs = locale === 'en'
    ? ['Deposit when you want', 'Regular contributions', 'To achieve your dreams']
    : ['Versez quand vous voulez', 'Cotisations r\u00e9guli\u00e8res', 'Pour r\u00e9aliser vos r\u00eaves'];

  const faqBilingual = locale === 'en'
    ? [
        { question: 'How to join the African Agricultural Mutual Funds?', answer: 'Joining is simple. Fill out the online form or visit our nearest branch with an ID and a photo.' },
        { question: 'What is the minimum amount to open a savings account?', answer: 'You can start saving with as little as 5,000 FCFA. No opening or account management fees.' },
        { question: 'How does health insurance work?', answer: 'Monthly contribution of 5,000 FCFA per person or 15,000 FCFA for a family (up to 5 people). Immediate coverage after the first payment.' },
        { question: 'Can I get an agricultural loan?', answer: 'Yes, after 6 months of regular savings, you can access a loan of 2 to 5 times your savings at a preferential rate of 1.5% per month.' },
      ]
    : pageContent.faq;

  const serviceBenefitsDisplay: string[][] = locale === 'en'
    ? [
        [
          'Agricultural farm and livestock insurance',
          'School insurance for children',
          'Health insurance and hospital coverage',
          'Death insurance up to 2 million FCFA',
        ],
        [
          'Savings with 6% interest per year',
          'Savings security from 500,000 FCFA',
          'Micro-credit up to 5 million FCFA',
          'Post-harvest stock warehousing',
        ],
        [
          'Housing credit from 3 million FCFA',
          'Optimized rural housing plans',
          'Solar kits with installment payments',
          'Construction materials at reduced prices',
        ],
        [
          'Smartphones for farmers on credit',
          'Mobile apps (weather, prices)',
          'Digital training and internet',
          'Agricultural drones and tech for hire',
        ],
        [
          'Solidarity fund for emergencies',
          'Mutual guarantee for producers',
          'Funeral financial support',
          'Food assistance in crisis situations and support for elders',
        ],
      ]
    : pageContent.services.map(s => s.benefits);

  const savingsPlanFeaturesDisplay: string[][] = locale === 'en'
    ? [
        ['No minimum amount', 'Withdrawal at any time', 'Monthly interest', 'Savings card'],
        ['Automatic deduction', '12-month minimum commitment', 'Loyalty bonus', 'Personal advisor'],
        ['Personalized goal', 'Project support', 'Additional credit possible', 'Savings insurance included'],
      ]
    : pageContent.savingsPlans.plans.map(p => p.features);

  const testimonialsDisplay = locale === 'en'
    ? [
        {
          name: 'Antoinette Njoya',
          location: 'Bafoussam',
          service: 'Health Insurance',
          text: 'Thanks to health insurance, I was able to have my child operated on without going into debt. It is an immense relief!',
          rating: 5,
          savings: '850,000 FCFA saved',
        },
        {
          name: 'Pierre Manga',
          location: 'Yaoundé',
          service: 'Savings & Credit',
          text: 'I saved 3 million over 2 years. I got a loan to expand my farm. My life has changed!',
          rating: 5,
          savings: '3,000,000 FCFA saved',
        },
        {
          name: 'Halimatou Bouba',
          location: 'Maroua',
          service: 'Housing',
          text: 'I built my house with the housing credit. My children now have a safe roof over their heads.',
          rating: 5,
          savings: 'House worth 8 million',
        },
      ]
    : pageContent.testimonials;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2VmNDQ0NCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
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
                {T.mieuxVivre.heroBadge}
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  {T.mieuxVivre.heroTitle}
                </h1>
                <Image
                  src="/images/partners/cma.jpg"
                  alt="Logo CMA"
                  width={80}
                  height={80}
                  className="rounded-lg object-contain flex-shrink-0"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{T.mieuxVivre.heroSubtitle}</p>

              {/* Slogan CMA en rouge */}
              <p className="text-2xl font-bold text-red-600 mb-6 italic">
                {T.mieuxVivre.heroSlogan}
              </p>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {T.mieuxVivre.heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#services" 
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <Heart className="w-5 h-5" />
                  {T.mieuxVivre.heroCta1}
                </a>
                <a 
                  href="#epargne" 
                  className="px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {T.mieuxVivre.heroCta2}
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
                <HeroSlideshow
                  images={MIEUX_VIVRE_IMAGES}
                  alt="Mieux Vivre"
                  objectFit="cover"
                  interval={5000}
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
                <div className="text-sm text-gray-600 dark:text-gray-400">{statLabels[index]}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4"><span className="text-red-500">{T.mieuxVivre.servicesTitle}</span> {T.mieuxVivre.servicesTitleHL}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.mieuxVivre.servicesSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageContent.services.filter(service => service.title !== "éducation").map((service, index) => (
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
                <h3 className="text-xl font-bold mb-3">{serviceTitles[index]}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{serviceDescs[index]}</p>
                <ul className="space-y-2">
                  {(serviceBenefitsDisplay[index] ?? service.benefits).map((benefit, i) => (
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
            <h2 className="text-4xl font-bold mb-4">{T.mieuxVivre.savingsTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.mieuxVivre.savingsSubtitle}</p>
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
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-white" /> {T.common.popular}
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{savingsPlanNames[index]}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{savingsPlanDescs[index]}</p>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">{T.common.from}</p>
                  <p className="text-3xl font-bold text-red-600">{plan.minAmount}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">{T.common.interestRate}</p>
                  <p className="text-2xl font-bold text-green-600">{plan.interest}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {(savingsPlanFeaturesDisplay[index] ?? plan.features).map((feature, i) => (
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
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  {T.common.openSavings}
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
            <h2 className="text-4xl font-bold mb-4">{T.mieuxVivre.testTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.mieuxVivre.testSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonialsDisplay.map((testimonial, index) => (
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
            <h2 className="text-4xl font-bold mb-4">{T.mieuxVivre.faqTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.mieuxVivre.faqSubtitle}</p>
          </div>

          <div className="space-y-4">
            {faqBilingual.map((item, index) => (
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
                  <span className="font-semibold text-gray-900 dark:text-white">{item.question}</span>
                  <span className="text-2xl text-green-600">{activeFaq === index ? '−' : '+'}</span>
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
            <h2 className="text-4xl font-bold mb-4"><span className="text-red-500">{locale === 'en' ? 'Our' : 'Nos'}</span> {locale === 'en' ? 'Offers' : 'Offres'}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {locale === 'en' ? 'Practical solutions to improve your daily life' : 'Solutions pratiques pour am\u00e9liorer votre quotidien'}
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
              <p>{locale === 'en' ? 'Products and services available soon' : 'Produits et services disponibles prochainement'}</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/produits?category=service"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
            >
              {locale === 'en' ? 'See all our offers' : 'Voir toutes nos offres'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">{T.mieuxVivre.ctaTitle}</h2>
          <p className="text-xl mb-8 opacity-90">
            {T.mieuxVivre.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-red-600 hover:bg-gray-100 rounded-lg font-semibold transition-all"
            >
              {T.mieuxVivre.ctaContact}
            </Link>
            <Link
              href="/a-propos"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-red-600 rounded-lg font-semibold transition-all"
            >
              {T.mieuxVivre.ctaOffers}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
