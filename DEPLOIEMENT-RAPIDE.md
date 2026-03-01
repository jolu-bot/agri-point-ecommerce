# 🚀 Guide Rapide de Déploiement Production

**Status:** ✅ Build réussi - Production Ready  
**Date:** 1er mars 2026

---

## 📦 Fichiers de Déploiement Disponibles

1. **DEPLOY-PRODUCTION-PAYMENT-SYSTEM.md** - Guide complet détaillé (100+ sections)
2. **deploy-to-vercel.ps1** - Script automatisé de déploiement
3. **.env.production.template** - Template variables d'environnement
4. **add-env-to-vercel.ps1** - Script automatique pour ajouter variables

---

## ⚡ Déploiement Vercel (Recommandé) - 10 Minutes

### Étape 1: Préparer Variables d'Environnement (5 min)

```powershell
# 1. Copier le template
Copy-Item .env.production.template .env.production.local

# 2. Éditer et remplir TOUTES les valeurs
notepad .env.production.local

# Variables CRITIQUES à remplir:
# - MONGODB_URI
# - JWT_SECRET (générer: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - EMAIL_* (SMTP Gmail ou autre)
# - ADMIN_EMAIL (votre email)
# - NEXT_PUBLIC_SITE_URL (mettre https://agri-point-ecommerce.vercel.app d'abord)

# 3. Tester email localement (IMPORTANT!)
node scripts/test-email.js
# ✅ Si email reçu → Continuer
# ❌ Si échec → Corriger config avant déploiement
```

### Étape 2: Installer Vercel CLI (1 min)

```powershell
npm install -g vercel
vercel login  # Ouvre navigateur pour authentification
```

### Étape 3: Ajouter Variables à Vercel (2 min)

```powershell
# Automatique (recommandé)
.\add-env-to-vercel.ps1

# OU manuel pour chaque variable
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add ADMIN_EMAIL production
# ... etc
```

### Étape 4: Déployer (2 min)

```powershell
# Option A: Script automatisé (vérifie tout)
.\deploy-to-vercel.ps1

# Option B: Déploiement direct
vercel --prod
```

**Résultat:**
```
✓ Production: https://agri-point-ecommerce.vercel.app
```

### Étape 5: Tests Post-Déploiement (5 min)

1. **Ouvrir site:** https://agri-point-ecommerce.vercel.app
2. **Créer commande test** avec WhatsApp payment
3. **Upload screenshot** sur page confirmation
4. **Vérifier email admin reçu** 📧 ⭐
5. **Login admin:** /admin
6. **Vérifier widget** affiche stats ⭐
7. **Valider paiement** test
8. **Vérifier email client** reçu

✅ **Si tous les tests passent → SUCCÈS!**

---

## 🏢 Déploiement VPS Hostinger - Alternative

### Si vous avez déjà un VPS configuré:

```bash
# SSH vers serveur
ssh root@votre-ip-hostinger

# Pull derniers changements
cd /var/www/agri-ps.com
git pull origin main

# Vérifier dernier commit (doit montrer Phase 4)
git log --oneline -1

# Éditer variables d'environnement
nano .env.production
# Ajouter ADMIN_EMAIL et NEXT_PUBLIC_SITE_URL

# Install + Build
npm install
npm run build

# Redémarrer avec PM2
pm2 restart agri-ps
pm2 logs agri-ps --lines 50

# Vérifier Nginx
sudo nginx -t
sudo systemctl reload nginx
```

**Tester:** https://agri-ps.com

---

## 🧪 Checklist Critique

Avant de déployer, vérifier:

- [ ] Build local réussi (`npm run build` ✅)
- [ ] Email test réussi (`node scripts/test-email.js` ✅)
- [ ] Variables ADMIN_EMAIL configurée ⭐
- [ ] Variables NEXT_PUBLIC_SITE_URL configurée ⭐
- [ ] Toutes variables ajoutées à Vercel
- [ ] Git push sur branche main

Après déploiement, vérifier:

- [ ] Site accessible publiquement
- [ ] Client peut créer commande WhatsApp
- [ ] **Admin reçoit email après upload** ⭐ PHASE 4
- [ ] **Widget dashboard affiche stats** ⭐ PHASE 4
- [ ] Admin peut valider/rejeter
- [ ] Client reçoit email confirmation

