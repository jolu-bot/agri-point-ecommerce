#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Nettoie le projet agri-point en production
.DESCRIPTION
    Archive les fichiers obsolètes, nettoie les temporaires, prépare pour commit
.NOTES
    Date: 16 février 2026
    Production Ready Cleanup
#>

$ErrorActionPreference = "Continue"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧹 NETTOYAGE PRODUCTION - agri-point" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Compteurs
$archived = 0
$deleted = 0
$kept = 0

# ===== 1. ANCIENS RAPPORTS LIGHTHOUSE =====
Write-Host "📊 Nettoyage des rapports Lighthouse..." -ForegroundColor Yellow

$oldReports = @(
    "lighthouse-report.json",
    "lighthouse-prod-report.json",
    "lighthouse-prod-report-optimized.json", 
    "lighthouse-prod-report-final.json",
    "lighthouse-prod-retry.json"
)

foreach ($file in $oldReports) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "archive\old-reports\" -Force
        Write-Host "   ✅ Archivé: $file" -ForegroundColor Green
        $archived++
    }
}

# Garder le dernier rapport
if (Test-Path "lighthouse-post-optimization.json") {
    Write-Host "   📌 Conservé: lighthouse-post-optimization.json (dernier rapport)" -ForegroundColor Cyan
    $kept++
}

# ===== 2. SCRIPTS TEMPORAIRES =====
Write-Host "`n🔧 Nettoyage des scripts temporaires..." -ForegroundColor Yellow

$tempScripts = @(
    "check-db.js",
    "insert-campaign.js",
    "CACHE-CONFIG.js",
    "OPTIMISATIONS-PRIORITAIRES.js"
)

foreach ($file in $tempScripts) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "archive\old-scripts\" -Force
        Write-Host "   ✅ Archivé: $file" -ForegroundColor Green
        $archived++
    }
}

# ===== 3. DOCUMENTATION OBSOLÈTE =====
Write-Host "`n📄 Nettoyage de la documentation obsolète..." -ForegroundColor Yellow

$oldDocs = @(
    "DEPLOIEMENT-EN-COURS.md",
    "PROJET-TERMINE.md",
    "ANALYSE-COMPLETE.md",
    "DEPLOYMENT-NOTES.md",
    "ACTION-PLAN.md",
    "TODO-LISTE.md",
    "RESUME-VISUEL.txt"
)

foreach ($file in $oldDocs) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "archive\old-docs\" -Force
        Write-Host "   ✅ Archivé: $file" -ForegroundColor Green
        $archived++
    }
}

# ===== 4. FICHIERS DIVERS =====
Write-Host "`n🗂️  Nettoyage des fichiers divers..." -ForegroundColor Yellow

# Campost logo dans root (devrait être dans public/)
if (Test-Path "Campost_logo.png") {
    if (Test-Path "public\images\Campost_logo.png") {
        Remove-Item "Campost_logo.png" -Force
        Write-Host "   ✅ Supprimé: Campost_logo.png (doublon)" -ForegroundColor Green
        $deleted++
    } else {
        Move-Item -Path "Campost_logo.png" -Destination "public\images\" -Force
        Write-Host "   ✅ Déplacé: Campost_logo.png → public/images/" -ForegroundColor Green
        $archived++
    }
}

# ===== 5. DOSSIER TMP =====
if (Test-Path "tmp") {
    Write-Host "`n🗑️  Nettoyage du dossier tmp/..." -ForegroundColor Yellow
    $tmpFiles = Get-ChildItem "tmp" -Recurse -File
    foreach ($file in $tmpFiles) {
        Remove-Item $file.FullName -Force
        $deleted++
    }
    Write-Host "   ✅ Supprimé: $($tmpFiles.Count) fichiers temporaires" -ForegroundColor Green
}

# ===== 6. NODE_MODULES CACHE (optionnel) =====
Write-Host "`n📦 Cache node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    $cacheSize = (Get-ChildItem "node_modules\.cache" -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $cacheSizeMB = [math]::Round($cacheSize / 1MB, 2)
    Write-Host "   📊 Cache: $cacheSizeMB MB" -ForegroundColor Cyan
    
    if ($cacheSizeMB -gt 100) {
        Write-Host "   ⚠️  Cache lourd. Pour nettoyer: npm run clean" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Cache OK (< 100MB)" -ForegroundColor Green
    }
}

# ===== 7. VÉRIFICATION BUILD =====
Write-Host "`n🔨 Vérification .next/..." -ForegroundColor Yellow
if (Test-Path ".next") {
    $buildSize = (Get-ChildItem ".next" -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $buildSizeMB = [math]::Round($buildSize / 1MB, 2)
    Write-Host "   📊 Build: $buildSizeMB MB" -ForegroundColor Cyan
    Write-Host "   ✅ Build présent et prêt" -ForegroundColor Green
    $kept++
}

# ===== RÉSUMÉ =====
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DU NETTOYAGE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "   📦 Fichiers archivés:  $archived" -ForegroundColor Green
Write-Host "   🗑️  Fichiers supprimés: $deleted" -ForegroundColor Yellow
Write-Host "   📌 Fichiers conservés: $kept" -ForegroundColor Cyan

# ===== DOCUMENTATION CONSERVÉE =====
Write-Host "`n📚 Documentation ACTIVE conservée:" -ForegroundColor Cyan

$activeDocs = @{
    "CORRECTION-ERREUR-503-RESUME.md" = "Résumé erreur 503"
    "HOSTINGER-DEPLOY-NOW-AGRI-PS.md" = "Guide déploiement rapide"
    "HOSTINGER-DOMAIN-FIX-AGRI-PS.md" = "Guide complet erreur 503"
    "CHECKLIST-ERREUR-503.md" = "Checklist déploiement"
    "INVENTORY-CHANGES-ERREUR-503.md" = "Inventaire changements"
    "CAMPAGNE-ENGRAIS-MARS-2026.md" = "Spécifications campagne"
    "GO-LIVE-ACTIVATION-PROCEDURES.md" = "Procédures go-live"
    "POST-LAUNCH-MONITORING.md" = "Monitoring post-lancement"
    "GUIDE-TEST-CAMPAGNE.md" = "Guide testing"
    "PHASE-8-DELIVERY.md" = "Livraison Phase 8"
}

foreach ($doc in $activeDocs.GetEnumerator()) {
    if (Test-Path $doc.Key) {
        Write-Host "   ✅ $($doc.Key) - $($doc.Value)" -ForegroundColor Green
    }
}

Write-Host "`nNettoyage termine! Projet pret pour production.`n" -ForegroundColor Green
