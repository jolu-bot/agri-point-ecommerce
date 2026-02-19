import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  type: 'farm' | 'market' | 'distribution' | 'event' | 'other';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    street?: string;
    city: string;
    zipCode?: string;
    region?: string;
    country: string;
  };
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: {
    day: string;
    open: string;
    close: string;
  }[];
  
  // Métadonnées
  category?: string;
  tags: string[];
  featuredImage?: string;
  
  // Statut
  isPublic: boolean;
  isActive: boolean;
  verified: boolean;
  
  // Relations
  relatedEvents?: mongoose.Types.ObjectId[];
  relatedProducts?: mongoose.Types.ObjectId[];
  ownerId?: mongoose.Types.ObjectId;
  
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['farm', 'market', 'distribution', 'event', 'other'],
      required: true,
      default: 'other',
    },
    coordinates: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      zipCode: { type: String, trim: true },
      region: { type: String, trim: true },
      country: { type: String, required: true, default: 'France' },
    },
    description: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    hours: [
      {
        day: { type: String, required: true },
        open: { type: String, required: true },
        close: { type: String, required: true },
      },
    ],
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    featuredImage: { type: String },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    relatedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// Index géospatial
LocationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
LocationSchema.index({ type: 1, isPublic: 1, isActive: 1 });
LocationSchema.index({ city: 'text', name: 'text', description: 'text' });

// Méthodes
LocationSchema.methods.getFullAddress = function (): string {
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.zipCode) parts.push(this.address.zipCode);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.region) parts.push(this.address.region);
  if (this.address.country) parts.push(this.address.country);
  return parts.join(', ');
};

LocationSchema.methods.getCoordinates = function (): [number, number] {
  return [this.coordinates.latitude, this.coordinates.longitude];
};

LocationSchema.methods.distanceTo = function (lat: number, lng: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat - this.coordinates.latitude) * Math.PI) / 180;
  const dLng = ((lng - this.coordinates.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.coordinates.latitude * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);
