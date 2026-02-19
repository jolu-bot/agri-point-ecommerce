import mongoose, { Schema, models, Model } from 'mongoose';

// Types de blocs disponibles
export type BlockType =
  | 'hero'              // Hero section avec image de fond
  | 'features'          // Grille de fonctionnalités
  | 'cta'               // Call-to-action banner
  | 'gallery'           // Galerie d'images
  | 'testimonials'      // Témoignages/avis clients
  | 'pricing'           // Tableaux de prix
  | 'faq'               // FAQ accordéon
  | 'blog-grid'         // Grille d'articles de blog
  | 'contact-form'      // Formulaire de contact
  | 'map'               // Carte géographique
  | 'stats'             // Compteurs/statistiques
  | 'team'              // Équipe/membres
  | 'timeline'          // Chronologie
  | 'video'             // Lecteur vidéo
  | 'text'              // Texte riche
  | 'spacer'            // Espace vide
  | 'divider'           // Séparateur visuel
  | 'html'              // HTML personnalisé
  | 'products'          // Grille de produits
  | 'newsletter';       // Inscription newsletter

// Configuration de style d'un bloc
export interface BlockStyle {
  // Padding
  paddingTop?: string;      // Ex: "0", "sm", "md", "lg", "xl", "2xl"
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  
  // Margin
  marginTop?: string;
  marginBottom?: string;
  
  // Background
  backgroundColor?: string;  // Couleur Tailwind ou hex
  backgroundImage?: string;  // URL de l'image
  backgroundGradient?: {
    type: 'linear' | 'radial';
    from: string;
    via?: string;
    to: string;
    direction?: string;      // Ex: "to-r", "to-br"
  };
  backgroundOpacity?: number; // 0-100
  
  // Border
  border?: {
    width: string;           // Ex: "0", "1", "2", "4"
    color: string;
    radius: string;          // Ex: "none", "sm", "md", "lg", "xl", "full"
  };
  
  // Shadow
  shadow?: string;           // Ex: "none", "sm", "md", "lg", "xl", "2xl"
  
  // Container
  containerWidth?: 'full' | 'container' | 'lg' | 'md' | 'sm';
  
  // CSS personnalisé
  customCSS?: string;
}

// Configuration responsive d'un bloc
export interface BlockResponsive {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  
  // Ordre d'affichage mobile
  mobileOrder?: number;
}

// Interface pour un bloc de page
export interface IPageBlock {
  id: string;                   // ID unique du bloc
  type: BlockType;
  order: number;
  
  // Props spécifiques au type de bloc (dynamique)
  props: Record<string, any>;
  
  // Styles
  styles: BlockStyle;
  
  // Responsive
  responsive: BlockResponsive;
  
  // Visibilité
  isVisible: boolean;
  
  // Animation
  animation?: {
    type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
    duration: number;          // ms
    delay: number;             // ms
  };
  
  // Conditions d'affichage (avancé)
  displayConditions?: {
    userRole?: string[];       // Afficher seulement pour certains rôles
    dateRange?: {
      start?: Date;
      end?: Date;
    };
    customLogic?: string;      // Code JS personnalisé
  };
}

// Layouts disponibles
export type PageLayout = 
  | 'default'           // Header + Content + Footer
  | 'full-width'        // Pleine largeur, pas de container
  | 'sidebar-left'      // Sidebar à gauche
  | 'sidebar-right'     // Sidebar à droite
  | 'landing'           // Landing page (pas de header/footer)
  | 'custom';           // Layout personnalisé

// Interface principale de Page
export interface IPage {
  _id: string;
  
  // Informations de base
  title: string;
  slug: string;                 // URL path (ex: "/about", "/blog/article-1")
  path: string;                 // Chemin complet (généré automatiquement)
  description?: string;
  
  // Layout
  layout: PageLayout;
  customLayout?: string;        // ID du layout personnalisé
  
