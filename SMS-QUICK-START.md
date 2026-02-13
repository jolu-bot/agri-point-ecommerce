# 📱 QUICK START - SMS INTEGRATION POST-DEPLOY

## 🚀 DEPLOYMENT CHECKLIST (5 Steps)

### ✅ Step 1: Test Mode (Local - Already Done!)
```bash
npm run test:sms
# Output: ✅ SMS Provider Test PASSED! (TEST MODE)
```

### Step 2: Choose Provider (Infobip Recommended)
```
Decision needed:
  □ Production: Setup Infobip account
  □ Production: Setup AWS SNS
  □ Test Mode: Keep as-is for now
```

### Step 3: Setup Infobip Account (PRODUCTION)
```bash
# If choosing Infobip:

1. Visit: https://infobip.com
2. Sign up → Verify email
3. Dashboard: Settings > API Keys
4. Create API Key (Name: "Agri-Point Campaign")
5. Copy API Key → Add to .env.local

# In .env.local:
SMS_PROVIDER=infobip
INFOBIP_API_KEY=your_api_key_here
INFOBIP_SENDER_ID=Agri-Point
ADMIN_SMS_TOKEN=strong-random-token-here
```

### Step 4: Test with Infobip Credentials
```bash
# After adding API key to .env.local:

# WARNING: This sends a REAL SMS to the test phone!
# First, update the phone number in test-sms-provider.js line 8:
# const PHONE = '+237XXXXXXXXX'; // Your phone number

# Then test:
npm run test:sms:prod

# You should receive SMS within 2-5 seconds
```

### Step 5: Deploy to Production (Hostinger)
```bash
# On Hostinger VPS:

1. Update environment variables:
   export SMS_PROVIDER=infobip
   export INFOBIP_API_KEY=your_key
   export ADMIN_SMS_TOKEN=strong_token

2. Restart Node.js application:
   pm2 restart agri-point

3. Test from production:
   curl -X POST https://yourdomain.cm/api/sms/send \
     -H "Authorization: Bearer YOUR_ADMIN_SMS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "recipients": ["+237XXXXXXXXX"],
       "templateKey": "announcement"
     }'

4. Check logs:
   pm2 logs agri-point | grep SMS
```

---

## 📋 TEMPLATES AVAILABLE

```javascript
// In API endpoint, use these templateKey values:

POST /api/sms/send
{
  "recipients": ["+237600000001", "+237600000002"],
  "templateKey": "announcement"  // One of these:
}

Available templates:
✓ "announcement"    - Campaign launch SMS
✓ "reminder"        - Campaign active reminder
✓ "lastCall"        - Last day warning
✓ "paymentReminder" - Payment due notification
```

---

## 🔐 SECURITY - ADMIN TOKEN

### Generate Secure Token
```bash
# Generate random 32-char token:
openssl rand -hex 16

# Or use online generator:
# https://www.uuidgenerator.net/

# Then set in .env:
ADMIN_SMS_TOKEN=abc123def456ghi789...
```

### Using in API Calls
```bash
curl -X POST https://yourdomain.cm/api/sms/send \
  -H "Authorization: Bearer abc123def456ghi789..." \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📱 CAMPAIGN SMS SCHEDULE

### PRE-LAUNCH (Feb 28)
```bash
Test to yourself first:
npm run test:sms
```

### ANNOUNCEMENT (Feb 28 - 18:00)
```bash
curl -X POST https://yourdomain.cm/api/sms/send \
  -H "Authorization: Bearer $ADMIN_SMS_TOKEN" \
  -d '{
    "recipients": ["+237600000001", "+237600000002"],
    "templateKey": "announcement"
  }'
```

### REMINDER (Mar 5 - 09:00)
```bash
curl -X POST https://yourdomain.cm/api/sms/send \
  -H "Authorization: Bearer $ADMIN_SMS_TOKEN" \
  -d '{
    "recipients": ["+237600000001", "+237600000002"],
    "templateKey": "reminder"
  }'
```

### FINAL CALL (Mar 27 - 18:00)
```bash
curl -X POST https://yourdomain.cm/api/sms/send \
  -H "Authorization: Bearer $ADMIN_SMS_TOKEN" \
  -d '{
    "recipients": ["+237600000001", "+237600000002"],
    "templateKey": "lastCall"
  }'
```

### PAYMENT DUE (May 1 - for J+60 payments)
```bash
curl -X POST https://yourdomain.cm/api/sms/send \
  -H "Authorization: Bearer $ADMIN_SMS_TOKEN" \
  -d '{
    "recipients": ["+237600000001", "+237600000002"],
    "templateKey": "paymentReminder",
    "dueDate": "01 May 2026"
  }'
```

---

## 🐛 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| `npm run test:sms` fails | Check .env.local exists and variables are set |
| SMS not sent (Infobip) | Verify API_KEY is correct |
| "Invalid phone format" | Use +237XXXXXXXXX (with country code) |
| 401 Unauthorized | Check ADMIN_SMS_TOKEN matches in header |
| SMS takes >30s | Normal for Infobip, check logs with `pm2 logs` |

---

## 📚 FULL DOCUMENTATION

For detailed setup:
- Production: See `SMS-PROVIDER-SETUP-COMPLETE.md`
- QR Codes: See `QR-CODES-TEMPLATES-FINAUX.md`
- Testing: See `GUIDE-TEST-CAMPAGNE.md`

---

**Status:** ✅ SMS Integration Ready for Deployment

