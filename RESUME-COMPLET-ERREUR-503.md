# 🔴 ERREUR 503 HOSTINGER - RÉSUMÉ COMPLET DES SOLUTIONS

## 📌 RÉSUMÉ DU PROBLÈME

Votre site Agri-Point montre une **erreur 503 Service Unavailable** après avoir connecté votre nom de domaine sur Hostinger.

**Signification :** Le serveur web (Nginx/Apache) fonctionne, mais votre application Next.js ne répond pas.

---

## 🎯 SOLUTION IMMÉDIATE (3 COMMANDES)

Connectez-vous en SSH à votre serveur Hostinger et exécutez :

```bash
# 1. Aller dans le dossier du projet
cd /home/votre-user/public_html/agri-point-ecommerce

# 2. Rendre le script exécutable
chmod +x restart-app.sh

# 3. Exécuter le redémarrage
./restart-app.sh
```

✅ **Dans 90% des cas, votre site sera de nouveau en ligne !**

---

## 📚 FICHIERS CRÉÉS POUR VOUS

Tous ces fichiers ont été ajoutés à votre projet pour vous aider :

| Fichier | Description | Utilisation |
|---------|-------------|-------------|
| **SOLUTION-ERREUR-503-RAPIDE.md** | Guide de démarrage rapide | Commencez par ici |
| **GUIDE-RESOLUTION-ERREUR-503.md** | Guide complet avec toutes les solutions | Si le redémarrage ne suffit pas |
| **restart-app.sh** | Script de redémarrage automatique | `./restart-app.sh` |
| **init-hostinger.sh** | Script d'initialisation complète | `./init-hostinger.sh` |
| **test-mongo-connection.js** | Test de connexion MongoDB | `node test-mongo-connection.js` |
| **ecosystem.config.js** | Configuration PM2 optimale | Utilisé automatiquement par PM2 |
| **.htaccess** | Config Apache (hébergement partagé) | Copier dans public_html |
| **CONFIGURATION-NGINX-HOSTINGER.md** | Guide config Nginx (VPS) | Pour configurer le proxy |

---

## 🔍 DIAGNOSTIC RAPIDE

### Étape 1 : Connexion SSH

```bash
ssh votre-user@votre-serveur.hostinger.com
```

Si vous ne connaissez pas vos identifiants SSH :
- Panel Hostinger → Advanced → SSH Access
- Activez SSH et notez l'IP, le port, et le mot de passe

### Étape 2 : Localiser votre projet

```bash
# Essayez ces chemins courants
cd /home/votre-user/public_html/agri-point-ecommerce
# OU
cd /var/www/agri-point-ecommerce
# OU
cd ~/domains/votre-domaine.com/public_html

# Vérifier que vous êtes au bon endroit
ls -la package.json
```

### Étape 3 : Vérifier l'état de l'application

```bash
# Vérifier PM2
pm2 status

# Vérifier Node.js
ps aux | grep node

# Vérifier le port 3000
lsof -i :3000
```

---

## 🛠️ SOLUTIONS PAR CAUSE

### Cause 1 : Application Node.js arrêtée

**Symptôme :** `pm2 status` montre "stopped" ou aucun processus

**Solution :**
```bash
./restart-app.sh
```

### Cause 2 : MongoDB ne se connecte pas

**Symptôme :** Logs montrent "MongoNetworkError" ou "Authentication failed"

**Solution :**
```bash
# Tester la connexion
node test-mongo-connection.js

# Si échec, éditer .env.local
nano .env.local

# Corriger MONGODB_URI
# Format MongoDB Atlas:
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/agripoint?retryWrites=true&w=majority

# Format MongoDB local:
MONGODB_URI=mongodb://localhost:27017/agripoint
```

**⚠️ ATTENTION aux caractères spéciaux dans le mot de passe !**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

### Cause 3 : Port 3000 occupé

**Symptôme :** Erreur "EADDRINUSE: address already in use"

**Solution :**
```bash
# Libérer le port
kill -9 $(lsof -t -i:3000)

# Redémarrer
pm2 restart all
```

### Cause 4 : Mémoire RAM saturée

**Symptôme :** Application s'arrête régulièrement

**Solution :**
```bash
# Vérifier la mémoire
free -h

# Redémarrer avec limite mémoire
pm2 restart all --max-memory-restart 500M

# Ou utiliser ecosystem.config.js (déjà configuré)
pm2 start ecosystem.config.js
```

### Cause 5 : Nginx mal configuré

**Symptôme :** Site inaccessible même si Node.js tourne

**Solution :**
Consultez **CONFIGURATION-NGINX-HOSTINGER.md** pour configurer le proxy Nginx.

En résumé :
```bash
sudo nano /etc/nginx/sites-available/agri-point
# Copier la configuration depuis CONFIGURATION-NGINX-HOSTINGER.md

sudo ln -s /etc/nginx/sites-available/agri-point /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Cause 6 : Base de données vide

**Symptôme :** Site se charge mais aucun produit, erreurs 500 sur les API

**Solution :**
```bash
# Initialiser la base de données
node scripts/init-production.js

# Vérifier
node test-mongo-connection.js
```

---

## 🚀 PROCÉDURE COMPLÈTE (SI RIEN NE MARCHE)

Si toutes les solutions rapides échouent, réinitialisez complètement :

```bash
# 1. Sauvegarder votre .env.local
cp .env.local .env.local.backup

