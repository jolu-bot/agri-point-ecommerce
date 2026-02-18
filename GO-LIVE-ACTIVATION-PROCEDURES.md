# 🚀 GO-LIVE ACTIVATION - 1er Mars 2026 00:00

**Date:** 1er Mars 2026  
**Time:** 00:00 (Midnight) - 12:00 (Noon)  
**Status:** Campaign Launch Day  
**Target:** 100% uptime, zero errors

---

## 📋 FINAL 24-HOUR CHECKLIST (28 Feb 23:00 - Mar 1 00:00)

### **28 Février - 18:00**

```
SYSTEM VERIFICATION:

□ Final code deployment to Hostinger
  Command: bash deploy-hostinger.sh
  Status: All steps completed (green)
  
□ DNS verification
  Command: nslookup agri-ps.com
  Expected: Points to Hostinger IP
  
□ SSL certificate check
  Command: sudo certbot certificates
  Expected: Valid certificate, > 30 days remaining
  
□ Database backup
  Action: MongoDB Atlas > Backups
  Status: Latest backup < 1 hour old
  
□ PM2 process status
  Command: pm2 list
  Expected: agri-point running (status: online)
  
□ Nginx reverse proxy test
  Command: sudo nginx -t
  Expected: "nginx: configuration test is successful"
  
□ Application health
  curl https://agri-ps.com/api/health
  Expected: 200 OK response
```

### **28 Février - 20:00**

```
TEAM & COMMUNICATIONS:

□ Team assembled on call
  Participants: Dev, DevOps, PM, Marketing, Support
  Timezone: UTC+1 (West Africa)
  
□ Communication channels active
  □ Slack: #campaign-launch
  □ Email: support@agri-ps.com
  □ Phone: [Support team mobile numbers]
  
□ Escalation contacts confirmed
  Primary: [CTO] - [Phone]
  Secondary: [DevOps Lead] - [Phone]
  
□ Support team briefing
  Topic: Campaign features, common issues
  Duration: 30 minutes
  
□ Marketing team ready
  SMS templates: Verified
  Contact list: Exported from database
  Provider: Configured & tested
```

### **28 Février - 22:00**

```
FINAL SYSTEM CHECKS:

□ Load test (optional, if critical)
  Tool: Apache Bench or k6
  Scenario: 100 concurrent users
  Expected: Response time < 500ms, 0 errors
  
□ Database integrity
  Command: npm run check-db
  Expected: Campaign active, products linked
  
□ All APIs responding
  □ GET /api/campaigns/march-2026 → 200
  □ GET /api/admin/campaigns/stats → 200
  □ POST /api/campaigns/apply → 200
  □ GET /api/sms/send (status) → 200
  
□ Admin dashboard accessible
  URL: https://agri-ps.com/admin/campaigns
  Auth: Verified
  Data: Campaign visible
  
□ Campaign page displays correctly
  URL: https://agri-ps.com/campagne-engrais
  Hero image: Loading
  Form: All fields visible
  Mobile: Responsive
  
□ SMS provider test
  Command: npm run test:sms:prod
  Expected: Test SMS delivered within 5 seconds
```

### **28 Février - 23:50**

```
PRE-LAUNCH READINESS:

□ All systems: GREEN ✅
□ Team: Standing by
□ Communications: Active
□ Database: Backed up
□ Monitoring: Active
□ Fallback plan: Ready

FINAL DECISION:
✅ APPROVED TO PROCEED WITH GO-LIVE
```

---

## 🎯 GO-LIVE EXECUTION (1er Mars)

### **00:00 - 00:15: CAMPAIGN ACTIVATION**

```
STEP 1: Activate Campaign in Admin (00:00-00:05)

1. Login to admin panel
   URL: https://agri-ps.com/admin
   Username: [admin account]
   Password: [from .env]

2. Navigate to: Admin > Campaigns > Manage
3. Find: "engrais-mars-2026"
4. Change status: draft → ACTIVE
5. Save: Click "Publier Campagne"
6. Verify: Status shows "ACTIVE ✅"

STEP 2: Verify Campaign Live (00:05-00:10)

1. Visit campaign page
   URL: https://agri-ps.com/campagne-engrais
   Expected: Page loads, form visible

2. Test eligibility form
   Fill with test data:
   - Nom: "Test User"
   - Type: "Minéral"
   - Qty: "8"
   - Phone: "+237600000000"
   Submit: Click "Vérifier Éligibilité"
   Expected: ✅ Response in < 2 seconds

3. Check admin dashboard
   URL: https://agri-ps.com/admin/campaigns
   Expected: Stats card shows "1 campaign active"

STEP 3: Notify Team (00:10-00:15)

□ Send Slack message to #campaign-launch
  Message: "🚀 CAMPAIGN IS LIVE! Status: ACTIVE ✅
           Page: https://agri-ps.com/campagne-engrais
           Time: [timestamp]
           Team: Monitoring active"

□ Email to stakeholders
  Subject: "✅ Engrais Campaign LIVE - Mar 1, 00:15"
  
□ SMS to support team
  Message: "Campaign live. Monitor orders. Support active 24/7"
```

