import mongoose, { Schema, models, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// -----------------------------------------------------------------------------
// Interface TypeScript
// -----------------------------------------------------------------------------
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'redacteur' | 'assistant_ia' | 'client';
  permissions: string[];

  // Contact
  phone: string;
  whatsapp?: string;

  // Localisation (Cameroun structuré)
  address: {
    street?: string;
    quartier?: string;
    city: string;
    region: string;
    country: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
  };

  avatar?: string;
  isActive: boolean;

  // Identifiant unique client ex: AGP-LK2M-4X9Z
  uniqueCode: string;

  // Statut du compte
  accountStatus: 'pending_email' | 'pending_admin' | 'approved' | 'rejected' | 'suspended';
  approvedBy?: mongoose.Types.ObjectId | string;
  approvedAt?: Date;
  rejectionReason?: string;

  // Email verification
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;

  // Password reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Brute-force protection
  loginAttempts: number;
  lockUntil?: Date;

  // Session metadata
  lastLoginAt?: Date;
  lastLoginIp?: string;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  generateVerificationToken(): string;
  generatePasswordResetToken(): string;
}

// -----------------------------------------------------------------------------
// Schéma Mongoose
// -----------------------------------------------------------------------------
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Le nom complet est requis'],
      trim: true,
      minlength: [2, 'Minimum 2 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'adresse email est requise"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Adresse email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [8, 'Minimum 8 caractères'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'redacteur', 'assistant_ia', 'client'],
      default: 'client',
    },
    permissions: [{ type: String }],

    // -- Contact -------------------------------------------------------------
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est requis'],
      trim: true,
    },
    whatsapp: { type: String, trim: true },

    // -- Localisation ---------------------------------------------------------
    address: {
      street:   { type: String, trim: true },
      quartier: { type: String, trim: true },
      city:     { type: String, required: [true, 'La ville est requise'], trim: true },
      region:   { type: String, required: [true, 'La région est requise'], trim: true },
      country:  { type: String, default: 'Cameroun' },
      postalCode: { type: String },
      coordinates: { lat: Number, lng: Number },
    },

    avatar:   { type: String },
    isActive: { type: Boolean, default: true },

    // -- Code unique -----------------------------------------------------------
    uniqueCode: { type: String, unique: true, uppercase: true, sparse: true },

    // -- Statut compte ---------------------------------------------------------
    accountStatus: {
      type: String,
      enum: ['pending_email', 'pending_admin', 'approved', 'rejected', 'suspended'],
      default: 'pending_email',
    },
    approvedBy:      { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt:      Date,
    rejectionReason: String,

    // -- Email vérification ----------------------------------------------------
    emailVerified:            { type: Boolean, default: false },
    emailVerificationToken:   { type: String, select: false },
    emailVerificationExpires: Date,

    // -- Reset mot de passe ----------------------------------------------------
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: Date,

    // -- Sécurité --------------------------------------------------------------
    loginAttempts: { type: Number, default: 0 },
    lockUntil:     Date,

    // -- Métadonnées session ---------------------------------------------------
    lastLoginAt: Date,
    lastLoginIp: String,
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Hooks pre-save
// -----------------------------------------------------------------------------

// Hash du mot de passe (bcrypt 12 rounds)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Génération automatique du code unique AGP-XXXX-XXXX
UserSchema.pre('save', function (next) {
  if (this.isNew && !this.uniqueCode) {
    const ts   = Date.now().toString(36).toUpperCase().slice(-4);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.uniqueCode = `AGP-${ts}-${rand}`;
  }
  next();
});

// -----------------------------------------------------------------------------
// Méthodes d'instance
// -----------------------------------------------------------------------------

/** Compare un mot de passe candidat avec le hash stocké */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/** Vrai si le compte est temporairement verrouillé (brute-force) */
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

/** Génère un token de vérification d'email (expire 24h) — retourne le token brut */
UserSchema.methods.generateVerificationToken = function (): string {
  const raw = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(raw).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 3600 * 1000);
  return raw;
};

/** Génère un token de réinitialisation du mot de passe (expire 1h) — retourne le token brut */
UserSchema.methods.generatePasswordResetToken = function (): string {
  const raw = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(raw).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 3600 * 1000);
  return raw;
};

// -----------------------------------------------------------------------------
// Indexes
// -----------------------------------------------------------------------------
UserSchema.index({ accountStatus: 1, role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1, isActive: 1 });

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------
const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
