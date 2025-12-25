/**
 * OPTIMISATION DES IMAGES PRODUITS
 * Convertit les images en WebP (format moderne, ~30% plus léger)
 * Redimensionne à 800x800px max
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'products');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'products', 'optimized');

async function optimizeImages() {
  console.log('🎨 OPTIMISATION DES IMAGES\n');
  
  // Créer le dossier de sortie
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(PRODUCTS_DIR)
    .filter(f => f.match(/\.(jpg|jpeg|png)$/i));

  console.log(`📦 ${files.length} images à optimiser\n`);

  for (const file of files) {
    const inputPath = path.join(PRODUCTS_DIR, file);
    const outputName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(OUTPUT_DIR, outputName);

    try {
      const stats = fs.statSync(inputPath);
      const originalSize = (stats.size / 1024).toFixed(2);

      await sharp(inputPath)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSize = (newStats.size / 1024).toFixed(2);
      const reduction = ((1 - newStats.size / stats.size) * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   ${originalSize} KB → ${newSize} KB (-${reduction}%)`);
      console.log(`   Sortie: ${outputName}\n`);

    } catch (error) {
      console.log(`❌ ${file}: ${error.message}\n`);
    }
  }

  console.log('🎉 Optimisation terminée !');
  console.log(`📁 Images optimisées dans: ${OUTPUT_DIR}`);
}

// Vérifier si sharp est installé
try {
  require.resolve('sharp');
  optimizeImages();
} catch (e) {
  console.log('❌ Module "sharp" non installé');
  console.log('📦 Installation: npm install sharp --save-dev');
  console.log('\nOu utilisez un service en ligne:');
  console.log('   - https://squoosh.app/');
  console.log('   - https://tinypng.com/');
  console.log('   - https://imageoptim.com/');
}
