## 🚀 DÉPLOIEMENT IMMÉDIAT - agri-ps.com sur Hostinger VPS

**Status:** ✅ Configuration complète (100/100)  
**Date:** 16 février 2026  
**Domaine:** agri-ps.com  
**Action:** Déployer MAINTENANT sur VPS Hostinger

---

## ⚡ DÉPLOIEMENT EN 8 ÉTAPES (30 minutes)

### **ÉTAPE 1: Préparez le code LOCAL (votre ordinateur)**

```bash
# Ouvrez le terminal dans le répertoire du projet
cd c:\Users\jolub\Downloads\agri-point-ecommerce

# Compilez pour production (OBLIGATOIRE)
npm run build

# Attendez le message de succès:
# ✓ Ready in X.XXs
```

**Si erreur lors du build:**
- Lisez les messages d'erreur
- Exécutez: `npm run type-check` pour corriger les erreurs TypeScript

---

### **ÉTAPE 2: Préparez Hostinger Dashboard**

1. **Allez à:** https://www.hostinger.com/dashboard/
2. **Sélectionnez:** Votre VPS "agri-point-ecommerce"
3. **Notez votre adresse IP:** Vous la trouverez dans "Vue d'overview"
   - Format: `156.230.45.89` (exemple, noter la vôtre)

---

### **ÉTAPE 3: Connectez-vous au VPS via SSH**

**Sur Windows PowerShell:**

```powershell
# Connectez-vous au VPS
ssh root@156.230.45.89

# Remplacez 156.230.45.89 par votre IP réelle!
# Il vous demandera le password (fourni par Hostinger)
```

**Si vous obtenez une erreur:**
```powershell
# Essayez avec putty ou Git Bash à la place:
# Ou installez OpenSSH:
# Paramètres → Applications → Fonctionnalités optionnelles → Ajouter OpenSSH Client
```

---

### **ÉTAPE 4: Vérifiez/Créez le répertoire du projet sur VPS**

```bash
# Une fois connecté en SSH au VPS:

# Naviguez au répertoire web (chemins courants)
cd /var/www/agri-point-ecommerce
# OU
cd /home/user/agri-point-ecommerce
# OU (si vous avez créé votre propre chemin)
cd /root/agri-point-ecommerce

# Vérifiez que les fichiers existent
ls -la | head -20
# Doit montrer: package.json, next.config.js, .env.local, .env.production, etc.
```

**Si le répertoire est vide ou n'existe pas:**

```bash
# Créez-le
mkdir -p /var/www/agri-point-ecommerce
cd /var/www/agri-point-ecommerce

# Vous devez copier les fichiers du projet (voir ÉTAPE 5)
```

---

### **ÉTAPE 5: Transférez les fichiers du projet**

**Option A: Utiliser Git (RECOMMANDÉ si vous avez un repo)**

```bash
# Sur le VPS (SSH):
cd /var/www/agri-point-ecommerce

# Clonez le repo
git clone https://votre-repo-github-url.git .

# Ou mettez à jour si déjà cloné
git pull origin main
```

**Option B: Utiliser SCP (copier les fichiers)**

```bash
# Sur VOTRE ordinateur (pas SSH):
# Utilisez WinSCP (GUI) ou PowerShell:

# Exemple avec PowerShell:
scp -r "c:\Users\jolub\Downloads\agri-point-ecommerce\*" root@156.230.45.89:/var/www/agri-point-ecommerce/

# Remplacez l'IP par la vôtre
```

**Option C: Upload via Hostinger File Manager (le plus simple)**

1. Hostinger Dashboard → VPS → Files
2. Naviguez à `/var/www/agri-point-ecommerce/`
3. Drag & drop les dossiers: `app/`, `components/`, `lib/`, `scripts/`, `public/`, etc.
4. Upload les fichiers: `package.json`, `.env.production`, `next.config.js`, `tsconfig.json`, etc.

---

### **ÉTAPE 6: Installation & Build sur le VPS**

