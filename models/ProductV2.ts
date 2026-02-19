import mongoose, { Schema, models, Model } from 'mongoose';

// 🆕 Interface pour les images de galerie
export interface IProductImage {
  url: string;
  alt: string;
  order: number;
  isMain: boolean;
  tags?: string[];
}

// 🆕 Interface pour le pricing avancé
export interface IProductPricing {
  regular: number;              // Prix régulier
  sale?: number;                // Prix en promotion
  cost?: number;                // Prix d'achat (pour calcul marge)
  compareAt?: number;           // Prix "avant" pour affichage barré
  currency: string;             // Par défaut: "XAF"
}

// 🆕 Interface pour les promotions
export interface IProductPromotion {
  type: 'percentage' | 'fixed' | 'bundle';
  value: number;                // Ex: 20 (%) ou 5000 (XAF)
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  label?: string;               // Ex: "Soldes d'été", "Black Friday"
  badge?: string;               // Ex: "-20%", "PROMO", "SOLDES"
  description?: string;
  minQuantity?: number;         // Quantité minimum pour bénéficier
}

// Interface principale du produit
export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;    // 🆕 Pour cartes produits
  
  category: 'biofertilisant' | 'engrais_mineral' | 'kit_urbain' | 'service' | 'autre';
  subCategory?: string;
  
  // 🆕 Galerie d'images avancée (remplace images: string[])
  gallery: IProductImage[];
  
  // 🆕 Pricing structuré (remplace price/promoPrice)
  pricing: IProductPricing;
  
  // 🆕 Promotion active
  promotion?: IProductPromotion;
  
  stock: number;
  lowStockThreshold?: number;   // 🆕 Alerte stock bas
  
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  
  // Caractéristiques techniques (biofertilisants)
  features?: {
    npk?: string;
    composition?: string;
    applications?: string[];
    dosage?: string;
    cultures?: string[];
    benefits?: string[];
    precautions?: string[];
  };
  
  // Variants (taille, poids, packaging)
  variants?: Array<{
    name: string;
    pricing: IProductPricing;   // 🆕 Pricing par variant
    promotion?: IProductPromotion; // 🆕 Promo par variant
    stock: number;
    sku: string;
    image?: string;             // 🆕 Image spécifique au variant
  }>;
  
  sku: string;
  barcode?: string;             // 🆕 Code-barres
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Analytics
  views: number;
  sales: number;
  rating: number;
  reviewsCount: number;
  
  // 🆕 Badges et labels
  badges?: Array<{
    text: string;
    color: string;              // Couleur Tailwind
    icon?: string;              // Icône Lucide
  }>;
  
  // 🆕 Relations
  relatedProducts?: string[];   // IDs de produits connexes
  upsells?: string[];           // IDs de produits upsell
  crossSells?: string[];        // IDs de produits cross-sell
  
  // 🆕 Disponibilité
  availability: {
    inStock: boolean;
    preorder?: {
      enabled: boolean;
      availableFrom?: Date;
      message?: string;
    };
    backorder?: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;           // 🆕 Date de publication
}

// Schéma MongoDB
const ProductImageSchema = new Schema<IProductImage>({
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  isMain: {
    type: Boolean,
    default: false,
  },
  tags: [String],
}, { _id: false });

const ProductPricingSchema = new Schema<IProductPricing>({
  regular: {
    type: Number,
    required: true,
    min: 0,
  },
  sale: {
    type: Number,
    min: 0,
  },
  cost: {
    type: Number,
    min: 0,
  },
  compareAt: {
    type: Number,
    min: 0,
  },
  currency: {
    type: String,
    default: 'XAF',
  },
}, { _id: false });

const ProductPromotionSchema = new Schema<IProductPromotion>({
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'bundle'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
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
  label: String,
  badge: String,
  description: String,
  minQuantity: {
    type: Number,
    min: 1,
  },
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
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
    required: [true, 'La description est requise'],
  },
  shortDescription: {
    type: String,
    maxlength: 200,
  },
  category: {
    type: String,
    required: true,
    enum: ['biofertilisant', 'engrais_mineral', 'kit_urbain', 'service', 'autre'],
  },
  subCategory: String,
  
  gallery: {
    type: [ProductImageSchema],
    validate: {
      validator: function(v: IProductImage[]) {
        return v && v.length > 0;
      },
      message: 'Au moins une image est requise',
    },
  },
  
  pricing: {
    type: ProductPricingSchema,
    required: true,
  },
  
  promotion: ProductPromotionSchema,
  
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  
  features: {
    npk: String,
    composition: String,
    applications: [String],
    dosage: String,
    cultures: [String],
    benefits: [String],
    precautions: [String],
  },
  
  variants: [{
    name: String,
    pricing: ProductPricingSchema,
    promotion: ProductPromotionSchema,
    stock: Number,
    sku: String,
    image: String,
  }],
  
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  barcode: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  
  views: {
    type: Number,
    default: 0,
  },
  sales: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  
  badges: [{
    text: String,
    color: String,
    icon: String,
  }],
  
  relatedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  upsells: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  crossSells: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  
  availability: {
    inStock: {
      type: Boolean,
      default: true,
    },
    preorder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      availableFrom: Date,
      message: String,
    },
    backorder: {
      type: Boolean,
      default: false,
    },
  },
  
  publishedAt: Date,
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
});

// Index pour la recherche et performance
ProductSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ 'pricing.regular': 1 });
ProductSchema.index({ 'pricing.sale': 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ sales: -1 });

// Méthode virtuelle pour calculer le prix final
ProductSchema.virtual('finalPrice').get(function() {
  // Si promotion active et dans les dates
  if (this.promotion?.isActive) {
    const now = new Date();
    if (now >= this.promotion.startDate && now <= this.promotion.endDate) {
      const basePrice = this.pricing.sale || this.pricing.regular;
      if (this.promotion.type === 'percentage') {
        return basePrice * (1 - this.promotion.value / 100);
      } else if (this.promotion.type === 'fixed') {
        return Math.max(0, basePrice - this.promotion.value);
      }
    }
  }
  return this.pricing.sale || this.pricing.regular;
});

// Méthode virtuelle pour la marge
ProductSchema.virtual('margin').get(function() {
  if (!this.pricing.cost) return null;
  const finalPrice = (this as any).finalPrice;
  return ((finalPrice - this.pricing.cost) / finalPrice) * 100;
});

// Méthode pour vérifier si en promotion
ProductSchema.methods.isOnPromotion = function(): boolean {
  if (!this.promotion?.isActive) return false;
  const now = new Date();
  return now >= this.promotion.startDate && now <= this.promotion.endDate;
};

// Méthode pour obtenir le badge de promotion
ProductSchema.methods.getPromotionBadge = function(): string | null {
  if (!this.isOnPromotion()) return null;
  if (this.promotion!.badge) return this.promotion!.badge;
  
  // Générer badge automatique
  if (this.promotion!.type === 'percentage') {
    return `-${this.promotion!.value}%`;
  } else if (this.promotion!.type === 'fixed') {
    return `-${this.promotion!.value} XAF`;
  }
  return 'PROMO';
};

// Hook pre-save pour mettre à jour availability.inStock
ProductSchema.pre('save', function(next) {
  this.availability.inStock = this.stock > 0;
  next();
});

const Product: Model<IProduct> = models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