### **00:15 - 06:00: SILENT LAUNCH PERIOD**

```
PURPOSE: Monitor for critical issues without public announcement

RESPONSIBILITIES:

Dev Team:
□ Watch logs in real-time
  Command: pm2 logs agri-point
  Watch for: ERROR, CRITICAL, MongoDB connection issues
  Action: Notify immediately if issues found

DevOps:
□ Monitor system metrics
  CPU usage: Should be < 30%
  Memory: Should be < 50%
  Disk: Check space available
  Database: Connection pool status
  
□ Monitor API response times
  Expected: < 500ms for all endpoints
  
□ Check error logs
  Nginx: /var/log/nginx/error.log
  App: pm2 logs
  DB: MongoDB Atlas logs

Support Team:
□ Standby for customer inquiries
  Expect: Few orders during this period
  Response: Answer questions, collect feedback
  
□ Monitor email & chat
  Email: support@agri-ps.com
  Chat: No active marketing yet

Marketing Team:
□ Prepare SMS announcement
  Scheduled for: 06:00 (6 hours later)
  Template: Verified & ready
  Recipients: List of 500-1000 contacts
  
□ Prepare social media posts
  Platform: Facebook
  Scheduled: 09:00
```

### **06:00 - 09:00: SMS ANNOUNCEMENT PHASE**

```
STEP 1: Send SMS Announcement (06:00)

1. Login to SMS provider (Infobip admin panel)
2. Create campaign:
   Template: "announcement"
   Recipients: Export from Contacts table (coopératives)
   Message: "🌾 CAMPAGNE ENGRAIS MARS 2026 - BAS PRIX!..."
   
3. Via API (alternative):
   Command:
   curl -X POST https://agri-ps.com/api/sms/send \
     -H "Authorization: Bearer $ADMIN_SMS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "recipients": ["+237600000001", "+237600000002"],
       "templateKey": "announcement"
     }'

4. Verify sending
   Expected: SMS status "SENT" or "PENDING"
   Monitoring: SMS provider dashboard

STEP 2: Monitor SMS Delivery (06:00-07:00)

□ Track delivery rates
  SMS provider: Check statistics
  Expected: > 95% delivery within 10 minutes
  
□ Monitor support requests
  Email: Check for failed SMS complaints
  Phone: Be ready for support calls
  
□ Check orders received
  URL: /admin/campaigns
  Expected: First orders may appear

STEP 3: Social Media Announcement (09:00)

1. Post to Facebook
   Content: Campaign post with hero image
   CTA: Link to https://agri-ps.com/campagne-engrais
   
2. Share on WhatsApp Business
   Message: Broadcast to contact list
   
3. Tweet (if applicable)
   Message: Short announcement with CTA
   
4. Monitor engagement
   Expected: Comments, shares, clicks
```

### **09:00 - 12:00: FULL LAUNCH PERIOD**

