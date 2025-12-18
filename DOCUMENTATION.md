# 📚 Documentation Complète - AGRI POINT SERVICE E-Commerce

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  Next.js 14 + TypeScript + Tailwind CSS + Framer Motion │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP/HTTPS
                   │
┌──────────────────▼──────────────────────────────────────┐
│                   API Routes (Next.js)                   │
│  /api/auth, /api/products, /api/agribot, /api/orders   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Mongoose ODM
                   │
┌──────────────────▼──────────────────────────────────────┐
│                   MongoDB Database                       │
│     Users, Products, Orders, Settings, Messages         │
└─────────────────────────────────────────────────────────┘

                   ┌──────────────────┐
                   │   OpenAI GPT-4   │
                   │   (AgriBot IA)   │
                   └──────────────────┘
```

## 🎯 Fonctionnalités Détaillées

### 1. SYSTÈME D'AUTHENTIFICATION

#### Inscription (`POST /api/auth/register`)
```typescript
Request:
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "client",
    "permissions": ["products:read", "orders:read"]
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Connexion (`POST /api/auth/login`)
```typescript
Request:
{
  "email": "admin@agri-ps.com",
  "password": "admin123"
}

Response: (même format que register)
```

#### Tokens
- **Access Token** : Expire après 15 minutes
- **Refresh Token** : Expire après 7 jours
- Stockage : localStorage (client) + httpOnly cookies (recommandé en prod)

### 2. GESTION DES PRODUITS

#### Structure d'un Produit
```typescript
interface IProduct {
  _id: string;
  name: string;                    // "HUMIFORTE"
  slug: string;                    // "humiforte"
  description: string;
  category: 'biofertilisant' | 'engrais_mineral' | 'kit_urbain' | 'service' | 'autre';
  subCategory?: string;
  images: string[];                // URLs des images
  price: number;                   // Prix en FCFA
  promoPrice?: number;             // Prix promo si applicable
  stock: number;
  
  // États
  isActive: boolean;               // Publié ou non
  isFeatured: boolean;             // Affiché en page d'accueil
  isNew: boolean;                  // Badge "NOUVEAU"
  
  // Caractéristiques techniques
  features?: {
    npk?: string;                  // "20-10-10"
    composition?: string;
    applications?: string[];
    dosage?: string;
    cultures?: string[];           // ["Tomates", "Cacao"]
    benefits?: string[];
    precautions?: string[];
  };
  
  // Variants
  variants?: Array<{
    name: string;                  // "1L", "5L", "20L"
    price: number;
    promoPrice?: number;
    stock: number;
    sku: string;
  }>;
  
  // Logistique
  sku: string;                     // Code unique
  weight?: number;                 // en kg
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Analytics
  views: number;
  sales: number;
  rating: number;                  // 0-5
  reviewsCount: number;
}
```

#### API Produits

**Liste des produits** (`GET /api/products`)
```typescript
Query params:
- category: string (optionnel)
- search: string (optionnel)
- sort: 'price' | 'createdAt' | 'views' | 'sales'
- order: 'asc' | 'desc'
- page: number
- limit: number

Response:
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  }
}
```

**Détails produit** (`GET /api/products/[slug]`)
```typescript
Response:
{
  "product": {...},
  "relatedProducts": [...]  // Produits similaires
}
```

### 3. PANIER (Client-side avec Zustand)

```typescript
// Store Zustand
interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number;
  image: string;
  quantity: number;
  variant?: string;
  maxStock: number;
}

// Actions disponibles
const { 
  items,              // CartItem[]
  addItem,            // (item) => void
  removeItem,         // (id, variant?) => void
  updateQuantity,     // (id, quantity, variant?) => void
  clearCart,          // () => void
  getTotalPrice,      // () => number
  getTotalItems       // () => number
} = useCartStore();
```

### 4. AGRIBOT - CHATBOT IA

#### Configuration
Le chatbot utilise OpenAI GPT-4 avec un prompt système spécialisé en agriculture.

**Prompt Système** :
- Expert en agriculture camerounaise
- Connaît tous les produits AGRI POINT
- Conseille selon les cultures (cacao, café, tomates, etc.)
- Guide agriculture urbaine
- Recommandations de dosages

#### API (`POST /api/agribot`)
```typescript
Request:
{
  "message": "Quel produit pour mes tomates ?",
  "history": [
    {
      "role": "user",
      "content": "Bonjour",
      "timestamp": "2024-12-10T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Bonjour ! Comment puis-je vous aider ?",
      "timestamp": "2024-12-10T10:00:01Z"
    }
  ]
}

Response:
{
  "response": "Pour vos tomates, je recommande..."
}
```

