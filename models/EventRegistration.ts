import mongoose, { Schema, Document, Model } from 'mongoose';
// @ts-expect-error - QRCode package à installer : npm install qrcode @types/qrcode
import QRCode from 'qrcode';

// Status d'inscription
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'waitlist' | 'attended';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Interface pour les données personnalisées
export interface ICustomFieldData {
  fieldName: string;
  fieldLabel: string;
  value: any;
}

// Interface pour le paiement
export interface IPaymentInfo {
  status: PaymentStatus;
  amount: number;
  currency: string;
  method?: 'card' | 'paypal' | 'transfer' | 'cash' | 'free';
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

// Interface principale de l'inscription
export interface IEventRegistration extends Document {
  // Événement
  eventId: mongoose.Types.ObjectId;
  eventSlug: string;
  eventTitle: string;
  eventStartDate: Date;
  
  // Participant
  userId?: mongoose.Types.ObjectId; // Si connecté
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  
  // Inscription
  status: RegistrationStatus;
  registrationNumber: string; // ID unique
  registrationDate: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  
  // Type d'inscription
  isWaitlist: boolean;
  waitlistPosition?: number;
  upgradedFromWaitlistAt?: Date;
  
  // Nombre de places
  numberOfAttendees: number;
  attendeeNames?: string[];
  
  // Données personnalisées
  customFields: ICustomFieldData[];
  
  // Paiement
  payment?: IPaymentInfo;
  
  // QR Code
  qrCode?: string; // Base64 ou URL
  qrCodeGenerated: boolean;
  
  // Check-in
  checkedIn: boolean;
  checkInTime?: Date;
  checkInBy?: mongoose.Types.ObjectId;
  
  // Notifications
  confirmationEmailSent: boolean;
  reminderEmailSent: boolean;
  
  // Notes internes
  notes?: string;
  tags: string[];
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  
  // Méthodes
  generateRegistrationNumber(): string;
  generateQRCode(): Promise<string>;
  confirm(): void;
  cancel(reason?: string): void;
  checkIn(userId?: mongoose.Types.ObjectId): void;
  upgradeFromWaitlist(): void;
  sendConfirmationEmail(): Promise<void>;
  sendReminderEmail(): Promise<void>;
}

// Schema
const EventRegistrationSchema = new Schema<IEventRegistration>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  eventSlug: {
    type: String,
    required: true,
  },
  eventTitle: {
    type: String,
    required: true,
  },
  eventStartDate: {
    type: Date,
    required: true,
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  },
  phone: String,
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'France' },
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'waitlist', 'attended'],
    default: 'pending',
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  
  isWaitlist: {
    type: Boolean,
    default: false,
  },
  waitlistPosition: Number,
  upgradedFromWaitlistAt: Date,
  
  numberOfAttendees: {
    type: Number,
    default: 1,
    min: 1,
  },
  attendeeNames: [String],
  
  customFields: [{
    fieldName: String,
    fieldLabel: String,
    value: Schema.Types.Mixed,
  }],
  
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    amount: Number,
    currency: { type: String, default: 'EUR' },
    method: {
      type: String,
      enum: ['card', 'paypal', 'transfer', 'cash', 'free'],
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
  },
  
  qrCode: String,
  qrCodeGenerated: {
    type: Boolean,
    default: false,
  },
  
  checkedIn: {
    type: Boolean,
    default: false,
  },
  checkInTime: Date,
  checkInBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  confirmationEmailSent: {
    type: Boolean,
    default: false,
  },
  reminderEmailSent: {
    type: Boolean,
    default: false,
  },
  
  notes: String,
  tags: [String],
}, {
  timestamps: true,
});

// Indexes
EventRegistrationSchema.index({ eventId: 1, createdAt: -1 });
EventRegistrationSchema.index({ eventSlug: 1, status: 1 });
EventRegistrationSchema.index({ email: 1, eventId: 1 });
EventRegistrationSchema.index({ userId: 1, createdAt: -1 });
EventRegistrationSchema.index({ registrationNumber: 1 }, { unique: true, sparse: true });
EventRegistrationSchema.index({ status: 1, eventStartDate: 1 });
EventRegistrationSchema.index({ isWaitlist: 1, waitlistPosition: 1 });

// Virtual pour le nom complet
EventRegistrationSchema.virtual('fullName').get(function(this: IEventRegistration) {
  return `${this.firstName} ${this.lastName}`;
});

