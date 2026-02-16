# 🔴 GUIDE COMPLET : RÉSOUDRE L'ERREUR 503 SUR HOSTINGER

## 🎯 QU'EST-CE QU'UNE ERREUR 503 ?

**Erreur 503 Service Unavailable** signifie que le serveur web (Nginx/Apache) fonctionne, mais l'application Next.js ne répond pas ou n'est pas démarrée.

---

## 🔍 DIAGNOSTIC RAPIDE

### Étape 1 : Se connecter en SSH à Hostinger

```bash
ssh votre-user@votre-serveur.hostinger.com
# Ou utilisez l'IP du serveur si vous l'avez
ssh votre-user@123.45.67.89
```

### Étape 2 : Vérifier si Node.js tourne

```bash
# Vérifier les processus Node.js
ps aux | grep node

# Si vous utilisez PM2
pm2 status

# Si vous voyez l'application "online" ✅ = Bon signe
# Si vous voyez "stopped" ou "errored" ❌ = C'est le problème !
```

### Étape 3 : Vérifier les logs

```bash
# Si vous utilisez PM2
pm2 logs --lines 50

# OU consulter les logs Nginx
tail -50 /var/log/nginx/error.log
```

---

## ✅ SOLUTION 1 : REDÉMARRER L'APPLICATION

### A. Avec PM2 (le plus courant sur Hostinger VPS)

```bash
# Aller dans le dossier du projet
cd /home/votre-user/public_html/agri-point-ecommerce
# OU selon votre configuration
cd /var/www/agri-point-ecommerce

# Redémarrer avec PM2
pm2 restart all

# Vérifier que ça tourne
pm2 status

# Consulter les logs
pm2 logs --lines 20
```

### B. Sans PM2 (Hostinger Shared Hosting avec Node.js)

```bash
# Aller dans le dossier du projet
cd ~/public_html/agri-point-ecommerce

# Arrêter le processus existant (si bloqué)
killall node

# Relancer l'application
npm run build
nohup npm start > app.log 2>&1 &

# Vérifier
ps aux | grep node
```

---

## ✅ SOLUTION 2 : VÉRIFIER LA CONFIGURATION MONGODB

L'erreur 503 est SOUVENT causée par une connexion MongoDB qui échoue.

### Vérifier le fichier .env.local

```bash
# Voir le contenu (sans afficher les mots de passe)
cat .env.local | grep MONGODB_URI

# Éditer si nécessaire
nano .env.local
```

### Format correct pour MongoDB Atlas :
```bash
MONGODB_URI=mongodb+srv://agripoint_user:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/agripoint?retryWrites=true&w=majority
```

### Format correct pour MongoDB local :
```bash
MONGODB_URI=mongodb://localhost:27017/agripoint
```

### ⚠️ ATTENTION aux caractères spéciaux dans le mot de passe !

Si votre mot de passe contient `@`, `#`, `%`, etc., vous devez les encoder :

| Caractère | Encoder en |
|-----------|------------|
| `@`       | `%40`      |
| `#`       | `%23`      |
| `%`       | `%25`      |
| `:`       | `%3A`      |
| `/`       | `%2F`      |

**Exemple :**
- Mot de passe : `Pass@123#`
- Encodé : `Pass%40123%23`
- URI complète : `mongodb+srv://user:Pass%40123%23@cluster.net/agripoint`

### Tester la connexion MongoDB

```bash
# Créer un script de test
cat > test-mongo.js << 'EOF'
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

console.log('🔄 Test de connexion MongoDB...');
console.log('📍 URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    process.exit(1);
  });
EOF

# Exécuter le test
node test-mongo.js

# Si ça affiche "✅ Connexion MongoDB réussie !" = TOUT VA BIEN
# Si erreur = Corriger MONGODB_URI dans .env.local
```

---

## ✅ SOLUTION 3 : VÉRIFIER LES PERMISSIONS

```bash
# Vérifier le propriétaire des fichiers
ls -la

# Si nécessaire, corriger les permissions
sudo chown -R votre-user:votre-user /home/votre-user/public_html/agri-point-ecommerce

# Permissions pour les fichiers
chmod 644 .env.local
chmod 755 node_modules/.bin/*
```

---

## ✅ SOLUTION 4 : RÉINSTALLER LES DÉPENDANCES

Parfois, les modules Node.js sont corrompus :

```bash
# Supprimer node_modules
rm -rf node_modules package-lock.json

# Réinstaller
npm install

# Rebuild
npm run build

# Redémarrer
pm2 restart all
```

---

## ✅ SOLUTION 5 : VÉRIFIER LA MÉMOIRE RAM

L'application peut planter si la RAM est saturée :

```bash
# Vérifier la mémoire disponible
free -h

# Si "available" < 500MB, libérer de la mémoire :
pm2 flush  # Vider les logs PM2
pm2 restart all --update-env
```

---

## ✅ SOLUTION 6 : CONFIGURER PM2 CORRECTEMENT

Créer un fichier de configuration PM2 optimal :

```bash
# Créer ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'agri-point',
    script: 'npm',
    args: 'start',
    cwd: '/home/votre-user/public_html/agri-point-ecommerce',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Créer le dossier logs
mkdir -p logs

# Arrêter les processus PM2 existants
pm2 delete all

# Démarrer avec la nouvelle config
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save

# Auto-démarrage au reboot du serveur
pm2 startup
# Suivre les instructions affichées
```

---

## ✅ SOLUTION 7 : VÉRIFIER LA CONFIGURATION NGINX

### Voir la configuration Nginx actuelle

