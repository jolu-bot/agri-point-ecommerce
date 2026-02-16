#!/bin/bash

# ============================================================
# SCRIPT D'INITIALISATION HOSTINGER - AGRI POINT
# ============================================================
# Ce script configure automatiquement l'environnement Hostinger
# et résout les problèmes courants causant l'erreur 503
# 
# Usage: bash init-hostinger.sh
# ============================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 INITIALISATION HOSTINGER - AGRI POINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================
# ÉTAPE 1: VÉRIFICATIONS PRÉLIMINAIRES
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 1: Vérifications préliminaires${NC}"
echo ""

# Vérifier Node.js
echo -n "   Vérification de Node.js... "
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌${NC}"
    echo ""
    echo -e "${RED}Node.js n'est pas installé !${NC}"
    echo "Installez Node.js 18+ depuis le panel Hostinger ou avec:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ $NODE_VERSION${NC}"

# Vérifier npm
echo -n "   Vérification de npm... "
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ $NPM_VERSION${NC}"

echo ""

# ============================================================
# ÉTAPE 2: CONFIGURATION FICHIERS ENVIRONNEMENT
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 2: Configuration des variables d'environnement${NC}"
echo ""

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}   ⚠️  Fichier .env.local manquant${NC}"
    
    if [ -f ".env.production" ]; then
        echo "   Copie depuis .env.production..."
        cp .env.production .env.local
        echo -e "${GREEN}   ✅ Fichier .env.local créé${NC}"
    else
        echo -e "${RED}   ❌ .env.production introuvable${NC}"
        echo ""
        echo "   Créez manuellement .env.local avec:"
        echo "   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/agripoint"
        echo "   JWT_SECRET=votre-secret-jwt"
        echo "   JWT_REFRESH_SECRET=votre-refresh-secret"
        exit 1
    fi
else
    echo -e "${GREEN}   ✅ Fichier .env.local existe${NC}"
fi

echo ""

# ============================================================
# ÉTAPE 3: TEST CONNEXION MONGODB
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 3: Test de la connexion MongoDB${NC}"
echo ""

echo "   Test en cours..."
if node test-mongo-connection.js > /tmp/mongo-test.log 2>&1; then
    echo -e "${GREEN}   ✅ Connexion MongoDB réussie${NC}"
else
    echo -e "${RED}   ❌ Échec de connexion MongoDB${NC}"
    echo ""
    echo "   Détails de l'erreur:"
    tail -20 /tmp/mongo-test.log | sed 's/^/      /'
    echo ""
    echo -e "${YELLOW}   ⚠️  IMPORTANT: Corrigez MONGODB_URI dans .env.local${NC}"
    echo ""
    echo "   Consultez: GUIDE-RESOLUTION-ERREUR-503.md"
    exit 1
fi

echo ""

# ============================================================
# ÉTAPE 4: INSTALLATION DÉPENDANCES
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 4: Installation des dépendances${NC}"
echo ""

if [ ! -d "node_modules" ]; then
    echo "   Installation en cours (cela peut prendre quelques minutes)..."
    npm install --production
    echo -e "${GREEN}   ✅ Dépendances installées${NC}"
else
    echo -e "${GREEN}   ✅ node_modules existe déjà${NC}"
    echo "   Mise à jour des dépendances..."
    npm install --production
fi

echo ""

# ============================================================
# ÉTAPE 5: BUILD PRODUCTION
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 5: Build de l'application${NC}"
echo ""

if [ ! -d ".next" ]; then
    echo "   Build en cours (cela peut prendre plusieurs minutes)..."
    npm run build
    echo -e "${GREEN}   ✅ Build terminé${NC}"
else
    echo "   Rebuild de l'application..."
    rm -rf .next
    npm run build
    echo -e "${GREEN}   ✅ Rebuild terminé${NC}"
fi

echo ""

# ============================================================
# ÉTAPE 6: INITIALISATION BASE DE DONNÉES
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 6: Initialisation de la base de données${NC}"
echo ""

