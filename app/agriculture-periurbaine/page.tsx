'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext';
import {
  MapPin,
  Tractor,
  Droplets,
  Sun,
  Smartphone,
  TrendingUp,
  Users,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Star,
  Leaf,
  Zap,
  Shield,
  Target,
  Lightbulb,
  AlertTriangle,
  BarChart2,
  Globe,
  Sprout,
  Warehouse,
  Truck,
  TreePine,
  FlaskConical,
  Wrench,
  Wheat,
  Clock,
  Ruler,
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/models/Product';

const pageContent = {
  hero: {
    badge: 'Maillon Vital Ville–Campagne',
    title: 'AGRICULTURE PÉRI-URBAINE',
    subtitle: 'Nourrir les villes depuis leurs ceintures vertes',
    description:
      "l\u2019agriculture périurbaine est le levier stratégique de la souveraineté alimentaire au Cameroun. Entre 0,5 et 20 hectares, entre tradition et innovation, nos exploitations périurbaines approvisionnent les marchés d\'Yaoundé, Douala et de toutes les grandes villes.",
    cta: {
      primary: 'Développer mon exploitation',
      secondary: 'Voir nos solutions',
    },
  },

  stats: [
    { value: '60%', label: 'des légumes frais en ville issus des péri-zones', icon: Leaf },
    { value: '2,5M', label: 'de personnes dépendent de ces exploitations', icon: Users },
    { value: '+45%', label: 'de rendement avec nos techniques modernes', icon: TrendingUp },
    { value: '20 000', label: 'ha couverts par AGRIPOINT SERVICES au Cameroun', icon: MapPin },
  ],

  definition: {
    title: "Qu\'est-ce que l\u2019agriculture Périurbaine ?",
    subtitle:
      "La zone de transition entre la ville et la campagne — un espace stratégique souvent sous-estimé.",
    description:
      "l\u2019agriculture péri-urbaine désigne les activités agricoles localisées en périphérie des villes (5 à 50 km), dans des espaces en constante pression foncière. Au Cameroun, cette ceinture verte représente un système alimentaire critique : elle fournit les marchés urbains en produits frais, génère des emplois ruraux et contribue à la résilience alimentaire nationale.",
    caracteristics: [
      {
        icon: MapPin,
        title: 'Localisation Stratégique',
        desc: 'Périmètre de 5 à 50 km autour des centres urbains. Accès aux marchés en 1h maximum.',
      },
      {
        icon: Tractor,
        title: 'Échelle Intermédiaire',
        desc: "De 0,5 ha à 20+ ha. Plus grands que les jardins urbains, plus intenses que l\u2019agriculture rurale.",
      },
      {
        icon: ShoppingCart,
        title: 'Orientation Commerciale',
        desc: "Production destinée à 60-80% à la vente sur les marchés locaux. Logique d\'entreprise agricole.",
      },
      {
        icon: Users,
        title: 'Emploi & Social',
        desc: "Principale source d\'emploi des femmes rurales au Cameroun. 3 à 10 emplois permanents par exploitation.",
      },
    ],
  },

  zones: {
    title: 'Zones Périurbaines Clés au Cameroun',
    subtitle: 'AGRIPOINT SERVICES vous accompagne sur tout le territoire national',
    regions: [
      {
        city: 'Yaoundé',
        zones: ['Mfoundi', 'Soa', 'Nkolafamba', 'Mbankomo', 'Obala'],
        productions: ['Maraîchage', 'Aviculture', 'Porcelets', 'Banane plantain'],
        potential: 'Très élevé',
        color: 'emerald',
        hectares: '~4 500 ha exploités',
      },
      {
        city: 'Douala',
        zones: ['Manoka', 'Dibamba', 'Japoma', 'Logbaba', 'Bonamoussadi'],
        productions: ['Légumes feuilles', 'Poisson fumé', 'Manioc', 'Canne à sucre'],
        potential: 'Très élevé',
        color: 'blue',
        hectares: '~6 200 ha exploités',
      },
      {
        city: 'Bafoussam / Ouest',
        zones: ['Santa', 'Babadjou', 'Foumbot', 'Tibati'],
        productions: ['Pomme de terre', 'Maïs hybride', 'Haricot vert', 'Fraise'],
        potential: 'Exceptionnel',
        color: 'amber',
        hectares: '~8 100 ha exploités',
      },
      {
        city: 'Bertoua / Est',
        zones: ['Mandjou', 'Abong-Mbang', 'Doumé'],
        productions: ['Cacao', 'Café', 'Vivriers', 'Maraîchage de saison'],
        potential: 'Fort',
        color: 'orange',
        hectares: '~2 800 ha exploités',
      },
      {
        city: 'Garoua / Nord',
        zones: ['Mayo Kébbi', 'Ngong', 'Pitoa', 'Demsa'],
        productions: ['Oignon', 'Tomate', 'Poivron', 'Gombo'],
        potential: 'Fort',
        color: 'red',
        hectares: '~3 200 ha exploités',
      },
      {
        city: 'Kribi / Littoral Sud',
        zones: ['Akom II', 'Campo', 'Bipindi'],
        productions: ['Cultures maraîchères', 'Palmier à huile', 'Cacao fin'],
        potential: 'Moyen',
        color: 'teal',
        hectares: '~1 400 ha exploités',
      },
    ],
  },

  systems: {
    title: 'Systèmes de Production Périurbains',
    subtitle:
      "Chaque exploitation est unique. AGRIPOINT SERVICES propose des solutions sur-mesure pour chaque système.",
    items: [
      {
        icon: Sprout,
        title: 'Maraîchage Intensif',
        description:
          'Production de légumes à cycle court sur parcelles de 0,5 à 3 ha. Tomates, choux, laitues, carottes, concombres, piments. Revenu régulier toute l\u2019année.',
        investment: '500 000 – 3 000 000 FCFA',
        return: '6 à 12 mois',
        area: '0,5 – 3 ha',
        margin: '60–80%',
        color: 'green',
        products: ['FOSNUTREN 20', 'AMINOL 20', 'KADOSTIM 20'],
        techniques: [
          'Pépinières protégées avec ombrière 50%',
          'Irrigation goutte-à-goutte programmée',
          'Fertilisation raisonnée NPK + biostimulants',
          'Rotation cultures 3 cycles/an',
        ],
      },
      {
        icon: Tractor,
        title: 'Vivriers Commerciaux',
        description:
          'Manioc, plantain, igname, macabo sur grandes parcelles. Production de masse pour les marchés centraux. Complémentarité saison sèche/humide.',
        investment: '1 000 000 – 8 000 000 FCFA',
        return: '12 à 18 mois',
        area: '2 – 15 ha',
        margin: '45–65%',
        color: 'amber',
        products: ['HUMIFORTE', 'NATUR CARE', 'SARAH NPK'],
        techniques: [
          "Plants certifiés haute performance (IRAD)",
          'Mécanisation partielle (motoculteur)',
          'Amendement organo-minéral du sol',
          'Stockage en cossettes sèches / chambres froides',
        ],
      },
      {
        icon: Sun,
        title: 'Arboriculture Fruitière',
        description:
          'Vergers de manguiers, avocatiers, agrumes, papayers sur 1 à 10 ha. Revenus différés mais durables sur 20+ ans. Complémentarité avec maraîchage.',
        investment: '2 000 000 – 15 000 000 FCFA',
        return: '24 à 48 mois (1ère récolte)',
        area: '1 – 10 ha',
        margin: '70–90%',
        color: 'orange',
        products: ['HUMIFORTE', 'KADOSTIM 20', 'SARAH NPK'],
        techniques: [
          'Plants greffés certifiés',
          'Couverture herbacée inter-rangée',
          'Taille de formation TIC-TEC',
          'Traitement post-récolte conservation',
        ],
      },
      {
        icon: Warehouse,
        title: 'Élevage Hors-Sol Périurbain',
        description:
          'Aviculture (poulets de chair, pondeuses), élevage porcin ou cunicole en intégration avec maraîchage. Le fumier fertilise les légumes, les tiges nourrissent les animaux.',
        investment: '1 500 000 – 10 000 000 FCFA',
        return: '8 à 16 mois',
        area: '0,5 – 3 ha bâti',
        margin: '50–75%',
        color: 'yellow',
        products: ['NATUR CARE', 'HUMIFORTE'],
        techniques: [
          'Bâtiments ventilés naturellement (orientés Est-Ouest)',
          'Compostage efficace du fumier (Bokashi)',
          'Valorisation du lisier comme engrais liquide',
          'Cycle biogaz micro-ferme (digestion anaérobie)',
        ],
      },
    ],
  },

  technologies: {
    title: 'Technologies Modernes Adaptées à l\u2019Afrique',
    subtitle: 'Innovez avec des solutions éprouvées et accessibles',
    items: [
      {
        icon: Droplets,
        name: 'Irrigation Goutte-à-Goutte',
        description:
          'Économie de 60% d\u2019eau vs arrosage traditionnel. Kits complets disponibles entre 150 000 et 1 200 000 FCFA selon surface. Compatible avec pompe solaire.',
        advantages: [
          'Économie d\u2019eau -60%',
          'Réduction maladies foliaires',
          'Fertilisation par le goutte (fertigation)',
          'Automatisable avec timer',
        ],
        localSupply: 'Disponible à Yaoundé, Douala, Bafoussam',
        color: 'blue',
        priceRange: '150 000 – 1 200 000 FCFA',
      },
      {
        icon: Zap,
        name: 'Pompes Solaires Photovoltaïques',
        description:
          'Pompage sans carburant. Rentabilisées en 2-3 ans vs motopompe thermique. Marques accessibles : Lorentz, Grundfos, SunPump, Shurflo. Débit 1 000 à 20 000 L/h.',
        advantages: [
          'Zéro carburant, zéro facture électrique',
          'Amortissement en 24-36 mois',
          'Maintenance minimale (durée vie 20+ ans)',
          'Pompage jours ensoleillés = besoin irrigation',
        ],
        localSupply: 'Installateurs certifiés dans 8 villes',
        color: 'amber',
        priceRange: '800 000 – 5 000 000 FCFA (kit complet)',
      },
      {
        icon: Smartphone,
        name: 'Applications Mobiles Agricoles',
        description:
          'Outils numériques pour informer, planifier et vendre. Accessibles sur smartphone bas de gamme avec réseau 3G/4G.',
        advantages: [
          'eSoko / CAMERCAP-PARC : prix des marchés en temps réel',
          'AgriPrix Cameroun : cours hebdomadaires légumes',
          'AgriBot AGRIPOINT SERVICES : conseils agronomiques IA 24h/24',
          'Mobile Money : paiement et réception acheteurs',
        ],
        localSupply: 'Applications gratuites ou < 5 000 FCFA/mois',
        color: 'indigo',
        priceRange: 'Gratuit à 10 000 FCFA/mois',
      },
      {
        icon: FlaskConical,
        name: 'Biostimulants & Engrais Précis',
        description:
          'Gamme TIMAC AGRO distribuée exclusivement par AGRIPOINT SERVICES. Formulations adaptées aux sols camerounais. Augmentation rendements de 30 à 50% vs pratiques traditionnelles.',
        advantages: [
          'HUMIFORTE : enracinement +40%, résistance sécheresse',
          'FOSNUTREN 20 : démarrage rapide, TSP + soufre',
          'AMINOL 20 : nutrition foliaire acides aminés',
          'KADOSTIM 20 : biostimulant floraison-nouaison',
        ],
        localSupply: 'Réseau de 45+ distributeurs au Cameroun',
        color: 'green',
        priceRange: 'Sur devis - livraison incluse',
      },
      {
        icon: Globe,
        name: 'Drones Agricoles',
        description:
          'Cartographie de parcelles, traitement phytosanitaire aérien, surveillance stress hydrique. Prestataires locaux émergents à Yaoundé et Douala.',
        advantages: [
          'Cartographie précise (orthophotos)',
          'Traitement 15 ha/h vs 1,5 ha/h à dos',
          'Détection précoce maladies et stress',
          'Réduction intrants phytosanitaires -30%',
        ],
        localSupply: 'Prestataires disponibles à Yaoundé / Douala',
        color: 'purple',
        priceRange: 'Location : 15 000 – 50 000 FCFA/ha',
      },
      {
        icon: Warehouse,
        name: 'Chambres Froides Solaires',
        description:
          'Conservation 7-21 jours des légumes frais. Technologie Modular Cold Rooms (CoolBot, SolarChill). Réduction pertes post-récolte de 40% à moins de 5%.',
        advantages: [
          'Pertes post-récolte -80%',
          'Vente différée au meilleur prix',
          'Mutualisation 3-5 exploitations',
          'Accessible via crédit rural (CAMCCUL)',
        ],
        localSupply: 'Fabricants locaux + imports Chine/Inde',
        color: 'cyan',
        priceRange: '3 500 000 – 12 000 000 FCFA',
      },
    ],
  },

  localTools: {
    title: 'Outils Locaux & Tradition Revisitée',
    subtitle: 'Les outils dans lesquels votre main a confiance, optimisés pour la performance',
    items: [
      {
        icon: Wrench,
        name: 'Daba Améliorée (Pioche Angolaise)',
        origin: 'Cameroun / Afrique de l\'Ouest',
        description: 'Outil universel de travail du sol. Les versions ergonomiques modernes (manche coudé al 110°) réduisent la fatigue de 35% et augmentent la productivité de 25%.',
        modernUpgrade: 'Manches en fibre de verre (2× plus léger, incassable) — disponibles dans les quincailleries de Yaoundé/Douala.',
        cost: '3 500 – 15 000 FCFA',
      },
      {
        icon: Droplets,
        name: 'Arrosoir à Pression Manuelle',
        origin: 'Universel',
        description: 'Pour les petites parcelles ou pépinières : arrosoir 10-20L avec pomme amovible (pomme fine = semis-repiquage, pomme grossière = arrosage). Incontournable.',
        modernUpgrade: 'Arrosoir à pression préalable (2 bar) : économie eau 40%, arrosage uniforme sans effort.',
        cost: '5 000 – 25 000 FCFA',
      },
      {
        icon: Tractor,
        name: 'Motoculteur Mono-Axe (Power Tiller)',
        origin: 'Asie → adapté Afrique',
        description: 'Machine à deux roues motorisée pour labour, billonnage, sarclage. Modèles Dongfeng, Agria, Robin disponibles. Permet de travailler 10× plus vite qu\'à la daba.',
        modernUpgrade: 'Version électrique (batterie lithium) émergente — pas de fumées, silencieuse, parfaite zones périurbaines dense.',
        cost: '350 000 – 800 000 FCFA (thermique)',
      },
      {
        icon: Zap,
        name: 'Pompe à Moteur (Motopompe)',
        origin: 'Standard Afrique',
        description: 'Motopompe Honda/Loncin de 2" à 4" de refoulement. Indispensable pour l\u2019irrigation en saison sèche. Débit 20 000 à 80 000 L/h pour les grandes parcelles.',
        modernUpgrade: 'Substitution progressive par pompe solaire = plus de carburant, plus de pannes, rentabilité en 30 mois.',
        cost: '80 000 – 350 000 FCFA',
      },
      {
        icon: Shield,
        name: 'Pulvérisateur à Dos (16-20L)',
        origin: 'Standard mondial',
        description: 'Outil quotidien des maraîchers. La qualité varie énormément : privilégier les modèles à piston en laiton (Solo, Birchmeier, Okapi) pour durabilité.',
        modernUpgrade: 'Pulvérisateur électrique à batterie (18V Li-ion) : pression constante, sans pompage manuel, 20 000-60 000 FCFA.',
        cost: '15 000 – 60 000 FCFA',
      },
      {
        icon: Truck,
        name: 'Moto-Tricycle de Transport',
        origin: 'Chine → popularisé Cameroun',
        description: 'Solution logistique clé des marchés périurbains camerounais. Transport 300-800 kg de production du champ au marché. 10× moins cher que véhicule léger.',
        modernUpgrade: 'Tricycles électriques (ZAP, Kenyan brands) : 0 carburant, revient à 500 FCFA/100km. Financement disponible (Orange Energy, BDEAC).',
        cost: '900 000 – 2 500 000 FCFA (thermique)',
      },
    ],
  },

  challenges: {
    title: 'Défis & Solutions AGRIPOINT SERVICES',
    subtitle: 'Nous anticipons les obstacles pour que vous puissiez vous concentrer sur la production',
    items: [
      {
        challenge: 'Insécurité foncière',
        icon: MapPin,
        description: 'Le manque de titres fonciers décourage l\'investissement et l\'accès au crédit.',
        solutions: [
          'Accompagnement immatriculation foncière simplifiée (MINDCAF)',
          'Contrats de bail sécurisés longue durée (5-20 ans)',
          'Groupements d\u2019intérêt économique (GIE) pour négociation collective',
          'Mise en relation avec associations foncières locales',
        ],
        color: 'red',
      },
      {
        challenge: 'Accès à l\'eau (saison sèche)',
        icon: Droplets,
        description: 'La saison sèche (novembre à mars au Sud) stoppe la production sans irrigation permanente.',
        solutions: [
          'Forage + pompe solaire : indépendance totale réseau',
          'Citernes aériennes (50 000 à 500 000L) : stockage saison des pluies',
          'Irrigation goutte-à-goutte : multiplication parcelles irriguées',
          'Paillage mulching : réduction besoin eau -40%',
        ],
        color: 'blue',
      },
      {
        challenge: 'Pertes post-récolte élevées',
        icon: AlertTriangle,
        description: '30 à 50% de pertes entre champ et marché. Principale cause de faibles marges.',
        solutions: [
          'Récolte aux heures fraîches (5h-8h) + conditionnement rapide',
          'Chambres froides solaires collectives',
          'Transformation artisanale (séchage, concentrés, confitures)',
          'Vente directe via WhatsApp/Facebook Marketplace',
        ],
        color: 'orange',
      },
      {
        challenge: 'Accès aux marchés',
        icon: Truck,
        description:
          "L\'éloignement des grands marchés et la dépendance aux intermédiaires réduisent le prix bord-champ de 50 à 70%.",
        solutions: [
          'Groupements de vente collective (GIE maraîchers)',
          'Contrats directs restaurants, hôtels, supermarchés (MAHIMA, Score)',
          'E-commerce local (CoopérAgri, Agri-Market, WhatsApp Business)',
          'Marchés de producteurs hebdomadaires (MINADER)',
        ],
        color: 'purple',
      },
      {
        challenge: 'Dégradation des sols',
        icon: Leaf,
        description: 'La monoculture intensive dégrade rapidement la structure et la fertilité des sols périurbains.',
        solutions: [
          'Rotation culturale systématique (légumineuses fixatrices)',
          'Apports réguliers de matière organique (NATUR CARE)',
          'Analyse de sol annuelle (IRAD, SAILD)',
          'Couverture permanente du sol — zéro sol nu',
        ],
        color: 'green',
      },
      {
        challenge: 'Financement & crédit',
        icon: BarChart2,
        description: 'Les banques classiques refusent 80% des dossiers agricoles. Les taux microfinance sont souvent prohibitifs.',
        solutions: [
          'CAMCCUL : crédit agricole coopératif (taux 12-18%/an)',
          'BDEAC : financement projets agro-PME (> 5M FCFA)',
          'Subventions MINADER : PNDP, PACA, C2D',
          'Warrantage : crédit sur stock (grenier communautaire)',
        ],
        color: 'yellow',
      },
    ],
  },

  steps: {
    title: 'Développez Votre Exploitation en 6 Étapes',
    items: [
      {
        number: '01',
        icon: Target,
        title: 'Diagnostic Agronomique',
        description:
          'Analyse de votre sol, de l\'eau disponible, du microclimat, des marchés à proximité. Identification du système de production le plus rentable pour votre contexte.',
        duration: '1 semaine',
        action: 'Gratuit pour clients AGRIPOINT SERVICES',
      },
      {
        number: '02',
        icon: Lightbulb,
        title: 'Plan d\'Affaires Agricole',
        description:
          'Projection financière sur 3 ans, plan de trésorerie mensuel, calendrier cultural, besoins en intrants. Dossier bankable pour accès crédit.',
        duration: '1 semaine',
        action: 'Accompagnement par nos agronomes',
      },
      {
        number: '03',
        icon: Droplets,
        title: 'Infrastructure Hydraulique',
        description:
          "Installation forage ou retenue d\u2019eau, pompe solaire, réseau goutte-à-goutte. Le principal investissement — il sécurise 100% de votre production.",
        duration: '2-4 semaines',
        action: 'Devis gratuit AGRIPOINT SERVICES',
      },
      {
        number: '04',
        icon: Sprout,
        title: 'Mise en Production',
        description:
          "Semences certifiées, pépinières soignées, fertilisation de fond avec HUMIFORTE et NATUR CARE. Suivi hebdomadaire par technicien AGRIPOINT SERVICES.",
        duration: '1ère récolte J+45 à J+90',
        action: 'Formation pratique incluse',
      },
      {
        number: '05',
        icon: BarChart2,
        title: 'Optimisation & Scale',
        description:
          "Après 2 cycles réussis : extension surface, diversification productions, intégration élevage, structuration GIE pour l\'accès aux marchés institutionnels.",
        duration: '6-12 mois',
        action: 'Révision plan annuel',
      },
      {
        number: '06',
        icon: TrendingUp,
        title: 'Accès Marchés & Certification',
        description:
          "Certification bio GlobalGAP ou PGS local, contrats restaurants/hôtels, accès supermarchés. Transformation et valorisation surplus.",
        duration: '12-24 mois',
        action: 'Mise en réseau acheteurs',
      },
    ],
  },

  testimonials: [
    {
      name: 'Alphonse Nkouele',
      location: 'Soa, Périphérie Yaoundé',
      zone: '3,5 ha maraîchage',
      text: "Avant AGRIPOINT SERVICES, mes rendements de tomates ne dépassaient pas 8 tonnes à l\'hectare. Avec FOSNUTREN 20 et l\u2019irrigation goutte-à-goutte, j\'atteins 25 t/ha. J\'ai pu agrandir ma parcelle et employer 6 personnes à temps plein.",
      rating: 5,
      result: '+213% de rendement en tomates',
      image: '/images/testimonial-alphonse.jpg',
    },
    {
      name: 'Cécile Awona Bolo',
      location: 'Logbaba, Périphérie Douala',
      zone: '1,8 ha légumes feuilles + volaille',
      text: "J\'ai intégré 500 poules pondeuses avec mon maraîchage grâce aux conseils d\u2019AGRIPOINT SERVICES. Le compost de volaille remplace la moitié de mes engrais chimiques. Mes revenus ont doublé en 18 mois.",
      rating: 5,
      result: 'Revenus x2 — Exploitation intégrée',
      image: '/images/testimonial-cecile.jpg',
    },
    {
      name: 'Ibrahim Oumarou',
      location: 'Ngong, Périphérie Garoua',
      zone: '5 ha oignon + tomate',
      text: "La pompe solaire que m\'a recommandée AGRIPOINT SERVICES a changé ma vie. Plus de 80 000 FCFA de carburant économisés chaque mois. Je produis maintenant en saison sèche quand les prix sont les meilleurs.",
      rating: 5,
      result: '80 000 FCFA/mois économisés en carburant',
      image: '/images/testimonial-ibrahim.jpg',
    },
  ],

  crops: [
    { name: 'Tomate (hybride F1)', cycle: '75 – 90 j', yield: '20 – 40 t/ha', margin: 'Très élevée', ideal: 'Tout Cameroun' },
    { name: 'Chou pommé', cycle: '70 – 90 j', yield: '25 – 45 t/ha', margin: 'Élevée', ideal: 'Hauts Plateaux' },
    { name: 'Poivron / Piment', cycle: '90 – 120 j', yield: '8 – 15 t/ha', margin: 'Très élevée', ideal: 'Nord / Littoral' },
    { name: 'Oignon sec', cycle: '120 – 150 j', yield: '12 – 25 t/ha', margin: 'Très élevée', ideal: 'Nord-Cameroun' },
    { name: 'Laitue', cycle: '35 – 50 j', yield: '15 – 30 t/ha', margin: 'Élevée', ideal: 'Zone forestière' },
    { name: 'Carotte', cycle: '80 – 100 j', yield: '15 – 30 t/ha', margin: 'Élevée', ideal: 'Hauts Plateaux' },
    { name: 'Manioc amélioré', cycle: '9 – 12 mois', yield: '25 – 50 t/ha', margin: 'Bonne', ideal: 'Zone forestière / Centre' },
    { name: 'Banane plantain', cycle: '9 – 14 mois', yield: '15 – 35 t/ha', margin: 'Élevée', ideal: 'Sud / Littoral' },
    { name: 'Maïs hybride', cycle: '90 – 110 j', yield: '5 – 12 t/ha', margin: 'Moyenne', ideal: 'Tout Cameroun' },
    { name: 'Avocat Hass', cycle: '24 – 36 mois (1ère)', yield: '10 – 30 t/ha/an', margin: 'Très élevée', ideal: 'Hauts Plateaux / Ouest' },
  ],
};

export default function AgriculturePeriurbainePage() {
  const { T } = useLanguage();
  const statLabels = [T.agriPeriUrbaine.stat1, T.agriPeriUrbaine.stat2, T.agriPeriUrbaine.stat3, T.agriPeriUrbaine.stat4];
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products?category=engrais_mineral&limit=6');
      if (response.ok) {
        const data = await response.json();
        const prods = data.products?.slice(0, 6) || [];
        // Fallback: si pas assez, charger tous produits
        if (prods.length < 3) {
          const r2 = await fetch('/api/products?limit=6');
          if (r2.ok) {
            const d2 = await r2.json();
            setProducts(d2.products?.slice(0, 6) || []);
          } else {
            setProducts(prods);
          }
        } else {
          setProducts(prods);
        }
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-amber-50 via-green-50 to-orange-50 dark:from-gray-900 dark:via-amber-900/10 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-10 w-80 h-80 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold mb-8 shadow-lg"
            >
              <Wheat className="w-4 h-4" />
              {T.agriPeriUrbaine.heroBadge}
            </m.div>

            <m.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white mb-6 leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-green-600">
                {T.agriPeriUrbaine.heroTitle}
              </span>
            </m.h1>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4"
            >
              {T.agriPeriUrbaine.heroSubtitle}
            </m.p>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto"
            >
              {T.agriPeriUrbaine.heroDesc}
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="#etapes"
                className="group px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-2xl"
              >
                <Tractor className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                {T.agriPeriUrbaine.heroCta1}
              </a>
              <a
                href="#systemes"
                className="px-10 py-5 border-2 border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
              >
                {T.agriPeriUrbaine.heroCta2}
                <ArrowRight className="w-6 h-6" />
              </a>
            </m.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {pageContent.stats.map((stat, index) => (
                <m.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                    <stat.icon className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                    <div className="text-3xl xl:text-4xl font-black text-amber-600 mb-1">{stat.value}</div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 leading-tight">{statLabels[index]}</div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ DÉFINITION ═════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
                {T.agriPeriUrbaine.defTitle}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
              {pageContent.definition.subtitle}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {pageContent.definition.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pageContent.definition.caracteristics.map((item, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ZONES CLÉS ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                {T.agriPeriUrbaine.zonesTitle}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{T.agriPeriUrbaine.zonesSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageContent.zones.regions.map((region, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    {region.city}
                  </h3>
                  <span className="text-xs font-bold px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                    {T.agriPeriUrbaine.potentiel} {region.potential}
                  </span>
                </div>

                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  {T.agriPeriUrbaine.zonesCouvertes}
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {region.zones.map((z, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      {z}
                    </span>
                  ))}
                </div>

                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  {T.agriPeriUrbaine.productionsPhares}
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {region.productions.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                      <Sprout className="w-3 h-3" /> {p}
                    </span>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold">
                  <Ruler className="w-3 h-3" /> {region.hectares}
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SYSTÈMES DE PRODUCTION ════════════════════════════════════════ */}
      <section id="systemes" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-green-600">
                {T.agriPeriUrbaine.systemsTitle}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{T.agriPeriUrbaine.systemsSubtitle}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {pageContent.systems.items.map((system, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <system.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{system.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{system.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{T.agriPeriUrbaine.invest}</p>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-tight">{system.investment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{T.agriPeriUrbaine.retour}</p>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">{system.return}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{T.agriPeriUrbaine.surface}</p>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{system.area}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{T.agriPeriUrbaine.marge}</p>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">{system.margin}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {T.agriPeriUrbaine.techniques}
                  </p>
                  <ul className="space-y-1.5">
                    {system.techniques.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Produits AGRIPOINT SERVICES recommandés
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {system.products.map((p, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-bold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TECHNOLOGIES ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
                {pageContent.technologies.title}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {pageContent.technologies.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageContent.technologies.items.map((tech, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <tech.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{tech.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{tech.description}</p>

                <ul className="space-y-1.5 mb-4">
                  {tech.advantages.map((adv, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {adv}
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {tech.localSupply}
                  </div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    💰 {tech.priceRange}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ OUTILS LOCAUX ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">
                {pageContent.localTools.title}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {pageContent.localTools.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageContent.localTools.items.map((tool, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-sm leading-tight">{tool.name}</h3>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">{tool.origin}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{tool.description}</p>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-3 border-l-4 border-green-500">
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">⬆️ Version moderne</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{tool.modernUpgrade}</p>
                </div>

                <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  💰 {tool.cost}
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DÉFIS & SOLUTIONS ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-red-50/30 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {pageContent.challenges.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {pageContent.challenges.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageContent.challenges.items.map((item, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border-b border-red-100 dark:border-red-900/20">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="w-6 h-6 text-red-500" />
                    <h3 className="font-black text-gray-900 dark:text-white">{item.challenge}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wide">
                    ✅ Nos Solutions
                  </p>
                  <ul className="space-y-2">
                    {item.solutions.map((sol, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <ArrowRight className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {sol}
                      </li>
                    ))}
                  </ul>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TABLEAU CULTURES ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Cultures Phares Périurbaines</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Données agronomiques vérifiées pour les conditions camerounaises
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-2xl overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-amber-500">
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-gray-100">Culture</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-gray-100">Cycle</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-gray-100">Rendement</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-gray-100">Marge</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-gray-100">Zone Idéale</th>
                </tr>
              </thead>
              <tbody>
                {pageContent.crops.map((crop, index) => (
                  <m.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    className="border-b border-amber-200 dark:border-gray-600 hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">{crop.name}</td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">{crop.cycle}</td>
                    <td className="py-4 px-4 font-bold text-green-600 dark:text-green-400 text-sm">{crop.yield}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                        crop.margin === 'Très élevée'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : crop.margin === 'Élevée'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {crop.margin}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">{crop.ideal}</td>
                  </m.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ ÉTAPES ══════════════════════════════════════════════════════════ */}
      <section id="etapes" className="py-20 bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">{pageContent.steps.title}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageContent.steps.items.map((step, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all h-full"
              >
                <div className="text-7xl font-black text-amber-200 dark:text-amber-900/40 mb-4">{step.number}</div>
                <div className="w-14 h-14 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{step.description}</p>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" /> {step.duration}
                  </div>
                  <div className="block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold w-fit flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {step.action}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Ils Ont Transformé Leur Exploitation</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Des producteurs périurbains qui ont réussi avec AGRIPOINT SERVICES
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pageContent.testimonials.map((testimonial, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold">
                    <Wheat className="w-3.5 h-3.5" /> {testimonial.result}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-base leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{testimonial.zone}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRODUITS ════════════════════════════════════════════════════════ */}
      <section id="produits" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-green-600">
                Intrants Recommandés AGRIPOINT SERVICES
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Gamme TIMAC AGRO — testée et approuvée sur les sols camerounais
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
              <p>Produits disponibles prochainement</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/produits"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-bold text-lg transition-all shadow-2xl transform hover:scale-105"
            >
              Voir tous nos intrants
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-green-600"></div>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Prêt à Professionnaliser Votre Exploitation ?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            Nos agronomes se déplacent sur votre parcelle — diagnostic gratuit pour tout producteur
            périurbain camerounais
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group px-10 py-5 bg-white text-amber-600 hover:bg-gray-100 rounded-2xl font-bold text-lg transition-all shadow-2xl flex items-center justify-center gap-3"
            >
              <Tractor className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Demander un diagnostic gratuit
            </Link>
            <Link
              href="/produits"
              className="px-10 py-5 border-2 border-white text-white hover:bg-white hover:text-amber-600 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3"
            >
              Voir nos intrants
              <ShoppingCart className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

