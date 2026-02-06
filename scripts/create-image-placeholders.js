#!/usr/bin/env node

/**
 * Script pour créer des placeholders d'images manquantes
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const productsDir = path.join(publicDir, 'products');

// Images manquantes détectées
const missingImages = [
  'icon-floraison.png',
  'icon-croissance-fruits.png',
];

// Créer un SVG placeholder simple
function createPlaceholderSVG(name) {
  const displayName = name.replace('icon-', '').replace('.png', '').replace(/-/g, ' ');
  
  return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#1B5E20"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        fill="white" font-size="16" font-family="Arial">
    ${displayName}
  </text>
</svg>`;
}

console.log('🔧 Création des placeholders d\'images manquantes...\n');

missingImages.forEach(imageName => {
  const svgContent = createPlaceholderSVG(imageName);
  const svgPath = path.join(productsDir, imageName.replace('.png', '.svg'));
  const pngPath = path.join(productsDir, imageName);
  
  // Créer le SVG
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Créé: ${imageName.replace('.png', '.svg')}`);
  
  // Créer un fichier PNG vide (pour éviter les 404)
  // En production, remplacez par de vraies images
  fs.writeFileSync(pngPath, '');
  console.log(`✅ Placeholder: ${imageName}`);
});

// Vérifier si sarah-npk-20-10-10.jpeg existe, sinon copier le webp
const sarahWebp = path.join(productsDir, 'sarah-npk-20-10-10.webp');
const sarahJpeg = path.join(productsDir, 'sarah-npk-20-10-10.jpeg');

if (fs.existsSync(sarahWebp) && !fs.existsSync(sarahJpeg)) {
  console.log('\n📝 Note: sarah-npk-20-10-10.webp existe mais pas .jpeg');
  console.log('   Utilisez la version .webp ou convertissez l\'image');
}

console.log('\n✨ Terminé! Les placeholders ont été créés.');
console.log('⚠️  Remplacez-les par de vraies images dès que possible.\n');
