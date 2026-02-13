# 🧪 PRE-LAUNCH TESTING - Guide Complet

## 📋 OVERVIEW

**Timeline:** 28 Février (J-1 avant lancement)  
**Duration:** 4-6 heures  
**Target:** 100% campaign functionality verified  
**Launch Gate:** All tests PASSING

---

## ✅ SECTION 1: TESTS LOCAUX (Local Environment)

### 1.1 Test de Build

```bash
# Clear everything first
npm run clean

# Rebuild from scratch
npm run build

# Expected output:
# ✅ Compiled successfully in 18-25s
# ✅ 0 errors, 0 warnings
# ✅ Route count: 52 routes
```

### 1.2 Test de Démarrage du Serveur

```bash
# Terminal 1: Start dev server
npm run dev

# Expected output:
# ▲ Next.js 16.1.6
# - Ready in: xxxx ms
# - Local: http://localhost:3000
```

### 1.3 Tests Rapides d'URL

```bash
# Terminal 2: Run quick tests
curl -s http://localhost:3000 | head -20
# Should return HTML (not error)

curl -s http://localhost:3000/campagne-engrais | head -20
# Should return campaign page HTML

curl -s http://localhost:3000/api/health
# Should return OK or error info
```

---

## ✅ SECTION 2: TESTS FONCTIONNELS (Campaign Features)

### 2.1 Test de Page Campagne

```bash
# Open in browser:
http://localhost:3000/campagne-engrais

# Check manually:
□ Page loads in < 3 seconds
□ Hero image displays (1920x600)
□ "Engrais Minéral 15,000 FCFA" visible
□ "Engrais Bio 10,000 FCFA" visible
□ Form has 4 fields (name, type, qty, phone)
□ Submit button is visible
□ No console errors (F12)
```

### 2.2 Test de Formulaire d'Éligibilité

```bash
# Scenario 1: Non-éligible (pas de coopérative)
1. Visit: http://localhost:3000/campagne-engrais
2. Fill form:
   - Nom: "Test User"
   - Type: "Minéral"
   - Quantité: "8"
   - Téléphone: "+237600000000"
3. Click: "Vérifier Éligibilité"
4. Expected: ❌ "Vous n'êtes pas membre d'une coopérative"
5. Submit button: DISABLED ✓

# Scenario 2: Éligible (tous critères)
1. Use db via MongoDB Atlas to verify user eligibility
2. Or use test user with all criteria met
3. Expected: ✅ "Vous êtes éligible!"
4. Submit button: ENABLED → Can proceed to checkout ✓
```

### 2.3 Test de Panier & Paiement

```bash
# Test Order Creation:

1. Create test order with eligible user
2. Panier shows:
   □ Product name + quantity
   □ Unit price (15,000 FCFA)
   □ Total amount calculated correctly
   □ 70/30 split shown:
      - Paiement 70%: 105,000 FCFA
      - Paiement 30%: 45,000 FCFA (due J+60)

3. MongoDB Atlas check:
   - Order document created ✓
   - installmentPayment structure correct ✓
   - campaignId linked ✓

4. Expected URLs:
   □ /panier shows order summary
   □ /checkout processes payment
   □ Success page after payment
```

### 2.4 Test du Dashboard Admin

```bash
# URL: http://localhost:3000/admin/campaigns

□ Dashboard loads without errors
□ 4 KPI cards visible:
  - Total Orders
  - Revenue (in FCFA)
  - Avg Order Value
  - Pending Payments
□ Orders table shows test order
□ Filters work (by date, status)
□ CSV export button functional
  - Download CSV and verify data

# CSV Content Check:
Date,Customer,Type,Qty,Amount,Status,Payment1,Payment2
2026-02-13,Test User,Minéral,8,120000,pending,84000,36000
```

---

## ✅ SECTION 3: TESTS D'API

### 3.1 Test Campaign API

