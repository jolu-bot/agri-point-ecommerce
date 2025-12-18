import mongoose, { Schema, models, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'redacteur' | 'assistant_ia' | 'client';
  permissions: string[];
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  };
  avatar?: string;
  isActive: boolean;
  
  // Nouveau système de validation et sécurité
  uniqueCode: string; // Code unique pour chaque utilisateur
  accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvedBy?: mongoose.Types.ObjectId | string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // 2FA
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  
  // Email verification
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  // Password reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Login attempts
  loginAttempts: number;
  lockUntil?: Date;
  
  // Metadata
  lastLoginAt?: Date;
  lastLoginIp?: string;
  
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'redacteur', 'assistant_ia', 'client'],
    default: 'client',
  },
  permissions: [{
    type: String,
  }],
  phone: String,
  address: {
    street: String,
    city: String,
    region: String,
    country: { type: String, default: 'Cameroun' },
    postalCode: String,
  },
  avatar: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Nouveau système
  uniqueCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
  },
  accountStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  rejectionReason: String,
  
  // 2FA
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    select: false,
  },
  
  // Email verification
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: Date,
  
  // Login attempts
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  
  // Metadata
  lastLoginAt: Date,
  lastLoginIp: String,
}, {
  timestamps: true,
});

// Hash password avant sauvegarde
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour vérifier si le compte est verrouillé
UserSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Générer un code unique avant la création
UserSchema.pre('save', async function(next) {
  // Générer le code unique si nouveau document
  if (this.isNew && !this.uniqueCode) {
    this.uniqueCode = generateUniqueCode();
  }
  next();
});

// Fonction pour générer un code unique
function generateUniqueCode(): string {
  const prefix = 'AGP'; // AGRI POINT
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
