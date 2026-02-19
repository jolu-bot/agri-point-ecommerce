# ============================================================================
# DEPLOIEMENT AVEC MOT DE PASSE - AGRI-PS.COM
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$true)]
    [System.Security.SecureString]$VpsPassword,
    
    [string]$VpsUser = "root",
    [int]$VpsPort = 65002,
    [string]$AppDir = "/var/www/agri-point-ecommerce",
    [string]$GitBranch = "main"
)

$ErrorActionPreference = "Continue"

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT AGRI-PS.COM" -ForegroundColor Green
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  VPS: $VpsHost" -ForegroundColor White
Write-Host "  Port: $VpsPort" -ForegroundColor White
Write-Host "  User: $VpsUser" -ForegroundColor White
Write-Host "  App: $AppDir`n" -ForegroundColor White

# Fonction pour executer une commande SSH
function Invoke-RemoteCommand {
    param(
        [string]$Command,
        [string]$Step
    )
    
    Write-Host "[$Step] ..." -ForegroundColor Cyan
    
    # Creer un fichier temporaire pour le script
    $tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
    Set-Content -Path $tempScript -Value $Command -Encoding ASCII
    
    # Utiliser plink si disponible, sinon sshpass, sinon methode standard
    $plinkPath = Get-Command plink.exe -ErrorAction SilentlyContinue
    
    # Convertir SecureString en texte clair pour l'utilisation (uniquement en m\u00e9moire)
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($VpsPassword)
    $PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    
    if ($plinkPath) {
        & plink.exe -batch -pw $PlainPassword -P $VpsPort \"$VpsUser@$VpsHost\" $Command 2>&1 | Out-Null
    } else {
        # Methode alternative: creer un script expect
        Write-Host \"Utilisation de SSH standard...\" -ForegroundColor Yellow
        
        # Pour l'instant, on va utiliser une approche plus simple
        # En vous guidant commande par commande
        Write-Host \"COMMANDE A EXECUTER:\" -ForegroundColor Yellow
        Write-Host $Command -ForegroundColor White
        Write-Host \"(Le mot de passe sera demande)\" -ForegroundColor Gray
        
        & ssh -o StrictHostKeyChecking=no -p $VpsPort \"$VpsUser@$VpsHost\" $Command
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK`n" -ForegroundColor Green
        return $true
    } else {
        Write-Host "ERREUR`n" -ForegroundColor Red
        return $false
    }
}

# ============================================================================
# METHODE ALTERNATIVE: SCRIPT BASH A DISTANCE
# ============================================================================

Write-Host "Creation du script de deploiement sur le VPS..." -ForegroundColor Cyan

# Creer le script de deploiement
$deployScript = @"
#!/bin/bash
set -e

echo ''
echo '==========================================='
echo '  DEPLOIEMENT AGRI-PS.COM'
echo '==========================================='
echo ''

# Variables
APP_DIR='$AppDir'
GIT_BRANCH='$GitBranch'

echo '[1/5] Pull du code depuis Git...'
cd `$APP_DIR
git fetch origin
git reset --hard origin/`$GIT_BRANCH
echo 'OK'
echo ''

echo '[2/5] Configuration environnement...'
cp .env.production .env 2>/dev/null || true
echo 'OK'
echo ''

echo '[3/5] Installation dependances...'
npm install --production
echo 'OK'
echo ''

echo '[4/5] Build de l application...'
npm run build
echo 'OK'
echo ''

echo '[5/5] Redemarrage PM2...'
pm2 stop agripoint-production 2>/dev/null || true
pm2 delete agripoint-production 2>/dev/null || true
pm2 start npm --name 'agripoint-production' -- start
pm2 save
echo 'OK'
echo ''

echo '==========================================='
echo '  DEPLOIEMENT TERMINE'
echo '==========================================='
echo ''

# Verification
sleep 5
HTTP_CODE=`$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000)
echo "Code HTTP local: `$HTTP_CODE"

if [ "`$HTTP_CODE" = "200" ]; then
    echo 'Application demarree avec succes!'
else
    echo 'ATTENTION: Code HTTP inattendu'
    echo 'Verifiez les logs: pm2 logs agripoint-production'
fi

echo ''
pm2 list
"@

