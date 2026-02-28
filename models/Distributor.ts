import mongoose, { Schema, Document } from 'mongoose';

export interface IDistributor extends Document {
  name: string;
  category: 'wholesaler' | 'retailer' | 'partner';
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  businessHours: string;
  description?: string;
  logo?: string;
  products?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const distributorSchema = new Schema<IDistributor>(
  {
    name: {
      type: String,
      required: [true, 'Nom du distributeur requis'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['wholesaler', 'retailer', 'partner'],
      default: 'retailer',
    },
    address: {
      type: String,
      required: [true, 'Adresse requise'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Ville requise'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Région requise'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Téléphone requis'],
      match: [/^[\d\s\-\+()]+$/, 'Numéro de téléphone invalide'],
    },
    email: {
      type: String,
      required: [true, 'Email requis'],
      match: [/^[\w\.-]+@[\w\.-]+\.\w+$/, 'Email invalide'],
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude requise'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude requise'],
      },
    },
    businessHours: {
      type: String,
      default: 'Lun-Sam: 7h-18h',
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: null,
    },
    products: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
distributorSchema.index({ city: 1, region: 1 });
distributorSchema.index({ category: 1 });
distributorSchema.index({ name: 'text' });
distributorSchema.index({ coordinates: '2dsphere' }); // For geospatial queries

export default mongoose.models.Distributor ||
  mongoose.model<IDistributor>('Distributor', distributorSchema);
