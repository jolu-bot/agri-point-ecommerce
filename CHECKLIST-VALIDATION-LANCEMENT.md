# ✅ Checklist Validation - Lancement Campagne Engrais Mars 2026

Checklist complète pour validation avant lancement en production (1er Mars 2026).

---

## 📅 Phase 1: Pré-Lancement (Avant 28 Février 2026)

### Semaine 1: Code & Infrastructure

- [ ] **Code:**
  - [ ] Build succeeds: `npm run build` (< 30s)
  - [ ] Zero TypeScript errors
  - [ ] Zero runtime warnings
  - [ ] All tests pass (npm test)
  - [ ] ESLint clean (npm run lint)

- [ ] **Database:**
  - [ ] MongoDB Atlas connection tested
  - [ ] Campaign document created (engrais-mars-2026)
  - [ ] 4 products seeded (2 mineral + 2 bio)
  - [ ] Indexes verified (slug unique)
  - [ ] Backup configured & tested

- [ ] **Images:**
  - [ ] Hero generated: public/images/campaigns/engrais-mars-2026-hero.jpg
  - [ ] Size verified: ~56KB
  - [ ] Dimensions: 1920x600px
  - [ ] Compression optimized

- [ ] **APIs:**
  - [ ] GET /api/campaigns/march-2026 → 200 ✅
  - [ ] GET /api/campaigns/[slug] → 200 ✅
  - [ ] POST /api/campaigns/apply → 200 with payload
  - [ ] POST /api/campaigns/checkout → 201 creates order
  - [ ] GET /api/admin/campaigns/stats → 200 ✅

### Semaine 2: Fonctionnalités & UX

- [ ] **Page Campagne (/campagne-engrais):**
  - [ ] Hero image displays correctly
  - [ ] Headline visible: "CAMPAGNE ENGRAIS MARS 2026"
  - [ ] CTA button interactive
  - [ ] Tariffs correct: 15,000 FCFA / 10,000 FCFA
  - [ ] Eligibility conditions readable
  - [ ] Form renders without errors

- [ ] **Formulaire Éligibilité:**
  - [ ] All input fields functional
  - [ ] Cooperative checkbox works
  - [ ] Insurance selector dropdown displays 2 options
  - [ ] Quantity input validates minimum (6)
  - [ ] Submit button enables when eligible
  - [ ] Error messages display correctly
  - [ ] Success message shows after validation

- [ ] **Paiement 70/30:**
  - [ ] 70% first amount calculated correctly
  - [ ] 30% second amount calculated correctly
  - [ ] Second payment due date = J+60
  - [ ] Status tracking in MongoDB

- [ ] **Admin Dashboard (/admin/campaigns):**
  - [ ] Dashboard loads without errors
  - [ ] Campaign selector shows "Campagne Engrais - Mars 2026"
  - [ ] 4 KPI cards display correct data
  - [ ] Order table shows seeded/test orders
  - [ ] CSV export button functional
  - [ ] Charts render (pie/bar)
  - [ ] Installment status visible

- [ ] **Responsive Design:**
  - [ ] Desktop (1920px): all elements visible
  - [ ] Tablet (768px): layout adapts
  - [ ] Mobile (375px): form usable, no horizontal scroll
  - [ ] Touch buttons min 44x44px

- [ ] **Accessibility (WCAG 2.1 AA):**
  - [ ] Form labels linked to inputs
  - [ ] Color contrast ratio ≥ 4.5:1
  - [ ] Focus states visible
  - [ ] Keyboard navigation works
  - [ ] No axe violations reported

### Semaine 3: Performance & Sécurité

- [ ] **Performance:**
  - [ ] Lighthouse Score ≥ 80
  - [ ] FCP < 1.5s (First Contentful Paint)
  - [ ] LCP < 3.5s (Largest Contentful Paint)
  - [ ] CLS < 0.1 (Cumulative Layout Shift)
  - [ ] Speed Index < 6s

- [ ] **Sécurité:**
  - [ ] HTTPS/SSL certificate valid
  - [ ] No mixed content warnings
  - [ ] CSP headers configured
  - [ ] CORS properly set
  - [ ] Rate limiting on /api/campaigns/apply
  - [ ] Input validation on all forms
  - [ ] No XSS vulnerabilities (tested)
  - [ ] No SQL injection vulnerabilities (MongoDB safe queries)

- [ ] **Deployment Readiness:**
  - [ ] Hostinger VPS configured
  - [ ] Domain DNS points to VPS
  - [ ] SSL Let's Encrypt installed
  - [ ] Nginx proxy configured
  - [ ] PM2 ecosystem configured
  - [ ] Backup script in place
  - [ ] Monitoring alerts configured

---

## 🎯 Phase 2: Lancement (1er Mars 2026)

### 00:00 - Vérifications Finales

- [ ] Database backup completed
- [ ] Code pushed to main branch
- [ ] Production environment variables verified
- [ ] Hostinger uptime monitoring enabled
- [ ] Admin access verified
- [ ] Communication channels ready (SMS, Email, WhatsApp)

### 06:00 - Activation Campaign

- [ ] Campaign status = ACTIVE in database
- [ ] Campaign startDate = 2026-03-01
- [ ] Campaign endDate = 2026-03-31
- [ ] Feature flags enabled (if applicable)
- [ ] Redirect rules configured (from promo pages)

### 09:00 - Public Announcement

- [ ] Landing page live: /campagne-engrais
- [ ] Hero image loads correctly in production
- [ ] Form submission tested (test order)
- [ ] Confirmation email sends
- [ ] Admin sees test order in dashboard

### 12:00 - Monitoring Phase

