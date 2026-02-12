# 🚀 Déploiement Rapide - Hostinger (Checklist Finale)

## Phase 2: Déploiement

### 2.1: Variables d'Environnement Hostinger

```bash
# SSH vers Hostinger VPS
ssh root@[HOSTINGER_IP]

# Créer .env.local
nano /home/agripoint/.env.local
```

**Contenu à ajouter:**
```env
# Production
NODE_ENV=production
NEXTAUTH_URL=https://votre-domaine.cm
NEXTAUTH_SECRET=[générer avec: openssl rand -base64 32]

# MongoDB Atlas
MONGODB_URI=mongodb+srv://[user]:[pass]@cluster.mongodb.net/agripoint?retryWrites=true&w=majority

# Admin
ADMIN_EMAIL=admin@votre-domaine.cm

# Domaine
DOMAIN=votre-domaine.cm
```

### 2.2: MongoDB Atlas Vérification

```bash
# Tester connexion
mongo "mongodb+srv://..." --eval "db.version()"

# Checker les données
mongo "mongodb+srv://..." --eval "use agripoint; db.campaigns.findOne()"
```

**Expected output:**
```
✓ MongoDB 4.4.x ou plus récent
✓ Database 'agripoint' existe
✓ Collection 'campaigns' contient le document
```

### 2.3: Configuration Nginx + Reverse Proxy

**Créer `/etc/nginx/conf.d/agripoint.conf`:**
```nginx
upstream agripoint {
  server 127.0.0.1:3000 max_fails=5 fail_timeout=30s;
}

server {
  listen 80;
  server_name votre-domaine.cm www.votre-domaine.cm;
  client_max_body_size 50M;

  location / {
    proxy_pass http://agripoint;
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

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css text/javascript application/json;
  gzip_min_length 1000;
}
```

**Tester et activer:**
```bash
nginx -t
systemctl restart nginx
```

### 2.4: SSL/HTTPS avec Let's Encrypt

```bash
# Installer Certbot
apt-get update
apt-get install certbot python3-certbot-nginx

# Créer certificat (auto-HTTPS redirect)
certbot --nginx -d votre-domaine.cm -d www.votre-domaine.cm

# Test renouvellement auto
certbot renew --dry-run

# Vérifier certificat
openssl s_client -connect votre-domaine.cm:443
```

### 2.5: PM2 Setup + Auto-Restart

```bash
# Installer PM2 globally
npm install -g pm2

# Aller au répertoire app
cd /home/agripoint

# Démarrer application
pm2 start npm --name "agripoint" -- start
pm2 logs agripoint --lines 20

# Sauvegarder configuration
pm2 save

# Configurer startup au boot
pm2 startup
# (Copier-coller la commande affichée)
```

**Vérifier:**
```bash
pm2 status
pm2 info agripoint
```

---

## Checklist Déploiement

- [ ] **Variables d'env** configurées (.env.local)
- [ ] **MongoDB** connexion testée et données vérifiées
- [ ] **Nginx** proxy configuré et compilé (nginx -t OK)
- [ ] **SSL** certificat Let's Encrypt installé ✅
- [ ] **PM2** démarré et auto-startup configuré
- [ ] **Build** `npm run build` complété
- [ ] **DNS** pointe vers Hostinger IP
- [ ] **Page accueil** accessible: https://votre-domaine.cm ✅
- [ ] **Campagne page** accessible: https://votre-domaine.cm/campagne-engrais ✅
- [ ] **Admin dashboard** accessible: https://votre-domaine.cm/admin/campaigns ✅
- [ ] **Logs** PM2 montrent pas d'erreurs

---

## Troubleshooting Déploiement

| Problème | Solution |
|----------|----------|
| `ECONNREFUSED MongoDB` | Vérifier MONGODB_URI, tester `mongo` CLI |
| `Cannot find module found` | Exécuter `npm ci --production` |
| `502 Bad Gateway` | Vérifier PM2 prêt: `pm2 logs agripoint` |
| `SSL certificate error` | Re-run certbot: `certbot --nginx -d domaine.cm` |
| `Port 3000 already in use` | `lsof -i :3000 ; kill -9 [PID]` |
| `Nginx won't start` | Tester: `nginx -t ; sysctl reload nginx` |

---

**Status:** Opérationnel
**Prêt pour production:** ✅ OUI

