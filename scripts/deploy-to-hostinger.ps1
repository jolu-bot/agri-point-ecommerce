# ============================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATIQUE - AGRI-PS.COM
# ============================================================================
# Ce script déploie automatiquement l'application sur Hostinger VPS
# 
# USAGE:
#   .\scripts\deploy-to-hostinger.ps1
#
# PRÉREQUIS:
#   - Git configuré et remote origin défini
#   - Accès SSH au VPS Hostinger
#   - Node.js et npm installés sur le VPS
# ============================================================================

param(
    [string]$VpsHost = "",
    [string]$VpsUser = "root",
    [int]$VpsPort = 22,
    [string]$GitRemote = "origin",
    [string]$GitBranch = "main",
    [switch]$SkipGitPush,
    [switch]$FirstDeploy
)

# Configuration des couleurs
$script:Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    $color = $script:Colors[$Type]
    Write-Host $Message -ForegroundColor $color
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
}

function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-ColorOutput "  → $Description..." "Info"
    
    $sshCmd = "ssh -o StrictHostKeyChecking=no -p $VpsPort $VpsUser@$VpsHost `"$Command`""
    
    try {
        $result = Invoke-Expression $sshCmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "    ✓ $Description - OK" "Success"
            return $true
        } else {
            Write-ColorOutput "    ✗ Erreur: $result" "Error"
            return $false
        }
    } catch {
        Write-ColorOutput "    ✗ Exception: $_" "Error"
        return $false
    }
}

# ============================================================================
# BANNER
# ============================================================================
Clear-Host
Write-Host @"

    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║        DÉPLOIEMENT AUTOMATIQUE - AGRI-PS.COM                 ║
    ║                                                               ║
    ║        🚀 Production Deployment Script                        ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-ColorOutput "Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "Info"
Write-ColorOutput "Répertoire: $(Get-Location)`n" "Info"

# ============================================================================
# ÉTAPE 0: VÉRIFICATION PRÉREQUIS LOCAUX
# ============================================================================
Write-Step "ÉTAPE 0: Vérification des prérequis locaux"

$prerequisites = @(
    @{Name="git"; Display="Git"},
    @{Name="node"; Display="Node.js"},
    @{Name="npm"; Display="NPM"}
)

$missingTools = @()
foreach ($tool in $prerequisites) {
    if (Test-CommandExists $tool.Name) {
        Write-ColorOutput "  ✓ $($tool.Display) installé" "Success"
    } else {
        Write-ColorOutput "  ✗ $($tool.Display) NON trouvé" "Error"
        $missingTools += $tool.Display
    }
}

if ($missingTools.Count -gt 0) {
    Write-ColorOutput "`n⚠ Outils manquants: $($missingTools -join ', ')" "Error"
    Write-ColorOutput "Veuillez installer ces outils avant de continuer." "Warning"
    exit 1
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-ColorOutput "`n⚠ Erreur: package.json introuvable" "Error"
    Write-ColorOutput "Veuillez exécuter ce script depuis la racine du projet." "Warning"
    exit 1
}

Write-ColorOutput "`n✓ Tous les prérequis locaux sont satisfaits" "Success"

# ============================================================================
# ÉTAPE 1: COLLECTE DES INFORMATIONS
# ============================================================================
Write-Step "ÉTAPE 1: Configuration du déploiement"

# Demander les informations manquantes
if ([string]::IsNullOrEmpty($VpsHost)) {
    Write-ColorOutput "Entrez l'adresse IP ou le hostname de votre VPS Hostinger:" "Info"
    Write-ColorOutput "(Exemple: 123.456.789.012 ou vps-xxxxx.hostinger.com)" "Warning"
    $VpsHost = Read-Host "  VPS Host"
    
    if ([string]::IsNullOrEmpty($VpsHost)) {
        Write-ColorOutput "`n⚠ Erreur: L'adresse VPS est obligatoire" "Error"
        exit 1
    }
}

Write-ColorOutput "`nConfiguration:" "Header"
Write-ColorOutput "  • VPS Host: $VpsHost" "Info"
Write-ColorOutput "  • VPS User: $VpsUser" "Info"
Write-ColorOutput "  • VPS Port: $VpsPort" "Info"
Write-ColorOutput "  • Git Remote: $GitRemote" "Info"
Write-ColorOutput "  • Git Branch: $GitBranch" "Info"
Write-ColorOutput "  • Premier déploiement: $FirstDeploy" "Info"

Write-Host "`nAppuyez sur ENTRÉE pour continuer ou Ctrl+C pour annuler..." -ForegroundColor Yellow
Read-Host

