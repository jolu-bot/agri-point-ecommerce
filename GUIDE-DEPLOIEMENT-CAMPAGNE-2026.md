# 🚀 Guide Déploiement Campagne - Hostinger (Mise à Jour 2026)

Guide complet pour déployer la campagne engrais mars 2026 sur Hostinger.

## 📋 Table des Matières
1. [Préparation](#préparation)
2. [Déploiement Automatisé](#déploiement-automatisé)
3. [Configuration Manuelle](#configuration-manuelle)
4. [Vérification](#vérification)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Préparation

### 1. Vérifications Locales (Avant Push)

```bash
# 1. Build final
npm run build

# 2. Seed données en prod
npm run seed:campaign
npm run seed:campaign:products

# 3. Commit & Push
git add .
git commit -m "feat: déploiement campagne mars 2026"
git push origin main
```

### 2. Informations Hostinger Nécessaires

```
VPS IP: [adresse IP publique]
VPS User: [ex: root ou hostinger_user]
VPS Password: [mot de passe SSH]
Domain: [votre-domaine.cm]
Control Panel: cPanel / Plesk / SSH direct
```

---

## 🤖 Déploiement Automatisé

### Option A: GitHub Actions

**Créer `.github/workflows/deploy-hostinger.yml`:**

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install & Build
        run: |
          npm ci
          npm run build
      
      - name: Deploy to Hostinger
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOSTINGER_IP }}
          username: ${{ secrets.HOSTINGER_USER }}
          key: ${{ secrets.HOSTINGER_SSH_KEY }}
          script: |
            cd /home/agripoint
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart agripoint || pm2 start npm --name agripoint -- start
            pm2 save
```

**Secrets à ajouter sur GitHub:**
- `HOSTINGER_IP`
- `HOSTINGER_USER`
- `HOSTINGER_SSH_KEY`

---

### Option B: Déploiement Manuel via SSH

#### 1. Créer le répertoire

```bash
ssh root@[HOSTINGER_IP]

# Sur Hostinger
mkdir -p /home/agripoint
cd /home/agripoint
git clone https://github.com/[user]/agri-point-ecommerce.git .
```

#### 2. Installer et Compiler

```bash
cd /home/agripoint
npm install --production
npm run build
```

#### 3. Configurer Variables d'Environnement

```bash
nano .env.local
```

**Contenu:**
```env
NODE_ENV=production
SECRET=votre_secret_très_long
MONGODB_URI=mongodb+srv://[user]:[pass]@cluster.mongodb.net/agripoint
NEXTAUTH_URL=https://votre-domaine.cm
NEXTAUTH_SECRET=votre_secret_long
ADMIN_EMAIL=admin@votre-domaine.cm
```

#### 4. Démarrer avec PM2

```bash
npm install -g pm2

pm2 start npm --name "agripoint" -- start
pm2 save
pm2 startup
```

---

## 🔐 Configuration Manuelle

### Nginx Proxy

**Fichier `/etc/nginx/conf.d/agripoint.conf`:**

```nginx
upstream agripoint {
  server 127.0.0.1:3000;
  keepalive 64;
}

server {
  listen 80;
  server_name votre-domaine.cm www.votre-domaine.cm;

  location / {
    proxy_pass http://agripoint;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

**Redémarrer:**
```bash
nginx -t
systemctl restart nginx
```

### SSL avec Let's Encrypt

```bash
apt-get install certbot python3-certbot-nginx
certbot certonly --nginx -d votre-domaine.cm
certbot renew --dry-run  # Test renouvellement auto
```

---

## ✅ Vérification Post-Déploiement

### 1. Page Campagne

```
https://votre-domaine.cm/campagne-engrais

Checklist:
- [ ] Page charge (200 OK)
- [ ] Image hero visible
- [ ] Formulaire présent
- [ ] Pas d'erreur 404/500
```

### 2. APIs

```bash
# Tester l'API campagne
curl https://votre-domaine.cm/api/campaigns/march-2026

# Résultat attendu
{
  "success": true,
  "campaign": {
    "name": "Campagne Engrais - Mars 2026",
    "slug": "engrais-mars-2026"
  }
}
```

### 3. Base de Données

```bash
# Test connexion MongoDB
cd /home/agripoint
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB OK'))
  .catch(err => console.log('❌ Erreur: ' + err.message));
"
```

### 4. Logs

```bash
pm2 logs agripoint --lines 50
pm2 logs agripoint --follow  # Temps réel
```

---

## 🐛 Troubleshooting

| Erreur | Solution |
|--------|----------|
| "Cannot find module 'next'" | `npm ci --production && npm run build` |
| "ECONNREFUSED MongoDB" | Vérifier MONGODB_URI dans .env.local |
| "Port 3000 déjà utilisé" | `lsof -i :3000` puis `kill -9 [PID]` |
| "Image hero ne charge pas" | `npm run generate:hero && pm2 restart agripoint` |
| "Too many redirects HTTPS" | Vérifier NEXTAUTH_URL = https://... |

---

## 📊 Checklist Pré-Lancement

- [ ] Build succeeds: `npm run build`
- [ ] MongoDB connecté et testé
- [ ] Domain pointe vers Hostinger IP
- [ ] SSL/HTTPS configuré
- [ ] Page campagne accessible
- [ ] Formulaire soumettable
- [ ] Images chargent
- [ ] Admin dashboard fonctionnel
- [ ] Logs sans erreurs
- [ ] Performance acceptable

---

**Deploy Complété:** [Date]
**URL Prod:** https://votre-domaine.cm
**Status:** ✅ Live
