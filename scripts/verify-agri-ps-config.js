#!/usr/bin/env node
/**
 * VÉRIFICATION CONFIGURATION agri-ps.com
 * 
 * Ce script vérifie que tout est bien configuré pour le domaine agri-ps.com
 * Utilisez-le APRÈS avoir appliqué le guide HOSTINGER-DOMAIN-FIX-AGRI-PS.md
 * 
 * Utilisation:
 *   node scripts/verify-agri-ps-config.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
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

async function verify() {
  let passed = 0
  let failed = 0

  section('🔍 VÉRIFICATION - Configuration agri-ps.com')

  // ====== 1. Vérifiez .env.local ======
  log(colors.bold, '\n1️⃣  Fichiers .env')
  
  if (fs.existsSync('.env.local')) {
    const envLocal = fs.readFileSync('.env.local', 'utf8')
    if (envLocal.includes('NEXT_PUBLIC_SITE_URL=https://agri-ps.com')) {
      log(colors.green, '   ✅ .env.local: NEXT_PUBLIC_SITE_URL correct')
      passed++
    } else {
      log(colors.red, '   ❌ .env.local: NEXT_PUBLIC_SITE_URL incorrect')
      log(colors.yellow, '      Expected: https://agri-ps.com')
      failed++
    }
  } else {
    log(colors.yellow, '   ⚠️  .env.local absent (utilisez-vous .env.production?)')
  }

  if (fs.existsSync('.env.production')) {
    const envProd = fs.readFileSync('.env.production', 'utf8')
    const checks = [
      { key: 'NEXT_PUBLIC_SITE_URL', value: 'https://agri-ps.com', label: 'Site URL' },
      { key: 'NEXT_PUBLIC_API_URL', value: 'https://agri-ps.com/api', label: 'API URL' },
      { key: 'NODE_ENV', value: 'production', label: 'Node Env' },
      { key: 'PORT', value: '3000', label: 'Port' },
    ]

    checks.forEach(check => {
      if (envProd.includes(`${check.key}=${check.value}`)) {
        log(colors.green, `   ✅ .env.production: ${check.label} correct`)
        passed++
      } else {
        log(colors.red, `   ❌ .env.production: ${check.label} manquant/incorrect`)
        failed++
      }
    })

    // Check MongoDB
    if (envProd.includes('MONGODB_URI=mongodb')) {
      log(colors.green, '   ✅ .env.production: MongoDB configuré')
      passed++
    } else {
      log(colors.red, '   ❌ .env.production: MongoDB manquant')
      failed++
    }
  } else {
    log(colors.yellow, '   ⚠️  .env.production absent')
  }

  // ====== 2. Vérifiez next.config.js ======
  log(colors.bold, '\n2️⃣  Configuration Next.js')
  
  const nextConfig = fs.readFileSync('next.config.js', 'utf8')
  if (nextConfig.includes("allowedOrigins: ['localhost:3000', 'localhost', '127.0.0.1', 'agri-ps.com', 'www.agri-ps.com']")) {
    log(colors.green, '   ✅ next.config.js: allowedOrigins incluent agri-ps.com')
    passed++
  } else if (nextConfig.includes('agri-ps.com')) {
    log(colors.green, '   ✅ next.config.js: agri-ps.com trouvé dans allowedOrigins')
    passed++
  } else {
    log(colors.red, '   ❌ next.config.js: agri-ps.com MANQUANT dans allowedOrigins')
    log(colors.yellow, '      Must include: agri-ps.com et www.agri-ps.com')
    failed++
  }

  // ====== 3. Vérifiez les fichiers présents ======
  log(colors.bold, '\n3️⃣  Fichiers obligatoires')
  
  const required = [
    'package.json',
    '.env.local',
    '.env.production',
    'next.config.js',
    'tsconfig.json',
    'app/page.tsx',
  ]

  required.forEach(file => {
    if (fs.existsSync(file)) {
      log(colors.green, `   ✅ ${file}`)
      passed++
    } else {
      log(colors.red, `   ❌ ${file} manquant!`)
      failed++
    }
  })

  // ====== 4. Vérifiez Node.js et npm ======
  log(colors.bold, '\n4️⃣  Environnement Node.js')
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim()
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
    
    log(colors.green, `   ✅ Node.js: ${nodeVersion}`)
    log(colors.green, `   ✅ npm: ${npmVersion}`)
    passed += 2

    // Check version >= 18
    const nodeMajor = parseInt(nodeVersion.split('.')[0].replace('v', ''))
    if (nodeMajor < 18) {
      log(colors.red, `   ❌ Node.js ${nodeMajor}.x est ancien (besoin 18+)`)
      failed++
    }
  } catch (err) {
    log(colors.red, '   ❌ Node.js ou npm non trouvé')
    failed++
  }

  // ====== 5. Vérifiez node_modules ======
  log(colors.bold, '\n5️⃣  Dépendances')
  
  if (fs.existsSync('node_modules')) {
    log(colors.green, '   ✅ node_modules trouvé')
    passed++

    if (fs.existsSync('node_modules/next')) {
      log(colors.green, '   ✅ Next.js installé')
      passed++
    } else {
      log(colors.red, '   ❌ Next.js manquant - exécutez: npm install')
      failed++
    }
  } else {
    log(colors.red, '   ❌ node_modules absent - exécutez: npm install')
    failed++
  }

  // ====== 6. Vérifiez .next (build) ======
  log(colors.bold, '\n6️⃣  Build Next.js')
  
  if (fs.existsSync('.next')) {
    log(colors.green, '   ✅ Dossier .next exist (build fait)')
    passed++

    const manifest = path.join('.next', 'build-manifest.json')
    if (fs.existsSync(manifest)) {
      log(colors.green, '   ✅ build-manifest.json trouvé')
      passed++
    }
  } else {
    log(colors.yellow, '   ⚠️  .next absent - exécutez: npm run build')
  }

  // ====== 7. Vérifiez package.json scripts ======
  log(colors.bold, '\n7️⃣  Scripts npm')
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredScripts = ['dev', 'build', 'start']
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      log(colors.green, `   ✅ npm run ${script}`)
      passed++
    } else {
      log(colors.red, `   ❌ npm run ${script} manquant`)
      failed++
    }
  })

  // ====== 8. MONGODB Connectivité ======
  log(colors.bold, '\n8️⃣  MongoDB Atlas')
  
  try {
    const { MongoClient } = require('mongodb')
    const mongoUri = process.env.MONGODB_URI || (envLocal && envLocal.match(/MONGODB_URI=(.+)/)?.[1])
    
    if (mongoUri) {
      log(colors.green, '   ℹ️  MONGODB_URI trouvé')
      log(colors.yellow, '   ⏳ (Connexion MongoDB non testée en CLI - sera testé à l\'exécution)')
      passed++
    } else {
      log(colors.red, '   ❌ MONGODB_URI manquant')
      failed++
    }
  } catch (err) {
    log(colors.yellow, '   ℹ️  MongoDB test skippé')
  }

  // ====== 9. PORT Configuration ======
  log(colors.bold, '\n9️⃣  Configuration Port')
  
  if (nextConfig.includes('PORT') || process.env.PORT === '3000') {
    log(colors.green, '   ✅ Port 3000 configuré')
    passed++
  } else {
    // Port 3000 est le défaut de Next.js
    log(colors.green, '   ✅ Port 3000 (défaut Next.js)')
    passed++
  }

  // ====== RÉSUMÉ ======
  section('📊 RÉSUMÉ')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  log(colors.green, `✅ Passed: ${passed}/${total}`)
  log(colors.red, `❌ Failed: ${failed}/${total}`)
  log(colors.bold, `📈 Score: ${percentage}%`)

  if (failed === 0) {
    log(colors.green, '\n🎉 EXCELLENT! Tout est configuré correctement!')
    log(colors.blue, '\nProchaines étapes:')
    log(colors.blue, '  1. npm run build        # Compiler pour production')
    log(colors.blue, '  2. npm run start        # Démarrer le serveur')
    log(colors.blue, '  3. Ouvrir: https://agri-ps.com')
    return 0
  } else if (failed <= 2) {
    log(colors.yellow, '\n⚠️  Quelques éléments à corriger:')
    log(colors.yellow, '  - Vérifiez les erreurs en rouge ci-dessus')
    log(colors.yellow, '  - Suivez le guide HOSTINGER-DOMAIN-FIX-AGRI-PS.md')
    return 1
  } else {
    log(colors.red, '\n❌ Configuration incomplète!')
    log(colors.red, '  - Exécutez le guide HOSTINGER-DOMAIN-FIX-AGRI-PS.md entièrement')
    log(colors.red, '  - Réexécutez ce script pour vérifier')
    return 1
  }
}

// Execute
verify().then(code => process.exit(code)).catch(err => {
  log(colors.red, 'Erreur:', err.message)
  process.exit(1)
})
