# 🌐 CONFIGURATION NGINX POUR HOSTINGER

## 📋 Configuration Nginx recommandée pour Next.js sur Hostinger

Ce guide vous aide à configurer Nginx pour qu'il fonctionne avec votre application Next.js.

---

## 🔍 Localisation des fichiers de configuration Nginx

Sur Hostinger, les fichiers de configuration se trouvent généralement ici :

```bash
# Configurations des sites
/etc/nginx/sites-available/
/etc/nginx/sites-enabled/

# Ou dans conf.d
/etc/nginx/conf.d/

# Configuration principale
/etc/nginx/nginx.conf
```

---

## ✅ ÉTAPE 1 : Créer la configuration du site

### Se connecter en SSH

```bash
ssh votre-user@votre-serveur.hostinger.com
```

### Créer le fichier de configuration

```bash
sudo nano /etc/nginx/sites-available/agri-point
```

### Copier cette configuration

```nginx
# Configuration Nginx pour Agri-Point E-commerce
# Next.js sur port 3000

upstream agripoint_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    
    # Remplacez par votre domaine
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Racine du projet (pour les fichiers statiques si nécessaire)
    root /home/votre-user/public_html/agri-point-ecommerce/public;
    
    # Logs
    access_log /var/log/nginx/agripoint-access.log;
    error_log /var/log/nginx/agripoint-error.log;
    
    # Taille maximale des uploads (pour les images produits)
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    send_timeout 60s;
    
    # Compression Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    
    # Sécurité - Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Proxy vers Next.js
    location / {
        proxy_pass http://agripoint_backend;
        proxy_http_version 1.1;
        
        # Headers WebSocket (pour Hot Reload en dev)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers standards
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Désactiver le cache pour les pages dynamiques
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache $http_upgrade;
        
        # Buffers
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # Cache agressif pour les fichiers statiques Next.js
    location /_next/static {
        proxy_pass http://agripoint_backend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }
    
    # Images Next.js optimisées
    location /_next/image {
        proxy_pass http://agripoint_backend;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800";
    }
    
    # Fichiers statiques publics
    location /images {
        proxy_pass http://agripoint_backend;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    location /products {
        proxy_pass http://agripoint_backend;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Favicon
    location /favicon.ico {
        proxy_pass http://agripoint_backend;
        access_log off;
        log_not_found off;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Robots.txt
    location /robots.txt {
        proxy_pass http://agripoint_backend;
        access_log off;
        log_not_found off;
    }
    
    # Health check (optionnel)
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

**Sauvegarder :** Ctrl+O, Enter, Ctrl+X

---

## ✅ ÉTAPE 2 : Activer la configuration

```bash
# Créer un lien symbolique vers sites-enabled
sudo ln -s /etc/nginx/sites-available/agri-point /etc/nginx/sites-enabled/

# Vérifier qu'il n'y a pas d'erreur de syntaxe
sudo nginx -t
```

Si vous voyez "syntax is ok" et "test is successful" ✅, continuez.

---

## ✅ ÉTAPE 3 : Redémarrer Nginx

```bash
# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier le statut
sudo systemctl status nginx
```

Si Nginx est "active (running)" ✅, c'est bon !

---

## 🔒 ÉTAPE 4 : Activer le SSL (HTTPS)

### Installer Certbot

```bash
# Sur Ubuntu/Debian (Hostinger VPS)
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Obtenir le certificat SSL

```bash
# Remplacez par votre domaine
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

**Suivez les instructions :**
1. Entrez votre email
2. Acceptez les conditions (A)
3. Choisissez de rediriger HTTP vers HTTPS (option 2)

✅ Certbot va automatiquement :
- Obtenir un certificat SSL gratuit
- Modifier votre configuration Nginx
- Configurer la redirection HTTPS
- Configurer le renouvellement automatique (tous les 90 jours)

### Vérifier le renouvellement automatique

```bash
sudo certbot renew --dry-run
```

Si aucune erreur, le SSL se renouvellera automatiquement ! ✅

---

## 🔍 DÉPANNAGE

### Erreur 502 Bad Gateway

**Cause :** Next.js n'est pas démarré ou ne répond pas sur le port 3000

**Solution :**
```bash
# Vérifier que Next.js tourne
pm2 status

