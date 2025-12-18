const mongoose = require('mongoose');
const path = require('path');

// Configuration de la connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-point';

// Définition du schéma SiteConfig
const siteConfigSchema = new mongoose.Schema({
  branding: {
    siteName: { type: String, default: 'AGRI POINT SERVICE' },
    tagline: { type: String, default: 'Produire plus, Gagner plus, Mieux vivre' },
    logoUrl: { type: String, default: '/images/logo.svg' },
    faviconUrl: { type: String, default: '/favicon.ico' },
  },
  colors: {
    primary: { type: String, default: '#1B5E20' },
    primaryLight: { type: String, default: '#4caf50' },
    secondary: { type: String, default: '#B71C1C' },
    secondaryLight: { type: String, default: '#ef5350' },
    accent: { type: String, default: '#57534e' },
    background: { type: String, default: '#ffffff' },
    text: { type: String, default: '#0f172a' },
  },
  typography: {
    fontFamily: {
      heading: { type: String, default: 'Montserrat' },
      body: { type: String, default: 'Inter' },
    },
    fontSize: {
      xs: { type: String, default: '0.75rem' },
      sm: { type: String, default: '0.875rem' },
      base: { type: String, default: '1rem' },
      lg: { type: String, default: '1.125rem' },
      xl: { type: String, default: '1.25rem' },
      '2xl': { type: String, default: '1.5rem' },
      '3xl': { type: String, default: '1.875rem' },
      '4xl': { type: String, default: '2.25rem' },
      '5xl': { type: String, default: '3rem' },
      '6xl': { type: String, default: '3.75rem' },
    },
    fontWeight: {
      light: { type: Number, default: 300 },
      normal: { type: Number, default: 400 },
      medium: { type: Number, default: 500 },
      semibold: { type: Number, default: 600 },
      bold: { type: Number, default: 700 },
      extrabold: { type: Number, default: 800 },
    },
  },
  contact: {
    email: { type: String, default: 'contact@agri-ps.com' },
    phone: { type: String, default: '+237 6XX XX XX XX' },
    whatsapp: { type: String, default: '+237 6XX XX XX XX' },
    address: { type: String, default: 'Yaoundé, Cameroun' },
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  navigation: {
    menuItems: [
      {
        name: String,
        href: String,
        order: Number,
        submenu: [{ name: String, href: String }],
      }
    ],
  },
  homePage: {
    hero: {
      badge: String,
      title: String,
      subtitle: String,
      description: String,
      image: String,
      cta: {
        primary: { text: String, link: String },
        secondary: { text: String, link: String },
      },
    },
    stats: [{ value: String, label: String, order: Number }],
    features: [{ title: String, description: String, icon: String, order: Number }],
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String,
  },
  footer: {
    about: String,
    copyrightText: String,
    poweredBy: {
      text: String,
      link: String,
    },
  },
  advanced: {
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    enableAgriBot: { type: Boolean, default: true },
    enableNewsletter: { type: Boolean, default: true },
    googleAnalyticsId: String,
    facebookPixelId: String,
  },
  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 },
}, { timestamps: true });

const SiteConfig = mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema);

