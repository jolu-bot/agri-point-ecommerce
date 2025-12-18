import mongoose, { Schema, models, Model } from 'mongoose';

export interface ISettings {
  _id: string;
  
  // Informations du site
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  siteLogoLight?: string;
  siteFavicon: string;
  
  // Page d'accueil
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
  };
  
  sections: {
    produirePlus: {
      title: string;
      description: string;
      image: string;
      features: string[];
    };
    gagnerPlus: {
      title: string;
      description: string;
      image: string;
      features: string[];
    };
    mieuxVivre: {
      title: string;
      description: string;
      image: string;
      features: string[];
    };
  };
  
  // Contact
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    region: string;
    country: string;
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
  
  // Configuration e-commerce
  ecommerce: {
    currency: string;
    currencySymbol: string;
    taxRate: number;
    freeShippingThreshold: number;
    shippingCost: number;
  };
  
  // AgriBot IA
  agribot: {
    enabled: boolean;
    welcomeMessage: string;
    systemPrompt: string;
    suggestions: string[];
  };
  
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    ogImage: string;
  };
  
  // Legal
  legal: {
    termsAndConditions: string;
    privacyPolicy: string;
    returnPolicy: string;
  };
  
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const SettingsSchema = new Schema<ISettings>({
  siteName: {
    type: String,
    default: 'AGRI POINT SERVICE',
  },
  siteDescription: {
    type: String,
    default: 'Produire plus, Gagner plus, Mieux vivre',
  },
  siteLogo: String,
  siteLogoLight: String,
  siteFavicon: String,
  
  hero: {
    title: {
      type: String,
      default: 'AGRI POINT SERVICE - Tout en Un',
    },
    subtitle: {
      type: String,
      default: 'Le partenaire sûr de l\'entrepreneur agricole',
    },
    ctaText: {
      type: String,
      default: 'Découvrir nos produits',
    },
    ctaLink: {
      type: String,
      default: '/boutique',
    },
    backgroundImage: String,
  },
  
  sections: {
    produirePlus: {
      title: { type: String, default: 'PRODUIRE PLUS' },
      description: String,
      image: String,
      features: [String],
    },
    gagnerPlus: {
      title: { type: String, default: 'GAGNER PLUS' },
      description: String,
      image: String,
      features: [String],
    },
    mieuxVivre: {
      title: { type: String, default: 'MIEUX VIVRE' },
      description: String,
      image: String,
      features: [String],
    },
  },
  
  contact: {
    email: { type: String, default: 'infos@agri-ps.com' },
    phone: { type: String, default: '+237 657 39 39 39' },
    whatsapp: { type: String, default: '676026601' },
    address: { type: String, default: 'B.P. 5111 Yaoundé' },
    city: { type: String, default: 'Yaoundé' },
    region: { type: String, default: 'Quartier Fouda' },
    country: { type: String, default: 'Cameroun' },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      youtube: String,
    },
  },
  
  ecommerce: {
    currency: { type: String, default: 'XAF' },
    currencySymbol: { type: String, default: 'FCFA' },
    taxRate: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 50000 },
    shippingCost: { type: Number, default: 2500 },
  },
  
  agribot: {
    enabled: { type: Boolean, default: true },
    welcomeMessage: {
      type: String,
      default: 'Bonjour ! Je suis AgriBot, votre conseiller agricole. Comment puis-je vous aider aujourd\'hui ?',
    },
    systemPrompt: {
      type: String,
      default: 'Tu es AgriBot, un assistant IA expert en agriculture pour AGRI POINT SERVICE au Cameroun. Tu donnes des conseils pratiques sur les cultures, les biofertilisants et l\'agriculture urbaine.',
    },
    suggestions: {
      type: [String],
      default: [
        'Quel produit pour mes tomates ?',
        'Comment améliorer mon rendement ?',
        'Agriculture urbaine : par où commencer ?',
      ],
    },
  },
  
  seo: {
    metaTitle: {
      type: String,
      default: 'AGRI POINT SERVICE - Biofertilisants & Agriculture Urbaine',
    },
    metaDescription: {
      type: String,
      default: 'Distributeur de biofertilisants de qualité au Cameroun. Produire plus, Gagner plus, Mieux vivre.',
    },
    metaKeywords: {
      type: [String],
      default: ['biofertilisant', 'agriculture', 'Cameroun', 'engrais', 'agriculture urbaine'],
    },
    ogImage: String,
  },
  
  legal: {
    termsAndConditions: String,
    privacyPolicy: String,
    returnPolicy: String,
  },
  
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: String,
  
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const Settings: Model<ISettings> = models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