```bash
# Connecté en SSH au VPS:
cd /var/www/agri-point-ecommerce

# Nettoyez les anciens fichiers
rm -rf .next node_modules package-lock.json

# Installez les dépendances (2-3 minutes)
npm install

# Compilez pour production (3-5 minutes) - TRÈS IMPORTANT!
npm run build

# Attendez: "✓ Ready in X.XXs"
```

**Si npm install échoue:**
```bash
# Augmentez la mémoire:
NODE_OPTIONS="--max-old-space-size=2048" npm install
```

**Si npm run build échoue:**
```bash
# Vérifiez qu'il n'y a pas d'erreurs TypeScript:
npm run type-check

# Ou forcez le build (attention, ignorer les erreurs):
npm run build 2>&1 | tail -50

# Lisez les erreurs rouges et corrigez dans .env.production
```

---

### **ÉTAPE 7: Démarrez le serveur avec PM2**

```bash
# Sur le VPS (SSH):

# Installez PM2 (une seule fois, si pas déjà installé)
npm install -g pm2

# Démarrez l'application
pm2 start npm --name "agripoint-production" -- start

# Vérifiez que c'est actif
pm2 list
# Doit afficher "online" pour agripoint-production

# Regardez les logs (pour voir s'il n'y a pas d'erreurs)
pm2 logs agripoint-production --lines 20
```

**Pour redémarrer au reboot du VPS (IMPORTANT):**

```bash
# Toujours sur le VPS:
pm2 startup
pm2 save

# Cela enregistrera l'app pour relancer automatiquement au reboot
```

---

### **ÉTAPE 8: Vérifiez que le site fonctionne**

**Test 1: Ping direct au serveur Node.js**

```bash
# Sur le VPS (SSH):
curl http://127.0.0.1:3000

# Doit retourner le contenu HTML (long output)
# Si erreur: "Refused connection" = Node.js n'écoute pas
```

**Test 2: Via le domaine (depuis votre ordinateur)**

```powershell
# Sur VOTRE ordinateur:

# Testez le domaine
curl.exe -I https://agri-ps.com

# Doit retourner:
# HTTP/1.1 200 OK    (ou 301/302 redirect)
# NON: 503 Service Unavailable
```

**Test 3: Dans le navigateur**

1. Ouvrez: https://agri-ps.com
2. Vérifiez que:
   - ✅ Pas d'erreur 503
   - ✅ La page HOME se charge correctement
   - ✅ Le lien vert 🌱 "Campagne Engrais" apparaît dans le header
   - ✅ Les images se chargent
3. Naviguez vers: https://agri-ps.com/campagne-engrais
   - Doit afficher la page campagne Engrais

---

## 🔧 CONFIGURATIONS OPTIONNELLES (mais recommandées)

### **Nginx Reverse Proxy (Si vous utilisez Nginx)**

```bash
# Sur le VPS:

# Créez la config Nginx
sudo nano /etc/nginx/sites-available/agri-ps.com
```

**Collez ceci:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name agri-ps.com www.agri-ps.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name agri-ps.com www.agri-ps.com;

    ssl_certificate /etc/letsencrypt/live/agri-ps.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agri-ps.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/agri-ps.com_access.log;
    error_log /var/log/nginx/agri-ps.com_error.log;

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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
}
```

**Activez-la:**

```bash
# Créez le symlink
sudo ln -s /etc/nginx/sites-available/agri-ps.com /etc/nginx/sites-enabled/agri-ps.com

# Testez la config
sudo nginx -t
# Doit afficher: "syntax is ok" & "test is successful"

