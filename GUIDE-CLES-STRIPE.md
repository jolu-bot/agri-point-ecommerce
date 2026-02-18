# 🔑 Guide: Récupérer vos Clés API Stripe

## 📋 CE QUE VOUS DEVEZ RÉCUPÉRER

Vous avez besoin de **3 clés** pour configurer Stripe en production:

| Clé | Format | Obligatoire | Utilisation |
|-----|--------|-------------|-------------|
| **Clé Publique (Publishable)** | `pk_live_...` | ✅ Oui | Frontend (visible par clients) |
| **Clé Secrète (Secret)** | `sk_live_...` | ✅ Oui | Backend (confidentielle) |
| **Webhook Secret** | `whsec_...` | ⚠️ Recommandé | Vérifier paiements |

---

## 🚀 ÉTAPE 1: Se Connecter à Stripe

1. **Ouvrez votre navigateur** et allez sur:
   ```
   https://dashboard.stripe.com/login
   ```

2. **Connectez-vous** avec:
   - Votre email Stripe
   - Votre mot de passe Stripe

3. **Vérification 2FA** (si activée):
   - Entrez le code reçu par SMS/email
   - Ou utilisez votre application d'authentification

---

## 🔴 ÉTAPE 2: ACTIVER LE MODE LIVE (IMPORTANT!)

**⚠️ PAR DÉFAUT, STRIPE AFFICHE LE MODE TEST**

### Comment basculer en mode LIVE:

1. **En haut à droite** du dashboard, cherchez le toggle:
   ```
   [Test Mode] ◄── Cliquez ici pour basculer
   ```

2. **Cliquez sur le toggle** pour passer en **mode LIVE**:
   ```
   [Live Mode] ✓
   ```

3. **Vérifiez que vous êtes en LIVE**:
   - Le toggle doit afficher "Live Mode"
   - La couleur est généralement **ROUGE** ou **ORANGE**
   - En haut du dashboard, vous verrez: **"Viewing live data"**

**🚨 ATTENTION:** Si vous restez en mode Test, vous récupérerez les clés TEST (pk_test_... et sk_test_...) qui ne fonctionnent PAS pour les vrais paiements!

---

## 🔑 ÉTAPE 3: Récupérer la Clé Publique (Publishable Key)

### Méthode A: Via le Menu "Developers"

1. Dans le **menu de gauche**, cliquez sur:
   ```
   Developers (ou "Développeurs" en français)
   ```

2. Puis cliquez sur:
   ```
   API keys (ou "Clés API")
   ```

3. **Vérifiez le mode** en haut de la page:
   ```
   ✅ Viewing live keys
   ```
   Si vous voyez "Viewing test keys", retournez à l'ÉTAPE 2!

4. Dans la section **"Standard keys"**, trouvez:
   ```
   Publishable key
   pk_live_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Copiez la clé**:
   - Cliquez sur l'icône 📋 **"Copy"** à droite
   - Ou sélectionnez et faites Ctrl+C (Windows) / Cmd+C (Mac)

**✅ Vous avez votre première clé!**

---

## 🔐 ÉTAPE 4: Récupérer la Clé Secrète (Secret Key)

### Sur la même page "API keys":

1. Scrollez légèrement vers le bas

2. Trouvez la section **"Secret key"**:
   ```
   Secret key
   sk_live_XXXXXXXXXX... (cachée par défaut)
   ```

3. **Révélez la clé** (si masquée):
   - Cliquez sur **"Reveal live key"** ou l'icône 👁️
   - Stripe peut vous demander votre **mot de passe** pour sécurité

4. **Copiez la clé secrète**:
   - Cliquez sur l'icône 📋 **"Copy"**
   - **NE PARTAGEZ JAMAIS CETTE CLÉ PUBLIQUEMENT!**

**✅ Vous avez votre deuxième clé!**

---

## 🪝 ÉTAPE 5: Créer un Webhook Secret (Recommandé)

### Pourquoi un webhook?
Le webhook permet à Stripe de notifier votre site quand un paiement est réussi/échoué.

### Comment créer le webhook:

1. Dans le menu **"Developers"**, cliquez sur:
   ```
   Webhooks
   ```

2. Cliquez sur le bouton:
   ```
   + Add endpoint (ou "+ Ajouter un point de terminaison")
   ```

3. **Configurez l'endpoint**:

   **Endpoint URL:**
   ```
   https://agri-ps.com/api/webhooks/stripe
   ```

   **Events to send:** Sélectionnez ces événements:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.succeeded`
   - ✅ `charge.failed`

   Ou cochez **"Select all"** pour recevoir tous les événements.

