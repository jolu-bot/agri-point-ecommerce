# 🚀 GUIDE DÉPLOIEMENT VERCEL - AGRI-PS.COM

## Temps estimé: 10 minutes

Ce guide vous permet de déployer votre site sur Vercel avec votre domaine agri-ps.com.

---

## ✅ ÉTAPE 1: Pousser les derniers changements vers GitHub (1 min)

Ouvrez PowerShell et exécutez:

```powershell
cd C:\Users\jolub\Downloads\agri-point-ecommerce
git add .
git commit -m "feat: Configuration Vercel"
git push origin main
```

---

## 🔐 ÉTAPE 2: Créer un compte Vercel (2 min)

1. **Ouvrez votre navigateur:** https://vercel.com/signup

2. **Cliquez sur "Continue with GitHub"**

3. **Connectez-vous avec GitHub:**
   - Username: **jolu-bot**
   - Autorisez Vercel à accéder à vos repositories

4. **Choisissez le plan gratuit** (Hobby)

✅ Compte créé!

---

## 🔗 ÉTAPE 3: Importer votre projet (3 min)

1. **Sur le tableau de bord Vercel, cliquez:** "Add New" → "Project"

2. **Importez depuis GitHub:**
   - Cherchez: `jolu-bot/agri-point-ecommerce`
   - Cliquez: **"Import"**

3. **Configuration du projet:**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Variables d'environnement (IMPORTANT!):**
   
   Cliquez sur "Environment Variables" et ajoutez:

   ```
   MONGODB_URI=mongodb+srv://votre-user:password@cluster.mongodb.net/agripoint
   JWT_SECRET=votre-secret-jwt-secure
   NEXTAUTH_SECRET=votre-secret-nextauth-secure
   NEXTAUTH_URL=https://agri-ps.com
   NEXT_PUBLIC_SITE_URL=https://agri-ps.com
   NEXT_PUBLIC_API_URL=https://agri-ps.com/api
   NODE_ENV=production
   ```

   ⚠️ **Utilisez les mêmes valeurs que dans votre fichier `.env.production`**

5. **Cliquez:** "Deploy"

⏳ **Le build prend 2-5 minutes...**

✅ Déploiement terminé! Vous obtenez une URL type: `https://agri-point-ecommerce.vercel.app`

---

## 🌐 ÉTAPE 4: Connecter votre domaine agri-ps.com (4 min)

### A. Dans Vercel

1. **Allez dans votre projet:** Cliquez sur le projet déployé

2. **Onglet "Settings"** → **"Domains"**

3. **Ajoutez votre domaine:**
   - Tapez: `agri-ps.com`
   - Cliquez: "Add"

4. **Ajoutez aussi www:**
   - Tapez: `www.agri-ps.com`
   - Cliquez: "Add"

5. **Vercel affiche les DNS à configurer:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### B. Dans Hostinger Panel

1. **Ouvrez:** https://hpanel.hostinger.com

2. **Allez dans:** Domaines → agri-ps.com → **DNS / Serveurs de noms**