- [ ] Monitor error logs (pm2 logs)
- [ ] Monitor form submissions (5+ target)
- [ ] Monitor database performance
- [ ] Monitor server CPU/Memory
- [ ] Check for any 4xx/5xx errors

### 18:00 - Real Users Phase

- [ ] Monitor conversion rate (target: ≥ 10%)
- [ ] Monitor form error rates (target: < 5%)
- [ ] Monitor payment failures (target: ≈ 0%)
- [ ] Monitor form submission time (target: < 5s)
- [ ] Monitor database query performance

### End of Day Checklist

- [ ] Daily stats compiled
- [ ] No critical errors logged
- [ ] Customer inquiries handled
- [ ] Admin metrics captured
- [ ] Backup completed

---

## 📊 Phase 3: Opération (1-31 Mars 2026)

### Quotidien (Daily)

**Matin (8:00 AM):**
- [ ] Check server status (uptime)
- [ ] Review error logs (last 24h)
- [ ] Monitor KPIs:
  - [ ] New orders today
  - [ ] Total revenue YTD
  - [ ] Form submission rate
  - [ ] Error rate
- [ ] Review database backups (completed?)

**Après-midi (2:00 PM):**
- [ ] Answer customer inquiries
- [ ] Process manual payments (if needed)
- [ ] Verify SMS alerts working
- [ ] Check Lighthouse score (weekly min)

**Soir (6:00 PM):**
- [ ] Compile daily stats
- [ ] Update campaign KPI dashboard
- [ ] Verify installment calculations
- [ ] Check second payment reminders schedule

### Hebdomadaire (Vendredi)

- [ ] Generate weekly report:
  - [ ] Total orders this week
  - [ ] Total revenue this week
  - [ ] Conversion rate
  - [ ] Payment success rate
  - [ ] Common issues/feedback
- [ ] Review performance metrics (Lighthouse)
- [ ] Verify backup strategy effectiveness
- [ ] Check if any schema updates needed
- [ ] Plan for next week improvements

### 15 Avril 2026: Deuxième Paiement Commence

- [ ] Enable second payment processing
- [ ] Send reminder SMS/Email to eligible orders
- [ ] Monitor second payment submissions
- [ ] Handle payment failures (retry logic)
- [ ] Issue refunds if needed

### 31 Mars 2026: Fin Campagne

**Actions:**
- [ ] Stop accepting new campaign orders (close form)
- [ ] Display "Campaign ended" message
- [ ] Compile final statistics
- [ ] Send thank you email to participants
- [ ] Archive campaign data
- [ ] Generate final report

**Final Report Contains:**
- [ ] Total orders: ___
- [ ] Total quantity: ___ sacs/litres
- [ ] Total revenue: ___ FCFA
- [ ] Conversion rate: ___ %
- [ ] Payment success rate: ___ %
- [ ] Average order value: ___ FCFA
- [ ] Customer feedback summary
- [ ] Issues encountered & resolutions

---

## 🔔 Phase 4: Post-Campagne (Avril - Mai 2026)

### 15 Avril - Second Payment Processing

- [ ] Monitor second payment tier submissions
- [ ] Send payment reminders to incomplete payments
- [ ] Handle payment disputes
- [ ] Process refunds for failed orders
- [ ] Update order statuses

### 31 Mai - Campaign Archive

- [ ] Archive all campaign orders
- [ ] Archive all images/assets
- [ ] Generate compliance report
- [ ] Delete sensitive test data
- [ ] Create lessons learned document

---

## 📋 Métriques de Succès

Target KPIs for campaign success:

| Métrique | Target | Minimum | Maximum |
|----------|--------|---------|---------|
| Total Orders | 500+ | 200 | ∞ |
| Conversion Rate | 15% | 10% | N/A |
| Avg Order Value | 150,000 FCFA | 120,000 | N/A |
| Payment Success | 98% | 95% | 100% |
| Form Error Rate | < 2% | 0% | 5% |
| Server Uptime | 99.9% | 99% | 100% |
| Page Load Time | < 2s | N/A | 5s |

---

## ⚠️ Escalation Procedures

**Critical Issues (Immediate Action Required):**
- [ ] Server down → Restart PM2 or reboot VPS
- [ ] Database down → Check MongoDB connection + backups
- [ ] Form not submitting → Check API logs + database connection
- [ ] Security breach → Disable feature, backup data, alert team

**High Priority Issues (Within 1 hour):**
- [ ] High error rate (> 10%) → Review logs + identify pattern
- [ ] Payment failures (> 5%) → Check Stripe/payment gateway
- [ ] Performance degradation → Check server load + optimize queries

**Medium Priority Issues (Within 24 hours):**
- [ ] Typo in form labels → Fix + redeploy
- [ ] Image not loading → Regenerate + upload
- [ ] Email not sending → Check email service configuration

---

## 📞 Contact List

**Development:**
- Developer: [Nom] - [Tél/Email]
- DevOps: [Nom] - [Tél/Email]

**Support:**
- Hostinger Support: support@hostinger.com
- MongoDB Support: support@mongodb.com

**Internal:**
- Product Manager: [Nom]
- Marketing Lead: [Nom]
- Finance: [Nom]

---

## 📝 Sign-Off

**Prepared by:** [Votre Nom]
**Date:** [Date]
**Reviewed by:** [Reviewer Name]
**Approved by:** [Manager Name]

---

**Status:** ✅ Ready for Launch / ⚠️ In Progress / ❌ On Hold

**Notes:**
```
[Ajouter notes importantes ici]
```

---

*Last Updated: [Date]*
*Version: 1.0*