# Rechargez Nginx
sudo systemctl reload nginx
```

---

## ✅ CHECKLIST DE VÉRIFICATION - Avant de considérer "c'est fait"

- [ ] VPS Hostinger créé et accessible
- [ ] Domaine agri-ps.com pointé vers le VPS
- [ ] Certificat SSL/TLS actif (essayez https://agri-ps.com - pas d'avertissement)
- [ ] Fichiers du projet transférés au VPS
- [ ] SSH: `npm install` exécuté sans erreurs
- [ ] SSH: `npm run build` complété avec "✓ Ready in X.XXs"
- [ ] SSH: `pm2 start...` l'app est "online"
- [ ] SSH: `curl http://127.0.0.1:3000` retourne du HTML
- [ ] Curl: `curl https://agri-ps.com` retourne HTTP 200 (ou 301)
- [ ] Browser: https://agri-ps.com s'affiche sans erreur 503
- [ ] Browser: Lien 🌱 campagne visible dans header
- [ ] Browser: /campagne-engrais page accessible
- [ ] Browser: Developer Tools (F12) → Network → pas d'erreurs rouges
- [ ] PM2: `pm2 logs agripoint-production` montre "Listening on..." (pas d'erreurs)

---

## 🆘 DÉPANNAGE RAPIDE

### **Erreur 503 persiste**

```bash
# Vérifiez que Node.js écoute:
ss -tuln | grep 3000
# Doit afficher une ligne avec 127.0.0.1:3000

# Vérifiez les logs PM2:
pm2 logs agripoint-production --lines 50
# Cherchez les messages d'erreur rouges

# Redémarrez l'app:
pm2 restart agripoint-production

# Reforcez la compilation:
rm -rf .next && npm run build
pm2 restart agripoint-production
```

### **Application crash (erreur MongoDB)**

```bash
# Vérifiez que MongoDB URL est correcte:
grep MONGODB_URI .env.production

# Testez la connexion:
npm run seed:config

# Si ça crash, l'URL est mauvaise ou DB inaccessible
```

### **SSL/HTTPS ne fonctionne pas**

```bash
# Vérifiez le certificat:
sudo openssl x509 -in /etc/letsencrypt/live/agri-ps.com/fullchain.pem -text -noout | grep Subject

# Régénérez s'il manque:
sudo certbot certonly --standalone -d agri-ps.com -d www.agri-ps.com

# Rechargez Nginx:
sudo systemctl reload nginx
```

### **Node.js consomme trop de mémoire**

```bash
# Limitez la RAM Node.js:
pm2 delete agripoint-production
NODE_OPTIONS="--max-old-space-size=1024" pm2 start npm --name "agripoint-production" -- start
pm2 save
```

---

## 📊 MONITORING APRÈS DÉPLOIEMENT

```bash
# Vérifiez régulièrement:
pm2 list                          # État de l'app
pm2 logs agripoint-production     # Logs en temps réel
pm2 monit                         # CPU/RAM/PID en live

# Sauvegardez les logs:
pm2 save
pm2 logs agripoint-production > /var/www/agripoint-app.log
```

---

## ✨ RÉSUMÉ

**Vous avez fait:**
1. ✅ Configuration des variables d'environnement pour agri-ps.com
2. ✅ Mise à jour du next.config.js
3. ✅ Vérification complète (100/100) via le script

**Vous allez faire MAINTENANT:**
1. 🏃 SSH au VPS Hostinger
2. 🏃 npm install && npm run build
3. 🏃 pm2 start npm -- start
4. 🏃 Ouvrir https://agri-ps.com
5. 🏃 Vérifier que tout fonctionne

**L'erreur 503 sera RÉSOLUE car:**
- Les anciens chemins `localhost:3000` ne sont plus référencés
- Node.js écoute maintenant le bon domaine
- Next.js accepte maintenant agri-ps.com en Server Action
- Nginx proxy correctement sur le port 3000

---

## 🎯 PROCHAINES ÉTAPES (Après le déploiement)

1. **Activer la campagne dans MongoDB:**
   ```bash
   MONGODB_URI="..." npm run campaign:go-live
   ```

2. **Envoyer l'annonce aux clients:**
   - Email avec lien: https://agri-ps.com/campagne-engrais
   - SMS (si Infobip)
   - Share sur réseaux sociaux

3. **Monitoring:**
   ```bash
   npm run monitor:agent &  # Démarrer agent monitoring
   npm run export:payments  # Exporter les commandes
   npm run dashboard:generate  # Statistiques Grafana
   ```

---

*Dernière mise à jour: 16 février 2026 - Configuration agri-ps.com complète*