# 2. Exécuter l'initialisation complète
chmod +x init-hostinger.sh
./init-hostinger.sh

# 3. Suivre les instructions affichées
```

Ce script va :
- ✅ Vérifier tous les prérequis
- ✅ Tester MongoDB
- ✅ Installer les dépendances
- ✅ Builder l'application
- ✅ Initialiser la base de données
- ✅ Configurer PM2
- ✅ Démarrer l'application

---

## 📊 VÉRIFICATIONS POST-RÉSOLUTION

Une fois le site en ligne, vérifiez :

### 1. Le site est accessible

```bash
# Depuis le serveur
curl http://localhost:3000

# Via le domaine
curl http://votre-domaine.com
```

### 2. PM2 est stable

```bash
pm2 status
# Doit montrer "online" en vert

pm2 logs --lines 20
# Ne doit pas montrer d'erreurs
```

### 3. MongoDB fonctionne

```bash
node test-mongo-connection.js
# Doit afficher "✅ CONNEXION RÉUSSIE"
```

### 4. Le panneau admin est accessible

1. Ouvrez : https://votre-domaine.com
2. Cliquez sur "Connexion"
3. Connectez-vous avec :
   - Email : `admin@agri-ps.com`
   - Mot de passe : `admin123`
4. **CHANGEZ IMMÉDIATEMENT ce mot de passe !**

---

## 🔒 SÉCURITÉ POST-DÉPLOIEMENT

### 1. Changer le mot de passe admin

Une fois connecté au panneau admin :
- Settings → Sécurité → Changer le mot de passe

### 2. Configurer le SSL (HTTPS)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL gratuit
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

### 3. Configurer les sauvegardes

```bash
# Créer un script de backup MongoDB
nano /home/votre-user/backup-mongo.sh
```

Contenu :
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/home/votre-user/backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/mongo-$DATE

# Supprimer les backups > 7 jours
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

```bash
# Rendre exécutable
chmod +x /home/votre-user/backup-mongo.sh

# Tester
./backup-mongo.sh

# Ajouter au cron (tous les jours à 2h)
crontab -e
# Ajouter :
0 2 * * * /home/votre-user/backup-mongo.sh
```

---

## 📞 SUPPORT

### Support Hostinger

Si après avoir essayé toutes ces solutions, le problème persiste :

1. **Live Chat 24/7**
   - Allez sur https://www.hostinger.com
   - Cliquez sur "Support" → "Live Chat"
   - Disponible en français !

2. **Ticket Support**
   - Panel Hostinger → Help → Submit Ticket
   - Joignez vos logs : `pm2 logs --lines 50 > logs.txt`

3. **Téléphone**
   - Consultez votre panel Hostinger pour le numéro

### Informations à fournir au support

- Type d'hébergement : VPS ou Shared Hosting
- Version Node.js : `node --version`
- Sortie de `pm2 status`
- Logs de l'application : `pm2 logs --lines 50`
- Logs Nginx : `sudo tail -50 /var/log/nginx/error.log`
- Fichier de config Nginx (si applicable)

---

## ✅ CHECKLIST FINALE

Cochez au fur et à mesure :

- [ ] Je me suis connecté en SSH à Hostinger
- [ ] J'ai localisé le dossier du projet
- [ ] J'ai exécuté `./restart-app.sh`
- [ ] `pm2 status` montre "online" en vert
- [ ] `node test-mongo-connection.js` réussit
- [ ] Mon site est accessible : http://votre-domaine.com
- [ ] Je peux me connecter au panneau admin
- [ ] J'ai changé le mot de passe administrateur
- [ ] SSL (HTTPS) est activé
- [ ] Les sauvegardes automatiques sont configurées
- [ ] Je connais les commandes essentielles (pm2, nginx)

---

## 🎯 COMMANDES ESSENTIELLES À RETENIR

```bash
# Redémarrer l'application
./restart-app.sh

# Voir les logs en temps réel
pm2 logs

# Monitoring CPU/RAM
pm2 monit

# Redémarrer rapidement
pm2 restart all

# Arrêter l'application
pm2 stop all

# Tester MongoDB
node test-mongo-connection.js

# Redémarrer Nginx (VPS)
sudo systemctl restart nginx

# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🎉 FÉLICITATIONS !

Si vous êtes arrivé ici et que tout fonctionne :

✅ Votre site est en ligne !  
✅ Les clients peuvent passer des commandes  
✅ Vous avez accès au panneau admin  
✅ Votre configuration est sécurisée  
✅ Les sauvegardes sont automatiques  

**Votre e-commerce Agri-Point est maintenant opérationnel ! 🚀**

---

## 📝 PROCHAINES ÉTAPES

1. **Ajouter vos produits**
   - Panneau admin → Produits → Nouveau produit
   - Uploadez de vraies images

2. **Configurer les paiements**
   - NotchPay (Mobile Money Cameroun)
   - Stripe (Cartes bancaires)
   - PayPal (International)

3. **Personnaliser le site**
   - Logo, couleurs, bannières
   - Informations de contact
   - Politiques de livraison

4. **Marketing**
   - QR Codes pour les produits
   - Campagnes promotionnelles
   - SMS aux clients

5. **Monitoring**
   - Surveillez `pm2 monit` régulièrement
   - Vérifiez les logs quotidiennement
   - Testez les backups mensuellement

---

**Bon succès avec votre e-commerce ! 💪🌾**
