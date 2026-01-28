/**
 * VÉRIFICATION FINALE - IMAGES WEBP EN PRODUCTION
 */

const https = require('https');

const SITE_URL = 'https://blue-goose-561723.hostingersite.com';

async function checkImage(path) {
  return new Promise((resolve) => {
    https.get(`${SITE_URL}${path}`, (res) => {
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => {
        const sizeMB = (size / (1024 * 1024)).toFixed(2);
        resolve({
          path,
          status: res.statusCode,
          size: sizeMB,
          type: res.headers['content-type'],
          ok: res.statusCode === 200
        });
      });
    }).on('error', () => resolve({ path, status: 'ERROR', ok: false }));
  });
}

async function verify() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   VÉRIFICATION IMAGES WEBP EN PRODUCTION      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log('🌐 Site:', SITE_URL);
  console.log('\n📊 TEST DES IMAGES WEBP:\n');

  const images = [
    '/products/aminol-20.webp',
    '/products/fosnutren-20.webp',
    '/products/humiforte-20.webp',
    '/products/kadostim-20.webp',
    '/products/kit-naturcare-terra.webp',
    '/products/kit-urbain-debutant.webp',
    '/products/sarah-npk-10-30-10.webp',
    '/products/sarah-npk-12-14-10.webp',
    '/products/sarah-npk-20-10-10.webp',
    '/products/sarah-uree-46.webp',
  ];

  let totalSize = 0;
  let successCount = 0;

  for (const img of images) {
    const result = await checkImage(img);
    
    if (result.ok) {
      console.log(`✅ ${img.split('/').pop()}`);
      console.log(`   Status: ${result.status} | Type: ${result.type} | Taille: ${result.size} MB\n`);
      totalSize += parseFloat(result.size);
      successCount++;
    } else {
      console.log(`❌ ${img.split('/').pop()}`);
      console.log(`   Status: ${result.status}\n`);
    }
  }

  console.log('════════════════════════════════════════════════');
  console.log(`📊 RÉSUMÉ:`);
  console.log(`   ✅ Accessibles: ${successCount}/${images.length}`);
  console.log(`   📦 Taille totale: ${totalSize.toFixed(2)} MB`);
  console.log(`   💾 Économie vs JPEG: ~${(13.3 - totalSize).toFixed(1)} MB (${Math.round((1 - totalSize/13.3) * 100)}%)`);
  console.log('════════════════════════════════════════════════\n');

  if (successCount === images.length) {
    console.log('🎉 PARFAIT ! Toutes les images WebP sont accessibles !');
    console.log('👉 Visitez: https://blue-goose-561723.hostingersite.com/produits\n');
  } else {
    console.log('⚠️  Certaines images sont manquantes ou inaccessibles.\n');
  }
}

verify();
