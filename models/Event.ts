import mongoose, { Schema, Document, Model } from 'mongoose';

// Types d'événements
export type EventType = 'physical' | 'online' | 'hybrid';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type RegistrationStatus = 'open' | 'closed' | 'full' | 'waitlist';

// Interface pour la localisation
export interface IEventLocation {
  type: 'physical' | 'online';
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  meetingUrl?: string;
  meetingPlatform?: 'zoom' | 'teams' | 'meet' | 'other';
  accessInstructions?: string;
}

// Interface pour les prix
export interface IEventPricing {
  isFree: boolean;
  price?: number;
  currency?: string;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: Date;
  memberPrice?: number;
  groupDiscount?: {
    minPeople: number;
    discountPercent: number;
  };
}

// Interface pour les options d'inscription
export interface IEventRegistrationOptions {
  requiresApproval: boolean;
  autoConfirm: boolean;
  allowWaitlist: boolean;
  maxWaitlistSize?: number;
  collectPhoneNumber: boolean;
  collectAddress: boolean;
  customFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
  }>;
  terms?: {
    enabled: boolean;
    text: string;
    url?: string;
  };
}

// Interface pour les paramètres de notification
export interface IEventNotifications {
  confirmationEmail: boolean;
  reminderEmail: boolean;
  reminderDaysBefore: number;
  cancellationEmail: boolean;
  updateEmail: boolean;
}

// Interface principale de l'événement
export interface IEvent extends Document {
  // Informations de base
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  
  // Type et statut
  type: EventType;
  status: EventStatus;
  registrationStatus: RegistrationStatus;
  
  // Dates
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date;
  
  // Localisation
  location: IEventLocation;
  
  // Capacité
  capacity?: number;
  currentAttendees: number;
  waitlistCount: number;
  
  // Prix
  pricing: IEventPricing;
  
  // Inscription
  registrationOptions: IEventRegistrationOptions;
  
  // Notifications
  notifications: IEventNotifications;
  
  // Organisateur
  organizer: {
    name: string;
    email: string;
    phone?: string;
    website?: string;
  };
  
  // Médias
  featuredImage?: string;
  gallery?: string[];
  
  // Catégorie et tags
  category?: string;
  tags: string[];
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    noIndex: boolean;
  };
  
  // Statistiques
  stats: {
    totalRegistrations: number;
    confirmedAttendees: number;
    cancelledRegistrations: number;
    views: number;
    checkIns: number;
  };
  
  // Audit
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Méthodes
  generateSlug(): string;
  canRegister(): boolean;
  isFull(): boolean;
  isUpcoming(): boolean;
  isPast(): boolean;
  getDaysUntilEvent(): number;
  getAvailableSpots(): number;
  publish(): void;
  cancel(): void;
  complete(): void;
}

// Sous-schemas
const EventLocationSchema = new Schema<IEventLocation>({
  type: {
    type: String,
    enum: ['physical', 'online'],
    required: true,
  },
  name: String,
  address: String,
  city: String,
  postalCode: String,
  country: { type: String, default: 'France' },
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  meetingUrl: String,
  meetingPlatform: {
    type: String,
    enum: ['zoom', 'teams', 'meet', 'other'],
  },
  accessInstructions: String,
}, { _id: false });

const EventPricingSchema = new Schema<IEventPricing>({
  isFree: { type: Boolean, default: true },
  price: Number,
  currency: { type: String, default: 'EUR' },
  earlyBirdPrice: Number,
  earlyBirdDeadline: Date,
  memberPrice: Number,
  groupDiscount: {
    minPeople: Number,
    discountPercent: Number,
  },
}, { _id: false });

const EventRegistrationOptionsSchema = new Schema<IEventRegistrationOptions>({
  requiresApproval: { type: Boolean, default: false },
  autoConfirm: { type: Boolean, default: true },
  allowWaitlist: { type: Boolean, default: true },
  maxWaitlistSize: Number,
  collectPhoneNumber: { type: Boolean, default: true },
  collectAddress: { type: Boolean, default: false },
  customFields: [{
    name: String,
    label: String,
    type: {
      type: String,
      enum: ['text', 'email', 'tel', 'select', 'checkbox'],
    },
    required: Boolean,
    options: [String],
  }],
  terms: {
    enabled: Boolean,
    text: String,
    url: String,
  },
}, { _id: false });

const EventNotificationsSchema = new Schema<IEventNotifications>({
  confirmationEmail: { type: Boolean, default: true },
  reminderEmail: { type: Boolean, default: true },
  reminderDaysBefore: { type: Number, default: 1 },
  cancellationEmail: { type: Boolean, default: true },
  updateEmail: { type: Boolean, default: true },
}, { _id: false });

