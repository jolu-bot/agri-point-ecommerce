import {
  Type, Mail, Phone, Hash, AlignLeft, List, CheckSquare,
  Calendar, Clock, Upload, Link2, Eye, EyeOff, Star,
  Sliders, Palette, Code, Square, Minus, LucideIcon
} from 'lucide-react';
import { FieldType, IFormField } from '@/models/Form';

// Configuration d'un type de champ
export interface FieldConfig {
  type: FieldType;
  label: string;
  icon: LucideIcon;
  category: 'basic' | 'advanced' | 'special' | 'layout';
  description: string;
  defaultProps: Partial<IFormField>;
  configFields: FieldConfigOption[];
}

// Option de configuration pour un champ
export interface FieldConfigOption {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'toggle' | 'select' | 'repeater';
  defaultValue?: any;
  options?: Array<{ label: string; value: string }>;
  description?: string;
}

// Configurations de tous les types de champs
export const fieldConfigs: FieldConfig[] = [
  // ===== BASIC =====
  {
    type: 'text',
    label: 'Texte',
    icon: Type,
    category: 'basic',
    description: 'Champ de texte simple sur une ligne',
    defaultProps: {
      type: 'text',
      label: 'Champ texte',
      placeholder: 'Entrez votre texte...',
      width: 'full',
      required: false,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Champ texte' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: '' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: '' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'defaultValue', label: 'Valeur par défaut', type: 'text', defaultValue: '' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
      {
        name: 'width',
        label: 'Largeur',
        type: 'select',
        defaultValue: 'full',
        options: [
          { label: 'Pleine largeur', value: 'full' },
          { label: 'Moitié', value: 'half' },
          { label: 'Tiers', value: 'third' },
          { label: 'Quart', value: 'quarter' },
        ],
      },
    ],
  },
  
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    category: 'basic',
    description: 'Champ email avec validation',
    defaultProps: {
      type: 'email',
      label: 'Adresse email',
      placeholder: 'votre@email.com',
      width: 'full',
      required: true,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Adresse email' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'email' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'votre@email.com' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: true },
      {
        name: 'width',
        label: 'Largeur',
        type: 'select',
        defaultValue: 'full',
        options: [
          { label: 'Pleine largeur', value: 'full' },
          { label: 'Moitié', value: 'half' },
        ],
      },
    ],
  },
  
  {
    type: 'tel',
    label: 'Téléphone',
    icon: Phone,
    category: 'basic',
    description: 'Numéro de téléphone',
    defaultProps: {
      type: 'tel',
      label: 'Téléphone',
      placeholder: '+33 6 12 34 56 78',
      width: 'half',
      required: false,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Téléphone' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'phone' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: '+33 6 12 34 56 78' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
      { name: 'width', label: 'Largeur', type: 'select', defaultValue: 'half', options: [
        { label: 'Pleine largeur', value: 'full' },
        { label: 'Moitié', value: 'half' },
      ]},
    ],
  },
  
  {
    type: 'number',
    label: 'Nombre',
    icon: Hash,
    category: 'basic',
    description: 'Champ numérique',
    defaultProps: {
      type: 'number',
      label: 'Nombre',
      placeholder: '0',
      width: 'half',
      required: false,
      step: 1,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Nombre' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: '' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: '0' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'min', label: 'Minimum', type: 'number', defaultValue: undefined },
      { name: 'max', label: 'Maximum', type: 'number', defaultValue: undefined },
      { name: 'step', label: 'Pas', type: 'number', defaultValue: 1 },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
      { name: 'width', label: 'Largeur', type: 'select', defaultValue: 'half', options: [
        { label: 'Pleine largeur', value: 'full' },
        { label: 'Moitié', value: 'half' },
        { label: 'Tiers', value: 'third' },
      ]},
    ],
  },
  
  {
    type: 'textarea',
    label: 'Texte long',
    icon: AlignLeft,
    category: 'basic',
    description: 'Zone de texte multi-lignes',
    defaultProps: {
      type: 'textarea',
      label: 'Message',
      placeholder: 'Entrez votre message...',
      width: 'full',
      required: false,
      rows: 4,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Message' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'message' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Entrez votre message...' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'rows', label: 'Nombre de lignes', type: 'number', defaultValue: 4 },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  // ===== ADVANCED =====
  {
    type: 'select',
    label: 'Liste déroulante',
    icon: List,
    category: 'advanced',
    description: 'Menu déroulant avec options',
    defaultProps: {
      type: 'select',
      label: 'Sélection',
      placeholder: 'Choisissez une option',
      width: 'full',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ],
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Sélection' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: '' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Choisissez...' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'options', label: 'Options', type: 'repeater', defaultValue: [] },
      { name: 'multiple', label: 'Sélection multiple', type: 'toggle', defaultValue: false },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
      { name: 'width', label: 'Largeur', type: 'select', defaultValue: 'full', options: [
        { label: 'Pleine largeur', value: 'full' },
        { label: 'Moitié', value: 'half' },
      ]},
    ],
  },
  
  {
    type: 'radio',
    label: 'Boutons radio',
    icon: CheckSquare,
    category: 'advanced',
    description: 'Choix unique avec boutons radio',
    defaultProps: {
      type: 'radio',
      label: 'Choisissez une option',
      width: 'full',
      required: false,
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
        { label: 'Option C', value: 'c' },
      ],
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Choisissez une option' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: '' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'options', label: 'Options', type: 'repeater', defaultValue: [] },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  {
    type: 'checkbox',
    label: 'Cases à cocher',
    icon: CheckSquare,
    category: 'advanced',
    description: 'Choix multiples avec checkboxes',
    defaultProps: {
      type: 'checkbox',
      label: 'Sélectionnez vos choix',
      width: 'full',
      required: false,
      options: [
        { label: 'Choix 1', value: 'choice1' },
        { label: 'Choix 2', value: 'choice2' },
        { label: 'Choix 3', value: 'choice3' },
      ],
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Sélectionnez' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: '' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'options', label: 'Options', type: 'repeater', defaultValue: [] },
      { name: 'required', label: 'Au moins un requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  {
    type: 'single-checkbox',
    label: 'Case unique',
    icon: Square,
    category: 'advanced',
    description: 'Case à cocher unique (CGU, newsletter...)',
    defaultProps: {
      type: 'single-checkbox',
      label: "J'accepte les conditions générales",
      width: 'full',
      required: true,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: "J'accepte les CGU" },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'accept_terms' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: true },
    ],
  },
  
  {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    category: 'advanced',
    description: 'Sélecteur de date',
    defaultProps: {
      type: 'date',
      label: 'Date',
      width: 'half',
      required: false,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Date' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'date' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'min', label: 'Date minimum', type: 'text', defaultValue: '' },
      { name: 'max', label: 'Date maximum', type: 'text', defaultValue: '' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
      { name: 'width', label: 'Largeur', type: 'select', defaultValue: 'half', options: [
        { label: 'Pleine largeur', value: 'full' },
        { label: 'Moitié', value: 'half' },
      ]},
    ],
  },
  
  {
    type: 'time',
    label: 'Heure',
    icon: Clock,
    category: 'advanced',
    description: 'Sélecteur d\'heure',
    defaultProps: {
      type: 'time',
      label: 'Heure',
      width: 'half',
      required: false,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Heure' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'time' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
      { name: 'width', label: 'Largeur', type: 'select', defaultValue: 'half', options: [
        { label: 'Pleine largeur', value: 'full' },
        { label: 'Moitié', value: 'half' },
      ]},
    ],
  },
  
  {
    type: 'datetime',
    label: 'Date et heure',
    icon: Calendar,
    category: 'advanced',
    description: 'Date et heure combinées',
    defaultProps: {
      type: 'datetime',
      label: 'Date et heure',
      width: 'full',
      required: false,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Date et heure' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'datetime' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  {
    type: 'file',
    label: 'Upload fichier',
    icon: Upload,
    category: 'advanced',
    description: 'Upload de fichiers',
    defaultProps: {
      type: 'file',
      label: 'Fichier',
      width: 'full',
      required: false,
      multiple: false,
      accept: ['image/*', 'application/pdf'],
      maxFileSize: 5242880, // 5MB
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Fichier' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'file' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'multiple', label: 'Fichiers multiples', type: 'toggle', defaultValue: false },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  {
    type: 'url',
    label: 'URL',
    icon: Link2,
    category: 'advanced',
    description: 'Lien URL avec validation',
    defaultProps: {
      type: 'url',
      label: 'Site web',
      placeholder: 'https://exemple.com',
      width: 'full',
      required: false,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Site web' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'website' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'https://...' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  // ===== SPECIAL =====
  {
    type: 'rating',
    label: 'Notation',
    icon: Star,
    category: 'special',
    description: 'Étoiles de notation',
    defaultProps: {
      type: 'rating',
      label: 'Notez votre expérience',
      width: 'half',
      required: false,
      max: 5,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Notation' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'rating' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'max', label: 'Nombre d\'étoiles', type: 'number', defaultValue: 5 },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  {
    type: 'slider',
    label: 'Curseur',
    icon: Sliders,
    category: 'special',
    description: 'Curseur de valeur numérique',
    defaultProps: {
      type: 'slider',
      label: 'Valeur',
      width: 'full',
      required: false,
      min: 0,
      max: 100,
      step: 1,
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Valeur' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'value' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'min', label: 'Minimum', type: 'number', defaultValue: 0 },
      { name: 'max', label: 'Maximum', type: 'number', defaultValue: 100 },
      { name: 'step', label: 'Pas', type: 'number', defaultValue: 1 },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  {
    type: 'color',
    label: 'Couleur',
    icon: Palette,
    category: 'special',
    description: 'Sélecteur de couleur',
    defaultProps: {
      type: 'color',
      label: 'Couleur',
      width: 'quarter',
      required: false,
      defaultValue: '#000000',
    },
    configFields: [
      { name: 'label', label: 'Label', type: 'text', defaultValue: 'Couleur' },
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'color' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { name: 'defaultValue', label: 'Couleur par défaut', type: 'text', defaultValue: '#000000' },
      { name: 'required', label: 'Champ requis', type: 'toggle', defaultValue: false },
    ],
  },
  
  {
    type: 'hidden',
    label: 'Champ caché',
    icon: EyeOff,
    category: 'special',
    description: 'Champ invisible pour données techniques',
    defaultProps: {
      type: 'hidden',
      label: 'Champ caché',
      width: 'full',
      required: false,
    },
    configFields: [
      { name: 'name', label: 'Nom technique', type: 'text', defaultValue: 'hidden_field' },
      { name: 'defaultValue', label: 'Valeur', type: 'text', defaultValue: '' },
    ],
  },
  
  // ===== LAYOUT =====
  {
    type: 'section',
    label: 'Séparateur de section',
    icon: Minus,
    category: 'layout',
    description: 'Titre de section pour organiser',
    defaultProps: {
      type: 'section',
      label: 'Nouvelle section',
      width: 'full',
    },
    configFields: [
      { name: 'label', label: 'Titre de la section', type: 'text', defaultValue: 'Section' },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
    ],
  },
  
  {
    type: 'html',
    label: 'HTML personnalisé',
    icon: Code,
    category: 'layout',
    description: 'HTML libre pour contenu personnalisé',
    defaultProps: {
      type: 'html',
      label: 'Contenu HTML',
      width: 'full',
      defaultValue: '<p>Contenu HTML personnalisé</p>',
    },
    configFields: [
      { name: 'defaultValue', label: 'Code HTML', type: 'textarea', defaultValue: '<p>HTML ici</p>' },
    ],
  },
];

// Helper pour récupérer une config par type
export function getFieldConfig(type: FieldType): FieldConfig | undefined {
  return fieldConfigs.find(config => config.type === type);
}

// Helper pour récupérer les props par défaut
export function getDefaultFieldProps(type: FieldType): Partial<IFormField> {
  const config = getFieldConfig(type);
  return config?.defaultProps || {};
}

// Helper pour récupérer tous les types par catégorie
export function getFieldsByCategory(category: string): FieldConfig[] {
  return fieldConfigs.filter(config => config.category === category);
}

// Catégories disponibles
export const fieldCategories = [
  { value: 'all', label: 'Tous les champs' },
  { value: 'basic', label: 'Basiques' },
  { value: 'advanced', label: 'Avancés' },
  { value: 'special', label: 'Spéciaux' },
  { value: 'layout', label: 'Mise en page' },
];
