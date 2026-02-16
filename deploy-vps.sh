#!/bin/bash

# ============================================================================
# SCRIPT DE DEPLOIEMENT AGRI-PS.COM
# ============================================================================
# Ce script deploie l'application sur le VPS
# 
# USAGE:
#   1. Copiez ce script sur le VPS
#   2. chmod +x deploy-vps.sh
#   3. ./deploy-vps.sh
# ============================================================================

set -e  # Arreter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/agri-point-ecommerce"
GIT_REPO="https://github.com/jolu-bot/agri-point-ecommerce.git"
GIT_BRANCH="main"
PM2_APP_NAME="agripoint-production"

echo -e "${CYAN}"
echo "==========================================="
echo "  DEPLOIEMENT AGRI-PS.COM"
echo "==========================================="
echo -e "${NC}"

# ============================================================================
# ETAPE 0: VERIFICATION DES PREREQUIS
# ============================================================================
echo -e "${CYAN}[0/7] Verification des prerequis...${NC}"

# Verifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js non installe. Installation...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}  ✓ Node.js: $NODE_VERSION${NC}"

# Verifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm non installe!${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}  ✓ npm: $NPM_VERSION${NC}"

# Verifier PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 non installe. Installation...${NC}"
    npm install -g pm2
fi

PM2_VERSION=$(pm2 --version)
echo -e "${GREEN}  ✓ PM2: $PM2_VERSION${NC}"

# Verifier Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Git non installe. Installation...${NC}"
    apt-get update
    apt-get install -y git
fi

GIT_VERSION=$(git --version)
echo -e "${GREEN}  ✓ Git: $GIT_VERSION${NC}"

echo ""

# ============================================================================
# ETAPE 1: PREPARATION DU REPERTOIRE
# ============================================================================
echo -e "${CYAN}[1/7] Preparation du repertoire...${NC}"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Premier deploiement - clonage du repository...${NC}"
    mkdir -p /var/www
    cd /var/www
    git clone $GIT_REPO agri-point-ecommerce
    echo -e "${GREEN}  ✓ Repository clone${NC}"
else
    echo -e "${GREEN}  ✓ Repertoire existe${NC}"
fi

cd $APP_DIR
echo ""

# ============================================================================
# ETAPE 2: PULL DU CODE
# ============================================================================
echo -e "${CYAN}[2/7] Pull du code depuis Git...${NC}"

git fetch origin
git reset --hard origin/$GIT_BRANCH

CURRENT_COMMIT=$(git log -1 --format="%h - %s")
echo -e "${GREEN}  ✓ Code mis a jour: $CURRENT_COMMIT${NC}"
echo ""

# ============================================================================
# ETAPE 3: CONFIGURATION ENVIRONNEMENT
# ============================================================================
echo -e "${CYAN}[3/7] Configuration de l'environnement...${NC}"

if [ -f ".env.production" ]; then
    cp .env.production .env
    echo -e "${GREEN}  ✓ Fichier .env configure${NC}"
else
    echo -e "${YELLOW}  ! .env.production non trouve - utilisez le .env existant${NC}"
fi

echo ""

# ============================================================================
# ETAPE 4: INSTALLATION DEPENDANCES
# ============================================================================
echo -e "${CYAN}[4/7] Installation des dependances...${NC}"
echo -e "${YELLOW}  Cela peut prendre quelques minutes...${NC}"

npm install --production

echo -e "${GREEN}  ✓ Dependances installees${NC}"
echo ""

# ============================================================================
# ETAPE 5: BUILD DE L'APPLICATION
# ============================================================================
echo -e "${CYAN}[5/7] Build de l'application...${NC}"
echo -e "${YELLOW}  Cela peut prendre 5-10 minutes...${NC}"

npm run build

echo -e "${GREEN}  ✓ Application buildee avec succes${NC}"
echo ""

# ============================================================================
# ETAPE 6: REDEMARRAGE PM2
# ============================================================================
echo -e "${CYAN}[6/7] Redemarrage de l'application...${NC}"

# Arreter l'instance existante
pm2 stop $PM2_APP_NAME 2>/dev/null || echo "  Aucune instance a arreter"
pm2 delete $PM2_APP_NAME 2>/dev/null || echo "  Aucune instance a supprimer"

# Demarrer la nouvelle instance
pm2 start npm --name "$PM2_APP_NAME" -- start

# Sauvegarder la config PM2
pm2 save

# Configurer le demarrage automatique
pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup

echo -e "${GREEN}  ✓ Application demarree avec PM2${NC}"
echo ""

# ============================================================================
# ETAPE 7: VERIFICATION
# ============================================================================
echo -e "${CYAN}[7/7] Verification du deploiement...${NC}"

# Attendre le demarrage
echo "  Attente du demarrage (15 secondes)..."
sleep 15

# Tester le port local
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000)
echo "  Code HTTP local: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}  ✓ Application repond correctement!${NC}"
else
    echo -e "${YELLOW}  ⚠ Code HTTP inattendu${NC}"
    echo -e "${YELLOW}  Verifiez les logs: pm2 logs $PM2_APP_NAME${NC}"
fi

echo ""

# ============================================================================
# STATUT PM2
# ============================================================================
echo -e "${CYAN}Statut PM2:${NC}"
pm2 list

echo ""

# ============================================================================
# RECAPITULATIF
# ============================================================================
echo -e "${GREEN}"
echo "==========================================="
echo "  DEPLOIEMENT TERMINE AVEC SUCCES"
echo "==========================================="
echo -e "${NC}"

echo -e "${CYAN}Site: https://agri-ps.com${NC}"
echo -e "${CYAN}Application: $APP_DIR${NC}"
echo -e "${CYAN}Commit: $CURRENT_COMMIT${NC}"
echo ""

echo -e "${YELLOW}COMMANDES UTILES:${NC}"
echo "  pm2 logs $PM2_APP_NAME     - Voir les logs"
echo "  pm2 restart $PM2_APP_NAME  - Redemarrer"
echo "  pm2 stop $PM2_APP_NAME     - Arreter"
echo "  pm2 status                  - Voir le statut"
echo "  pm2 monit                   - Moniteur en temps reel"
echo ""

echo -e "${YELLOW}PROCHAINES ETAPES:${NC}"
echo "  1. Verifier le site: https://agri-ps.com"
echo "  2. Configurer les variables .env (MongoDB, JWT, etc.)"
echo "  3. Activer la campagne: npm run campaign:go-live"
echo "  4. Tester le formulaire de commande"
echo "  5. Demarrer le monitoring"
echo ""

# Demander si on veut voir les logs
read -p "Voulez-vous voir les logs maintenant? (o/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${CYAN}Logs PM2 (Ctrl+C pour quitter)...${NC}"
    sleep 2
    pm2 logs $PM2_APP_NAME
fi
