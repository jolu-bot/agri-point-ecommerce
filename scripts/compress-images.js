/**
 * compress-images.js
 * Convertit tous les PNG/JPEG de public/products/ en WebP optimisé.
 * • Qualité 80 (bon équilibre qualité/poids pour connexions lentes)
 * • Renomme les fichiers avec espaces (ex: "1 litre" → "1litre")
 * • Affiche les gains de compression pour chaque fichier
 */

const sharp  = require('sharp');
const fs     = require('fs');
const path   = require('path');

const DIR = path.join(__dirname, '..', 'public', 'products');
const QUALITY = 80;

// Mapping: nom source → nom WebP cible (résout aussi les espaces)
const TARGETS = [
  // Bidons 1L
  { src: 'humiforte-20- 1 litre.png',   out: 'humiforte-20-1litre.webp'   },
  { src: 'fosnutren-20-1 litre.png',    out: 'fosnutren-20-1litre.webp'   },
  { src: 'kadostim-20-1 litre.png',     out: 'kadostim-20-1litre.webp'    },
  { src: 'aminol-20-1 litre.png',       out: 'aminol-20-1litre.webp'      },
  // Bidons 5L individuels
  { src: 'humiforte-20-5litres.png',    out: 'humiforte-20-5litres.webp'  },
  { src: 'fosnutren-20-5litres.png',    out: 'fosnutren-20-5litres.webp'  },
  { src: 'kadostim-20-5litres.png',     out: 'kadostim-20-5litres.webp'   },
  { src: 'aminol-20-5litres.png',       out: 'aminol-20-5litres.webp'     },
  // Kits multi-bidons
  { src: 'kit-humiforte-20.png',        out: 'kit-humiforte-20.webp'      },
  { src: 'kit-fosnutren-20.png',        out: 'kit-fosnutren-20.webp'      },
  { src: 'kit-kadostim-20.png',         out: 'kit-kadostim-20.webp'       },
  { src: 'kit-aminol-20.png',           out: 'kit-aminol-20.webp'         },
  // Engrais SARAH
  { src: 'sarah-uree-46-25kg.png',      out: 'sarah-uree-46-25kg.webp'   },
  { src: 'sarah-npk-20-10-10.jpeg',     out: 'sarah-npk-20-10-10.webp'   },
];

function fmtKB(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

async function run() {
  console.log('🗜️  COMPRESSION IMAGES — WebP qualité', QUALITY);
  console.log('═'.repeat(60));

  let totalBefore = 0;
  let totalAfter  = 0;
  let converted   = 0;
  let skipped     = 0;

  for (const { src, out } of TARGETS) {
    const srcPath = path.join(DIR, src);
    const outPath = path.join(DIR, out);

    if (!fs.existsSync(srcPath)) {
      console.log(`⚠  ABSENT   ${src}`);
      skipped++;
      continue;
    }

    // Size before
    const sizeBefore = fs.statSync(srcPath).size;

    try {
      await sharp(srcPath)
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(outPath);

      const sizeAfter = fs.statSync(outPath).size;
      const gain      = Math.round((1 - sizeAfter / sizeBefore) * 100);

      totalBefore += sizeBefore;
      totalAfter  += sizeAfter;
      converted++;

      const indicator = gain >= 50 ? '🟢' : gain >= 25 ? '🟡' : '🔵';
      console.log(
        `${indicator} ${out.padEnd(34)} ${fmtKB(sizeBefore).padStart(9)} → ${fmtKB(sizeAfter).padStart(9)}  (-${gain}%)`
      );
    } catch (err) {
      console.error(`✗  ERREUR   ${src}: ${err.message}`);
      skipped++;
    }
  }

  console.log('═'.repeat(60));
  const totalGain = Math.round((1 - totalAfter / totalBefore) * 100);
  console.log(`\n✅ ${converted} fichiers convertis, ${skipped} ignorés`);
  console.log(`📦 Poids total avant : ${fmtKB(totalBefore)}`);
  console.log(`📦 Poids total après : ${fmtKB(totalAfter)}`);
  console.log(`🚀 Gain total        : -${totalGain}% (${fmtKB(totalBefore - totalAfter)} économisés)\n`);
}

run().catch(console.error);