# ============================================================================
# ÉTAPE 2: PUSH GIT
# ============================================================================
if (-not $SkipGitPush) {
    Write-Step "ÉTAPE 2: Push du code vers Git"
    
    # Vérifier le statut Git
    Write-ColorOutput "  → Vérification du statut Git..." "Info"
    $gitStatus = git status --short
    
    if ($gitStatus) {
        Write-ColorOutput "  ⚠ Changements non committés détectés:" "Warning"
        Write-Host $gitStatus
        
        $continue = Read-Host "`n  Voulez-vous continuer quand même? (o/N)"
        if ($continue -ne "o" -and $continue -ne "O") {
            Write-ColorOutput "`nDéploiement annulé." "Warning"
            exit 0
        }
    } else {
        Write-ColorOutput "  ✓ Working tree propre" "Success"
    }
    
    # Push vers Git
    Write-ColorOutput "`n  → Push vers $GitRemote/$GitBranch..." "Info"
    git push $GitRemote $GitBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "  ✓ Code pushé avec succès" "Success"
    } else {
        Write-ColorOutput "  ✗ Erreur lors du push Git" "Error"
        Write-ColorOutput "  Voulez-vous continuer quand même? (o/N)" "Warning"
        $continue = Read-Host
        if ($continue -ne "o" -and $continue -ne "O") {
            exit 1
        }
    }
} else {
    Write-ColorOutput "ÉTAPE 2: Push Git ignoré (option -SkipGitPush)" "Warning"
}

# ============================================================================
# ÉTAPE 3: TEST CONNEXION SSH
# ============================================================================
Write-Step "ÉTAPE 3: Test de connexion SSH"

Write-ColorOutput "  → Test de connexion à ${VpsUser}@${VpsHost}:${VpsPort}..." "Info"

$testConnection = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p $VpsPort "$VpsUser@$VpsHost" "echo 'OK'" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "  ✓ Connexion SSH établie avec succès" "Success"
} else {
    Write-ColorOutput "  ✗ Impossible de se connecter au VPS" "Error"
    Write-ColorOutput "`nDétails de l'erreur:" "Warning"
    Write-Host $testConnection
    Write-ColorOutput "`nVérifiez:" "Warning"
    Write-ColorOutput "  1. L'adresse IP/hostname est correcte" "Info"
    Write-ColorOutput "  2. Le port SSH est correct (défaut: 22)" "Info"
    Write-ColorOutput "  3. Vos credentials SSH sont valides" "Info"
    Write-ColorOutput "  4. Le firewall autorise la connexion SSH" "Info"
    exit 1
}

# ============================================================================
# ÉTAPE 4: VÉRIFICATION PRÉREQUIS VPS
# ============================================================================
Write-Step "ÉTAPE 4: Vérification des prérequis sur le VPS"

# Vérifier Node.js
Write-ColorOutput "  → Vérification de Node.js sur le VPS..." "Info"
$nodeVersion = ssh -p $VpsPort "$VpsUser@$VpsHost" "node --version 2>&1" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "  ✓ Node.js: $nodeVersion" "Success"
} else {
    Write-ColorOutput "  ✗ Node.js non installé sur le VPS" "Error"
    Write-ColorOutput "  Installation de Node.js..." "Info"
    
    $installNode = "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - ; apt-get install -y nodejs"
    Invoke-SSHCommand $installNode "Installation de Node.js"
}

# Vérifier npm
Write-ColorOutput "  → Vérification de npm sur le VPS..." "Info"
$npmVersion = ssh -p $VpsPort "$VpsUser@$VpsHost" "npm --version 2>&1" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "  ✓ npm: $npmVersion" "Success"
} else {
    Write-ColorOutput "  ✗ npm non trouvé" "Error"
    exit 1
}

# Vérifier PM2
Write-ColorOutput "  → Vérification de PM2 sur le VPS..." "Info"
$pm2Version = ssh -p $VpsPort "$VpsUser@$VpsHost" "pm2 --version 2>&1" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "  ✓ PM2: $pm2Version" "Success"
} else {
    Write-ColorOutput "  ⚠ PM2 non installé - Installation..." "Warning"
    Invoke-SSHCommand "npm install -g pm2" "Installation de PM2"
}

# Vérifier Git
Write-ColorOutput "  → Vérification de Git sur le VPS..." "Info"
$gitVersionVps = ssh -p $VpsPort "$VpsUser@$VpsHost" "git --version 2>&1" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "  ✓ Git: $gitVersionVps" "Success"
} else {
    Write-ColorOutput "  ⚠ Git non installé - Installation..." "Warning"
    Invoke-SSHCommand "apt-get update ; apt-get install -y git" "Installation de Git"
}

Write-ColorOutput "`n✓ Tous les outils requis sont disponibles sur le VPS" "Success"

