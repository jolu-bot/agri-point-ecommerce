# 🌱 AGRI POINT SERVICE - E-Commerce Platform

Site e-commerce complet pour AGRI POINT SERVICE - Distributeur de biofertilisants au Cameroun.

## 🚀 Fonctionnalités

### ✅ Interface Publique
- ✨ Page d'accueil moderne avec Hero, Stats, Produits phares
- 🛍️ Boutique avec filtres et recherche
- 📦 Fiches produits détaillées
- 🛒 Panier intelligent avec gestion du stock
- 🌱 Section Agriculture Urbaine
- 🤖 **AgriBot** - Chatbot IA pour conseils agricoles
- 🌓 **Dark Mode** complet
- 📱 100% Responsive

### ✅ Système d'Authentification
- 🔐 JWT avec tokens d'accès et refresh
- 👥 Rôles : Admin, Manager, Rédacteur, Assistant IA, Client
- 🛡️ Permissions granulaires par rôle
- 🔒 Middleware de sécurité

### ✅ Base de Données (MongoDB)
- 👤 Users (avec rôles et permissions)
- 📦 Products (avec variants, features, SEO)
- 🛒 Orders (gestion complète des commandes)
- ⚙️ Settings (configuration du site)
- 💬 Messages (contact, support, AgriBot)

### ✅ Intelligence Artificielle
- 🤖 **AgriBot** intégré avec OpenAI GPT-4
- 🌾 Conseils personnalisés par culture
- 💡 Recommandations produits intelligentes
- 📊 Analyse et suggestions automatiques

### 🚧 En développement
- 👑 Backoffice Admin complet
- 💳 Intégration paiements (Stripe, PayPal, Mobile Money)
- 📊 Dashboard Analytics
- 📧 Système d'emails automatiques

## 📦 Installation

### Prérequis
- Node.js 18+ 
- MongoDB (local ou Atlas)
- Compte OpenAI (optionnel pour AgriBot)

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration des variables d'environnement
Créez un fichier `.env.local` avec :

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/agripoint
# ou pour MongoDB Atlas :
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agripoint

# JWT
JWT_SECRET=votre_secret_jwt_changez_ceci
JWT_REFRESH_SECRET=votre_refresh_secret_changez_ceci

# OpenAI (pour AgriBot)
OPENAI_API_KEY=sk-votre-cle-openai

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
STRIPE_SECRET_KEY=sk_test_votre_cle

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
WHATSAPP_NUMBER=676026601
```

### 3. Démarrer MongoDB (si local)
```bash
mongod
```

### 4. Lancer le serveur de développement
```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🎨 Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Database** : MongoDB + Mongoose
- **Auth** : JWT (jsonwebtoken)
- **State** : Zustand
- **Animations** : Framer Motion
- **Icons** : React Icons
- **Forms** : React Hook Form (à ajouter)
- **Notifications** : React Hot Toast
- **AI** : OpenAI GPT-4
- **Payments** : Stripe, PayPal (en cours)

## 📁 Structure du Projet

```
agri-point-ecommerce/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentification
│   │   ├── products/             # Produits
│   │   └── agribot/              # Chatbot IA
│   ├── boutique/                 # Page boutique
│   ├── produits/[slug]/          # Fiches produits
│   ├── panier/                   # Panier
│   ├── globals.css               # Styles globaux
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Page d'accueil
├── components/                   # Composants React
│   ├── layout/                   # Header, Footer
│   ├── home/                     # Composants page d'accueil
│   ├── products/                 # Composants produits
│   ├── agribot/                  # Chatbot IA
│   └── providers/                # Context providers
├── lib/                          # Utilitaires
│   ├── db.ts                     # Connexion MongoDB
│   ├── auth.ts                   # Auth helpers
│   └── middleware.ts             # Middlewares
├── models/                       # Modèles Mongoose
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   ├── Settings.ts
│   └── Message.ts
├── store/                        # Zustand stores
│   └── cartStore.ts              # État du panier
└── public/                       # Fichiers statiques
```

## 🔑 Rôles et Permissions

### Admin
- Gestion complète : utilisateurs, produits, commandes, contenu, analytics
- Configuration du site
- Gestion AgriBot

### Manager
- Gestion produits et commandes
- Consultation analytics
- Messages clients

### Rédacteur
- Gestion contenu (blog, pages)
- Consultation produits
- Messages

### Assistant IA
- Configuration AgriBot
- Historique conversations
- Amélioration prompts

### Client
- Consultation produits
- Passage de commandes
- Historique achats

## 🤖 AgriBot - Assistant IA

AgriBot est un chatbot intelligent qui aide les utilisateurs avec :
- Recommandations de produits selon la culture
- Conseils sur l'agriculture urbaine
- Dosages et applications des biofertilisants
- Amélioration du rendement
- Diagnostic de problèmes (maladies, carences)

**Mode Démo** : AgriBot fonctionne même sans clé OpenAI avec des réponses prédéfinies.

## 🌐 Déploiement

### Vercel (Recommandé)
```bash
npm install -g vercel
vercel
```

### Production Build
```bash
npm run build
npm start
```

## 📞 Contact AGRI POINT SERVICE

- **Téléphone** : +237 657 39 39 39
- **WhatsApp** : 676026601
- **Email** : infos@agri-ps.com
- **Adresse** : B.P. 5111 Yaoundé, Quartier Fouda, Cameroun
- **Site Web** : www.agri-ps.com

## 🎯 Prochaines Étapes

1. **Backoffice Admin** - Dashboard complet avec analytics
2. **Paiements** - Stripe + PayPal + Mobile Money (MTN/Orange)
3. **Emails** - Confirmation commandes, newsletters
4. **Blog** - Articles agriculture, conseils, actualités
5. **Système Reviews** - Avis clients sur produits
6. **Notifications Push** - Alertes promotions, nouveautés
7. **Multi-langues** - Français, Anglais
8. **PWA** - Application mobile progressive

## 📝 Licence

© 2024 AGRI POINT SERVICE - Tous droits réservés

## 👨‍💻 Développement

Pour contribuer ou personnaliser :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

**Fait avec ❤️ pour les agriculteurs du Cameroun** 🌾🇨🇲
