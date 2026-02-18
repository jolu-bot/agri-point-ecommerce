# ============================================================================
# DEPLOIEMENT AUTOMATIQUE AGRI-PS.COM - VERSION SIMPLE
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [string]$VpsUser = "root",
    [int]$VpsPort = 22,
    [string]$AppDir = "/var/www/agri-point-ecommerce",
    [string]$GitBranch = "main"
)

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT AGRI-PS.COM" -ForegroundColor Green
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "Config:" -ForegroundColor Yellow
Write-Host "  VPS: $VpsHost" -ForegroundColor White
Write-Host "  User: $VpsUser" -ForegroundColor White
Write-Host "  Port: $VpsPort" -ForegroundColor White
Write-Host "  App: $AppDir" -ForegroundColor White
Write-Host "  Branch: $GitBranch`n" -ForegroundColor White

# ============================================================================
# ETAPE 1: TEST CONNEXION SSH
# ============================================================================
Write-Host "[1/7] Test connexion SSH..." -ForegroundColor Cyan

$testCmd = "echo 'OK'"
$result = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p $VpsPort "$VpsUser@$VpsHost" $testCmd 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Impossible de se connecter au VPS" -ForegroundColor Red
    Write-Host "Verifiez l'IP, le port et vos credentials SSH" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK - Connexion SSH etablie`n" -ForegroundColor Green

# ============================================================================
# ETAPE 2: GIT PUSH
# ============================================================================
Write-Host "[2/7] Push du code vers Git..." -ForegroundColor Cyan

git push origin $GitBranch 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ATTENTION: Erreur lors du push Git" -ForegroundColor Yellow
    $continue = Read-Host "Continuer quand meme? (o/N)"
    if ($continue -ne "o") {
        exit 1
    }
}

Write-Host "OK - Code pushe vers Git`n" -ForegroundColor Green

# ============================================================================
# ETAPE 3: PULL SUR LE VPS
# ============================================================================
Write-Host "[3/7] Pull du code sur le VPS..." -ForegroundColor Cyan

$pullCmd = "cd $AppDir ; git fetch origin ; git reset --hard origin/$GitBranch"
ssh -p $VpsPort "$VpsUser@$VpsHost" $pullCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Impossible de pull le code" -ForegroundColor Red
    exit 1
}

Write-Host "OK - Code mis a jour sur le VPS`n" -ForegroundColor Green

# ============================================================================
# ETAPE 4: COPIE DU FICHIER .ENV
# ============================================================================
Write-Host "[4/7] Configuration de l'environnement..." -ForegroundColor Cyan

$envCmd = "cd $AppDir ; cp .env.production .env"
ssh -p $VpsPort "$VpsUser@$VpsHost" $envCmd 2>$null

Write-Host "OK - Fichier .env configure`n" -ForegroundColor Green

# ============================================================================
# ETAPE 5: INSTALLATION DES DEPENDANCES
# ============================================================================
Write-Host "[5/7] Installation des dependances..." -ForegroundColor Cyan
Write-Host "Cela peut prendre quelques minutes...`n" -ForegroundColor Yellow

$installCmd = "cd $AppDir ; npm install --production"
ssh -p $VpsPort "$VpsUser@$VpsHost" $installCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Installation des dependances echouee" -ForegroundColor Red
    exit 1
}

Write-Host "OK - Dependances installees`n" -ForegroundColor Green

# ============================================================================
# ETAPE 6: BUILD DE L'APPLICATION
# ============================================================================
Write-Host "[6/7] Build de l'application..." -ForegroundColor Cyan
Write-Host "Cela peut prendre 5-10 minutes...`n" -ForegroundColor Yellow

$buildCmd = "cd $AppDir ; npm run build"
ssh -p $VpsPort "$VpsUser@$VpsHost" $buildCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Build echoue" -ForegroundColor Red
    exit 1
}

Write-Host "OK - Application buildee avec succes`n" -ForegroundColor Green

# ============================================================================
# ETAPE 7: REDEMARRAGE AVEC PM2
# ============================================================================
Write-Host "[7/7] Redemarrage de l'application..." -ForegroundColor Cyan

# Arreter l'instance existante
ssh -p $VpsPort "$VpsUser@$VpsHost" "pm2 stop agripoint-production" 2>$null
ssh -p $VpsPort "$VpsUser@$VpsHost" "pm2 delete agripoint-production" 2>$null

# Demarrer la nouvelle instance
$startCmd = "cd $AppDir ; pm2 start npm --name 'agripoint-production' -- start"
ssh -p $VpsPort "$VpsUser@$VpsHost" $startCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Impossible de demarrer l'application" -ForegroundColor Red
    exit 1
}

# Sauvegarder la config PM2
ssh -p $VpsPort "$VpsUser@$VpsHost" "pm2 save" 2>$null

Write-Host "OK - Application demarree avec PM2`n" -ForegroundColor Green

# ============================================================================
# VERIFICATION
# ============================================================================
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT TERMINE" -ForegroundColor Green
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "Attente de demarrage (15 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`nVerification de l'application..." -ForegroundColor Cyan
$checkCmd = "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000"
$httpCode = ssh -p $VpsPort "$VpsUser@$VpsHost" $checkCmd

Write-Host "Code HTTP local: $httpCode" -ForegroundColor White

if ($httpCode -eq "200") {
    Write-Host "OK - Application repond correctement!" -ForegroundColor Green
} else {
    Write-Host "ATTENTION - Code HTTP inattendu" -ForegroundColor Yellow
}

# Afficher le statut PM2
Write-Host "`nStatut PM2:" -ForegroundColor Cyan
ssh -p $VpsPort "$VpsUser@$VpsHost" "pm2 list"

# Test du domaine public
Write-Host "`nTest du domaine public..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://agri-ps.com" -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "Site accessible sur https://agri-ps.com (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Site pas encore accessible publiquement" -ForegroundColor Yellow
    Write-Host "Causes possibles: DNS, SSL, ou Nginx" -ForegroundColor Yellow
}

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  PROCHAINES ETAPES" -ForegroundColor Green
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "1. Verifier les logs: ssh $VpsUser@$VpsHost 'pm2 logs agripoint-production'" -ForegroundColor White
Write-Host "2. Tester le site: https://agri-ps.com" -ForegroundColor White
Write-Host "3. Activer la campagne: npm run campaign:go-live" -ForegroundColor White
Write-Host "4. Demarrer le monitoring" -ForegroundColor White

Write-Host "`nCommandes utiles:" -ForegroundColor Yellow
Write-Host "  pm2 logs agripoint-production  - Voir les logs" -ForegroundColor White
Write-Host "  pm2 restart agripoint-production  - Redemarrer" -ForegroundColor White
Write-Host "  pm2 status  - Voir le statut" -ForegroundColor White

$viewLogs = Read-Host "`nVoulez-vous voir les logs maintenant? (o/N)"
if ($viewLogs -eq "o") {
    Write-Host "`nOuverture des logs (Ctrl+C pour quitter)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    ssh -t -p $VpsPort "$VpsUser@$VpsHost" "pm2 logs agripoint-production"
}

Write-Host "`nDEPLOIEMENT TERMINE!" -ForegroundColor Green
