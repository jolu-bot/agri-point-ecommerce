import mongoose, { Schema, models, Model } from 'mongoose';

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: 'biofertilisant' | 'engrais_mineral' | 'kit_urbain' | 'service' | 'autre';
  subCategory?: string;
  images: string[];
  price: number;
  promoPrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  
  // Caractéristiques techniques (biofertilisants)
  features?: {
    npk?: string; // Ex: "20-10-10"
    composition?: string;
    applications?: string[];
    dosage?: string;
    cultures?: string[]; // Cultures adaptées
    benefits?: string[];
    precautions?: string[];
  };
  
  // Variants (taille, poids, packaging)
  variants?: Array<{
    name: string; // Ex: "1L", "5L", "20L"
    price: number;
    promoPrice?: number;
    stock: number;
    sku: string;
  }>;
  
  sku: string;
  weight?: number; // en kg
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  views: number;
  sales: number;
  rating: number;
  reviewsCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

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
  category: {
    type: String,
    required: true,
    enum: ['biofertilisant', 'engrais_mineral', 'kit_urbain', 'service', 'autre'],
  },
  subCategory: String,
  images: [{
    type: String,
    required: true,
  }],
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: 0,
  },
  promoPrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
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
    price: Number,
    promoPrice: Number,
    stock: Number,
    sku: String,
  }],
  sku: {
    type: String,
    required: true,
    unique: true,
  },
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
}, {
  timestamps: true,
  suppressReservedKeysWarning: true, // Pour isNew
});

// Index pour la recherche
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
// slug a déjà un index via unique: true

const Product: Model<IProduct> = models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
