# 📘 Guide de Modification - AGRI POINT

## 🎯 Comment Modifier le Contenu des Pages

Toutes les pages ont été conçues pour être **facilement modifiables**. Voici comment procéder :

---

## 📝 Modifier le Texte d'une Page

### Étape 1: Ouvrir le Fichier
Chaque page a son propre fichier dans le dossier `app/` :

```
app/
├── produire-plus/page.tsx       ← Produire Plus
├── gagner-plus/page.tsx         ← Gagner Plus  
├── mieux-vivre/page.tsx         ← Mieux Vivre
├── agriculture-urbaine/page.tsx ← Agriculture Urbaine
├── a-propos/page.tsx            ← À Propos
└── contact/page.tsx             ← Contact
```

### Étape 2: Trouver l'Objet pageContent
En haut de chaque fichier (après les imports), vous trouverez :

```typescript
const pageContent = {
  hero: {
    badge: "🌱 Texte du badge",
    title: "TITRE PRINCIPAL",
    subtitle: "Sous-titre",
    description: "Description détaillée...",
    // ...
  },
  // Autres sections...
}
```

### Étape 3: Modifier le Texte
Modifiez directement les valeurs entre guillemets :

**Avant:**
```typescript
title: "PRODUIRE PLUS",
```

**Après:**
```typescript
title: "NOUVEAU TITRE ICI",
```

### Étape 4: Sauvegarder
Enregistrez le fichier (Ctrl+S). Le site se met à jour automatiquement ! 🔄

---

## 🖼️ Modifier les Images

### Images Actuelles
Les images utilisent des placeholders SVG. Pour utiliser de vraies photos :

**Trouver cette ligne:**
```typescript
<Image
  src="/images/nom-image.jpg"
  alt="Description"
  fill
  // ...
/>
```

**Remplacer par:**
```typescript
<Image
  src="/images/votre-nouvelle-image.jpg"  ← Nouveau chemin
  alt="Nouvelle description"
  fill
/>
```

**Important:** Placez vos images dans le dossier `public/images/`

---

## 📊 Modifier les Statistiques

### Exemple: Produire Plus
**Fichier:** `app/produire-plus/page.tsx`

**Trouver:**
```typescript
stats: [
  { value: "+150%", label: "Augmentation rendement", icon: TrendingUp },
  { value: "3 mois", label: "Pour voir les résultats", icon: Calendar },
  // ...
]
```

**Modifier:**
```typescript
stats: [
  { value: "+200%", label: "Nouveau texte", icon: TrendingUp },
  { value: "2 mois", label: "Texte modifié", icon: Calendar },
]
```

---

## 💬 Modifier les Témoignages

### Exemple: Gagner Plus
**Trouver:**
```typescript
testimonials: [
  {
    name: "Amadou Diallo",
    location: "Maroua",
    text: "Texte du témoignage...",
    rating: 5,
    // ...
  }
]
```

**Modifier:**
```typescript
testimonials: [
  {
    name: "Nouveau Nom",
    location: "Nouvelle Ville",
    text: "Nouveau témoignage ici...",
    rating: 5,
  }
]
```

---

## 🎨 Modifier les Couleurs

### Changer la Couleur d'un Service (Mieux Vivre)

**Trouver:**
```typescript
services: [
  {
    title: "Santé & Protection",
    color: "red",  ← Couleur actuelle
    // ...
  }
]
```

**Couleurs disponibles:**
- `red` - Rouge
- `blue` - Bleu
- `green` - Vert
- `purple` - Violet
- `amber` - Ambre
- `indigo` - Indigo
- `pink` - Rose
- `teal` - Turquoise

---

## 📞 Modifier les Informations de Contact

### Fichier: `app/contact/page.tsx`

**Trouver:**
```typescript
contactInfo: {
  headquarters: {
    address: "Bastos, Rue de l'Agriculture",
    phone: "+237 6 XX XX XX XX",
    email: "contact@agripoint.cm",
    // ...
  }
}
```

**Modifier avec vos vraies coordonnées:**
```typescript
contactInfo: {
  headquarters: {
    address: "Votre vraie adresse",
    phone: "+237 6 12 34 56 78",
    email: "votre@email.com",
  }
}
```

---

## 🏦 Modifier les Plans d'Épargne (Mieux Vivre)

**Trouver:**
```typescript
savingsPlans: {
  plans: [
    {
      name: "Épargne Libre",
      minAmount: "5 000 FCFA",
      interest: "6%/an",
      features: [
        "Aucun montant minimum",
        "Retrait à tout moment",
        // ...
      ]
    }
  ]
}
```

**Modifier les montants et taux:**
```typescript
minAmount: "10 000 FCFA",  ← Nouveau montant
interest: "8%/an",          ← Nouveau taux
```

---

## 🧮 Modifier le Calculateur (Gagner Plus)

### Configuration des Types de Culture

**Trouver:**
```typescript
calculator: {
  cultures: [
    { value: 'mais', label: 'Maïs', boost: 150 },
    { value: 'tomate', label: 'Tomate', boost: 180 },
    // ...
  ]
}
```

**Modifier:**
```typescript
cultures: [
  { value: 'mais', label: 'Maïs', boost: 200 },  ← Nouveau boost
  { value: 'riz', label: 'Riz', boost: 160 },    ← Nouvelle culture
]
```

Le `boost` représente le pourcentage d'augmentation du rendement.

---

## 📋 Modifier la FAQ

### Exemple: Contact
**Trouver:**
```typescript
faq: [
  {
    question: "Livrez-vous partout au Cameroun ?",
    answer: "Oui, nous livrons dans toutes les régions..."
  }
]
```

