# Script d'Ajout Variables d'Environnement à Vercel
# Date: 1er mars 2026
# Usage: .\add-env-to-vercel.ps1 -EnvFile ".env.production.local"

param(
    [string]$EnvFile = ".env.production.local",
    [string]$Environment = "production"
)

Write-Host "🔐 Ajout Variables d'Environnement à Vercel" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le fichier existe
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ ERREUR: Fichier $EnvFile introuvable" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instructions:" -ForegroundColor Yellow
    Write-Host "1. Copier .env.production.template vers .env.production.local" -ForegroundColor White
    Write-Host "2. Remplir toutes les valeurs entre < >" -ForegroundColor White
    Write-Host "3. Re-lancer ce script" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Fichier trouvé: $EnvFile" -ForegroundColor Green
Write-Host ""

# Vérifier Vercel CLI
try {
    $vercelVersion = vercel --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw
    }
    Write-Host "✓ Vercel CLI: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI non installé" -ForegroundColor Red
    Write-Host "Installer avec: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Vérifier authentification
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Non authentifié à Vercel" -ForegroundColor Red
    Write-Host "Exécuter: vercel login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Authentifié à Vercel" -ForegroundColor Green
Write-Host ""

# Lire le fichier .env
$envContent = Get-Content $EnvFile -Raw
$envLines = $envContent -split "`n"

# Parser les variables
$variables = @()
$skipped = @()
$warnings = @()

foreach ($line in $envLines) {
    $line = $line.Trim()
    
    # Ignorer commentaires et lignes vides
    if ($line.StartsWith("#") -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }
    
    # Parser variable=valeur
    if ($line -match "^([A-Z_][A-Z0-9_]*)=(.+)$") {
        $varName = $matches[1]
        $varValue = $matches[2].Trim()
        
        # Détecter valeurs non remplies (contient < >)
        if ($varValue -match "<.*>") {
            $warnings += $varName
            continue
        }
        
        # Retirer quotes si présentes
        if ($varValue.StartsWith('"') -and $varValue.EndsWith('"')) {
            $varValue = $varValue.Substring(1, $varValue.Length - 2)
        }
        if ($varValue.StartsWith("'") -and $varValue.EndsWith("'")) {
            $varValue = $varValue.Substring(1, $varValue.Length - 2)
        }
        
        $variables += @{
            Name = $varName
            Value = $varValue
        }
    }
}

