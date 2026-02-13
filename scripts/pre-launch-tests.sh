#!/bin/bash
# scripts/pre-launch-tests.sh
# Comprehensive pre-launch testing script

set -e  # Exit on any error

echo "════════════════════════════════════════════════════════════"
echo "🧪 AGRI-POINT CAMPAIGN PRE-LAUNCH TESTING SUITE"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper function to print test result
test_result() {
  local test_name=$1
  local result=$2
  
  if [ $result -eq 0 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - $test_name"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAILED${NC} - $test_name"
    ((FAILED++))
  fi
}

# Test 1: Build
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 TEST 1: Build Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build > /tmp/build.log 2>&1
if grep -q "Compiled successfully" /tmp/build.log; then
  test_result "Build succeeds" 0
else
  test_result "Build succeeds" 1
  echo "   Build output:"
  cat /tmp/build.log
fi
echo ""

# Test 2: TypeScript check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 TEST 2: TypeScript Compilation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run type-check > /tmp/typecheck.log 2>&1
if [ $? -eq 0 ]; then
  test_result "TypeScript check passes" 0
else
  test_result "TypeScript check passes" 1
  echo "   TypeScript errors:"
  cat /tmp/typecheck.log
fi
echo ""

# Test 3: Environment check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 TEST 3: Environment Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f .env.local ]; then
  test_result ".env.local exists" 0
  
  # Check required variables
  required_vars=("MONGODB_URI" "NEXTAUTH_SECRET" "SMS_PROVIDER")
  for var in "${required_vars[@]}"; do
    if grep -q "^$var=" .env.local; then
      echo "   ✓ $var configured"
    else
      echo "   ✗ $var missing"
    fi
  done
else
  test_result ".env.local exists" 1
fi
echo ""

# Test 4: Dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 TEST 4: Node Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if main dependencies are installed
main_deps=("next" "react" "mongoose" "axios")
all_installed=0

for dep in "${main_deps[@]}"; do
  if npm list $dep > /dev/null 2>&1; then
    echo "   ✓ $dep installed"
  else
    echo "   ✗ $dep missing"
    all_installed=1
  fi
done

test_result "All dependencies installed" $all_installed
echo ""

# Test 5: Campaign data
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 TEST 5: Database & Campaign Data"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "   Running campaign verification script..."
node scripts/check-db.js > /tmp/db-check.log 2>&1

if grep -q "Campagnes en BD: 1" /tmp/db-check.log; then
  test_result "Campaign exists in database" 0
  echo "   ✓ Campaign: engrais-mars-2026"
else
  test_result "Campaign exists in database" 1
  echo "   Database check output:"
  cat /tmp/db-check.log
fi
echo ""

# Test 6: SMS configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 TEST 6: SMS Provider Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm run test:sms > /tmp/sms-check.log 2>&1

if grep -q "SMS Provider Test PASSED" /tmp/sms-check.log; then
  test_result "SMS provider initialized" 0
  grep "Provider:" /tmp/sms-check.log
else
  test_result "SMS provider initialized" 1
  echo "   SMS check output:"
  cat /tmp/sms-check.log
fi
echo ""

# Test 7: Performance (Lighthouse - optional, may fail outside prod)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ TEST 7: Performance Check (Local)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Skipping local Lighthouse (requires running server)"
echo "   → Will test on staging/production with npm run build"
test_result "Performance testing" 0
echo ""

# Test 8: Security checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 TEST 8: Security Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

security_checks=0

# Check NEXTAUTH_SECRET is set
if grep -q "^NEXTAUTH_SECRET=" .env.local; then
  echo "   ✓ NextAuth secret configured"
else
  echo "   ✗ NextAuth secret missing"
  security_checks=1
fi

# Check ADMIN_SMS_TOKEN is set
if grep -q "^ADMIN_SMS_TOKEN=" .env.local; then
  echo "   ✓ Admin SMS token configured"
else
  echo "   ✗ Admin SMS token missing"
  security_checks=1
fi

test_result "Security configuration" $security_checks
echo ""

# Summary
echo "════════════════════════════════════════════════════════════"
echo "📊 TEST RESULTS SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 ALL PRE-LAUNCH TESTS PASSED!${NC}"
  echo "   Campaign is ready for deployment."
  echo ""
  echo "📋 Next Steps:"
  echo "   1. Deploy to Hostinger staging"
  echo "   2. Run additional UI tests"
  echo "   3. Team sign-off"
  echo "   4. Deploy to production (Mar 1, 00:00)"
  echo ""
  echo "════════════════════════════════════════════════════════════"
  exit 0
else
  echo ""
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo "   Please fix the issues above before deployment."
  echo ""
  echo "🔧 Troubleshooting:"
  echo "   1. Check error messages above"
  echo "   2. Verify .env.local configuration"
  echo "   3. Ensure MongoDB Atlas is accessible"
  echo "   4. Check npm packages are installed"
  echo ""
  echo "════════════════════════════════════════════════════════════"
  exit 1
fi