**Ajouter une nouvelle question:**
```typescript
faq: [
  {
    question: "Votre nouvelle question ?",
    answer: "Votre réponse ici..."
  },
  // Questions existantes...
]
```

---

## 🔗 Modifier les Liens de Navigation

### Header
**Fichier:** `components/layout/Header.tsx`

**Trouver:**
```typescript
const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Boutique', href: '/produits' },
  // ...
]
```

**Modifier ou ajouter:**
```typescript
const navigation = [
  { name: 'Nouveau Lien', href: '/nouvelle-page' },
  // Autres liens...
]
```

### Footer
**Fichier:** `components/layout/Footer.tsx`

Même principe que le Header.

---

## 🌐 Modifier les Réseaux Sociaux

### Fichier: `app/contact/page.tsx`

**Trouver:**
```typescript
socialMedia: [
  { name: "Facebook", icon: Facebook, url: "https://facebook.com/agripoint" },
  { name: "Instagram", icon: Instagram, url: "https://instagram.com/agripoint" },
  // ...
]
```

**Modifier avec vos vrais liens:**
```typescript
socialMedia: [
  { name: "Facebook", url: "https://facebook.com/votreprofil" },
  { name: "Instagram", url: "https://instagram.com/votreprofil" },
]
```

---

## 🏢 Modifier les Agences Régionales

### Fichier: `app/contact/page.tsx`

**Trouver:**
```typescript
branches: [
  {
    city: "Douala",
    address: "Bonapriso, Avenue de la Liberté",
    phone: "+237 6 XX XX XX XX",
    email: "douala@agripoint.cm"
  }
]
```

**Ajouter une nouvelle agence:**
```typescript
branches: [
  {
    city: "Nouvelle Ville",
    address: "Nouvelle adresse",
    phone: "+237 6 XX XX XX XX",
    email: "ville@agripoint.cm"
  },
  // Agences existantes...
]
```

---

## 🎭 Modifier l'Équipe (À Propos)

### Fichier: `app/a-propos/page.tsx`

**Trouver:**
```typescript
team: {
  members: [
    {
      name: "Dr. Jean-Baptiste Kamga",
      role: "Fondateur & Directeur Général",
      bio: "Agronome, PhD...",
      image: "/images/team-kamga.jpg"
    }
  ]
}
```

**Modifier ou ajouter:**
```typescript
members: [
  {
    name: "Votre Nom",
    role: "Votre Rôle",
    bio: "Votre biographie...",
    image: "/images/votre-photo.jpg"
  }
]
```

---

## ⏰ Modifier la Timeline (À Propos)

**Trouver:**
```typescript
history: [
  {
    year: "2010",
    title: "Naissance d'AGRI POINT",
    description: "Création à Yaoundé...",
    icon: Building2
  }
]
```

**Ajouter un événement:**
```typescript
history: [
  {
    year: "2024",
    title: "Nouvel Événement",
    description: "Description...",
    icon: Star
  },
  // Événements existants...
]
```

---

## 🎯 Conseils Importants

### ✅ À Faire:
- Toujours sauvegarder avant de modifier
- Tester les modifications sur localhost
- Garder la structure des objets
- Ne pas supprimer les virgules

### ❌ À Éviter:
- Ne pas modifier les noms des propriétés (`hero`, `stats`, etc.)
- Ne pas supprimer les accolades `{ }` ou crochets `[ ]`
- Ne pas toucher au code en dehors de `pageContent`
- Ne pas modifier les imports en haut du fichier

---

## 🔍 Trouver Rapidement

### Raccourcis VS Code:
- `Ctrl + F` : Rechercher dans le fichier
- `Ctrl + H` : Rechercher et remplacer
- `Ctrl + S` : Sauvegarder
- `Ctrl + /` : Commenter/décommenter

### Recherches Utiles:
- Chercher `pageContent` pour trouver le contenu
- Chercher `title:` pour trouver tous les titres
- Chercher `description:` pour les descriptions
- Chercher `testimonials` pour les témoignages

---

## 🚀 Après Modification

1. **Vérifier le serveur tourne:**
   ```bash
   npm run dev
   ```

2. **Ouvrir dans le navigateur:**
   ```
   http://localhost:3000
   ```

3. **Naviguer vers la page modifiée**

4. **Vérifier que tout s'affiche correctement**

---

## 💡 Exemples Pratiques

### Exemple 1: Changer le Badge Hero
**Page:** Produire Plus

```typescript
// AVANT
badge: "🌱 Agriculture Biologique"

// APRÈS
badge: "✨ Nouvelle Agriculture"
```

### Exemple 2: Modifier un Stat
**Page:** Mieux Vivre

```typescript
// AVANT
{ value: "25K+", label: "Familles accompagnées" }

// APRÈS
{ value: "30K+", label: "Familles heureuses" }
```

### Exemple 3: Ajouter une Feature
**Page:** Agriculture Urbaine

```typescript
features: [
  "Jardinières verticales optimisées",
  "Système d'irrigation goutte-à-goutte",
  "Substrat enrichi longue durée",
  "Nouvelle fonctionnalité ici",  ← AJOUTÉ
]
```

---

## 📞 Support

Si vous avez des questions ou besoin d'aide:

1. Consultez ce guide
2. Vérifiez le fichier `PAGES-CREEES.md` pour la structure
3. Utilisez la recherche dans VS Code
4. Testez toujours sur localhost avant de déployer

---

**Dernière mise à jour:** ${new Date().toLocaleDateString('fr-FR')}

**Bon courage et amusez-vous bien ! 🎉**