// Schema principal
const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
  },
  shortDescription: {
    type: String,
    maxlength: 200,
  },
  
  type: {
    type: String,
    enum: ['physical', 'online', 'hybrid'],
    required: true,
    default: 'physical',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  registrationStatus: {
    type: String,
    enum: ['open', 'closed', 'full', 'waitlist'],
    default: 'open',
  },
  
  startDate: {
    type: Date,
    required: [true, 'La date de début est requise'],
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est requise'],
  },
  registrationDeadline: Date,
  
  location: {
    type: EventLocationSchema,
    required: true,
  },
  
  capacity: Number,
  currentAttendees: {
    type: Number,
    default: 0,
  },
  waitlistCount: {
    type: Number,
    default: 0,
  },
  
  pricing: {
    type: EventPricingSchema,
    default: () => ({ isFree: true }),
  },
  
  registrationOptions: {
    type: EventRegistrationOptionsSchema,
    default: () => ({}),
  },
  
  notifications: {
    type: EventNotificationsSchema,
    default: () => ({}),
  },
  
  organizer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    website: String,
  },
  
  featuredImage: String,
  gallery: [String],
  
  category: String,
  tags: [String],
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    noIndex: { type: Boolean, default: false },
  },
  
  stats: {
    totalRegistrations: { type: Number, default: 0 },
    confirmedAttendees: { type: Number, default: 0 },
    cancelledRegistrations: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    checkIns: { type: Number, default: 0 },
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
}, {
  timestamps: true,
});

// Indexes
EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ status: 1, startDate: 1 });
EventSchema.index({ type: 1, status: 1 });
EventSchema.index({ category: 1, status: 1 });
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ createdBy: 1, createdAt: -1 });
EventSchema.index({ 'location.city': 1, startDate: 1 });
EventSchema.index({ tags: 1 });

// Virtual pour l'URL
EventSchema.virtual('url').get(function(this: IEvent) {
  return `/evenements/${this.slug}`;
});

// Méthodes d'instance
EventSchema.methods.generateSlug = function(this: IEvent): string {
  if (this.slug) return this.slug;
  
  let slug = this.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  this.slug = slug;
  return slug;
};

EventSchema.methods.canRegister = function(this: IEvent): boolean {
  if (this.status !== 'published') return false;
  if (this.registrationStatus === 'closed') return false;
  
  const now = new Date();
  if (this.registrationDeadline && now > this.registrationDeadline) return false;
  if (now > this.startDate) return false;
  
  return true;
};

EventSchema.methods.isFull = function(this: IEvent): boolean {
  if (!this.capacity) return false;
  return this.currentAttendees >= this.capacity;
};

EventSchema.methods.isUpcoming = function(this: IEvent): boolean {
  return new Date() < this.startDate;
};

EventSchema.methods.isPast = function(this: IEvent): boolean {
  return new Date() > this.endDate;
};

EventSchema.methods.getDaysUntilEvent = function(this: IEvent): number {
  const now = new Date();
  const diff = this.startDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

EventSchema.methods.getAvailableSpots = function(this: IEvent): number {
  if (!this.capacity) return Infinity;
  return Math.max(0, this.capacity - this.currentAttendees);
};

EventSchema.methods.publish = function(this: IEvent): void {
  this.status = 'published';
  this.registrationStatus = 'open';
};

EventSchema.methods.cancel = function(this: IEvent): void {
  this.status = 'cancelled';
  this.registrationStatus = 'closed';
};

EventSchema.methods.complete = function(this: IEvent): void {
  this.status = 'completed';
  this.registrationStatus = 'closed';
};

// Pre-save hook
EventSchema.pre('save', function(this: IEvent, next) {
  // Générer le slug si non défini
  if (!this.slug) {
    this.generateSlug();
  }
  
  // Mettre à jour le statut d'inscription selon la capacité
  if (this.capacity && this.currentAttendees >= this.capacity) {
    if (this.registrationOptions.allowWaitlist) {
      this.registrationStatus = 'waitlist';
    } else {
      this.registrationStatus = 'full';
    }
  } else if (this.registrationStatus === 'full' || this.registrationStatus === 'waitlist') {
    this.registrationStatus = 'open';
  }
  
  // Marquer comme completed si la date est passée
  if (this.status === 'published' && new Date() > this.endDate) {
    this.status = 'completed';
  }
  
  next();
});

// Query helpers
EventSchema.query.upcoming = function() {
  return this.where('startDate').gte(new Date()).where('status').equals('published');
};

EventSchema.query.past = function() {
  return this.where('endDate').lt(new Date());
};

EventSchema.query.published = function() {
  return this.where('status').equals('published');
};

EventSchema.query.byType = function(type: EventType) {
  return this.where('type').equals(type);
};

EventSchema.query.byCategory = function(category: string) {
  return this.where('category').equals(category);
};

// Modèle
const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
