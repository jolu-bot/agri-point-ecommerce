import {
  Type,
  Layout,
  Image,
  Video,
  MessageSquare,
  DollarSign,
  HelpCircle,
  FileText,
  Mail,
  MapPin,
  BarChart3,
  Users,
  Clock,
  Minus,
  Code,
  ShoppingBag,
  Send,
  Zap,
  Grid3x3,
} from 'lucide-react';

export interface BlockConfig {
  type: string;
  label: string;
  icon: any;
  category: 'content' | 'media' | 'commerce' | 'interactive' | 'layout';
  description: string;
  defaultProps: Record<string, any>;
  fields: BlockField[];
}

export interface BlockField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext' | 'number' | 'select' | 'color' | 'image' | 'toggle' | 'repeater';
  defaultValue?: any;
  options?: Array<{ label: string; value: string }>;
  fields?: BlockField[];  // Pour les repeaters
}

export const blockConfigs: BlockConfig[] = [
  // CONTENT BLOCKS
  {
    type: 'hero',
    label: 'Hero Section',
    icon: Zap,
    category: 'content',
    description: 'Section hero avec image de fond et CTA',
    defaultProps: {
      title: 'Bienvenue sur AgriPoint',
      subtitle: 'La plateforme révolutionnaire pour l\'agriculture urbaine',
      ctaText: 'Commencer',
      ctaLink: '#',
      backgroundImage: '/images/hero-bg.jpg',
      height: 'tall',  // short, medium, tall, full
      overlay: true,
      overlayOpacity: 50,
      textAlign: 'center',  // left, center, right
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text', defaultValue: 'Titre Hero' },
      { name: 'subtitle', label: 'Sous-titre', type: 'textarea', defaultValue: '' },
      { name: 'ctaText', label: 'Texte du bouton', type: 'text', defaultValue: 'En savoir plus' },
      { name: 'ctaLink', label: 'Lien du bouton', type: 'text', defaultValue: '#' },
      { name: 'backgroundImage', label: 'Image de fond', type: 'image' },
      { name: 'height', label: 'Hauteur', type: 'select', options: [
        { label: 'Petite', value: 'short' },
        { label: 'Moyenne', value: 'medium' },
        { label: 'Grande', value: 'tall' },
        { label: 'Plein écran', value: 'full' },
      ]},
      { name: 'overlay', label: 'Overlay sombre', type: 'toggle', defaultValue: true },
      { name: 'overlayOpacity', label: 'Opacité overlay (%)', type: 'number', defaultValue: 50 },
      { name: 'textAlign', label: 'Alignement texte', type: 'select', options: [
        { label: 'Gauche', value: 'left' },
        { label: 'Centre', value: 'center' },
        { label: 'Droite', value: 'right' },
      ]},
    ],
  },
  {
    type: 'text',
    label: 'Texte Riche',
    icon: Type,
    category: 'content',
    description: 'Éditeur de texte riche avec formatage',
    defaultProps: {
      content: '<p>Votre contenu ici...</p>',
      fontSize: 'base',  // sm, base, lg, xl
      textAlign: 'left',
    },
    fields: [
      { name: 'content', label: 'Contenu', type: 'richtext', defaultValue: '<p>Votre texte ici...</p>' },
      { name: 'fontSize', label: 'Taille de police', type: 'select', options: [
        { label: 'Petit', value: 'sm' },
        { label: 'Normal', value: 'base' },
        { label: 'Grand', value: 'lg' },
        { label: 'Très grand', value: 'xl' },
      ]},
      { name: 'textAlign', label: 'Alignement', type: 'select', options: [
        { label: 'Gauche', value: 'left' },
        { label: 'Centre', value: 'center' },
        { label: 'Droite', value: 'right' },
        { label: 'Justifié', value: 'justify' },
      ]},
    ],
  },
  {
    type: 'features',
    label: 'Fonctionnalités',
    icon: Grid3x3,
    category: 'content',
    description: 'Grille de fonctionnalités avec icônes',
    defaultProps: {
      title: 'Nos Fonctionnalités',
      subtitle: 'Découvrez ce qui nous rend uniques',
      columns: 3,
      features: [
        {
          icon: '🌱',
          title: 'Produits Bio',
          description: '100% naturels et durables',
        },
        {
          icon: '🚀',
          title: 'Livraison Rapide',
          description: 'En moins de 24h',
        },
        {
          icon: '💰',
          title: 'Prix Imbattables',
          description: 'Garantie du meilleur prix',
        },
      ],
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text', defaultValue: 'Nos Fonctionnalités' },
      { name: 'subtitle', label: 'Sous-titre', type: 'text', defaultValue: '' },
      { name: 'columns', label: 'Nombre de colonnes', type: 'select', options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ]},
      { name: 'features', label: 'Fonctionnalités', type: 'repeater', fields: [
        { name: 'icon', label: 'Icône/Emoji', type: 'text' },
        { name: 'title', label: 'Titre', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]},
    ],
  },
  {
    type: 'cta',
    label: 'Call-to-Action',
    icon: Zap,
    category: 'content',
    description: 'Bannière CTA accrocheuse',
    defaultProps: {
      title: 'Prêt à commencer ?',
      description: 'Rejoignez des milliers d\'agriculteurs satisfaits',
      buttonText: 'Commencer maintenant',
      buttonLink: '#',
      backgroundStyle: 'gradient',  // solid, gradient, image
      backgroundColor: '#3b82f6',
      gradientFrom: '#3b82f6',
      gradientTo: '#8b5cf6',
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'buttonText', label: 'Texte du bouton', type: 'text' },
      { name: 'buttonLink', label: 'Lien', type: 'text' },
      { name: 'backgroundStyle', label: 'Style de fond', type: 'select', options: [
        { label: 'Couleur unie', value: 'solid' },
        { label: 'Dégradé', value: 'gradient' },
        { label: 'Image', value: 'image' },
      ]},
      { name: 'backgroundColor', label: 'Couleur de fond', type: 'color' },
      { name: 'gradientFrom', label: 'Dégradé de', type: 'color' },
      { name: 'gradientTo', label: 'Dégradé vers', type: 'color' },
    ],
  },
  {
    type: 'testimonials',
    label: 'Témoignages',
    icon: MessageSquare,
    category: 'content',
    description: 'Avis et témoignages clients',
    defaultProps: {
      title: 'Ce que disent nos clients',
      layout: 'grid',  // grid, carousel, masonry
      columns: 3,
      testimonials: [
        {
          name: 'Jean Dupont',
          role: 'Agriculteur urbain',
          avatar: '/images/avatar-1.jpg',
          rating: 5,
          text: 'Excellent service, produits de qualité !',
        },
      ],
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'layout', label: 'Layout', type: 'select', options: [
        { label: 'Grille', value: 'grid' },
        { label: 'Carrousel', value: 'carousel' },
        { label: 'Masonry', value: 'masonry' },
      ]},
      { name: 'columns', label: 'Colonnes', type: 'number', defaultValue: 3 },
      { name: 'testimonials', label: 'Témoignages', type: 'repeater', fields: [
        { name: 'name', label: 'Nom', type: 'text' },
        { name: 'role', label: 'Rôle', type: 'text' },
        { name: 'avatar', label: 'Avatar', type: 'image' },
        { name: 'rating', label: 'Note (1-5)', type: 'number' },
        { name: 'text', label: 'Témoignage', type: 'textarea' },
      ]},
    ],
  },

  // MEDIA BLOCKS
  {
    type: 'gallery',
    label: 'Galerie',
    icon: Image,
    category: 'media',
    description: 'Galerie d\'images responsive',
    defaultProps: {
      layout: 'grid',  // grid, masonry, carousel
      columns: 3,
      gap: 'md',  // sm, md, lg
      images: [],
    },
    fields: [
      { name: 'layout', label: 'Layout', type: 'select', options: [
        { label: 'Grille', value: 'grid' },
        { label: 'Masonry', value: 'masonry' },
        { label: 'Carrousel', value: 'carousel' },
      ]},
      { name: 'columns', label: 'Colonnes', type: 'number', defaultValue: 3 },
      { name: 'gap', label: 'Espacement', type: 'select', options: [
        { label: 'Petit', value: 'sm' },
        { label: 'Moyen', value: 'md' },
        { label: 'Grand', value: 'lg' },
      ]},
    ],
  },
  {
    type: 'video',
    label: 'Vidéo',
    icon: Video,
    category: 'media',
    description: 'Lecteur vidéo YouTube/Vimeo',
    defaultProps: {
      url: '',
      provider: 'youtube',  // youtube, vimeo, direct
      autoplay: false,
      controls: true,
      aspectRatio: '16/9',
    },
    fields: [
      { name: 'url', label: 'URL de la vidéo', type: 'text' },
      { name: 'provider', label: 'Plateforme', type: 'select', options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'Directe', value: 'direct' },
      ]},
      { name: 'autoplay', label: 'Lecture auto', type: 'toggle' },
      { name: 'controls', label: 'Afficher contrôles', type: 'toggle', defaultValue: true },
      { name: 'aspectRatio', label: 'Ratio', type: 'select', options: [
        { label: '16:9', value: '16/9' },
        { label: '4:3', value: '4/3' },
        { label: '1:1', value: '1/1' },
      ]},
    ],
  },

  // COMMERCE BLOCKS
  {
    type: 'products',
    label: 'Grille Produits',
    icon: ShoppingBag,
    category: 'commerce',
    description: 'Affichage de produits e-commerce',
    defaultProps: {
      title: 'Nos Produits',
      layout: 'grid',
      columns: 4,
      limit: 8,
      category: 'all',
      sortBy: 'featured',
      showFilters: true,
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'columns', label: 'Colonnes', type: 'number', defaultValue: 4 },
      { name: 'limit', label: 'Nombre max', type: 'number', defaultValue: 8 },
      { name: 'category', label: 'Catégorie', type: 'text', defaultValue: 'all' },
      { name: 'sortBy', label: 'Tri par', type: 'select', options: [
        { label: 'En vedette', value: 'featured' },
        { label: 'Nouveautés', value: 'newest' },
        { label: 'Prix croissant', value: 'price-asc' },
        { label: 'Prix décroissant', value: 'price-desc' },
      ]},
      { name: 'showFilters', label: 'Afficher filtres', type: 'toggle', defaultValue: true },
    ],
  },
  {
    type: 'pricing',
    label: 'Tableaux de Prix',
    icon: DollarSign,
    category: 'commerce',
    description: 'Plans et tarification',
    defaultProps: {
      title: 'Nos Tarifs',
      plans: [
        {
          name: 'Basic',
          price: '9990',
          currency: 'XAF',
          period: 'mois',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          highlighted: false,
        },
        {
          name: 'Pro',
          price: '19990',
          currency: 'XAF',
          period: 'mois',
          features: ['Toutes features Basic', 'Feature 4', 'Feature 5'],
          highlighted: true,
        },
      ],
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'plans', label: 'Plans', type: 'repeater', fields: [
        { name: 'name', label: 'Nom du plan', type: 'text' },
        { name: 'price', label: 'Prix', type: 'number' },
        { name: 'currency', label: 'Devise', type: 'text', defaultValue: 'XAF' },
        { name: 'period', label: 'Période', type: 'text', defaultValue: 'mois' },
        { name: 'highlighted', label: 'Plan en vedette', type: 'toggle' },
      ]},
    ],
  },

  // INTERACTIVE BLOCKS
  {
    type: 'contact-form',
    label: 'Formulaire Contact',
    icon: Mail,
    category: 'interactive',
    description: 'Formulaire de contact',
    defaultProps: {
      title: 'Contactez-nous',
      fields: ['name', 'email', 'phone', 'message'],
      submitText: 'Envoyer',
      successMessage: 'Message envoyé avec succès !',
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'submitText', label: 'Texte du bouton', type: 'text' },
      { name: 'successMessage', label: 'Message de succès', type: 'text' },
    ],
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    icon: Send,
    category: 'interactive',
    description: 'Inscription newsletter',
    defaultProps: {
      title: 'Restez informé',
      description: 'Recevez nos dernières actualités et offres',
      buttonText: 'S\'inscrire',
      placeholder: 'Votre email',
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'buttonText', label: 'Texte du bouton', type: 'text' },
      { name: 'placeholder', label: 'Placeholder', type: 'text' },
    ],
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    category: 'interactive',
    description: 'Questions fréquentes avec accordéon',
    defaultProps: {
      title: 'Questions Fréquentes',
      items: [
        {
          question: 'Comment ça marche ?',
          answer: 'C\'est très simple...',
        },
      ],
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'items', label: 'Questions', type: 'repeater', fields: [
        { name: 'question', label: 'Question', type: 'text' },
        { name: 'answer', label: 'Réponse', type: 'textarea' },
      ]},
    ],
  },
  {
    type: 'map',
    label: 'Carte',
    icon: MapPin,
    category: 'interactive',
    description: 'Carte géographique interactive',
    defaultProps: {
      latitude: 3.848,
      longitude: 11.502,
      zoom: 13,
      markerTitle: 'Notre emplacement',
      height: 400,
    },
    fields: [
      { name: 'latitude', label: 'Latitude', type: 'number' },
      { name: 'longitude', label: 'Longitude', type: 'number' },
      { name: 'zoom', label: 'Zoom', type: 'number', defaultValue: 13 },
      { name: 'markerTitle', label: 'Titre du marqueur', type: 'text' },
      { name: 'height', label: 'Hauteur (px)', type: 'number', defaultValue: 400 },
    ],
  },

  // LAYOUT BLOCKS
  {
    type: 'stats',
    label: 'Statistiques',
    icon: BarChart3,
    category: 'layout',
    description: 'Compteurs et chiffres clés',
    defaultProps: {
      stats: [
        { label: 'Clients satisfaits', value: '10000+', icon: '👥' },
        { label: 'Produits', value: '500+', icon: '🌱' },
        { label: 'Villes', value: '20+', icon: '🏙️' },
      ],
    },
    fields: [
      { name: 'stats', label: 'Statistiques', type: 'repeater', fields: [
        { name: 'label', label: 'Label', type: 'text' },
        { name: 'value', label: 'Valeur', type: 'text' },
        { name: 'icon', label: 'Icône/Emoji', type: 'text' },
      ]},
    ],
  },
  {
    type: 'team',
    label: 'Équipe',
    icon: Users,
    category: 'layout',
    description: 'Présentation de l\'équipe',
    defaultProps: {
      title: 'Notre Équipe',
      columns: 4,
      members: [],
    },
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'columns', label: 'Colonnes', type: 'number', defaultValue: 4 },
      { name: 'members', label: 'Membres', type: 'repeater', fields: [
        { name: 'name', label: 'Nom', type: 'text' },
        { name: 'role', label: 'Rôle', type: 'text' },
        { name: 'avatar', label: 'Photo', type: 'image' },
        { name: 'bio', label: 'Bio', type: 'textarea' },
      ]},
    ],
  },
  {
    type: 'spacer',
    label: 'Espace',
    icon: Layout,
    category: 'layout',
    description: 'Espace vide pour aérer',
    defaultProps: {
      height: 'md',  // sm, md, lg, xl
    },
    fields: [
      { name: 'height', label: 'Hauteur', type: 'select', options: [
        { label: 'Petit (2rem)', value: 'sm' },
        { label: 'Moyen (4rem)', value: 'md' },
        { label: 'Grand (6rem)', value: 'lg' },
        { label: 'Très grand (8rem)', value: 'xl' },
      ]},
    ],
  },
  {
    type: 'divider',
    label: 'Séparateur',
    icon: Minus,
    category: 'layout',
    description: 'Ligne de séparation',
    defaultProps: {
      style: 'solid',  // solid, dashed, dotted, gradient
      thickness: 'thin',  // thin, medium, thick
      color: '#e5e7eb',
      width: 'full',  // full, half, third
    },
    fields: [
      { name: 'style', label: 'Style', type: 'select', options: [
        { label: 'Solide', value: 'solid' },
        { label: 'Pointillés', value: 'dashed' },
        { label: 'Points', value: 'dotted' },
        { label: 'Dégradé', value: 'gradient' },
      ]},
      { name: 'thickness', label: 'Épaisseur', type: 'select', options: [
        { label: 'Fin', value: 'thin' },
        { label: 'Moyen', value: 'medium' },
        { label: 'Épais', value: 'thick' },
      ]},
      { name: 'color', label: 'Couleur', type: 'color' },
      { name: 'width', label: 'Largeur', type: 'select', options: [
        { label: 'Pleine', value: 'full' },
        { label: 'Demi', value: 'half' },
        { label: 'Tiers', value: 'third' },
      ]},
    ],
  },
  {
    type: 'html',
    label: 'HTML Personnalisé',
    icon: Code,
    category: 'layout',
    description: 'Code HTML/CSS/JS personnalisé',
    defaultProps: {
      html: '<div>Votre code HTML ici</div>',
      css: '',
      enableJS: false,
    },
    fields: [
      { name: 'html', label: 'Code HTML', type: 'textarea' },
      { name: 'css', label: 'CSS personnalisé', type: 'textarea' },
      { name: 'enableJS', label: 'Activer JavaScript', type: 'toggle' },
    ],
  },
];

// Fonction helper pour trouver un config par type
export function getBlockConfig(type: string): BlockConfig | undefined {
  return blockConfigs.find(config => config.type === type);
}

// Fonction pour générer les props par défaut
export function getDefaultBlockProps(type: string): Record<string, any> {
  const config = getBlockConfig(type);
  return config ? { ...config.defaultProps } : {};
}