---

## 🆘 Problèmes Courants

### Email non reçu

```powershell
# Vérifier logs Vercel
vercel logs --prod --follow

# Vérifier variables set
vercel env ls production | Select-String "EMAIL\|ADMIN"

# Tester SMTP localement
node scripts/test-email.js
```

**Solutions:**
- Gmail: Utiliser "App Password" (16 caractères)
- Outlook: Activer "less secure apps"
- Autre: Vérifier SMTP host/port/credentials

### Widget ne charge pas

1. F12 → Console → Voir erreurs
2. Network tab → Vérifier `/api/admin/validation-stats` retourne 200
3. Vérifier JWT token valide (localStorage)
4. Re-login admin

### Variables non chargées

```powershell
# Lister toutes les variables
vercel env ls production

# Si manquantes, ajouter
vercel env add NOM_VARIABLE production

# IMPORTANT: Rebuild après ajout variables NEXT_PUBLIC_*
vercel --prod
```

---

## 📊 Monitoring Post-Déploiement

### Jour 1 (24h)

- [ ] Pas de downtime (100% uptime)
- [ ] Aucune erreur 500
- [ ] Emails délivrés (check inbox admin)
- [ ] Au moins 1 commande test complète

### Semaine 1

- [ ] Délai validation < 2h (objectif SLA)
- [ ] Taux approbation > 85%
- [ ] Aucune plainte client
- [ ] Performance < 3s page load

**Tools:**
- Vercel Dashboard: https://vercel.com/dashboard
- Logs: `vercel logs --prod`
- Uptime: UptimeRobot (gratuit)
- Errors: Sentry (gratuit tier)

---

## 🎯 Domaine Custom (Optionnel)

Si vous avez agri-ps.com:

```powershell
# Ajouter domaine
vercel domains add agri-ps.com

# Configurer DNS chez registrar (GoDaddy, Namecheap, etc.)
# Type: CNAME
# Name: @ (ou www)
# Value: cname.vercel-dns.com

# Attendre propagation DNS (5-30 min)

# Mettre à jour variable
vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# Entrer: https://agri-ps.com

# Redéployer
vercel --prod
```

---

## 🔄 Rollback d'Urgence

Si problème critique en production:

```powershell
# Lister déploiements
vercel ls

# Promouvoir ancien déploiement
vercel promote [url-ancien-deploiement]

# Exemple
vercel promote agri-point-ecommerce-abc123.vercel.app
```

**Instantané** - Retour à version précédente en < 1 minute

---

## 📚 Documentation Complète

- **Guide détaillé:** [DEPLOY-PRODUCTION-PAYMENT-SYSTEM.md](DEPLOY-PRODUCTION-PAYMENT-SYSTEM.md)
- **Système complet:** [RECAP-SYSTEME-PAIEMENT-FINAL.md](RECAP-SYSTEME-PAIEMENT-FINAL.md)
- **Phase 4:** [PHASE-4-NOTIFICATIONS-STATS.md](PHASE-4-NOTIFICATIONS-STATS.md)
- **Phase 3:** [PHASE-3-ADMIN-VALIDATION.md](PHASE-3-ADMIN-VALIDATION.md)

---

## 🎊 Succès du Déploiement

Vous savez que c'est réussi quand:

1. ✅ URL publique accessible
2. ✅ Client peut commander et uploader
3. ✅ **Admin reçoit email immédiatement** ⭐
4. ✅ **Widget dashboard affiche stats** ⭐
5. ✅ Validation fonctionne
6. ✅ Client reçoit confirmation
7. ✅ Aucune erreur dans logs
8. ✅ Performance < 3s

**→ Prêt pour annonce clients!** 🎉

---

## 💡 Prochaines Étapes (Phase 5)

Après déploiement réussi, considérer:

- 📱 SMS notifications (Twilio)
- 📊 Analytics dashboard avancé
- 📧 Résumés quotidiens email
- 📊 Export Excel validations
- 🔔 Alertes Slack (SLA)

Voir roadmap dans: RECAP-SYSTEME-PAIEMENT-FINAL.md

---

**Bon déploiement! 🚀**

En cas de problème: dev@agri-ps.com | WhatsApp: +237 657 39 39 39
