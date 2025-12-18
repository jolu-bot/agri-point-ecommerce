# 🎨 Système de Configuration CMS

## 📋 Vue d'ensemble

Ce système permet de **modifier l'intégralité du site sans coder** via une interface d'administration visuelle et intuitive. Votre client peut personnaliser couleurs, polices, contenus, navigation, contact et SEO en toute autonomie.

## ✨ Fonctionnalités

### 🎨 **Gestion Visuelle du Thème**
- **7 couleurs personnalisables** : Primaire, primaire claire, secondaire, secondaire claire, accent, arrière-plan, texte
- **Sélecteur de couleurs intégré** avec aperçu en temps réel
- **Palette de couleurs dynamique** appliquée immédiatement à tout le site

### 🔤 **Contrôle Typographique Complet**
- **Polices personnalisables** pour titres (Montserrat par défaut) et corps (Inter par défaut)
- **10 tailles de police** configurables (xs → 6xl)
- **6 poids de police** ajustables (300 → 800)
- Application automatique via CSS Variables

### 📝 **Gestion de Contenu Dynamique**

#### Section Hero
- Badge d'en-tête
- Titre principal
- Sous-titre
- Description
- 2 boutons CTA (texte + lien personnalisables)

#### Statistiques
- Valeur + Label pour chaque stat
- Ordre personnalisable
- Ajout/suppression dynamique

#### Fonctionnalités
- Titre + Description + Icône
- Mise en avant des solutions
- Réorganisation facile

### 🧭 **Constructeur de Navigation**
- Menu principal configurable
- Support des sous-menus (ex: Nos Solutions)
- Ordre des éléments ajustable
- Liens personnalisables

### 📞 **Informations de Contact**
- Email, téléphone, WhatsApp
- Adresse complète
- **5 réseaux sociaux** : Facebook, Instagram, Twitter, LinkedIn, YouTube

### 🔍 **Optimisation SEO**
- Meta titre (limite 60 caractères)
- Meta description (limite 160 caractères)
- Mots-clés (séparés par virgules)
- Image Open Graph pour partages sociaux

### ⚙️ **Paramètres Avancés**
- **Mode Maintenance** : Désactiver temporairement le site
- **Inscriptions** : Autoriser/bloquer les nouveaux comptes
- **AgriBot** : Activer/désactiver le chatbot
- **Newsletter** : Gérer l'inscription newsletter
- **Analytics** : Intégration Google Analytics et Facebook Pixel

## 🗂️ Architecture

```
📁 Nouveaux Fichiers Créés
├── models/SiteConfig.ts                    # Modèle MongoDB de configuration
├── app/api/admin/site-config/route.ts      # API CRUD (GET, PUT, POST)
├── contexts/SiteConfigContext.tsx          # Provider React + Hook
├── app/admin/site-config/page.tsx          # Interface d'administration
└── scripts/seed-site-config.js             # Initialisation configuration
```

### 🔄 Flux de Données

```
1. L'admin modifie dans l'interface (/admin/site-config)
2. Sauvegarde via PUT /api/admin/site-config
3. MongoDB stocke la nouvelle configuration
4. SiteConfigContext récupère et distribue partout
5. Fonction applyTheme() injecte CSS variables dynamiquement
6. Tout le site s'actualise sans recharger
```

## 🚀 Utilisation

### 1️⃣ Initialiser la Configuration

```bash
# Créer la configuration par défaut en base de données
node scripts/seed-site-config.js
```

### 2️⃣ Accéder au Panel Admin

```
http://localhost:3000/admin/site-config
```

### 3️⃣ Naviguer dans les Onglets

- **Identité** : Logo, nom, slogan
- **Couleurs** : Palette complète avec sélecteurs
- **Typographie** : Polices, tailles, poids
- **Contenu** : Hero, stats, features
- **Navigation** : Menu et sous-menus
- **Contact** : Email, téléphone, adresse
- **Réseaux Sociaux** : 5 plateformes
- **SEO** : Meta tags, keywords, OG image
- **Avancé** : Toggles et analytics

### 4️⃣ Sauvegarder les Modifications

1. Cliquer sur **Enregistrer** (bouton en haut à droite)
2. Les changements s'appliquent **immédiatement** sur tout le site
3. Toast de confirmation apparaît

### 5️⃣ Exporter/Importer

- **Exporter** : Télécharger la config en JSON (backup)
- **Importer** : Restaurer une configuration sauvegardée
- **Actualiser** : Recharger depuis la base de données

## 🎯 Cas d'Usage

### Changer les Couleurs de la Marque

```
1. Onglet "Couleurs"
2. Cliquer sur le sélecteur de "Couleur Primaire"
3. Choisir la nouvelle couleur (#1B5E20 → #2E7D32)
4. Voir l'aperçu en temps réel
5. Enregistrer
→ Tout le site (boutons, liens, badges) change instantanément
```

### Modifier le Hero de la Page d'Accueil

