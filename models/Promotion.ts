import mongoose, { Schema, models, Model } from 'mongoose';

// Interface pour les promotions globales
export interface IPromotion {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  
  // Type de promotion
  type: 'percentage' | 'fixed' | 'bundle' | 'buy_x_get_y' | 'free_shipping';
  
  // Valeur de la promotion
  value: number;              // Ex: 20 (%), 5000 (XAF fixe)
  
  // Pour type "buy_x_get_y"
  buyQuantity?: number;       // Acheter X
  getQuantity?: number;       // Recevoir Y gratuits
  
  // Période de validité
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  
  // Conditions d'application
  conditions: {
    minPurchase?: number;     // Montant minimum d'achat
    maxDiscount?: number;     // Réduction maximum en XAF
    minQuantity?: number;     // Quantité minimum de produits
    
    // Limitation d'usage
    usageLimit?: number;      // Nombre max d'utilisations global
    usageLimitPerUser?: number; // Nombre max par utilisateur
    currentUsage: number;     // Compteur d'utilisations
    
    // Restrictions de date
    validDays?: number[];     // Jours de la semaine (0-6, 0=dimanche)
    validHours?: {            // Plages horaires
      start: string;          // Ex: "09:00"
      end: string;            // Ex: "18:00"
    };
    
    firstOrderOnly?: boolean; // Uniquement commande 1ère
    existingCustomersOnly?: boolean;
  };
  
  // Ciblage
  targeting: {
    // Produits concernés
    appliesTo: 'all' | 'specific' | 'category' | 'collection';
    productIds?: string[];    // Si specific
    categories?: string[];    // Si category
    collections?: string[];   // Si collection
    
    // Clients concernés
    customerSegment?: 'all' | 'new' | 'vip' | 'specific';
    customerIds?: string[];   // Si specific
    customerTags?: string[];  // Tags clients
    
    // Géographie
    countries?: string[];
    cities?: string[];
  };
  
  // Affichage
  display: {
    badge: string;            // Ex: "-20%", "SOLDES", "PROMO"
    color: string;            // Couleur Tailwind
    icon?: string;            // Icône Lucide
    showOnProductCard: boolean;
    showOnCheckout: boolean;
    priority: number;         // Pour ordre affichage (1 = plus haut)
  };
  
  // Code promo (optionnel)
  code?: string;              // Si promotion nécessite un code
  isCaseSensitive?: boolean;
  autoApply?: boolean;        // Appliquer automatiquement si conditions remplies
  
  // Combinaison avec autres promos
  stackable: boolean;         // Peut se cumuler avec d'autres promos
  excludesSaleItems?: boolean; // N'applique pas aux produits déjà en promo
  
