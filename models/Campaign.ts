import mongoose, { Schema, models, Model } from 'mongoose';

export interface ICampaign {
  _id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  
  // Produits inclus
  products: mongoose.Types.ObjectId[];
  
  // Conditions d'éligibilité
  eligibility: {
    requireCooperativeMembership: boolean;
    minQuantity: number; // Nombre minimum de sacs/litres
    requireMutualInsurance: boolean;
    insuranceProviders?: string[]; // Ex: ["CICAN", "CAMAO"]
    acceptedCooperatives?: string[]; // Domaines email agréés
  };
  
  // Système de paiement échelonné
  paymentScheme: {
    enabled: boolean;
    firstPercentage: number; // 70
    secondPercentage: number; // 30
    firstPaymentLabel: string; // "À la commande"
    secondPaymentLabel: string; // "Après récolte"
  };
  
  // Tarifs spéciaux campagne
  specialPricing: {
    mineralFertilizer: number; // 15,000 FCFA
    biofertilizer: number; // 10,000 FCFA
  };
  
  // Informations administratives
  terms: {
    paymentTerms: string;
    refundPolicy: string;
    contactInfo: string;
    additionalInfo?: string;
  };
  
  // Statistiques
  stats: {
    totalOrders: number;
    totalQuantity: number;
    totalRevenue: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  name: {
    type: String,
    required: [true, 'Nom de la campagne requis'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  heroImage: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  eligibility: {
    requireCooperativeMembership: {
      type: Boolean,
      default: true,
    },
    minQuantity: {
      type: Number,
      default: 6,
    },
    requireMutualInsurance: {
      type: Boolean,
      default: true,
    },
    insuranceProviders: [String],
    acceptedCooperatives: [String],
  },
  paymentScheme: {
    enabled: {
      type: Boolean,
      default: true,
    },
    firstPercentage: {
      type: Number,
      default: 70,
    },
    secondPercentage: {
      type: Number,
      default: 30,
    },
    firstPaymentLabel: {
      type: String,
      default: 'À la commande',
    },
    secondPaymentLabel: {
      type: String,
      default: 'Après récolte',
    },
  },
  specialPricing: {
    mineralFertilizer: {
      type: Number,
      default: 15000,
    },
    biofertilizer: {
      type: Number,
      default: 10000,
    },
  },
  terms: {
    paymentTerms: {
      type: String,
      default: 'Les engrais minéraux sont payables en deux tranches (70/30). Les biofertilisants en une seule tranche.',
    },
    refundPolicy: {
      type: String,
      default: 'Remboursement possible jusqu\'à 7 jours après la commande si conditions d\'éligibilité non respectées.',
    },
    contactInfo: {
      type: String,
      default: 'Contact: +237 6XX XXX XXX',
    },
    additionalInfo: String,
  },
  stats: {
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalQuantity: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Index pour les recherches rapides
CampaignSchema.index({ slug: 1 });
CampaignSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
CampaignSchema.index({ createdAt: -1 });

export const Campaign: Model<ICampaign> = models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