# ============================================================================
# ÉTAPE 5: DÉPLOIEMENT DE L'APPLICATION
# ============================================================================
Write-Step "ÉTAPE 5: Déploiement de l'application"

$appDir = "/var/www/agri-point-ecommerce"

if ($FirstDeploy) {
    Write-ColorOutput "  MODE: Premier déploiement (clone du repository)" "Header"
    
    # Créer le répertoire
    Write-ColorOutput "`n  → Création du répertoire $appDir..." "Info"
    Invoke-SSHCommand "mkdir -p $appDir" "Création du répertoire"
    
    # Demander l'URL du repository Git
    Write-ColorOutput "`nEntrez l'URL de votre repository Git:" "Info"
    Write-ColorOutput "(Exemple: https://github.com/username/agri-point-ecommerce.git)" "Warning"
    $repoUrl = Read-Host "  Repository URL"
    
    if ([string]::IsNullOrEmpty($repoUrl)) {
        Write-ColorOutput "⚠ URL du repository nécessaire pour le premier déploiement" "Error"
        exit 1
    }
    
    # Clone du repository
    $cloneCmd = "cd /var/www ; rm -rf agri-point-ecommerce ; git clone $repoUrl agri-point-ecommerce"
    Invoke-SSHCommand $cloneCmd "Clone du repository"
    
} else {
    Write-ColorOutput "  MODE: Mise à jour (pull du code existant)" "Header"
    
    # Pull du code
    $pullCmd = "cd $appDir ; git fetch origin ; git reset --hard origin/$GitBranch"
    Invoke-SSHCommand $pullCmd "Pull du code depuis Git"
}

# ============================================================================
# ÉTAPE 6: CONFIGURATION DE L'ENVIRONNEMENT
# ============================================================================
Write-Step "ÉTAPE 6: Configuration de l'environnement"

Write-ColorOutput "  → Copie de .env.production vers .env..." "Info"
Invoke-SSHCommand "cd $appDir ; cp .env.production .env 2>/dev/null || echo 'Fichier .env existant'" "Configuration .env"

Write-ColorOutput "`n⚠ IMPORTANT: Variables d'environnement à configurer" "Warning"
Write-Host @"

  Vous devez configurer les variables suivantes dans le fichier .env sur le VPS:
  
  1. MONGODB_URI=mongodb+srv://...
  2. JWT_SECRET=votre-secret-jwt
  3. NEXTAUTH_SECRET=votre-secret-nextauth
  4. NEXTAUTH_URL=https://agri-ps.com
  5. NEXT_PUBLIC_SITE_URL=https://agri-ps.com
  
  Voulez-vous éditer le fichier .env maintenant? (o/N)
"@ -ForegroundColor Yellow

$editEnv = Read-Host "  Réponse"

if ($editEnv -eq "o" -or $editEnv -eq "O") {
    Write-ColorOutput "`n  Ouverture de l'éditeur nano via SSH..." "Info"
    Write-ColorOutput "  (Utilisez Ctrl+X, puis Y, puis ENTRÉE pour sauvegarder)" "Info"
    Start-Sleep -Seconds 2
    
    ssh -t -p $VpsPort "$VpsUser@$VpsHost" "nano $appDir/.env"
    
    Write-ColorOutput "`n  ✓ Configuration terminée" "Success"
} else {
    Write-ColorOutput "`n  ⚠ N'oubliez pas de configurer le .env plus tard!" "Warning"
}

# ============================================================================
# ÉTAPE 7: INSTALLATION DES DÉPENDANCES
# ============================================================================
Write-Step "ÉTAPE 7: Installation des dépendances"

Write-ColorOutput "  → Installation de node_modules..." "Info"
Write-ColorOutput "  (Cela peut prendre plusieurs minutes...)" "Warning"

$installCmd = "cd $appDir ; npm install --production"
Invoke-SSHCommand $installCmd "npm install"

# ============================================================================
# ÉTAPE 8: BUILD DE L'APPLICATION
# ============================================================================
Write-Step "ÉTAPE 8: Build de l'application Next.js"

Write-ColorOutput "  → Build de production..." "Info"
Write-ColorOutput "  (Cela peut prendre 5-10 minutes...)" "Warning"

$buildCmd = "cd $appDir ; npm run build"
Invoke-SSHCommand $buildCmd "npm run build"

# ============================================================================
# ÉTAPE 9: DÉMARRAGE AVEC PM2
# ============================================================================
Write-Step "ÉTAPE 9: Démarrage de l'application avec PM2"

# Arrêter l'instance existante si elle existe
Write-ColorOutput "  → Arrêt de l'instance PM2 existante (si présente)..." "Info"
ssh -p $VpsPort "$VpsUser@$VpsHost" "pm2 stop agripoint-production 2>/dev/null || true"
ssh -p $VpsPort "$VpsUser@$VpsHost" "pm2 delete agripoint-production 2>/dev/null || true"