// Méthodes d'instance
EventRegistrationSchema.methods.generateRegistrationNumber = function(this: IEventRegistration): string {
  if (this.registrationNumber) return this.registrationNumber;
  
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const eventPrefix = this.eventSlug.substring(0, 3).toUpperCase();
  
  this.registrationNumber = `${eventPrefix}-${timestamp}-${random}`;
  return this.registrationNumber;
};

EventRegistrationSchema.methods.generateQRCode = async function(this: IEventRegistration): Promise<string> {
  if (this.qrCode) return this.qrCode;
  
  const qrData = {
    registrationNumber: this.registrationNumber,
    eventId: this.eventId.toString(),
    eventSlug: this.eventSlug,
    fullName: `${this.firstName} ${this.lastName}`,
    email: this.email,
    numberOfAttendees: this.numberOfAttendees,
  };
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
    });
    
    this.qrCode = qrCodeDataURL;
    this.qrCodeGenerated = true;
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Erreur génération QR code:', error);
    throw error;
  }
};

EventRegistrationSchema.methods.confirm = function(this: IEventRegistration): void {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  
  if (this.isWaitlist) {
    this.isWaitlist = false;
    this.upgradedFromWaitlistAt = new Date();
  }
};

EventRegistrationSchema.methods.cancel = function(this: IEventRegistration, reason?: string): void {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  if (reason) {
    this.cancellationReason = reason;
  }
};

EventRegistrationSchema.methods.checkIn = function(
  this: IEventRegistration, 
  userId?: mongoose.Types.ObjectId
): void {
  this.checkedIn = true;
  this.checkInTime = new Date();
  this.status = 'attended';
  if (userId) {
    this.checkInBy = userId;
  }
};

EventRegistrationSchema.methods.upgradeFromWaitlist = function(this: IEventRegistration): void {
  if (!this.isWaitlist) return;
  
  this.isWaitlist = false;
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  this.upgradedFromWaitlistAt = new Date();
  this.waitlistPosition = undefined;
};

EventRegistrationSchema.methods.sendConfirmationEmail = async function(this: IEventRegistration): Promise<void> {
  // TODO: Implémenter l'envoi d'email
  console.log(`Envoi email confirmation à ${this.email} pour ${this.eventTitle}`);
  this.confirmationEmailSent = true;
};

EventRegistrationSchema.methods.sendReminderEmail = async function(this: IEventRegistration): Promise<void> {
  // TODO: Implémenter l'envoi d'email
  console.log(`Envoi email rappel à ${this.email} pour ${this.eventTitle}`);
  this.reminderEmailSent = true;
};

// Pre-save hook
EventRegistrationSchema.pre('save', function(this: IEventRegistration, next) {
  // Générer le numéro d'inscription si nouveau
  if (this.isNew && !this.registrationNumber) {
    this.generateRegistrationNumber();
  }
  
  next();
});

// Méthodes statiques
EventRegistrationSchema.statics.getEventStats = async function(eventId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { eventId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        confirmed: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
        waitlist: {
          $sum: { $cond: ['$isWaitlist', 1, 0] },
        },
        attended: {
          $sum: { $cond: ['$checkedIn', 1, 0] },
        },
        totalAttendees: { $sum: '$numberOfAttendees' },
      },
    },
  ]);
  
  return stats[0] || {
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    waitlist: 0,
    attended: 0,
    totalAttendees: 0,
  };
};

EventRegistrationSchema.statics.exportToCSV = async function(eventId: mongoose.Types.ObjectId) {
  const registrations = await this.find({ eventId }).sort({ createdAt: -1 });
  
  if (registrations.length === 0) {
    return 'Aucune inscription';
  }
  
  // En-têtes
  const headers = [
    'Numéro',
    'Nom',
    'Prénom',
    'Email',
    'Téléphone',
    'Statut',
    'Places',
    'Check-in',
    'Date inscription',
  ];
  
  // Lignes
  const rows = registrations.map((reg: IEventRegistration) => [
    reg.registrationNumber,
    reg.lastName,
    reg.firstName,
    reg.email,
    reg.phone || '',
    reg.status,
    reg.numberOfAttendees,
    reg.checkedIn ? 'Oui' : 'Non',
    new Date(reg.registrationDate).toLocaleDateString('fr-FR'),
  ]);
  
  // CSV
  const csv = [
    headers.join(','),
    ...rows.map((row: any[]) => row.join(',')),
  ].join('\n');
  
  return csv;
};

// Modèle
const EventRegistration: Model<IEventRegistration> = 
  mongoose.models.EventRegistration || 
  mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);

export default EventRegistration;
