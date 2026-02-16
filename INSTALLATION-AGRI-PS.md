# 🚀 INSTALLATION RAPIDE - AGRI-PS.COM

## ✅ Configuration complète pour le domaine agri-ps.com

Ce guide vous permet de mettre en ligne votre site sur **agri-ps.com** en quelques minutes.

---

## 📋 PRÉREQUIS

- ✅ Domaine agri-ps.com pointé vers votre serveur Hostinger
- ✅ Accès SSH à votre serveur
- ✅ Node.js 18+ installé
- ✅ PM2 installé (ou sera installé automatiquement)

---

## ⚡ INSTALLATION AUTOMATIQUE (5 MINUTES)

### Étape 1 : Connectez-vous en SSH

```bash
ssh votre-user@votre-serveur.hostinger.com
```

### Étape 2 : Allez dans le dossier du projet

```bash
cd /home/votre-user/public_html/agri-point-ecommerce
# OU selon votre installation
cd /var/www/agri-point-ecommerce
```

### Étape 3 : Créez le fichier .env.local

```bash
# Copier le template agri-ps.com
cp .env.local.agri-ps .env.local

# Ou créer manuellement
nano .env.local
```

**Contenu minimal requis :**

```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://agrips:sMCoHcL2Xg7rtnOU@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0

# JWT Secrets
JWT_SECRET=460c9147182f5a185cad919ed05d50bf98672074946f3e49309691353c25b9a2f1b1b487a18d5b4e25c7d80fd2f2ec7d3740830df194db991f2ebf39a78e246a
JWT_REFRESH_SECRET=a861b814d1463ee21bb8128a1094b85565e5f37a54a8beccb7c6c1ace4eb659c5fe1cc14a295fd953ff941c3011e3c16f7de9eb1f789decaccc1227770f82bf5

# URL du site
NEXT_PUBLIC_SITE_URL=https://agri-ps.com

# Environnement
NODE_ENV=production

# Admin
ADMIN_EMAIL=admin@agri-ps.com
ADMIN_PASSWORD=Admin2024!Secure
```

Sauvegardez : Ctrl+O, Enter, Ctrl+X

### Étape 4 : Exécutez l'initialisation automatique

```bash
bash init-hostinger.sh
```

Ce script va automatiquement :
- ✅ Vérifier Node.js et npm
- ✅ Installer les dépendances
- ✅ Tester MongoDB
- ✅ Builder l'application
- ✅ Initialiser la base de données
- ✅ Configurer et démarrer PM2
- ✅ Vérifier que tout fonctionne

### Étape 5 : Configurez Nginx (VPS uniquement)

Si vous avez un VPS avec accès root :

```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/agri-ps

# Copier le contenu de nginx-agri-ps.conf
# (disponible dans le projet)

# Activer le site
sudo ln -s /etc/nginx/sites-available/agri-ps /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Étape 6 : Installer SSL (HTTPS)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL pour agri-ps.com
sudo certbot --nginx -d agri-ps.com -d www.agri-ps.com
```

✅ **C'est tout ! Votre site est maintenant en ligne !**

---

## 🌐 TESTER VOTRE SITE

Ouvrez votre navigateur et allez sur :

**https://agri-ps.com**

Vous devriez voir la page d'accueil de votre e-commerce !

---

## 🔐 CONNEXION AU PANNEAU ADMIN

1. Allez sur : **https://agri-ps.com**
2. Cliquez sur "Connexion" (en haut à droite)
3. Utilisez les identifiants :
   - **Email :** admin@agri-ps.com
   - **Mot de passe :** Admin2024!Secure
4. **⚠️ CHANGEZ CE MOT DE PASSE immédiatement !**

---

## 🔧 SI VOUS AVEZ UN PROBLÈME

### Le site affiche "503 Service Unavailable"

```bash
# Redémarrer l'application
bash restart-app.sh

# Vérifier PM2
pm2 status

# Voir les logs
pm2 logs
```

