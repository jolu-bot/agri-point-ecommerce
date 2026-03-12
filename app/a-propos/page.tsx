'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target,
  Eye,
  Award,
  Users,
  Heart,
  TrendingUp,
  Globe,
  Leaf,
  Shield,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Contenu modifiable facilement
const pageContentFR = {
  hero: {
    badge: "🌍 Depuis 2010",
    title: "À PROPOS D'AGRIPOINT SERVICES",
    subtitle: "Facilitateur du secteur agropastoral au Cameroun",
    description: "AGRIPOINT SERVICES SAS accompagne les producteurs camerounais à travers des services de facilitation couvrant la production, la commercialisation et le bien-être social.",
    stats: [
      { value: "10K+", label: "Producteurs accompagnés" },
      { value: "15 ans", label: "D'expertise terrain" },
      { value: "5", label: "Zones agroécologiques" },
      { value: "3", label: "Programmes phares" }
    ]
  },

  mission: {
    title: "Notre Mission",
    description: "Faciliter l'accès aux intrants, aux marchés et aux services sociaux pour les producteurs agropastoraux du Cameroun.",
    points: [
      {
        icon: TrendingUp,
        title: "Produire Plus",
        description: "Accompagner les producteurs de la pré-production à la post-récolte avec des intrants, la mécanisation et le conseil technique"
      },
      {
        icon: Heart,
        title: "Gagner Plus",
        description: "Faciliter la commercialisation, le warrantage, le financement et la recherche de partenaires commerciaux"
      },
      {
        icon: Shield,
        title: "Mieux Vivre",
        description: "Offrir aux adhérents des CMA l'accès à l'assurance, au micro-crédit, à l'épargne et à la couverture santé"
      },
      {
        icon: Users,
        title: "Renforcer les communautés",
        description: "Structurer les producteurs en Coopératives Mutuelles Agropastorales (CMA) pour mutualiser les ressources"
      }
    ]
  },

  vision: {
    title: "Notre Vision",
    subtitle: "L'Afrique nourrit l'Afrique",
    description: "D'ici 2030, accompagner les producteurs agropastoraux camerounais vers l'autosuffisance alimentaire et la prospérité économique grâce à la professionnalisation des filières.",
    goals: [
      "Couvrir les 5 zones agroécologiques du Cameroun",
      "Structurer 1 000 CMA opérationnelles",
      "Faciliter l'accès au financement pour 50 000 producteurs",
      "Créer des chaînes de valeur durables dans chaque filière"
    ]
  },

  values: [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Nous développons continuellement de nouvelles solutions adaptées aux réalités africaines",
      color: "yellow"
    },
    {
      icon: Heart,
      title: "Impact Social",
      description: "Chaque décision est prise en pensant au bien-être des agriculteurs et de leurs familles",
      color: "red"
    },
    {
      icon: Leaf,
      title: "Durabilité",
      description: "Nous protégeons la terre pour les générations futures avec une agriculture régénératrice",
      color: "green"
    },
    {
      icon: Shield,
      title: "Intégrité",
      description: "Transparence totale dans nos produits, prix et résultats. Pas de promesses vides",
      color: "blue"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Nous croyons au pouvoir des communautés et des partenariats gagnant-gagnant",
      color: "purple"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Qualité sans compromis dans nos produits, services et accompagnement",
      color: "amber"
    }
  ],

  history: [
    {
      year: "2010",
      title: "Naissance d'AGRIPOINT SERVICES",
      description: "Création à Yaoundé avec une vision : faciliter l'accès aux intrants et aux marchés pour les producteurs camerounais",
      icon: Building2
    },
    {
      year: "2012",
      title: "Premiers partenariats",
      description: "Mise en place des premiers réseaux de distribution d'intrants et de conseil technique aux producteurs",
      icon: Leaf
    },
    {
      year: "2015",
      title: "Expansion Nationale",
      description: "Ouverture de 5 agences régionales. 10 000 agriculteurs accompagnés",
      icon: Globe
    },
    {
      year: "2018",
      title: "Services Sociaux",
      description: "Lancement assurance santé, micro-crédit et Épargne pour nos adhérents",
      icon: Heart
    },
    {
      year: "2020",
      title: "Révolution Digitale",
      description: "Application mobile lancée. Conseils agricoles par SMS et WhatsApp",
      icon: Lightbulb
    },
    {
      year: "2023",
      title: "Couverture nationale",
      description: "Présence dans les 5 zones agroécologiques, 10 000+ producteurs accompagnés",
      icon: Award
    }
  ],

  team: {
    title: "Notre équipe",
    subtitle: "Experts passionnés au service de l'agriculture",
    members: [
      {
        name: "Dr. Jean-Baptiste Kamga",
        role: "Fondateur & Directeur Général",
        bio: "Agronome, PhD en Sciences du Sol. 20 ans d'expérience en développement agropastoral",
        image: "/images/team-kamga.jpg"
      },
      {
        name: "Marie-Claire Ngo Bata",
        role: "Directrice R&D",
        bio: "Spécialiste intrants agricoles, ancienne chercheuse à l'IRAD",
        image: "/images/team-ngo.jpg"
      },
      {
        name: "Paul Mbida",
        role: "Directeur Commercial",
        bio: "Expert en développement rural et formation des agriculteurs",
        image: "/images/team-mbida.jpg"
      },
      {
        name: "Fatima Hassan",
        role: "Directrice Services Sociaux",
        bio: "Spécialiste micro-finance et protection sociale",
        image: "/images/team-hassan.jpg"
      }
    ]
  },

  certifications: [
    {
      name: "Agrément MINADER",
      description: "Agrément officiel pour la distribution d'intrants et l'accompagnement des producteurs",
      year: "2015"
    },
    {
      name: "ISO 9001:2015",
      description: "Management de la qualité certifié",
      year: "2019"
    },
    {
      name: "Prix Innovation CEMAC",
      description: "Meilleure innovation agritech Afrique Centrale",
      year: "2021"
    },
    {
      name: "Label Commerce équitable",
      description: "Partenariats agriculteurs certifiés équitables",
      year: "2022"
    }
  ],

  impact: [
    { metric: "10K+", label: "Producteurs accompagnés" },
    { metric: "5", label: "Zones agroécologiques" },
    { metric: "3", label: "Programmes phares" },
    { metric: "8", label: "Secteurs couverts" }
  ],

  contact: {
    headquarters: "Yaoundé, Cameroun",
    address: "Quartier Fouda — B.P. 5111",
    phone: "(+237) 657 39 39 39  |  (+237) 651 92 09 20",
    email: "infos@agri-ps.com",
    hours: "Lun-Ven: 8h-17h, Sam: 8h-13h"
  }
};

