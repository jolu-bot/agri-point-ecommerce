# 🚀 GUIDE COMPLET : DÉPLOYER SUR HOSTINGER VPS

**Date:** 18 Décembre 2025  
**Projet:** AGRI POINT SERVICE E-Commerce  
**Stack:** Next.js 14 + MongoDB + Node.js

---

## 📋 TABLE DES MATIÈRES

1. [Offres Hostinger VPS](#offres-hostinger-vps)
2. [MongoDB sur Hostinger](#mongodb-sur-hostinger)
3. [Configuration VPS étape par étape](#configuration-vps)
4. [Installation MongoDB](#installation-mongodb)
5. [Déploiement Next.js](#deploiement-nextjs)
6. [Configuration Nginx](#configuration-nginx)
7. [SSL Gratuit](#ssl-gratuit)
8. [PM2 Process Manager](#pm2-process-manager)
9. [Variables d'environnement](#variables-environnement)
10. [Commandes utiles](#commandes-utiles)

---

## 💰 OFFRES HOSTINGER VPS

### 🟢 VPS Recommandé pour votre projet

| Plan | RAM | CPU | Stockage | Bande passante | Prix/mois |
|------|-----|-----|----------|----------------|-----------|
| **VPS 1** | 4GB | 2 cores | 50GB SSD | 2TB | ~4,49€ |
| **VPS 2** | 8GB | 4 cores | 100GB SSD | 4TB | ~8,99€ |
| **VPS 3** | 12GB | 6 cores | 150GB SSD | 6TB | ~12,99€ |

**✅ RECOMMANDATION:** **VPS 1** (4GB RAM) suffit pour démarrer

**Pourquoi ?**
- Next.js + MongoDB : ~2GB RAM utilisés
- 500-1000 visiteurs/jour : OK
- Scalable ensuite

---

## 🗄️ MONGODB SUR HOSTINGER

### ❌ Hostinger N'OFFRE PAS MongoDB managé

**Solutions disponibles:**

### ✅ OPTION 1: INSTALLER MONGODB SUR LE VPS (Gratuit)
**Avantages:**
- ✅ Totalement gratuit
- ✅ Contrôle total
- ✅ Performances maximales (même serveur)
- ✅ Pas de latence réseau

**Inconvénients:**
- ⚠️ Vous gérez les backups
- ⚠️ Consomme RAM du VPS (~500MB)

**Verdict:** **MEILLEUR CHOIX** pour commencer

---

### ✅ OPTION 2: MONGODB ATLAS (Cloud - Recommandé)
**Avantages:**
- ✅ **512MB GRATUIT à vie**
- ✅ Backups automatiques
- ✅ Sécurité gérée
- ✅ Scaling facile
- ✅ Monitoring inclus

**Inconvénients:**
- ⚠️ Latence réseau (~50-100ms si région éloignée)

**Prix après gratuit:**
- Shared : 9$/mois (2GB RAM)
- Dedicated : 57$/mois (8GB RAM)

**Verdict:** **EXCELLENT** pour éviter la gestion

**Lien:** https://www.mongodb.com/cloud/atlas/register

---

### ✅ OPTION 3: ALTERNATIVE - POSTGRESQL (Disponible Hostinger)

**Hostinger offre PostgreSQL managé !**

**Avantages:**
- ✅ Inclus dans certains plans
- ✅ Relationnel (plus strict)
- ✅ Backups auto

**Inconvénients:**
- ⚠️ Nécessite changer le code (Mongoose → Prisma/TypeORM)
- ⚠️ ~3 jours de refactoring

**Verdict:** Possible mais MongoDB mieux adapté à votre projet

---

## 🔧 CONFIGURATION VPS (ÉTAPE PAR ÉTAPE)

### 1️⃣ COMMANDER LE VPS HOSTINGER

1. **Aller sur:** https://www.hostinger.com/vps-hosting
2. **Choisir:** VPS 1 (4GB RAM)
3. **Système:** Ubuntu 22.04 LTS (recommandé)
4. **Localisation:** Choisir la plus proche (Europe ou USA)
5. **Payer** (acceptent Mobile Money, Carte, PayPal)

---

### 2️⃣ ACCÉDER AU VPS

**Via Hostinger Panel:**
```
1. Connexion : https://hpanel.hostinger.com
2. Menu : VPS → Votre VPS
3. Accès : "Access Web Terminal" ou SSH
```

**Via SSH (recommandé):**
```bash
# Windows PowerShell
ssh root@VOTRE_IP_VPS

# Remplacer VOTRE_IP_VPS par l'IP donnée par Hostinger
# Exemple: ssh root@123.45.67.89

# Mot de passe : Fourni dans l'email de confirmation
```

---

### 3️⃣ MISE À JOUR DU SYSTÈME

```bash
# 1. Mettre à jour les packages
apt update && apt upgrade -y

# 2. Installer les outils essentiels
apt install -y curl wget git build-essential

# 3. Vérifier
node --version  # Si pas installé, continuer
```

---

### 4️⃣ INSTALLER NODE.JS 20

```bash
# 1. Installer NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Recharger le terminal
source ~/.bashrc

# 3. Installer Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# 4. Vérifier
node --version    # v20.x.x
npm --version     # 10.x.x
```

---

## 🗄️ INSTALLATION MONGODB

### MÉTHODE 1: MONGODB SUR LE VPS (Gratuit)

```bash
# 1. Importer la clé publique MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# 2. Créer le fichier source list
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. Mettre à jour et installer
apt update
apt install -y mongodb-org

# 4. Démarrer MongoDB
systemctl start mongod
systemctl enable mongod

# 5. Vérifier
systemctl status mongod  # Doit être "active (running)"
mongosh --version        # MongoDB Shell
```

**Configuration sécurité MongoDB:**

```bash
# 1. Ouvrir MongoDB shell
mongosh

# 2. Créer admin user (dans mongo shell)
use admin

db.createUser({
  user: "admin",
  pwd: "VotreMotDePasseSecurisé123!",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

# 3. Créer database user
use agripoint

db.createUser({
  user: "agripoint_user",
  pwd: "MotDePasseDatabase456!",
  roles: [{ role: "readWrite", db: "agripoint" }]
})

# 4. Quitter
exit

# 5. Activer l'authentification
nano /etc/mongod.conf
```

**Ajouter dans mongod.conf:**
```yaml
security:
  authorization: enabled
```

```bash
# 6. Redémarrer MongoDB
systemctl restart mongod

# 7. Tester connexion
mongosh -u admin -p VotreMotDePasseSecurisé123! --authenticationDatabase admin
```

**String de connexion:**
```
mongodb://agripoint_user:MotDePasseDatabase456!@localhost:27017/agripoint
```

---

### MÉTHODE 2: MONGODB ATLAS (Cloud - Plus simple)

```bash
# 1. Créer compte gratuit
https://www.mongodb.com/cloud/atlas/register

# 2. Créer cluster (M0 - Gratuit)
- Choisir : Shared (FREE)
- Provider : AWS ou Google Cloud
- Region : Europe (Paris) ou USA (proche de vous)

# 3. Créer database user
- Database Access → Add New Database User
- Username : agripoint_user
- Password : Générer un mot de passe sécurisé
- Role : Read and write to any database

# 4. Whitelist IP du VPS
- Network Access → Add IP Address
- IP : VOTRE_IP_VPS (ou 0.0.0.0/0 pour tous - dev seulement)

# 5. Obtenir connection string
- Clusters → Connect → Connect your application
- Driver : Node.js
- Version : 5.5 or later

String ressemble à :
mongodb+srv://agripoint_user:PASSWORD@cluster0.xxxxx.mongodb.net/agripoint?retryWrites=true&w=majority
```

**✅ Aucune installation sur VPS nécessaire !**

---

## 🚀 DÉPLOIEMENT NEXT.JS

### 1️⃣ CLONER VOTRE PROJET

```bash
# 1. Aller dans le répertoire web
cd /var/www

# 2. Cloner depuis GitHub (si vous avez mis votre code)
git clone https://github.com/VOTRE_USERNAME/agri-point-ecommerce.git

# OU upload manuel via SFTP
# Utilisez FileZilla ou WinSCP
# Host: VOTRE_IP_VPS
# User: root
# Password: Votre mot de passe
# Port: 22

# 3. Entrer dans le dossier
cd agri-point-ecommerce

# 4. Installer les dépendances
npm install

# 5. Vérifier
ls -la  # Doit voir node_modules/
```

---

### 2️⃣ CONFIGURER VARIABLES D'ENVIRONNEMENT

```bash
# 1. Créer .env.local
nano .env.local
```

**Copier ce contenu (MODIFIER LES VALEURS) :**

```bash
# MongoDB - CHOISIR UNE OPTION

## OPTION 1: MongoDB Local (si installé sur VPS)
MONGODB_URI=mongodb://agripoint_user:MotDePasseDatabase456!@localhost:27017/agripoint

## OPTION 2: MongoDB Atlas (si cloud)
# MONGODB_URI=mongodb+srv://agripoint_user:PASSWORD@cluster0.xxxxx.mongodb.net/agripoint?retryWrites=true&w=majority

# JWT Secrets (GÉNÉRER DE NOUVEAUX !)
JWT_SECRET=GÉNÉRER_UN_SECRET_RANDOM_64_CARACTÈRES
JWT_REFRESH_SECRET=GÉNÉRER_UN_AUTRE_SECRET_RANDOM_64_CARACTÈRES

# OpenAI
OPENAI_API_KEY=sk-proj-VotreCléAPI

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET

# NotchPay (Mobile Money Cameroun)
NOTCHPAY_PUBLIC_KEY=pk_live_VOTRE_CLE
NOTCHPAY_PRIVATE_KEY=sk_live_VOTRE_CLE

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
EMAIL_FROM=AGRI POINT SERVICE <noreply@agri-ps.com>

# Site URL (VOTRE DOMAINE)
NEXT_PUBLIC_SITE_URL=https://www.agri-ps.com

# WhatsApp
WHATSAPP_NUMBER=676026601
```

**Sauvegarder:** `Ctrl+X` → `Y` → `Enter`

---

### 3️⃣ GÉNÉRER SECRETS JWT

```bash
# Générer 2 secrets aléatoires
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copier le résultat dans JWT_SECRET

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copier le résultat dans JWT_REFRESH_SECRET
```

---

### 4️⃣ SEED LA BASE DE DONNÉES

```bash
# 1. Seed produits
npm run seed

# 2. Seed utilisateurs admin
npm run seed:users

# 3. Seed configuration site
npm run seed:config

# 4. Vérifier dans MongoDB
mongosh -u agripoint_user -p MotDePasseDatabase456! agripoint

# Dans mongo shell:
show collections
db.products.countDocuments()  # Doit voir vos produits
db.users.countDocuments()     # Doit voir les users
exit
```

---

### 5️⃣ BUILD EN PRODUCTION

```bash
# 1. Build Next.js
npm run build

# 2. Vérifier le build
ls -la .next/  # Doit voir des fichiers compilés

# 3. Tester en local
npm start

# 4. Ouvrir un navigateur
# http://VOTRE_IP_VPS:3000

# Si ça marche, continuer ! Sinon débugger
```

---

## 🌐 CONFIGURATION NGINX (REVERSE PROXY)

### 1️⃣ INSTALLER NGINX

```bash
# 1. Installer
apt install -y nginx

# 2. Démarrer
systemctl start nginx
systemctl enable nginx

# 3. Vérifier
systemctl status nginx  # active (running)

# 4. Ouvrir navigateur
# http://VOTRE_IP_VPS
# Doit voir "Welcome to nginx"
```

---

### 2️⃣ CONFIGURER LE SITE

```bash
# 1. Créer config Nginx
nano /etc/nginx/sites-available/agri-ps
```

**Copier cette configuration:**

```nginx
server {
    listen 80;
    server_name www.agri-ps.com agri-ps.com VOTRE_IP_VPS;

    # Limites upload (pour images produits)
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/agri-ps-access.log;
    error_log /var/log/nginx/agri-ps-error.log;

    # Proxy vers Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache statique
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Images
    location /images {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

**Sauvegarder:** `Ctrl+X` → `Y` → `Enter`

```bash
# 2. Activer le site
ln -s /etc/nginx/sites-available/agri-ps /etc/nginx/sites-enabled/

# 3. Supprimer config par défaut
rm /etc/nginx/sites-enabled/default

# 4. Tester la config
nginx -t  # Doit dire "syntax is ok"

# 5. Redémarrer Nginx
systemctl restart nginx

# 6. Vérifier
# http://VOTRE_IP_VPS (port 80 maintenant, pas 3000)
```

---

## 🔒 SSL GRATUIT (HTTPS)

### INSTALLER CERTBOT (Let's Encrypt)

```bash
# 1. Installer Certbot
apt install -y certbot python3-certbot-nginx

# 2. Obtenir certificat SSL (REMPLACER LE DOMAINE)
certbot --nginx -d agri-ps.com -d www.agri-ps.com

# Répondre aux questions:
# Email : votre@email.com
# Terms : A (Agree)
# Share email : N (No)
# Redirect HTTP to HTTPS : 2 (Yes)

# 3. Vérifier
# https://www.agri-ps.com

# 4. Auto-renouvellement (test)
certbot renew --dry-run

# SSL se renouvelle automatiquement tous les 90 jours !
```

---

## 🔄 PM2 PROCESS MANAGER (AUTO-RESTART)

### INSTALLER PM2

```bash
# 1. Installer PM2 globalement
npm install -g pm2

# 2. Démarrer Next.js avec PM2
cd /var/www/agri-point-ecommerce
pm2 start npm --name "agri-ps" -- start

# 3. Vérifier
pm2 status  # Doit voir "agri-ps" online

# 4. Logs en temps réel
pm2 logs agri-ps

# 5. Auto-start au reboot
pm2 startup
pm2 save

# 6. Commandes utiles
pm2 restart agri-ps   # Redémarrer
pm2 stop agri-ps      # Arrêter
pm2 delete agri-ps    # Supprimer
pm2 monit            # Monitoring CPU/RAM
```

---

## 🔥 FIREWALL (SÉCURITÉ)

```bash
# 1. Installer UFW
apt install -y ufw

# 2. Autoriser SSH (IMPORTANT !)
ufw allow 22/tcp

# 3. Autoriser HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 4. Activer firewall
ufw enable

# 5. Vérifier
ufw status
```

---

## 📁 STRUCTURE FINALE SUR VPS

```
/var/www/agri-point-ecommerce/
├── .next/                    # Build Next.js
├── app/                      # Code source
├── components/
├── lib/
├── models/
├── public/
├── node_modules/
├── .env.local               # Variables d'environnement
├── package.json
└── next.config.js
```

---

## 🔧 COMMANDES UTILES

### GESTION PM2
```bash
pm2 list                    # Lister les processus
pm2 logs agri-ps           # Voir les logs
pm2 restart agri-ps        # Redémarrer
pm2 stop agri-ps           # Arrêter
pm2 monit                  # Monitoring
```

### NGINX
```bash
systemctl status nginx      # Statut
systemctl restart nginx     # Redémarrer
nginx -t                    # Tester config
tail -f /var/log/nginx/agri-ps-error.log  # Logs erreurs
```

### MONGODB
```bash
systemctl status mongod     # Statut
mongosh -u admin -p        # Connexion
mongodump --out /backup    # Backup
```

### SYSTÈME
```bash
htop                       # Monitoring CPU/RAM
df -h                      # Espace disque
free -h                    # RAM disponible
```

---

## 🚀 MISE À JOUR DU CODE

**Après modification du code localement:**

```bash
# 1. SSH sur VPS
ssh root@VOTRE_IP_VPS

# 2. Aller dans le projet
cd /var/www/agri-point-ecommerce

# 3. Pull les changements (si Git)
git pull origin main

# 4. Installer nouvelles dépendances
npm install

# 5. Rebuild
npm run build

# 6. Redémarrer PM2
pm2 restart agri-ps

# 7. Vérifier
pm2 logs agri-ps
```

---

## 📊 MONITORING & MAINTENANCE

### BACKUPS AUTOMATIQUES

**Script backup MongoDB:**
```bash
# Créer script
nano /root/backup-mongo.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/root/backups/mongodb"
mkdir -p $BACKUP_DIR

# Backup
mongodump -u agripoint_user -p MotDePasseDatabase456! --db agripoint --out $BACKUP_DIR/$DATE

# Supprimer backups > 7 jours
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
```

```bash
# Rendre exécutable
chmod +x /root/backup-mongo.sh

# Tester
/root/backup-mongo.sh

# Automatiser (tous les jours à 2h)
crontab -e
```

**Ajouter:**
```
0 2 * * * /root/backup-mongo.sh >> /var/log/backup-mongo.log 2>&1
```

---

## 🆘 DÉPANNAGE

### Le site ne charge pas
```bash
# Vérifier PM2
pm2 status
pm2 logs agri-ps

# Vérifier Nginx
systemctl status nginx
nginx -t

# Vérifier MongoDB
systemctl status mongod
```

### Erreur 502 Bad Gateway
```bash
# Next.js probablement arrêté
pm2 restart agri-ps

# Vérifier les logs
pm2 logs agri-ps --lines 100
```

### MongoDB connection refused
```bash
# Vérifier service
systemctl status mongod

# Redémarrer si besoin
systemctl restart mongod

# Tester connexion
mongosh -u agripoint_user -p
```

---

## 💰 COÛTS ESTIMÉS

| Service | Coût |
|---------|------|
| **Hostinger VPS 1** | 4,49€/mois |
| **Domaine .com** | 12€/an |
| **MongoDB Atlas (gratuit)** | 0€ |
| **SSL Let's Encrypt** | 0€ |
| **TOTAL** | **~4,49€/mois** |

**Alternative tout local:**
- VPS + MongoDB sur VPS = **4,49€/mois seulement**

---

## ✅ CHECKLIST FINALE

- [ ] VPS Hostinger commandé
- [ ] Accès SSH fonctionnel
- [ ] Node.js 20 installé
- [ ] MongoDB installé (local ou Atlas)
- [ ] Code déployé
- [ ] Variables .env.local configurées
- [ ] Database seedée
- [ ] Build production réussi
- [ ] Nginx configuré
- [ ] SSL activé (HTTPS)
- [ ] PM2 configuré
- [ ] Firewall activé
- [ ] Backups automatiques
- [ ] Domaine pointé sur IP VPS
- [ ] Site accessible publiquement
- [ ] Test paiement réussi

---

## 🎯 PROCHAINES ÉTAPES

1. **Commander VPS** → 5 minutes
2. **Suivre ce guide** → 2-3 heures
3. **Configurer domaine** → 30 minutes
4. **Tester complet** → 1 heure
5. **Lancer** → 🚀

---

## 📞 SUPPORT

**Problème ?**
- **Hostinger Support:** Live chat 24/7 (excellent)
- **Documentation:** https://support.hostinger.com
- **Community:** https://www.hostinger.com/community

---

## 🎉 FÉLICITATIONS !

Votre site e-commerce professionnel est maintenant en ligne sur **Hostinger VPS** !

**Performance attendue:**
- ⚡ Temps de chargement < 2s
- 📈 Peut gérer 500-1000 visiteurs/jour
- 🔒 Sécurisé avec HTTPS
- 💾 Backups automatiques
- 🚀 Scalable facilement

**Bon lancement ! 🎊**