### Erreur de connexion MongoDB

```bash
# Tester la connexion
node test-mongo-connection.js

# Si échec, vérifiez .env.local
nano .env.local
# Vérifiez que MONGODB_URI est correct
```

### Le domaine ne pointe pas vers le serveur

1. Allez dans votre panel de gestion de domaine
2. Configurez les DNS :
   - Type A : agri-ps.com → IP_DE_VOTRE_SERVEUR
   - Type A : www.agri-ps.com → IP_DE_VOTRE_SERVEUR
3. Attendez 15-30 minutes pour la propagation DNS

---

## 📊 VÉRIFICATIONS

Cochez au fur et à mesure :

- [ ] SSH fonctionne
- [ ] Dossier du projet localisé
- [ ] Fichier .env.local créé avec les bonnes valeurs
- [ ] MongoDB se connecte (`node test-mongo-connection.js`)
- [ ] Application buildée (`npm run build`)
- [ ] PM2 lance l'application (`pm2 status` → "online")
- [ ] Port 3000 utilisé par Node.js (`lsof -i :3000`)
- [ ] Nginx configuré (VPS) et redémarré
- [ ] SSL installé (HTTPS fonctionne)
- [ ] Site accessible : https://agri-ps.com
- [ ] Connexion admin fonctionne
- [ ] Mot de passe admin changé

---

## 🎯 CONFIGURATION DNS

Dans votre gestionnaire de domaine (ex: Hostinger Domain Manager) :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ | IP_DE_VOTRE_SERVEUR | 3600 |
| A | www | IP_DE_VOTRE_SERVEUR | 3600 |

**Obtenir l'IP de votre serveur :**
```bash
curl ifconfig.me
```

---

## 📝 FICHIERS IMPORTANTS

| Fichier | Description |
|---------|-------------|
| `.env.local.agri-ps` | Template de configuration pour agri-ps.com |
| `nginx-agri-ps.conf` | Configuration Nginx pour agri-ps.com |
| `restart-app.sh` | Script de redémarrage |
| `init-hostinger.sh` | Script d'initialisation complète |
| `test-mongo-connection.js` | Test de connexion MongoDB |

---

## 🎉 APRÈS L'INSTALLATION

1. ✅ Changez le mot de passe admin
2. ✅ Configurez les paiements (Stripe, PayPal)
3. ✅ Ajoutez vos produits
4. ✅ Configurez les emails (SMTP)
5. ✅ Testez une commande de bout en bout
6. ✅ Configurez les sauvegardes automatiques

---

## 📞 SUPPORT

**Besoin d'aide ?**

1. Consultez les guides :
   - README-ERREUR-503.md
   - GUIDE-RESOLUTION-ERREUR-503.md
   - CONFIGURATION-NGINX-HOSTINGER.md

2. Support Hostinger :
   - Live Chat 24/7 : https://www.hostinger.com
   - Ticket : Panel Hostinger → Support

3. Logs à consulter :
   ```bash
   pm2 logs
   sudo tail -50 /var/log/nginx/error.log
   ```

---

## ✅ CHECKLIST FINALE

Avant de mettre en production :

- [ ] Le site https://agri-ps.com fonctionne
- [ ] Le SSL (HTTPS) est actif et valide
- [ ] La connexion admin fonctionne
- [ ] MongoDB est connecté et contient des données
- [ ] PM2 auto-start est configuré (`pm2 startup`)
- [ ] Les sauvegardes sont configurées
- [ ] Les paiements de test fonctionnent
- [ ] Les emails de test sont reçus
- [ ] Le site est responsive (mobile/tablette)
- [ ] Les performances sont bonnes (Lighthouse > 80)

---

**🎉 Félicitations ! Votre e-commerce AGRI POINT SERVICE est maintenant en ligne sur agri-ps.com ! 🚀**

---

_Configuration pour : agri-ps.com_  
_Dernière mise à jour : Février 2026_