# Sauvegarder le script localement
$localDeployScript = ".\deploy-remote.sh"
Set-Content -Path $localDeployScript -Value $deployScript -Encoding UTF8

Write-Host "Script cree: $localDeployScript`n" -ForegroundColor Green

# ============================================================================
# INSTRUCTION POUR L'UTILISATEUR
# ============================================================================

Write-Host "===============================================" -ForegroundColor Yellow
Write-Host " INSTRUCTIONS MANUELLES" -ForegroundColor Yellow
Write-Host "===============================================`n" -ForegroundColor Yellow

Write-Host "1. POUSSER LE CODE VERS GIT:" -ForegroundColor Cyan
Write-Host "   git push origin main`n" -ForegroundColor White

Write-Host "2. COPIER LE SCRIPT SUR LE VPS:" -ForegroundColor Cyan
Write-Host "   scp -P $VpsPort .\deploy-remote.sh $VpsUser@${VpsHost}:/root/`n" -ForegroundColor White

Write-Host "3. SE CONNECTER AU VPS:" -ForegroundColor Cyan
Write-Host "   ssh -p $VpsPort $VpsUser@$VpsHost`n" -ForegroundColor White

Write-Host "4. EXECUTER LE SCRIPT:" -ForegroundColor Cyan
Write-Host "   chmod +x /root/deploy-remote.sh" -ForegroundColor White
Write-Host "   /root/deploy-remote.sh`n" -ForegroundColor White

Write-Host "===============================================`n" -ForegroundColor Yellow

# Demander si on veut faire etape 1 automatiquement
$pushGit = Read-Host "Voulez-vous pousser le code vers Git maintenant? (o/N)"

if ($pushGit -eq "o") {
    Write-Host "`nPush vers Git..." -ForegroundColor Cyan
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK - Code pushe vers Git`n" -ForegroundColor Green
    } else {
        Write-Host "ERREUR lors du push Git`n" -ForegroundColor Red
    }
}

Write-Host "PROCHAINE ETAPE:" -ForegroundColor Yellow
Write-Host "Copiez le fichier deploy-remote.sh sur le VPS avec:" -ForegroundColor White
Write-Host "scp -P $VpsPort .\deploy-remote.sh $VpsUser@${VpsHost}:/root/" -ForegroundColor Cyan
Write-Host "`nEntrez le mot de passe lorsque demande.`n" -ForegroundColor Gray

# Demander si on execute maintenant
$execute = Read-Host "Voulez-vous que je copie le script maintenant? (o/N)"

if ($execute -eq "o") {
    Write-Host "`nCopie du script vers le VPS..." -ForegroundColor Cyan
    Write-Host "(Mot de passe requis)`n" -ForegroundColor Yellow
    
    & scp -P $VpsPort ".\deploy-remote.sh" "${VpsUser}@${VpsHost}:/root/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nOK - Script copie sur le VPS`n" -ForegroundColor Green
        
        Write-Host "Maintenant, voulez-vous executer le deploiement? (o/N)" -ForegroundColor Yellow
        $runDeploy = Read-Host
        
        if ($runDeploy -eq "o") {
            Write-Host "`nExecution du deploiement..." -ForegroundColor Cyan
            Write-Host "(Cela peut prendre 5-10 minutes)`n" -ForegroundColor Yellow
            
            & ssh -t -p $VpsPort "$VpsUser@$VpsHost" "chmod +x /root/deploy-remote.sh && /root/deploy-remote.sh"
            
            Write-Host "`n===============================================" -ForegroundColor Cyan
            Write-Host " DEPLOIEMENT TERMINE!" -ForegroundColor Green
            Write-Host "===============================================`n" -ForegroundColor Cyan
            
            Write-Host "Testez votre site: https://agri-ps.com`n" -ForegroundColor White
        }
    } else {
        Write-Host "`nERREUR lors de la copie du script`n" -ForegroundColor Red
    }
}

Write-Host "`nFichiers crees:" -ForegroundColor Yellow
Write-Host "  - deploy-remote.sh (script de deploiement)`n" -ForegroundColor White

Write-Host "Pour voir les logs plus tard:" -ForegroundColor Yellow
Write-Host "  ssh -p $VpsPort $VpsUser@$VpsHost" -ForegroundColor White
Write-Host "  pm2 logs agripoint-production`n" -ForegroundColor White
