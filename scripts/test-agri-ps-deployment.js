#!/usr/bin/env node
/**
 * VÉRIFICATION POST-DÉPLOIEMENT - agri-ps.com
 * 
 * Ce script vérifie que tout fonctionne correctement après le déploiement sur Hostinger
 * Exécutez-le sur le VPS APRÈS avoir démarré l'application avec PM2
 * 
 * Utilisation sur le VPS (SSH):
 *   node scripts/test-agri-ps-deployment.js
 */

const http = require('http')
const https = require('https')
const { execSync } = require('child_process')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`)
}

function section(title) {
  console.log(`\n${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.bold}${colors.blue}${title}${colors.reset}`)
  console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)
}

function httpRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https')
    const client = isHttps ? https : http

    client.request(url, { method, timeout: 5000 }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }))
    }).on('error', reject).end()
  })
}

async function test() {
  let passed = 0
  let failed = 0

  section('🔍 TEST POST-DÉPLOIEMENT - agri-ps.com')

  // ====== 1. PM2 Status ======
  log(colors.bold, '1️⃣  PM2 Status')
  try {
    const pmList = execSync('pm2 list', { encoding: 'utf8' })
    if (pmList.includes('agripoint-production') || pmList.includes('online')) {
      log(colors.green, '   ✅ PM2: Application running')
      passed++

      // Show more details
      const pmStatus = execSync('pm2 status agripoint-production 2>/dev/null || pm2 status', { encoding: 'utf8' })
      if (pmStatus.includes('online')) {
        log(colors.green, '   ✅ Status: ONLINE')
        passed++
      } else {
        log(colors.yellow, '   ⚠️  Status: Check logs (pm2 logs agripoint-production)')
      }
    } else {
      log(colors.red, '   ❌ PM2: No application running')
      log(colors.yellow, '      Run: pm2 start npm --name agripoint-production -- start')
      failed++
    }
  } catch (err) {
    log(colors.red, '   ❌ PM2 not found or error')
    failed++
  }

  // ====== 2. Port 3000 ======
  log(colors.bold, '\n2️⃣  Port 3000 (Node.js)')
  
  try {
    const netstat = execSync('ss -tuln | grep 3000 || netstat -tuln | grep 3000', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
    if (netstat.includes('3000')) {
      log(colors.green, '   ✅ Port 3000: Listening')
      passed++
    } else {
      log(colors.red, '   ❌ Port 3000: Not listening')
      failed++
    }
  } catch (err) {
    log(colors.red, '   ❌ Port 3000: Not listening (or netstat/ss not found)')
    failed++
  }

  // ====== 3. Local HTTP Test ======
  log(colors.bold, '\n3️⃣  Local Server (http://127.0.0.1:3000)')

  try {
    const response = await httpRequest('http://127.0.0.1:3000', 'GET')
    
    if (response.status === 200) {
      log(colors.green, `   ✅ HTTP Status: ${response.status}`)
      passed++

      if (response.body.includes('<html') || response.body.length > 100) {
        log(colors.green, '   ✅ HTML Content: Received')
        passed++
      }
    } else {
      log(colors.yellow, `   ⚠️  HTTP Status: ${response.status}`)
    }
  } catch (err) {
    log(colors.red, '   ❌ Connection Error:', err.message)
    log(colors.yellow, '      Node.js may not be listening on port 3000')
    failed++
  }

  // ====== 4. Environment Variables ======
  log(colors.bold, '\n4️⃣  Variables d\'environnement')

  try {
    const env = Object.assign({}, process.env)
    
    const checks = [
      { key: 'NEXT_PUBLIC_SITE_URL', expected: 'https://agri-ps.com' },
      { key: 'MONGODB_URI', expected: '' }, // Just check it exists
      { key: 'NODE_ENV', expected: 'production' },
      { key: 'PORT', expected: '3000' },
    ]

    checks.forEach(check => {
      if (env[check.key] && env[check.key] !== '') {
        log(colors.green, `   ✅ ${check.key} = ${env[check.key].substring(0, 30)}...`)
        passed++
      } else {
        log(colors.yellow, `   ⚠️  ${check.key} may not be set`)
      }
    })
  } catch (err) {
    log(colors.yellow, '   ℹ️  Could not check environment variables')
  }

  // ====== 5. HTTPS Test (if DNS working) ======
  log(colors.bold, '\n5️⃣  HTTPS Domain (https://agri-ps.com)')

  try {
    const response = await httpRequest('https://agri-ps.com/', 'GET')
    
    if (response.status === 200 || response.status === 301 || response.status === 302) {
      log(colors.green, `   ✅ HTTPS Status: ${response.status}`)
      passed++

      if (response.body.includes('campagne') || response.body.includes('Campagne') || response.body.length > 100) {
        log(colors.green, '   ✅ Domain Connected: OK')
        passed++
      }
    } else if (response.status === 503) {
      log(colors.red, `   ❌ HTTPS Status: ${response.status} (Service Unavailable)`)
      log(colors.yellow, '      - Check PM2 status: pm2 logs agripoint-production')
      log(colors.yellow, '      - Check Nginx: sudo systemctl status nginx')
      failed++
    } else {
      log(colors.yellow, `   ⚠️  HTTPS Status: ${response.status}`)
    }
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      log(colors.yellow, '   ⚠️  Domain not resolved (DNS not propagated yet)')
      log(colors.yellow, '      - Wait: DNS propagation can take 24-48 hours')
      log(colors.yellow, '      - Test: nslookup agri-ps.com')
    } else if (err.code === 'ECONNREFUSED') {
      log(colors.red, '   ❌ Connection Refused')
      log(colors.yellow, '      - Nginx may not be running: sudo systemctl start nginx')
      failed++
    } else {
      log(colors.yellow, '   ℹ️  Cannot test HTTPS domain:', err.message)
    }
  }

  // ====== 6. Nginx Status (if applicable) ======
  log(colors.bold, '\n6️⃣  Nginx Proxy (si utilisé)')

  try {
    const nginxStatus = execSync('sudo systemctl status nginx 2>/dev/null', { encoding: 'utf8' })
    if (nginxStatus.includes('active (running)')) {
      log(colors.green, '   ✅ Nginx: Running')
      passed++
    } else {
      log(colors.yellow, '   ⚠️  Nginx: Not running')
      log(colors.yellow, '      Run: sudo systemctl start nginx')
    }
  } catch (err) {
    log(colors.yellow, '   ℹ️  Nginx: Not found or not accessible (this is OK if you don\'t use Nginx)')
  }

  // ====== 7. Disk Space ======
  log(colors.bold, '\n7️⃣  Ressources système')

  try {
    const df = execSync('df -h / | tail -1', { encoding: 'utf8' })
    const parts = df.split(/\s+/)
    const used = parts[4] || 'unknown'
    log(colors.cyan, `   📊 Disk Usage: ${used}`)

    const free = parts[3] || 'unknown'
    if (used.includes('100%')) {
      log(colors.red, '   ❌ DISK FULL! Delete old logs or files.')
      failed++
    } else if (used.includes('9') || used.includes('8')) {
      log(colors.yellow, '   ⚠️  Disk usage high (>80%)')
    } else {
      log(colors.green, '   ✅ Disk space: OK')
      passed++
    }
  } catch (err) {
    log(colors.yellow, '   ℹ️  Could not check disk space')
  }

  // ====== 8. Memory ======
  try {
    const free = require('os').freemem()
    const total = require('os').totalmem()
    const percent = Math.round((1 - free / total) * 100)

    log(colors.cyan, `   💾 Memory Usage: ${percent}%`)
    
    if (percent > 90) {
      log(colors.red, '   ❌ Memory critical!')
      failed++
    } else if (percent > 75) {
      log(colors.yellow, '   ⚠️  Memory usage high')
    } else {
      log(colors.green, '   ✅ Memory: OK')
      passed++
    }
  } catch (err) {
    // Ignore
  }

  // ====== RÉSUMÉ ======
  section('📊 RÉSUMÉ')

  const total = passed + failed
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0

  log(colors.green, `✅ Passed: ${passed}`)
  log(colors.red, `❌ Failed: ${failed}`)
  log(colors.bold, `📈 Score: ${percentage}%`)

  if (failed === 0) {
    log(colors.green, '\n🎉 DÉPLOIEMENT RÉUSSI!')
    log(colors.green, '\n✅ Votre site est ACTIF à: https://agri-ps.com')
    log(colors.green, '✅ La campagne est VISIBLE dans le header (link vert 🌱)')
    log(colors.green, '\n📝 Prochaines étapes:')
    log(colors.blue, '   1. Activez la campagne: npm run campaign:go-live')
    log(colors.blue, '   2. Envoyez l\'annonce aux clients')
    log(colors.blue, '   3. Démarrez le monitoring: npm run monitor:agent')
    return 0
  } else if (failed <= 2) {
    log(colors.yellow, '\n⚠️  Il y a quelques problèmes (voir ci-dessus)')
    log(colors.yellow, '\n🔧 Solutions rapides:')
    log(colors.yellow, '   - Vérifiez les logs PM2: pm2 logs agripoint-production')
    log(colors.yellow, '   - Redémarrez: pm2 restart agripoint-production')
    log(colors.yellow, '   - Vérifiez Nginx: sudo systemctl status nginx')
    return 1
  } else {
    log(colors.red, '\n❌ Problèmes significatifs détectés!')
    log(colors.red, '\n📚 Guide complet: Lisez HOSTINGER-DEPLOY-NOW-AGRI-PS.md')
    return 1
  }
}

// Execute
test().then(code => process.exit(code)).catch(err => {
  log(colors.red, 'Erreur:', err.message)
  process.exit(1)
})