async function seedSiteConfig() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    console.log('🔍 Vérification de la configuration du site...');
    
    const existingConfig = await SiteConfig.findOne({ isActive: true });
    
    if (existingConfig) {
      console.log('✅ Configuration du site déjà existante');
      return;
    }
    
    console.log('📝 Création de la configuration par défaut...');
    
    const defaultConfig = await SiteConfig.create({
      branding: {
        siteName: 'AGRI POINT SERVICE',
        tagline: 'Produire plus, Gagner plus, Mieux vivre',
        logoUrl: '/images/logo.svg',
        faviconUrl: '/favicon.ico',
      },
      colors: {
        primary: '#1B5E20',
        primaryLight: '#4caf50',
        secondary: '#B71C1C',
        secondaryLight: '#ef5350',
        accent: '#57534e',
        background: '#ffffff',
        text: '#0f172a',
      },
      typography: {
        fontFamily: {
          heading: 'Montserrat',
          body: 'Inter',
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem',
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800,
        },
      },
      contact: {
        email: 'contact@agri-ps.com',
        phone: '+237 6XX XX XX XX',
        whatsapp: '+237 6XX XX XX XX',
        address: 'Yaoundé, Cameroun',
      },
      socialMedia: {
        facebook: 'https://facebook.com/agripoint',
        instagram: 'https://instagram.com/agripoint',
        twitter: 'https://twitter.com/agripoint',
        linkedin: 'https://linkedin.com/company/agripoint',
        youtube: 'https://youtube.com/@agripoint',
      },
      navigation: {
        menuItems: [
          { name: 'Accueil', href: '/', order: 1 },
          { name: 'Boutique', href: '/produits', order: 2 },
          { 
            name: 'Nos Solutions', 
            href: '#', 
            order: 3,
            submenu: [
              { name: 'Produire Plus', href: '/produire-plus' },
              { name: 'Gagner Plus', href: '/gagner-plus' },
              { name: 'Mieux Vivre', href: '/mieux-vivre' },
            ]
          },
          { name: 'Agriculture Urbaine', href: '/agriculture-urbaine', order: 4 },
          { name: 'À propos', href: '/a-propos', order: 5 },
          { name: 'Contact', href: '/contact', order: 6 },
        ],
      },
      homePage: {
        hero: {
          badge: '🌱 Leader des biofertilisants au Cameroun',
          title: 'Produire plus, Gagner plus, Mieux vivre',
          subtitle: 'Solutions complètes pour l\'agriculture moderne',
          description: 'Découvrez notre gamme de biofertilisants de qualité pour optimiser vos rendements et respecter l\'environnement.',
          image: '/images/hero-bg.jpg',
          cta: {
            primary: { text: 'Découvrir nos produits', link: '/produits' },
            secondary: { text: 'Agriculture Urbaine', link: '/agriculture-urbaine' },
          },
        },
        stats: [
          { value: '20K+', label: 'Hectares cultivés', order: 1 },
          { value: '10K+', label: 'Agriculteurs partenaires', order: 2 },
          { value: '100%', label: 'Produits biologiques', order: 3 },
          { value: '15+', label: 'Années d\'expérience', order: 4 },
        ],
        features: [
          { 
            title: 'Produire Plus', 
            description: 'Augmentez vos rendements avec nos solutions innovantes',
            icon: 'TrendingUp',
            order: 1,
          },
          { 
            title: 'Gagner Plus', 
            description: 'Optimisez votre rentabilité grâce à nos produits',
            icon: 'DollarSign',
            order: 2,
          },
          { 
            title: 'Mieux Vivre', 
            description: 'Cultivez sainement avec des produits biologiques',
            icon: 'Heart',
            order: 3,
          },
        ],
      },
      seo: {
        metaTitle: 'AGRI POINT SERVICE - Biofertilisants au Cameroun',
        metaDescription: 'Distributeur leader de biofertilisants de qualité au Cameroun. Solutions complètes pour l\'agriculture moderne et urbaine. Produire plus, Gagner plus, Mieux vivre.',
        keywords: ['biofertilisant', 'agriculture', 'Cameroun', 'engrais', 'agriculture urbaine', 'AGRI POINT', 'fertilisant bio', 'rendement agricole'],
        ogImage: '/images/og-image.jpg',
      },
      footer: {
        about: 'AGRI POINT SERVICE est le leader de la distribution de biofertilisants au Cameroun. Nous accompagnons les agriculteurs vers une agriculture plus productive et durable.',
        copyrightText: '© 2024 AGRI POINT SERVICE. Tous droits réservés.',
        poweredBy: {
          text: 'Powered By JoYed\'S',
          link: 'https://www.joyeds.com',
        },
      },
      advanced: {
        maintenanceMode: false,
        allowRegistration: true,
        enableAgriBot: true,
        enableNewsletter: true,
        googleAnalyticsId: '',
        facebookPixelId: '',
      },
      isActive: true,
    });
    
    console.log('✅ Configuration créée avec succès !');
    console.log('📦 ID:', defaultConfig._id);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la configuration:', error);
    throw error;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  seedSiteConfig()
    .then(() => {
      console.log('✅ Seed terminé avec succès');
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = seedSiteConfig;
