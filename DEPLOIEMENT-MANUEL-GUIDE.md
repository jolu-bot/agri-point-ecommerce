# ============================================================================
# GUIDE DEPLOIEMENT MANUEL - AGRI-PS.COM
# ============================================================================

## METHODE RAPIDE (10 MINUTES)

### ETAPE 1: SE CONNECTER AU VPS

Utilisez votre client SSH habituel (PuTTY, Hostinger SSH Web Terminal, ou PowerShell):

```bash
ssh -p 65002 root@92.113.28.219
```

Ou dans Hostinger Panel:
1. Allez dans VPS > Tableau de bord
2. Cliquez sur "Browser Terminal" ou "WEB SSH"

### ETAPE 2: EXECUTER LE SCRIPT DE DEPLOIEMENT

Une fois connecte au VPS, copiez-collez ces commandes:

```bash
# Creer le script de deploiement
cat > /root/deploy-now.sh << 'EOFSCRIPT'
#!/bin/bash
set -e

echo "=========================================="
echo " DEPLOIEMENT AGRI-PS.COM"
echo "=========================================="

# Configuration
APP_DIR="/var/www/agri-point-ecommerce"
GIT_REPO="https://github.com/jolu-bot/agri-point-ecommerce.git"
GIT_BRANCH="main"

echo ""
echo "[1/6] Verification Node.js et npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "OK - Node $(node --version) | npm $(npm --version)"

echo ""
echo "[2/6] Verification PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "OK - PM2 $(pm2 --version)"

echo ""
echo "[3/6] Preparation du repertoire..."
if [ ! -d "$APP_DIR" ]; then
    mkdir -p /var/www
    cd /var/www
    git clone $GIT_REPO agri-point-ecommerce
else
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$GIT_BRANCH
fi
echo "OK - Code mis a jour"

cd $APP_DIR

echo ""
echo "[4/6] Configuration .env..."
cp .env.production .env 2>/dev/null || true
echo "OK"

echo ""
echo "[5/6] Installation + Build (5-10 min)..."
npm install --production
npm run build
echo "OK - Application buildee"

echo ""
echo "[6/6] Demarrage PM2..."
pm2 stop agripoint-production 2>/dev/null || true
pm2 delete agripoint-production 2>/dev/null || true
pm2 start npm --name "agripoint-production" -- start
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup
echo "OK - Application demarree"

echo ""
echo "=========================================="
echo " VERIFICATION"
echo "=========================================="
sleep 10
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000)
echo "Code HTTP: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "SUCCES - Application fonctionne!"
else
    echo "ATTENTION - Verifiez les logs: pm2 logs agripoint-production"
fi

echo ""
pm2 list

EOFSCRIPT

# Rendre le script executable
chmod +x /root/deploy-now.sh

# Executer le deploiement
/root/deploy-now.sh
```

### ETAPE 3: VERIFIER LE DEPLOIEMENT

Apres l'execution du script:

```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs agripoint-production --lines 50

# Tester localement
curl http://127.0.0.1:3000
```

Puis testez dans votre navigateur: **https://agri-ps.com**

### COMMANDES UTILES

```bash
# Redemarrer l'application
pm2 restart agripoint-production

# Arreter l'application
pm2 stop agripoint-production

# Moniteur en temps reel
pm2 monit

# Voir les logs en temps reel
pm2 logs agripoint-production
```

## CONFIGURATION MONGODB (IMPORTANT!)

Une fois deploye, vous devez configurer MongoDB dans le fichier .env:

```bash
# Editer le .env
nano /var/www/agri-point-ecommerce/.env

# Ajouter/modifier ces lignes:
MONGODB_URI=mongodb+srv://votre-user:votre-password@cluster.mongodb.net/agripoint?retryWrites=true&w=majority
JWT_SECRET=votre-secret-jwt-secure
NEXTAUTH_SECRET=votre-secret-nextauth-secure
NEXTAUTH_URL=https://agri-ps.com
NEXT_PUBLIC_SITE_URL=https://agri-ps.com

# Sauvegarder: Ctrl+X, puis Y, puis ENTREE

# Redemarrer l'application
pm2 restart agripoint-production
```

## TROUBLESHOOTING

### Site ne charge pas (503)
```bash
# Verifier si l'app tourne
pm2 status

# Verifier les logs
pm2 logs agripoint-production --lines 100

# Verifier le port
netstat -tlnp | grep 3000
```

### Erreur de build
```bash
cd /var/www/agri-point-ecommerce
npm install --production
npm run build
pm2 restart agripoint-production
```

### Probleme MongoDB
```bash
# Tester la connexion MongoDB
mongo "mongodb+srv://cluster.mongodb.net/test" --username admin

# Ou avec Node.js
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(err => console.log('ERREUR:', err));"
```

## PROCHAINES ETAPES

Apres le deploiement reussi:

1. ✅ Verifier https://agri-ps.com fonctionne
2. ⏳ Configurer MongoDB dans .env
3. ⏳ Activer la campagne: `cd /var/www/agri-point-ecommerce && npm run campaign:go-live`
4. ⏳ Tester le formulaire de commande
5. ⏳ Demarrer le monitoring: `npm run monitor:agent &`
6. ⏳ Envoyer les communications clients

## CONTACT SUPPORT

Si vous rencontrez des problemes:

1. Verifiez les logs: `pm2 logs agripoint-production`
2. Verifiez le fichier .env est correctement configure
3. Contactez le support Hostinger si probleme VPS
4. Verifiez MongoDB Atlas est accessible depuis le VPS

---

**Document cree le:** 16 Fevrier 2026
**Derniere mise a jour:** Deploy-vps.sh commit 091da15