# Vérifier le port 3000
sudo lsof -i :3000

# Redémarrer l'application
pm2 restart all
```

### Erreur 503 Service Unavailable

**Cause :** Nginx ne peut pas se connecter au backend

**Solution :**
```bash
# Vérifier les logs Nginx
sudo tail -50 /var/log/nginx/error.log

# Vérifier que Next.js répond localement
curl http://localhost:3000

# Redémarrer Nginx et l'application
sudo systemctl restart nginx
pm2 restart all
```

### Erreur 504 Gateway Timeout

**Cause :** Next.js prend trop de temps à répondre

**Solution :**
Augmenter les timeouts dans la config Nginx :
```nginx
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

Puis :
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Pages qui ne se chargent pas correctement

**Cause :** Problème de proxy ou de headers

**Solution :**
Vérifiez que ces headers sont présents :
```nginx
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
```

---

## 📊 VÉRIFICATION FINALE

### 1. Tester depuis le serveur

```bash
# Tester l'application directement
curl http://localhost:3000

# Tester via Nginx
curl http://localhost

# Tester via le domaine
curl http://votre-domaine.com
```

### 2. Tester depuis votre navigateur

1. Ouvrez : http://votre-domaine.com (ou https si SSL activé)
2. La page d'accueil doit s'afficher ✅
3. Testez la connexion admin
4. Vérifiez que les images s'affichent

### 3. Consulter les logs

```bash
# Logs Nginx accès
sudo tail -f /var/log/nginx/agripoint-access.log

# Logs Nginx erreurs
sudo tail -f /var/log/nginx/agripoint-error.log

# Logs de l'application
pm2 logs
```

---

## 🔧 COMMANDES UTILES

```bash
# Recharger la config Nginx (sans interruption)
sudo nginx -s reload

# Redémarrer Nginx
sudo systemctl restart nginx

# Tester la config Nginx
sudo nginx -t

# Voir le statut Nginx
sudo systemctl status nginx

# Désactiver un site
sudo rm /etc/nginx/sites-enabled/agri-point

# Réactiver un site
sudo ln -s /etc/nginx/sites-available/agri-point /etc/nginx/sites-enabled/
```

---

## 📝 CONFIGURATION POUR HOSTINGER SHARED HOSTING

Si vous utilisez un hébergement partagé (non VPS), vous n'avez généralement PAS accès à Nginx.

Dans ce cas, utilisez le fichier **.htaccess** fourni dans le projet.

Copiez-le dans le dossier `public_html` :

```bash
cp .htaccess ~/public_html/.htaccess
```

Et configurez Node.js depuis le panel Hostinger :
1. Panel Hostinger → Advanced → Node.js
2. Application root : /public_html/agri-point-ecommerce
3. Application startup file : server.js (ou npm start)
4. Port : 3000

---

## ✅ CHECKLIST

- [ ] Fichier de configuration créé dans `/etc/nginx/sites-available/`
- [ ] Lien symbolique créé dans `/etc/nginx/sites-enabled/`
- [ ] `nginx -t` ne retourne aucune erreur
- [ ] Nginx redémarré avec succès
- [ ] Next.js tourne sur le port 3000
- [ ] Le site est accessible via le domaine
- [ ] SSL activé et fonctionnel (HTTPS)
- [ ] Certificat SSL se renouvelle automatiquement
- [ ] Les images et fichiers statiques se chargent
- [ ] Aucune erreur dans les logs Nginx

---

**Votre configuration Nginx est maintenant optimale pour Next.js ! 🚀**
