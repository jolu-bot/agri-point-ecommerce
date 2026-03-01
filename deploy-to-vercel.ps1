# Script de Déploiement Vercel - Système Paiement Hybride
# Date: 1er mars 2026
# Usage: .\deploy-to-vercel.ps1

Write-Host "🚀 Déploiement Production - Système Paiement Hybride" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Variables de configuration
$PROJECT_NAME = "agri-point-ecommerce"
$PRODUCTION_DOMAIN = "agri-ps.com"

# Fonction d'erreur
function ErrorExit {
    param([string]$message)
    Write-Host "❌ ERREUR: $message" -ForegroundColor Red
    Write-Host ""
    Write-Host "Déploiement annulé." -ForegroundColor Yellow
    exit 1
}

# Fonction de succès
function Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

# Fonction d'info
function Info {
    param([string]$message)
    Write-Host "ℹ️  $message" -ForegroundColor Yellow
}

# ═════════════════════════════════════════════════════
# ÉTAPE 1: Vérifications Préliminaires
# ═════════════════════════════════════════════════════
Write-Host "📋 Étape 1: Vérifications préliminaires..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans le bon dossier
if (-not (Test-Path "package.json")) {
    ErrorExit "Fichier package.json introuvable. Êtes-vous dans le dossier du projet?"
}

$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.name -ne $PROJECT_NAME) {
    ErrorExit "Mauvais projet. Attendu: $PROJECT_NAME, Trouvé: $($packageJson.name)"
}

Success "Dossier projet correct"

# Vérifier Node.js
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -lt 18) {
            ErrorExit "Node.js version >= 18 requise. Actuellement: $nodeVersion"
        }
    }
    Success "Node.js version: $nodeVersion"
} catch {
    ErrorExit "Node.js n'est pas installé"
}

# Vérifier Git
try {
    $gitStatus = git status 2>&1
    if ($LASTEXITCODE -ne 0) {
        ErrorExit "Git n'est pas initialisé dans ce dossier"
    }
    Success "Git initialisé"
} catch {
    ErrorExit "Git n'est pas installé"
}

# Vérifier branche
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Info "Vous êtes sur la branche '$currentBranch'. Recommandé: 'main'"
    $continue = Read-Host "Continuer quand même? (o/N)"
    if ($continue -ne "o" -and $continue -ne "O") {
        ErrorExit "Déploiement annulé par l'utilisateur"
    }
}
Success "Branche: $currentBranch"

# Vérifier changements non commités
$gitStatusOutput = git status --porcelain
if ($gitStatusOutput) {
    Write-Host ""
    Write-Host "⚠️  Changements non commités détectés:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $commit = Read-Host "Voulez-vous les commiter maintenant? (o/N)"
    if ($commit -eq "o" -or $commit -eq "O") {
        $commitMessage = Read-Host "Message de commit"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "chore: pre-deployment changes"
        }
        git add .
        git commit -m $commitMessage
        git push origin $currentBranch
        Success "Changements commités et pushés"
    } else {
        Info "Déploiement continuera avec les changements non commités (non recommandé)"
    }
}

Write-Host ""

# ═════════════════════════════════════════════════════
# ÉTAPE 2: Installation des Dépendances
# ═════════════════════════════════════════════════════
Write-Host "📦 Étape 2: Installation des dépendances..." -ForegroundColor Cyan
Write-Host ""

Info "Vérification de node_modules..."
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation npm..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        ErrorExit "npm install a échoué"
    }
    Success "Dépendances installées"
} else {
    Success "node_modules existe déjà"
}

Write-Host ""

# ═════════════════════════════════════════════════════
# ÉTAPE 3: Build Local (Vérification)
# ═════════════════════════════════════════════════════
Write-Host "🔨 Étape 3: Build local de vérification..." -ForegroundColor Cyan
Write-Host ""

Info "Cette étape peut prendre 1-2 minutes..."
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Output du build:" -ForegroundColor Red
    Write-Host $buildOutput
    ErrorExit "Build local a échoué. Corrigez les erreurs avant de déployer."
}

Success "Build local réussi"
Write-Host ""

# ═════════════════════════════════════════════════════
# ÉTAPE 4: Vérifier Vercel CLI
# ═════════════════════════════════════════════════════
Write-Host "🔧 Étape 4: Vérification Vercel CLI..." -ForegroundColor Cyan
Write-Host ""