  // Analytics
  stats: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;          // Revenu généré
    avgOrderValue: number;
  };
  
  // Meta
  createdBy: string;          // User ID
  updatedBy?: string;
  tags?: string[];
  notes?: string;             // Notes internes
  
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>({
  name: {
    type: String,
    required: [true, 'Le nom de la promotion est requis'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: String,
  
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'bundle', 'buy_x_get_y', 'free_shipping'],
    required: true,
  },
  
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  
  buyQuantity: Number,
  getQuantity: Number,
  
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
  
  conditions: {
    minPurchase: {
      type: Number,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    minQuantity: {
      type: Number,
      min: 1,
    },
    usageLimit: Number,
    usageLimitPerUser: Number,
    currentUsage: {
      type: Number,
      default: 0,
    },
    validDays: [{
      type: Number,
      min: 0,
      max: 6,
    }],
    validHours: {
      start: String,
      end: String,
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
    existingCustomersOnly: {
      type: Boolean,
      default: false,
    },
  },
  
  targeting: {
    appliesTo: {
      type: String,
      enum: ['all', 'specific', 'category', 'collection'],
      default: 'all',
    },
    productIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    categories: [String],
    collections: [String],
    
    customerSegment: {
      type: String,
      enum: ['all', 'new', 'vip', 'specific'],
      default: 'all',
    },
    customerIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    customerTags: [String],
    
    countries: [String],
    cities: [String],
  },
  
  display: {
    badge: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: 'bg-red-500',
    },
    icon: String,
    showOnProductCard: {
      type: Boolean,
      default: true,
    },
    showOnCheckout: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  
  code: {
    type: String,
    uppercase: true,
    trim: true,
    sparse: true,             // Index unique mais permet null
    unique: true,
  },
  isCaseSensitive: {
    type: Boolean,
    default: false,
  },
  autoApply: {
    type: Boolean,
    default: false,
  },
  
  stackable: {
    type: Boolean,
    default: false,
  },
  excludesSaleItems: {
    type: Boolean,
    default: false,
  },
  
  stats: {
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    avgOrderValue: {
      type: Number,
      default: 0,
    },
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [String],
  notes: String,
  
}, {
  timestamps: true,
});

// Index pour performance
PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
PromotionSchema.index({ code: 1 });
PromotionSchema.index({ 'targeting.appliesTo': 1 });
PromotionSchema.index({ 'display.priority': -1 });
PromotionSchema.index({ createdAt: -1 });

// Méthode pour vérifier si la promotion est valide maintenant
PromotionSchema.methods.isValidNow = function(): boolean {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  // Vérifier les dates
  if (now < this.startDate || now > this.endDate) return false;
  
  // Vérifier la limite d'usage
  if (this.conditions.usageLimit && this.conditions.currentUsage >= this.conditions.usageLimit) {
    return false;
  }
  
  // Vérifier le jour de la semaine
  if (this.conditions.validDays && this.conditions.validDays.length > 0) {
    const currentDay = now.getDay();
    if (!this.conditions.validDays.includes(currentDay)) return false;
  }
  
  // Vérifier les heures
  if (this.conditions.validHours) {
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (currentTime < this.conditions.validHours.start || currentTime > this.conditions.validHours.end) {
      return false;
    }
  }
  
  return true;
};

// Méthode pour vérifier si applicable à un produit
PromotionSchema.methods.appliesToProduct = function(productId: string, category?: string): boolean {
  if (!this.isValidNow()) return false;
  
  if (this.targeting.appliesTo === 'all') return true;
  
  if (this.targeting.appliesTo === 'specific') {
    return this.targeting.productIds?.some((id: any) => id.toString() === productId.toString()) || false;
  }
  
  if (this.targeting.appliesTo === 'category' && category) {
    return this.targeting.categories?.includes(category) || false;
  }
  
  return false;
};

// Méthode pour calculer la réduction
PromotionSchema.methods.calculateDiscount = function(price: number, quantity: number = 1): number {
  if (!this.isValidNow()) return 0;
  
  // Vérifier quantité minimum
  if (this.conditions.minQuantity && quantity < this.conditions.minQuantity) {
    return 0;
  }
  
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = price * (this.value / 100);
      break;
      
    case 'fixed':
      discount = this.value;
      break;
      
    case 'buy_x_get_y':
      if (this.buyQuantity && this.getQuantity) {
        const freeItems = Math.floor(quantity / this.buyQuantity) * this.getQuantity;
        discount = (price / quantity) * freeItems;
      }
      break;
  }
  
  // Appliquer la réduction maximum si définie
  if (this.conditions.maxDiscount) {
    discount = Math.min(discount, this.conditions.maxDiscount);
  }
  
  return Math.max(0, discount);
};

// Hook pre-save pour validation
PromotionSchema.pre('save', function(next) {
  // Valider les dates
  if (this.endDate <= this.startDate) {
    return next(new Error('La date de fin doit être postérieure à la date de début'));
  }
  
  // Valider buy_x_get_y
  if (this.type === 'buy_x_get_y') {
    if (!this.buyQuantity || !this.getQuantity) {
      return next(new Error('buyQuantity et getQuantity sont requis pour le type buy_x_get_y'));
    }
  }
  
  next();
});

const Promotion: Model<IPromotion> = models.Promotion || mongoose.model<IPromotion>('Promotion', PromotionSchema);

export default Promotion;
