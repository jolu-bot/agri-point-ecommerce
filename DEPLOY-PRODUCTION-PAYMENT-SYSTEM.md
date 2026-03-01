# 🚀 Guide de Déploiement Production - Système Paiement Hybride

**Date :** 1er mars 2026  
**Repository :** jolu-bot/agri-point-ecommerce  
**Branch :** main  
**Status Actuel :** Build réussi ✅ - Production Ready

---

## 📋 Checklist Pré-Déploiement

### 1. Vérifications Locales

```powershell
# ✓ Build déjà vérifié (28 fév 2026 - SUCCESS)
npm run build

# Vérifier qu'il n'y a pas de changements non commités
git status

# Vérifier derniers commits
git log --oneline -5
# Devrait montrer:
# 68767c9 feat(notifications): Phase 4 - Notifications automatiques
# 97facd7 feat(admin): Phase 3 - Validation interface
# ...
```

**✅ Status :** Build validé hier (43s, 114 pages, 0 erreurs)

### 2. Variables d'Environnement Requises

**CRITIQUES (système ne fonctionnera pas sans) :**
```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agri-ps?retryWrites=true&w=majority

# JWT
JWT_SECRET=votre-secret-minimum-32-caracteres
JWT_REFRESH_SECRET=votre-refresh-secret-minimum-32-caracteres

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@agri-ps.com
EMAIL_PASS=votre-app-password-gmail
EMAIL_FROM=noreply@agri-ps.com

# ⭐ PHASE 4 - CRITIQUES
ADMIN_EMAIL=admin@agri-ps.com
NEXT_PUBLIC_SITE_URL=https://agri-ps.com
```

**OPTIONNELLES (mais recommandées) :**
```bash
# NextAuth (si utilisé)
NEXTAUTH_URL=https://agri-ps.com
NEXTAUTH_SECRET=votre-nextauth-secret

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🎯 Stratégies de Déploiement

### Option 1 : Vercel (⭐ Recommandé pour Next.js)

**Pourquoi Vercel :**
- Optimisé pour Next.js
- Déploiement instantané
- SSL automatique
- CDN global
- Preview deployments
- GRATUIT jusqu'à 100GB bande passante

#### Étape 1 : Installation CLI

```powershell
# Installer globalement
npm install -g vercel

# Vérifier installation
vercel --version
```

#### Étape 2 : Login

```powershell
# Se connecter (ouvre navigateur)
vercel login

# Ou avec email direct
vercel login email@example.com
```

#### Étape 3 : Configuration Initiale

```powershell
# Dans le dossier du projet
cd c:\Users\jolub\Downloads\agri-point-ecommerce

# Premier déploiement (setup)
vercel

# Répondre aux questions:
# ? Set up and deploy "~/agri-point-ecommerce"? [Y/n] Y
# ? Which scope? [Your account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? agri-point-ecommerce
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N
```

#### Étape 4 : Variables d'Environnement

**Option 4A : Via CLI (recommandé pour secrets)**

```powershell
# MongoDB
vercel env add MONGODB_URI production
# Coller la valeur quand demandé

# JWT Secrets
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production

# Email
vercel env add EMAIL_HOST production
vercel env add EMAIL_PORT production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
vercel env add EMAIL_FROM production

# ⭐ Phase 4 Critical
vercel env add ADMIN_EMAIL production
vercel env add NEXT_PUBLIC_SITE_URL production

# NextAuth (si utilisé)
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
```

**Option 4B : Via Dashboard (plus visuel)**

1. Aller sur https://vercel.com/dashboard
2. Sélectionner projet "agri-point-ecommerce"
3. Settings → Environment Variables
4. Ajouter chaque variable avec valeur
5. Scope : Production (cocher)

**⚠️ IMPORTANT pour NEXT_PUBLIC_SITE_URL :**
```bash
# Après avoir ajouté les variables, obtenir l'URL Vercel:
# Exemple: agri-point-ecommerce.vercel.app

# Mettre à jour NEXT_PUBLIC_SITE_URL avec cette URL:
vercel env add NEXT_PUBLIC_SITE_URL production
# Entrer: https://agri-point-ecommerce.vercel.app
# (ou votre domaine custom si configuré)
```

#### Étape 5 : Déploiement Production

```powershell
# Déployer en production
vercel --prod

# Attendre le build (1-2 minutes)
# URL sera affichée à la fin
```

**✅ Résultat attendu :**
```
✓ Production: https://agri-point-ecommerce.vercel.app [2m]
```

#### Étape 6 : Domaine Custom (Optionnel)

**Si vous avez agri-ps.com :**

```powershell
# Ajouter domaine via CLI
vercel domains add agri-ps.com