const pageContentEN = {
  hero: {
    badge: "🌍 Since 2010",
    title: "ABOUT AGRIPOINT SERVICES",
    subtitle: "Agropastoral facilitator in Cameroon",
    description: "AGRIPOINT SERVICES SAS supports Cameroonian producers through facilitation services covering production, commercialization and social well-being.",
    stats: [
      { value: "10K+", label: "Producers supported" },
      { value: "15 yrs", label: "Of field expertise" },
      { value: "5", label: "Agroecological zones" },
      { value: "3", label: "Flagship programs" }
    ]
  },

  mission: {
    title: "Our Mission",
    description: "Facilitate access to inputs, markets and social services for agropastoral producers in Cameroon.",
    points: [
      { icon: TrendingUp, title: "Produce More", description: "Support producers from pre-production to post-harvest with inputs, mechanization and technical advice" },
      { icon: Heart, title: "Earn More", description: "Facilitate commercialization, warehousing, financing and search for commercial partners" },
      { icon: Shield, title: "Better Living", description: "Offer CMA members access to insurance, micro-credit, savings and health coverage" },
      { icon: Users, title: "Strengthen communities", description: "Organize producers into Agropastoral Mutual Cooperatives (CMA) to pool resources" }
    ]
  },

  vision: {
    title: "Our Vision",
    subtitle: "Africa feeds Africa",
    description: "By 2030, support Cameroonian agropastoral producers towards food self-sufficiency and economic prosperity through the professionalization of sectors.",
    goals: [
      "Cover all 5 agroecological zones of Cameroon",
      "Structure 1,000 operational CMAs",
      "Facilitate access to financing for 50,000 producers",
      "Create sustainable value chains in each sector"
    ]
  },

  values: [
    { icon: Lightbulb, title: "Innovation", description: "We continuously develop new solutions adapted to African realities", color: "yellow" },
    { icon: Heart, title: "Social Impact", description: "Every decision is made with the well-being of farmers and their families in mind", color: "red" },
    { icon: Leaf, title: "Sustainability", description: "We protect the land for future generations with regenerative agriculture", color: "green" },
    { icon: Shield, title: "Integrity", description: "Full transparency in our products, prices and results. No empty promises", color: "blue" },
    { icon: Users, title: "Collaboration", description: "We believe in the power of communities and win-win partnerships", color: "purple" },
    { icon: Award, title: "Excellence", description: "Uncompromising quality in our products, services and support", color: "amber" }
  ],

  history: [
    { year: "2010", title: "Birth of AGRIPOINT SERVICES", description: "Founded in Yaoundé with a vision: facilitate access to inputs and markets for Cameroonian producers", icon: Building2 },
    { year: "2012", title: "First partnerships", description: "Establishment of first input distribution networks and technical advice to producers", icon: Leaf },
    { year: "2015", title: "National Expansion", description: "Opening of 5 regional offices. 10,000 farmers supported", icon: Globe },
    { year: "2018", title: "Social Services", description: "Launch of health insurance, micro-credit and savings for our members", icon: Heart },
    { year: "2020", title: "Digital Revolution", description: "Mobile app launched. Agricultural advice via SMS and WhatsApp", icon: Lightbulb },
    { year: "2023", title: "National coverage", description: "Presence in all 5 agroecological zones, 10,000+ producers supported", icon: Award }
  ],

  team: {
    title: "Our team",
    subtitle: "Passionate experts serving agriculture",
    members: [
      { name: "Dr. Jean-Baptiste Kamga", role: "Founder & CEO", bio: "Agronomist, PhD in Soil Sciences. 20 years of experience in agropastoral development", image: "/images/team-kamga.jpg" },
      { name: "Marie-Claire Ngo Bata", role: "R&D Director", bio: "Agricultural inputs specialist, former researcher at IRAD", image: "/images/team-ngo.jpg" },
      { name: "Paul Mbida", role: "Commercial Director", bio: "Expert in rural development and farmer training", image: "/images/team-mbida.jpg" },
      { name: "Fatima Hassan", role: "Social Services Director", bio: "Micro-finance and social protection specialist", image: "/images/team-hassan.jpg" }
    ]
  },

  certifications: [
    { name: "MINADER Approval", description: "Official approval for input distribution and producer support", year: "2015" },
    { name: "ISO 9001:2015", description: "Certified quality management", year: "2019" },
    { name: "CEMAC Innovation Award", description: "Best agritech innovation in Central Africa", year: "2021" },
    { name: "Fair Trade Label", description: "Certified fair farmer partnerships", year: "2022" }
  ],

  impact: [
    { metric: "10K+", label: "Producers supported" },
    { metric: "5", label: "Agroecological zones" },
    { metric: "3", label: "Flagship programs" },
    { metric: "8", label: "Sectors covered" }
  ],

  contact: {
    headquarters: "Yaoundé, Cameroon",
    address: "Fouda District — P.O. Box 5111",
    phone: "(+237) 657 39 39 39  |  (+237) 651 92 09 20",
    email: "infos@agri-ps.com",
    hours: "Mon-Fri: 8am-5pm, Sat: 8am-1pm"
  }
};

