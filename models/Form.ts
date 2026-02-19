import mongoose, { Schema, models, Model } from 'mongoose';

// Types de champs disponibles
export type FieldType =
  | 'text'          // Texte simple
  | 'email'         // Email avec validation
  | 'tel'           // Téléphone
  | 'number'        // Nombre
  | 'textarea'      // Texte multi-lignes
  | 'select'        // Liste déroulante
  | 'radio'         // Boutons radio
  | 'checkbox'      // Cases à cocher multiples
  | 'single-checkbox' // Case à cocher unique (CGU, newsletter, etc.)
  | 'date'          // Sélecteur de date
  | 'time'          // Sélecteur d'heure
  | 'datetime'      // Date et heure
  | 'file'          // Upload de fichier
  | 'url'           // URL avec validation
  | 'hidden'        // Champ caché
  | 'rating'        // Notation (étoiles)
  | 'slider'        // Curseur numérique
  | 'color'         // Sélecteur de couleur
  | 'section'       // Section/Séparateur (pas un champ)
  | 'html';         // HTML personnalisé

// Règle de validation
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message?: string;
  customFunction?: string;  // Code JS personnalisé
}

// Options pour champs avec choix
export interface FieldOption {
  label: string;
  value: string;
  selected?: boolean;
}

// Configuration d'un champ de formulaire
export interface IFormField {
  id: string;
  type: FieldType;
  name: string;              // Nom technique (slug)
  label: string;             // Label affiché
  placeholder?: string;
  description?: string;      // Texte d'aide sous le champ
  defaultValue?: any;
  
  // Validation
  required?: boolean;
  validation?: ValidationRule[];
  
  // Options pour select, radio, checkbox
  options?: FieldOption[];
  
  // Configuration spécifique
  multiple?: boolean;        // Pour file et select
  accept?: string[];         // Types de fichiers acceptés
  maxFileSize?: number;      // Taille max en bytes
  min?: number;              // Pour number, slider, date
  max?: number;
  step?: number;             // Pour number, slider
  rows?: number;             // Pour textarea
  
  // Affichage
  width?: 'full' | 'half' | 'third' | 'quarter';
  order: number;
  
  // Visibilité conditionnelle
  conditional?: {
    field: string;           // Nom du champ condition
    operator: 'equals' | 'not-equals' | 'contains' | 'greater' | 'less';
    value: any;
  };
  
  // Attributs HTML supplémentaires
  attributes?: Record<string, any>;
}

// Configuration d'affichage du formulaire
export interface FormSettings {
  // Soumission
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;       // Redirection après soumission
  allowMultipleSubmissions?: boolean;
  requireAuth?: boolean;      // Connexion requise
  
  // Captcha
  enableCaptcha?: boolean;
  captchaType?: 'recaptcha' | 'hcaptcha' | 'turnstile';
  captchaSiteKey?: string;
  
  // Email notifications
  sendEmailNotification?: boolean;
  notificationEmails?: string[];  // Liste d'emails à notifier
  emailSubject?: string;
  emailTemplate?: string;         // Template personnalisé
  
  // Réponse automatique
  sendAutoReply?: boolean;
  autoReplyEmail?: string;        // Champ email du formulaire
  autoReplySubject?: string;
  autoReplyMessage?: string;
  
  // Webhooks
  webhooks?: Array<{
    url: string;
    method: 'POST' | 'GET';
    headers?: Record<string, string>;
    active: boolean;
  }>;
  
  // Limites
  maxSubmissions?: number;    // Limite totale de soumissions
  rateLimit?: {
    maxPerHour?: number;
    maxPerDay?: number;
  };
  
  // Design
  theme?: {
    primaryColor?: string;
    layout?: 'default' | 'card' | 'steps';
    showProgressBar?: boolean;
  };
}

// Interface principale du formulaire
export interface IForm {
  _id: string;
  
  // Informations de base
  name: string;
  slug: string;              // URL-friendly
  description?: string;
  
  // Champs du formulaire
  fields: IFormField[];
  
  // Configuration
  settings: FormSettings;
  
  // Statut
  status: 'draft' | 'published' | 'closed' | 'archived';
  publishedAt?: Date;
  closedAt?: Date;
  
  // Statistiques
  stats: {
    totalSubmissions: number;
    lastSubmissionAt?: Date;
    averageCompletionTime?: number;  // En secondes
    completionRate?: number;         // Pourcentage
    views: number;
  };
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    noIndex?: boolean;
  };
  
  // Intégrations
  integrations?: {
    googleSheets?: {
      enabled: boolean;
      spreadsheetId?: string;
      worksheetName?: string;
    };
    mailchimp?: {
      enabled: boolean;
      listId?: string;
      apiKey?: string;
    };
    zapier?: {
      enabled: boolean;
      webhookUrl?: string;
    };
  };
  
  // Meta
  createdBy: string;         // User ID
  updatedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour les champs
const FieldOptionSchema = new Schema({
  label: String,
  value: String,
  selected: Boolean,
}, { _id: false });

const ValidationRuleSchema = new Schema({
  type: {
    type: String,
    enum: ['required', 'min', 'max', 'pattern', 'email', 'url', 'custom'],
  },
  value: Schema.Types.Mixed,
  message: String,
  customFunction: String,
}, { _id: false });

