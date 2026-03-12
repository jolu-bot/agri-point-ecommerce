'use client';

import Link from 'next/link';
import { Package, Leaf, Droplets, Users, TrendingUp } from 'lucide-react';
import IntrantsCarousel from '@/components/intrants/IntrantsCarousel';
import ResultsSection from '@/components/intrants/ResultsSection';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FournitureIntrantsPage() {
  const { locale } = useLanguage();

  const fr_benefits = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: 'Produits Certifiés Bio',
      description: "100% bio pour une agriculture durable et respectueuse de l'environnement",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '+30% de Rendement',
      description: 'Augmentation moyenne des rendements agricoles chez nos clients',
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: 'Formules Adaptées',
      description: 'Solutions spécialement conçues pour le climat tropical camerounais',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Accompagnement Expert',
      description: 'Conseil agronome personnalisé pour optimiser vos rendements',
    },
  ];

  const en_benefits = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: 'Certified Organic Products',
      description: '100% organic for sustainable and environmentally friendly agriculture',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '+30% Yield',
      description: 'Average increase in agricultural yields for our clients',
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: 'Adapted Formulas',
      description: 'Solutions specially designed for the Cameroonian tropical climate',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Expert Support',
      description: 'Personalized agronomist advice to optimize your yields',
    },
  ];

  const benefits = locale === 'en' ? en_benefits : fr_benefits;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Breadcrumb */}
      <nav className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              {locale === 'en' ? 'Home' : 'Accueil'}
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/produire-plus" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              {locale === 'en' ? 'Produce More' : 'Produire Plus'}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {locale === 'en' ? "Supply of Inputs" : "Fourniture d'intrants"}
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-premium bg-gradient-to-br from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container-fluid text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 mb-6">
            <Package className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 dark:text-white mb-6">
            {locale === 'en' ? "Supply of Agricultural Inputs" : "Fourniture d'Intrants Agricoles"}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {locale === 'en'
              ? <>Complete range of <strong>mineral fertilizers and bio-fertilizers</strong> of high quality to increase the production of all crops in Cameroon</>
              : <>Gamme compl&egrave;te d&apos;<strong>engrais min&eacute;raux et bio-fertilisants</strong> de grande qualit&eacute; pour augmenter la production de toutes les cultures au Cameroun</>
            }
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container-fluid py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carousel d'intrants */}
      <IntrantsCarousel />

      {/* Content Section */}
      <section className="container-fluid py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? "Why our agricultural inputs?" : "Pourquoi nos intrants agricoles ?"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {locale === 'en'
                  ? "At AGRIPOINT SERVICES, we understand the challenges of Cameroonian farmers. That is why we offer a range of agricultural inputs specially selected and adapted to the realities of our agro-climatic context. Our products combine effectiveness, sustainability and affordability."
                  : "Chez AGRIPOINT SERVICES, nous comprenons les défis des agriculteurs camerounais. C'est pourquoi nous proposons une gamme d'intrants agricoles spécialement sélectionnés et adaptés aux réalités de notre contexte agro-climatique. Nos produits combinant efficacité, durabilité et affordabilité."
                }
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? "Our Complete Range" : "Notre Gamme Complète"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                    {locale === 'en' ? "Mineral Fertilizers" : "Engrais Minéraux"}
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {locale === 'en' ? (
                      <>
                        <li>• Balanced NPK for all crops</li>
                        <li>• Concentrated nitrogen fertilizers</li>
                        <li>• Formulated for tropical soil</li>
                        <li>• Easy and fast application</li>
                      </>
                    ) : (
                      <>
                        <li>• NPK équilibrés pour toutes cultures</li>
                        <li>• Engrais azotés concentrés</li>
                        <li>• Formulés pour sol tropical</li>
                        <li>• Application facile et rapide</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                    {locale === 'en' ? "Biofertilizers" : "Bio-fertilisants"}
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {locale === 'en' ? (
                      <>
                        <li>• 100% bio-certified</li>
                        <li>• Natural humic acids</li>
                        <li>• Growth stimulants</li>
                        <li>• Environmentally friendly</li>
                      </>
                    ) : (
                      <>
                        <li>• 100% bio-certifiés</li>
                        <li>• Acides humiques naturels</li>
                        <li>• Stimulants de croissance</li>
                        <li>• Respectent l&apos;environnement</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? "How Does it Work?" : "Comment ça Marche ?"}
              </h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    step: '1',
                    title: locale === 'en' ? 'Diagnosis' : 'Diagnostic',
                    description: locale === 'en'
                      ? 'Our agronomists analyze your soil and specific needs'
                      : 'Nos agronomes analysent votre sol et vos besoins spécifiques',
                  },
                  {
                    step: '2',
                    title: 'Recommendation',
                    description: locale === 'en'
                      ? 'Selection of the most suitable inputs for your crops'
                      : 'Sélection des intrants les plus adaptés à vos cultures',
                  },
                  {
                    step: '3',
                    title: 'Application',
                    description: locale === 'en'
                      ? 'Monitoring and advice for optimal application and measurable results'
                      : 'Suivi et conseil pour une application optimale et des résultats mesurables',
                  },
                ].map((item) => (
                  <div key={item.step} className="relative p-6 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mt-2 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <ResultsSection />

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? "Availability and Delivery" : "Disponibilité et Livraison"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {locale === 'en'
                  ? "Our inputs are available at all our AGRIPOINT SERVICES service points across Cameroon. We also offer a delivery service for large orders directly to your farm. To check availability and get a personalized quote, contact our experts now."
                  : "Nos intrants sont disponibles dans tous nos points de service AGRIPOINT SERVICES à travers le Cameroun. Nous proposons également un service de livraison pour les commandes importantes directement à votre exploitation agricole. Pour connaître les disponibilités et obtenir un devis personnalisé, contactez nos experts dés maintenant."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 dark:bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors"
                >
                  {locale === 'en' ? "Contact Us" : "Nous Contacter"}
                </Link>
                <Link
                  href="/produire-plus"
                  className="inline-flex items-center justify-center px-8 py-3 border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                >
                  {locale === 'en' ? "Back to Produce More" : "Retour à Produire Plus"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