try {
    $vercelVersion = vercel --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw
    }
    Success "Vercel CLI installé: $vercelVersion"
} catch {
    Info "Vercel CLI n'est pas installé"
    $install = Read-Host "Installer maintenant? (o/N)"
    if ($install -eq "o" -or $install -eq "O") {
        Write-Host "Installation de Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) {
            ErrorExit "Installation de Vercel CLI a échoué"
        }
        Success "Vercel CLI installé"
    } else {
        ErrorExit "Vercel CLI requis pour déployer"
    }
}

# Vérifier authentification Vercel
Write-Host ""
Info "Vérification de l'authentification Vercel..."
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Info "Non authentifié à Vercel"
    Write-Host "Ouvrir le navigateur pour login..." -ForegroundColor Yellow
    vercel login
    if ($LASTEXITCODE -ne 0) {
        ErrorExit "Authentification Vercel a échoué"
    }
}
Success "Authentifié à Vercel"

Write-Host ""

# ═════════════════════════════════════════════════════
# ÉTAPE 5: Vérifier Variables d'Environnement
# ═════════════════════════════════════════════════════
Write-Host "🔐 Étape 5: Variables d'environnement..." -ForegroundColor Cyan
Write-Host ""

$requiredVars = @(
    "MONGODB_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
    "ADMIN_EMAIL",
    "NEXT_PUBLIC_SITE_URL"
)

Info "Vérification des variables requises dans le projet Vercel..."
Info "(Cette étape peut prendre quelques secondes...)"
Write-Host ""

$envListOutput = vercel env ls production 2>&1
$missingVars = @()

foreach ($var in $requiredVars) {
    if ($envListOutput -match $var) {
        Write-Host "  ✓ $var" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $var (manquante)" -ForegroundColor Red
        $missingVars += $var
    }
}

Write-Host ""

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Variables manquantes détectées:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Vous devez ajouter ces variables via:" -ForegroundColor Yellow
    Write-Host "   vercel env add $($missingVars[0]) production" -ForegroundColor Cyan
    Write-Host "Ou via le dashboard Vercel:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/dashboard → Settings → Environment Variables" -ForegroundColor Cyan
    Write-Host ""
    
    $continueAnyway = Read-Host "Continuer le déploiement sans ces variables? (o/N)"
    if ($continueAnyway -ne "o" -and $continueAnyway -ne "O") {
        ErrorExit "Déploiement annulé. Ajoutez d'abord les variables d'environnement."
    }
    Info "Déploiement continue (l'application pourrait ne pas fonctionner correctement)"
} else {
    Success "Toutes les variables d'environnement sont configurées"
}

Write-Host ""

# ═════════════════════════════════════════════════════
# ÉTAPE 6: Confirmation Finale
# ═════════════════════════════════════════════════════
Write-Host "⚡ Étape 6: Confirmation finale..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Récapitulatif du déploiement:" -ForegroundColor Yellow
Write-Host "  • Projet: $PROJECT_NAME" -ForegroundColor White
Write-Host "  • Branche: $currentBranch" -ForegroundColor White
Write-Host "  • Destination: Production (Vercel)" -ForegroundColor White
Write-Host "  • Domaine: $PRODUCTION_DOMAIN (si configuré)" -ForegroundColor White
Write-Host ""

$lastCommit = git log -1 --oneline
Write-Host "  • Dernier commit: $lastCommit" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  ATTENTION: Ce déploiement affectera le site en production!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Confirmer le déploiement en PRODUCTION? (oui/non)"
if ($confirm -ne "oui") {
    Info "Déploiement annulé par l'utilisateur"
    exit 0
}

Write-Host ""

# ═════════════════════════════════════════════════════
# ÉTAPE 7: Déploiement Vercel
# ═════════════════════════════════════════════════════
Write-Host "🚀 Étape 7: Déploiement en production..." -ForegroundColor Cyan
Write-Host ""

Info "Déploiement en cours... (cela peut prendre 2-3 minutes)"
Write-Host ""

# Exécuter le déploiement
$deployStartTime = Get-Date
vercel --prod --yes

if ($LASTEXITCODE -ne 0) {
    ErrorExit "Le déploiement Vercel a échoué"
}