```
1. Onglet "Contenu"
2. Ouvrir section "Hero"
3. Modifier :
   - Badge : "🌱 Leader des biofertilisants"
   - Titre : "Votre nouveau slogan"
   - Description : "Nouveau texte de présentation"
   - CTA Primaire : "Voir nos produits" → /produits
4. Enregistrer
→ La page d'accueil affiche le nouveau contenu
```

### Ajouter un Réseau Social

```
1. Onglet "Réseaux Sociaux"
2. Remplir le champ "YouTube"
3. Entrer : https://youtube.com/@votrecompte
4. Enregistrer
→ L'icône YouTube apparaît automatiquement dans le footer
```

### Activer le Mode Maintenance

```
1. Onglet "Avancé"
2. Activer le toggle "Mode Maintenance"
3. Enregistrer
→ Le site affiche une page de maintenance aux visiteurs
```

## 🔧 Intégration avec les Composants

### Utiliser la Configuration dans un Composant

```tsx
'use client';

import { useSiteConfig } from '@/contexts/SiteConfigContext';

export default function MonComposant() {
  const { config, loading } = useSiteConfig();

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>{config?.branding?.siteName}</h1>
      <p>{config?.branding?.tagline}</p>
      <p style={{ color: config?.colors?.primary }}>
        Texte avec couleur primaire
      </p>
    </div>
  );
}
```

### Appliquer les Couleurs Dynamiquement

Les couleurs sont automatiquement injectées comme **CSS Variables** :

```css
/* Automatiquement disponibles partout */
var(--color-primary)         /* #1B5E20 */
var(--color-secondary)       /* #B71C1C */
var(--color-accent)          /* #57534e */
var(--text-base)             /* 1rem */
var(--font-heading)          /* Montserrat */
```

## 📊 Structure de la Configuration

```typescript
{
  branding: {
    siteName: string
    tagline: string
    logoUrl: string
    faviconUrl: string
  },
  colors: {
    primary: string        // #1B5E20
    primaryLight: string
    secondary: string
    secondaryLight: string
    accent: string
    background: string
    text: string
  },
  typography: {
    fontFamily: { heading, body }
    fontSize: { xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl }
    fontWeight: { light, normal, medium, semibold, bold, extrabold }
  },
  contact: { email, phone, whatsapp, address },
  socialMedia: { facebook, instagram, twitter, linkedin, youtube },
  navigation: { menuItems[] },
  homePage: {
    hero: { badge, title, subtitle, description, image, cta }
    stats: [{ value, label, order }]
    features: [{ title, description, icon, order }]
  },
  seo: { metaTitle, metaDescription, keywords[], ogImage },
  footer: { about, copyrightText, poweredBy },
  advanced: {
    maintenanceMode: boolean
    allowRegistration: boolean
    enableAgriBot: boolean
    enableNewsletter: boolean
    googleAnalyticsId: string
    facebookPixelId: string
  },
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🔐 Sécurité

- ✅ Une seule configuration active à la fois
- ✅ Versioning automatique (createdAt, updatedAt)
- ✅ Validation des données via Mongoose schema
- ✅ API accessible uniquement aux admins (à sécuriser avec middleware)

## 🎨 Personnalisation Avancée

### Ajouter de Nouveaux Champs

1. **Modifier le modèle** (`models/SiteConfig.ts`)
2. **Mettre à jour l'API** (valeurs par défaut)
3. **Ajouter dans l'interface** (`app/admin/site-config/page.tsx`)
4. **Injecter si nécessaire** (`applyTheme()` dans le Context)

### Créer un Nouvel Onglet

```tsx
// Dans page.tsx, ajouter à l'array tabs :
{ id: 'nouvel-onglet', label: 'Mon Onglet', icon: Settings }

// Puis ajouter le rendu :
{activeTab === 'nouvel-onglet' && (
  <div>
    {/* Vos champs personnalisés */}
  </div>
)}
```

## 📈 Évolutions Futures Possibles

- 🖼️ **Upload d'images** direct (logo, favicon, OG image)
- ✏️ **Éditeur WYSIWYG** pour contenus riches
- 🎨 **Prévisualisation en temps réel** (iframe)
- 📋 **Gestion multi-langues**
- 🔄 **Historique des versions** avec rollback
- 🎭 **Thèmes pré-configurés** (templates)
- 🧩 **Drag & drop** pour réorganiser sections
- 📱 **Aperçu responsive** (mobile/tablette/desktop)

## 🎉 Résultat

Votre client peut maintenant :

✅ **Changer toutes les couleurs** du site en quelques clics  
✅ **Modifier tous les textes** sans toucher au code  
✅ **Gérer la navigation** et les menus déroulants  
✅ **Mettre à jour les contacts** et réseaux sociaux  
✅ **Optimiser le SEO** avec meta tags  
✅ **Activer/désactiver** des fonctionnalités (chatbot, newsletter)  
✅ **Exporter/importer** des configurations  

**Vous n'aurez plus besoin de coder pour des modifications de contenu ou de design !** 🚀
