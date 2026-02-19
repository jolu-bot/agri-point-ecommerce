import mongoose, { Schema, models, Model } from 'mongoose';

// Types de champs disponibles
export type FieldType = 
  | 'text'           // Input texte simple
  | 'richText'       // Éditeur WYSIWYG
  | 'number'         // Nombre
  | 'date'           // Date
  | 'datetime'       // Date + heure
  | 'boolean'        // Checkbox
  | 'select'         // Dropdown simple
  | 'multiSelect'    // Dropdown multiple
  | 'relation'       // Relation vers autre content type
  | 'media'          // Upload d'images/fichiers
  | 'json'           // JSON personnalisé
  | 'location'       // Coordonnées géographiques
  | 'email'          // Email validé
  | 'url'            // URL validée
  | 'color'          // Color picker
  | 'slug'           // Slug auto-généré
  | 'tags';          // Tags multiples

// Condition pour affichage conditionnel
export interface FieldCondition {
  field: string;                    // Slug du champ à vérifier
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 
            'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value?: any;
}

// Options de validation
export interface FieldValidation {
  required: boolean;
  min?: number;                     // Longueur min (string) ou valeur min (number)
  max?: number;                     // Longueur max ou valeur max
  pattern?: string;                 // Regex pattern
  custom?: string;                  // Code de validation JS personnalisé
  message?: string;                 // Message d'erreur personnalisé
}

// Options spécifiques par type de champ
export interface FieldOptions {
  // Pour select/multiSelect
  choices?: Array<{
    label: string;
    value: string;
    color?: string;                 // Couleur du badge (optionnel)
  }>;
  
  // Pour relation
  relationTo?: string;              // Slug du content type lié
  relationDisplay?: string;         // Champ à afficher (ex: "title", "name")
  multiple?: boolean;               // Relation multiple
  
  // Pour media
  accept?: string[];                // Types de fichiers acceptés (ex: ["image/*", "video/*"])
  maxFileSize?: number;             // Taille max en bytes
  maxFiles?: number;                // Nombre max de fichiers
  
  // Pour richText
  enabledFeatures?: string[];       // Features activées (bold, italic, link, etc.)
  
  // Pour number
  step?: number;                    // Incrément (ex: 0.01 pour décimales)
  
  // Pour location
  defaultZoom?: number;             // Zoom par défaut de la carte
  
  // Valeur par défaut
  defaultValue?: any;
  
  // Placeholder
  placeholder?: string;
  
  // Texte d'aide
  helpText?: string;
}

// UI Configuration
export interface FieldUI {
  // Groupement des champs
  group?: string;                   // Nom du groupe (ex: "Informations générales", "SEO")
  
  // Ordre d'affichage
  order: number;
  
  // Largeur (pour layout responsive)
  width?: 'full' | 'half' | 'third' | 'quarter';
  
  // Affichage conditionnel
  conditional?: FieldCondition;
  
  // Désactivé
  disabled?: boolean;
  
  // Hidden (stocké mais pas affiché)
  hidden?: boolean;
}

// Interface pour un champ de content type
export interface IContentField {
  id: string;                       // ID unique dans le content type
  name: string;                     // Nom affiché
  slug: string;                     // Slug (nom technique)
  type: FieldType;
  description?: string;
  
  validation: FieldValidation;
  options?: FieldOptions;
  ui: FieldUI;
}

// Interface pour un Content Type
export interface IContentType {
  _id: string;
  name: string;                     // Ex: "Article de Blog"
  slug: string;                     // Ex: "blog-post"
  pluralName: string;               // Ex: "Articles de Blog"
  description?: string;
  icon: string;                     // Nom de l'icône Lucide (ex: "FileText", "Calendar")
  
  // Champs du content type
  fields: IContentField[];
  
