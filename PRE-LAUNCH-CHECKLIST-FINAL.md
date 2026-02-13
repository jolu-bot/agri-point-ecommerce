# ✅ PRE-LAUNCH CHECKLIST - 28 Février (J-1)

**Deadline:** 28 Février, 23:59  
**Go-Live:** 1er Mars, 00:00  
**Status:** MUST PASS ALL CHECKS

---

## 🟢 PHASE 1: CODE & BUILD (30 min)

```
RESPONSIBILITY: Dev Team Lead

□ Latest code pulled from main branch
  Command: git pull origin main
  
□ Build completes with 0 errors
  Command: npm run build
  Output: "Compiled successfully"
  
□ No TypeScript errors
  Command: npm run type-check
  Output: No errors reported
  
□ Bundle size acceptable
  Command: npm run analyze:bundle
  Expected: < 2 MB (< 500KB gzipped)
  
□ All tests pass
  Command: npm run pre-launch-tests
  Expected: All 8 tests PASSED
  
□ Git commit message reviewed
  Example: "deploy: pre-launch build [date]"

APPROVAL: _________________________ DATE: _________
```

---

## 🟢 PHASE 2: DATABASE & DATA (30 min)

```
RESPONSIBILITY: Database Admin / DevOps

□ MongoDB Atlas accessible
  Test: mongosh "mongodb+srv://..."
  Expected: Connected successfully
  
□ Campaign document exists
  Check: campaigns collection
  - _id: ObjectId
  - slug: "engrais-mars-2026"
  - status: "active"
  - startDate: 2026-03-01
  - endDate: 2026-03-31
  
□ 4 Products linked & priced correctly
  Products in campaign:
  □ Engrais Minéral - 15,000 FCFA/unit
  □ Engrais Bio - 10,000 FCFA/unit
  □ [Product 3] - _____ FCFA
  □ [Product 4] - _____ FCFA
  
□ Backup created (24-hour automatic)
  Atlas > Backups
  Expected: Latest backup < 24 hours old
  
□ Database indexes verified
  Expected: All indexes optimized
  
□ Test data cleaned up
  Action: Remove all test orders/users except 1
  Reason: Keep test user for post-launch monitoring

APPROVAL: _________________________ DATE: _________
```

---

## 🟢 PHASE 3: INFRASTRUCTURE (HOSTINGER) (1 hour)

```
RESPONSIBILITY: DevOps / Infrastructure

HOSTINGER VPS SETUP:

□ VPS provisioned & accessible
  SSH: ssh root@[IP]
  Expected: Connected
  
□ Node.js 18+ installed
  Command: node --version
  Expected: v18.x.x or higher
  
□ PM2 installed & configured
  Command: pm2 list
  Expected: Process manager ready
  
□ Nginx installed & running
  Command: sudo systemctl status nginx
  Expected: active (running)
  
□ SSL certificate valid
  Command: sudo certbot certificates
  Expected: "/etc/letsencrypt/live/[domain]"
  Expiry: > 90 days
  
□ Domain DNS configured
  Domain: agri-point.cm (or your domain)
  Type: A Record
  Points to: [Hostinger IP]
  Verification: nslookup agri-point.cm
  
□ Environment variables set on VPS
  /home/app/.env:
  □ MONGODB_URI=mongodb+srv://...
  □ NEXTAUTH_URL=https://agri-point.cm
  □ NEXTAUTH_SECRET=[secret]
  □ SMS_PROVIDER=test (or infobip)
  □ ADMIN_SMS_TOKEN=[token]
  
□ Firewall rules configured
  Port 80: Open (HTTP → HTTPS redirect)
  Port 443: Open (HTTPS)
  Port 22: Open (SSH for admins only)
  Port 3000: Closed (internal only)
  
□ Database connection from VPS verified
  Command: npm run type-check (on VPS)
  Expected: MongoDB Atlas connection confirmed

APPROVAL: _________________________ DATE: _________
```

---

## 🟢 PHASE 4: DEPLOYMENT TEST (45 min)

```
RESPONSIBILITY: DevOps / Tech Lead

STAGING DEPLOYMENT:

□ deploy-hostinger.sh configured
  Update: Server IP & credentials
  
□ Script executed without errors
  Command: bash deploy-hostinger.sh
  Expected: All steps complete (green)
  
□ App starts successfully
  Command: pm2 start agri-point
  Output: "app started"
  
□ App accessible via HTTPS
  Browser: https://staging.agri-point.cm (or staging IP)
  Expected: Campaign page loads
  
□ Redis/Cache (if configured)
  Status: Connected & working
  
□ Logs show no errors
  Command: pm2 logs agri-point
  Expected: No ERROR or CRITICAL lines
  
□ Database connection working
  Verify: Can read campaign data
  
□ API endpoints responding
  GET /api/health → OK
  GET /api/campaigns/march-2026 → Campaign data
  GET /api/admin/campaigns/stats → Stats loaded

APPROVAL: _________________________ DATE: _________
```