3. **Supprimez les anciens enregistrements A et CNAME** (s'ils existent)

4. **Ajoutez les nouveaux enregistrements:**

   **Enregistrement 1:**
   ```
   Type: A
   Nom: @ (ou laissez vide)
   Pointe vers: 76.76.21.21
   TTL: 14400 (ou défaut)
   ```

   **Enregistrement 2:**
   ```
   Type: CNAME
   Nom: www
   Pointe vers: cname.vercel-dns.com
   TTL: 14400 (ou défaut)
   ```

5. **Sauvegardez les changements**

⏳ **Propagation DNS: 5 minutes à 48 heures** (généralement 15-30 min)

---

## ✅ ÉTAPE 5: Vérification (2 min)

### Vérifier le déploiement Vercel

1. Dans Vercel, allez dans votre projet
2. Cliquez sur "Deployments"
3. Le dernier déploiement doit être "Ready"

### Vérifier le domaine

1. **Ouvrez:** https://agri-ps.com

2. **Si ça charge →** ✅ C'est bon!

3. **Si erreur 404/503:**
   - Attendez 15-30 minutes (propagation DNS)
   - Vérifiez les enregistrements DNS dans Hostinger
   - Vérifiez dans Vercel que le domaine est en statut "Valid"

---

## 🔧 CONFIGURATION POST-DÉPLOIEMENT

### A. Vérifier les variables d'environnement

Dans Vercel → Settings → Environment Variables:

✅ Toutes les variables doivent être présentes
✅ MONGODB_URI doit pointer vers MongoDB Atlas
✅ NEXT_PUBLIC_SITE_URL doit être `https://agri-ps.com`

### B. Tester les fonctionnalités

1. **Page d'accueil:** https://agri-ps.com
2. **Campagne:** https://agri-ps.com/campagne-engrais
3. **Produits:** https://agri-ps.com/produits
4. **Admin:** https://agri-ps.com/admin

### C. Activer la campagne

Une fois le site en ligne, exécutez localement:

```powershell
# Dans votre terminal local
cd C:\Users\jolub\Downloads\agri-point-ecommerce
npm run campaign:go-live
```

---

## 🔄 DÉPLOIEMENTS FUTURS (AUTOMATIQUES)

Vercel se connecte à GitHub. Chaque fois que vous faites:

```powershell
git push origin main
```

**Vercel redéploie automatiquement!** ✨

Vous pouvez voir les déploiements en temps réel dans le dashboard Vercel.

---

## 📊 MONITORING

### Dans Vercel Dashboard

1. **Analytics:** Visiteurs, pages vues, performance
2. **Logs:** Erreurs serveur, requêtes API
3. **Deployments:** Historique des déploiements

### Commandes locales

```powershell
# Voir les logs Vercel en direct
npm install -g vercel
vercel logs agri-point-ecommerce --follow

# Redéployer manuellement
vercel --prod
```

---

## 🆘 TROUBLESHOOTING

### Problème: "Project not found"
**Solution:** Vérifiez que le repository GitHub est accessible et que Vercel a les permissions

### Problème: "Build failed"
**Solution:** 
```powershell
# Testez le build localement
npm run build

# Si erreurs, corrigez et push
git add .
git commit -m "fix: Build errors"
git push origin main
```

### Problème: "502 Bad Gateway"
**Solution:** Vérifiez les variables d'environnement, surtout MONGODB_URI

### Problème: "Domain not working"
**Solution:**
1. Vérifiez les DNS dans Hostinger
2. Attendez 24-48h pour la propagation DNS
3. Utilisez https://dnschecker.org pour vérifier la propagation

### Problème: "MongoDB connection failed"
**Solution:**
1. Dans MongoDB Atlas → Network Access
2. Ajoutez l'IP: `0.0.0.0/0` (permet toutes les IPs)
3. Ou ajoutez les IPs de Vercel spécifiquement

---

## 📚 RESSOURCES

- **Documentation Vercel:** https://vercel.com/docs
- **Vercel CLI:** https://vercel.com/docs/cli
- **Dashboard:** https://vercel.com/dashboard
- **Status Vercel:** https://www.vercel-status.com

---

## ✅ CHECKLIST FINALE

Avant de considérer le déploiement terminé:

- [ ] ✅ Code pushé sur GitHub
- [ ] ✅ Compte Vercel créé
- [ ] ✅ Projet importé dans Vercel
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Premier déploiement réussi
- [ ] ✅ Domaine agri-ps.com ajouté dans Vercel
- [ ] ✅ DNS configurés dans Hostinger
- [ ] ✅ Site accessible sur https://agri-ps.com
- [ ] ✅ SSL actif (cadenas vert)
- [ ] ✅ Campagne activée
- [ ] ✅ Pages principales testées
- [ ] ✅ Admin accessible

---

## 🎉 FÉLICITATIONS!

Votre site e-commerce est maintenant en production sur Vercel avec votre domaine personnalisé!

**Prochaines étapes:**
1. Tester toutes les fonctionnalités
2. Envoyer les communications clients
3. Démarrer le monitoring
4. Analyser les performances

**Support:**
- Documentation dans: INDEX-DOCUMENTATION-COMPLET.md
- Discord Vercel: https://vercel.com/discord

---

**Document créé le:** 16 Février 2026
**Projet:** AGRI-POINT E-Commerce
**Domaine:** https://agri-ps.com
