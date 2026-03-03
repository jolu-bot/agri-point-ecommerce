#!/usr/bin/env node

/**
 * Script d'analyse de performance
 * Utilise Lighthouse pour mesurer les performances
 * Version robuste Windows/Linux (sans dépendance curl)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = process.env.URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../performance-reports');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputBase = path.join(OUTPUT_DIR, `report-${timestamp}`);
const reportPath = `${outputBase}.report.html`;
const jsonPath = `${outputBase}.report.json`;

console.log('🔍 Analyse de performance en cours...');
console.log(`📊 URL: ${URL}`);
console.log(`📁 Rapports: ${OUTPUT_DIR}`);

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function checkServer() {
  try {
    const response = await fetch(URL, { method: 'GET' });
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

function printReportSummary(jsonReport) {
  const categories = jsonReport.categories;

  console.log('\n📊 Scores Lighthouse:');
  console.log('━'.repeat(50));

  Object.entries(categories).forEach(([, category]) => {
    const score = Math.round((category.score || 0) * 100);
    const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
    console.log(`${emoji} ${category.title.padEnd(20)} ${score}/100`);
  });

  console.log('━'.repeat(50));

  if (categories.performance) {
    const metrics = jsonReport.audits;
    console.log('\n⚡ Métriques de Performance:');
    console.log('━'.repeat(50));

    const metricsToShow = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'total-blocking-time',
      'cumulative-layout-shift',
      'speed-index',
      'interactive',
    ];

    metricsToShow.forEach((key) => {
      if (metrics[key]) {
        const metric = metrics[key];
        console.log(`${metric.title.padEnd(30)} ${metric.displayValue || 'N/A'}`);
      }
    });

    console.log('━'.repeat(50));
  }

  const opportunities = Object.values(jsonReport.audits).filter(
    (audit) => audit.score !== null && audit.score < 0.9 && audit.details?.overallSavingsMs > 100
  );

  if (opportunities.length > 0) {
    console.log('\n💡 Opportunités d\'amélioration:');
    console.log('━'.repeat(50));

    opportunities
      .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
      .slice(0, 5)
      .forEach((audit) => {
        const savings = audit.details?.overallSavingsMs || 0;
        console.log(`⚠️  ${audit.title}`);
        console.log(`   Gain potentiel: ${Math.round(savings)}ms`);
      });

    console.log('━'.repeat(50));
  }
}

(async () => {
  const isServerReady = await checkServer();

  if (!isServerReady) {
    console.error('❌ Erreur: Le serveur ne répond pas sur', URL);
    console.log('💡 Démarrez le serveur avec: npm run dev ou npm run start');
    process.exit(1);
  }

  const lighthouseCmd = `npx lighthouse ${URL} --output=html --output=json --output-path=${outputBase} --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`;

  try {
    await runCommand(lighthouseCmd);
  } catch ({ error }) {
    const reportExists = fs.existsSync(reportPath) && fs.existsSync(jsonPath);

    if (!reportExists) {
      console.error('❌ Erreur Lighthouse:', error);
      process.exit(1);
    }

    console.warn('⚠️ Lighthouse a terminé avec avertissement système (souvent EPERM sous Windows), rapport généré quand même.');
  }

  console.log('✅ Analyse terminée !');
  console.log(`📄 Rapport HTML: ${reportPath}`);
  console.log(`📄 Rapport JSON: ${jsonPath}`);

  try {
    const jsonReport = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    printReportSummary(jsonReport);
  } catch (parseError) {
    console.error('❌ Erreur lecture rapport:', parseError);
    process.exit(1);
  }

  console.log('\n✨ Ouvrez le rapport HTML pour plus de détails.');
})();
