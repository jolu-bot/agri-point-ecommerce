# Page Builder Documentation

## Installation

Le Page Builder utilise **@dnd-kit** pour le drag-and-drop. Installez les dépendances nécessaires :

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Fonctionnalités

### ✨ Page Builder Complet
- **Drag & Drop visuel** - Glissez-déposez des blocs depuis la bibliothèque
- **20 types de blocs** prédéfinis
- **Éditeur de propriétés** en temps réel
- **Vue responsive** - Prévisualisez mobile/tablet/desktop
- **Historique Undo/Redo** - Annulez ou rétablissez vos modifications
- **Duplication de blocs** - Clonez rapidement un bloc existant
- **Visibilité conditionnelle** - Masquez des blocs par appareil
- **Styles personnalisables** - Padding, margin, background, border, etc.

### 📦 Types de Blocs Disponibles

#### Contenu
- **Hero** - Section hero avec image de fond et CTA
- **Text** - Éditeur de texte riche avec formatage
- **Features** - Grille de fonctionnalités avec icônes
- **CTA** - Bannière call-to-action
- **Testimonials** - Témoignages clients

#### Média
- **Gallery** - Galerie d'images (grid/masonry/carousel)
- **Video** - Lecteur vidéo YouTube/Vimeo

#### E-commerce
- **Products** - Grille de produits avec filtres
- **Pricing** - Tableaux de tarification

#### Interactif
- **Contact Form** - Formulaire de contact
- **Newsletter** - Inscription newsletter
- **FAQ** - Questions fréquentes avec accordéon
- **Map** - Carte géographique interactive

#### Layout
- **Stats** - Compteurs et statistiques
- **Team** - Présentation d'équipe
- **Spacer** - Espace vide pour aérer
- **Divider** - Ligne de séparation
- **HTML** - Code HTML personnalisé

## Structure des Fichiers

```
models/
  └── Page.ts                    # Modèle Mongoose avec 20 types de blocs

app/
  └── api/admin/pages/
      ├── route.ts               # CRUD pages
      └── duplicate/route.ts     # Duplication de pages

  └── admin/pages/
      ├── page.tsx               # Liste des pages
      ├── create/page.tsx        # Création (alias vers edit)
      └── [id]/edit/page.tsx     # Page Builder principal

components/page-builder/
  ├── BlockLibrary.tsx           # Bibliothèque de blocs draggable
  ├── Canvas.tsx                 # Zone de dépôt avec preview
  └── BlockEditor.tsx            # Panneau de configuration

lib/page-builder/
  └── blockConfigs.ts            # Configuration des 20 types de blocs
```

## Utilisation

### Créer une Page

1. Naviguez vers `/admin/pages`
2. Cliquez sur "Nouvelle Page"
3. Glissez des blocs depuis la bibliothèque vers le canvas
4. Cliquez sur un bloc pour le configurer
5. Sauvegardez votre page

### Configurer un Bloc

Chaque bloc a 3 onglets de configuration :

1. **Contenu** - Propriétés spécifiques au type de bloc
2. **Style** - Padding, margin, background, container width
3. **Avancé** - Responsive, visibilité, animations

### Mode Responsive

Utilisez les boutons Desktop/Tablet/Mobile dans la barre d'outils pour prévisualiser votre page sur différents appareils.

### Historique

- **Undo** (Ctrl+Z) - Annuler la dernière modification
- **Redo** (Ctrl+Y) - Rétablir une modification annulée

## API

### GET /api/admin/pages
Liste toutes les pages avec filtres et stats.

**Query params:**
- `status` - draft/published/scheduled/archived
- `layout` - default/full-width/sidebar-left/sidebar-right/landing
- `search` - Recherche dans titre/description/slug
- `includeTemplates` - Inclure les templates (default: false)
- `page` - Numéro de page (default: 1)
- `limit` - Résultats par page (default: 20)
- `sortBy` - Champ de tri (default: createdAt)
- `sortOrder` - asc/desc (default: desc)

**Response:**
```json
{
  "pages": [...],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 },
  "stats": {
    "total": 42,
    "published": 15,
    "drafts": 20,
    "scheduled": 5,
    "templates": 2,
    "totalViews": 12500
  }
}
```

### POST /api/admin/pages
Créer une nouvelle page.

**Body:**
```json
{
  "title": "Nouvelle Page",
  "slug": "nouvelle-page",
  "layout": "default",
  "blocks": [
    {
      "id": "block_1234",
      "type": "hero",
      "order": 0,
      "props": { "title": "Hello", "ctaText": "Start" },
      "styles": { "paddingTop": "lg" },
      "responsive": {},
      "isVisible": true
    }
  ],
  "status": "draft"
}
```