```bash
# Get campaign
curl -s http://localhost:3000/api/campaigns/march-2026 | jq .

# Expected response:
{
  "campaign": {
    "slug": "engrais-mars-2026",
    "name": "Campagne Engrais Mars 2026",
    "status": "active",
    "products": [...]
  }
}

# HTTP Status: 200 ✓
```

### 3.2 Test Eligibility API

```bash
curl -X POST http://localhost:3000/api/campaigns/apply \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "hasCooperative": true,
    "hasInsurance": true,
    "quantity": 8
  }' | jq .

# Expected:
# { "eligible": true, "message": "Vous êtes éligible!" }
```

### 3.3 Test Checkout API

```bash
curl -X POST http://localhost:3000/api/campaigns/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "campaign": "engrais-mars-2026",
    "productId": "product-1",
    "quantity": 8,
    "email": "test@example.com"
  }' | jq .

# Expected:
# { "orderId": "xxx", "amount": 120000, "status": "pending" }
```

### 3.4 Test Stats API

```bash
curl -s http://localhost:3000/api/admin/campaigns/stats | jq .

# Expected:
# {
#   "totalOrders": 1,
#   "totalRevenue": 120000,
#   "avgOrderValue": 120000,
#   "pendingPayments": 45000
# }
```

---

## ✅ SECTION 4: TESTS SMS INTEGRATION

### 4.1 Test Mode

```bash
npm run test:sms

# Expected output:
# ════════════════════════════════════════
# 📱 SMS PROVIDER CONFIGURATION TEST
# Provider: TEST
# Test Phone: +237600000000
# ════════════════════════════════════════
# ✅ SMS Provider Test PASSED!
```

### 4.2 Test API SMS Endpoint

```bash
# GET Status
curl -s http://localhost:3000/api/sms/send | jq .

# Expected:
# {
#   "status": "SMS Service Active",
#   "provider": "test",
#   "configured": "No (test mode)",
#   "templates": ["announcement", "reminder", "lastCall", "paymentReminder"]
# }
```

### 4.3 Test SMS Sending (Missing Auth)

```bash
# Should fail - missing auth
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+237600000000"],
    "templateKey": "announcement"
  }'

# Expected: 401 Unauthorized ✓
```

### 4.4 Test SMS Sending (With Auth)

```bash
# First, get ADMIN_SMS_TOKEN from .env.local
# Then:

curl -X POST http://localhost:3000/api/sms/send \
  -H "Authorization: Bearer test-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+237600000000"],
    "templateKey": "announcement"
  }' | jq .

# Expected:
# {
#   "success": true,
#   "message": "SMS campaign sent: 1/1 successful",
#   "stats": { "sent": 1, "failed": 0, "total": 1 },
#   "provider": "test"
# }

# Check logs:
# npm run dev should show: 📨 [TEST MODE] SMS...
```

---

## ✅ SECTION 5: TESTS DE PERFORMANCE

### 5.1 Lighthouse (Local)

```bash
npm run build

npx lighthouse http://localhost:3000/campagne-engrais \
  --output=json \
  --output-path=./lighthouse-local.json

# Expected scores:
# Performance: > 80
# Accessibility: > 90
# Best Practices: > 85
# SEO: > 90
```

### 5.2 Page Load Speed

```bash
# Using curl with time
curl -o /dev/null -s -w "Total time: %{time_total}s\n" \
  http://localhost:3000/campagne-engrais

# Expected: < 1.5 seconds
```

### 5.3 Bundle Size

```bash
npm run analyze:bundle

# Expected:
# Next.js runtime: ~50KB
# Campaign page: ~20KB
# Total gzipped: < 200KB
```

---

## ✅ SECTION 6: TESTS DE RESPONSIVITÉ

### 6.1 Mobile View (UI Tests)

```bash
# Open in Chrome DevTools:
http://localhost:3000/campagne-engrais

# F12 → Toggle device toolbar (Ctrl+Shift+M)

# Test on:
□ iPhone 12 (390x844)
  - Form fields stack vertically
  - Submit button full width
  - Images scale correctly
  
□ iPad (768x1024)
  - Layout is 2-column
  - Form doesn't overflow
  
□ Desktop (1920x1080)
  - Hero image full width
  - Responsive buttons
```