if [ -f "scripts/init-production.js" ]; then
    echo "   Initialisation en cours..."
    if node scripts/init-production.js > /tmp/init-db.log 2>&1; then
        echo -e "${GREEN}   ✅ Base de données initialisée${NC}"
        echo ""
        echo "   📊 Compte administrateur créé:"
        echo "      Email: admin@agri-ps.com"
        echo "      Mot de passe: admin123"
        echo "      ${YELLOW}⚠️  CHANGEZ CE MOT DE PASSE après la première connexion !${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Initialisation partielle ou base déjà initialisée${NC}"
        tail -10 /tmp/init-db.log | sed 's/^/      /'
    fi
else
    echo -e "${YELLOW}   ⚠️  Script init-production.js introuvable${NC}"
    echo "   La base de données devra être initialisée manuellement"
fi

echo ""

# ============================================================
# ÉTAPE 7: INSTALLATION PM2
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 7: Installation de PM2${NC}"
echo ""

if ! command -v pm2 &> /dev/null; then
    echo "   Installation de PM2..."
    npm install -g pm2
    echo -e "${GREEN}   ✅ PM2 installé${NC}"
else
    PM2_VERSION=$(pm2 --version)
    echo -e "${GREEN}   ✅ PM2 déjà installé: v$PM2_VERSION${NC}"
fi

echo ""

# ============================================================
# ÉTAPE 8: CONFIGURATION PM2
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 8: Configuration de PM2${NC}"
echo ""

# Créer le dossier logs
mkdir -p logs
echo -e "${GREEN}   ✅ Dossier logs créé${NC}"

# Arrêter les processus existants
echo "   Nettoyage des processus existants..."
pm2 delete all 2>/dev/null || true

# Démarrer avec PM2
if [ -f "ecosystem.config.js" ]; then
    echo "   Démarrage avec ecosystem.config.js..."
    pm2 start ecosystem.config.js
else
    echo "   Démarrage simple..."
    pm2 start npm --name "agri-point" -- start
fi

echo -e "${GREEN}   ✅ Application démarrée avec PM2${NC}"

# Sauvegarder la configuration
pm2 save
echo -e "${GREEN}   ✅ Configuration PM2 sauvegardée${NC}"

echo ""

# ============================================================
# ÉTAPE 9: CONFIGURATION AUTO-START
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 9: Configuration du démarrage automatique${NC}"
echo ""

# Générer le script de démarrage
pm2 startup > /tmp/pm2-startup.log 2>&1 || true

if grep -q "sudo" /tmp/pm2-startup.log; then
    echo -e "${YELLOW}   ⚠️  Commande sudo requise${NC}"
    echo ""
    echo "   Exécutez manuellement cette commande:"
    grep "sudo" /tmp/pm2-startup.log | head -1
    echo ""
else
    echo -e "${GREEN}   ✅ Démarrage automatique configuré${NC}"
fi

echo ""

# ============================================================
# ÉTAPE 10: VÉRIFICATION FINALE
# ============================================================

echo -e "${BLUE}📋 ÉTAPE 10: Vérification finale${NC}"
echo ""

sleep 3

echo "   Statut de l'application:"
pm2 status

echo ""
echo "   Test du port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ L'application écoute sur le port 3000${NC}"
else
    echo -e "${RED}   ❌ Aucune application sur le port 3000${NC}"
    echo "   Consultez les logs: pm2 logs"
fi

echo ""

# ============================================================
# RÉSUMÉ FINAL
# ============================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ INITIALISATION TERMINÉE !${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 PROCHAINES ÉTAPES:"
echo ""
echo "   1. Vérifiez que votre domaine pointe vers ce serveur"
echo "   2. Configurez Nginx pour proxy vers le port 3000"
echo "   3. Activez le SSL avec Certbot (Let's Encrypt)"
echo "   4. Testez votre site: https://agri-ps.com"
echo "   5. Connectez-vous avec: admin@agri-ps.com / admin123"
echo "   6. ${YELLOW}CHANGEZ immédiatement le mot de passe admin !${NC}"
echo ""
echo "📋 COMMANDES UTILES:"
echo ""
echo "   pm2 logs          - Voir les logs en temps réel"
echo "   pm2 monit         - Monitoring CPU/RAM"
echo "   pm2 restart all   - Redémarrer l'application"
echo "   pm2 stop all      - Arrêter l'application"
echo ""
echo "🔧 EN CAS DE PROBLÈME:"
echo ""
echo "   ./restart-app.sh  - Redémarrage complet"
echo "   Consultez: GUIDE-RESOLUTION-ERREUR-503.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
