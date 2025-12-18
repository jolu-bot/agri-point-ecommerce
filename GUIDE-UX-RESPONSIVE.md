# 📱 Guide UX Responsive - AGRI POINT

## 🎯 Objectif
Ce guide présente le système responsive complet implémenté pour assurer une expérience utilisateur optimale sur **tous les appareils** : mobiles, tablettes, ordinateurs, et grands écrans (jusqu'à 4K).

---

## 📐 Système de Breakpoints

Le site utilise un système de breakpoints étendu pour couvrir tous les formats d'écrans :

```typescript
'xs': '475px',      // Petits mobiles (iPhone SE, etc.)
'sm': '640px',      // Mobiles large (iPhone 12, etc.)
'md': '768px',      // Tablettes portrait (iPad, etc.)
'lg': '1024px',     // Tablettes paysage / petits desktop
'xl': '1280px',     // Desktop standard
'2xl': '1536px',    // Grand desktop
'3xl': '1920px',    // Full HD (1080p)
'4xl': '2560px',    // 2K/4K
```

### Utilisation dans les classes Tailwind
```tsx
// Exemple : padding qui s'adapte
<div className="px-4 sm:px-6 lg:px-8 xl:px-12 3xl:px-16">
  {/* Contenu */}
</div>

// Exemple : grille responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Items */}
</div>
```

---

## ✍️ Typographie Fluide

### Principe
Les tailles de police utilisent `clamp()` pour s'adapter **automatiquement** entre une taille minimale et maximale selon la largeur de l'écran.

### Tailles disponibles

| Classe          | Taille fluide                                    | Usage recommandé           |
|-----------------|--------------------------------------------------|----------------------------|
| `text-fluid-xs` | `clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)`     | Petits textes, labels      |
| `text-fluid-sm` | `clamp(0.875rem, 0.8rem + 0.35vw, 1rem)`        | Texte secondaire           |
| `text-fluid-base` | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`      | Texte corps de page        |
| `text-fluid-lg` | `clamp(1.125rem, 1rem + 0.5vw, 1.25rem)`        | Sous-titres, leads         |
| `text-fluid-xl` | `clamp(1.25rem, 1.1rem + 0.65vw, 1.5rem)`       | Titres de cartes           |
| `text-fluid-2xl` | `clamp(1.5rem, 1.3rem + 1vw, 2rem)`            | H3                         |
| `text-fluid-3xl` | `clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)`     | H2                         |
| `text-fluid-4xl` | `clamp(2.25rem, 1.8rem + 2vw, 3rem)`           | H1                         |
| `text-fluid-5xl` | `clamp(3rem, 2.2rem + 3vw, 4rem)`              | Héros principaux           |
| `text-fluid-6xl` | `clamp(3.75rem, 2.5rem + 5vw, 5rem)`           | Titres héros XXL           |

### Exemples d'utilisation

```tsx
// Titre principal qui s'adapte automatiquement
<h1 className="text-fluid-5xl font-bold">
  Bienvenue sur AGRI POINT
</h1>

// Paragraphe lisible sur tous les écrans
<p className="text-fluid-base leading-relaxed">
  Votre texte ici...
</p>

// Petit texte (labels, etc.)
<span className="text-fluid-xs text-gray-600">
  Optionnel
</span>
```

### Variables CSS
Vous pouvez aussi utiliser directement les variables CSS :

```css
.custom-title {
  font-size: var(--text-4xl);
}

.custom-paragraph {
  font-size: var(--text-base);
}
```

---

## 📏 Espacements Fluides

### Classes disponibles

#### Padding fluide
```tsx
<div className="p-fluid-xs">   {/* clamp(0.5rem, 1vw, 1rem) */}
<div className="p-fluid-sm">   {/* clamp(1rem, 2vw, 2rem) */}
<div className="p-fluid-md">   {/* clamp(2rem, 4vw, 4rem) */}
<div className="p-fluid-lg">   {/* clamp(3rem, 6vw, 6rem) */}
<div className="p-fluid-xl">   {/* clamp(4rem, 8vw, 8rem) */}

// Variantes directionnelles
<div className="py-fluid-sm">  {/* padding-top et bottom */}
<div className="px-fluid-md">  {/* padding-left et right */}
```

#### Margin fluide
```tsx
<div className="mt-fluid-sm">  {/* margin-top */}
<div className="mb-fluid-md">  {/* margin-bottom */}
```

### Variables CSS
```css
--space-xs: clamp(0.5rem, 1vw, 1rem);
--space-sm: clamp(1rem, 2vw, 2rem);
--space-md: clamp(2rem, 4vw, 4rem);
--space-lg: clamp(3rem, 6vw, 6rem);
--space-xl: clamp(4rem, 8vw, 8rem);
```

---

## 🎨 Composants Utilitaires

### 1. ResponsiveText
Composant React pour du texte fluide avec TypeScript :

```tsx
import ResponsiveText from '@/components/ui/ResponsiveText';