### 6.2 Touch Testing

```bash
# On mobile device or DevTools mobile mode:

□ Buttons are 44x44 minimum (touch-friendly)
□ Form inputs are 44px tall
□ Scrolling is smooth
□ No horizontal overflow
□ Links have spacing between them
```

---

## ✅ SECTION 7: TESTS DE BASE DE DONNÉES

### 7.1 MongoDB Connection

```bash
# Check connection status
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e.message))"

# Expected: ✅ Connected
```

### 7.2 Campaign Data

```javascript
// Open MongoDB Atlas dashboard
// Or run script:

db.campaigns.find({ slug: "engrais-mars-2026" })

// Expected:
// {
//   _id: ObjectId("..."),
//   slug: "engrais-mars-2026",
//   status: "active",
//   startDate: ISODate("2026-03-01"),
//   endDate: ISODate("2026-03-31"),
//   products: [...]
// }
```

### 7.3 Seeding Verification

```bash
# Run seeding
npm run seed:campaign
npm run seed:campaign:products

# Verify in MongoDB Atlas:
□ Campaign document exists
□ 4 Products linked
□ Prices: 15000 (minéral), 10000 (bio)
□ Status: active

# Check error logs - should be clean
```

---

## ✅ SECTION 8: SECURITY TESTS

### 8.1 Input Validation

```bash
# Test XSS Prevention
curl -X POST http://localhost:3000/api/campaigns/apply \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<script>alert(1)</script>",
    "hasCooperative": true,
    "hasInsurance": true,
    "quantity": 8
  }' | jq .

# Expected: Email validation error (not script execution)
```

### 8.2 Authentication

```bash
# SMS endpoint without auth
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["+237600000000"], "templateKey": "announcement"}'

# Expected: 401 Unauthorized ✓

# Admin page without auth
curl -s http://localhost:3000/admin/campaigns

# Expected: Redirect to login or 403 ✓
```

### 8.3 Rate Limiting (Ready for Nginx)

```bash
# Will be implemented on Hostinger with Nginx
# Local test: Can add middleware if needed

# Expected behavior on production:
# Max 10 requests/min per IP
# Returns 429 Too Many Requests after limit
```

---

## ✅ SECTION 9: INTEGRATION TESTS

### 9.1 Full Scenario: Form → Order → Payment

```bash
# Step 1: User visits campaign page
1. Browser: http://localhost:3000/campagne-engrais
   Expected: Page loads ✓

# Step 2: Fill and submit eligibility form
2. Form submission:
   Expected: "Vous êtes éligible!" ✓

# Step 3: Proceed to checkout
3. Click "Procéder au Paiement"
   Expected: /checkout page loads ✓

# Step 4: Order created
4. Check MongoDB:
   Expected: New order document ✓

# Step 5: Order visible in admin
5. Dashboard: /admin/campaigns
   Expected: Order appears in table ✓

# Step 6: CSV export works
6. Download CSV
   Expected: Contains order data ✓
```

### 9.2 SMS Campaign Flow

```bash
# Step 1: Send announcement SMS
curl -X POST http://localhost:3000/api/sms/send \
  -H "Authorization: Bearer test-token-change-in-production" \
  -d '{
    "recipients": ["+237600000000"],
    "templateKey": "announcement"
  }'
Expected: ✅ success ✓

# Step 2: Verify logs show SMS sent
Expected: "📨 [TEST MODE] SMS..." ✓

# Step 3: (On Infobip) Verify SMS received
Expected: SMS arrives in 2-5 seconds ✓

# Step 4: User clicks link
Expected: Campaign page loads ✓
```

---

## ✅ SECTION 10: HOSTINGER STAGING TEST

### 10.1 Deploy to Hostinger (Test Server)