# Ou via dashboard:
# 1. Settings → Domains
# 2. Add Domain: agri-ps.com
# 3. Suivre instructions DNS (Ajouter CNAME dans registrar)
```

**Configuration DNS chez votre registrar (Namecheap, GoDaddy, etc.) :**
```
Type: CNAME
Name: @ (ou www)
Value: cname.vercel-dns.com
TTL: Automatic
```

**Mettre à jour variable après domaine configuré :**
```powershell
vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# Entrer: https://agri-ps.com
```

**Redéployer pour appliquer nouveau domaine :**
```powershell
vercel --prod
```

---

### Option 2 : Hostinger VPS (Déjà configuré apparemment)

**Basé sur vos fichiers existants :**
- `DEPLOY-HOSTINGER-VPS.md` existe
- `GUIDE-DEPLOIEMENT-HOSTINGER.md` existe

#### Étape 1 : Connexion SSH

```powershell
# Se connecter au VPS (adapter avec vos credentials)
ssh root@votre-ip-hostinger
# Ou avec votre utilisateur
ssh agri@votre-ip-hostinger
```

#### Étape 2 : Pull Derniers Changements

```bash
# Sur le serveur
cd /var/www/agri-ps.com  # Ou votre path
git pull origin main

# Vérifier qu'on a bien les nouveaux commits
git log --oneline -3
# Doit montrer: 68767c9 feat(notifications): Phase 4...
```

#### Étape 3 : Variables d'Environnement

**Créer/Éditer `.env.production` sur le serveur :**

```bash
# Sur le serveur
nano /var/www/agri-ps.com/.env.production

# Coller toutes les variables:
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@agri-ps.com
EMAIL_PASS=...
EMAIL_FROM=noreply@agri-ps.com
ADMIN_EMAIL=admin@agri-ps.com  # ⭐
NEXT_PUBLIC_SITE_URL=https://agri-ps.com  # ⭐
NEXTAUTH_URL=https://agri-ps.com
NEXTAUTH_SECRET=...

# Sauvegarder: Ctrl+X, Y, Enter
```

#### Étape 4 : Installation & Build

```bash
# Installer nouvelles dépendances (si ajoutées)
npm install

# Build production
npm run build

# Vérifier build réussi
echo $?  # Doit afficher 0
```

#### Étape 5 : Redémarrage Service

**Si vous utilisez PM2 (recommandé) :**

```bash
# Vérifier process actuel
pm2 list

# Redémarrer l'application
pm2 restart agri-ps

# Ou si première fois:
pm2 start npm --name "agri-ps" -- start

# Sauvegarder config PM2
pm2 save

# Auto-start au boot
pm2 startup
```

**Si vous utilisez systemd :**

```bash
# Redémarrer service
sudo systemctl restart agri-ps

# Vérifier status
sudo systemctl status agri-ps
```

**Si simple node process :**

```bash
# Tuer ancien process
pkill node

# Démarrer nouveau (avec nohup)
nohup npm start > /var/log/agri-ps.log 2>&1 &
```

#### Étape 6 : Nginx Configuration (si nécessaire)

**Vérifier config Nginx :**

```bash
# Éditer config
sudo nano /etc/nginx/sites-available/agri-ps.com

# Vérifier reverse proxy correct:
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Tester config
sudo nginx -t

# Recharger si OK
sudo systemctl reload nginx
```

---

### Option 3 : Railway (Alternative moderne)

**Avantages :**
- Setup rapide (1-click deploy)
- PostgreSQL/MongoDB inclus
- $5/mois starter
- GitHub integration

#### Déploiement Railway

```powershell
# 1. Installer CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Init projet
cd c:\Users\jolub\Downloads\agri-point-ecommerce
railway init

# 4. Link au repo GitHub
railway link

# 5. Add variables d'environnement
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="..."
railway variables set ADMIN_EMAIL="admin@agri-ps.com"
railway variables set NEXT_PUBLIC_SITE_URL="https://agri-ps.railway.app"
# ... (toutes les autres)

# 6. Deploy
railway up

# 7. Obtenir URL
railway domain
```

---

### Option 4 : AWS Amplify / Azure / Google Cloud

**Pour projets enterprise avec scaling needs.**

Voir documentation officielle:
- AWS Amplify: https://docs.amplify.aws/
- Azure Static Web Apps: https://docs.microsoft.com/azure/static-web-apps/
- Google Cloud Run: https://cloud.google.com/run/docs/quickstarts/build-and-deploy/nodejs

---

## ✅ Post-Déploiement : Validation (CRITIQUE)

### 1. Tests Smoke (Automatiques)

```powershell
# Test 1: Site accessible
curl https://agri-ps.com
# Doit retourner HTML (status 200)

