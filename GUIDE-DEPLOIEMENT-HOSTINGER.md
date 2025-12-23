# 🚀 GUIDE DE DÉPLOIEMENT HOSTINGER - AGRI POINT SERVICE

## ⚠️ PROBLÈME IDENTIFIÉ

Votre application fonctionne mais :
- ❌ Erreur 500 sur `/api/admin/site-config`
- ❌ Impossible de se connecter (aucun compte n'existe en base de données)

**Cause**: La base de données MongoDB en production est vide !

---

## ✅ SOLUTION EN 3 ÉTAPES

### ÉTAPE 1 : Vérifier votre configuration MongoDB sur Hostinger

Assurez-vous que dans votre fichier `.env.local` sur Hostinger, vous avez bien :

```bash
MONGODB_URI=mongodb+srv://votre-user:votre-password@cluster.xxxxx.mongodb.net/agripoint?retryWrites=true&w=majority
```

**Si vous utilisez MongoDB Atlas** (recommandé) :
1. Allez sur [cloud.mongodb.com](https://cloud.mongodb.com)
2. Cliquez sur "Connect" → "Connect your application"
3. Copiez l'URI de connexion
4. Remplacez `<password>` par votre mot de passe réel
5. Remplacez `<database>` par `agripoint`

**Si vous utilisez MongoDB local sur Hostinger** :
```bash
MONGODB_URI=mongodb://localhost:27017/agripoint
```

---

### ÉTAPE 2 : Initialiser la base de données

**Option A - Via SSH sur Hostinger (RECOMMANDÉ)** :

```bash
# 1. Se connecter en SSH à votre serveur Hostinger
ssh votre-user@votre-serveur.com

# 2. Aller dans le dossier de l'application
cd /var/www/agri-point-ecommerce  # Ajuster selon votre chemin

# 3. Vérifier que .env.local existe
cat .env.local

# 4. Exécuter le script d'initialisation
node scripts/init-production.js
```

**Option B - Depuis votre PC (si MongoDB Atlas)** :

```bash
# 1. Modifier temporairement .env.local avec l'URI de production
# Remplacer MONGODB_URI par votre URI Atlas de production

# 2. Exécuter le script
node scripts/init-production.js

# 3. Restaurer .env.local avec l'URI localhost
```

---

### ÉTAPE 3 : Vérifier que tout fonctionne

Le script `init-production.js` va créer :
- ✅ Un compte administrateur
- ✅ La configuration du site (SiteConfig)

**Identifiants par défaut** :
```
Email: admin@agri-ps.com
Mot de passe: admin123
```

⚠️ **IMPORTANT**: Changez ce mot de passe après première connexion !

---

## 🔧 COMMANDES UTILES

### Vérifier l'état de la base de données

```bash
node -e "require('dotenv').config({path:'.env.local'}); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connexion OK'); mongoose.connection.db.listCollections().toArray((err, collections) => { console.log('Collections:', collections.map(c => c.name)); process.exit(0); }); }).catch(err => { console.error('❌ Erreur:', err.message); process.exit(1); });"
```

### Créer manuellement un admin

```bash
node scripts/seed-users.js
```

---

## 📋 CHECKLIST DE DÉPLOIEMENT

Avant de déployer, assurez-vous que votre `.env.local` sur Hostinger contient :

```bash
# Base de données (PRODUCTION)
✅ MONGODB_URI=mongodb+srv://...  # URI MongoDB Atlas ou local

# JWT Secrets (NOUVEAUX pour production)
✅ JWT_SECRET=460c9147182f5a185cad919ed05d50bf98672074946f3e49309691353c25b9a2f1b1b487a18d5b4e25c7d80fd2f2ec7d3740830df194db991f2ebf39a78e246a
✅ JWT_REFRESH_SECRET=a861b814d1463ee21bb8128a1094b85565e5f37a54a8beccb7c6c1ace4eb659c5fe1cc14a295fd953ff941c3011e3c16f7de9eb1f789decaccc1227770f82bf5

# OpenAI (même clé que dev)
✅ OPENAI_API_KEY=sk-proj-...

# Stripe (LIVE pour production)
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
✅ STRIPE_SECRET_KEY=sk_live_...

# PayPal (PRODUCTION)
✅ NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
✅ PAYPAL_CLIENT_SECRET=...
✅ NEXT_PUBLIC_PAYPAL_MODE=production

# Email (SMTP réel)
✅ EMAIL_HOST=smtp.brevo.com
✅ EMAIL_USER=...
✅ EMAIL_PASS=...

# URL du site (votre domaine)
✅ NEXT_PUBLIC_SITE_URL=https://votre-domaine.com

# Admin par défaut
✅ ADMIN_EMAIL=admin@agri-ps.com
✅ ADMIN_PASSWORD=admin123
```

---

## 🐛 DÉPANNAGE

### Erreur: "MONGODB_URI non défini"
➡️ Vérifiez que `.env.local` existe sur le serveur Hostinger

### Erreur: "MongoServerError: bad auth"
➡️ Vérifiez le mot de passe dans MONGODB_URI

### Erreur: "Could not connect to any servers"
➡️ Vérifiez que l'IP du serveur Hostinger est autorisée dans MongoDB Atlas (Network Access)

### La page admin affiche toujours une erreur 500
➡️ Relancez le serveur Node.js après avoir initialisé la base de données :
```bash
pm2 restart all
# ou
systemctl restart node-app
```

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :
1. Vérifiez les logs : `pm2 logs` ou `journalctl -u node-app`
2. Testez la connexion MongoDB avec la commande de vérification ci-dessus
3. Assurez-vous que toutes les variables d'environnement sont définies

---

## 🎯 PROCHAINES ÉTAPES

Après initialisation :
1. ✅ Connectez-vous avec admin@agri-ps.com / admin123
2. ✅ Changez le mot de passe admin
3. ✅ Ajoutez vos produits
4. ✅ Créez d'autres comptes utilisateurs si nécessaire
5. ✅ Testez les paiements en mode live

Bonne chance ! 🚀
