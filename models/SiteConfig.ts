import mongoose from 'mongoose';

const SiteConfigSchema = new mongoose.Schema({
  // Branding
  branding: {
    siteName: { type: String, default: 'AGRI POINT SERVICE' },
    tagline: { type: String, default: 'Le partenaire sûr de l\'entrepreneur agricole' },
    logoUrl: { type: String, default: '/images/logo.svg' },
    faviconUrl: { type: String, default: '/favicon.ico' },
  },

  // Header Configuration (Dynamique pour CMS)
  header: {
    logo: {
      url: { type: String, default: '/images/logo.svg' },
      sizes: {
        mobile: { type: String, default: 'w-11 h-11' },
        tablet: { type: String, default: 'w-13 h-13' },
        desktop: { type: String, default: 'w-15 h-15' },
      },
    },
    primaryText: {
      content: { type: String, default: 'AGRI POINT' },
      sizes: {
        mobile: { type: String, default: 'text-sm' },
        tablet: { type: String, default: 'text-lg' },
        desktop: { type: String, default: 'text-xl' },
      },
      fontWeight: { type: String, default: 'font-extrabold' },
      color: { type: String, default: 'text-gradient-primary' },
    },
    secondaryText: {
      content: { type: String, default: 'Service Agricole' },
      sizes: {
        mobile: { type: String, default: 'text-[10px]' },
        tablet: { type: String, default: 'text-xs' },
        desktop: { type: String, default: 'text-xs' },
      },
      fontWeight: { type: String, default: 'font-semibold' },
      color: { type: String, default: 'text-emerald-600' },
    },
    height: {
      mobile: { type: String, default: 'h-14' },
      tablet: { type: String, default: 'h-16' },
      desktop: { type: String, default: 'h-18' },
    },
    spacing: { type: String, default: 'gap-2' },
  },

  // Couleurs du thème
  colors: {
    primary: { type: String, default: '#1B5E20' },
    primaryLight: { type: String, default: '#4caf50' },
    secondary: { type: String, default: '#B71C1C' },
    secondaryLight: { type: String, default: '#f44336' },
    accent: { type: String, default: '#57534e' },
    background: { type: String, default: '#ffffff' },
    text: { type: String, default: '#1f2937' },
  },

  // Typographie
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

  // Contact
  contact: {
    email: { type: String, default: 'infos@agri-ps.com' },
    phone: { type: String, default: '+237 657 39 39 39' },
    whatsapp: { type: String, default: '676026601' },
    address: { type: String, default: 'B.P. 5111 Yaoundé, Quartier Fouda, Cameroun' },
  },

  // Réseaux sociaux
  socialMedia: {
    facebook: { type: String, default: '#' },
    instagram: { type: String, default: '#' },
    twitter: { type: String, default: '#' },
    linkedin: { type: String, default: '#' },
    youtube: { type: String, default: '#' },
  },

  // Navigation
  navigation: {
    menuItems: [{
      name: String,
      href: String,
      order: Number,
      submenu: [{
        name: String,
        href: String,
      }]
    }],
  },

  // Page d'accueil - Hero
  homePage: {
    hero: {
      badge: { type: String, default: '🌱 Le partenaire sûr de l\'entrepreneur agricole' },
      title: { type: String, default: 'AGRI POINT SERVICE' },
      subtitle: { type: String, default: 'Tout en Un' },
      description: { type: String, default: 'Gamme complète de biofertilisants de grande qualité pour augmenter la production de toutes les cultures.' },
      image: { type: String, default: '/products/product-sarah-npk-20-10-10.png' },
      cta: {
        primary: { text: String, link: String },
        secondary: { text: String, link: String },
      },
    },
    stats: [{
      value: String,
      label: String,
      order: Number,
    }],
    features: [{
      title: String,
      description: String,
      icon: String,
      order: Number,
    }],
  },

  // SEO
  seo: {
    metaTitle: { type: String, default: 'AGRI POINT SERVICE - Produire plus, Gagner plus, Mieux vivre' },
    metaDescription: { type: String, default: 'Distributeur de biofertilisants de qualité au Cameroun. Solutions complètes pour l\'agriculture moderne et urbaine.' },
    keywords: [{ type: String }],
    ogImage: { type: String, default: '/images/logo.svg' },
  },

  // Footer
  footer: {
    about: { type: String, default: 'Le partenaire sûr de l\'entrepreneur agricole. Produire plus, Gagner plus, Mieux vivre.' },
    copyrightText: { type: String, default: 'AGRI POINT SERVICE. Tous droits réservés.' },
    poweredBy: {
      text: { type: String, default: 'Powered By JoYed\'S' },
      link: { type: String, default: 'https://www.joyeds.com' },
    },
  },

  // Paramètres avancés
  advanced: {
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    enableAgriBot: { type: Boolean, default: true },
    enableNewsletter: { type: Boolean, default: true },
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },
  },

  // Modules et Fonctionnalités (Activables/Désactivables)
  modules: {
    products: { 
      enabled: { type: Boolean, default: true },
      allowReviews: { type: Boolean, default: true },
      showStock: { type: Boolean, default: true },
    },
    orders: { 
      enabled: { type: Boolean, default: true },
      autoConfirmation: { type: Boolean, default: false },
      requireEmailVerification: { type: Boolean, default: true },
    },
    payments: {
      campost: { type: Boolean, default: true },
      mtnMomo: { type: Boolean, default: false },
      orangeMoney: { type: Boolean, default: false },
      notchPay: { type: Boolean, default: false },
      cineTPay: { type: Boolean, default: false },
      cash: { type: Boolean, default: true },
    },
    blog: { 
      enabled: { type: Boolean, default: false },
      allowComments: { type: Boolean, default: false },
    },
    campaigns: { 
      enabled: { type: Boolean, default: true },
      showCountdown: { type: Boolean, default: true },
    },
    urbanAgriculture: { 
      enabled: { type: Boolean, default: true },
      showCourses: { type: Boolean, default: false },
    },
  },

  // Système de Permissions et Rôles
  permissions: {
    roles: [{
      name: { type: String, required: true },
      displayName: { type: String, required: true },
      permissions: [{
        resource: { type: String, required: true }, // products, orders, users, etc.
        actions: [{ type: String }], // view, create, edit, delete, manage
      }],
      createdAt: { type: Date, default: Date.now },
    }],
    defaultUserRole: { type: String, default: 'customer' },
  },

  // Version et dernière mise à jour
  version: { type: String, default: '1.0.0' },
  isActive: { type: Boolean, default: true },
}, { 
  timestamps: true 
});

// Index pour performance
SiteConfigSchema.index({ isActive: 1 });

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);
