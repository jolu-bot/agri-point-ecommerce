## ✅ CHECKLIST ERREUR 503 - agri-ps.com

**Problème:** Erreur 503 après connexion du domaine agri-ps.com  
**Solution:** Mettre à jour configuration pour le nouveau domaine  
**Durée:** ~30 minutes  
**Date:** 16 février 2026

---

## 🔧 CORRECTIONS DÉJÀ APPLIQUÉES (sur votre local)

- [ ] `.env.local` — NEXT_PUBLIC_SITE_URL = `https://agri-ps.com` ✅
- [ ] `.env.production` — NEXT_PUBLIC_SITE_URL, API_URL, NODE_ENV, PORT ✅
- [ ] `next.config.js` — allowedOrigins incluent agri-ps.com ✅
- [ ] Script création: `verify-agri-ps-config.js` ✅
- [ ] Vérification locale: 100/100 ✅

---

## 🚀 À FAIRE MAINTENANT (sur Hostinger VPS)

### **ÉTAPE 1: Préparation locale [5 min]**

```bash
cd c:\Users\jolub\Downloads\agri-point-ecommerce
npm run build
```

- [ ] Build réussi? (message "✓ Ready in X.XXs")

### **ÉTAPE 2: Connexion SSH [2 min]**

```bash
ssh root@156.230.45.89
```

- [ ] Connecté au VPS? (prompt commence par `root@...`)

**Note:** Remplacez `156.230.45.89` par VOTRE IP VPS (depuis Hostinger Dashboard)

### **ÉTAPE 3: Préparer le répertoire [2 min]**

```bash
cd /var/www/agri-point-ecommerce
```

- [ ] Répertoire existe? (`ls` montre package.json, etc.)
- [ ] Si absent, copier les fichiers du projet (via SCP ou File Manager Hostinger)

### **ÉTAPE 4: Nettoyage [2 min]**

```bash
rm -rf .next node_modules package-lock.json
```

- [ ] Anciens fichiers supprimés

### **ÉTAPE 5: Installation [5 min]**

```bash
npm install
```

- [ ] `npm install` réussi? (sans erreur rouge)
- [ ] Dépendances installées dans `node_modules/`?

### **ÉTAPE 6: Compilation [5 min]**

```bash
npm run build
```

- [ ] Build réussi? (message "✓ Ready in X.XXs")
- [ ] Pas d'erreur TypeScript?
- [ ] Dossier `.next/` créé?

### **ÉTAPE 7: Démarrage PM2 [2 min]**

```bash
npm install -g pm2
pm2 start npm --name "agripoint-production" -- start
pm2 startup
pm2 save
```

- [ ] PM2 installé?
- [ ] Application démarrée?
- [ ] `pm2 list` montre "online"?
- [ ] `pm2 startup` exécuté?
- [ ] `pm2 save` exécuté?

### **ÉTAPE 8: Vérification [3 min]**

**Test 1: Serveur local**
```bash
curl http://127.0.0.1:3000
```
- [ ] Retourne du HTML? (pas 503)
- [ ] Pas d'erreur?

**Test 2: Domaine (depuis votre ordinateur)**
```bash
curl -I https://agri-ps.com
```
- [ ] HTTP 200? (ou 301/302)
- [ ] Pas HTTP 503?

**Test 3: Browser**
- [ ] Ouvrir: https://agri-ps.com
- [ ] Page charge? (pas d'erreur 503)
- [ ] Lien vert 🌱 "Campagne Engrais" visible?
- [ ] Images apparaissent?
- [ ] Responsive sur mobile? (F12 → Toggle device toolbar)

---

## 🆘 PROBLÈMES & SOLUTIONS RAPIDES

### **"Connection refused" sur le VPS**

```bash
# Test 1: Node.js écoute?
ss -tuln | grep 3000
# Doit montrer 127.0.0.1:3000

# Test 2: PM2 status?
pm2 list
# Doit montrer "online"

# Test 3: Logs?
pm2 logs agripoint-production --lines 20
# Cherchez les erreurs rouges
```

**Correction:**
```bash
pm2 delete agripoint-production
pm2 start npm --name "agripoint-production" -- start
```

### **"npm install" échoue**

```bash
# Libérez de la mémoire:
NODE_OPTIONS="--max-old-space-size=2048" npm install
```

### **"npm run build" échoue**

```bash
# Vérifiez les erreurs TypeScript:
npm run type-check

# Vérifiez .env.production:
cat .env.production | head -20
# Doit avoir: MONGODB_URI, JWT_SECRET, etc.
```

### **Erreur 503 persiste**

```bash
# Vérifiez les logs Nginx:
sudo tail -50 /var/log/nginx/agri-ps.com_error.log

# Vérifiez les logs PM2:
pm2 logs agripoint-production

# Redémarrez tout:
pm2 restart agripoint-production
sudo systemctl restart nginx
```

### **HTTPS ne fonctionne pas (erreur certificat)**

```bash
# Vérifiez le certificat:
ls -la /etc/letsencrypt/live/agri-ps.com/

# S'il manque, créez-le:
sudo certbot certonly --standalone -d agri-ps.com
```

---

## 📋 SCRIPTS DE VÉRIFICATION

**Vérifier configuration locale:**
```bash
node scripts/verify-agri-ps-config.js
# Attend: 100/100 ✅
```

**Tester après déploiement (sur VPS):**
```bash
node scripts/test-agri-ps-deployment.js
# Attend: Résumé vert avec ✅
```

---

## 📚 DOCUMENTATION

| Titre | Utilité | Lire quand |
|-------|---------|-----------|
| `CORRECTION-ERREUR-503-RESUME.md` | Résumé exécutif | Maintenant (5 min) |
| `HOSTINGER-DEPLOY-NOW-AGRI-PS.md` | Guide déploiement rapide | Maintenant (avant de commencer) |
| `HOSTINGER-DOMAIN-FIX-AGRI-PS.md` | Guide complet & détaillé | Si bloqué (dépannage in-depth) |

---

## ✨ RÉSULTAT ATTENDU

✅ Site accessible: https://agri-ps.com  
✅ Sans erreur 503  
✅ Lien 🌱 "Campagne Engrais" visible dans le header  
✅ Admin panel: /admin accessible  
✅ Campagne page: /campagne-engrais fonctionne  
✅ PM2 logs: "Listening on 3000" sans erreurs  

---

## 🎉 SIGNATURE DE SUCCÈS

```bash
# Quand ça marche, vous voyez dans PM2:
[0] agripoint-production npm run start
    listening on http://127.0.0.1:3000

# Et en visitant le site:
# ✅ https://agri-ps.com se charge
# ✅ Header affiche le lien campagne (vert 🌱)
# ✅ Pas d'erreur 503 ou de console.log d'erreur
```

---

## 💬 NOTES PERSONNELLES

- IP VPS: `_________________`
- Mot de passe VPS: Sauvegardé dans Hostinger
- Répertoire projet: `/var/www/agri-point-ecommerce`
- PM2 app name: `agripoint-production`

---

**Bon déploiement! Si bloqué, consultez HOSTINGER-DOMAIN-FIX-AGRI-PS.md en Section "Dépannage".**

*Checklist version: 16 février 2026*
