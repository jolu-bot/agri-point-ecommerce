#!/bin/bash
# ============================================================================
# DEPLOIEMENT AGRI-PS.COM - HOSTINGER SHARED HOSTING
# ============================================================================

set -e

echo "=========================================="
echo " DEPLOIEMENT AGRI-PS.COM"
echo " Hostinger Shared Hosting"
echo "=========================================="

# Configuration pour hébergement partagé
APP_DIR="$HOME/agri-point-ecommerce"
PUBLIC_DIR="$HOME/domains/agri-ps.com/public_html"
GIT_REPO="https://github.com/jolu-bot/agri-point-ecommerce.git"
GIT_BRANCH="main"

echo ""
echo "[1/8] Verification Node.js..."
if ! command -v node &> /dev/null; then
    echo "Installation de Node.js localement..."
    cd $HOME
    wget https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz
    tar -xf node-v20.11.0-linux-x64.tar.xz
    mv node-v20.11.0-linux-x64 nodejs
    rm node-v20.11.0-linux-x64.tar.xz
    
    # Ajouter au PATH
    echo 'export PATH=$HOME/nodejs/bin:$PATH' >> ~/.bashrc
    export PATH=$HOME/nodejs/bin:$PATH
fi

NODE_VERSION=$(node --version 2>/dev/null || echo "Installation en cours...")
echo "Node.js: $NODE_VERSION"

echo ""
echo "[2/8] Verification npm..."
NPM_VERSION=$(npm --version 2>/dev/null || echo "Depuis Node.js")
echo "npm: $NPM_VERSION"

echo ""
echo "[3/8] Clone/update du repository..."
if [ ! -d "$APP_DIR" ]; then
    echo "Premier deploiement - clone..."
    cd $HOME
    git clone $GIT_REPO agri-point-ecommerce
else
    echo "Mise a jour du code..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$GIT_BRANCH
fi

cd $APP_DIR
CURRENT_COMMIT=$(git log -1 --format="%h - %s")
echo "Commit: $CURRENT_COMMIT"

echo ""
echo "[4/8] Configuration .env..."
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "Fichier .env configure depuis .env.production"
else
    echo "ATTENTION: .env.production manquant!"
fi

echo ""
echo "[5/8] Installation des dependances..."
echo "Cela peut prendre 3-5 minutes..."
npm install --production

echo ""
echo "[6/8] Build de l'application..."
echo "Cela peut prendre 5-10 minutes..."
npm run build

echo ""
echo "[7/8] Preparation du repertoire public..."
# Creer un lien symbolique ou copier les fichiers
if [ -d "$PUBLIC_DIR" ]; then
    echo "Configuration du repertoire public..."
    
    # Creer un fichier .htaccess pour rediriger vers Node.js
    cat > $PUBLIC_DIR/.htaccess << 'HTACCESS'
# Redirection vers l'application Node.js
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
HTACCESS
    
    echo "Fichier .htaccess cree"
else
    echo "Repertoire public non trouve: $PUBLIC_DIR"
fi

echo ""
echo "[8/8] Demarrage de l'application..."

# Arrêter l'ancienne instance si elle existe
pkill -f "node.*next.*start" 2>/dev/null || echo "Aucune instance a arreter"

# Démarrer l'application en arrière-plan
cd $APP_DIR
nohup npm start > $HOME/agripoint.log 2>&1 &
APP_PID=$!

echo "Application demarree (PID: $APP_PID)"
echo "Logs: $HOME/agripoint.log"

# Sauvegarder le PID
echo $APP_PID > $HOME/agripoint.pid

echo ""
echo "=========================================="
echo " VERIFICATION"
echo "=========================================="

sleep 10

# Tester l'application
if curl -s http://127.0.0.1:3000 > /dev/null; then
    echo "✓ Application repond sur le port 3000"
else
    echo "⚠ L'application ne repond pas encore"
    echo "Verifiez les logs: tail -f $HOME/agripoint.log"
fi

echo ""
echo "=========================================="
echo " DEPLOIEMENT TERMINE"
echo "=========================================="
echo ""
echo "Informations:"
echo "  - Application: $APP_DIR"
echo "  - Logs: $HOME/agripoint.log"
echo "  - PID: $HOME/agripoint.pid"
echo ""
echo "Commandes utiles:"
echo "  tail -f $HOME/agripoint.log          # Voir les logs"
echo "  kill \$(cat $HOME/agripoint.pid)      # Arreter l'app"
echo "  cd $APP_DIR && npm start &            # Redemarrer"
echo ""
echo "Testez: https://agri-ps.com"
echo ""
