/**
 * TEST RENDU DES IMAGES EN PRODUCTION
 */

const https = require('https');

const SITE_URL = 'https://agri-ps.com';

async function testImageRendering() {
  return new Promise((resolve) => {
    console.log('🔍 Récupération de la page produits...\n');
    
    https.get(`${SITE_URL}/produits`, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}\n`);
        
        // Chercher les balises img dans le HTML
        const imgMatches = html.match(/<img[^>]+>/g) || [];
        const imageMatches = html.match(/<Image[^>]+>/g) || [];
        
        console.log(`📊 BALISES TROUVÉES:`);
        console.log(`   <img> : ${imgMatches.length}`);
        console.log(`   <Image> : ${imageMatches.length}\n`);
        
        // Extraire les src
        const srcPattern = /src="([^"]+)"/g;
        const sources = [];
        
        imgMatches.forEach(tag => {
          const match = srcPattern.exec(tag);
          if (match) sources.push(match[1]);
          srcPattern.lastIndex = 0;
        });
        
        console.log(`🖼️  SOURCES D'IMAGES TROUVÉES (${sources.length}):\n`);
        sources.forEach((src, i) => {
          console.log(`   ${i+1}. ${src}`);
        });
        
        // Vérifier si les images produits sont présentes
        const productImages = sources.filter(src => src.includes('/products/'));
        console.log(`\n✅ Images produits: ${productImages.length}`);
        
        if (productImages.length === 0) {
          console.log('\n❌ PROBLÈME: Aucune image produit trouvée dans le HTML !');
          console.log('   Les images ne sont pas rendues côté serveur.\n');
        }
        
        // Chercher les données JSON dans le HTML
        if (html.includes('kit-urbain-debutant') || html.includes('sarah-npk')) {
          console.log('✅ Données produits présentes dans le HTML');
        } else {
          console.log('❌ Données produits manquantes dans le HTML');
        }
        
        resolve();
      });
    }).on('error', (error) => {
      console.log(`❌ Erreur: ${error.message}`);
      resolve();
    });
  });
}

testImageRendering();