# Test 2: API Health Check (si vous en avez un)
curl https://agri-ps.com/api/health
# Doit retourner {"status":"ok"}

# Test 3: Admin accessible
curl -I https://agri-ps.com/admin
# Status: 200 ou 302 (redirect to login)
```

### 2. Tests Fonctionnels Critiques (Manuel - 15 min)

**Test 1 : Création Commande WhatsApp** ⭐
```
1. Aller sur https://agri-ps.com
2. Ajouter produits au panier
3. Checkout → Sélectionner "📱 WhatsApp Mobile Money"
4. Compléter commande
5. ✓ Page confirmation affiche instructions
6. ✓ Bouton WhatsApp fonctionne
```

**Test 2 : Upload Screenshot** ⭐
```
1. Sur page confirmation, sélectionner Orange/MTN
2. Upload une image test (screenshot.png)
3. ✓ Upload réussit
4. ✓ Badge "Uploadé" apparaît
5. ✓ Vérifier email admin reçu à ADMIN_EMAIL
   - Sujet: "🔔 Nouvelle preuve de paiement..."
   - Lien fonctionne vers /admin/orders
```

**Test 3 : Widget Dashboard** ⭐
```
1. Login admin: https://agri-ps.com/admin/login
2. Aller sur https://agri-ps.com/admin
3. ✓ Widget "Validations de Paiement" visible
4. ✓ Stats affichées (awaitingCount = 1 du test précédent)
5. ✓ Top 3 montre la commande test
6. ✓ Attendre 2 minutes → Auto-refresh fonctionne
```

**Test 4 : Validation Paiement** ⭐
```
1. Dans /admin/orders, cliquer œil sur commande test
2. ✓ Modal s'ouvre
3. ✓ Screenshot visible et cliquable
4. ✓ Boutons "Approuver" et "Rejeter" présents
5. Cliquer "Approuver" avec note optionnelle
6. ✓ Toast "Paiement validé ✅"
7. ✓ Vérifier email client reçu
   - Sujet: "✅ Paiement validé - ORDER-XXX"
8. ✓ Widget stats updated (awaitingCount = 0)
```

**Test 5 : Performance**
```
1. Ouvrir DevTools → Network
2. Recharger /admin
3. ✓ Time to Interactive < 3s
4. ✓ API /admin/validation-stats < 1s
5. ✓ Aucune erreur console
6. ✓ Aucune erreur réseau (500, 404)
```

### 3. Tests Email Delivery

**Vérifier que les 3 types d'emails fonctionnent :**

1. **Email Admin Notification** (Phase 4)
   - Trigger: Upload screenshot
   - À: ADMIN_EMAIL
   - Check: Inbox dans 30 secondes

2. **Email Client Approval** (Phase 3)
   - Trigger: Admin approuve
   - À: Email client
   - Check: Inbox dans 30 secondes

3. **Email Client Rejection** (Phase 3)
   - Trigger: Admin rejette
   - À: Email client
   - Check: Inbox dans 30 secondes

**Si emails ne sont PAS reçus :**

```bash
# Sur serveur, vérifier logs
pm2 logs agri-ps --lines 100 | grep -i "email\|smtp"

# Ou dans Vercel dashboard:
# Deployments → Latest → Functions → Voir logs

# Vérifier variables d'environnement set:
# Vercel: Settings → Environment Variables
# VPS: cat .env.production | grep EMAIL

# Test SMTP manuellement:
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'noreply@agri-ps.com', pass: 'YOUR_APP_PASSWORD' }
});
transport.sendMail({
  from: 'noreply@agri-ps.com',
  to: 'admin@agri-ps.com',
  subject: 'Test',
  text: 'Test email'
}, console.log);
"
```

### 4. Monitoring Setup

**Option A : Vercel Built-in (si Vercel)**

```
Dashboard → Analytics
- Page views
- API calls
- Error rates
- Response times

Dashboard → Logs
- Real-time function logs
- Filter par endpoint
```

**Option B : External Monitoring**

**Uptime Monitoring (UptimeRobot - GRATUIT):**
```
1. Aller sur https://uptimerobot.com
2. Add New Monitor
   - Type: HTTPS
   - URL: https://agri-ps.com
   - Interval: 5 minutes
   - Alert Contacts: votre-email
3. Repeat pour endpoints critiques:
   - https://agri-ps.com/admin
   - https://agri-ps.com/api/admin/validation-stats
