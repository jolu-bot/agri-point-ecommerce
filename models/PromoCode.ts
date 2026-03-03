import mongoose, { Schema, models, Model } from 'mongoose';

export interface IPromoCode {
  _id: string;
  code: string; // e.g., "SAVE20", "SPRING2024"
  type: 'percentage' | 'fixed'; // % ou montant fixe
  value: number; // 20 (pour 20%) ou 5000 (pour 5000 FCFA)
  maxUses?: number;
  usedCount: number;
  minOrderValue?: number; // Montant minimum de commande
  maxDiscount?: number; // Remise maximale
  description?: string;
  isActive: boolean;
  appliableProducts?: mongoose.Types.ObjectId[]; // Si vide = tous les produits
  appliableCategories?: string[]; // Si vide = toutes les catégories
  usedBy: mongoose.Types.ObjectId[]; // Historique des utilisateurs
  startDate: Date;
  expiryDate: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9]{3,20}$/,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    appliableProducts: [mongoose.Schema.Types.ObjectId],
    appliableCategories: [String],
    usedBy: [mongoose.Schema.Types.ObjectId],
    startDate: {
      type: Date,
      default: () => new Date(),
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: code index auto-created by unique: true
PromoCodeSchema.index({ isActive: 1, expiryDate: 1 });
PromoCodeSchema.index({ createdAt: -1 });

const PromoCode: Model<IPromoCode> =
  models.PromoCode ||
  mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);

export default PromoCode;