  // Blocs de contenu
  blocks: IPageBlock[];
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
  };
  
  // Statut et publication
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Date;
  scheduledAt?: Date;
  
  // Template (pour créer des pages à partir de templates)
  isTemplate: boolean;
  templateName?: string;
  templateCategory?: string;    // Ex: "landing", "e-commerce", "blog"
  
  // Versioning
  version: number;
  versionHistory?: Array<{
    version: number;
    blocks: IPageBlock[];
    createdBy: string;
    createdAt: Date;
    comment?: string;
  }>;
  
  // Analytics
  stats: {
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;      // secondes
    bounceRate: number;         // pourcentage
    lastViewed?: Date;
  };
  
  // Permissions
  permissions: {
    visibility: 'public' | 'private' | 'protected';
    password?: string;          // Pour protected
    allowedRoles?: string[];    // Pour private
  };
  
  // Settings avancés
  settings: {
    enableComments?: boolean;
    requireAuth?: boolean;
    redirectUrl?: string;       // Redirection automatique
    customCode?: {
      headHTML?: string;        // Code dans <head>
      bodyHTML?: string;        // Code avant </body>
    };
  };
  
  // Parent page (pour hiérarchie)
  parentPage?: string;          // Page ID
  childPages?: string[];        // Page IDs
  
  // Langue et traductions
  locale: string;
  translations?: Array<{
    locale: string;
    pageId: string;
  }>;
  
  // Meta
  createdBy: string;            // User ID
  updatedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour les blocs
const BlockStyleSchema = new Schema({
  paddingTop: String,
  paddingBottom: String,
  paddingLeft: String,
  paddingRight: String,
  marginTop: String,
  marginBottom: String,
  backgroundColor: String,
  backgroundImage: String,
  backgroundGradient: {
    type: String,
    from: String,
    via: String,
    to: String,
    direction: String,
  },
  backgroundOpacity: Number,
  border: {
    width: String,
    color: String,
    radius: String,
  },
  shadow: String,
  containerWidth: String,
  customCSS: String,
}, { _id: false });

const BlockResponsiveSchema = new Schema({
  hideOnMobile: Boolean,
  hideOnTablet: Boolean,
  hideOnDesktop: Boolean,
  mobileOrder: Number,
}, { _id: false });

const PageBlockSchema = new Schema<IPageBlock>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'hero', 'features', 'cta', 'gallery', 'testimonials', 'pricing',
      'faq', 'blog-grid', 'contact-form', 'map', 'stats', 'team',
      'timeline', 'video', 'text', 'spacer', 'divider', 'html',
      'products', 'newsletter'
    ],
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  props: {
    type: Schema.Types.Mixed,
    default: {},
  },
  styles: {
    type: BlockStyleSchema,
    default: {},
  },
  responsive: {
    type: BlockResponsiveSchema,
    default: {},
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  animation: {
    type: {
      type: String,
      enum: ['fade', 'slide', 'zoom', 'bounce', 'none'],
    },
    duration: Number,
    delay: Number,
  },
  displayConditions: {
    userRole: [String],
    dateRange: {
      start: Date,
      end: Date,
    },
    customLogic: String,
  },
}, { _id: false });