```

**Error Tracking (Sentry - GRATUIT tier):**
```powershell
# Installer Sentry
npm install @sentry/nextjs

# Configuration wizard
npx @sentry/wizard -i nextjs

# Ajouter DSN aux env vars
vercel env add SENTRY_DSN production
# Coller votre Sentry DSN

# Redéployer
vercel --prod
```

**Log Aggregation (Logtail - GRATUIT 1GB/mois):**
```
1. https://betterstack.com/logtail
2. Create Source → Next.js
3. Copier source token
4. Ajouter winston transport (voir leur docs)
```

---

## 📊 Métriques de Succès Post-Déploiement

### Jour 1 (Premier 24h)

**À surveiller :**
- [ ] Uptime: 100% (aucune downtime)
- [ ] Temps réponse moyen: < 2s
- [ ] Erreurs 500: 0
- [ ] Emails délivrés: 100% (check SMTP dashboard)
- [ ] Commandes créées: > 0 (clients utilisent le système)

**Actions si problèmes :**
- Erreurs 500: Check logs, fix, redeploy
- Emails non reçus: Vérifier SMTP config, password correct
- Page lente: Check DB queries, add indexes
- Crash: Check memory limits (Vercel: 1GB default)

### Semaine 1

**KPIs Business :**
- [ ] Conversions WhatsApp payment: > 10 commandes
- [ ] Délai validation moyen: < 2h (objectif SLA)
- [ ] Taux approbation: > 85%
- [ ] Aucune plainte client (emails pas reçus)

**KPIs Technique :**
- [ ] Uptime: > 99.5%
- [ ] P95 response time: < 3s
- [ ] Zero data loss (DB backups OK)
- [ ] Email delivery rate: > 98%

### Mois 1

**Optimisations potentielles :**
- Ajouter CDN pour images (/receipts/)
- Implémenter cache Redis (API stats)
- Setup error alerting (Slack/Discord)
- Automatiser backup database (daily)

---

## 🔧 Troubleshooting Déploiement

### Problème 1 : Build échoue en production

**Symptômes :** `npm run build` fail sur serveur/Vercel

**Solutions :**
```powershell
# 1. Vérifier Node version compatible
node --version  # Doit être >= 18.17.0

# 2. Clear cache
rm -rf .next node_modules
npm install
npm run build

# 3. Vérifier TypeScript errors
npm run type-check

# 4. Build en local d'abord
npm run build
# Si OK local mais fail remote → problème env vars
```

### Problème 2 : Variables d'environnement non chargées

**Symptômes :** "Cannot connect to MongoDB", "JWT_SECRET undefined"

**Solutions :**
```bash
# Vercel: Vérifier vars set
vercel env ls

# VPS: Vérifier .env.production existe
cat .env.production

# Next.js: Les vars NEXT_PUBLIC_ sont embedded au build
# Donc si vous changez NEXT_PUBLIC_SITE_URL, REBUILD requis:
npm run build
pm2 restart agri-ps
```

### Problème 3 : API routes return 404

**Symptômes :** `/api/admin/validation-stats` → 404 Not Found

**Solutions :**
```bash
# 1. Vérifier fichier existe
ls -la app/api/admin/validation-stats/route.ts

# 2. Vérifier export correct dans route.ts
# Doit avoir: export async function GET(...)

# 3. Clear Next.js cache
rm -rf .next
npm run build

# 4. Sur Vercel: Check Functions logs
# Peut être timeout (default 10s, upgrade plan pour 60s)
```

### Problème 4 : Emails ne sont pas envoyés

**Symptômes :** Upload réussit mais admin ne reçoit pas email

**Solutions :**
```bash
# 1. Vérifier ADMIN_EMAIL set
echo $ADMIN_EMAIL  # Sur serveur
# Ou dans Vercel dashboard

# 2. Vérifier logs pour erreurs SMTP
pm2 logs agri-ps | grep -i "email\|smtp\|sendmail"

# 3. Tester SMTP credentials
# Script test: scripts/test-email.js
node scripts/test-email.js

# 4. Gmail App Password (si Gmail SMTP):
# - Aller sur https://myaccount.google.com/apppasswords
# - Créer nouveau app password
# - Remplacer EMAIL_PASS par ce password (16 caractères)

# 5. Alternative: Utiliser service transactionnel
# - SendGrid (100 emails/jour gratuit)
# - Postmark (100 emails/mois gratuit)
# - Mailgun (5000 emails/mois gratuit 3 mois)
```

### Problème 5 : Widget dashboard ne charge pas

**Symptômes :** Spinner infini, ou erreur "Failed to fetch"

**Solutions :**
```bash
# 1. Check browser console (F12)
# Erreur CORS? Unauthorized? Network failed?

