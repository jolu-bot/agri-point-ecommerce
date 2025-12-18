# 📝 COMMANDES UTILES - AGRI POINT SERVICE

## 🚀 DÉMARRAGE

### Installation initiale
```bash
cd "c:\Users\jolub\Downloads\AGRI POINT SERVICE\agri-point-ecommerce"
npm install
```

### Initialiser la base de données
```bash
npm run seed
```
Crée : admin@agri-ps.com / admin123 + 8 produits

### Démarrer le serveur de développement
```bash
npm run dev
```
Site accessible sur : http://localhost:3000

### Build production
```bash
npm run build
npm start
```

---

## 🗄️ MONGODB

### Démarrer MongoDB (local)
```bash
mongod
```

### Accéder à MongoDB Shell
```bash
mongosh
```

### Commandes MongoDB utiles
```javascript
// Se connecter à la base
use agripoint

// Lister les collections
show collections

// Voir tous les utilisateurs
db.users.find().pretty()

// Voir tous les produits
db.products.find().pretty()

// Compter les produits
db.products.countDocuments()

// Supprimer toutes les données
db.users.deleteMany({})
db.products.deleteMany({})
db.orders.deleteMany({})
db.settings.deleteMany({})
db.messages.deleteMany({})

// Puis relancer le seed
npm run seed
```

---

## 🔧 DÉVELOPPEMENT

### Lancer en mode watch
```bash
npm run dev
```
Le serveur redémarre automatiquement à chaque modification

### Vérifier les erreurs TypeScript
```bash
npx tsc --noEmit
```

### Linter (ESLint)
```bash
npm run lint
```

### Formater le code (Prettier - à installer)
```bash
npm install -D prettier
npx prettier --write .
```

---

## 📦 GESTION DES DÉPENDANCES

### Installer une nouvelle dépendance
```bash
npm install nom-du-package
```

### Installer une dépendance de développement
```bash
npm install -D nom-du-package
```

### Mettre à jour les dépendances
```bash
npm update
```

### Vérifier les vulnérabilités
```bash
npm audit
npm audit fix
```

### Nettoyer et réinstaller
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 🔍 DEBUGGING

### Voir les logs du serveur
```bash
# Les logs s'affichent dans le terminal où vous avez lancé npm run dev
```

### Activer le mode debug MongoDB
Dans `.env.local`, ajouter :
```env
DEBUG=mongoose:*
```

### Inspecter le build Next.js
```bash
npm run build
# Analyse la taille des bundles et les optimisations
```

---

## 🧪 TESTS (À configurer)

### Installer Jest
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Lancer les tests
```bash
npm test
```

---

## 🌐 DÉPLOIEMENT

### Déploiement Vercel (recommandé)
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Déploiement Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy
```

### Déploiement Railway
```bash
# Via le site web railway.app
# Connecter votre repo GitHub
# Variables d'environnement à configurer
```

---

## 📊 SCRIPTS PERSONNALISÉS

### Créer un utilisateur admin
Créer `scripts/create-admin.js` :
```javascript
// Voir le fichier seed.js pour exemple
```

Lancer :
```bash
node scripts/create-admin.js
```

### Exporter les produits en CSV
```bash
# À créer
node scripts/export-products.js
```

### Importer des produits depuis CSV
```bash
# À créer
node scripts/import-products.js
```

---

## 🔐 SÉCURITÉ

### Générer un secret JWT sécurisé
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# Linux/Mac
openssl rand -base64 32
```

### Hasher un mot de passe (pour test)
```javascript
// Dans le terminal Node
const bcrypt = require('bcryptjs');
bcrypt.hash('monMotDePasse', 10).then(console.log);
```

---

## 📸 IMAGES

### Optimiser les images
```bash
# Installer sharp (déjà installé)
# Next.js optimise automatiquement avec Image component
```

### Convertir en WebP
```bash
npm install -g sharp-cli
sharp input.jpg -o output.webp
```

---

## 🐛 DÉPANNAGE

### Port 3000 déjà utilisé
```bash
# Windows - Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID)
taskkill /PID 1234 /F

# Ou utiliser un autre port
set PORT=3001 && npm run dev
```

### Erreur "Module not found"
```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
```

### MongoDB ne démarre pas
```bash
# Vérifier si MongoDB est installé
mongod --version

# Créer le dossier data si nécessaire (Windows)
mkdir C:\data\db

# Démarrer avec le bon chemin
mongod --dbpath C:\data\db
```

### Build échoue
```bash
# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Build avec plus de détails
npm run build -- --debug
```

---

## 📚 DOCUMENTATION

### Générer la documentation API
```bash
# Installer TypeDoc
npm install -D typedoc

# Générer
npx typedoc --out docs src
```

---

## 🔄 GIT (Versioning)

### Initialiser Git
```bash
git init
git add .
git commit -m "Initial commit - AGRI POINT SERVICE"
```

### Créer un repo GitHub
```bash
# Sur github.com, créer un nouveau repo
# Puis :
git remote add origin https://github.com/username/agri-point-ecommerce.git
git branch -M main
git push -u origin main
```

### Commits réguliers
```bash
git add .
git commit -m "feat: ajouter page boutique"
git push
```

---

## 📊 ANALYTICS

### Google Analytics (à ajouter)
```bash
npm install @next/third-parties
```

### Vercel Analytics
```bash
npm install @vercel/analytics
```

---

## 🎨 THÈME

### Changer les couleurs Tailwind
Modifier `tailwind.config.ts` :
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#votre-couleur',
      }
    }
  }
}
```

---

## 🚀 OPTIMISATIONS

### Analyser le bundle
```bash
npm install -D @next/bundle-analyzer
```

### Lighthouse (performance)
```bash
# Dans Chrome DevTools
# Ou installer CLI
npm install -g lighthouse
lighthouse http://localhost:3000
```

---

## 📞 AIDE

Si vous rencontrez un problème :

1. Vérifier les logs dans le terminal
2. Consulter README.md
3. Chercher l'erreur sur Google
4. Contacter le support

---

**Toutes les commandes pour gérer votre site !** 🚀
