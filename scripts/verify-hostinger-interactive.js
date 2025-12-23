/**
 * VÉRIFICATION INTERACTIVE - PRODUCTION HOSTINGER
 * Demande l'URL du site et vérifie les images
 */

const readline = require('readline');
const https = require('https');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const productsToCheck = [
  { name: 'HUMIFORTE', image: '/products/humiforte-20.jpeg' },
  { name: 'FOSNUTREN 20', image: '/products/fosnutren-20.jpeg' },
  { name: 'KADOSTIM 20', image: '/products/kadostim-20.jpeg' },
  { name: 'AMINOL 20', image: '/products/aminol-20.jpeg' },
  { name: 'NATUR CARE', image: '/products/kit-naturcare-terra.jpeg' },
  { name: 'SARAH NPK 20-10-10', image: '/products/sarah-npk-20-10-10.jpeg' },
  { name: 'SARAH NPK 12-14-10', image: '/products/sarah-npk-12-14-10.jpeg' },
  { name: 'SARAH NPK 10-30-10', image: '/products/sarah-npk-10-30-10.jpeg' },
  { name: 'URÉE 46%', image: '/products/sarah-uree-46.jpeg' },
  { name: 'Kit Urbain Débutant', image: '/products/kit-urbain-debutant.jpg' }
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = protocol.request(options, (res) => {
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length']
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout (15s)'
      });
    });

    req.end();
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  VÉRIFICATION PRODUCTION HOSTINGER            ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log('📝 Exemples d\'URL :');
  console.log('   - https://votre-domaine.com');
  console.log('   - https://sub.votre-domaine.com');
  console.log('   - http://123.45.67.89:3000\n');

  const siteUrl = await question('🌐 Entrez l\'URL de votre site Hostinger : ');
  
  if (!siteUrl || siteUrl.trim() === '') {
    console.log('\n❌ URL invalide. Script annulé.\n');
    rl.close();
    return;
  }

  const cleanUrl = siteUrl.trim().replace(/\/$/, ''); // Enlever le slash final
  
  console.log('\n' + '─'.repeat(60));
  console.log(`🔍 Vérification de: ${cleanUrl}`);
  console.log('─'.repeat(60) + '\n');

  // 1. Test du site
  console.log('1️⃣  TEST D\'ACCESSIBILITÉ DU SITE\n');
  console.log('⏳ Connexion au site...\n');
  
  const siteCheck = await checkUrl(cleanUrl);
  
  if (siteCheck.status === 200 || siteCheck.status === 301 || siteCheck.status === 302) {
    console.log(`✅ Site accessible ! (Status: ${siteCheck.status})\n`);
  } else {
    console.log(`❌ Site non accessible`);
    console.log(`   Status: ${siteCheck.status}`);
    console.log(`   Erreur: ${siteCheck.error || 'Unknown'}\n`);
    console.log('💡 Vérifiez que:');
    console.log('   1. L\'URL est correcte');
    console.log('   2. Le site est bien déployé');
    console.log('   3. Le serveur Hostinger est actif\n');
    rl.close();
    return;
  }

  // 2. Test des images
  console.log('2️⃣  TEST DES IMAGES DES PRODUITS\n');
  console.log('⏳ Vérification de 10 images...\n');
  
  const imageResults = [];
  for (const product of productsToCheck) {
    const imageUrl = `${cleanUrl}${product.image}`;
    process.stdout.write(`   Vérification: ${product.name}... `);
    const result = await checkUrl(imageUrl);
    imageResults.push({ ...product, ...result });
    
    if (result.status === 200) {
      console.log('✅');
    } else {
      console.log(`❌ (${result.status})`);
    }
  }

  // 3. Résumé
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RÉSULTAT FINAL\n');
  
  const successfulImages = imageResults.filter(r => r.status === 200).length;
  const failedImages = imageResults.length - successfulImages;
  
  console.log(`🖼️  Images des produits:`);
  console.log(`   ✅ Accessibles: ${successfulImages}/10`);
  console.log(`   ❌ Manquantes: ${failedImages}/10\n`);

  if (failedImages > 0) {
    console.log('❌ IMAGES MANQUANTES:\n');
    imageResults
      .filter(r => r.status !== 200)
      .forEach(r => {
        console.log(`   • ${r.name}`);
        console.log(`     ${r.image}`);
        console.log(`     Status: ${r.status} | ${r.error || 'Not Found'}\n`);
      });

    console.log('💡 SOLUTIONS:\n');
    console.log('   1. Vérifiez que le dossier public/products/ contient toutes les images');
    console.log('   2. Redéployez le site sur Hostinger:');
    console.log('      git push origin main');
    console.log('   3. Attendez 2-3 minutes pour la synchronisation');
    console.log('   4. Relancez ce script pour vérifier\n');
  } else {
    console.log('🎉 PARFAIT !\n');
    console.log('   ✅ Toutes les images sont accessibles');
    console.log('   ✅ Votre site fonctionne correctement\n');
    console.log(`   👉 Visitez: ${cleanUrl}\n`);
  }

  console.log('═'.repeat(60));
  console.log(`⏰ Vérifié le: ${new Date().toLocaleString('fr-FR')}\n`);

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Erreur:', error.message);
  rl.close();
  process.exit(1);
});
