#!/usr/bin/env node

/**
 * Script de Test Simplifié - Campagne Engrais Mars 2026
 * Teste tous les scénarios d'éligibilité
 */

const http = require('http');
const BASE_URL = 'http://localhost:3000';

// Couleurs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}\n`)
};

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: { raw: responseData } });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  log.title('🧪 CAMPAGNE ENGRAIS MARS 2026 - TESTS COMPLETS');
  
  // Étape 1: Vérifier le serveur et charger la campagne
  log.info('Étape 1: Connexion au serveur...');
  let campaignId;
  
  try {
    const campaignRes = await makeRequest('GET', '/api/campaigns/march-2026');
    
    if (campaignRes.status !== 200) {
      log.error(`API /api/campaigns/march-2026 retourne ${campaignRes.status}`);
      console.log('Réponse:', JSON.stringify(campaignRes.body, null, 2));
      process.exit(1);
    }
    
    if (!campaignRes.body.campaign && !campaignRes.body._id) {
      log.error('Pas de campagne dans la réponse');
      console.log('Réponse:', JSON.stringify(campaignRes.body, null, 2));
      process.exit(1);
    }
    
    // Le corps de la réponse EST la campagne (pas enveloppé dans { campaign: ... })
    const campaign = campaignRes.body.campaign || campaignRes.body;
    campaignId = campaign._id || campaign.id;
    log.success('✓ Serveur prêt');
    log.success(`✓ Campagne chargée: ${campaign.slug}`);
    log.success(`✓ ID: ${campaignId.toString().substring(0, 12)}...`);
  } catch (e) {
    log.error(`Erreur: ${e.message}`);
    process.exit(1);
  }

  // Étape 2: Tester les scénarios d'éligibilité
  const scenarios = [
    {
      title: 'TEST 1: Non-Éligible (Pas Membre Coopérative)',
      data: {
        campaignId,
        isMember: false,
        hasInsurance: true,
        insuranceProvider: 'CICAN',
        quantity: 10
      },
      expectedEligible: false,
      expectedMessage: 'Coopérative'
    },
    {
      title: 'TEST 2: Non-Éligible (Pas d\'Assurance)',
      data: {
        campaignId,
        isMember: true,
        hasInsurance: false,
        insuranceProvider: null,
        quantity: 10
      },
      expectedEligible: false,
      expectedMessage: 'Assurance'
    },
    {
      title: 'TEST 3: Non-Éligible (Quantité Insuffisante)',
      data: {
        campaignId,
        isMember: true,
        hasInsurance: true,
        insuranceProvider: 'CICAN',
        quantity: 3
      },
      expectedEligible: false,
      expectedMessage: 'Quantité'
    },
    {
      title: 'TEST 4: ✅ ÉLIGIBLE (Tous les critères)',
      data: {
        campaignId,
        isMember: true,
        hasInsurance: true,
        insuranceProvider: 'CICAN',
        quantity: 10
      },
      expectedEligible: true,
      expectedMessage: 'confirmée'
    }
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const scenario of scenarios) {
    log.title(scenario.title);
    
    try {
      const res = await makeRequest('POST', '/api/campaigns/apply', scenario.data);
      
      if (res.status !== 200) {
        log.error(`Status ${res.status}`);
        console.log('Body:', JSON.stringify(res.body, null, 2));
        failedCount++;
        continue;
      }

      const isEligible = res.body.eligible;
      const message = res.body.message || '';

      if (isEligible === scenario.expectedEligible) {
        log.success(`✓ PASS - Éligibilité correcte: ${isEligible}`);
        log.success(`✓ Message: "${message}"`);
        passedCount++;
      } else {
        log.error(`✗ FAIL - Éligibilité incorrecte`);
        log.error(`  Expected: ${scenario.expectedEligible}, Got: ${isEligible}`);
        console.log('Full response:', JSON.stringify(res.body, null, 2));
        failedCount++;
      }
    } catch (e) {
      log.error(`Erreur: ${e.message}`);
      failedCount++;
    }
  }

  // Résumé
  log.title('📊 RÉSUMÉ DES TESTS');
  log.success(`Totalité: ${passedCount + failedCount} tests`);
  log.success(`✓ Réussis: ${passedCount}`);
  if (failedCount > 0) {
    log.error(`✗ Échoués: ${failedCount}`);
  }

  if (failedCount === 0) {
    log.success(`\n🎉 TOUS LES TESTS SONT PASSÉS!`);
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
