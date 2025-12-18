# 🚀 Guide de Démarrage Rapide - AGRI POINT SERVICE

## ⚡ Démarrage en 5 minutes

### 1️⃣ Installation
```bash
cd "c:\Users\jolub\Downloads\AGRI POINT SERVICE\agri-point-ecommerce"
npm install
```

### 2️⃣ Configuration MongoDB

**Option A - MongoDB Local (Recommandé pour test)**
```bash
# Installer MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Démarrer MongoDB
mongod
```

**Option B - MongoDB Atlas (Cloud gratuit)**
1. Créer un compte sur https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit
3. Obtenir la chaîne de connexion
4. La mettre dans `.env.local`

### 3️⃣ Initialiser la base de données
```bash
npm run seed
```

Cela va créer :
- ✅ Admin : `admin@agri-ps.com` / `admin123`
- ✅ 8 produits de démonstration
- ✅ Paramètres du site

### 4️⃣ Démarrer le serveur
```bash
npm run dev
```

Ouvrir http://localhost:3000

## 🎯 Que tester ?

### ✅ Page d'accueil
- Hero section avec statistiques
- Produits phares
- Sections "Produire Plus", "Gagner Plus", "Mieux Vivre"
- Agriculture urbaine
- Témoignages
- Newsletter

### ✅ AgriBot (Chatbot IA)
- Cliquer sur l'icône 💬 en bas à droite
- Tester des questions :
  - "Quel produit pour mes tomates ?"
  - "Comment améliorer mon rendement ?"
  - "Agriculture urbaine : par où commencer ?"

**Note** : AgriBot fonctionne en mode démo sans clé OpenAI

### ✅ Boutique (à créer)
- Filtres par catégorie
- Recherche
- Tri (prix, popularité, nouveautés)

### ✅ Panier
- Ajouter des produits
- Modifier quantités
- Gestion du stock

### ✅ Dark Mode
- Toggle en haut à droite 🌙/☀️
- Mode sauvegardé dans localStorage

## 🔧 Configuration Optionnelle

### OpenAI (pour AgriBot avancé)
1. Créer un compte sur https://platform.openai.com
2. Obtenir une clé API
3. Ajouter dans `.env.local` :
```env
OPENAI_API_KEY=sk-votre-cle-ici
```

### Stripe (pour les paiements)
1. Créer un compte sur https://stripe.com
2. Mode Test activé par défaut
3. Ajouter dans `.env.local` :
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 📱 Pages Disponibles

- ✅ `/` - Accueil
- 🚧 `/boutique` - Catalogue produits (à créer)
- 🚧 `/produits/[slug]` - Fiche produit (à créer)
- 🚧 `/panier` - Panier (à créer)
- 🚧 `/agriculture-urbaine` - Guide agriculture urbaine
- 🚧 `/contact` - Formulaire de contact
- 🚧 `/admin` - Backoffice (à créer)

## 🐛 Dépannage

### Erreur de connexion MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution** : Vérifier que MongoDB est démarré : `mongod`

### Port 3000 déjà utilisé
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Ou utiliser un autre port
PORT=3001 npm run dev
```

### Erreur "Module not found"
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## 📞 Support

- **Email** : infos@agri-ps.com
- **WhatsApp** : +237 676 02 66 01
- **Téléphone** : +237 657 39 39 39

## 🎨 Personnalisation

### Couleurs (tailwind.config.ts)
```typescript
colors: {
  primary: {
    500: '#22c55e',  // Vert principal
    600: '#16a34a',
  },
  secondary: {
    500: '#d97706',  // Orange secondaire
  },
}
```

### Logo & Favicon
Remplacer dans `public/`

### Textes
Modifier directement les composants ou créer une page admin pour gérer le contenu.

## ✨ Prochaines Étapes

1. **Compléter la boutique** - Page catalogue et filtres
2. **Fiches produits** - Pages détaillées avec recommandations IA
3. **Backoffice Admin** - Dashboard de gestion
4. **Paiements** - Stripe + Mobile Money
5. **Emails** - Confirmation commandes

---

**Besoin d'aide ?** Contactez-moi ! 🚀
