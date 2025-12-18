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
  
  paymentMethod: 'stripe' | 'paypal' | 'mtn' | 'orange' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentDetails?: {
    transactionId?: string;
    paidAt?: Date;
  };
  
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
  };
  
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
    enum: ['stripe', 'paypal', 'mtn', 'orange', 'cash'],
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'failed', 'refunded'],
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
  },
  
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  },
  
  tracking: {
    carrier: String,
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
  },
  
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
