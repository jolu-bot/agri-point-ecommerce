#!/usr/bin/env node

/**
 * Bundle Analyzer - Identifie le code inutilisé et les opportunités d'optimisation
 */

const fs = require('fs');
const path = require('path');

// Analyse des fichiers JavaScript
async function analyzeBundleSize() {
  const nextDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(nextDir)) {
    console.error('❌ .next directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const bundleDir = path.join(nextDir, 'static', 'chunks');
  let totalSize = 0;
  let chunks = [];

  if (fs.existsSync(bundleDir)) {
    const files = fs.readdirSync(bundleDir);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(bundleDir, file);
        const stats = fs.statSync(filePath);
        const sizeKb = (stats.size / 1024).toFixed(2);
        totalSize += stats.size;
        chunks.push({ file, size: sizeKb, bytes: stats.size });
      }
    });
  }

  chunks.sort((a, b) => b.bytes - a.bytes);

  console.log('\n📊 ANALYSE DU BUNDLE JavaScript');
  console.log('═'.repeat(60));
  console.log(`Total: ${(totalSize / 1024).toFixed(2)} KB\n`);
  
  console.log('Top chunks:');
  chunks.slice(0, 15).forEach(chunk => {
    const percent = ((chunk.bytes / totalSize) * 100).toFixed(1);
    const bar = '█'.repeat(Math.ceil(percent / 2));
    console.log(`  ${chunk.file.padEnd(40)} ${chunk.size.padStart(8)} KB ${bar} ${percent}%`);
  });

  console.log('\n💡 RECOMMENDATIONS:');
  console.log('  1. Réduire lazy-loading sur page d\'accueil');
  console.log('  2. Activer minification CSS en production');
  console.log('  3. Utiliser dynamic() seulement pour composants >50KB');
  console.log('  4. Implémenter React.lazy avec Suspense pour hydration partielle\n');
}

analyzeBundleSize().catch(console.error);