// Usage simple
<ResponsiveText as="h1" size="5xl" className="font-bold text-primary-600">
  Mon titre
</ResponsiveText>

// Composants pré-configurés
import { FluidHeading1, FluidHeading2, FluidParagraph } from '@/components/ui/ResponsiveText';

<FluidHeading1>Titre principal</FluidHeading1>
<FluidHeading2>Sous-titre</FluidHeading2>
<FluidParagraph>Mon paragraphe</FluidParagraph>
```

### 2. ResponsiveContainer
Container avec padding adaptatif :

```tsx
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';

// Container avec taille max
<ResponsiveContainer size="2xl" padding>
  {/* Contenu */}
</ResponsiveContainer>

// Container fluide (utilise les variables CSS)
import { FluidContainer } from '@/components/ui/ResponsiveContainer';

<FluidContainer>
  {/* Contenu avec padding fluide automatique */}
</FluidContainer>
```

---

## 🎯 Classes Utilitaires Responsive

### Grilles auto-adaptatives
```tsx
// Auto-fit : colonnes s'ajustent à l'espace disponible
<div className="grid-auto-fit">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Auto-fill : colonnes remplissent l'espace
<div className="grid-auto-fill">
  {/* Items */}
</div>
```

### Visibilité conditionnelle
```tsx
// Cacher/afficher selon la taille d'écran
<div className="hide-mobile">Caché sur mobile</div>
<div className="show-mobile">Visible uniquement sur mobile</div>

<div className="hide-tablet">Caché sur tablette</div>
<div className="show-tablet">Visible uniquement sur tablette</div>

<div className="hide-desktop">Caché sur desktop</div>
<div className="show-desktop">Visible uniquement sur desktop</div>
```

---

## 🔧 Classes Pré-configurées

### Boutons
```tsx
// Boutons avec padding fluide automatique
<button className="btn-primary">
  Action principale
</button>

<button className="btn-secondary">
  Action secondaire
</button>

<button className="btn-outline">
  Action tertiaire
</button>
```

### Cartes
```tsx
// Carte avec padding fluide et hover effect
<div className="card">
  {/* Contenu - padding s'adapte automatiquement */}
</div>
```

### Titres de section
```tsx
<h2 className="section-title">
  Mon titre de section
</h2>

<p className="section-subtitle">
  Mon sous-titre
</p>
```

### Champs de formulaire
```tsx
<input type="text" className="input-field" placeholder="Email" />
```

---

## 📱 Bonnes Pratiques Mobile

### 1. Zones de toucher (Touch Targets)
Le système applique automatiquement une taille minimale de 44x44px sur mobile :

```css
@media (hover: none) and (pointer: coarse) {
  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 2. Stack sur mobile
```tsx
// Layout qui devient vertical sur mobile
<div className="flex flex-col sm:flex-row gap-4">
  <div>Colonne 1</div>
  <div>Colonne 2</div>
</div>
```

### 3. Images optimisées
```tsx
import Image from 'next/image';

<Image 
  src="/image.jpg" 
  alt="Description"
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

---

## 🎨 Exemple Complet : Carte Produit Responsive

```tsx
export default function ProductCard({ product }) {
  return (
    <div className="card group">
      {/* Image responsive */}
      <div className="relative aspect-square mb-4">
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          className="object-cover rounded-lg group-hover:scale-105 transition-transform"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      
      {/* Titre fluide */}
      <h3 className="text-fluid-xl font-semibold mb-2">
        {product.name}
      </h3>
      
      {/* Description fluide */}
      <p className="text-fluid-sm text-gray-600 dark:text-gray-400 mb-4">
        {product.description}
      </p>
      
      {/* Prix fluide */}
      <div className="text-fluid-2xl font-bold text-primary-600 mb-4">
        {product.price} FCFA
      </div>
      
      {/* Boutons en stack sur mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="btn-primary flex-1">
          Ajouter au panier
        </button>
        <button className="btn-outline">
          Détails
        </button>
      </div>
    </div>
  );
}
```

---

## 🚀 Tests Recommandés

### Devices à tester
1. **Mobile** : iPhone SE (375px), iPhone 12 (390px), iPhone 14 Pro Max (430px)
2. **Tablette** : iPad (768px), iPad Pro (1024px)
3. **Desktop** : MacBook (1280px), iMac (1920px), 4K (2560px)

### Checklist UX
- [ ] Texte lisible sur tous les écrans (taille min 16px pour le corps)
- [ ] Boutons facilement cliquables sur mobile (44x44px min)
- [ ] Pas de scroll horizontal
- [ ] Images chargées avec les bonnes dimensions
- [ ] Navigation accessible sur mobile
- [ ] Performance : pas de layout shift

---

## 🎯 Performance

### Animations respectueuses
Le système détecte les préférences de mouvement réduit :

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Scroll smooth
```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 5rem; /* Pour header sticky */
}
```

---

## 📚 Ressources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [CSS clamp() Function](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

**Dernière mise à jour** : 15 décembre 2025
