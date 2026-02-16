#!/bin/bash

# ============================================================
# SCRIPT DE REDÉMARRAGE D'URGENCE - AGRI POINT
# ============================================================
# Ce script redémarre complètement l'application et vérifie
# que tout fonctionne correctement
# 
# Usage: bash restart-app.sh
# ============================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 REDÉMARRAGE COMPLET DE L'APPLICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier qu'on est dans le bon dossier
echo "📁 Étape 1: Vérification du dossier..."
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Erreur: package.json introuvable !${NC}"
  echo "Assurez-vous d'être dans le dossier du projet."
  exit 1
fi
echo -e "${GREEN}✅ Dossier correct${NC}"
echo ""

# 2. Vérifier que .env.local existe
echo "🔐 Étape 2: Vérification de la configuration..."
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}⚠️  Fichier .env.local manquant !${NC}"
  echo "Création d'un fichier .env.local depuis .env.production..."
  
  if [ -f ".env.production" ]; then
    cp .env.production .env.local
    echo -e "${GREEN}✅ Fichier .env.local créé${NC}"
  else
    echo -e "${RED}❌ Erreur: .env.production introuvable également !${NC}"
    echo "Créez manuellement un fichier .env.local avec MONGODB_URI"
    exit 1
  fi
fi
echo -e "${GREEN}✅ Configuration présente${NC}"
echo ""

# 3. Vérifier Node.js
echo "🔍 Étape 3: Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé !${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js installé: $NODE_VERSION${NC}"
echo ""

# 4. Vérifier PM2
echo "⚙️  Étape 4: Vérification de PM2..."
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé${NC}"
    echo "Installation de PM2..."
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 installé${NC}"
else
    PM2_VERSION=$(pm2 --version)
    echo -e "${GREEN}✅ PM2 installé: $PM2_VERSION${NC}"
fi
echo ""

# 5. Créer le dossier logs si nécessaire
echo "📝 Étape 5: Préparation des logs..."
mkdir -p logs
echo -e "${GREEN}✅ Dossier logs prêt${NC}"
echo ""

# 6. Arrêter les processus PM2 existants
echo "🛑 Étape 6: Arrêt des processus existants..."
pm2 delete all 2>/dev/null || echo "Aucun processus à arrêter"
echo -e "${GREEN}✅ Processus arrêtés${NC}"
echo ""

# 7. Vérifier que le port 3000 est libre
echo "🔌 Étape 7: Vérification du port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Le port 3000 est occupé${NC}"
    echo "Libération du port..."
    kill -9 $(lsof -t -i:3000) 2>/dev/null || true
    sleep 2
fi
echo -e "${GREEN}✅ Port 3000 disponible${NC}"
echo ""

# 8. Vérifier que node_modules existe
echo "📦 Étape 8: Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules manquant${NC}"
    echo "Installation des dépendances..."
    npm install
fi
echo -e "${GREEN}✅ Dépendances présentes${NC}"
echo ""

# 9. Vérifier que le build existe
echo "🏗️  Étape 9: Vérification du build..."
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}⚠️  Build manquant${NC}"
    echo "Construction de l'application..."
    npm run build
fi
echo -e "${GREEN}✅ Build présent${NC}"
echo ""

# 10. Démarrer l'application avec PM2
echo "🚀 Étape 10: Démarrage de l'application..."

# Utiliser ecosystem.config.js si disponible, sinon démarrage simple
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    pm2 start npm --name "agri-point" -- start
fi

echo -e "${GREEN}✅ Application démarrée${NC}"
echo ""

# 11. Attendre que l'application soit prête
echo "⏳ Étape 11: Vérification du démarrage..."
sleep 5

# 12. Vérifier le statut
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STATUT DE L'APPLICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 LOGS RÉCENTS (20 dernières lignes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs --lines 20 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ REDÉMARRAGE TERMINÉ !${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Commandes utiles:"
echo "   pm2 logs          - Voir les logs en temps réel"
echo "   pm2 monit         - Monitoring CPU/RAM"
echo "   pm2 restart all   - Redémarrer rapidement"
echo "   pm2 stop all      - Arrêter l'application"
echo ""
echo "🌐 Testez votre site:"
echo "   http://localhost:3000"
echo "   https://votre-domaine.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 13. Sauvegarder la configuration PM2
pm2 save

echo ""
echo -e "${GREEN}💾 Configuration PM2 sauvegardée${NC}"
echo ""