---

## 🟢 PHASE 5: FUNCTIONALITY TESTING (1.5 hours)

```
RESPONSIBILITY: QA / Testing Team

CAMPAIGN PAGE:

□ Page loads in < 3 seconds
  Tool: DevTools > Network
  
□ Hero image displays correctly
  File: engrais-mars-2026-hero.jpg
  Size: 1920x600px
  
□ Form fields visible & functional
  Fields: Name, Type, Quantity, Phone
  Validation: Working correctly
  
□ Eligibility tests (4 scenarios)
  □ Scenario 1: No cooperative → ❌ Error message
  □ Scenario 2: No insurance → ❌ Error message
  □ Scenario 3: Qty < 6 → ❌ Error message
  □ Scenario 4: All criteria → ✅ Eligible!
  
□ Submit button state correct
  Disabled when: Invalid input
  Enabled when: All criteria met
  
□ Proceed to checkout works
  Navigation: Form → /checkout
  Expected: Seamless transition

ADMIN DASHBOARD:

□ Dashboard loads (URL: /admin/campaigns)
  Authentication: Login required (if applicable)
  
□ 4 KPI cards display
  □ Total Orders
  □ Revenue (FCFA)
  □ Avg Order Value
  □ Pending Payments
  
□ Orders table functional
  Columns: Date, Customer, Type, Qty, Amount, Status
  Filters: Work correctly
  
□ CSV export functional
  Click: Download button
  File: Opens in Excel/Sheets
  Data: Complete & correct

API ENDPOINTS:

□ GET /api/campaigns/march-2026 → 200 OK
□ POST /api/campaigns/apply → 200 OK
□ GET /api/admin/campaigns/stats → 200 OK
□ GET /api/sms/send (GET status) → 200 OK

MOBILE & RESPONSIVE:

□ iPhone 12 (390x844)
  Form: Fully visible, no overflow
  Buttons: Touch-friendly (44x44 min)
  
□ iPad (768x1024)
  Layout: Proper column width
  Form: Responsive design
  
□ Desktop (1920x1080)
  Layout: Full width utilized
  Images: Scaled correctly

PERFORMANCE:

□ Lighthouse score > 80
  Metric: Google Lighthouse audit
  
□ Page load < 1.5 seconds
  Tool: Chrome DevTools
  
□ No console errors
  DevTools: Console tab clean
  
□ Images optimized
  Format: WebP or AVIF where applicable

APPROVAL: _________________________ DATE: _________
```

---

## 🟢 PHASE 6: SMS INTEGRATION (30 min)

```
RESPONSIBILITY: Marketing / Communications

TEST MODE (Local):

□ Test SMS script works
  Command: npm run test:sms
  Output: "SMS Provider Test PASSED"
  
□ SMS Service initialized
  Provider: test or infobip (if configured)
  
□ Templates loaded
  Count: 4 (announcement, reminder, lastCall, paymentReminder)

API ENDPOINT:

□ SMS endpoint secured
  Test: POST without auth → 401 Unauthorized ✓
  
□ SMS endpoint with auth works
  Test: POST with token → 200 OK ✓
  Response: { success: true, sent: X, failed: Y }
  
□ Batch SMS capable
  Test: Send to 5 recipients
  Expected: All received

(IF USING INFOBIP):

□ Infobip account created
  Verified: Email confirmed
  
□ API key obtained
  Key: [configured in .env]
  
□ Phone number verified
  Format: +237XXXXXXXXX
  
□ SMS templates configured
  Count: 3 (announcement, reminder, lastCall)
  
□ Test SMS delivered
  Command: npm run test:sms:prod
  Received: Test SMS on phone within 5s
  
□ Cost estimate reviewed
  Cost/SMS: ~0.05€ or ~50 FCFA
  Campaign cost: < 5,000 FCFA (100 SMS)

(IF USING TEST MODE):

□ SMS remains in test mode
  Reason: SMS not sent, logged only
  Plan: Switch to production on [date]

APPROVAL: _________________________ DATE: _________
```

---

## 🟢 PHASE 7: SECURITY & COMPLIANCE (30 min)