const FormFieldSchema = new Schema<IFormField>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'text', 'email', 'tel', 'number', 'textarea',
      'select', 'radio', 'checkbox', 'single-checkbox',
      'date', 'time', 'datetime', 'file', 'url',
      'hidden', 'rating', 'slider', 'color', 'section', 'html'
    ],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: String,
  description: String,
  defaultValue: Schema.Types.Mixed,
  
  required: {
    type: Boolean,
    default: false,
  },
  validation: [ValidationRuleSchema],
  
  options: [FieldOptionSchema],
  
  multiple: Boolean,
  accept: [String],
  maxFileSize: Number,
  min: Number,
  max: Number,
  step: Number,
  rows: Number,
  
  width: {
    type: String,
    enum: ['full', 'half', 'third', 'quarter'],
    default: 'full',
  },
  order: {
    type: Number,
    required: true,
  },
  
  conditional: {
    field: String,
    operator: {
      type: String,
      enum: ['equals', 'not-equals', 'contains', 'greater', 'less'],
    },
    value: Schema.Types.Mixed,
  },
  
  attributes: Schema.Types.Mixed,
}, { _id: false });

// Schéma principal
const FormSchema = new Schema<IForm>({
  name: {
    type: String,
    required: [true, 'Le nom du formulaire est requis'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: String,
  
  fields: {
    type: [FormFieldSchema],
    default: [],
  },
  
  settings: {
    submitButtonText: {
      type: String,
      default: 'Envoyer',
    },
    successMessage: {
      type: String,
      default: 'Merci ! Votre formulaire a été envoyé avec succès.',
    },
    redirectUrl: String,
    allowMultipleSubmissions: {
      type: Boolean,
      default: true,
    },
    requireAuth: {
      type: Boolean,
      default: false,
    },
    
    enableCaptcha: Boolean,
    captchaType: String,
    captchaSiteKey: String,
    
    sendEmailNotification: Boolean,
    notificationEmails: [String],
    emailSubject: String,
    emailTemplate: String,
    
    sendAutoReply: Boolean,
    autoReplyEmail: String,
    autoReplySubject: String,
    autoReplyMessage: String,
    
    webhooks: [{
      url: String,
      method: {
        type: String,
        enum: ['POST', 'GET'],
        default: 'POST',
      },
      headers: Schema.Types.Mixed,
      active: {
        type: Boolean,
        default: true,
      },
    }],
    
    maxSubmissions: Number,
    rateLimit: {
      maxPerHour: Number,
      maxPerDay: Number,
    },
    
    theme: {
      primaryColor: String,
      layout: {
        type: String,
        enum: ['default', 'card', 'steps'],
        default: 'default',
      },
      showProgressBar: Boolean,
    },
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'archived'],
    default: 'draft',
    index: true,
  },
  publishedAt: Date,
  closedAt: Date,
  
  stats: {
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    lastSubmissionAt: Date,
    averageCompletionTime: Number,
    completionRate: Number,
    views: {
      type: Number,
      default: 0,
    },
  },
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    noIndex: Boolean,
  },
  
  integrations: {
    googleSheets: {
      enabled: Boolean,
      spreadsheetId: String,
      worksheetName: String,
    },
    mailchimp: {
      enabled: Boolean,
      listId: String,
      apiKey: String,
    },
    zapier: {
      enabled: Boolean,
      webhookUrl: String,
    },
  },
  
  // @ts-expect-error - Mongoose ObjectId type compatible
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

// Index pour performance
FormSchema.index({ status: 1, createdAt: -1 });
FormSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual pour URL du formulaire
FormSchema.virtual('url').get(function() {
  // @ts-expect-error - Mongoose virtual property
  return `/forms/${this.slug}`;
});

// Méthode pour générer le slug
FormSchema.methods.generateSlug = function(): string {
  return this.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Méthode pour valider les champs
FormSchema.methods.hasUniqueFieldNames = function(): boolean {
  const names = this.fields.map((f: IFormField) => f.name);
  return names.length === new Set(names).size;
};

// Méthode pour publier
FormSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
};

// Méthode pour fermer
FormSchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
};

// Méthode pour dupliquer
FormSchema.methods.duplicate = async function(newSlug: string, newName?: string) {
  const FormModel = this.constructor as Model<IForm>;
  
  const duplicate = new FormModel({
    ...this.toObject(),
    _id: undefined,
    slug: newSlug,
    name: newName || `${this.name} (copie)`,
    status: 'draft',
    publishedAt: undefined,
    stats: {
      totalSubmissions: 0,
      views: 0,
    },
    createdAt: undefined,
    updatedAt: undefined,
  });
  
  return duplicate.save();
};

// Query helper pour published
// @ts-expect-error - Mongoose query helper dynamique
FormSchema.query.published = function() {
  // @ts-expect-error - Mongoose query helper dynamique
  return this.where({ status: 'published' });
};

// Query helper pour active (published et pas closed)
// @ts-expect-error - Mongoose query helper dynamique
FormSchema.query.active = function() {
  // @ts-expect-error - Mongoose query helper dynamique
  return this.where({
    status: 'published',
    $or: [
      { closedAt: { $exists: false } },
      { closedAt: { $gt: new Date() } },
    ],
  });
};

// Pre-save hook
FormSchema.pre('save', function(next) {
  // Vérifier l'unicité des noms de champs
  // @ts-expect-error - Mongoose instance method dynamique
  if (!this.hasUniqueFieldNames()) {
    return next(new Error('Les noms de champs doivent être uniques'));
  }
  
  // Assigner des IDs aux champs sans ID
  // @ts-expect-error - Mongoose instance property
  this.fields = this.fields.map((field: any, index: any) => {
    if (!field.id) {
      field.id = `field_${Date.now()}_${index}`;
    }
    if (field.order === undefined) {
      field.order = index;
    }
    return field;
  });
  
  next();
});

const Form: Model<IForm> = models.Form || mongoose.model<IForm>('Form', FormSchema);

export default Form;