# 2. Vérifier API endpoint accessible
curl https://agri-ps.com/api/admin/validation-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Vérifier JWT token valid
# Dans browser DevTools → Application → Local Storage
# Clé: accessToken
# Si expiré: Re-login admin

# 4. Check API route auth
# Dans route.ts, vérifier:
# - verifyAccessToken() ne throw pas
# - User role check correct (admin/manager)
```

---

## 🎯 Checklist Finale Déploiement

### Pré-Déploiement
- [x] Build local réussi (fait le 28 fév)
- [ ] Variables d'environnement preparées (liste complète)
- [ ] Backup base de données créé
- [ ] DNS configuré (si domaine custom)
- [ ] SSL/HTTPS activé (auto sur Vercel)

### Déploiement
- [ ] Code pushé sur GitHub main branch
- [ ] Variables env ajoutées sur plateforme
- [ ] Deploy command exécuté
- [ ] Build production réussi
- [ ] URL production obtenue

### Post-Déploiement (Jour 1)
- [ ] Tests smoke passés (5 tests critiques)
- [ ] Email admin reçu (test upload)
- [ ] Email client reçu (test validation)
- [ ] Widget dashboard fonctionnel
- [ ] Aucune erreur console browser
- [ ] Monitoring uptime configuré
- [ ] Alert emails configurés

### Suivi (Semaine 1)
- [ ] Check logs quotidien (erreurs, warnings)
- [ ] Monitor email delivery rate
- [ ] Vérifier métriques dashboard (délai validation)
- [ ] Feedback utilisateurs (admin + clients)
- [ ] Performance check (response times)

---

## 📞 Support & Rollback

### Si Déploiement Catastrophique

**Rollback Vercel (instantané) :**
```powershell
# Lister derniers deployments
vercel ls

# Promouvoir ancien deployment en production
vercel promote [deployment-url]

# Exemple:
vercel promote agri-point-ecommerce-abc123.vercel.app
```

**Rollback VPS/Railway :**
```bash
# Git revert au commit précédent
git revert HEAD --no-commit
git commit -m "Rollback Phase 4"
git push origin main

# Ou checkout commit spécifique
git checkout 97facd7  # Phase 3 commit
npm install
npm run build
pm2 restart agri-ps
```

### Contact Urgence

**Problèmes Critiques (site down, data loss) :**
- Email: dev@agri-ps.com
- WhatsApp: +237 657 39 39 39
- GitHub Issues: https://github.com/jolu-bot/agri-point-ecommerce/issues

**Problèmes Non-Urgents :**
- Documentation: Voir RECAP-SYSTEME-PAIEMENT-FINAL.md
- Tests: Voir section tests dans docs Phase 3 et 4

---

## 🎊 Succès du Déploiement

**Vous saurez que le déploiement est réussi quand :**

1. ✅ Site accessible publiquement (https://agri-ps.com)
2. ✅ Client peut créer commande WhatsApp payment
3. ✅ Client peut uploader screenshot
4. ✅ **Admin reçoit email immédiatement** ⭐ Phase 4
5. ✅ **Widget dashboard affiche stats correctes** ⭐ Phase 4
6. ✅ Admin peut valider/rejeter paiement
7. ✅ Client reçoit email confirmation/rejet
8. ✅ Aucune erreur dans logs (24h)
9. ✅ Performance < 3s page load
10. ✅ Uptime monitoring actif et silent (no alerts)

**Quand tous ces points sont verts, vous pouvez :**
- 🎉 Annoncer lancement aux clients
- 📧 Envoyer email marketing (nouveau mode paiement)
- 📱 Post sur réseaux sociaux
- 🎯 Commencer Phase 5 (améliorations)

---

## 📚 Ressources Additionnelles

**Documentation Next.js Deployment :**
- https://nextjs.org/docs/deployment
- https://vercel.com/docs/deployments/overview

**MongoDB Atlas :**
- https://www.mongodb.com/docs/atlas/

**Nodemailer Troubleshooting :**
- https://nodemailer.com/usage/

**Vercel CLI Reference :**
- https://vercel.com/docs/cli

**PM2 Documentation :**
- https://pm2.keymetrics.io/docs/usage/quick-start/

---

**Dernière mise à jour :** 1er mars 2026  
**Version :** 1.0  
**Status :** Ready for Production Deployment 🚀

---

Bon déploiement ! 🎉
