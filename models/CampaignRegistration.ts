import mongoose, { Schema, models, Model } from 'mongoose';

export type CampaignRegStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ICampaignRegistration {
  _id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  cooperativeName?: string;
  isMember: boolean;
  hasInsurance: boolean;
  insuranceProvider?: string;
  productType: 'mineral' | 'bio';
  quantity: number;
  totalAmount: number;
  status: CampaignRegStatus;
  locale: 'fr' | 'en';
  createdAt: Date;
  updatedAt: Date;
}

const CampaignRegistrationSchema = new Schema<ICampaignRegistration>(
  {
    registrationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    cooperativeName: { type: String, trim: true, maxlength: 150 },
    isMember: { type: Boolean, default: false },
    hasInsurance: { type: Boolean, default: false },
    insuranceProvider: { type: String, trim: true, maxlength: 100 },
    productType: { type: String, enum: ['mineral', 'bio'], required: true },
    quantity: { type: Number, required: true, min: 6 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    locale: { type: String, enum: ['fr', 'en'], default: 'fr' },
  },
  { timestamps: true }
);

CampaignRegistrationSchema.index({ email: 1 });
CampaignRegistrationSchema.index({ status: 1, createdAt: -1 });

const CampaignRegistration: Model<ICampaignRegistration> =
  models.CampaignRegistration ||
  mongoose.model<ICampaignRegistration>('CampaignRegistration', CampaignRegistrationSchema);

export default CampaignRegistration;
