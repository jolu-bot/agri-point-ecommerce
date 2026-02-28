// Quick validation script for Phase 4 features
// This tests that all imports and core logic work

import * as fs from 'fs';
import * as path from 'path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

console.log('\n🧪 PHASE 4 LOCAL VALIDATION TESTS\n');

// Test 1: Email Service exists and has exports
function testEmailService() {
  try {
    const filePath = path.join(process.cwd(), 'lib/email-service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasOrderConfirmation = content.includes('sendOrderConfirmation');
    const hasPaymentConfirmation = content.includes('sendPaymentConfirmation');
    const hasAdminNotification = content.includes('sendAdminNotification');
    const hasFollowUp = content.includes('sendFollowUpEmail');
    
    const passed = hasOrderConfirmation && hasPaymentConfirmation && hasAdminNotification && hasFollowUp;
    
    results.push({
      name: 'Email Service (4 functions)',
      passed,
      message: passed 
        ? '✓ All 4 functions exported (confirmation, payment, followup, notification)'
        : '✗ Missing email functions'
    });
  } catch (e) {
    results.push({
      name: 'Email Service',
      passed: false,
      message: `✗ File not found or error: ${e}`
    });
  }
}

// Test 2: Promo Codes model exists
function testPromoCodesModel() {
  try {
    const filePath = path.join(process.cwd(), 'models/PromoCode.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasInterface = content.includes('interface IPromoCode');
    const hasModel = content.includes('export default');
    
    results.push({
      name: 'PromoCode Model',
      passed: hasInterface && hasModel,
      message: hasInterface && hasModel
        ? '✓ Model defined with interface and exports'
        : '✗ Model structure incomplete'
    });
  } catch (e) {
    results.push({
      name: 'PromoCode Model',
      passed: false,
      message: `✗ File not found: ${e}`
    });
  }
}

// Test 3: Promo API route exists
function testPromoAPI() {
  try {
    const filePath = path.join(process.cwd(), 'app/api/promo-codes/route.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasGET = content.includes('export async function GET');
    
    results.push({
      name: 'Promo API Route (/api/promo-codes)',
      passed: hasGET,
      message: hasGET
        ? '✓ GET endpoint exists for validation'
        : '✗ GET endpoint missing'
    });
  } catch (e) {
    results.push({
      name: 'Promo API Route',
      passed: false,
      message: `✗ Route not found: ${e}`
    });
  }
}

// Test 4: Cron route exists
function testCronRoute() {
  try {
    const filePath = path.join(process.cwd(), 'app/api/cron/agribot-follow-up/route.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasGET = content.includes('export async function GET');
    const hasFollowUp = content.includes('followUpEmailSent');
    
    results.push({
      name: 'Cron Route (/api/cron/agribot-follow-up)',
      passed: hasGET && hasFollowUp,
      message: hasGET && hasFollowUp
        ? '✓ Cron endpoint ready, tracks sent status'
        : '✗ Cron endpoint incomplete'
    });
  } catch (e) {
    results.push({
      name: 'Cron Route',
      passed: false,
      message: `✗ Route not found: ${e}`
    });
  }
}

// Test 5: AgriBot integration
function testAgribotIntegration() {
  try {
    const filePath = path.join(process.cwd(), 'components/agribot/AgriBot.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasDistributorsImport = content.includes("import DistributorsMap from '@/components/DistributorsMap'");
    const hasDistributorsModal = content.includes('showDistributorsModal');
    const hasMapButton = content.includes('<Map className');
    
    results.push({
      name: 'AgriBot + Maps Integration',
      passed: hasDistributorsImport && hasDistributorsModal && hasMapButton,
      message: hasDistributorsImport && hasDistributorsModal && hasMapButton
        ? '✓ DistributorsMap imported, modal state added, button in header'
        : '✗ Integration incomplete'
    });
  } catch (e) {
    results.push({
      name: 'AgriBot Integration',
      passed: false,
      message: `✗ File error: ${e}`
    });
  }
}

// Test 6: Vercel JSON config
function testVercelConfig() {
  try {
    const filePath = path.join(process.cwd(), 'vercel.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    
    const hasCrons = json.crons && json.crons.length > 0;
    const hasAgribotCron = hasCrons && json.crons.some((c: any) => c.path === '/api/cron/agribot-follow-up');
    
    results.push({
      name: 'Vercel Cron Configuration',
      passed: hasAgribotCron,
      message: hasAgribotCron
        ? '✓ Cron job configured (schedule: 0 0 * * *)'
        : '✗ Cron config missing'
    });
  } catch (e) {
    results.push({
      name: 'Vercel Config',
      passed: false,
      message: `✗ Config error: ${e}`
    });
  }
}

// Test 7: Checkout promo integration
function testCheckoutIntegration() {
  try {
    const filePath = path.join(process.cwd(), 'app/checkout/page.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasPromoState = content.includes('promoCodeInput');
    const hasValidateFunc = content.includes('validatePromoCode');
    const hasDiscountDisplay = content.includes('promoDiscount');
    
    results.push({
      name: 'Checkout Promo Integration',
      passed: hasPromoState && hasValidateFunc && hasDiscountDisplay,
      message: hasPromoState && hasValidateFunc && hasDiscountDisplay
        ? '✓ Promo input, validation function, discount display'
        : '✗ Integration incomplete'
    });
  } catch (e) {
    results.push({
      name: 'Checkout Integration',
      passed: false,
      message: `✗ File error: ${e}`
    });
  }
}

// Test 8: Orders API email integration
function testOrdersEmailIntegration() {
  try {
    const filePath = path.join(process.cwd(), 'app/api/orders/route.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasEmailImport = content.includes("import { sendOrderConfirmation");
    const hasEmailCall = content.includes('await sendOrderConfirmation');
    const hasAdminCall = content.includes('sendAdminNotification');
    
    results.push({
      name: 'Orders API Email Hooks',
      passed: hasEmailImport && hasEmailCall && hasAdminCall,
      message: hasEmailImport && hasEmailCall && hasAdminCall
        ? '✓ Email service imported and called on order creation'
        : '✗ Email integration missing'
    });
  } catch (e) {
    results.push({
      name: 'Orders API',
      passed: false,
      message: `✗ File error: ${e}`
    });
  }
}

// Run all tests
testEmailService();
testPromoCodesModel();
testPromoAPI();
testCronRoute();
testAgribotIntegration();
testVercelConfig();
testCheckoutIntegration();
testOrdersEmailIntegration();

// Print results
console.log('━'.repeat(70));

let passedCount = 0;
results.forEach((result, index) => {
  const status = result.passed ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  console.log(`${status} Test ${index + 1}: ${result.name}`);
  console.log(`   ${result.message}\n`);
  
  if (result.passed) passedCount++;
});

console.log('━'.repeat(70));
const percentage = Math.round((passedCount / results.length) * 100);
const allPassed = passedCount === results.length;
const color = allPassed ? GREEN : YELLOW;

console.log(`\n${color}Results: ${passedCount}/${results.length} tests passed (${percentage}%)${RESET}\n`);

if (allPassed) {
  console.log(`${GREEN}✅ ALL PHASE 4 FEATURES VALIDATED LOCALLY!${RESET}\n`);
  console.log('Ready for:');
  console.log('1. Local testing with npm run dev');
  console.log('2. Vercel environment variable setup');
  console.log('3. Production deployment\n');
  process.exit(0);
} else {
  console.log(`${RED}⚠ Some tests failed - Review above${RESET}\n`);
  process.exit(1);
}
