# 🚀 Vercel Deployment Setup Guide

**Date:** 28 Février 2026  
**Status:** Complete Checklist for Production

---

## 📋 Step 1: Vercel Dashboard Configuration

### Access Your Project
1. Go to [vercel.com](https://vercel.com)
2. Select project `agri-point-ecommerce`
3. Go to **Settings** tab
4. Click **Environment Variables** (left sidebar)

---

## 🔐 Step 2: Add Environment Variables

### 2.1 Email Configuration
Add these variables one by one:

**EMAIL_PROVIDER**
```
Type: Plain Text
Value: gmail
        (or: outlook, custom)
```

**EMAIL_USER**
```
Type: Plain Text (or Secret)
Value: your-email@gmail.com
        (Gmail: your full email address)
```

**EMAIL_PASSWORD**
```
Type: Secret
Value: your-app-specific-password
       (Gmail: Generate 16-char app password)
       (Outlook: Your account password)
```

**ADMIN_EMAIL**
```
Type: Plain Text
Value: admin@agri-ps.com
       (Where admin notifications go)
```

### 2.2 Google Maps Configuration
**NEXT_PUBLIC_GOOGLE_MAPS_KEY**
```
Type: Plain Text
Value: YOUR_GOOGLE_MAPS_API_KEY
       (Get from: https://console.cloud.google.com)
       
Note: Must start with NEXT_PUBLIC_ to be exposed to browser
```

### 2.3 Cron Job Configuration
**CRON_SECRET**
```
Type: Secret
Value: your-secure-random-token
       (Example: generate random token or use: $(openssl rand -hex 32))
```

### 2.4 Base URL (Optional)
**NEXT_PUBLIC_BASE_URL**
```
Type: Plain Text
Value: https://agri-ps.com
       (or your production domain)
```

---

## 🔑 How to Get Each Credential

### Gmail App Password (Recommended)
```
1. Go to myaccount.google.com
2. Security (left sidebar)
3. 2-Step Verification (enable if not done)
4. App passwords section
5. Select: Mail & Windows (or custom app)
6. Google will generate 16-character password
7. Copy this password → Paste as EMAIL_PASSWORD
```

### Google Maps API Key
```
1. Go to console.cloud.google.com
2. Create new project (or select existing)
3. APIs & Services → Library
4. Search "Maps JavaScript API"
5. Click Enable
6. Go to Credentials
7. Create API Key
8. Copy key → Paste as NEXT_PUBLIC_GOOGLE_MAPS_KEY
```

### Generate CRON_SECRET (Random Token)
**Using PowerShell:**
```powershell
[System.Convert]::ToBase64String(
  [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
)
```

**Using Python:**
```python
import secrets
print(secrets.token_hex(32))
```

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

---

## ✅ Step 3: Verify Configuration

### Check All Variables are Set
1. In Vercel Settings → Environment Variables
2. Verify these are shown (with values hidden):
   - ✓ EMAIL_PROVIDER
   - ✓ EMAIL_USER
   - ✓ EMAIL_PASSWORD (shows as Secret)
   - ✓ ADMIN_EMAIL
   - ✓ NEXT_PUBLIC_GOOGLE_MAPS_KEY
   - ✓ CRON_SECRET (shows as Secret)
   - ✓ NEXT_PUBLIC_BASE_URL (if added)

### Test via .env.local Locally
```bash
# Create .env.local
cp .env.example .env.local

# Edit with your values
EDITOR .env.local

# Test locally
npm run dev
```

---

## 🚀 Step 4: Deploy

### Trigger Deployment
**Option A: Auto Deploy**
```bash
git push origin main
# Vercel automatically deploys main branch
```

**Option B: Manual Redeploy**
1. In Vercel dashboard
2. Click **Deployments** tab
3. Find latest deployment
4. Click **...** menu
5. Select **Redeploy**

### Monitor Deployment
1. Watch Vercel build logs
2. Check for errors in Build Output
3. Build should show: "✓ Build successful"
4. Deployment will show: "✓ Production deployment ready"

---

## 📧 Step 5: Test Email Service

### Send Test Email
Create a test script:

```bash
# Create test-email.js
cat > test-email.js << 'EOF'
const { sendOrderConfirmation } = require('./lib/email-service');

const testOrder = {
  _id: 'test-123',
  user: 'test-user',
  items: [{ name: 'Test Product', quantity: 1, price: 1000 }],
  total: 3500,
  shippingAddress: {
    name: 'John Doe',
    email: 'your-email@gmail.com',
    phone: '+237 xxx xxx xxx'
  },
  status: 'pending'
};

sendOrderConfirmation(testOrder)
  .then(() => console.log('✓ Email sent successfully'))
  .catch(e => console.error('✗ Email failed:', e));
EOF

# Run test
node test-email.js
```

### Check Email Inbox
1. Check inbox of recipient (ADMIN_EMAIL)
2. Look for subject: "Confirmation de Votre Commande"
3. Verify order details display correctly
4. Check all links work

---

## 🗺️ Step 6: Test Google Maps

### Verify Maps Display
1. Deploy to Vercel
2. Visit production URL: https://agri-ps.com/carte
3. Should see Google Map with distributors
4. Verify:
   - ✓ Map loads
   - ✓ Markers appear (4 distributors)
   - ✓ Can click markers
   - ✓ List syncs with map

### If Map Doesn't Load
- Check API key is valid in Vercel env vars
- Check Maps API is enabled in Google Cloud
- Check browser console for errors (F12)
- Reload page with cache clear (Ctrl+Shift+R)

---

## ⏰ Step 7: Verify Cron Job

### Check Cron Status
1. In Vercel dashboard
2. Go to **Deployments**
3. Click on production deployment
4. Check **Cron Jobs** section
5. Should show:
   - Path: `/api/cron/agribot-follow-up`
   - Schedule: `0 0 * * *` (daily midnight UTC)
   - Status: Active

### Test Cron Manually
```bash
# Trigger manually (test)
curl -X GET "https://agri-ps.com/api/cron/agribot-follow-up" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Should return 200 and process result
```

---

## 🛒 Step 8: Test Promo Codes

### Create Test Promo Code
1. Admin panel: `/admin/promo-codes`
2. Click "New Code"
3. Create: 
   - Code: `SAVE20`
   - Type: Percentage
   - Value: 20
   - Min Order: 50000
   - Max Discount: 10000

### Test in Checkout
1. Add products to cart
2. Go to `/checkout`
3. In "Récapitulatif" section
4. Enter code: `SAVE20`
5. Click "Appliquer"
6. Should show: ✓ Code "SAVE20" appliqué ! -20% discount

---

## 🧪 Step 9: Full Production Test

### Test Complete Order Flow
1. **Browse Products** (`/produits`)
   - Search, filter, view details
   - ✓ Pages load fast

2. **Add to Cart** 
   - Click products
   - Verify cart count updates
   - ✓ Cart state works

3. **Checkout** (`/checkout`)
   - Fill form
   - Apply promo code
   - Select payment method
   - ✓ Form validation works

4. **Submit Order**
   - Should redirect to confirmation
   - Admin should receive email
   - Customer should receive confirmation
   - ✓ Emails sent

5. **Check Admin**
   - Go to `/admin/livraisons`
   - New order should appear
   - Status should be "Pending"
   - ✓ Dashboard syncs

---

## 📊 Monitoring Checklist

### Daily Checks
- [ ] Check Vercel deployment logs (no errors)
- [ ] Check email delivery (Gmail/Outlook inbox)
- [ ] Monitor cron job (runs every day at 00:00 UTC)
- [ ] Check Google Maps (markers appear)
- [ ] Monitor error logs (F12 console in production)

### Weekly Checks
- [ ] Review Vercel analytics
- [ ] Check error rates
- [ ] Verify promo code usage statistics
- [ ] Test backup email provider (if configured)

---

## 🔧 Troubleshooting

### Email Not Sending
```
Problem: "SMTP Error" in logs
Solution:
1. Check EMAIL_USER is correct
2. Check EMAIL_PASSWORD (must be app password, not account password)
3. For Gmail: Verify "Less secure apps" OR use app password
4. Check ADMIN_EMAIL is valid
5. Review logs in Vercel dashboard
```

### Maps Not Showing
```
Problem: "API key invalid" or blank map
Solution:
1. Verify NEXT_PUBLIC_GOOGLE_MAPS_KEY in Vercel env vars
2. Check key is enabled in Google Cloud Console
3. Check Maps JavaScript API is enabled
4. Hard refresh browser (Ctrl+Shift+R)
5. Check browser console for API errors
```

### Cron Job Not Running
```
Problem: Follow-up emails not sent at 00:00 UTC
Solution:
1. Check vercel.json has correct cron config
2. Verify CRON_SECRET set in Vercel
3. Check /api/cron/agribot-follow-up route exists
4. Review Vercel deployment logs
5. Trigger manually to test
```

---

## 🎯 Summary

Your deployment checklist:

1. ✅ npm install locally
2. ✅ Type check (npm run type-check)
3. ✅ Local test (npm run dev)
4. ✅ Add Vercel env variables (6 required)
5. ✅ Verify all 6 variables set
6. ✅ Deploy to Vercel (git push origin main)
7. ✅ Test email service
8. ✅ Test Google Maps
9. ✅ Verify cron job runs
10. ✅ Full order flow test
11. ✅ Monitor daily

---

## 📞 Support

**Need Help?**
- Vercel docs: https://vercel.com/docs
- Google Maps: https://developers.google.com/maps
- Email issues: Check Gmail/Outlook SMTP settings
- Check logs: Vercel Dashboard → Deployments → Build/Runtime logs

**Status After Complete Setup:**
```
✅ Email notifications: LIVE
✅ Google Maps: LIVE  
✅ Cron jobs: LIVE
✅ Promo codes: LIVE
✅ Agent running: 24/7
```

Ready to go live! 🚀