  // Configuration
  settings: {
    // Drafts
    enableDrafts: boolean;
    
    // Versioning
    enableVersioning: boolean;
    maxVersions?: number;           // Nombre max de versions à conserver
    
    // Comments
    enableComments: boolean;
    
    // SEO
    enableSEO: boolean;             // Ajoute automatiquement metaTitle, metaDesc, etc.
    
    // Timestamps
    timestamps: boolean;            // createdAt, updatedAt
    
    // Soft delete
    softDelete: boolean;            // deletedAt au lieu de vraie suppression
    
    // i18n
    enableInternationalization?: boolean;
    availableLocales?: string[];    // Ex: ["fr", "en", "de"]
    
    // Workflow
    workflow?: {
      enabled: boolean;
      states: Array<{
        name: string;
        slug: string;
        color: string;
      }>;
      defaultState: string;
    };
  };
  
  // Permissions par rôle
  permissions: {
    create: string[];               // Roles autorisés (ex: ["admin", "editor"])
    read: string[];
    update: string[];
    delete: string[];
    publish?: string[];             // Pour workflow
  };
  
  // Display configuration
  display: {
    // Champ utilisé comme titre principal
    titleField: string;             // Slug du champ (ex: "title", "name")
    
    // Champs affichés dans la liste
    listFields: string[];           // Slugs des champs (max 5-6)
    
    // Champs pour la recherche
    searchFields: string[];         // Slugs des champs searchables
    
    // Tri par défaut
    defaultSort: {
      field: string;
      order: 'asc' | 'desc';
    };
    
    // Filtres rapides
    filters?: Array<{
      field: string;
      label: string;
    }>;
  };
  
  // Hooks (code personnalisé)
  hooks?: {
    beforeCreate?: string;          // Code JS exécuté avant création
    afterCreate?: string;           // Code JS exécuté après création
    beforeUpdate?: string;
    afterUpdate?: string;
    beforeDelete?: string;
    afterDelete?: string;
  };
  
  // Meta
  isActive: boolean;
  isSystem: boolean;                // Si true, ne peut pas être supprimé
  entriesCount: number;             // Nombre d'entrées
  
  createdBy: string;                // User ID
  updatedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour les champs
const ContentFieldSchema = new Schema<IContentField>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'text', 'richText', 'number', 'date', 'datetime', 'boolean',
      'select', 'multiSelect', 'relation', 'media', 'json', 'location',
      'email', 'url', 'color', 'slug', 'tags'
    ],
    required: true,
  },
  description: String,
  
  validation: {
    required: {
      type: Boolean,
      default: false,
    },
    min: Number,
    max: Number,
    pattern: String,
    custom: String,
    message: String,
  },
  
  options: {
    choices: [{
      label: String,
      value: String,
      color: String,
    }],
    relationTo: String,
    relationDisplay: String,
    multiple: Boolean,
    accept: [String],
    maxFileSize: Number,
    maxFiles: Number,
    enabledFeatures: [String],
    step: Number,
    defaultZoom: Number,
    defaultValue: Schema.Types.Mixed,
    placeholder: String,
    helpText: String,
  },
  
  ui: {
    group: String,
    order: {
      type: Number,
      required: true,
    },
    width: {
      type: String,
      enum: ['full', 'half', 'third', 'quarter'],
      default: 'full',
    },
    conditional: {
      field: String,
      operator: {
        type: String,
        enum: ['equals', 'notEquals', 'contains', 'notContains', 
               'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty'],
      },
      value: Schema.Types.Mixed,
    },
    disabled: Boolean,
    hidden: Boolean,
  },
}, { _id: false });

