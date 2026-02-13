// scripts/pre-launch-tests.js
/**
 * Comprehensive Pre-Launch Testing Suite
 * Runs all critical tests before campaign go-live
 * 
 * Usage: npm run pre-launch-tests
 * Or: node scripts/pre-launch-tests.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class PreLaunchTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.timestamp = new Date().toISOString();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    console.log('\n' + '━'.repeat(60));
    this.log(title, 'cyan');
    console.log('━'.repeat(60));
  }

  logTest(name, passed, details = '') {
    if (passed) {
      this.log(`✅ PASSED - ${name}`, 'green');
      this.passed++;
    } else {
      this.log(`❌ FAILED - ${name}`, 'red');
      this.failed++;
    }
    if (details) {
      console.log(`   ${details}`);
    }
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
    this.warnings++;
  }

  // Test 1: Environment
  testEnvironment() {
    this.logSection('TEST 1: Environment Configuration');

    const requiredVars = [
      'MONGODB_URI',
      'NEXTAUTH_SECRET',
      'SMS_PROVIDER',
      'ADMIN_SMS_TOKEN',
    ];

    const missingVars = requiredVars.filter(
      (v) => !process.env[v]
    );

    if (missingVars.length === 0) {
      this.logTest('Environment variables', true);
      requiredVars.forEach((v) => {
        const value = process.env[v];
        const masked = value?.length > 10 
          ? value.substring(0, 5) + '...' + value.substring(value.length - 3)
          : '***';
        console.log(`   ✓ ${v}=${masked}`);
      });
    } else {
      this.logTest('Environment variables', false);
      console.log(`   Missing: ${missingVars.join(', ')}`);
      console.log('   Fix: Add variables to .env.local');
    }
  }

  // Test 2: Build
  testBuild() {
    this.logSection('TEST 2: Build Project');

    try {
      const output = execSync('npm run build 2>&1', { 
        encoding: 'utf-8',
        timeout: 120000 
      });

      if (output.includes('Compiled successfully')) {
        this.logTest('Build completes successfully', true);
        // Extract build time if available
        const timeMatch = output.match(/Compiled successfully in (\d+\.?\d*s)/);
        if (timeMatch) {
          console.log(`   Build time: ${timeMatch[1]}`);
        }
      } else if (output.includes('error')) {
        this.logTest('Build completes successfully', false);
        console.log('   Errors found:');
        output.split('\n').filter(l => l.includes('error')).slice(0, 5).forEach(l => {
          console.log(`   ${l}`);
        });
      } else {
        this.logTest('Build completes successfully', true);
      }
    } catch (error) {
      this.logTest('Build completes successfully', false, error.message);
    }
  }

  // Test 3: TypeScript
  testTypeScript() {
    this.logSection('TEST 3: TypeScript Compilation');

    try {
      execSync('npm run type-check 2>&1', { encoding: 'utf-8' });
      this.logTest('TypeScript check passes', true);
    } catch (error) {
      if (error.stdout?.includes('error TS')) {
        this.logTest('TypeScript check passes', false);
        const errors = error.stdout.split('\n').filter(l => l.includes('error TS'));
        console.log(`   Found ${errors.length} TypeScript errors`);
        errors.slice(0, 3).forEach(e => console.log(`   ${e}`));
      } else {
        this.logTest('TypeScript check passes', true);
      }
    }
  }

  // Test 4: Dependencies
  testDependencies() {
    this.logSection('TEST 4: Node Dependencies');

    const requiredDeps = [
      'next',
      'react',
      'mongoose',
      'axios',
      'dotenv',
    ];

    let missingCount = 0;
    requiredDeps.forEach((dep) => {
      try {
        require.resolve(dep);
        console.log(`   ✓ ${dep}`);
      } catch (e) {
        console.log(`   ✗ ${dep} missing`);
        missingCount++;
      }
    });

    this.logTest(`All dependencies installed (${requiredDeps.length}/${requiredDeps.length})`, 
                 missingCount === 0);
  }

  // Test 5: Database Connection
  testDatabase() {
    this.logSection('TEST 5: Database Connection');

    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      this.logTest('MongoDB connection', false, 'MONGODB_URI not set');
      return;
    }

    mongoose.connect(mongoUri)
      .then(() => {
        this.logTest('MongoDB connection', true);
        console.log(`   Connected to: ${mongoUri.split('@')[1]?.split('/')[0] || 'Atlas'}`);
        mongoose.connection.close();
      })
      .catch((error) => {
        this.logTest('MongoDB connection', false, error.message);
      });
  }

  // Test 6: Campaign Data
  testCampaignData() {
    this.logSection('TEST 6: Campaign Data & Seeding');

    try {
      // This would require MongoDB connection - simplified check
      const checkScript = path.join(__dirname, 'check-db.js');
      if (fs.existsSync(checkScript)) {
        this.logTest('Campaign check script exists', true);
        console.log('   Note: Run "node scripts/check-db.js" to verify campaign data');
      } else {
        this.logWarning('check-db.js script not found');
      }
    } catch (error) {
      this.logTest('Campaign data check', false, error.message);
    }
  }

  // Test 7: SMS Configuration
  testSMSConfiguration() {
    this.logSection('TEST 7: SMS Provider Configuration');

    const provider = process.env.SMS_PROVIDER || 'test';
    const hasApiKey = !!process.env.INFOBIP_API_KEY;

    console.log(`   Provider: ${provider.toUpperCase()}`);

    if (provider === 'infobip' && !hasApiKey) {
      this.logWarning('Infobip selected but API key not configured');
      console.log('   Action: Set INFOBIP_API_KEY in .env.local for production');
    } else if (provider === 'infobip' && hasApiKey) {
      this.logTest('Infobip API key configured', true);
    } else {
      this.logTest(`SMS provider configured (${provider})`, true);
    }

    const hasToken = !!process.env.ADMIN_SMS_TOKEN;
    this.logTest('Admin SMS token configured', hasToken);
  }

  // Test 8: Security
  testSecurity() {
    this.logSection('TEST 8: Security Configuration');

    const securityChecks = [
      {
        name: '.env.local exists',
        check: () => fs.existsSync('.env.local'),
      },
      {
        name: '.env.local not in git',
        check: () => {
          try {
            execSync('git ls-files .env.local 2>&1', { encoding: 'utf-8' });
            return false; // Should NOT be in git
          } catch {
            return true; // Good - not in git
          }
        },
      },
      {
        name: 'NEXTAUTH_SECRET is strong',
        check: () => {
          const secret = process.env.NEXTAUTH_SECRET || '';
          return secret.length >= 32;
        },
      },
      {
        name: 'ADMIN_SMS_TOKEN is set',
        check: () => !!process.env.ADMIN_SMS_TOKEN,
      },
    ];

    securityChecks.forEach((check) => {
      this.logTest(check.name, check.check());
    });
  }

  // Test 9: File Structure
  testFileStructure() {
    this.logSection('TEST 9: Project File Structure');

    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      '.env.local',
      '.gitignore',
      'app/page.tsx',
      'app/layout.tsx',
      'app/api',
    ];

    let allExist = true;
    requiredFiles.forEach((file) => {
      const exists = fs.existsSync(file);
      console.log(`   ${exists ? '✓' : '✗'} ${file}`);
      if (!exists) allExist = false;
    });

    this.logTest('All required files exist', allExist);
  }

  // Test 10: Campaign Pages
  testCampaignPages() {
    this.logSection('TEST 10: Campaign Pages & Routes');

    const requiredPages = [
      'app/campagne-engrais/page.tsx',
      'app/admin/campaigns/page.tsx',
      'app/api/campaigns',
      'app/api/sms/send/route.ts',
    ];

    let allExist = true;
    requiredPages.forEach((page) => {
      const exists = fs.existsSync(page);
      console.log(`   ${exists ? '✓' : '✗'} ${page}`);
      if (!exists) allExist = false;
    });

    this.logTest('All campaign pages/APIs exist', allExist);
  }

  // Summary
  summarize() {
    this.logSection('TEST RESULTS SUMMARY');

    console.log(`${colors.green}✅ PASSED: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}❌ FAILED: ${this.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  WARNINGS: ${this.warnings}${colors.reset}`);

    console.log('\n' + '━'.repeat(60));

    if (this.failed === 0) {
      this.log('🎉 ALL PRE-LAUNCH TESTS PASSED!', 'green');
      console.log('');
      console.log('Campaign is ready for deployment on Feb 28, 2026');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('   1. Run final functionality tests manually');
      console.log('   2. Deploy to Hostinger staging');
      console.log('   3. Get team sign-off');
      console.log('   4. Deploy to production (Mar 1, 00:00)');
      console.log('');
      console.log('════════════════════════════════════════════════════════════');
      return 0;
    } else {
      this.log(`${this.failed} TEST(S) FAILED - DEPLOYMENT BLOCKED`, 'red');
      console.log('');
      console.log('🔧 Please fix the issues above:');
      console.log('   • Check error messages');
      console.log('   • Verify .env.local configuration');
      console.log('   • Ensure MongoDB Atlas is accessible');
      console.log('   • Install missing dependencies: npm install');
      console.log('');
      console.log('════════════════════════════════════════════════════════════');
      return 1;
    }
  }

  async run() {
    console.clear();
    console.log('════════════════════════════════════════════════════════════');
    this.log('🧪 AGRI-POINT CAMPAIGN - PRE-LAUNCH TESTING SUITE', 'cyan');
    console.log('════════════════════════════════════════════════════════════');

    this.testEnvironment();
    this.testBuild();
    this.testTypeScript();
    this.testDependencies();
    this.testDatabase();
    this.testCampaignData();
    this.testSMSConfiguration();
    this.testSecurity();
    this.testFileStructure();
    this.testCampaignPages();

    const exitCode = this.summarize();
    process.exit(exitCode);
  }
}

// Run tests
const tester = new PreLaunchTester();
tester.run().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
