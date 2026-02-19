import mongoose, { Schema, models, Model } from 'mongoose';

// Interface pour les métadonnées de soumission
export interface SubmissionMetadata {
  ip?: string;
  userAgent?: string;
  referrer?: string;
  locale?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  completionTime?: number;  // Temps de remplissage en secondes
}

// Interface pour les fichiers uploadés
export interface UploadedFile {
  fieldName: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// Interface principale
export interface IFormSubmission {
  _id: string;
  
  // Référence au formulaire
  formId: mongoose.Types.ObjectId;
  formSlug: string;
  formName: string;
  
  // Données soumises (flexible)
  data: Record<string, any>;
  
  // Fichiers uploadés
  files?: UploadedFile[];
  
  // Utilisateur (si connecté)
  submittedBy?: mongoose.Types.ObjectId;
  
  // Métadonnées
  metadata: SubmissionMetadata;
  
  // Statut
  status: 'pending' | 'processed' | 'archived' | 'spam';
  
  // Notes internes
  notes?: string;
  tags?: string[];
  
  // Flags
  isRead: boolean;
  isStarred: boolean;
  
  // Export
  exportedAt?: Date;
  exportedBy?: mongoose.Types.ObjectId;
  exportFormat?: 'csv' | 'json' | 'excel' | 'pdf';
  
  // Traitement
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  
  // Score (pour spam detection ou autre)
  score?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionMetadataSchema = new Schema({
  ip: String,
  userAgent: String,
  referrer: String,
  locale: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
  },
  browser: String,
  os: String,
  completionTime: Number,
}, { _id: false });

const UploadedFileSchema = new Schema({
  fieldName: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: String,
  mimeType: String,
  size: Number,
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const FormSubmissionSchema = new Schema<IFormSubmission>({
  formId: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
    index: true,
  },
  formSlug: {
    type: String,
    required: true,
    index: true,
  },
  formName: {
    type: String,
    required: true,
  },
  
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  
  files: [UploadedFileSchema],
  
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  
  metadata: {
    type: SubmissionMetadataSchema,
    default: {},
  },
  
  status: {
    type: String,
    enum: ['pending', 'processed', 'archived', 'spam'],
    default: 'pending',
    index: true,
  },
  
  notes: String,
  tags: [String],
  
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  
  exportedAt: Date,
  exportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  exportFormat: {
    type: String,
    enum: ['csv', 'json', 'excel', 'pdf'],
  },
  
  processedAt: Date,
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  score: Number,
}, {
  timestamps: true,
});

// Index composites pour performance
FormSubmissionSchema.index({ formId: 1, createdAt: -1 });
FormSubmissionSchema.index({ formSlug: 1, createdAt: -1 });
FormSubmissionSchema.index({ status: 1, createdAt: -1 });
FormSubmissionSchema.index({ submittedBy: 1, createdAt: -1 });
FormSubmissionSchema.index({ isRead: 1, status: 1 });

// Index texte pour recherche
FormSubmissionSchema.index({ 
  formName: 'text',
  notes: 'text',
  'data': 'text',
});

// Méthode pour exporter en CSV
FormSubmissionSchema.methods.toCSVRow = function(): string[] {
  const row: string[] = [];
  
  // Ajouter les données du formulaire
  Object.keys(this.data).forEach(key => {
    const value = this.data[key];
    
    if (Array.isArray(value)) {
      row.push(value.join(', '));
    } else if (typeof value === 'object' && value !== null) {
      row.push(JSON.stringify(value));
    } else {
      row.push(String(value || ''));
    }
  });
  
  // Métadonnées
  row.push(this.createdAt.toISOString());
  row.push(this.metadata.ip || '');
  row.push(this.status);
  
  return row;
};

// Méthode pour exporter en JSON
FormSubmissionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  return {
    id: obj._id,
    formId: obj.formId,
    formSlug: obj.formSlug,
    data: obj.data,
    files: obj.files,
    submittedBy: obj.submittedBy,
    metadata: obj.metadata,
    status: obj.status,
    notes: obj.notes,
    tags: obj.tags,
    isRead: obj.isRead,
    isStarred: obj.isStarred,
    createdAt: obj.createdAt,
  };
};

// Méthode pour marquer comme lu
FormSubmissionSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Méthode pour marquer comme traité
FormSubmissionSchema.methods.markAsProcessed = function(userId: string) {
  this.status = 'processed';
  this.processedAt = new Date();
  this.processedBy = new mongoose.Types.ObjectId(userId);
  return this.save();
};

// Méthode pour détecter le spam (basique)
FormSubmissionSchema.methods.calculateSpamScore = function(): number {
  let score = 0;
  
  // Vérifier les patterns de spam dans les données
  const spamKeywords = ['viagra', 'casino', 'lottery', 'prize', 'winner', 'click here'];
  const dataString = JSON.stringify(this.data).toLowerCase();
  
  spamKeywords.forEach(keyword => {
    if (dataString.includes(keyword)) {
      score += 20;
    }
  });
  
  // Trop de liens
  const linkCount = (dataString.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) {
    score += linkCount * 10;
  }
  
  // Temps de remplissage trop court (moins de 5 secondes = suspect)
  if (this.metadata.completionTime && this.metadata.completionTime < 5) {
    score += 30;
  }
  
  return Math.min(score, 100);
};

// Query helper pour non lus
FormSubmissionSchema.query.unread = function() {
  return this.where({ isRead: false });
};

// Query helper pour starred
FormSubmissionSchema.query.starred = function() {
  return this.where({ isStarred: true });
};

// Query helper pour pending
FormSubmissionSchema.query.pending = function() {
  return this.where({ status: 'pending' });
};

// Pre-save hook - calculer le score de spam
FormSubmissionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.score = this.calculateSpamScore();
    
    // Auto-marquer comme spam si score élevé
    if (this.score >= 70) {
      this.status = 'spam';
    }
  }
  
  next();
});

// Static method pour exporter en masse
FormSubmissionSchema.statics.exportToCSV = async function(formId: string): Promise<string> {
  const submissions = await this.find({ formId }).sort({ createdAt: -1 });
  
  if (submissions.length === 0) {
    return '';
  }
  
  // En-têtes
  const firstSubmission = submissions[0];
  const headers = [
    ...Object.keys(firstSubmission.data),
    'Date de soumission',
    'IP',
    'Statut',
  ];
  
  // Lignes
  const rows = submissions.map((sub: any) => sub.toCSVRow());
  
  // Construire le CSV
  const csv = [
    headers.join(','),
    ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csv;
};

// Static method pour statistiques
FormSubmissionSchema.statics.getStats = async function(formId: string) {
  const stats = await this.aggregate([
    { $match: { formId: new mongoose.Types.ObjectId(formId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        processed: {
          $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] },
        },
        spam: {
          $sum: { $cond: [{ $eq: ['$status', 'spam'] }, 1, 0] },
        },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
        },
        avgCompletionTime: { $avg: '$metadata.completionTime' },
        avgSpamScore: { $avg: '$score' },
      },
    },
  ]);
  
  return stats[0] || {
    total: 0,
    pending: 0,
    processed: 0,
    spam: 0,
    unread: 0,
    avgCompletionTime: 0,
    avgSpamScore: 0,
  };
};

const FormSubmission: Model<IFormSubmission> = 
  models.FormSubmission || mongoose.model<IFormSubmission>('FormSubmission', FormSubmissionSchema);

export default FormSubmission;