```
STEP 1: Public Campaign LIVE (09:00)

Message to team:
"🎉 CAMPAIGN FULLY LIVE! 
 - SMS sent to 500+ contacts
 - Social media active
 - Support team monitoring
 - Orders expected to increase"

STEP 2: Monitor Key Metrics (09:00-12:00)

Real-time Dashboard:
□ Orders received: [Dashboard shows live count]
  Expected: 5-20 orders in first hours (slow ramp-up)
  
□ Eligibility rate: [Dashboard shows percentage]
  Expected: 60-80% of submissions eligible
  
□ Error rate: [Monitor logs]
  Expected: < 1% error rate
  
□ Response time: [Monitor APIs]
  Expected: < 300ms average
  
□ Payment 70/30: [Verify in MongoDB]
  Expected: All payments split correctly

STEP 3: Support Team Activities (09:00-12:00)

Incoming inquiries expected:
□ "How do I check eligibility?"
  Response: Direct to form on website
  
□ "How is payment structured?"
  Response: 70% now, 30% at J+60
  
□ "I received SMS, link doesn't work"
  Action: Check domain, send new link
  
□ "Can't complete order"
  Action: Debug form, collect error message
  
□ "Payment not received"
  Action: Check MongoDB, verify status

Support Channels:
□ Email: support@agri-ps.com
  Response time: < 1 hour
  
□ Phone: [Number]
  Response time: Immediate
  
□ WhatsApp: [Business account]
  Response time: < 30 minutes

STEP 4: Marketing KPIs (Monitor & Report)

□ SMS delivery rate
  Metric: % of SMSs successfully delivered
  Target: > 95%
  
□ Click-through rate
  Metric: % of recipients who click link
  Target: > 15%
  
□ Form completion rate
  Metric: % of visitors who complete form
  Target: > 40%
  
□ Eligibility rate
  Metric: % of submissions eligible
  Target: > 60%
  
□ Order conversion rate
  Metric: % of eligible users who place order
  Target: > 30%
  
□ Average order value
  Metric: FCFA per order
  Expected: 100,000-150,000 FCFA
```

---

## 🔴 INCIDENT RESPONSE PROCEDURES

### **Critical Issue: Campaign Page Not Loading**

```
DETECTION:
- Multiple error reports in support channel
- /api/campaigns/march-2026 returning 404

DIAGNOSIS:
1. Login to server: ssh root@[hostinger-ip]
2. Check process status: pm2 list
3. Check logs: pm2 logs agri-point | tail -50
4. Check database: Is MongoDB accessible?
5. Check DNS: Is domain resolving?

RESOLUTION (Choose One):

Option A: Restart application
  pm2 restart agri-point
  Wait: 30 seconds
  Test: curl https://agri-ps.com/
  Expected: 200 OK

Option B: Rebuild & redeploy
  git pull origin main
  npm run build
  pm2 restart agri-point
  Duration: 5-10 minutes
  
Option C: Rollback to previous version
  git checkout [previous-commit]
  npm run build
  pm2 restart agri-point
  Duration: 10-15 minutes
  
Option D: Fallback to maintenance page
  Redirect all traffic to static page
  Message: "Campaign temporarily paused. We're fine-tuning. Back in 30 minutes."
  Duration: Manual intervention

COMMUNICATION:
- If > 5 min issues: Send status update
- Post in #campaign-launch: "🔧 Brief technical pause, working on it"
- Update website: Add banner if needed
```

### **Critical Issue: Database Connection Lost**

```
SYMPTOMS:
- All API endpoints returning 500
- Cannot create orders
- Admin dashboard not loading

QUICK CHECKS:
1. Is MongoDB Atlas service up?
   Check: MongoDB Atlas console
   
2. Is MONGODB_URI correct?
   Check: .env on server
   
3. Is IP whitelisted?
   Check: MongoDB Atlas > Network Access
   Action: Add Hostinger IP if missing

RESOLUTION:
- Hostinger IP whitelist may have expired
- Action: Add current IP to whitelist
- Restart app: pm2 restart agri-point
- Test: npm run check-db

Contact: MongoDB Atlas support if persistent
```

### **Critical Issue: SMS Not Sending**

```
SYMPTOMS:
- SMS command executes but messages not received
- Infobip dashboard shows "FAILED" status

DIAGNOSIS:
1. Check Infobip credentials
   echo $INFOBIP_API_KEY
   
2. Check phone number format
   Should be: +237XXXXXXXXX (11+ digits)
   
3. Check account balance
   Infobip dashboard > Account > Balance
   
4. Check delivery status
   Infobip dashboard > SMS > Message History

RESOLUTION:
- If auth error: Verify API key
- If phone format: Correct format and retry
- If no balance: Request account top-up
- If temporary issue: Retry in 5 minutes

Fallback: Switch to test mode temporarily
- Set SMS_PROVIDER=test (no SMS sent, logged)
- Announce to users: "SMS experiencing brief delay"
```

### **Medium Issue: High Response Times**

```
SYMPTOMS:
- Campaign page loads in > 5 seconds
- Form submission takes > 3 seconds

DIAGNOSIS:
1. Check server load
   Command: top
   Look for: CPU, Memory usage
   
2. Check database queries
   MongoDB logs show slow queries?
   
3. Check Nginx
   Is reverse proxy working?

QUICK FIX:
1. Reduce cache TTL (if applicable)
2. Optimize database indexes
3. Scale up if persistent (contact Hostinger)
```

