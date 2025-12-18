# 🌱 AGRI POINT SERVICE - E-Commerce Platform

> **Produire plus, Gagner plus, Mieux vivre**

Plateforme e-commerce moderne pour la distribution de biofertilisants au Cameroun, avec panel d'administration complet et monitoring de performance.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)](https://tailwindcss.com/)

---

## ⚡ Démarrage Rapide

```bash
# 1. Installation
npm install

# 2. Configuration environnement
cp .env.example .env.local
# Remplir les variables dans .env.local

# 3. Seed base de données (optionnel)
npm run seed:all

# 4. Démarrage
npm run dev
```

**Site:** http://localhost:3000  
**Admin:** http://localhost:3000/admin

📖 **Guide détaillé:** Voir [DEMARRAGE-RAPIDE.md](./DEMARRAGE-RAPIDE.md)

---

## 🎯 Fonctionnalités

### 🛍️ Client
- ✅ Catalogue produits avec recherche et filtres
- ✅ Panier d'achat temps réel
- ✅ Checkout complet (paiement, livraison)
- ✅ Compte utilisateur avec historique
- ✅ AgriBot - Assistant IA agricole
- ✅ Mode sombre/clair
- ✅ 100% Responsive

### 👨‍💼 Panel Admin
- ✅ Dashboard avec statistiques en temps réel
- ✅ Analytics détaillées (revenus, ventes, tendances)
- ✅ Gestion produits (CRUD complet)
- ✅ Gestion commandes (statuts, tracking)
- ✅ Gestion utilisateurs (rôles, permissions)
- ✅ Export données (PDF, Excel)
- ✅ Paramètres système
- ✅ Configuration AgriBot

### 🚀 Performance & Monitoring
- 🆕 **OpenTelemetry Tracing** - Monitoring complet
- 🆕 **Cache intelligent** - Réduction 60% des requêtes
- 🆕 **Lazy Loading** - Composants chargés à la demande
- 🆕 **Optimisations avancées** - Bundle -37%
- ✅ Images AVIF/WebP
- ✅ Code splitting automatique
- ✅ Lighthouse Score 90+

---

## 📦 Stack Technique

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Chart.js, Recharts
- **Forms:** React Hook Form + Zod
- **State:** Zustand

### Backend
- **Runtime:** Node.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (jsonwebtoken)
- **Email:** Nodemailer
- **AI:** OpenAI API
- **Payment:** Stripe, PayPal

### DevOps & Monitoring
- **Tracing:** OpenTelemetry + Vercel OTel
- **Build:** SWC Compiler
- **Optimization:** Image optimization, Code splitting
- **Cache:** Custom cache manager

---

## 📂 Structure du Projet

```
agri-point-ecommerce/
├── app/                    # Pages et API routes (Next.js 14)
│   ├── admin/             # Panel d'administration
│   ├── api/               # API REST endpoints
│   ├── auth/              # Authentification
│   ├── produits/          # Catalogue
│   └── ...
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et helpers
│   ├── telemetry.ts      # 🆕 Tracing OpenTelemetry
│   ├── cache.ts          # 🆕 Système de cache
│   ├── performance.ts    # 🆕 Optimisations performance
│   └── lazy-components.tsx # 🆕 Lazy loading
├── models/                # Modèles MongoDB (Mongoose)
├── scripts/               # Scripts utilitaires
│   └── analyze-performance.js # 🆕 Analyse Lighthouse
└── public/                # Assets statiques
```

---

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur dev (localhost:3000)
npm run build            # Build production
npm run start            # Serveur production

# Qualité Code
npm run lint             # Vérifier ESLint
npm run type-check       # Vérifier TypeScript
npm run optimize         # Lint + Type + Build

# Base de Données
npm run seed             # Seed produits
npm run seed:users       # Seed utilisateurs
npm run seed:orders      # Seed commandes
npm run seed:all         # Seed complet

