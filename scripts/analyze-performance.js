#!/usr/bin/env node

/**
 * Script d'analyse de performance
 * Utilise Lighthouse pour mesurer les performances
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = process.env.URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../performance-reports');

// Créer le dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(OUTPUT_DIR, `report-${timestamp}.html`);
const jsonPath = path.join(OUTPUT_DIR, `report-${timestamp}.json`);

console.log('🔍 Analyse de performance en cours...');
console.log(`📊 URL: ${URL}`);
console.log(`📁 Rapports: ${OUTPUT_DIR}`);

// Vérifier si le serveur est démarré
const checkServer = `curl -s -o /dev/null -w "%{http_code}" ${URL}`;

exec(checkServer, (error, stdout) => {
  if (stdout !== '200') {
    console.error('❌ Erreur: Le serveur ne répond pas sur', URL);
    console.log('💡 Démarrez le serveur avec: npm run dev ou npm run start');
    process.exit(1);
  }

  // Exécuter Lighthouse
  const lighthouseCmd = `npx lighthouse ${URL} --output=html --output=json --output-path=${reportPath.replace('.html', '')} --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`;

  exec(lighthouseCmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur Lighthouse:', error);
      return;
    }

    console.log('✅ Analyse terminée !');
    console.log(`📄 Rapport HTML: ${reportPath}`);
    console.log(`📄 Rapport JSON: ${jsonPath}`);

    // Lire et afficher les scores
    try {
      const jsonReport = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const categories = jsonReport.categories;

      console.log('\n📊 Scores Lighthouse:');
      console.log('━'.repeat(50));
      
      Object.entries(categories).forEach(([key, category]) => {
        const score = Math.round(category.score * 100);
        const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
        console.log(`${emoji} ${category.title.padEnd(20)} ${score}/100`);
      });

      console.log('━'.repeat(50));

      // Métriques de performance
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
        ];

        metricsToShow.forEach(key => {
          if (metrics[key]) {
            const metric = metrics[key];
            console.log(`${metric.title.padEnd(30)} ${metric.displayValue || 'N/A'}`);
          }
        });

        console.log('━'.repeat(50));
      }

      // Opportunités d'amélioration
      const opportunities = Object.values(jsonReport.audits).filter(
        audit => audit.score !== null && audit.score < 0.9 && audit.details?.overallSavingsMs > 100
      );

      if (opportunities.length > 0) {
        console.log('\n💡 Opportunités d\'amélioration:');
        console.log('━'.repeat(50));
        
        opportunities
          .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
          .slice(0, 5)
          .forEach(audit => {
            const savings = audit.details?.overallSavingsMs || 0;
            console.log(`⚠️  ${audit.title}`);
            console.log(`   Gain potentiel: ${Math.round(savings)}ms`);
          });
        
        console.log('━'.repeat(50));
      }

    } catch (parseError) {
      console.error('❌ Erreur lecture rapport:', parseError);
    }

    console.log('\n✨ Ouvrez le rapport HTML pour plus de détails.');
  });
});