---

## ✅ SUCCESS METRICS

### **First Hours (00:00 - 12:00)**

```
SYSTEM HEALTH:
✅ Uptime: 99%+ (target: 100%)
✅ Error rate: < 1% (target: 0.1%)
✅ Response time: < 500ms (target: < 300ms)
✅ Database: Connected & responsive
✅ SMS: Delivering (if configured)

CAMPAIGN METRICS:
✅ Page visits: 100+ (or more with good reach)
✅ Forms submitted: 20+ (target: 50+)
✅ Orders placed: 10+ (target: 25+)
✅ Eligibility rate: 60-80%
✅ No critical bugs reported

TEAM PERFORMANCE:
✅ Responses to support < 1 hour
✅ 0 unresolved critical issues
✅ All team members activated
✅ Clear communication maintained
```

### **First Day Report (12:00)**

Generate report:
```
📊 GO-LIVE DAY REPORT (00:00 - 12:00)

CAMPAIGN STATUS:
- Status: FULLY OPERATIONAL ✅
- Uptime: 99.2%
- Errors: 3 minor (resolved)

TRAFFIC:
- Page visits: 450
- Forms submitted: 85 (18.9% conversion)
- Orders placed: 27 (31.8% of eligible)

ORDERS:
- Total revenue: 3,240,000 FCFA
- Avg order: 120,000 FCFA
- Payment 70/30: 100% correctly split

SMS DELIVERY:
- Sent: 500 (announcement)
- Delivered: 475 (95%)
- Click-through: 14.2%

SUPPORT:
- Emails received: 8
- Average response: 23 minutes
- Issues resolved: 8/8 (100%)

ISSUES:
1. [Minor] Form validation lag - FIXED
2. [Minor] SMS delivery to 1% - EXPECTED
3. [None] Critical issues

TEAM FEEDBACK:
✅ System handled volume well
✅ No major infrastructure issues
✅ Team coordination excellent
✅ Customer support responsive

RECOMMENDATION:
✅ Continue full operation
✅ Daily monitoring for 7 days
✅ Weekly reporting
```

---

## 📲 TEAM COMMUNICATION TEMPLATES

### **Go-Live Announcement (To Team)**

```
Subject: 🚀 CAMPAIGN LIVE - March 1, 00:15[UTC+1]

Team,

Agri-Point Engrais Campaign is NOW LIVE!

📊 STATUS:
✅ Campaign active & accepting orders
✅ All systems operational
✅ Monitoring active

🎯 YOUR ROLE:
[Dev] - Monitor logs for errors
[DevOps] - Track system metrics
[Support] - Answer customer questions
[Marketing] - Monitor SMS delivery

📞 FOR ISSUES:
Slack: #campaign-launch
Call: [Primary contact phone]

Let's have a great launch!
```

### **Issue Update (To Stakeholders)**

```
Subject: ⚠️ Campaign Status Update [TIME]

[Situation description]

IMPACT:
- [What is affected]
- [Estimated duration]

ACTION:
- [What we're doing]
- [ETA for resolution]

NEXT UPDATE: [Time]

Thank you for your patience.
```

### **Success Announcement (To Management)**

```
Subject: ✅ CAMPAIGN LAUNCH SUCCESS - Initial Results

Management,

Engrais Campaign launched successfully on March 1, 2026!

RESULTS (0-12 hours):
- Orders: 27
- Revenue: 3.2M FCFA
- Uptime: 99.2%
- Customer satisfaction: Excellent

KEY METRICS:
- SMS delivery: 95%
- Form completion: 31.8%
- Avg order value: 120K FCFA
- Support ticket resolution: 100%

FORECAST:
Based on current trajectory, expecting:
- 50-100 orders per day (conservative estimate)
- 5-10M FCFA revenue per day
- Sustained interest for full month

Next report: Daily for 7 days, then weekly

Great execution from the entire team!
```

---

## 🎯 READY TO GO LIVE?

**Final Checklist:**

```
□ Campaign document activated (status: ACTIVE)
□ SMS provider tested & confirmed working
□ Support team briefed & standing by
□ Monitoring systems active
□ Database backed up
□ Fallback/rollback plan ready
□ Communication channels open
□ Team assembled & alert

✅ YES - READY TO GO LIVE AT 00:00 MARCH 1!
```

---

**Document Version:** 1.0 FINAL  
**Last Updated:** Feb 13, 2026  
**Next Review:** Mar 1, 2026 23:00 (24-hour pre-launch)