```
RESPONSIBILITY: Security / Compliance Team

CODE SECURITY:

□ No hardcoded secrets
  Check: .env.local not in git
  Verify: grep -r "password=" lib/ (should be empty)
  
□ Input validation implemented
  Form fields: Sanitized
  API inputs: Validated
  
□ SQL/NoSQL injection prevention
  Mongoose: Safe queries with $set, $inc
  
□ XSS prevention active
  React: Auto-escaping enabled
  CSP headers: Configured (if applicable)
  
□ CSRF protection
  NextAuth: CSRF tokens enabled
  
□ Authentication secure
  Passwords: Hashed (bcryptjs)
  Sessions: Secure cookies (httpOnly, samesite)

DATA PRIVACY:

□ User data handling
  Collected: Minimal (name, phone, email)
  Storage: MongoDB Atlas (encrypted at rest)
  Retention: [Retention policy defined]
  
□ GDPR compliance (if applicable)
  Privacy policy: Updated
  Data deletion: Possible
  
□ Payment data
  Strategy: No local storage of payment details
  PCI compliance: Delegated to payment processor

ENVIRONMENT:

□ .env.local not committed
  Check: git log --oneline | grep ".env"
  
□ Secrets are unique
  NEXTAUTH_SECRET: Cryptographically random
  ADMIN_SMS_TOKEN: Cryptographically random
  MONGODB_URI: Secured with IP whitelist
  
□ Logging secure
  No sensitive data in logs
  Logs: Monitored for suspicious activity

APPROVAL: _________________________ DATE: _________
```

---

## 🟢 PHASE 8: FINAL SIGN-OFF (30 min)

```
RESPONSIBILITY: Project Manager / Product Owner

STAKEHOLDER SIGN-OFF:

□ Technical Lead
  "Code is production-ready"
  Signature: _________________ DATE: _________
  
□ DevOps / Infrastructure
  "VPS & DNS configured correctly"
  Signature: _________________ DATE: _________
  
□ QA / Testing
  "All functionality tests PASSED"
  Signature: _________________ DATE: _________
  
□ Security
  "Security checks complete, no critical issues"
  Signature: _________________ DATE: _________
  
□ Marketing / Communications
  "SMS templates ready, contacts list prepared"
  Signature: _________________ DATE: _________
  
□ Project Manager
  "All phases complete, ready for go-live"
  Signature: _________________ DATE: _________

KNOWN ISSUES:

□ None (expected for go-live)
  If any: ____________________________________
  Resolution plan: __________________________
  
□ Risk level: 🟢 LOW
  
□ Final decision: ✅ APPROVED FOR GO-LIVE

APPROVAL: _________________________ DATE: _________
```

---

## 📋 GO-LIVE CHECKLIST (1st March, 00:00)

```
TIME: 00:00 (Midnight)

□ Team assembled on call/chat
  Contacts: [list names]
  
□ Deployment script ready
  Script: deploy-hostinger.sh
  Status: Tested ✓
  
□ Rollback plan reviewed
  Option: Previous version deployment
  Time to rollback: < 15 minutes
  
□ Monitoring active
  Tool: PM2 logs
  Alert: Email notification on error
  
□ Communication template ready
  Message: "Campaign now live!"
  
□ Support team standby
  Hours: 00:00 - 12:00
  Contact: [phone/chat]

EXECUTION:

00:00 → Activate campaign in admin (set status: active)
06:00 → Send first SMS batch (optional)
09:00 → ANNOUNCEMENT to public
12:00 → Monitor metrics & feedback
18:00 → Daily debrief

APPROVAL: _________________________ DATE: _________
```

---

## 🎯 SIGN-OFF MATRIX

| Role | Responsible | Date | Sign |
|------|-------------|------|------|
| Dev Lead | Code Ready | _____ | ____ |
| DevOps | Infra Ready | _____ | ____ |
| QA | Tests Pass | _____ | ____ |
| Security | Issues Clear | _____ | ____ |
| Marketing | Comms Ready | _____ | ____ |
| Health & Safety | Compliance OK | _____ | ____ |
| **PM/Product** | **ALL READY** | _____ | ____ |

---

## ⏰ TIMELINE

```
Feb 28, 09:00  → Code review begins
Feb 28, 12:00  → Infrastructure final checks
Feb 28, 15:00  → Full testing execution
Feb 28, 18:00  → Sign-off meetings
Feb 28, 20:00  → Deployment test on staging
Feb 28, 22:00  → Final readiness check
Feb 28, 23:00  → Standing by for go-live
Feb 28, 23:50  → Final preparations

Mar 01, 00:00  → 🚀 GO-LIVE ACTIVATION
Mar 01, 06:00  → SMS announcement (if ready)
Mar 01, 09:00  → LIVE to public
Mar 01, 12:00  → Campaign monitoring
```

---

## 📞 ESCALATION CONTACTS

```
CRITICAL ISSUES:
  Primary: [CTO/Tech Lead] - [Phone]
  Secondary: [DevOps] - [Phone]
  
BUSINESS ISSUES:
  Primary: [Product Manager] - [Phone]
  Secondary: [Marketing] - [Phone]
  
24/7 SUPPORT:
  Email: support@agri-point.cm
  Message: [Slack/Teams bot]
```

---

**DOCUMENT VERSION:** 1.0 FINAL  
**LAST UPDATED:** Feb 13, 2026  
**NEXT REVIEW:** Feb 28, 2026

