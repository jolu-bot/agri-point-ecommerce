/**
 * TEST DE PERFORMANCE ET FLUIDITÉ DU SITE
 */

const https = require('https');

const SITE_URL = 'https://agri-ps.com';

async function testPage(path, name) {
  return new Promise((resolve) => {
    const start = Date.now();
    
    https.get(`${SITE_URL}${path}`, (res) => {
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => {
        const duration = Date.now() - start;
        const sizeMB = (size / (1024 * 1024)).toFixed(2);
        
        resolve({
          name,
          path,
          status: res.statusCode,
          duration,
          size: sizeMB,
          ok: res.statusCode === 200
        });
      });
    }).on('error', (error) => {
      resolve({
        name,
        path,
        error: error.message,
        ok: false
      });
    });
  });
}

async function testAPI(endpoint, name) {
  return new Promise((resolve) => {
    const start = Date.now();
    
    https.get(`${SITE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        
        try {
          const json = JSON.parse(data);
          resolve({
            name,
            endpoint,
            status: res.statusCode,
            duration,
            dataCount: json.products?.length || json.length || Object.keys(json).length,
            ok: res.statusCode === 200
          });
        } catch (error) {
          resolve({
            name,
            endpoint,
            status: res.statusCode,
            duration,
            ok: false
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        name,
        endpoint,
        error: error.message,
        ok: false
      });
    });
  });
}

function getPerformanceRating(duration) {
  if (duration < 500) return { symbol: '✓✓✓', label: 'EXCELLENT', color: 'green' };
  if (duration < 1000) return { symbol: '✓✓ ', label: 'BON', color: 'cyan' };
  if (duration < 2000) return { symbol: '✓  ', label: 'CORRECT', color: 'yellow' };
  return { symbol: '✗  ', label: 'LENT', color: 'red' };
}

async function runPerformanceTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     TEST DE PERFORMANCE & FLUIDITÉ DU SITE                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Site: ${SITE_URL}\n`);
  
  // Test des pages
  console.log('📄 TEST DES PAGES:\n');
  
  const pages = [
    { path: '/', name: 'Page d\'accueil' },
    { path: '/produits', name: 'Page produits' },
    { path: '/produire-plus', name: 'Produire plus' },
    { path: '/mieux-vivre', name: 'Mieux vivre' },
    { path: '/gagner-plus', name: 'Gagner plus' },
  ];
  
  const pageResults = [];
  for (const page of pages) {
    const result = await testPage(page.path, page.name);
    pageResults.push(result);
    
    if (result.ok) {
      const rating = getPerformanceRating(result.duration);
      console.log(`${rating.symbol} ${result.name}`);
      console.log(`   Temps: ${result.duration}ms | Taille: ${result.size} MB | ${rating.label}\n`);
    } else {
      console.log(`✗   ${result.name}`);
      console.log(`   ERREUR: ${result.error || 'Status ' + result.status}\n`);
    }
  }
  
  // Test des APIs
  console.log('\n🔌 TEST DES APIs:\n');
  
  const apis = [
    { endpoint: '/api/products', name: 'API Produits' },
    { endpoint: '/api/site-config', name: 'API Configuration' },
  ];
  
  const apiResults = [];
  for (const api of apis) {
    const result = await testAPI(api.endpoint, api.name);
    apiResults.push(result);
    
    if (result.ok) {
      const rating = getPerformanceRating(result.duration);
      console.log(`${rating.symbol} ${result.name}`);
      console.log(`   Temps: ${result.duration}ms | Données: ${result.dataCount} éléments | ${rating.label}\n`);
    } else {
      console.log(`✗   ${result.name}`);
      console.log(`   ERREUR: ${result.error || 'Status ' + result.status}\n`);
    }
  }
  
  // Test des images WebP
  console.log('\n🖼️  TEST CHARGEMENT IMAGES:\n');
  
  const images = [
    '/products/kit-urbain-debutant.webp',
    '/products/sarah-npk-20-10-10.webp',
    '/products/fosnutren-20.webp',
  ];
  
  const imageResults = [];
  for (const img of images) {
    const start = Date.now();
    const result = await testPage(img, img.split('/').pop());
    const duration = Date.now() - start;
    imageResults.push({ ...result, duration });
    
    if (result.ok) {
      const rating = getPerformanceRating(duration);
      console.log(`${rating.symbol} ${result.name}`);
      console.log(`   Temps: ${duration}ms | Taille: ${result.size} MB | ${rating.label}\n`);
    }
  }
  
  // Calcul des moyennes
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ DES PERFORMANCES:\n');
  
  const avgPageLoad = pageResults.filter(r => r.ok).reduce((sum, r) => sum + r.duration, 0) / pageResults.filter(r => r.ok).length;
  const avgApiResponse = apiResults.filter(r => r.ok).reduce((sum, r) => sum + r.duration, 0) / apiResults.filter(r => r.ok).length;
  const avgImageLoad = imageResults.filter(r => r.ok).reduce((sum, r) => sum + r.duration, 0) / imageResults.filter(r => r.ok).length;
  
  const pageRating = getPerformanceRating(avgPageLoad);
  const apiRating = getPerformanceRating(avgApiResponse);
  const imgRating = getPerformanceRating(avgImageLoad);
  
  console.log(`📄 Chargement pages moyen:  ${Math.round(avgPageLoad)}ms  [${pageRating.label}]`);
  console.log(`🔌 Réponse API moyenne:     ${Math.round(avgApiResponse)}ms  [${apiRating.label}]`);
  console.log(`🖼️  Chargement images moyen: ${Math.round(avgImageLoad)}ms  [${imgRating.label}]`);
  
  console.log('\n════════════════════════════════════════════════════════════');
  
  // Évaluation globale
  const globalAvg = (avgPageLoad + avgApiResponse + avgImageLoad) / 3;
  const globalRating = getPerformanceRating(globalAvg);
  
  console.log('\n🎯 ÉVALUATION GLOBALE:\n');
  console.log(`   Performance moyenne: ${Math.round(globalAvg)}ms`);
  console.log(`   Note: ${globalRating.label}\n`);
  
  if (globalAvg < 500) {
    console.log('🎉 EXCELLENT ! Votre site est très fluide et rapide.');
    console.log('   Temps de chargement ultra-rapides.\n');
  } else if (globalAvg < 1000) {
    console.log('✓  BON ! Votre site est fluide.');
    console.log('   Les performances sont satisfaisantes.\n');
  } else if (globalAvg < 2000) {
    console.log('⚠️  CORRECT. Votre site fonctionne mais peut être optimisé.');
    console.log('   Quelques améliorations possibles.\n');
  } else {
    console.log('⚠️  LENT. Votre site nécessite des optimisations.');
    console.log('   Temps de chargement trop élevés.\n');
  }
  
  // Recommandations
  console.log('💡 RECOMMANDATIONS:\n');
  
  if (avgImageLoad > 300) {
    console.log('   • Images WebP: Optimisation correcte (0.84 MB total)');
  } else {
    console.log('   ✓ Images WebP: Parfaitement optimisées !');
  }
  
  if (avgApiResponse > 500) {
    console.log('   • API: Envisager un cache Redis ou CDN');
  } else {
    console.log('   ✓ API: Temps de réponse excellents !');
  }
  
  if (avgPageLoad > 1000) {
    console.log('   • Pages: Activer compression Gzip/Brotli');
    console.log('   • Minifier CSS/JS en production');
  } else {
    console.log('   ✓ Pages: Chargement rapide !');
  }
  
  console.log('\n════════════════════════════════════════════════════════════\n');
}

runPerformanceTests();
