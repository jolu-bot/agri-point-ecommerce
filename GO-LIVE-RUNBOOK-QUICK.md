# ⚡ GO-LIVE RUNBOOK - Quick Reference (1 Page)

**Print this & post on team wall on March 1**

---

## 🚀 GO-LIVE TIMELINE - March 1, 2026

### **00:00-00:15: ACTIVATION PHASE**

```
1. [Admin] Login: https://agri-point.cm/admin
   User: [admin account] | Password: [see Slack]
   
2. [Admin] Navigate: Campaigns > Manage > "engrais-mars-2026"
   
3. [Admin] Change status: draft → ACTIVE
   Click: "Publier Campagne" → SAVE
   ✅ Check: Status shows "ACTIVE"
   
4. [Dev] Test page: https://agri-point.cm/campagne-engrais
   ✅ Hero image loads
   ✅ Form visible
   ✅ < 3 seconds load
   
5. [Dev] Test form submission
   Data: Name, Type (Minéral), Qty (8), Phone (+237600000000)
   ✅ Response in < 2 seconds
   
6. [Dev] Check admin dashboard: /admin/campaigns
   ✅ Campaign shows as "Active"
   
7. [PM] Send Slack: "🚀 CAMPAIGN LIVE at 00:15 UTC+1"
   Include: Campaign URL + verification status
```

### **00:15-06:00: SILENT LAUNCH (Monitoring Only)**

```
[Dev] Watch logs (every 5 min):
  Command: pm2 logs agri-point
  Look for: ERROR, CRITICAL, exceptions
  Action: Report immediately if found
  
[DevOps] Monitor metrics (every 10 min):
  - CPU: Should be <30%
  - Memory: Should be <50%
  - DB connection: Must be active
  - API response: Should be <500ms
  
[Support] Check email & chat
  - Answer inquiries
  - Collect feedback
  
[Marketing] Prepare SMS for 06:00
  - Verify contacts list exported
  - Check SMS templates in system
  - Verify Infobip credentials
```

### **06:00-09:00: SMS PHASE**

```
[Marketing] Send SMS Announcement:

Via Infobip if configured:
  1. Login to Infobip portal
  2. Create SMS campaign
  3. Template: announcement
  4. Recipients: [Contact list from export]
  5. Send
  
Via API:
  curl -X POST https://agri-point.cm/api/sms/send \
    -H "Authorization: Bearer $ADMIN_SMS_TOKEN" \
    -d '{"recipients": ["+237..."], "templateKey": "announcement"}'

[All] Monitor metrics:
  - SMS delivery status: Should show > 95% in 5 min
  - First orders appearing? (Low volume expected)
  - Error rate: Should be < 1%
```

### **09:00-12:00: FULL LAUNCH**

```
[PM] Post social media:
  - Facebook post (with hero image)
  - WhatsApp broadcast
  
[Dev/DevOps] Continue monitoring:
  - Every 15 min: Check logs
  - Every 15 min: Check metrics
  - React to any alerts
  
[Support] Handle inquiries:
  - Response target: < 1 hour
  - Track issues in spreadsheet
  
[Admin] Log orders & revenue:
  - Take screenshot of dashboard every hour
  - Share in #campaign-launch
  
[Marketing] Calculate KPIs:
  - Orders count
  - Revenue total
  - SMS delivery %
  - Form conversion %
```

### **12:00: GO-LIVE REPORT**

```
[PM] Create 12-hour report:
  - Total orders
  - Total revenue
  - Uptime %
  - Critical issues (if any)
  - Team performance
  
Share with: Management & stakeholders
```

---

## 🔴 IF SOMETHING BREAKS

### **Campaign page not loading (404)**

```
1. [Dev] Check logs: pm2 logs agri-point | tail -20
2. Check MongoDB: Is it connected?
3. Restart app: pm2 restart agri-point
4. Wait 30 sec, test again
5. If still broken: Rolling back
   git checkout [previous-commit]
   npm run build
   pm2 restart agri-point
```

### **Database connection lost**

```
1. Check MongoDB Atlas console
2. Check if Hostinger IP is whitelisted
3. If not: Add it: MongoDB Atlas > Network Access
4. Restart: pm2 restart agri-point
5. Test: npm run check-db
```

### **SMS not sending**

```
1. Check Infobip dashboard (delivery status)
2. Verify API key in .env
3. Check phone format: +237XXXXXXXXX
4. If still broken: Switch to test mode
   SET SMS_PROVIDER=test
   (SMS will be logged, not sent)
5. Notify users: "SMS experiencing brief delay"
```

### **High response times**

```
1. Check: top (CPU/Memory usage)
2. If high: Contact Hostinger support
3. Reduce load: Temporarily disable features if needed
```

---

## 📞 ESCALATION

| Issue | Contact | Phone |
|-------|---------|-------|
| **Code/App** | Dev Lead | [Number] |
| **Infrastructure** | DevOps | [Number] |
| **Business Decision** | PM | [Number] |
| **CRITICAL** | CTO | [Number] |

**Slack Channel:** #campaign-launch (24/7)

---

## ✅ CRITICAL SUCCESS FACTORS

> **Campaign goes live = customers can reach the form & place orders**

```
□ Domain works: https://agri-point.cm/campagne-engrais → 200 OK
□ Form loads: All 4 fields visible & functional
□ Submissions processed: API returns eligibility response
□ Admin dashboard: Shows incoming orders in real-time
□ No crash: App remains running for 12+ hours
□ Support responds: Customer inquiries answered < 1 hour
```

**If all 6 boxes are ✅, GO-LIVE IS SUCCESSFUL**

---

## 📊 METRICS TO TRACK

Every hour, update spreadsheet:

```
Hour | Orders | Revenue | Errors | Status
0-1  |   3    | 360K    |   0    | ✅ OK
1-2  |   5    | 600K    |   1    | ✅ OK
2-3  |   2    | 240K    |   0    | ✅ OK
...
12   |  27    | 3.24M   |  3     | ✅ SUCCESS
```

---

**Print & Post on Team Wall 📌**

**Start Time:** March 1, 2026 @ 00:00 UTC+1

**Duration:** 12 hours (00:00 - 12:00)

**Team Lead:** [PM Name]

**Best of luck! 🚀**