4. Cliquez sur **"Add endpoint"**

5. **Récupérez le Signing Secret**:
   - Une fois l'endpoint créé, cliquez dessus
   - Trouvez la section **"Signing secret"**
   - Cliquez sur **"Reveal"** puis **"Copy"**
   ```
   whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**✅ Vous avez votre troisième clé!**

---

## 📝 RÉCAPITULATIF: Vos 3 Clés

Vous devriez maintenant avoir:

```
1️⃣ Clé Publique (Publishable):
pk_live_VOTRE_CLE_PUBLIQUE_ICI

2️⃣ Clé Secrète (Secret):
sk_live_VOTRE_CLE_SECRETE_ICI

3️⃣ Webhook Secret (optionnel mais recommandé):
whsec_VOTRE_WEBHOOK_SECRET_ICI
```

---

## 🔧 ÉTAPE 6: Configurer sur Vercel

### Méthode A: Via le Dashboard Vercel (Recommandé)

1. **Allez sur:** https://vercel.com/dashboard

2. **Sélectionnez votre projet:** `agri-point-ecommerce`

3. **Cliquez sur:** Settings → Environment Variables

4. **Ajoutez les 3 variables:**

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_51xxx...` |
   | `STRIPE_SECRET_KEY` | `sk_live_51xxx...` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_xxx...` |

5. **Redéployez:**
   - Allez dans **Deployments**
   - Cliquez sur **"Redeploy"** pour le dernier déploiement

### Méthode B: Via le Terminal (Alternative)

```bash
# Installer Vercel CLI (si pas déjà fait)
npm install -g vercel

# Se connecter
vercel login

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Collez: pk_live_51xxx...

vercel env add STRIPE_SECRET_KEY
# Collez: sk_live_51xxx...

vercel env add STRIPE_WEBHOOK_SECRET
# Collez: whsec_xxx...

# Redéployer
vercel --prod
```

---

## ✅ VÉRIFICATION FINALE

### 1. Vérifiez que les clés sont bien LIVE:
- ✅ Clé publique commence par `pk_live_` (pas `pk_test_`)
- ✅ Clé secrète commence par `sk_live_` (pas `sk_test_`)
- ✅ Webhook secret commence par `whsec_`

### 2. Testez un paiement:
1. Allez sur https://agri-ps.com/campagne-engrais
2. Remplissez le formulaire d'éligibilité
3. Ajoutez un produit au panier
4. Procédez au checkout
5. Utilisez une **vraie carte bancaire** (petits montants recommandés pour test)

### 3. Vérifiez dans Stripe Dashboard:
- Allez sur https://dashboard.stripe.com/payments
- **Assurez-vous d'être en mode LIVE**
- Vous devriez voir votre paiement test

---

## 🆘 PROBLÈMES COURANTS

### Problème 1: "No such customer"
**Cause:** Vous utilisez des clés TEST en production
**Solution:** Retournez à l'ÉTAPE 2 et basculez en mode LIVE

### Problème 2: "Invalid API key"
**Cause:** Clé mal copiée ou avec espaces
**Solution:** Re-copiez la clé en faisant attention aux espaces

### Problème 3: Webhook ne fonctionne pas
**Cause:** URL incorrecte ou événements non sélectionnés
**Solution:** Vérifiez l'URL: `https://agri-ps.com/api/webhooks/stripe`

### Problème 4: "Your account cannot currently make live charges"
**Cause:** Compte Stripe pas encore activé
**Solution:** 
1. Allez sur https://dashboard.stripe.com/settings/stripe_connect
2. Complétez les informations requises (numéro fiscal, coordonnées bancaires, etc.)
3. Activez votre compte

---

## 📞 BESOIN D'AIDE?

**Support Stripe:**
- Email: support@stripe.com
- Documentation: https://stripe.com/docs
- Chat: Disponible dans le dashboard (icône 💬 en bas à droite)

**Langues disponibles:**
- 🇫🇷 Français (support disponible)
- 🇬🇧 Anglais (support principal)

---

## ⚠️ SÉCURITÉ - RÈGLES D'OR

1. **NE JAMAIS** partager votre clé secrète (`sk_live_`)
2. **NE JAMAIS** commiter les clés dans Git
3. **TOUJOURS** stocker les clés dans les variables d'environnement
4. **VÉRIFIER** que vous êtes en mode LIVE avant de copier les clés
5. **TESTER** avec de petits montants avant le lancement officiel

---

**✨ Prêt? Une fois vos clés récupérées, envoyez-les-moi et je configurerai automatiquement Vercel!**