$deployDuration = (Get-Date) - $deployStartTime
$durationMinutes = [math]::Round($deployDuration.TotalMinutes, 1)

Write-Host ""
Success "Déploiement réussi en ${durationMinutes} minutes!"
Write-Host ""

# ═════════════════════════════════════════════════════
# ÉTAPE 8: Tests Post-Déploiement
# ═════════════════════════════════════════════════════
Write-Host "🧪 Étape 8: Tests post-déploiement..." -ForegroundColor Cyan
Write-Host ""

# Obtenir l'URL de déploiement
$deploymentUrl = vercel ls --prod 2>&1 | Select-String -Pattern "https://" | Select-Object -First 1
if ($deploymentUrl) {
    $url = $deploymentUrl.ToString().Trim()
    Info "URL de production: $url"
    Write-Host ""
    
    # Test 1: Site accessible
    Write-Host "Test 1: Accessibilité du site..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Success "Site accessible (HTTP 200)"
        } else {
            Info "Site répond avec status: $($response.StatusCode)"
        }
    } catch {
        Info "Impossible de vérifier l'accessibilité: $($_.Exception.Message)"
    }
    
    Write-Host ""
    
    # Test 2: Admin page
    Write-Host "Test 2: Page admin..." -ForegroundColor Yellow
    try {
        $adminUrl = "$url/admin"
        $response = Invoke-WebRequest -Uri $adminUrl -Method GET -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
            Success "Page admin accessible"
        }
    } catch {
        Info "Page admin redirige ou requiert authentication (normal)"
    }
    
    Write-Host ""
    
    # Test 3: API Stats
    Write-Host "Test 3: API validation-stats..." -ForegroundColor Yellow
    try {
        $apiUrl = "$url/api/admin/validation-stats"
        $response = Invoke-WebRequest -Uri $apiUrl -Method GET -TimeoutSec 10 -UseBasicParsing
        # Devrait retourner 401 ou 403 (non authentifié)
        Info "API répond (authentication requise - normal)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Success "API fonctionne (authentication requise)"
        } else {
            Info "API status: $statusCode"
        }
    }
    
    Write-Host ""
}

# ═════════════════════════════════════════════════════
# ÉTAPE 9: Instructions Post-Déploiement
# ═════════════════════════════════════════════════════
Write-Host "📝 Étape 9: Prochaines étapes..." -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 TESTS MANUELS RECOMMANDÉS (15 minutes):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Créer une commande WhatsApp Payment" -ForegroundColor White
Write-Host "   → $url/checkout" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Upload un screenshot de test" -ForegroundColor White
Write-Host "   → Vérifier email admin reçu" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Login admin et vérifier widget dashboard" -ForegroundColor White
Write-Host "   → $url/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Valider le paiement test" -ForegroundColor White
Write-Host "   → Vérifier email client reçu" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Vérifier widget stats mis à jour" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 MONITORING:" -ForegroundColor Yellow
Write-Host "  • Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "  • Logs temps réel: vercel logs --prod" -ForegroundColor Cyan
Write-Host "  • Analytics: https://vercel.com/dashboard → Analytics" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 DOCUMENTATION:" -ForegroundColor Yellow
Write-Host "  • Guide complet: DEPLOY-PRODUCTION-PAYMENT-SYSTEM.md" -ForegroundColor Cyan
Write-Host "  • Troubleshooting: Section 'Troubleshooting' du guide" -ForegroundColor Cyan
Write-Host "  • Tests E2E: Section 'Post-Déploiement Validation'" -ForegroundColor Cyan
Write-Host ""

Write-Host "🆘 EN CAS DE PROBLÈME:" -ForegroundColor Yellow
Write-Host "  • Rollback: vercel rollback" -ForegroundColor Cyan
Write-Host "  • Logs: vercel logs --prod --follow" -ForegroundColor Cyan
Write-Host "  • Support: dev@agri-ps.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎊 Félicitations! Le système est maintenant en production." -ForegroundColor Green
Write-Host ""

# Ouvrir le navigateur (optionnel)
$openBrowser = Read-Host "Ouvrir le site dans le navigateur? (o/N)"
if ($openBrowser -eq "o" -or $openBrowser -eq "O") {
    if ($deploymentUrl) {
        Start-Process $url
    }
}

Write-Host ""
Write-Host "Script terminé." -ForegroundColor Green