// Schéma principal
const PageSchema = new Schema<IPage>({
  title: {
    type: String,
    required: [true, 'Le titre de la page est requis'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  
  layout: {
    type: String,
    enum: ['default', 'full-width', 'sidebar-left', 'sidebar-right', 'landing', 'custom'],
    default: 'default',
  },
  customLayout: String,
  
  blocks: {
    type: [PageBlockSchema],
    default: [],
  },
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image'],
      default: 'summary_large_image',
    },
    canonicalUrl: String,
    noIndex: {
      type: Boolean,
      default: false,
    },
    noFollow: {
      type: Boolean,
      default: false,
    },
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft',
    index: true,
  },
  publishedAt: Date,
  scheduledAt: Date,
  
  isTemplate: {
    type: Boolean,
    default: false,
    index: true,
  },
  templateName: String,
  templateCategory: String,
  
  version: {
    type: Number,
    default: 1,
  },
  versionHistory: [{
    version: Number,
    blocks: [PageBlockSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: Date,
    comment: String,
  }],
  
  stats: {
    views: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    avgTimeOnPage: {
      type: Number,
      default: 0,
    },
    bounceRate: {
      type: Number,
      default: 0,
    },
    lastViewed: Date,
  },
  
  permissions: {
    visibility: {
      type: String,
      enum: ['public', 'private', 'protected'],
      default: 'public',
    },
    password: String,
    allowedRoles: [String],
  },
  
  settings: {
    enableComments: Boolean,
    requireAuth: Boolean,
    redirectUrl: String,
    customCode: {
      headHTML: String,
      bodyHTML: String,
    },
  },
  
  parentPage: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
  },
  childPages: [{
    type: Schema.Types.ObjectId,
    ref: 'Page',
  }],
  
  locale: {
    type: String,
    default: 'fr',
    index: true,
  },
  translations: [{
    locale: String,
    pageId: {
      type: Schema.Types.ObjectId,
      ref: 'Page',
    },
  }],
  
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
PageSchema.index({ slug: 1 }, { unique: true });
PageSchema.index({ path: 1 }, { unique: true });
PageSchema.index({ status: 1, publishedAt: -1 });
PageSchema.index({ isTemplate: 1, templateCategory: 1 });
PageSchema.index({ locale: 1, status: 1 });
PageSchema.index({ createdAt: -1 });

// Virtual pour URL complète
PageSchema.virtual('url').get(function() {
  // @ts-expect-error - Mongoose virtual property
  return this.path;
});

// Méthode pour générer le path complet
PageSchema.methods.generatePath = async function(): Promise<string> {
  const Page = this.constructor as Model<IPage>;
  
  if (this.parentPage) {
    const parent = await Page.findById(this.parentPage);
    if (parent) {
      return `${parent.path}/${this.slug}`;
    }
  }
  
  return `/${this.slug}`;
};

// Méthode pour créer une version
PageSchema.methods.createVersion = function(userId: string, comment?: string) {
  if (!this.versionHistory) {
    this.versionHistory = [];
  }
  
  this.versionHistory.push({
    version: this.version,
    blocks: JSON.parse(JSON.stringify(this.blocks)),
    createdBy: userId,
    createdAt: new Date(),
    comment,
  });
  
  this.version = (this.version || 1) + 1;
};

// Méthode pour restaurer une version
PageSchema.methods.restoreVersion = function(versionNumber: number): boolean {
  if (!this.versionHistory) return false;
  
  const version = this.versionHistory.find((v: any) => v.version === versionNumber);
  if (!version) return false;
  
  this.blocks = JSON.parse(JSON.stringify(version.blocks));
  return true;
};

// Méthode pour publier
PageSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
};

// Méthode pour dépublier
PageSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.publishedAt = undefined;
};

// Méthode pour dupliquer
PageSchema.methods.duplicate = async function(newSlug: string, newTitle?: string) {
  const Page = this.constructor as Model<IPage>;
  
  const duplicate = new Page({
    ...this.toObject(),
    _id: undefined,
    slug: newSlug,
    title: newTitle || `${this.title} (copie)`,
    path: `/${newSlug}`,
    status: 'draft',
    publishedAt: undefined,
    stats: {
      views: 0,
      uniqueVisitors: 0,
      avgTimeOnPage: 0,
      bounceRate: 0,
    },
    version: 1,
    versionHistory: [],
    createdAt: undefined,
    updatedAt: undefined,
  });
  
  return duplicate.save();
};

// Hook pre-save pour générer le path
PageSchema.pre('save', async function(next) {
  if (this.isModified('slug') || this.isModified('parentPage')) {
    // @ts-expect-error - Mongoose instance property
    this.path = await this.generatePath();
  }
  
  // Auto-publish si scheduledAt est passé
  // @ts-expect-error - Mongoose instance property
  if (this.scheduledAt && this.scheduledAt <= new Date() && this.status === 'scheduled') {
    // @ts-expect-error - Mongoose instance method
    this.publish();
  }
  
  // Assurer que SEO metaTitle existe
  // @ts-expect-error - Mongoose instance property
  if (!this.seo.metaTitle) {
    // @ts-expect-error - Mongoose instance property
    this.seo.metaTitle = this.title;
  }
  
  next();
});

// Query helper pour published
// @ts-expect-error - Mongoose query helper dynamique
PageSchema.query.published = function() {
  // @ts-expect-error - Mongoose query helper dynamique
  return this.where({
    status: 'published',
    $or: [
      { publishedAt: { $lte: new Date() } },
      { publishedAt: { $exists: false } },
    ],
  });
};

// Query helper pour templates
// @ts-expect-error - Mongoose query helper dynamique
PageSchema.query.templates = function() {
  // @ts-expect-error - Mongoose query helper dynamique
  return this.where({ isTemplate: true });
};

const Page: Model<IPage> = models.Page || mongoose.model<IPage>('Page', PageSchema);

export default Page;