```bash
# Trouver le fichier de configuration de votre site
ls /etc/nginx/sites-available/
ls /etc/nginx/conf.d/

# Voir le contenu (exemple)
cat /etc/nginx/sites-available/default
# OU
cat /etc/nginx/conf.d/nodejs.conf
```

### Configuration Nginx recommandée

```nginx
server {
    listen 80;
    server_name agri-ps.com www.agri-ps.com;

    # Taille maximale upload
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/agripoint-access.log;
    error_log /var/log/nginx/agripoint-error.log;

    # Proxy vers Next.js (port 3000)
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
        
        # Timeouts importants pour éviter 503
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Appliquer les changements Nginx

```bash
# Tester la configuration
sudo nginx -t

# Si OK, redémarrer
sudo systemctl restart nginx

# Vérifier le statut
sudo systemctl status nginx
```

---

## ✅ SOLUTION 8 : VÉRIFIER LE PORT

Next.js doit tourner sur le port 3000 (ou celui configuré dans Nginx) :

```bash
# Vérifier quel processus écoute sur le port 3000
sudo lsof -i :3000
# OU
sudo netstat -tulpn | grep 3000

# Si rien n'écoute sur 3000 = L'application n'est pas démarrée !
# Si un autre processus occupe le port = Libérer le port ou changer le port de l'app
```

---

## ✅ SOLUTION 9 : INITIALISER LA BASE DE DONNÉES

Si MongoDB est vide, l'API peut crasher :

```bash
# Exécuter le script d'initialisation
node scripts/init-production.js

# OU seed manuel
npm run seed
npm run seed:users
npm run seed:config
```

---

## 🚀 SOLUTION RAPIDE : SCRIPT DE REDÉMARRAGE COMPLET

Créer un script qui fait tout d'un coup :

```bash
# Créer restart-app.sh
cat > restart-app.sh << 'EOF'
#!/bin/bash
echo "🔄 Redémarrage complet de l'application..."

# 1. Aller dans le bon dossier
cd /home/votre-user/public_html/agri-point-ecommerce

# 2. Vérifier .env.local existe
if [ ! -f .env.local ]; then
  echo "❌ Fichier .env.local manquant !"
  exit 1
fi

# 3. Tester MongoDB
node test-mongo.js
if [ $? -ne 0 ]; then
  echo "❌ MongoDB ne répond pas ! Vérifiez MONGODB_URI"
  exit 1
fi

# 4. Arrêter PM2
pm2 stop all

# 5. Rebuild si nécessaire
# npm run build

# 6. Redémarrer PM2
pm2 restart all

# 7. Vérifier
sleep 3
pm2 status

echo ""
echo "✅ Redémarrage terminé !"
echo "📝 Consultez les logs avec : pm2 logs"
EOF

# Rendre exécutable
chmod +x restart-app.sh

# Exécuter
./restart-app.sh
```

---

## 📊 CHECKLIST DE VÉRIFICATION

Cochez au fur et à mesure :

- [ ] SSH fonctionne
- [ ] Node.js est installé (`node --version`)
- [ ] Le dossier du projet existe
- [ ] Le fichier `.env.local` existe et contient `MONGODB_URI`
- [ ] MongoDB répond (test avec `test-mongo.js`)
- [ ] PM2 est installé (`pm2 --version`)
- [ ] L'application est "online" dans `pm2 status`
- [ ] Le port 3000 est utilisé par Node.js (`lsof -i :3000`)
- [ ] Nginx est démarré (`systemctl status nginx`)
- [ ] Nginx proxy vers `localhost:3000`
- [ ] Pas d'erreur dans `pm2 logs`
- [ ] Pas d'erreur dans `/var/log/nginx/error.log`

---

## 🆘 SI RIEN NE FONCTIONNE

### Déploiement depuis zéro

```bash
# 1. Sauvegarder .env.local
cp .env.local .env.local.backup

# 2. Supprimer tout
cd /home/votre-user/public_html
rm -rf agri-point-ecommerce

# 3. Re-cloner depuis GitHub
git clone https://github.com/jolu-bot/agri-point-ecommerce.git
cd agri-point-ecommerce

# 4. Restaurer .env.local
cp ../agri-point-ecommerce.backup/.env.local .env.local

# 5. Installer
npm install

# 6. Build
npm run build

# 7. Initialiser la base
node scripts/init-production.js

# 8. Démarrer avec PM2
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# 9. Vérifier
pm2 logs
```

---

## 📞 CONTACTEZ LE SUPPORT HOSTINGER

Si après toutes ces étapes, l'erreur persiste :

1. **Live Chat Hostinger** : Disponible 24/7
   - Allez sur https://www.hostinger.com
   - Cliquez sur "Support" → "Live Chat"

2. **Ticket Support**
   - Panel Hostinger → Help → Submit Ticket
   - Décrivez le problème et les étapes déjà effectuées

3. **Téléphone** : Consultez votre panel pour le numéro local

---

## ✅ APRÈS LA RÉSOLUTION

Une fois le site fonctionnel :

1. **Testez la connexion** : https://agri-ps.com
2. **Connectez-vous** : `admin@agri-ps.com` / `admin123`
3. **Changez le mot de passe admin**
4. **Configurez les sauvegardes automatiques**
5. **Activez la surveillance** : `pm2 monit`

---

## 🎯 PRÉVENTION

Pour éviter les erreurs 503 à l'avenir :

```bash
# Configurer auto-restart PM2
pm2 startup
pm2 save

# Monitoring
pm2 install pm2-logrotate  # Rotation des logs
pm2 set pm2-logrotate:max_size 10M

# Backups réguliers MongoDB
# Créer un cron job pour sauvegarder quotidiennement
```

---

**Bon courage ! 💪 Votre site sera bientôt en ligne ! 🚀**