// Schéma principal
const ContentTypeSchema = new Schema<IContentType>({
  name: {
    type: String,
    required: [true, 'Le nom du content type est requis'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  pluralName: {
    type: String,
    required: true,
  },
  description: String,
  icon: {
    type: String,
    default: 'FileText',
  },
  
  fields: {
    type: [ContentFieldSchema],
    validate: {
      validator: function(v: IContentField[]) {
        return v && v.length > 0;
      },
      message: 'Au moins un champ est requis',
    },
  },
  
  settings: {
    enableDrafts: {
      type: Boolean,
      default: true,
    },
    enableVersioning: {
      type: Boolean,
      default: false,
    },
    maxVersions: {
      type: Number,
      default: 10,
    },
    enableComments: {
      type: Boolean,
      default: false,
    },
    enableSEO: {
      type: Boolean,
      default: true,
    },
    timestamps: {
      type: Boolean,
      default: true,
    },
    softDelete: {
      type: Boolean,
      default: true,
    },
    enableInternationalization: Boolean,
    availableLocales: [String],
    workflow: {
      enabled: Boolean,
      states: [{
        name: String,
        slug: String,
        color: String,
      }],
      defaultState: String,
    },
  },
  
  permissions: {
    create: {
      type: [String],
      default: ['admin', 'editor'],
    },
    read: {
      type: [String],
      default: ['admin', 'editor', 'viewer'],
    },
    update: {
      type: [String],
      default: ['admin', 'editor'],
    },
    delete: {
      type: [String],
      default: ['admin'],
    },
    publish: {
      type: [String],
      default: ['admin', 'editor'],
    },
  },
  
  display: {
    titleField: {
      type: String,
      required: true,
    },
    listFields: {
      type: [String],
      default: [],
    },
    searchFields: {
      type: [String],
      default: [],
    },
    defaultSort: {
      field: {
        type: String,
        default: 'createdAt',
      },
      order: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'desc',
      },
    },
    filters: [{
      field: String,
      label: String,
    }],
  },
  
  hooks: {
    beforeCreate: String,
    afterCreate: String,
    beforeUpdate: String,
    afterUpdate: String,
    beforeDelete: String,
    afterDelete: String,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  entriesCount: {
    type: Number,
    default: 0,
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

// Index
ContentTypeSchema.index({ isActive: 1 });
ContentTypeSchema.index({ isSystem: 1 });
ContentTypeSchema.index({ createdAt: -1 });

// Méthode pour valider un field slug unique
ContentTypeSchema.methods.hasUniqueFieldSlugs = function(): boolean {
  const slugs = this.fields.map((f: IContentField) => f.slug);
  return slugs.length === new Set(slugs).size;
};

// Méthode pour obtenir un champ par slug
ContentTypeSchema.methods.getField = function(slug: string): IContentField | undefined {
  return this.fields.find((f: IContentField) => f.slug === slug);
};

// Méthode pour valider les relations
ContentTypeSchema.methods.validateRelations = async function(): Promise<boolean> {
  const ContentType = this.constructor as Model<IContentType>;
  
  for (const field of this.fields) {
    if (field.type === 'relation' && field.options?.relationTo) {
      const relatedType = await ContentType.findOne({ slug: field.options.relationTo });
      if (!relatedType) {
        throw new Error(`Content type lié "${field.options.relationTo}" introuvable pour le champ "${field.name}"`);
      }
    }
  }
  return true;
};

// Hook pre-save
ContentTypeSchema.pre('save', async function(next) {
  // Vérifier unicité des slugs de champs
  if (!this.hasUniqueFieldSlugs()) {
    return next(new Error('Les slugs de champs doivent être uniques'));
  }
  
  // Valider les relations
  try {
    await this.validateRelations();
  } catch (error: any) {
    return next(error);
  }
  
  // Vérifier que titleField existe
  const titleFieldExists = this.fields.some((f: IContentField) => f.slug === this.display.titleField);
  if (!titleFieldExists) {
    return next(new Error(`Le champ titleField "${this.display.titleField}" n'existe pas`));
  }
  
  next();
});

const ContentType: Model<IContentType> = models.ContentType || mongoose.model<IContentType>('ContentType', ContentTypeSchema);

export default ContentType;
