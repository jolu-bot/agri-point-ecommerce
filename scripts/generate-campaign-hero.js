#!/usr/bin/env node

/**
 * Générateur d'Image Hero - Campagne Engrais Mars 2026
 * Crée une image 1920x600px avec design agricole
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateHeroImage() {
  try {
    console.log('🎨 Génération de l\'image hero...');
    
    const width = 1920;
    const height = 600;
    
    // Créer l'image avec des couches
    // 1. Fond dégradé (vert agriculture → bleu ciel)
    const svgBackground = `
      <svg width="${width}" height="${height}">
        <!-- Dégradé ciel -->
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#E8F5E9;stop-opacity:1" />
          </linearGradient>
          
          <!-- Dégradé texte -->
          <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#FFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Arrière-plan -->
        <rect width="${width}" height="${height}" fill="url(#skyGrad)"/>
        
        <!-- Vagues de terrain (symbolisant champs) -->
        <ellipse cx="0" cy="${height * 0.65}" rx="${width}" ry="150" fill="#66BB6A" opacity="0.9"/>
        <ellipse cx="200" cy="${height * 0.75}" rx="600" ry="100" fill="#558B2F" opacity="0.7"/>
        <ellipse cx="${width}" cy="${height * 0.7}" rx="700" ry="120" fill="#558B2F" opacity="0.8"/>
        
        <!-- Motif champs -->
        <line x1="0" y1="${height * 0.65}" x2="${width}" y2="${height * 0.65}" stroke="#2E7D32" stroke-width="2" opacity="0.4"/>
        
        <!-- Représentation sacs d'engrais (gauche) -->
        <!-- Sac 1 -->
        <rect x="150" y="320" width="80" height="140" fill="#D4A574" rx="5"/>
        <text x="190" y="380" font-size="20" font-weight="bold" text-anchor="middle" fill="#FFFFFF">NPK</text>
        <text x="190" y="410" font-size="12" text-anchor="middle" fill="#FFFFFF">15,000 F</text>
        
        <!-- Sac 2 -->
        <rect x="280" y="340" width="80" height="140" fill="#A67C52" rx="5"/>
        <text x="320" y="400" font-size="20" font-weight="bold" text-anchor="middle" fill="#FFFFFF">NPK</text>
        <text x="320" y="430" font-size="12" text-anchor="middle" fill="#FFFFFF">50kg</text>
        
        <!-- Sac 3 -->
        <rect x="410" y="360" width="80" height="140" fill="#8B6F47" rx="5"/>
        <text x="450" y="420" font-size="20" font-weight="bold" text-anchor="middle" fill="#FFFFFF">NPK</text>
        <text x="450" y="450" font-size="12" text-anchor="middle" fill="#FFFFFF">Minéral</text>
        
        <!-- Biofertilisants (droite) -->
        <!-- Bouteille 1 -->
        <ellipse cx="1450" cy="280" rx="40" ry="60" fill="#4CAF50"/>
        <rect x="1410" y="340" width="80" height="120" fill="#81C784" rx="3"/>
        <text x="1450" y="390" font-size="14" font-weight="bold" text-anchor="middle" fill="#FFFFFF">BIO</text>
        <text x="1450" y="425" font-size="11" text-anchor="middle" fill="#FFFFFF">10,000 F</text>
        
        <!-- Bouteille 2 -->
        <ellipse cx="1600" cy="300" rx="40" ry="60" fill="#558B2F"/>
        <rect x="1560" y="360" width="80" height="120" fill="#A5D6A7" rx="3"/>
        <text x="1600" y="410" font-size="14" font-weight="bold" text-anchor="middle" fill="#FFFFFF">BIO</text>
        <text x="1600" y="445" font-size="11" text-anchor="middle" fill="#FFFFFF">5L</text>
        
        <!-- Overlay semi-transparent pour le texte -->
        <rect width="${width}" height="${height}" fill="#000000" opacity="0.35"/>
        
        <!-- Texte principal -->
        <text x="${width / 2}" y="140" font-size="72" font-weight="bold" text-anchor="middle" fill="url(#textGrad)" font-family="Arial, sans-serif">
          CAMPAGNE ENGRAIS
        </text>
        
        <text x="${width / 2}" y="200" font-size="56" font-weight="bold" text-anchor="middle" fill="#FFD700" font-family="Arial, sans-serif">
          MARS 2026
        </text>
        
        <!-- Sous-titre -->
        <text x="${width / 2}" y="270" font-size="32" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif">
          Subvention Gouvernementale - Paiement 70/30
        </text>
        
        <!-- CTA -->
        <rect x="${width / 2 - 200}" y="340" width="400" height="80" fill="#FFC107" rx="10"/>
        <text x="${width / 2}" y="395" font-size="36" font-weight="bold" text-anchor="middle" fill="#333333" font-family="Arial, sans-serif">
          Je M'Inscris
        </text>
      </svg>
    `;
    
    // Créer le répertoire s'il n'existe pas
    const dir = path.join(process.cwd(), 'public', 'images', 'campaigns');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Dossier créé: ${dir}`);
    }
    
    // Générer l'image
    const outputPath = path.join(dir, 'engrais-mars-2026-hero.jpg');
    
    await sharp(Buffer.from(svgBackground))
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    const sizeKb = (stats.size / 1024).toFixed(2);
    
    console.log(`✅ Image générée avec succès!`);
    console.log(`📍 Chemin: ${outputPath}`);
    console.log(`💾 Taille: ${sizeKb} KB`);
    console.log(`📐 Dimensions: ${width}x${height}px`);
    console.log(`\n🌾 Image prête pour la campagne d'engrais!`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    
    if (error.message.includes('Cannot find module')) {
      console.log('\n📦 Installation de sharp requise:');
      console.log('   npm install sharp');
    }
    
    process.exit(1);
  }
}

generateHeroImage();
