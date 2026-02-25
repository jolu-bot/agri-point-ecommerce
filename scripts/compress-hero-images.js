/**
 * Compresse les images hero vers public/images/
 * Usage : node scripts/compress-hero-images.js
 *
 * Cible : ≤ 200KB par image, qualité 80%, format WebP
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TASKS = [
  {
    src: path.join(__dirname, '..', 'public', 'images', 'produire-plus'),
    pattern: /produire-plus-\d+\.(png|jpg|jpeg)$/i,
  },
  {
    src: path.join(__dirname, '..', 'public', 'images', 'gagner-plus'),
    pattern: /gagner-plus-\d+\.(png|jpg|jpeg)$/i,
  },
  {
    src: path.join(__dirname, '..', 'public', 'images', 'mieux-vivre'),
    pattern: /mieux-vivre-\d+\.(png|jpg|jpeg)$/i,
  },
];

async function compressImage(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath, ext);
  const outPath = path.join(dir, `${base}.webp`);

  const statBefore = fs.statSync(filePath).size;

  await sharp(filePath)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outPath);

  const statAfter = fs.statSync(outPath).size;
  const ratio = Math.round((1 - statAfter / statBefore) * 100);

  console.log(
    `✓ ${path.basename(filePath)} → ${path.basename(outPath)}  ` +
    `${(statBefore / 1024).toFixed(0)}KB → ${(statAfter / 1024).toFixed(0)}KB  (-${ratio}%)`
  );

  // Supprimer l'original si ce n'est pas déjà un .webp
  if (ext !== '.webp') {
    fs.unlinkSync(filePath);
  }

  return { filePath, outPath, ratio };
}

async function run() {
  let total = 0;

  for (const task of TASKS) {
    if (!fs.existsSync(task.src)) {
      console.warn(`Dossier introuvable : ${task.src}`);
      continue;
    }

    const files = fs.readdirSync(task.src).filter((f) => task.pattern.test(f));

    for (const file of files) {
      const fullPath = path.join(task.src, file);
      // Ignorer les .webp déjà compressés
      if (file.endsWith('.webp')) continue;
      await compressImage(fullPath);
      total++;
    }
  }

  console.log(`\n${total} image(s) compressée(s) en WebP.`);
  console.log('N\'oubliez pas de mettre à jour les extensions dans les page.tsx si nécessaire.');
}

run().catch(console.error);
