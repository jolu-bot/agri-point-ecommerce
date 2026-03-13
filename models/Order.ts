import mongoose, { Schema, models, Model } from 'mongoose';

export interface IOrder {
  _id: string;
  orderNumber: string;
  user: mongoose.Types.ObjectId | string;
  items: Array<{
    product: mongoose.Types.ObjectId | string;
    productName: string;
    productImage: string;
    variant?: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  
  promoCode?: string;
  
  // Nouvelles propriétés pour campagnes
  campaign?: mongoose.Types.ObjectId | string;
  isCampaignOrder?: boolean;
  
  // Paiement échelonné
  installmentPayment?: {
    enabled: boolean;
    firstAmount: number; // 70%
    secondAmount: number; // 30%
    firstPaymentStatus: 'pending' | 'paid' | 'failed';
    secondPaymentStatus: 'pending' | 'paid' | 'failed';
    firstPaymentDetails?: {
      transactionId?: string;
      paidAt?: Date;
    };
    secondPaymentDetails?: {
      transactionId?: string;
      paidAt?: Date;
    };
    secondPaymentDueDate?: Date;
  };
  
  // Éligibilité campagne
  campaignEligibility?: {
    isEligible: boolean;
    cooperativeMember: boolean;
    mutualInsuranceValid: boolean;
    insuranceProvider?: string;
    cooperativeEmail?: string;
  };
  
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode?: string;
    notes?: string;
  };
  
  paymentMethod: 'campost' | 'cash' | 'whatsapp';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'awaiting_proof';
  paymentDetails?: {
    transactionId?: string;
    paidAt?: Date;
  };
  
  // Paiement Campost
  campostPayment?: {
    accountNumber: string; // Compte AGRIPOINT SERVICES
    accountName: string;
    receiptImage?: string; // URL de l'image du reçu uploadée
    receiptUploadedAt?: Date;
    validatedBy?: mongoose.Types.ObjectId | string; // Admin qui valide
    validatedAt?: Date;
    validationNotes?: string;
  };
  
  // Paiement WhatsApp Mobile Money
  whatsappPayment?: {
    mobileMoneyProvider?: 'orange' | 'mtn'; // Orange Money ou MTN Mobile Money
    mobileMoneyNumber?: string; // Numéro utilisé pour le paiement
    screenshotUrl?: string; // URL du screenshot de confirmation de paiement
    screenshotUploadedAt?: Date;
    validatedBy?: mongoose.Types.ObjectId | string; // Admin qui valide
    validatedAt?: Date;
    validationNotes?: string;
    paymentRequestedAt?: Date; // Quand le client a été invité à payer
    paymentConfirmedAt?: Date; // Quand le paiement a été confirmé
  };
  
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'awaiting_payment';
  
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
  };

  statusHistory?: Array<{
    status: IOrder['status'];
    note?: string;
    timestamp: Date;
    smsSent?: boolean;
    emailSent?: boolean;
  }>;

  notes?: string;
  adminNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: String,
    variant: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  }],
  
  subtotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  shipping: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  
  promoCode: String,
  
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
  },
  isCampaignOrder: {
    type: Boolean,
    default: false,
  },
  
  // Paiement échelonné
  installmentPayment: {
    enabled: {
      type: Boolean,
      default: false,
    },
    firstAmount: Number,
    secondAmount: Number,
    firstPaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    secondPaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    firstPaymentDetails: {
      transactionId: String,
      paidAt: Date,
    },
    secondPaymentDetails: {
      transactionId: String,
      paidAt: Date,
    },
    secondPaymentDueDate: Date,
  },
  
  // Éligibilité campagne
  campaignEligibility: {
    isEligible: {
      type: Boolean,
      default: false,
    },
    cooperativeMember: {
      type: Boolean,
      default: false,
    },
    mutualInsuranceValid: {
      type: Boolean,
      default: false,
    },
    insuranceProvider: String,
    cooperativeEmail: String,
  },
  
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true, default: 'Cameroun' },
    postalCode: String,
    notes: String,
  },
  
  paymentMethod: {
    type: String,
    required: true,
    enum: ['campost', 'cash', 'whatsapp'],
    default: 'campost',
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'failed', 'refunded', 'awaiting_proof'],
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
  },
  
  // Paiement Campost
  campostPayment: {
    accountNumber: {
      type: String,
      default: 'XXXX-XXXX-XXXX', // À configurer
    },
    accountName: {
      type: String,
      default: 'AGRIPOINT SERVICES',
    },
    receiptImage: String,
    receiptUploadedAt: Date,
    validatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    validatedAt: Date,
    validationNotes: String,
  },
  
  // Paiement WhatsApp Mobile Money
  whatsappPayment: {
    mobileMoneyProvider: {
      type: String,
      enum: ['orange', 'mtn'],
    },
    mobileMoneyNumber: String,
    screenshotUrl: String,
    screenshotUploadedAt: Date,
    validatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    validatedAt: Date,
    validationNotes: String,
    paymentRequestedAt: Date,
    paymentConfirmedAt: Date,
  },
  
  status: {
    type: String,
    default: 'awaiting_payment',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'awaiting_payment'],
  },
  
  tracking: {
    carrier: String,
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
  },

  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'awaiting_payment'],
      required: true,
    },
    note: String,
    timestamp: { type: Date, default: Date.now },
    smsSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  }],

  notes: String,
  adminNotes: String,
}, {
  timestamps: true,
});

// Index
// orderNumber a déjà un index via unique: true
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });

const Order: Model<IOrder> = models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