Write-Host "📊 Analyse du fichier:" -ForegroundColor Cyan
Write-Host "  Variables valides: $($variables.Count)" -ForegroundColor Green
Write-Host "  Valeurs manquantes: $($warnings.Count)" -ForegroundColor Yellow
Write-Host ""

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Variables non remplies (ignorées):" -ForegroundColor Yellow
    foreach ($var in $warnings) {
        Write-Host "    - $var" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($variables.Count -eq 0) {
    Write-Host "❌ Aucune variable valide trouvée" -ForegroundColor Red
    Write-Host "Vérifiez que vous avez bien rempli les valeurs dans $EnvFile" -ForegroundColor Yellow
    exit 1
}

# Afficher les variables qui seront ajoutées
Write-Host "🎯 Variables à ajouter à Vercel ($Environment):" -ForegroundColor Cyan
Write-Host ""
foreach ($var in $variables) {
    $displayValue = $var.Value
    # Masquer les secrets (montrer que 4 premiers caractères)
    if ($var.Name -match "SECRET|PASS|KEY|TOKEN|DSN") {
        if ($displayValue.Length -gt 8) {
            $displayValue = $displayValue.Substring(0, 4) + "..." + $displayValue.Substring($displayValue.Length - 4)
        } else {
            $displayValue = "****"
        }
    }
    Write-Host "  • $($var.Name) = $displayValue" -ForegroundColor White
}

Write-Host ""
Write-Host "⚠️  Cette opération va ajouter ces variables à votre projet Vercel." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continuer? (o/N)"
if ($confirm -ne "o" -and $confirm -ne "O") {
    Write-Host "Annulé." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Ajout des variables à Vercel..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($var in $variables) {
    Write-Host "Ajout de $($var.Name)..." -ForegroundColor Yellow
    
    # Vérifier si la variable existe déjà
    $existingVars = vercel env ls $Environment 2>&1
    if ($existingVars -match $var.Name) {
        Write-Host "  ⚠️  Variable existe déjà, ignorée" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    # Ajouter la variable
    # Utiliser echo pour passer la valeur à stdin
    $addResult = echo $var.Value | vercel env add $var.Name $Environment 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Ajoutée avec succès" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  ✗ Échec: $addResult" -ForegroundColor Red
        $failCount++
    }
    
    # Petite pause pour éviter rate limiting
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Ajoutées: $successCount" -ForegroundColor Green
if ($skippedCount -gt 0) {
    Write-Host "  ⏭️  Ignorées (existantes): $skippedCount" -ForegroundColor Yellow
}
if ($failCount -gt 0) {
    Write-Host "  ❌ Échecs: $failCount" -ForegroundColor Red
}
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "⚠️  Certaines variables n'ont pas pu être ajoutées." -ForegroundColor Yellow
    Write-Host "Vous pouvez les ajouter manuellement avec:" -ForegroundColor Yellow
    Write-Host "  vercel env add NOM_VARIABLE $Environment" -ForegroundColor Cyan
    Write-Host ""
}

# Vérifications finales
Write-Host "🔍 Vérification finale des variables critiques..." -ForegroundColor Cyan
Write-Host ""

$criticalVars = @(
    "MONGODB_URI",
    "JWT_SECRET",
    "EMAIL_HOST",
    "EMAIL_USER",
    "EMAIL_PASS",
    "ADMIN_EMAIL",
    "NEXT_PUBLIC_SITE_URL"
)

$allEnvVars = vercel env ls $Environment 2>&1
$missingCritical = @()

foreach ($criticalVar in $criticalVars) {
    if ($allEnvVars -match $criticalVar) {
        Write-Host "  ✓ $criticalVar" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $criticalVar (CRITIQUE - Manquante!)" -ForegroundColor Red
        $missingCritical += $criticalVar
    }
}

Write-Host ""

if ($missingCritical.Count -gt 0) {
    Write-Host "⚠️  ATTENTION: Variables critiques manquantes!" -ForegroundColor Yellow
    Write-Host "L'application ne fonctionnera pas sans ces variables:" -ForegroundColor Yellow
    foreach ($var in $missingCritical) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Ajoutez-les avec:" -ForegroundColor Yellow
    Write-Host "  vercel env add $($missingCritical[0]) $Environment" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ Toutes les variables critiques sont configurées!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 PROCHAINES ÉTAPES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Vérifier variables dans dashboard Vercel:" -ForegroundColor White
Write-Host "   https://vercel.com/dashboard → Settings → Environment Variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Déployer en production:" -ForegroundColor White
Write-Host "   .\deploy-to-vercel.ps1" -ForegroundColor Cyan
Write-Host "   OU" -ForegroundColor Yellow
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Après déploiement, mettre à jour NEXT_PUBLIC_SITE_URL:" -ForegroundColor White
Write-Host "   vercel env rm NEXT_PUBLIC_SITE_URL $Environment" -ForegroundColor Cyan
Write-Host "   vercel env add NEXT_PUBLIC_SITE_URL $Environment" -ForegroundColor Cyan
Write-Host "   (avec vraie URL: https://agri-ps.com)" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Tests post-déploiement (voir DEPLOY-PRODUCTION-PAYMENT-SYSTEM.md)" -ForegroundColor White
Write-Host ""

Write-Host "✓ Script terminé!" -ForegroundColor Green
Write-Host ""
