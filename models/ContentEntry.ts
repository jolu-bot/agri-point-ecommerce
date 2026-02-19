import mongoose, { Schema, models, Model } from 'mongoose';

// Interface pour une entrée de contenu
export interface IContentEntry {
  _id: string;
  
  // Référence au content type
  contentType: string;              // Content Type ID
  contentTypeSlug: string;          // Pour requêtes rapides
  
  // Données dynamiques (structure varie selon contentType)
  data: Record<string, any>;
  
  // Statut
  status: 'draft' | 'published' | 'archived';
  
  // Workflow personnalisé (si activé)
  workflowState?: string;
  
  // Version (si versioning activé)
  version?: number;
  versionHistory?: Array<{
    version: number;
    data: Record<string, any>;
    changedBy: string;
    changedAt: Date;
    comment?: string;
  }>;
  
  // SEO (si enableSEO activé dans content type)
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
  };
  
  // i18n (si enableInternationalization activé)
  locale?: string;
  translations?: Array<{
    locale: string;
    entryId: string;             // ID de l'entrée traduite
  }>;
  
  // Dates de publication
  publishedAt?: Date;
  scheduledAt?: Date;              // Pour publication programmée
  
  // Soft delete
  deletedAt?: Date;
  deletedBy?: string;
  
  // Auteur et modifications
  createdBy: string;                // User ID
  updatedBy?: string;
  
  // Timestamps automatiques
  createdAt: Date;
  updatedAt: Date;
}

const ContentEntrySchema = new Schema<IContentEntry>({
  contentType: {
    type: Schema.Types.ObjectId,
    ref: 'ContentType',
    required: true,
    index: true,
  },
  contentTypeSlug: {
    type: String,
    required: true,
    index: true,
  },
  
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  
  workflowState: {
    type: String,
    index: true,
  },
  
  version: {
    type: Number,
    default: 1,
  },
  versionHistory: [{
    version: Number,
    data: Schema.Types.Mixed,
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    changedAt: Date,
    comment: String,
  }],
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogImage: String,
    canonicalUrl: String,
    noIndex: {
      type: Boolean,
      default: false,
    },
  },
  
  locale: {
    type: String,
    default: 'fr',
    index: true,
  },
  translations: [{
    locale: String,
    entryId: {
      type: Schema.Types.ObjectId,
      ref: 'ContentEntry',
    },
  }],
  
  publishedAt: Date,
  scheduledAt: Date,
  
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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

// Index composés pour performance
ContentEntrySchema.index({ contentTypeSlug: 1, status: 1 });
ContentEntrySchema.index({ contentTypeSlug: 1, createdAt: -1 });
ContentEntrySchema.index({ contentTypeSlug: 1, publishedAt: -1 });
ContentEntrySchema.index({ contentTypeSlug: 1, locale: 1 });
ContentEntrySchema.index({ createdBy: 1, createdAt: -1 });

// Index pour recherche full-text (sera configuré dynamiquement)
ContentEntrySchema.index({ 'data.$**': 'text' });

// Méthode pour créer une nouvelle version
ContentEntrySchema.methods.createVersion = function(userId: string, comment?: string) {
  if (!this.versionHistory) {
    this.versionHistory = [];
  }
  
  this.versionHistory.push({
    version: this.version,
    data: JSON.parse(JSON.stringify(this.data)), // Deep clone
    changedBy: userId,
    changedAt: new Date(),
    comment,
  });
  
  this.version = (this.version || 1) + 1;
};

// Méthode pour restaurer une version
ContentEntrySchema.methods.restoreVersion = function(versionNumber: number): boolean {
  if (!this.versionHistory) return false;
  
  const version = this.versionHistory.find(v => v.version === versionNumber);
  if (!version) return false;
  
  this.data = JSON.parse(JSON.stringify(version.data)); // Deep clone
  return true;
};

// Méthode pour publier
ContentEntrySchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
};

// Méthode pour dépublier
ContentEntrySchema.methods.unpublish = function() {
  this.status = 'draft';
  this.publishedAt = undefined;
};

// Méthode pour archiver
ContentEntrySchema.methods.archive = function() {
  this.status = 'archived';
};

// Méthode pour soft delete
ContentEntrySchema.methods.softDelete = function(userId: string) {
  this.deletedAt = new Date();
  this.deletedBy = userId;
};

// Méthode pour restaurer après soft delete
ContentEntrySchema.methods.restore = function() {
  this.deletedAt = undefined;
  this.deletedBy = undefined;
};

// Méthode pour obtenir une valeur de data par path
ContentEntrySchema.methods.getDataValue = function(path: string): any {
  const keys = path.split('.');
  let value: any = this.data;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
};

// Méthode pour définir une valeur de data par path
ContentEntrySchema.methods.setDataValue = function(path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let target: any = this.data;
  
  for (const key of keys) {
    if (!(key in target)) {
      target[key] = {};
    }
    target = target[key];
  }
  
  target[lastKey] = value;
  this.markModified('data');
};

// Hook pre-save pour auto-publish si scheduledAt est passé
ContentEntrySchema.pre('save', function(next) {
  if (this.scheduledAt && this.scheduledAt <= new Date() && this.status === 'draft') {
    this.publish();
  }
  next();
});

// Query helper pour exclure les soft-deleted
ContentEntrySchema.query.notDeleted = function() {
  return this.where({ deletedAt: { $exists: false } });
};

// Query helper pour published uniquement
ContentEntrySchema.query.published = function() {
  return this.where({ status: 'published', publishedAt: { $lte: new Date() } });
};

const ContentEntry: Model<IContentEntry> = models.ContentEntry || mongoose.model<IContentEntry>('ContentEntry', ContentEntrySchema);

export default ContentEntry;