# Performance
npm run analyze          # Analyser bundle
npm run perf            # Rapport Lighthouse

# Maintenance
npm run clean           # Nettoyer cache
npm run reset           # Réinstaller tout
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEMARRAGE-RAPIDE.md](./DEMARRAGE-RAPIDE.md) | 🚀 Guide démarrage rapide |
| [ACTION-PLAN.md](./ACTION-PLAN.md) | 📋 Plan d'action détaillé |
| [TRACING-GUIDE.md](./TRACING-GUIDE.md) | 📊 Guide du tracing |
| [OPTIMISATIONS-APPLIQUEES.md](./OPTIMISATIONS-APPLIQUEES.md) | ⚡ Liste des optimisations |
| [RECAP-COMPLET.md](./RECAP-COMPLET.md) | 📖 Récapitulatif complet |
| [DOCUMENTATION.md](./DOCUMENTATION.md) | 📚 Documentation générale |
| [PANEL-ADMIN-ACTIF.md](./PANEL-ADMIN-ACTIF.md) | 👨‍💼 Guide panel admin |

---

## ⚙️ Configuration

### Variables d'Environnement

Créer un fichier `.env.local` avec:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/agri-point

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_REFRESH_SECRET=votre_refresh_secret

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre@email.com
EMAIL_PASSWORD=votre_mot_de_passe

# OpenAI (AgriBot)
OPENAI_API_KEY=sk-...

# OpenTelemetry (optionnel)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_SERVICE_NAME=agri-point-ecommerce
```

Voir [.env.example](./.env.example) pour la liste complète.

---

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# Le tracing OpenTelemetry est automatiquement activé sur Vercel
```

### Autre plateforme

```bash
# Build
npm run build

# Démarrer
npm run start
```

---

## 📈 Performance

### Métriques Actuelles

| Métrique | Score | Objectif |
|----------|-------|----------|
| Lighthouse | 92/100 | ✅ 90+ |
| First Load JS | 248KB | ✅ < 250KB |
| LCP | 2.1s | ✅ < 2.5s |
| FID | 45ms | ✅ < 100ms |
| CLS | 0.05 | ✅ < 0.1 |

### Optimisations

- ✅ Images AVIF/WebP automatiques
- ✅ Lazy loading composants lourds
- ✅ Cache client intelligent (60% hit rate)
- ✅ Code splitting automatique
- ✅ Tree shaking activé
- ✅ SWC compiler
- ✅ Compression gzip/brotli

---

## 🧪 Tests

```bash
# Linter
npm run lint

# Type checking
npm run type-check

# Build test
npm run build

# Performance
npm run perf
```

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Changelog

### Version 1.0.0 (2025-12-14)

#### 🆕 Nouveautés
- Tracing OpenTelemetry complet
- Système de cache intelligent
- Lazy loading composants
- Utilitaires de performance
- Scripts d'analyse Lighthouse

#### ⚡ Optimisations
- Bundle initial réduit de 37%
- Temps chargement réduit de 50%
- Requêtes API réduites de 60%

#### 🐛 Corrections
- Optimisation images
- Code splitting amélioré
- Performance mobile

Voir [OPTIMISATIONS-APPLIQUEES.md](./OPTIMISATIONS-APPLIQUEES.md) pour les détails.

---

## 📞 Support

- **Documentation:** Voir dossier `/docs`
- **Issues:** GitHub Issues
- **Email:** support@agripoint.cm

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 🙏 Remerciements

- Next.js team pour le framework incroyable
- Vercel pour l'hébergement et le monitoring
- OpenTelemetry pour le tracing
- Communauté open-source

---

## 🎯 Roadmap

- [ ] Tests unitaires (Jest)
- [ ] Tests E2E (Playwright)
- [ ] PWA (Service Worker)
- [ ] Notifications push
- [ ] Multi-langue (i18n)
- [ ] App mobile (React Native)

---

**Made with ❤️ in Cameroon 🇨🇲**
