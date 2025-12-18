import mongoose, { Schema, models, Model } from 'mongoose';

// Permissions granulaires du système
export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ANALYTICS = 'view_analytics',
  
  // Produits
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCT = 'create_product',
  EDIT_PRODUCT = 'edit_product',
  DELETE_PRODUCT = 'delete_product',
  PUBLISH_PRODUCT = 'publish_product',
  
  // Commandes
  VIEW_ORDERS = 'view_orders',
  EDIT_ORDER = 'edit_order',
  DELETE_ORDER = 'delete_order',
  EXPORT_ORDERS = 'export_orders',
  
  // Utilisateurs
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  EDIT_USER = 'edit_user',
  DELETE_USER = 'delete_user',
  MANAGE_ROLES = 'manage_roles',
  APPROVE_USERS = 'approve_users',
  
  // Paramètres
  VIEW_SETTINGS = 'view_settings',
  EDIT_SETTINGS = 'edit_settings',
  
  // AgriBot
  VIEW_AGRIBOT = 'view_agribot',
  MANAGE_AGRIBOT = 'manage_agribot',
  
  // Avancé
  VIEW_LOGS = 'view_logs',
  MANAGE_SYSTEM = 'manage_system',
}

// Rôles prédéfinis avec leurs permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(Permission), // Toutes les permissions
  
  manager: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.EDIT_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.PUBLISH_PRODUCT,
    Permission.VIEW_ORDERS,
    Permission.EDIT_ORDER,
    Permission.EXPORT_ORDERS,
    Permission.VIEW_USERS,
    Permission.VIEW_SETTINGS,
    Permission.VIEW_AGRIBOT,
  ],
  
  redacteur: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.EDIT_PRODUCT,
    Permission.VIEW_ORDERS,
    Permission.VIEW_AGRIBOT,
  ],
  
  assistant_ia: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_ORDERS,
    Permission.VIEW_AGRIBOT,
    Permission.MANAGE_AGRIBOT,
  ],
  
  client: [
    Permission.VIEW_PRODUCTS,
  ],
};

export interface IInvitationCode {
  _id: string;
  code: string;
  email?: string;
  role: string;
  permissions: string[];
  createdBy: mongoose.Types.ObjectId | string;
  usedBy?: mongoose.Types.ObjectId | string;
  usedAt?: Date;
  expiresAt: Date;
  isActive: boolean;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationCodeSchema = new Schema<IInvitationCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  email: {
    type: String,
    lowercase: true,
    sparse: true, // Permet plusieurs null
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'manager', 'redacteur', 'assistant_ia', 'client'],
  },
  permissions: [{
    type: String,
    enum: Object.values(Permission),
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  usedAt: Date,
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  maxUses: {
    type: Number,
    default: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

InvitationCodeSchema.index({ code: 1 });
InvitationCodeSchema.index({ email: 1 });
InvitationCodeSchema.index({ createdBy: 1 });
InvitationCodeSchema.index({ expiresAt: 1 });

export interface IActivityLog {
  _id: string;
  user: mongoose.Types.ObjectId | string;
  action: string;
  category: 'auth' | 'user' | 'product' | 'order' | 'setting' | 'system';
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['auth', 'user', 'product', 'order', 'setting', 'system'],
    required: true,
  },
  details: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ category: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

export interface ISession {
  _id: string;
  user: mongoose.Types.ObjectId | string;
  token: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  isActive: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  ipAddress: String,
  userAgent: String,
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

SessionSchema.index({ user: 1, isActive: 1 });
SessionSchema.index({ token: 1 });
SessionSchema.index({ expiresAt: 1 });

const InvitationCode: Model<IInvitationCode> = models.InvitationCode || mongoose.model<IInvitationCode>('InvitationCode', InvitationCodeSchema);
const ActivityLog: Model<IActivityLog> = models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
const Session: Model<ISession> = models.Session || mongoose.model<ISession>('Session', SessionSchema);

export { InvitationCode, ActivityLog, Session };