### PATCH /api/admin/pages?id={pageId}
Mettre à jour une page existante.

**Query params:**
- `createVersion` - Créer une version dans l'historique (default: false)

**Body:** Mêmes champs que POST (partiels autorisés)

### DELETE /api/admin/pages?id={pageId}
Supprimer une page.

**Restrictions:**
- Ne peut pas supprimer une page avec des enfants
- Admin uniquement

### POST /api/admin/pages/duplicate?id={pageId}
Dupliquer une page existante.

**Body:**
```json
{
  "newSlug": "copie-de-page",
  "newTitle": "Copie de Page"
}
```

## Modèle Page

```typescript
{
  _id: string,
  title: string,
  slug: string,  // Unique, utilisé dans l'URL
  path: string,  // Chemin complet généré
  description?: string,
  
  layout: 'default' | 'full-width' | 'sidebar-left' | 'sidebar-right' | 'landing' | 'custom',
  
  blocks: [
    {
      id: string,
      type: BlockType,  // 20 types disponibles
      order: number,
      props: Record<string, any>,  // Dynamique selon le type
      styles: {
        paddingTop/Bottom/Left/Right?: string,
        marginTop/Bottom?: string,
        backgroundColor?: string,
        backgroundImage?: string,
        backgroundGradient?: {...},
        border?: {...},
        shadow?: string,
        containerWidth?: 'full' | 'container' | 'lg' | 'md' | 'sm'
      },
      responsive: {
        hideOnMobile?: boolean,
        hideOnTablet?: boolean,
        hideOnDesktop?: boolean,
        mobileOrder?: number
      },
      isVisible: boolean,
      animation?: {...}
    }
  ],
  
  seo: {
    metaTitle?: string,
    metaDescription?: string,
    metaKeywords?: string[],
    ogImage?: string,
    noIndex?: boolean
  },
  
  status: 'draft' | 'published' | 'scheduled' | 'archived',
  publishedAt?: Date,
  scheduledAt?: Date,
  
  isTemplate: boolean,
  templateName?: string,
  
  version: number,
  versionHistory?: [...],
  
  stats: {
    views: number,
    uniqueVisitors: number,
    avgTimeOnPage: number,
    bounceRate: number
  },
  
  permissions: {
    visibility: 'public' | 'private' | 'protected',
    password?: string,
    allowedRoles?: string[]
  }
}
```

## Versioning

Le système supporte la création de versions pour restaurer des états antérieurs :

```typescript
// Créer une version lors d'une mise à jour
PATCH /api/admin/pages?id={pageId}&createVersion=true

// L'historique est stocké dans page.versionHistory[]
```

## Bonnes Pratiques

### Performance
- ✅ Limitez le nombre de blocs par page à 20-30
- ✅ Optimisez les images avant upload
- ✅ Utilisez le lazy loading pour les galeries

### SEO
- ✅ Remplissez toujours metaTitle et metaDescription
- ✅ Utilisez des slugs descriptifs
- ✅ Ajoutez des balises alt aux images

### UX
- ✅ Testez sur mobile/tablet avant publication
- ✅ Utilisez les spacers pour aérer le contenu
- ✅ Gardez une hiérarchie visuelle claire

### Organisation
- ✅ Créez des templates pour les structures récurrentes
- ✅ Utilisez des noms de blocs descriptifs
- ✅ Organisez les pages avec parentPage/childPages

## Prochaines Étapes

### À implémenter
- [ ] Templates de pages prédéfinis
- [ ] Import/Export de pages JSON
- [ ] Preview en temps réel sans sauvegarde
- [ ] Composants réutilisables (Sections)
- [ ] A/B Testing entre versions
- [ ] Analytics par bloc
- [ ] Collaboration temps réel
- [ ] Intégration AI pour suggestions de contenu

### Extensions possibles
- Créer des blocs personnalisés via l'admin
- Builder de formulaires avancés
- Intégration Strapi/Contentful
- Builder de landing pages optimisées conversion

## Dépannage

### Le drag-and-drop ne fonctionne pas
- Vérifiez que @dnd-kit est installé
- Assurez-vous que tous les blocs ont un `id` unique

### Les blocs ne s'affichent pas
- Vérifiez que `isVisible` est à `true`
- Vérifiez les settings responsive selon l'appareil

### La sauvegarde échoue
- Vérifiez que le slug est unique
- Vérifiez que le token JWT est valide
- Assurez-vous d'avoir le rôle admin ou editor

## Ressources

- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Créé avec ❤️ par AgriPoint Team**
