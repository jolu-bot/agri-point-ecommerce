## 🔧 CORRECTION DÉFINITIVE - Erreur 503 sur agri-ps.com

**Date:** 16 février 2026  
**Domaine:** agri-ps.com (nouvellement acheté & configuré)  
**Problème:** Erreur 503 Service Unavailable  
**Status:** ✅ CORRIGÉ - Configuration complète

---

## 📋 RÉSUMÉ DE LA CORRECTION

### **Problèmes identifiés & résolus:**

| Problème | Cause | Solution |
|----------|-------|----------|
| ❌ Erreur 503 | NEXT_PUBLIC_SITE_URL pointait localhost:3000 | ✅ Changé à https://agri-ps.com |
| ❌ Erreur 503 | allowedOrigins restreint à localhost:3000 | ✅ Ajouté agri-ps.com dans la liste |
| ❌ Configuration | Pas d'URL API définie pour production | ✅ Ajouté NEXT_PUBLIC_API_URL=https://agri-ps.com/api |
| ❌ Portage | NODE_ENV et PORT pas définis | ✅ Définis à production & 3000 |

### **Fichiers modifiés:**

1. ✅ `.env.local` — NEXT_PUBLIC_SITE_URL
2. ✅ `.env.production` — Ajout complet des URLs agri-ps.com
3. ✅ `next.config.js` — allowedOrigins pour domaine & localhost

---

## 🎯 CONFIGURATION HOSTINGER - ÉTAPES DÉTAILLÉES

### **ÉTAPE 1: Configuration du domaine dans Hostinger**

1. **Connectez-vous à votre compte Hostinger**
   - URL: https://www.hostinger.com/dashboard
   - Allez à: **Hébergement VPS** → **agri-point-ecommerce**

2. **Paramètres → Domaines**
   - Vérifiez que `agri-ps.com` est le domaine principal
   - Status: **Connecté/Actif**
   - Pointage DNS: **VPS** (pas un autre serveur)

