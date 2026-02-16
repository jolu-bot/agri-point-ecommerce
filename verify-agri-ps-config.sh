#!/bin/bash

# ============================================================
# SCRIPT DE VÉRIFICATION - CONFIGURATION AGRI-PS.COM
# ============================================================
# Vérifie que toutes les configurations sont correctes
# pour le domaine agri-ps.com
# 
# Usage: bash verify-agri-ps-config.sh
# ============================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VÉRIFICATION CONFIGURATION AGRI-PS.COM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Fonction pour vérifier
check() {
    local name=$1
    local command=$2
    local expected=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "   $name... "
    
    if eval "$command" | grep -q "$expected" 2>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_warning() {
    local name=$1
    local command=$2
    local expected=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "   $name... "
    
    if eval "$command" | grep -q "$expected" 2>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
        return 1
    fi
}

# ============================================================
# VÉRIFICATION 1: FICHIERS DE CONFIGURATION
# ============================================================

echo -e "${BLUE}📋 Étape 1: Vérification des fichiers de configuration${NC}"
echo ""

check "Fichier .env.production existe" "test -f .env.production && echo ok" "ok"
check "Fichier .env.local.agri-ps existe" "test -f .env.local.agri-ps && echo ok" "ok"
check "Fichier nginx-agri-ps.conf existe" "test -f nginx-agri-ps.conf && echo ok" "ok"
check "Fichier INSTALLATION-AGRI-PS.md existe" "test -f INSTALLATION-AGRI-PS.md && echo ok" "ok"

echo ""

# ============================================================
# VÉRIFICATION 2: DOMAINE DANS .ENV.PRODUCTION
# ============================================================

echo -e "${BLUE}📋 Étape 2: Vérification du domaine dans .env.production${NC}"
echo ""

check "NEXT_PUBLIC_SITE_URL = agri-ps.com" "cat .env.production" "agri-ps.com"
check "ADMIN_EMAIL = admin@agri-ps.com" "cat .env.production" "admin@agri-ps.com"
check "EMAIL_USER contient @agri-ps.com" "cat .env.production" "@agri-ps.com"

echo ""

# ============================================================
# VÉRIFICATION 3: NEXT.CONFIG.JS
# ============================================================

echo -e "${BLUE}📋 Étape 3: Vérification de next.config.js${NC}"
echo ""

check "allowedOrigins contient agri-ps.com" "cat next.config.js" "agri-ps.com"
check_warning "allowedOrigins contient www.agri-ps.com" "cat next.config.js" "www.agri-ps.com"

echo ""

# ============================================================
# VÉRIFICATION 4: FICHIERS NGINX
# ============================================================

echo -e "${BLUE}📋 Étape 4: Vérification de la configuration Nginx${NC}"
echo ""

check "nginx-agri-ps.conf contient server_name agri-ps.com" "cat nginx-agri-ps.conf" "agri-ps.com"
check "nginx-agri-ps.conf contient www.agri-ps.com" "cat nginx-agri-ps.conf" "www.agri-ps.com"
check "nginx-agri-ps.conf proxy vers port 3000" "cat nginx-agri-ps.conf" "3000"

echo ""

# ============================================================
# VÉRIFICATION 5: GUIDES ET DOCUMENTATION
# ============================================================

echo -e "${BLUE}📋 Étape 5: Vérification de la documentation${NC}"
echo ""

check "README-ERREUR-503.md contient agri-ps.com" "cat README-ERREUR-503.md" "agri-ps.com"
check "GUIDE-RESOLUTION-ERREUR-503.md contient agri-ps.com" "cat GUIDE-RESOLUTION-ERREUR-503.md" "agri-ps.com"
check "INSTALLATION-AGRI-PS.md existe" "test -f INSTALLATION-AGRI-PS.md && echo ok" "ok"

echo ""

# ============================================================
# VÉRIFICATION 6: SCRIPTS
# ============================================================

echo -e "${BLUE}📋 Étape 6: Vérification des scripts${NC}"
echo ""

check "init-hostinger.sh contient agri-ps.com" "cat init-hostinger.sh" "agri-ps.com"
check_warning "restart-app.sh existe et est exécutable" "test -x restart-app.sh && echo ok" "ok"
check_warning "init-hostinger.sh existe et est exécutable" "test -x init-hostinger.sh && echo ok" "ok"

echo ""

# ============================================================
# VÉRIFICATION 7: FICHIER .ENV.LOCAL (SI EXISTE)
# ============================================================

echo -e "${BLUE}📋 Étape 7: Vérification de .env.local (si existe)${NC}"
echo ""

if [ -f .env.local ]; then
    check ".env.local contient agri-ps.com" "cat .env.local" "agri-ps.com"
    check ".env.local contient MONGODB_URI" "cat .env.local" "MONGODB_URI"
else
    echo -e "${YELLOW}   ⚠️  Fichier .env.local n'existe pas encore (normal si pas encore déployé)${NC}"
fi

echo ""

# ============================================================
# VÉRIFICATION 8: PACKAGE.JSON
# ============================================================

echo -e "${BLUE}📋 Étape 8: Vérification de package.json${NC}"
echo ""

check "package.json existe" "test -f package.json && echo ok" "ok"
check "next est dans les dépendances" "cat package.json" "next"
check "mongoose est dans les dépendances" "cat package.json" "mongoose"

echo ""

# ============================================================
# RÉSUMÉ
# ============================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ DE LA VÉRIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Total de vérifications : $TOTAL_CHECKS"
echo -e "   ${GREEN}✅ Réussies : $PASSED_CHECKS${NC}"
echo -e "   ${YELLOW}⚠️  Avertissements : $WARNING_CHECKS${NC}"
echo -e "   ${RED}❌ Échecs : $FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ CONFIGURATION CORRECTE !${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 Votre configuration pour agri-ps.com est correcte !"
    echo ""
    echo "📝 PROCHAINES ÉTAPES :"
    echo "   1. Copiez .env.local.agri-ps vers .env.local sur votre serveur"
    echo "   2. Exécutez : bash init-hostinger.sh"
    echo "   3. Configurez Nginx avec nginx-agri-ps.conf"
    echo "   4. Installez SSL : sudo certbot --nginx -d agri-ps.com -d www.agri-ps.com"
    echo "   5. Testez : https://agri-ps.com"
    echo ""
    echo "📖 Guide complet : INSTALLATION-AGRI-PS.md"
    echo ""
    exit 0
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${RED}⚠️  PROBLÈMES DÉTECTÉS${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "❌ Des vérifications ont échoué."
    echo ""
    echo "Consultez les erreurs ci-dessus et corrigez-les."
    echo ""
    exit 1
fi