export default function AProposPage() {
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const { locale } = useLanguage();
  const content = locale === 'en' ? pageContentEN : pageContentFR;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-6"
            >
              {content.hero.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              {content.hero.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-6"
            >
              {content.hero.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-12"
            >
              {content.hero.description}
            </motion.p>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {content.hero.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="text-3xl font-bold text-green-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-4">
              <Target className="w-4 h-4" />
              Mission
            </div>
            <h2 className="text-4xl font-bold mb-4">{content.mission.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {content.mission.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.mission.points.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <point.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">{point.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-6">
            <Eye className="w-4 h-4" />
            Vision 2030
          </div>
          <h2 className="text-4xl font-bold mb-4">{content.vision.title}</h2>
          <p className="text-2xl font-semibold mb-6">{content.vision.subtitle}</p>
          <p className="text-lg mb-8 opacity-90">{content.vision.description}</p>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {content.vision.goals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-left font-semibold">{goal}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {locale === 'en'
                ? <><span className="text-red-500">Our</span> Values</>
                : <><span className="text-red-500">Nos</span> Valeurs</>}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {locale === 'en' ? "What guides every decision we make" : "Ce qui guide chaque décision que nous prenons"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-${value.color}-100 dark:bg-${value.color}-900/30 flex items-center justify-center mb-4`}>
                  <value.icon className={`w-6 h-6 text-${value.color}-600`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-4">
              <Calendar className="w-4 h-4" />
              {locale === 'en' ? "Our History" : "Notre Histoire"}
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {locale === 'en' ? "15 Years of Innovation" : "15 Ans d\u2019Innovation"}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {locale === 'en' ? "The path we have walked together" : "Le chemin parcouru ensemble"}
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-green-200 dark:bg-green-900"></div>

            <div className="space-y-12">
              {content.history.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-20"
                  onMouseEnter={() => setActiveYear(event.year)}
                  onMouseLeave={() => setActiveYear(null)}
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-6 w-5 h-5 rounded-full border-4 transition-all ${
                    activeYear === event.year
                      ? 'bg-green-600 border-green-600 scale-125'
                      : 'bg-white dark:bg-gray-800 border-green-400'
                  }`}></div>

                  <div className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-6 transition-all ${
                    activeYear === event.year ? 'shadow-xl scale-105' : 'shadow-lg'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <event.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600 mb-2">{event.year}</div>
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{content.team.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{content.team.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.team.members.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="relative h-64 bg-gradient-to-br from-green-400 to-emerald-600">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-green-600 dark:text-green-400 font-semibold mb-3 text-sm">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-semibold mb-4">
              <Award className="w-4 h-4" />
              {locale === 'en' ? "Certifications & Awards" : "Certifications & Récompenses"}
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {locale === 'en' ? "Recognized for our Excellence" : "Reconnus pour notre Excellence"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 text-center border-2 border-yellow-200 dark:border-yellow-900/30"
              >
                <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-bold mb-2">{cert.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{cert.description}</p>
                <div className="text-xs font-semibold text-yellow-600">{cert.year}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {locale === 'en' ? "Our Impact in Figures" : "Notre Impact en Chiffres"}
            </h2>
            <p className="text-xl opacity-90">
              {locale === 'en' ? "Concrete results that change lives" : "Des résultats concrets qui changent des vies"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.impact.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-black mb-2">{item.metric}</div>
                <div className="text-lg opacity-90">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {locale === 'en' ? "Find Us" : "Nous Trouver"}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {locale === 'en' ? "AGRIPOINT SERVICES SAS in Yaound\u00e9" : "AGRIPOINT SERVICES SAS \u00e0 Yaound\u00e9"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{locale === 'en' ? "Address" : "Adresse"}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{content.contact.address}</p>
                    <p className="text-gray-600 dark:text-gray-300">{content.contact.headquarters}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{locale === 'en' ? "Phone" : "T\u00e9l\u00e9phone"}</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <a href="tel:+237657393939" className="hover:text-green-600 transition-colors block">(+237) 657 39 39 39</a>
                      <a href="tel:+237651920920" className="hover:text-green-600 transition-colors block">(+237) 651 92 09 20</a>
                    </p>
                    <a href="https://wa.me/237651920920" className="text-sm text-green-600 hover:underline flex items-center gap-1 mt-1">
                      💬 {locale === 'en' ? "WhatsApp available" : "WhatsApp disponible"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">{content.contact.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{locale === 'en' ? "Opening hours" : "Horaires"}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{content.contact.hours}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  href="/contact"
                  className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  {locale === 'en' ? "Contact Us" : "Nous Contacter"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {locale === 'en' ? "Join Our Mission" : "Rejoignez Notre Mission"}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {locale === 'en'
              ? "Together, let's transform African agriculture and create a prosperous future for all"
              : "Ensemble, transformons l\u2019agriculture africaine et cr\u00e9ons un avenir prosp\u00e8re pour tous"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-semibold transition-all"
            >
              {locale === 'en' ? "Become a Member" : "Devenir Adh\u00e9rent"}
            </Link>
            <Link
              href="/produits"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-green-600 rounded-lg font-semibold transition-all"
            >
              {locale === 'en' ? "Discover our products" : "D\u00e9couvrir nos produits"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