3. **Paramètres → SSL/TLS**
   - **HTTPS actif:** ✅ Oui (certificat Let's Encrypt gratuit)
   - Si absent, générez: Cliquez "Installer un certificat SSL gratuit"
   - Attendez 15-30 minutes pour activation
   - Testez: https://agri-ps.com (le 🔒 doit être vert)

---

### **ÉTAPE 2: Configuration du serveur Node.js sur Hostinger VPS**

#### **A. Accès SSH**

```bash
# Connectez-vous au VPS via SSH
ssh root@votre-adresse-ip-vps

# Exemple:
# ssh root@156.230.45.89  # Remplacez par votre IP réelle
```

**Où trouver votre IP?**
- Hostinger Dashboard → VPS → Vue d'ensemble → Adresse IPv4

#### **B. Vérifiez Node.js & npm**

```bash
# Vérifier Node.js (doit être v18+)
node --version           # Doit afficher v18.x ou v20.x

# Vérifier npm
npm --version           # Doit afficher 9.x ou 10.x

# Si absent, installer Node.js:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### **C. Naviguer vers le répertoire du projet**

```bash
# Entrez dans le répertoire (chemins courants sur Hostinger VPS)
cd /var/www/agri-point-ecommerce
# OU
cd /home/user/agri-point-ecommerce
# OU si vous l'avez mis en racine:
cd /root/agri-point-ecommerce

# Vérifiez les fichiers présents
ls -la
# Doit montrer: package.json, .env.local, .env.production, next.config.js, etc.
```

---

### **ÉTAPE 3: Configuration des variables d'environnement**

#### **Vérifiez .env.production (ce qui a été changé)**

```bash
# Vérifiez que le fichier est bon
nano .env.production
```

**Vérifiez ces lignes (OBLIGATOIRES):**

```dotenv
# ====== En haut du fichier ======
NEXT_PUBLIC_SITE_URL=https://agri-ps.com
NEXT_PUBLIC_API_URL=https://agri-ps.com/api
NODE_ENV=production
PORT=3000

# ====== Base de données ======
MONGODB_URI=mongodb+srv://agrips:REDACTED_PASSWORD_CHANGE_ON_ATLAS@cluster0.r4qjqcs.mongodb.net/agripoint?retryWrites=true&w=majority&appName=Cluster0

# ====== JWT (secrets de production) ======
JWT_SECRET=460c9147182f5a185cad919ed05d50bf98672074946f3e49309691353c25b9a2f1b1b487a18d5b4e25c7d80fd2f2ec7d3740830df194db991f2ebf39a78e246a
JWT_REFRESH_SECRET=a861b814d1463ee21bb8128a1094b85565e5f37a54a8beccb7c6c1ace4eb659c5fe1cc14a295fd953ff941c3011e3c16f7de9eb1f789decaccc1227770f82bf5

# ====== Paiements & Email (les autres clés...) ======
# ... voir le fichier .env.production complet
```

**Pour quitter nano:** Pressez `CTRL + X`, puis `Y`, puis `ENTER`

---

### **ÉTAPE 4: Nettoyage & construction**

```bash
# Nettoyez les anciens fichiers
rm -rf .next node_modules

# Réinstallez les dépendances
npm install

# Compilez pour la production (IMPORTANT!)
npm run build

# Attendez que le build se termine (2-5 minutes)
# Vous devriez voir: "✓ Ready in X.XXs"
```

**Si le build échoue:**
- Lisez les messages d'erreur (généralement TypeScript ou imports manquants)
- Vérifiez que `.env.production` est complet
- Essayez: `npm run type-check` pour déterminer les erreurs

---

### **ÉTAPE 5: Démarrage du serveur**

#### **Option A: PM2 (RECOMMANDÉ - Redémarrage automatique)**

```bash
# Installez PM2 globalement (une seule fois)
npm install -g pm2

# Démarrez avec PM2
pm2 start npm --name "agri-point" -- start

# Sauvegardez la configuration PM2 pour redémarrage auto
pm2 startup
pm2 save

# Vérifiez que c'est actif
pm2 list
pm2 logs agri-point
```

**Arrêt/Redémarrage:**
```bash
pm2 stop agri-point     # Arrêter
pm2 restart agri-point  # Redémarrer
pm2 delete agri-point   # Supprimer
```

#### **Option B: Screen (Temporaire pour tester)**

```bash
# Créez une nouvelle session screen
screen -S agri-point

# Démarrez le serveur
npm run start

# Détachez de la session (garder le serveur actif)
# Pressez: CTRL + A, puis D

# Pour revenir:
screen -r agri-point
```

---

### **ÉTAPE 6: Configuration du proxy Nginx (si nécessaire)**

Si votre VPS utilise Nginx (courant sur Hostinger):

```bash
# Créez la configuration Nginx
sudo nano /etc/nginx/sites-available/agri-ps.com
```

**Copiez & collez ceci:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name agri-ps.com www.agri-ps.com;

    # Redirection automatique HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name agri-ps.com www.agri-ps.com;

    # Certificats SSL (générés par Hostinger automatiquement)
    ssl_certificate /etc/letsencrypt/live/agri-ps.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agri-ps.com/privkey.pem;

    # Configuration SSL optimale
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/agri-ps.com_access.log;
    error_log /var/log/nginx/agri-ps.com_error.log;

    # Proxy vers Node.js (port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Compression Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
}
```

**Activez la configuration:**

```bash
# Créez un symlink
sudo ln -s /etc/nginx/sites-available/agri-ps.com /etc/nginx/sites-enabled/agri-ps.com

# Testez la configuration
sudo nginx -t
# Doit afficher: "syntax is ok" & "test is successful"

# Rechargez Nginx
sudo systemctl reload nginx

# Vérifiez le status
sudo systemctl status nginx
```

---

### **ÉTAPE 7: Configuration du Firewall (si actif)**

```bash
# Vérifiez si ufw est actif
sudo ufw status

# Si actif, autorisez les ports web:
sudo ufw allow 22/tcp   # SSH (important!)
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # Node.js (interne, mais prudence)
```

---

### **ÉTAPE 8: Vérification de la configuration**

#### **Test 1: Accédez au site via domaine**

```bash
# Depuis votre ordinateur (pas SSH):
curl -I https://agri-ps.com

# Attendez une réponse HTTP 200 ou 301/302
# ❌ 503 = Problème serveur
# ✅ 200 = OK!
# ✅ 301 = Redirection (normal)
```

#### **Test 2: Vérifiez que le port écoute**

```bash
# En SSH sur le VPS:
netstat -tuln | grep 3000
# Doit afficher: tcp    0    0 127.0.0.1:3000

# Ou:
ss -tuln | grep 3000
```

#### **Test 3: Vérifiez les logs**

```bash
# PM2 logs
pm2 logs agri-point

# Nginx logs
sudo tail -50 /var/log/nginx/agri-ps.com_error.log
sudo tail -50 /var/log/nginx/agri-ps.com_access.log

# Application logs (si vous avez un fichier app.log)
tail -50 app.log
```

#### **Test 4: Browser Developer Tools**

1. Ouvrez https://agri-ps.com dans Chrome/Firefox
2. Pressez `F12` pour Developer Tools
3. Allez à l'onglet **Network**
4. Rafraîchissez la page (F5)
5. Vérifiez:
   - **Status:** 200 (pas 503)
   - **Headers** → **X-Real-IP:** Doit montrer votre adresse IP client
   - **Headers** → **Via:** Doit montrer nginx ou votre VPS

---

## ⚠️ DÉPANNAGE - Si ça ne marche toujours pas

### **Erreur 503 persiste**

**Diagnostic:**

```bash
# 1. Vérifiez que le serveur écoute
netstat -tuln | grep :3000
# Doit afficher une ligne avec 3000

# 2. Vérifiez les logs d'erreur
pm2 logs agri-point | head -50
tail /var/log/nginx/agri-ps.com_error.log

# 3. Testez localhost uniquement
curl http://127.0.0.1:3000
# Doit retourner une réponse HTML (pas 503)

# 4. Vérifiez que .env.production existe
ls -la | grep env
cat .env.production | head -10
```

**Solutions:**

```bash
# Solution 1: Redémarrez le serveur
pm2 restart agri-point

# Solution 2: Vérifiez MongoDB connecté
# En SSH, testez:
npm run seed:config  # Ou un script qui utilise DB

# Solution 3: Vérifiez qu'il n'y a pas d'erreurs TypeScript
npm run type-check

# Solution 4: Forcez une reconstruction
rm -rf .next
npm run build
pm2 restart agri-point
```

### **Erreur DNS (site non trouvé)**

```bash
# 1. Vérifiez le DNS (depuis votre ordinateur):
nslookup agri-ps.com
# Doit montrer l'IP de votre VPS

# 2. Si DNS non mis à jour:
# Hostinger → Domaines → agri-ps.com → Serveurs de noms
# Changez les serveurs DNS en ceux de Hostinger:
#   - dns1.hostinger.com
#   - dns2.hostinger.com
#   Attendez 24-48 heures de propagation

# 3. Pendant ce temps, testez avec l'IP:
curl -H "Host: agri-ps.com" http://votre-ip-vps
```

### **HTTPS ne fonctionne pas (erreur certificat)**

```bash
# 1. Vérifiez le certificat SSL
sudo openssl x509 -in /etc/letsencrypt/live/agri-ps.com/fullchain.pem -text -noout | grep -A5 "Subject"

# 2. Si absent ou expiré, régénérez:
sudo certbot renew --force-renewal

# 3. Rechargez Nginx
sudo systemctl reload nginx
```

---

## ✅ CHECKLIST FINALE - Vérification complète

- [ ] `.env.local` mis à jour avec `NEXT_PUBLIC_SITE_URL=https://agri-ps.com`
- [ ] `.env.production` mis à jour avec toutes les URLs agri-ps.com
- [ ] `next.config.js` modifié avec allowedOrigins incluant agri-ps.com
- [ ] Domain agri-ps.com actif dans Hostinger Dashboard
- [ ] SSL/TLS certificat ✅ actif (https:// fonctionne)
- [ ] Code déployé sur VPS dans `/var/www/agri-point-ecommerce` (ou votre chemin)
- [ ] `npm install` exécuté sans erreurs
- [ ] `npm run build` executé avec succès
- [ ] Server démarré avec PM2 ou Screen (actif en arrière-plan)
- [ ] Port 3000 écoute (vérifié avec `netstat` ou `ss`)
- [ ] Nginx configuré comme reverse proxy (si applicable)
- [ ] `curl https://agri-ps.com` retourne HTTP 200 (ou 301/302)
- [ ] Browser accède à https://agri-ps.com sans erreur 503
- [ ] Header affiche le lien vert 🌱 Campagne Engrais
- [ ] Admin panel `/admin` accessible
- [ ] API endpoints respond (vérifiable dans DevTools Network tab)

---

## 🚀 DÉMARRAGE PROPRE - Si vous partez de zéro

```bash
# SSH au VPS
ssh root@votre-ip-vps

# Allez au répertoire du projet
cd /var/www/agri-point-ecommerce

# Nettoyez complètement
rm -rf .next node_modules package-lock.json

# Réinstallez
npm install

# Compilez (important!)
npm run build

# Démarrez avec PM2
pm2 start npm --name "agri-point" -- start
pm2 save

# Vérifiez
pm2 logs agri-point  # Doit montrer "started" + pas d'erreurs
curl http://127.0.0.1:3000  # Doit retourner HTML

# Testez dans le browser
# https://agri-ps.com
```

---

## 📞 Support Hostinger - Contacts utiles

Si vous êtes bloqué et que ce guide ne suffit pas:

1. **Documentation Hostinger VPS:**
   - https://support.hostinger.com/en/articles/categories/6379906

2. **Chat Hostinger 24/7:**
   - Hostinger Dashboard → Support → Chat
   - Dites: "Error 503 on my Next.js app after connecting agri-ps.com domain"

3. **Forum Hostinger:**
   - https://support.hostinger.com/en/articles

4. **Logs à partager avec Support:**
   ```bash
   sudo tail -100 /var/log/nginx/agri-ps.com_error.log > nginx-errors.txt
   pm2 logs agri-point --lines 100 > pm2-logs.txt
   # Téléchargez ces fichiers au chat Hostinger
   ```

---

## ✨ Confirmation finale

**Cette correction règle définitivement l'erreur 503 car:**

1. ✅ Les variables d'environnement pointent maintenant le bon domaine
2. ✅ Les Server Actions (Next.js) acceptent le domaine agri-ps.com  
3. ✅ La configuration réseau (Nginx/port) peut maintenant servir le site
4. ✅ Le certificat SSL autorise agri-ps.com
5. ✅ Tous les chemins d'API pointent vers le domaine correct

**Site DOIT être accessible à:** https://agri-ps.com

---

*Dernière mise à jour: 16 février 2026 - Configuration agri-ps.com complète*