# Démarrer l'application
Write-ColorOutput "`n  → Démarrage de l'application..." "Info"
$startCmd = "cd $appDir ; pm2 start npm --name 'agripoint-production' -- start"
Invoke-SSHCommand $startCmd "Démarrage PM2"

# Configurer le démarrage automatique
Write-ColorOutput "`n  → Configuration du démarrage automatique..." "Info"
Invoke-SSHCommand "pm2 save" "Sauvegarde de la configuration PM2"
Invoke-SSHCommand "pm2 startup systemd -u $VpsUser --hp /root 2>/dev/null || pm2 startup" "Configuration du démarrage automatique"

# ============================================================================
# ÉTAPE 10: VÉRIFICATION DU DÉPLOIEMENT
# ============================================================================
Write-Step "ÉTAPE 10: Vérification du déploiement"

Write-ColorOutput "  → Attente du démarrage de l'application (15 secondes)..." "Info"
Start-Sleep -Seconds 15

# Vérifier le statut PM2
Write-ColorOutput "`n  → Vérification du statut PM2..." "Info"
ssh -p $VpsPort "$VpsUser@$VpsHost" "pm2 list"

# Tester le port local
Write-ColorOutput "`n  → Test de l'application en local (port 3000)..." "Info"
$localTest = ssh -p $VpsPort "$VpsUser@$VpsHost" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000 2>&1"

if ($localTest -eq "200") {
    Write-ColorOutput "  ✓ Application répond sur le port 3000 (HTTP $localTest)" "Success"
} else {
    Write-ColorOutput "  ⚠ L'application ne répond pas correctement (HTTP $localTest)" "Warning"
    Write-ColorOutput "  Vérifiez les logs: pm2 logs agripoint-production" "Info"
}

# Tester le domaine public
Write-ColorOutput "`n  → Test du domaine public https://agri-ps.com..." "Info"
Start-Sleep -Seconds 3

try {
    $publicTest = Invoke-WebRequest -Uri "https://agri-ps.com" -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    $statusCode = $publicTest.StatusCode
    
    if ($statusCode -eq 200) {
        Write-ColorOutput "  ✓ Site accessible sur https://agri-ps.com (HTTP $statusCode)" "Success"
    } else {
        Write-ColorOutput "  ⚠ Réponse inattendue du site (HTTP $statusCode)" "Warning"
    }
} catch {
    Write-ColorOutput "  ⚠ Impossible de contacter https://agri-ps.com" "Warning"
    Write-ColorOutput "  Causes possibles:" "Info"
    Write-ColorOutput "    • DNS pas encore propagé (24-48h)" "Info"
    Write-ColorOutput "    • SSL pas encore configuré" "Info"
    Write-ColorOutput "    • Nginx pas configuré pour proxy" "Info"
}

# ============================================================================
# RÉCAPITULATIF
# ============================================================================
Write-Step "RÉCAPITULATIF DU DÉPLOIEMENT"

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   ✓ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS                          ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝

  📍 Site: https://agri-ps.com
  📍 VPS: $VpsHost
  📍 Application: /var/www/agri-point-ecommerce

  COMMANDES UTILES (via SSH):

  • Voir logs:          pm2 logs agripoint-production
  • Redémarrer:         pm2 restart agripoint-production
  • Arrêter:            pm2 stop agripoint-production
  • Statut:             pm2 status
  • Moniteur:           pm2 monit

  PROCHAINES ÉTAPES:

  1. ✅ Vérifier le site: https://agri-ps.com
  2. ⏳ Configurer le .env (si pas encore fait)
  3. ⏳ Activer la campagne: npm run campaign:go-live
  4. ⏳ Tester le formulaire de commande
  5. ⏳ Envoyer les communications aux clients
  6. ⏳ Démarrer le monitoring

  📚 Documentation: ./HOSTINGER-DEPLOY-NOW-AGRI-PS.md

"@ -ForegroundColor Green

Write-ColorOutput "Déploiement terminé à: $(Get-Date -Format 'HH:mm:ss')" "Info"
Write-Host "`n"

# Demander si on veut voir les logs
$viewLogs = Read-Host "Voulez-vous voir les logs PM2 maintenant? (o/N)"
if ($viewLogs -eq "o" -or $viewLogs -eq "O") {
    Write-ColorOutput "`nOuverture des logs PM2 (Ctrl+C pour quitter)..." "Info"
    Start-Sleep -Seconds 2
    ssh -t -p $VpsPort "$VpsUser@$VpsHost" "pm2 logs agripoint-production"
}

Write-ColorOutput "`n🎉 Merci d'avoir utilisé le script de déploiement automatique!" "Success"