```bash
# On Hostinger VPS (staging):

# 1. Deploy using script
bash deploy-hostinger.sh

# 2. Verify app is running
pm2 list
# Expected: Node.js process running

# 3. Test from URL
curl -s https://your-staging-domain.cm/api/health

# 4. Test campaign page
curl -s https://your-staging-domain.cm/campagne-engrais | head -20

# 5. Run Lighthouse
npx lighthouse https://your-staging-domain.cm/campagne-engrais \
  --output=json \
  --output-path=./lighthouse-staging.json
```

### 10.2 Nginx Configuration Check

```bash
# On Hostinger:

# Check Nginx status
sudo nginx -t
# Expected: nginx: configuration test is successful

# Check SSL certificate
sudo certbot certificates
# Expected: Valid certificate for your domain

# Test HTTPS redirect
curl -i http://your-domain.cm
# Expected: 301 redirect to https://
```

### 10.3 Database Connection Test

```bash
# From Hostinger app, verify MongoDB connection:

node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ DB Connected')).catch(e => console.log('❌ Error:', e.message))"

# Expected: ✅ DB Connected
```

---

## ✅ SECTION 11: AUTOMATED TEST SCRIPT

### Run All Tests at Once

```bash
# Create comprehensive test file
npm run pre-launch-tests

# This will:
□ Build the project
□ Start dev server
□ Run all functional tests
□ Check database
□ Test APIs
□ Test SMS integration
□ Generate report

# Expected output:
# ═══════════════════════════════════════
# 🧪 PRE-LAUNCH TEST REPORT
# ═══════════════════════════════════════
# ✅ Build: PASSED
# ✅ Server startup: PASSED
# ✅ Campaign page: PASSED
# ✅ Eligibility form: PASSED
# ✅ API endpoints: PASSED
# ✅ SMS integration: PASSED
# ✅ Database: PASSED
# ═══════════════════════════════════════
# 🎉 ALL TESTS PASSED - READY FOR GO-LIVE!
```

---

## 📋 TEST CHECKLIST

```
PRE-LAUNCH TESTING CHECKLIST (Due 28 Feb)

LOCAL TESTING (2 hours):
  □ npm run clean + npm run build (0 errors)
  □ npm run dev (server starts)
  □ Campaign page loads in < 3s
  □ Form validation works (4 scenarios)
  □ Dashboard loads without errors
  □ All 5 APIs return correct responses
  □ SMS test mode works
  □ No console errors (F12)
  □ Mobile responsive (iPhone + iPad)
  
DATABASE TESTING (30 min):
  □ MongoDB Atlas connected
  □ Campaign document exists
  □ 4 Products seeded & linked
  □ Test order creates correctly
  □ 70/30 payment split correct
  □ Dashboard stats calculate correctly
  
PERFORMANCE TESTING (1 hour):
  □ Lighthouse score > 80
  □ Page load < 1.5s
  □ Bundle size < 200KB gzipped
  □ No performance warnings
  
SECURITY TESTING (30 min):
  □ XSS prevention works
  □ Invalid auth blocked
  □ Input validation strong
  □ Form sanitization tested
  
DEPLOYMENT TESTING (1 hour):
  □ Hostinger staging deploy works
  □ Nginx configuration valid
  □ SSL certificate valid
  □ Database connection from VPS works
  □ App accessible via HTTPS
  
INTEGRATION TESTING (30 min):
  □ Full flow: Form → Order → Payment
  □ SMS endpoint secured
  □ Batch SMS sending works
  □ CSV export functional
  
FINAL VERIFICATION:
  □ All tests PASSED
  □ No critical issues
  □ Ready for production
  □ Stakeholders informed
```

---

## 🚀 SIGN-OFF

**Once all tests pass, sign off:**

```
Date: [Feb 28, 2026]
Tester: [Name]
Build Version: [commit hash]
Status: ✅ APPROVED FOR GO-LIVE

Known Issues: 
  □ None (all tests passing)

Risk Level: 🟢 LOW
```

---

**↓ Next: Execute these tests on Feb 28 before go-live on Mar 1**