#### Mode Démo
Sans clé OpenAI, AgriBot fonctionne avec des réponses prédéfinies basées sur :
- Mots-clés détectés (tomate, cacao, rendement, etc.)
- Réponses template personnalisées
- Redirection vers le support si besoin

### 5. SYSTÈME DE RÔLES

```typescript
const ROLE_PERMISSIONS = {
  admin: [
    'users:read', 'users:write', 'users:delete',
    'products:read', 'products:write', 'products:delete',
    'orders:read', 'orders:write', 'orders:delete',
    'settings:read', 'settings:write',
    'messages:read', 'messages:write',
    'analytics:read',
    'agribot:manage',
  ],
  
  manager: [
    'products:read', 'products:write',
    'orders:read', 'orders:write',
    'messages:read', 'messages:write',
    'analytics:read',
  ],
  
  redacteur: [
    'products:read',
    'settings:read', 'settings:write',
    'messages:read',
  ],
  
  assistant_ia: [
    'agribot:manage',
    'messages:read', 'messages:write',
    'products:read',
  ],
  
  client: [
    'products:read',
    'orders:read',
  ],
};
```

#### Middleware de protection
```typescript
// Utilisation dans une API route
import { withAuth } from '@/lib/middleware';

export const GET = withAuth(
  async (req) => {
    // req.user contient { userId, email, role }
    // ...
  },
  { permissions: ['products:read'] }
);
```

### 6. DARK MODE

Implémenté avec `next-themes` :
- Toggle automatique
- Sauvegarde dans localStorage
- Classes Tailwind : `dark:bg-gray-900`
- Icônes : 🌙 (dark) / ☀️ (light)

```typescript
// Utilisation
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

// Toggle
setTheme(theme === 'dark' ? 'light' : 'dark');
```

### 7. ÉTATS ET BADGES PRODUITS

- **NOUVEAU** : `isNew: true` → Badge vert
- **PROMO** : `promoPrice < price` → Badge rouge avec %
- **EN VEDETTE** : `isFeatured: true` → Affiché en homepage
- **STOCK FAIBLE** : `stock <= 5` → Badge orange "Dernières pièces"
- **RUPTURE** : `stock === 0` → Overlay gris + badge rouge

### 8. OPTIMISATIONS

#### Images
- Format WebP automatique (Next.js config)
- Lazy loading natif
- Sizes responsive

#### Performance
- ISR (Incremental Static Regeneration) pour les pages produits
- SSR pour les pages dynamiques
- Client-side rendering pour le panier

#### SEO
- Metadata dynamique par page
- Open Graph tags
- Sitemap automatique (à ajouter)

## 🔒 Sécurité

### Implémentées
- ✅ Hash bcrypt pour les mots de passe (10 rounds)
- ✅ JWT pour l'authentification
- ✅ Validation des inputs
- ✅ Mongoose schema validation
- ✅ CORS configuration

### À ajouter
- 🚧 Rate limiting (express-rate-limit)
- 🚧 CSRF protection
- 🚧 Input sanitization (express-validator)
- 🚧 Helmet.js pour headers HTTP
- 🚧 HTTPS en production

## 📊 Analytics (À implémenter)

```typescript
// Dashboard Admin
interface Analytics {
  sales: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;  // %
  };
  
  products: {
    topSelling: Product[];
    lowStock: Product[];
    outOfStock: Product[];
  };
  
  users: {
    total: number;
    newThisMonth: number;
    active: number;
  };
  
  agribot: {
    totalConversations: number;
    averageMessages: number;
    topQuestions: string[];
  };
}
```

## 🚀 Déploiement

### Prérequis Production
1. MongoDB Atlas (gratuit tier disponible)
2. Vercel / Netlify / Railway
3. Variables d'environnement configurées
4. Domaine personnalisé (optionnel)

### Checklist Déploiement
- [ ] `.env.local` → Variables d'environnement production
- [ ] MongoDB Atlas connection string
- [ ] OpenAI API key (production)
- [ ] Stripe production keys
- [ ] Email service configuré
- [ ] Seed database avec produits réels
- [ ] Images optimisées et uploadées
- [ ] Tests fonctionnels complets
- [ ] SEO metadata rempli
- [ ] Analytics (Google Analytics) intégré

---

**Développé avec ❤️ pour AGRI POINT SERVICE** 🌱
